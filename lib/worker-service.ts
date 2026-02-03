import { cloudflare, WorkerScript, WorkerAnalytics } from './cloudflare-client';

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
        const analytics = await cloudflare.getWorkerAnalytics(script.id);
        
        const status = this.determineStatus(
          analytics?.errorRate || 0,
          analytics?.cpuTime || 0
        );

        return {
          id: script.id,
          name: script.script,
          status,
          requests24h: analytics?.requests || 0,
          errors24h: analytics?.errors || 0,
          errorRate: analytics?.errorRate || 0,
          avgCpuTime: analytics?.cpuTime || 0,
          avgDuration: analytics?.duration || 0,
          lastDeployment: script.modified_on,
          routes: [], // TODO: Fetch from zones API when needed
          environment: this.determineEnvironment(script.script),
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

  private determineEnvironment(scriptName: string): 'production' | 'staging' | 'development' {
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
