export interface Project {
  id: string;
  name: string;
  domain: string;
  workerId?: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastDeployment?: Date;
}

export interface WorkerAnalytics {
  workerId: string;
  workerName: string;
  requests: number;
  errors: number;
  errorRate: number;
  cpuTime: number;
  timestamp: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  totalRequests: number;
  totalErrors: number;
  avgCpuTime: number;
  activeProjects: number;
}

export interface ActivityEvent {
  id: string;
  type: 'deployment' | 'error' | 'warning' | 'info';
  project: string;
  message: string;
  timestamp: Date;
}

export interface CloudflareWorker {
  id: string;
  name: string;
  script: string;
  created_on: string;
  modified_on: string;
  deployment_id?: string;
}

export interface AnalyticsData {
  since: string;
  until: string;
  requests: number;
  errors: number;
  subrequests: number;
  cpu_time: number;
}

export interface LogEntry {
  timestamp: number;
  level: string;
  message: string;
  workerName: string;
  outcome: string;
}
