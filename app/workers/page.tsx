import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WorkerDetailCard, WorkerDetails } from '@/components/worker-detail-card';

// Mock data - In production, fetch from Cloudflare Workers API
async function fetchWorkers(): Promise<WorkerDetails[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  return [
    // Kiamichi Biz Connect Workers
    {
      id: 'kiamichi-biz-connect-main',
      name: 'kiamichi-biz-connect (main)',
      status: 'healthy',
      requests24h: 28540,
      errors24h: 8,
      errorRate: 0.03,
      avgCpuTime: 18.5,
      avgDuration: 62.3,
      lastDeployment: '2026-01-31T09:15:00Z',
      routes: ['https://kiamichi.biz/*', 'https://www.kiamichi.biz/*'],
      environment: 'production',
    },
    {
      id: 'kiamichi-biz-connect-analyzer',
      name: 'kiamichi-biz-connect (analyzer)',
      status: 'healthy',
      requests24h: 12890,
      errors24h: 3,
      errorRate: 0.02,
      avgCpuTime: 34.2,
      avgDuration: 105.8,
      lastDeployment: '2026-01-31T09:15:00Z',
      routes: ['https://analyzer.kiamichi.biz/*'],
      environment: 'production',
    },
    {
      id: 'kiamichi-biz-connect-facebook',
      name: 'kiamichi-biz-connect (facebook)',
      status: 'healthy',
      requests24h: 8420,
      errors24h: 12,
      errorRate: 0.14,
      avgCpuTime: 22.7,
      avgDuration: 78.4,
      lastDeployment: '2026-01-30T16:45:00Z',
      routes: ['https://fb.kiamichi.biz/*'],
      environment: 'production',
    },
    {
      id: 'kiamichi-biz-connect-business-agent',
      name: 'kiamichi-biz-connect (business-agent)',
      status: 'healthy',
      requests24h: 5240,
      errors24h: 2,
      errorRate: 0.04,
      avgCpuTime: 45.3,
      avgDuration: 145.2,
      lastDeployment: '2026-01-30T16:45:00Z',
      routes: ['https://agent.kiamichi.biz/*'],
      environment: 'production',
    },
    // Twisted
    {
      id: 'twisted',
      name: 'twisted',
      status: 'healthy',
      requests24h: 34120,
      errors24h: 15,
      errorRate: 0.04,
      avgCpuTime: 14.8,
      avgDuration: 52.1,
      lastDeployment: '2026-01-31T07:30:00Z',
      routes: ['https://twisted.minte.dev/*', 'https://api.twisted.dev/*'],
      environment: 'production',
    },
    // Srvcflo
    {
      id: 'srvcflo',
      name: 'srvcflo',
      status: 'healthy',
      requests24h: 19850,
      errors24h: 6,
      errorRate: 0.03,
      avgCpuTime: 11.2,
      avgDuration: 38.7,
      lastDeployment: '2026-01-30T22:00:00Z',
      routes: ['https://srvc.flo.dev/*', 'https://api.srvcflo.com/*'],
      environment: 'production',
    },
    // Atlas Dashboard
    {
      id: 'atlas-dashboard',
      name: 'atlas-dashboard',
      status: 'healthy',
      requests24h: 15240,
      errors24h: 3,
      errorRate: 0.02,
      avgCpuTime: 12.5,
      avgDuration: 45.3,
      lastDeployment: '2026-01-31T10:30:00Z',
      routes: ['https://dashboard.minte.dev/*', 'https://atlas.minte.dev/*'],
      environment: 'production',
    },
    {
      id: 'devflo-moltworker',
      name: 'devflo-moltworker',
      status: 'healthy',
      requests24h: 42150,
      errors24h: 12,
      errorRate: 0.03,
      avgCpuTime: 8.2,
      avgDuration: 32.1,
      lastDeployment: '2026-01-30T18:20:00Z',
      routes: ['https://molt.minte.dev/*'],
      environment: 'production',
    },
    {
      id: 'gateway-proxy',
      name: 'gateway-proxy',
      status: 'healthy',
      requests24h: 3450,
      errors24h: 1,
      errorRate: 0.03,
      avgCpuTime: 5.1,
      avgDuration: 18.2,
      lastDeployment: '2026-01-28T09:00:00Z',
      routes: ['https://gateway.minte.dev/*'],
      environment: 'production',
    },
  ];
}

async function WorkersContent() {
  const workers = await fetchWorkers();

  const stats = {
    total: workers.length,
    healthy: workers.filter((w) => w.status === 'healthy').length,
    warning: workers.filter((w) => w.status === 'warning').length,
    error: workers.filter((w) => w.status === 'error').length,
    totalRequests: workers.reduce((sum, w) => sum + w.requests24h, 0),
    totalErrors: workers.reduce((sum, w) => sum + w.errors24h, 0),
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Worker Monitoring</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time monitoring of all Cloudflare Workers
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <Server className="w-3 h-3" />
            Total Workers
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-green-300 dark:border-green-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Healthy
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.healthy}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-yellow-300 dark:border-yellow-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-yellow-500" />
            Warning
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.warning}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-red-300 dark:border-red-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            Error
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.error}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-blue-300 dark:border-blue-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">24h Requests</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(stats.totalRequests / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-red-300 dark:border-red-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">24h Errors</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalErrors}</p>
        </div>
      </div>

      {/* Worker Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Workers</h2>
        {workers.map((worker) => (
          <WorkerDetailCard key={worker.id} worker={worker} />
        ))}
      </div>

      {/* Cloudflare Dashboard Link */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          For advanced metrics and configuration, visit the{' '}
          <a
            href="https://dash.cloudflare.com/ff3c5e2beaea9f85fee3200bfe28da16/workers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Cloudflare Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}

export default function WorkersPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <Server className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading workers...</p>
            </div>
          </div>
        }
      >
        <WorkersContent />
      </Suspense>
    </main>
  );
}
