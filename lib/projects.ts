import { Project } from '@/types';

export const KNOWN_PROJECTS: Project[] = [
  {
    id: 'kiamichi-biz-connect',
    name: 'Kiamichi Business Connect',
    domain: 'kiamichibizconnect.com',
    workerId: 'kiamichi-biz-connect-production', // Updated to match actual worker
    status: 'unknown',
  },
  {
    id: 'twisted',
    name: 'Twisted Custom Leather',
    domain: 'twistedcustomleather.com',
    workerId: 'twisted', // Updated to match actual worker
    status: 'unknown',
  },
  {
    id: 'atlas-dashboard',
    name: 'Atlas Dashboard',
    domain: 'atlas.srvcflo.com',
    workerId: 'atlas-dashboard',
    status: 'unknown',
  },
  {
    id: 'memory-embedder',
    name: 'Memory Embedder',
    domain: 'memory-embedder.srvcflo.workers.dev',
    workerId: 'memory-embedder',
    status: 'unknown',
  },
  {
    id: 'memory-search',
    name: 'Memory Search API',
    domain: 'memory-search.srvcflo.workers.dev',
    workerId: 'memory-search',
    status: 'unknown',
  },
];

export function getProjectById(id: string): Project | undefined {
  return KNOWN_PROJECTS.find(p => p.id === id);
}

export function getProjectByWorkerId(workerId: string): Project | undefined {
  return KNOWN_PROJECTS.find(p => p.workerId === workerId);
}

export function determineProjectStatus(
  errorRate: number,
  cpuTime: number
): 'healthy' | 'warning' | 'error' {
  if (errorRate > 5 || cpuTime > 100) {
    return 'error';
  } else if (errorRate > 1 || cpuTime > 50) {
    return 'warning';
  }
  return 'healthy';
}
