/**
 * Cloudflare Workers Logs & Observability Client
 * 
 * Uses the Cloudflare Workers Observability API (GraphQL) to fetch
 * real invocation logs, errors, and metrics from deployed workers.
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'ff3c5e2beaea9f85fee3200bfe28da16';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

// ─── Types ───────────────────────────────────────────────────────────

export interface WorkerLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug' | 'log';
  message: string[];
  scriptName: string;
  outcome: string;
  eventType: string;
  rayId?: string;
  exceptions?: WorkerException[];
}

export interface WorkerException {
  name: string;
  message: string;
  timestamp: string;
}

export interface WorkerInvocation {
  scriptName: string;
  entrypoint: string;
  datetime: string;
  outcome: string;
  responseStatus: number;
  cpuTimeMs: number;
  wallTimeMs: number;
  logs: { level: string; message: string[] }[];
  exceptions: { name: string; message: string; timestamp: string }[];
}

export interface WorkerTelemetry {
  scriptName: string;
  invocations: number;
  errors: number;
  p50CpuMs: number;
  p99CpuMs: number;
  p50DurationMs: number;
  p99DurationMs: number;
}

export interface LogsQueryParams {
  scriptName?: string;
  level?: string;
  since?: string;  // ISO date string
  until?: string;  // ISO date string
  limit?: number;
  search?: string;
  outcome?: string;
}

// ─── REST API Methods ────────────────────────────────────────────────

const headers = (): HeadersInit => ({
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
});

/**
 * Create a tail session for a worker (WebSocket-based real-time logs).
 * Returns a WebSocket URL that can be connected to for live tailing.
 */
export async function createTailSession(scriptName: string): Promise<{ id: string; url: string; expires_at: string } | null> {
  try {
    const res = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${encodeURIComponent(scriptName)}/tails`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          filters: [{ sampling_rate: 1 }],
        }),
      }
    );

    if (!res.ok) {
      console.error(`Failed to create tail for ${scriptName}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.result;
  } catch (error) {
    console.error(`Error creating tail session for ${scriptName}:`, error);
    return null;
  }
}

/**
 * Delete a tail session
 */
export async function deleteTailSession(scriptName: string, tailId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${encodeURIComponent(scriptName)}/tails/${tailId}`,
      {
        method: 'DELETE',
        headers: headers(),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── GraphQL Observability Queries ───────────────────────────────────

/**
 * Fetch worker invocation events using the Workers Analytics GraphQL API.
 * This is the primary method for getting real worker logs.
 */
export async function getWorkerEvents(params: LogsQueryParams): Promise<WorkerLogEntry[]> {
  const {
    scriptName,
    level,
    since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    until = new Date().toISOString(),
    limit = 100,
  } = params;

  // Build filter for the GraphQL query
  const filters: Record<string, unknown> = {
    datetime_geq: since,
    datetime_leq: until,
  };

  if (scriptName) {
    filters.scriptName = scriptName;
  }

  if (params.outcome) {
    filters.outcome = params.outcome;
  }

  const query = `
    query GetWorkerEvents($accountTag: string!, $filter: AccountWorkersInvocationsAdaptiveFilter_InputObject!, $limit: Int!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          workersInvocationsAdaptive(
            filter: $filter
            limit: $limit
            orderBy: [datetime_DESC]
          ) {
            datetime
            scriptName
            entrypoint
            outcome
            responseStatus
            wallTimeMs
            logs {
              level
              message
            }
            exceptions {
              name
              message
              timestamp
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        query,
        variables: {
          accountTag: ACCOUNT_ID,
          filter: filters,
          limit,
        },
      }),
    });

    if (!res.ok) {
      console.error(`GraphQL request failed: ${res.status}`);
      return [];
    }

    const data = await res.json();

    if (data.errors?.length) {
      console.error('GraphQL errors:', data.errors);
      // Fall back to REST-based telemetry
      return await getWorkerLogsFromTelemetry(params);
    }

    const invocations = data?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [];

    // Transform invocations into log entries
    const logs: WorkerLogEntry[] = [];

    for (const inv of invocations) {
      // Add invocation-level entry
      const invLevel = inv.outcome === 'ok' ? 'info' : 'error';
      
      if (!level || level === 'all' || invLevel === level) {
        logs.push({
          timestamp: inv.datetime,
          level: invLevel as WorkerLogEntry['level'],
          message: [`${inv.outcome.toUpperCase()} ${inv.responseStatus || ''} - ${inv.wallTimeMs}ms`.trim()],
          scriptName: inv.scriptName,
          outcome: inv.outcome,
          eventType: 'invocation',
          exceptions: inv.exceptions?.map((e: { name: string; message: string; timestamp: string }) => ({
            name: e.name,
            message: e.message,
            timestamp: e.timestamp,
          })),
        });
      }

      // Add console log entries from the invocation
      if (inv.logs) {
        for (const log of inv.logs) {
          const logLevel = log.level?.toLowerCase() || 'info';
          if (!level || level === 'all' || logLevel === level) {
            logs.push({
              timestamp: inv.datetime,
              level: logLevel as WorkerLogEntry['level'],
              message: log.message || [],
              scriptName: inv.scriptName,
              outcome: inv.outcome,
              eventType: 'console',
            });
          }
        }
      }

      // Add exception entries
      if (inv.exceptions?.length) {
        for (const exc of inv.exceptions) {
          logs.push({
            timestamp: exc.timestamp || inv.datetime,
            level: 'error',
            message: [`${exc.name}: ${exc.message}`],
            scriptName: inv.scriptName,
            outcome: inv.outcome,
            eventType: 'exception',
          });
        }
      }
    }

    // Apply search filter client-side if provided
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      return logs.filter(l =>
        l.message.some(m => m.toLowerCase().includes(searchLower)) ||
        l.scriptName.toLowerCase().includes(searchLower)
      );
    }

    return logs.slice(0, limit);
  } catch (error) {
    console.error('Error fetching worker events:', error);
    return await getWorkerLogsFromTelemetry(params);
  }
}

