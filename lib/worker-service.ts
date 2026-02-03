import { cloudflare } from './cloudflare';
import type { CloudflareWorker, AnalyticsData } from '@/types';

export interface WorkerWithMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  requests24h: number;
  errors24h: number;
  errorRate: number;
  avgCpuTime: number;
  avgDuration: number;
  lastDeployment: string;
  routes: string[];
  environment: 'production' | 'staging' | 'development';
}

export class WorkerService {
  async getAllWorkersWithMetrics(): Promise<WorkerWithMetrics[]> {
    const scripts = await cloudflare.listWorkers();
    
    const workersWithMetrics = await Promise.all(
      scripts.map(async (script) => {
        // CloudflareWorker.id is the script name
        const scriptName = script.id || 'unknown';
        const analytics = await cloudflare.getWorkerAnalytics(scriptName);
        
        // Calculate error rate from requests and errors
        const requests = analytics?.requests || 0;
        const errors = analytics?.errors || 0;
        const errorRate = requests > 0 ? (errors / requests) * 100 : 0;
        const cpuTime = analytics?.cpu_time || 0;
        
        const status = this.determineStatus(errorRate, cpuTime);

        return {
          id: script.id,
          name: scriptName,
          status,
          requests24h: requests,
          errors24h: errors,
          errorRate,
          avgCpuTime: cpuTime,
          avgDuration: 0, // Not available in current analytics
          lastDeployment: script.modified_on || new Date().toISOString(),
          routes: [], // TODO: Fetch from zones API when needed
          environment: this.determineEnvironment(scriptName),
        };
      })
    );

    return workersWithMetrics;
  }

  private determineStatus(
    errorRate: number,
    cpuTime: number
  ): 'healthy' | 'warning' | 'error' {
    if (errorRate > 5 || cpuTime > 100) return 'error';
    if (errorRate > 1 || cpuTime > 50) return 'warning';
    return 'healthy';
  }

  private determineEnvironment(scriptName: string | undefined): 'production' | 'staging' | 'development' {
    if (!scriptName) return 'production';
    const lowerName = scriptName.toLowerCase();
    if (lowerName.includes('-dev') || lowerName.includes('-development')) {
      return 'development';
    }
    if (lowerName.includes('-staging') || lowerName.includes('-stg')) {
      return 'staging';
    }
    return 'production';
  }
}

export const workerService = new WorkerService();
