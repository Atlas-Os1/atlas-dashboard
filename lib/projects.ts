import { Project } from '@/types';

export const KNOWN_PROJECTS: Project[] = [
  {
    id: 'kiamichi-biz-connect',
    name: 'Kiamichi Business Connect',
    domain: 'kiamichibizconnect.com',
    workerId: 'kiamichi-biz-connect',
    status: 'unknown',
  },
  {
    id: 'twisted-custom-leather',
    name: 'Twisted Custom Leather',
    domain: 'twistedcustomleather.com',
    workerId: 'twisted-custom-leather',
    status: 'unknown',
  },
  {
    id: 'srvcflo',
    name: 'SrvcFlo Platform',
    domain: 'srvcflo.com',
    workerId: 'srvcflo-platform',
    status: 'unknown',
  },
  {
    id: 'minte-dev',
    name: 'Minte Development',
    domain: 'minte.dev',
    workerId: 'minte-dev',
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