/**
 * Fallback: Get worker telemetry data from the REST analytics API.
 * Used when the GraphQL observability API isn't accessible.
 */
async function getWorkerLogsFromTelemetry(params: LogsQueryParams): Promise<WorkerLogEntry[]> {
  const {
    scriptName,
    since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    until = new Date().toISOString(),
    limit = 50,
  } = params;

  // If we have a specific script, try the per-script analytics endpoint
  if (scriptName) {
    try {
      const res = await fetch(
        `${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/workers/scripts/${encodeURIComponent(scriptName)}/usage-model`,
        { headers: headers() }
      );
      // Even if this fails, we continue to return what we can
    } catch {
      // Ignore
    }
  }

  // Try Workers Analytics Engine for aggregated data
  try {
    const query = `
      query GetWorkerAnalytics($accountTag: string!, $filter: AccountWorkersInvocationsAdaptiveFilter_InputObject!) {
        viewer {
          accounts(filter: { accountTag: $accountTag }) {
            workersInvocationsAdaptive(
              filter: $filter
              limit: ${limit}
              orderBy: [datetime_DESC]
            ) {
              datetime
              scriptName
              outcome
              responseStatus
            }
          }
        }
      }
    `;

    const filters: Record<string, unknown> = {
      datetime_geq: since,
      datetime_leq: until,
    };
    if (scriptName) filters.scriptName = scriptName;

    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        query,
        variables: { accountTag: ACCOUNT_ID, filter: filters },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const invocations = data?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [];

      return invocations.map((inv: { datetime: string; scriptName: string; outcome: string; responseStatus: number }) => ({
        timestamp: inv.datetime,
        level: inv.outcome === 'ok' ? ('info' as const) : ('error' as const),
        message: [`${inv.outcome.toUpperCase()} ${inv.responseStatus || ''}`],
        scriptName: inv.scriptName,
        outcome: inv.outcome,
        eventType: 'invocation',
      }));
    }
  } catch (error) {
    console.error('Telemetry fallback failed:', error);
  }

  return [];
}

/**
 * Get aggregated worker telemetry (request counts, error rates, etc.)
 * for all workers over a time range.
 */
export async function getWorkersTelemetry(
  since?: string,
  until?: string,
): Promise<WorkerTelemetry[]> {
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const untilDate = until || new Date().toISOString();

  const query = `
    query GetWorkersTelemetry($accountTag: string!, $filter: AccountWorkersInvocationsAdaptiveGroupsFilter_InputObject!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          workersInvocationsAdaptiveGroups(
            filter: $filter
            limit: 100
            orderBy: [sum_requests_DESC]
          ) {
            dimensions {
              scriptName
            }
            sum {
              requests
              errors
            }
            quantiles {
              cpuTimeP50
              cpuTimeP99
              durationP50
              durationP99
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        query,
        variables: {
          accountTag: ACCOUNT_ID,
          filter: {
            datetime_geq: sinceDate,
            datetime_leq: untilDate,
          },
        },
      }),
    });

    if (!res.ok) {
      console.error(`Telemetry query failed: ${res.status}`);
      return [];
    }

    const data = await res.json();

    if (data.errors?.length) {
      console.error('Telemetry GraphQL errors:', data.errors);
      return [];
    }

    const groups = data?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptiveGroups || [];

    return groups.map((g: {
      dimensions: { scriptName: string };
      sum: { requests: number; errors: number };
      quantiles: { cpuTimeP50: number; cpuTimeP99: number; durationP50: number; durationP99: number };
    }) => ({
      scriptName: g.dimensions.scriptName,
      invocations: g.sum.requests,
      errors: g.sum.errors,
      p50CpuMs: g.quantiles.cpuTimeP50 || 0,
      p99CpuMs: g.quantiles.cpuTimeP99 || 0,
      p50DurationMs: g.quantiles.durationP50 || 0,
      p99DurationMs: g.quantiles.durationP99 || 0,
    }));
  } catch (error) {
    console.error('Error fetching workers telemetry:', error);
    return [];
  }
}
