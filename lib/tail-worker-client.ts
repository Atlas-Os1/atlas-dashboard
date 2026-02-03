/**
 * Tail Worker Client for real-time log streaming
 * 
 * Note: Cloudflare Tail Workers API uses WebSockets which require special handling.
 * This implementation provides a polling-based alternative that works in edge environments.
 */

export interface TailWorkerConfig {
  accountId: string;
  apiToken: string;
}

export interface LogEvent {
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  scriptName: string;
  metadata?: Record<string, any>;
  outcome?: 'ok' | 'exception' | 'canceled';
  logs?: any[];
}

export class TailWorkerClient {
  private config: TailWorkerConfig;
  private abortController: AbortController | null = null;

  constructor(config: TailWorkerConfig) {
    this.config = config;
  }

  /**
   * Stream logs from a worker using Server-Sent Events
   * This is a polling-based approach since WebSocket Tail Workers
   * require specific connection handling not available in all environments
   */
  async *streamLogs(scriptName: string): AsyncGenerator<LogEvent> {
    this.abortController = new AbortController();
    
    // Poll for recent logs every few seconds
    while (!this.abortController.signal.aborted) {
      try {
        const logs = await this.fetchRecentLogs(scriptName);
        for (const log of logs) {
          yield log;
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error streaming logs:', error);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Back off on error
      }
    }
  }

  /**
   * Fetch recent logs for a worker
   * Note: This uses a mock implementation as the real Cloudflare Logpush
   * requires additional setup (R2/S3 storage configuration)
   */
  private async fetchRecentLogs(scriptName: string): Promise<LogEvent[]> {
    // In a real implementation, this would:
    // 1. Connect to Cloudflare Logpush destination
    // 2. Or use Workers Trace Events (requires enterprise plan)
    // 3. Or connect via WebSocket Tail Workers API
    
    // For now, return mock logs to demonstrate the UI
    const now = new Date();
    return [
      {
        message: `Request handled successfully`,
        level: 'info',
        timestamp: now.toISOString(),
        scriptName,
        outcome: 'ok',
      },
    ];
  }

  close(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
