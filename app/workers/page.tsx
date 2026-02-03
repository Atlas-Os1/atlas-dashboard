import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { workerService } from '@/lib/worker-service';

async function fetchWorkers() {
  // Real API call - no more mock data!
  return await workerService.getAllWorkersWithMetrics();
}

function WorkerCard({ worker }: { worker: any }) {
  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  const StatusIcon = worker.status === 'healthy' ? CheckCircle2 : AlertCircle;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">{worker.name}</h3>
            <p className="text-sm text-slate-400">{worker.environment}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${
            worker.status === 'healthy' ? 'text-green-400' :
            worker.status === 'warning' ? 'text-amber-400' :
            'text-red-400'
          }`} />
          <div className={`w-2 h-2 rounded-full ${statusColors[worker.status]} animate-pulse`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Requests (24h)</p>
          <p className="text-xl font-bold text-blue-400">
            {worker.requests24h.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Error Rate</p>
          <p className={`text-xl font-bold ${
            worker.errorRate > 5 ? 'text-red-400' :
            worker.errorRate > 1 ? 'text-amber-400' :
            'text-green-400'
          }`}>
            {worker.errorRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Avg CPU Time</p>
          <p className="text-xl font-bold text-purple-400">
            {worker.avgCpuTime.toFixed(2)}ms
          </p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Errors (24h)</p>
          <p className="text-xl font-bold text-red-400">
            {worker.errors24h.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Last deployed: {new Date(worker.lastDeployment).toLocaleString()}
      </div>
    </div>
  );
}

export default async function WorkersPage() {
  const workers = await fetchWorkers();
  
  const stats = {
    total: workers.length,
    healthy: workers.filter((w) => w.status === 'healthy').length,
    warning: workers.filter((w) => w.status === 'warning').length,
    error: workers.filter((w) => w.status === 'error').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Workers Dashboard</h1>
              <p className="text-slate-400">Real-time monitoring of all Cloudflare Workers</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Workers</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Server className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Healthy</p>
                <p className="text-2xl font-bold text-green-400">{stats.healthy}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-400">Warning</p>
                <p className="text-2xl font-bold text-amber-400">{stats.warning}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Error</p>
                <p className="text-2xl font-bold text-red-400">{stats.error}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workers.map((worker) => (
            <Suspense key={worker.id} fallback={<div className="animate-pulse bg-slate-800/50 rounded-xl h-48" />}>
              <WorkerCard worker={worker} />
            </Suspense>
          ))}
        </div>

        {workers.length === 0 && (
          <div className="text-center py-12">
            <Server className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No workers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
