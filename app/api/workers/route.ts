import { NextResponse } from 'next/server';
import { cloudflare } from '@/lib/cloudflare';
import { getWorkersTelemetry } from '@/lib/cloudflare-logs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface WorkerWithMetrics {
  name: string;
  id: string;
  created_on: string;
  modified_on: string;
  deployment_id?: string;
  // Telemetry (from GraphQL analytics)
  requests: number;
  errors: number;
  errorRate: number;
  p50CpuMs: number;
  p99CpuMs: number;
  p50DurationMs: number;
  p99DurationMs: number;
  // Derived
  status: 'healthy' | 'warning' | 'error';
}

export async function GET() {
  try {
    // Fetch workers list and telemetry in parallel
    const [workers, telemetry] = await Promise.all([
      cloudflare.listWorkers(),
      getWorkersTelemetry(),
    ]);

    // Index telemetry by script name for O(1) lookups
    const telemetryMap = new Map(
      telemetry.map(t => [t.scriptName, t])
    );

    // Merge workers with their telemetry data
    const workersWithMetrics: WorkerWithMetrics[] = workers.map(w => {
      const t = telemetryMap.get(w.name);
      const requests = t?.invocations || 0;
      const errors = t?.errors || 0;
      const errorRate = requests > 0 ? (errors / requests) * 100 : 0;

      // Determine health status
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (errorRate > 5) status = 'error';
      else if (errorRate > 1) status = 'warning';

      return {
        name: w.name,
        id: w.id || w.name,
        created_on: w.created_on,
        modified_on: w.modified_on,
        deployment_id: w.deployment_id,
        requests,
        errors,
        errorRate: Math.round(errorRate * 100) / 100,
        p50CpuMs: t?.p50CpuMs || 0,
        p99CpuMs: t?.p99CpuMs || 0,
        p50DurationMs: t?.p50DurationMs || 0,
        p99DurationMs: t?.p99DurationMs || 0,
        status,
      };
    });

    // Sort: error first, then warning, then by requests descending
    workersWithMetrics.sort((a, b) => {
      const statusOrder = { error: 0, warning: 1, healthy: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.requests - a.requests;
    });

    return NextResponse.json({
      success: true,
      data: workersWithMetrics,
      count: workersWithMetrics.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workers',
        data: [],
      },
      { status: 500 }
    );
  }
}
