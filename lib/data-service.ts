import { cloudflare } from './cloudflare';
import { KNOWN_PROJECTS, determineProjectStatus, getProjectByWorkerId } from './projects';
import { Project, WorkerAnalytics, SystemHealth, ActivityEvent } from '@/types';

export async function fetchAllProjectsStatus(): Promise<Project[]> {
  const workers = await cloudflare.listWorkers();
  
  const projectsWithStatus = await Promise.all(
    KNOWN_PROJECTS.map(async (project) => {
      const worker = workers.find(w => w.name === project.workerId);
      
      if (!worker) {
        return { ...project, status: 'unknown' as const };
      }

      const analytics = await cloudflare.getWorkerAnalytics(worker.name);
      
      if (!analytics) {
        return { ...project, status: 'unknown' as const };
      }

      const errorRate = analytics.requests > 0 
        ? (analytics.errors / analytics.requests) * 100 
        : 0;
      
      const status = determineProjectStatus(errorRate, analytics.cpu_time);
      
      return {
        ...project,
        status,
        lastDeployment: worker.modified_on ? new Date(worker.modified_on) : undefined,
      };
    })
  );

  return projectsWithStatus;
}

export async function fetchWorkerAnalytics(): Promise<WorkerAnalytics[]> {
  const workers = await cloudflare.listWorkers();
  
  const analyticsPromises = workers.map(async (worker) => {
    const analytics = await cloudflare.getWorkerAnalytics(worker.name);
    
    if (!analytics) {
      return null;
    }

    const errorRate = analytics.requests > 0 
      ? (analytics.errors / analytics.requests) * 100 
      : 0;

    return {
      workerId: worker.id,
      workerName: worker.name,
      requests: analytics.requests,
      errors: analytics.errors,
      errorRate,
      cpuTime: analytics.cpu_time,
      timestamp: new Date(),
    };
  });

  const results = await Promise.all(analyticsPromises);
  return results.filter((r): r is WorkerAnalytics => r !== null);
}

export async function calculateSystemHealth(): Promise<SystemHealth> {
  const analytics = await fetchWorkerAnalytics();
  const projects = await fetchAllProjectsStatus();
  
  const totalRequests = analytics.reduce((sum, a) => sum + a.requests, 0);
  const totalErrors = analytics.reduce((sum, a) => sum + a.errors, 0);
  const avgCpuTime = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + a.cpuTime, 0) / analytics.length
    : 0;
  
  const errorProjects = projects.filter(p => p.status === 'error').length;
  const warningProjects = projects.filter(p => p.status === 'warning').length;
  
  let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  if (errorProjects > 0) {
    overall = 'critical';
  } else if (warningProjects > 1) {
    overall = 'warning';
  }
  
  return {
    overall,
    totalRequests,
    totalErrors,
    avgCpuTime,
    activeProjects: projects.filter(p => p.status !== 'unknown').length,
  };
}

export async function fetchRecentActivity(): Promise<ActivityEvent[]> {
  const projects = await fetchAllProjectsStatus();
  const workers = await cloudflare.listWorkers();
  
  const events: ActivityEvent[] = [];
  
  // Add deployment events
  workers.forEach(worker => {
    const project = getProjectByWorkerId(worker.name);
    if (project && worker.modified_on) {
      events.push({
        id: `deploy-${worker.id}`,
        type: 'deployment',
        project: project.name,
        message: `Deployed ${worker.name}`,
        timestamp: new Date(worker.modified_on),
      });
    }
  });
  
  // Add error events for projects with issues
  projects.forEach(project => {
    if (project.status === 'error') {
      events.push({
        id: `error-${project.id}`,
        type: 'error',
        project: project.name,
        message: `High error rate detected`,
        timestamp: new Date(),
      });
    } else if (project.status === 'warning') {
      events.push({
        id: `warning-${project.id}`,
        type: 'warning',
        project: project.name,
        message: `Performance degradation detected`,
        timestamp: new Date(),
      });
    }
  });
  
  // Sort by timestamp descending
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return events.slice(0, 20); // Return last 20 events
}
