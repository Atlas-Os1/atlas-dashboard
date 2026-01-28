import { createMCPConfig, MCPResponse } from './base-client';
import { WorkersObservabilityClient } from './workers-observability';
import { AuditLogsClient } from './audit-logs';
import { WorkersBuildsClient } from './workers-builds';
import { AggregatedMetrics } from './types';

/**
 * MCP Aggregator - Combines data from all MCP servers
 */
export class MCPAggregator {
  private observability: WorkersObservabilityClient;
  private auditLogs: AuditLogsClient;
  private builds: WorkersBuildsClient;

  constructor() {
    const config = createMCPConfig();
    this.observability = new WorkersObservabilityClient(config);
    this.auditLogs = new AuditLogsClient(config);
    this.builds = new WorkersBuildsClient(config);
  }

  /**
   * Get aggregated metrics from all MCP servers
   */
  async getAggregatedMetrics(): Promise<AggregatedMetrics> {
    const [
      metricsResponse,
      auditSummary,
      buildStats,
    ] = await Promise.allSettled([
      this.observability.getMetrics(),
      this.auditLogs.getActivitySummary(),
      this.builds.getBuildStats(),
    ]);

    // Workers metrics
    const metrics = metricsResponse.status === 'fulfilled' && metricsResponse.value.success
      ? metricsResponse.value.data || []
      : [];
    
    const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    const avgCpuTime = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.cpuTime, 0) / metrics.length
      : 0;

    // Audit logs
    const auditData = auditSummary.status === 'fulfilled' && auditSummary.value.success
      ? auditSummary.value.data
      : null;

    // Build stats
    const buildData = buildStats.status === 'fulfilled' && buildStats.value.success
      ? buildStats.value.data
      : null;

    return {
      timestamp: Date.now(),
      
      workers: {
        totalRequests,
        totalErrors,
        avgCpuTime,
        activeWorkers: metrics.length,
      },
      
      database: {
        d1: {
          databases: 1, // TODO: Get from D1 API
          totalSize: 0,
          recentQueries: 0,
        },
        r2: {
          buckets: 1, // TODO: Get from R2 API
          totalObjects: 0,
          totalSize: 0,
        },
        kv: {
          namespaces: 0, // TODO: Get from KV API
          totalKeys: 0,
          totalSize: 0,
        },
      },
      
      security: {
        auditLogs: auditData?.total || 0,
        casbFindings: 0, // TODO: Get from CASB API
        criticalFindings: 0,
      },
      
      performance: {
        avgDNSTime: 0, // TODO: Get from DNS Analytics
        avgTTFB: avgCpuTime,
        globalUptime: buildData?.successRate || 100,
      },
    };
  }

  /**
   * Get detailed observability data
   */
  async getObservabilityData(scriptName?: string) {
    const [logs, metrics, traces] = await Promise.allSettled([
      scriptName 
        ? this.observability.getLogs(scriptName, 50)
        : Promise.resolve({ success: false, timestamp: Date.now() } as MCPResponse),
      this.observability.getMetrics(),
      scriptName
        ? this.observability.getTraces(scriptName, 20)
        : Promise.resolve({ success: false, timestamp: Date.now() } as MCPResponse),
    ]);

    return {
      logs: logs.status === 'fulfilled' && logs.value.success && logs.value.data ? logs.value.data : [],
      metrics: metrics.status === 'fulfilled' && metrics.value.success && metrics.value.data ? metrics.value.data : [],
      traces: traces.status === 'fulfilled' && traces.value.success && traces.value.data ? traces.value.data : [],
    };
  }

  /**
   * Get audit activity
   */
  async getAuditActivity(limit: number = 20) {
    const response = await this.auditLogs.getLogs(limit);
    return response.success ? response.data : [];
  }

  /**
   * Get build history
   */
  async getBuildHistory(limit: number = 20) {
    const response = await this.builds.getRecentBuilds(limit);
    return response.success ? response.data : [];
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.observability.clearCache();
    this.auditLogs.clearCache();
    this.builds.clearCache();
  }
}

// Singleton instance
let aggregatorInstance: MCPAggregator | null = null;

export function getMCPAggregator(): MCPAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new MCPAggregator();
  }
  return aggregatorInstance;
}
