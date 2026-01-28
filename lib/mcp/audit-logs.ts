import { BaseMCPClient, MCPResponse } from './base-client';
import { AuditLog } from './types';

export class AuditLogsClient extends BaseMCPClient {
  /**
   * Get audit logs for the account
   */
  async getLogs(
    limit: number = 100,
    since?: string
  ): Promise<MCPResponse<AuditLog[]>> {
    const endpoint = `/accounts/${this.accountId}/audit_logs`;
    
    const params = new URLSearchParams({
      per_page: limit.toString(),
      ...(since && { since }),
    });

    try {
      const response = await this.request<any[]>(
        `${endpoint}?${params}`,
        { method: 'GET' }
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: 'Failed to fetch audit logs',
          timestamp: Date.now(),
        };
      }

      const logs: AuditLog[] = response.data.map(log => ({
        id: log.id,
        timestamp: log.when,
        action: log.action.type,
        actor: {
          id: log.actor.id,
          email: log.actor.email,
          type: log.actor.type,
        },
        resource: {
          type: log.resource.type,
          id: log.resource.id,
        },
        metadata: log.metadata || {},
      }));

      return {
        success: true,
        data: logs,
        timestamp: Date.now(),
        cached: response.cached,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get recent activity summary
   */
  async getActivitySummary(): Promise<MCPResponse<{
    total: number;
    byAction: Record<string, number>;
    byActor: Record<string, number>;
    recentActions: AuditLog[];
  }>> {
    const logsResponse = await this.getLogs(100);
    
    if (!logsResponse.success || !logsResponse.data) {
      return {
        success: false,
        error: logsResponse.error,
        timestamp: Date.now(),
      };
    }

    const logs = logsResponse.data;
    const byAction: Record<string, number> = {};
    const byActor: Record<string, number> = {};

    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byActor[log.actor.email] = (byActor[log.actor.email] || 0) + 1;
    });

    return {
      success: true,
      data: {
        total: logs.length,
        byAction,
        byActor,
        recentActions: logs.slice(0, 10),
      },
      timestamp: Date.now(),
    };
  }
}
