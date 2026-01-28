import { BaseMCPClient, MCPResponse } from './base-client';
import { WorkerLog, WorkerMetric, WorkerTrace } from './types';

export class WorkersObservabilityClient extends BaseMCPClient {
  /**
   * Get logs for a specific Worker
   */
  async getLogs(scriptName: string, limit: number = 100): Promise<MCPResponse<WorkerLog[]>> {
    const endpoint = `/accounts/${this.accountId}/workers/scripts/${scriptName}/tail`;
    
    try {
      // For now, return mock data (Cloudflare Tail API requires websocket)
      // In production, this would connect to the Workers Logpush or use Tail
      const mockLogs: WorkerLog[] = Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: ['info', 'warn', 'error', 'debug'][Math.floor(Math.random() * 4)] as any,
        message: `Log message ${i} from ${scriptName}`,
        scriptName,
      }));

      return {
        success: true,
        data: mockLogs,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get metrics for all Workers
   */
  async getMetrics(since?: string): Promise<MCPResponse<WorkerMetric[]>> {
    const endpoint = `/accounts/${this.accountId}/workers/scripts`;
    
    try {
      const scriptsResponse = await this.request<any[]>(endpoint, { method: 'GET' });
      
      if (!scriptsResponse.success || !scriptsResponse.data) {
        return {
          success: false,
          error: 'Failed to fetch workers list',
          timestamp: Date.now(),
        };
      }

      // Generate mock metrics for each worker
      const metrics: WorkerMetric[] = scriptsResponse.data.map(script => ({
        timestamp: new Date().toISOString(),
        requests: Math.floor(Math.random() * 10000),
        errors: Math.floor(Math.random() * 100),
        cpuTime: Math.random() * 50,
        duration: Math.random() * 200,
      }));

      return {
        success: true,
        data: metrics,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get traces for a specific Worker
   */
  async getTraces(scriptName: string, limit: number = 50): Promise<MCPResponse<WorkerTrace[]>> {
    // Mock traces data (real implementation would use Workers Trace Events)
    const mockTraces: WorkerTrace[] = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      traceId: `trace-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 30000).toISOString(),
      duration: Math.random() * 500,
      status: [200, 200, 200, 404, 500][Math.floor(Math.random() * 5)],
      scriptName,
    }));

    return {
      success: true,
      data: mockTraces,
      timestamp: Date.now(),
    };
  }
}
