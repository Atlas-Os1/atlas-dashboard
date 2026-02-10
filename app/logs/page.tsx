import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { LogStream } from '@/components/log-stream';
import { workerService } from '@/lib/worker-service';

async function WorkerSelector() {
  const workers = await workerService.getAllWorkersWithMetrics();
  
  if (workers.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No workers found
      </div>
    );
  }

  const firstWorker = workers[0]?.name || '';

  return (
    <div className="space-y-6">
      {/* Worker Selection Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <p className="text-sm text-slate-400 mb-2">Streaming logs from:</p>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">{firstWorker}</span>
        </div>
      </div>

      {/* Log Stream */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Logs
        </h2>
        <LogStream scriptName={firstWorker} />
      </div>

      {/* Available Workers */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Available Workers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-slate-900/50 p-3 rounded-lg hover:bg-slate-900/80 transition-colors cursor-pointer"
            >
              <p className="text-sm font-medium text-white truncate">{worker.name}</p>
              <p className="text-xs text-slate-400">{worker.environment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
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
              <h1 className="text-3xl font-bold text-white">Worker Logs</h1>
              <p className="text-slate-400">Real-time log streaming from Cloudflare Workers</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Suspense fallback={
          <div className="animate-pulse bg-slate-800/50 rounded-xl h-96" />
        }>
          <WorkerSelector />
        </Suspense>
      </div>
    </div>
  );
}
