import { Suspense } from 'react';
import { Database, HardDrive, Key, Package } from 'lucide-react';

async function DatabaseContent() {
  // Mock database data (in production, fetch from real APIs)
  const d1Data = {
    name: 'atlas-memory-index',
    id: '1abf2fbc-6073-4ab3-87a3-8adab74f427d',
    totalFiles: 1234,
    totalChunks: 45678,
    embeddings: 42890,
    lastUpdate: new Date(Date.now() - 120000),
    size: '124 MB',
  };

  const r2Data = {
    bucketName: 'clawdis-storage-prod',
    objects: 8432,
    size: '2.3 GB',
    recentUploads: 12,
    bandwidth: {
      egress: '45 MB/hour',
      ingress: '28 MB/hour',
    },
  };

  const kvData = {
    namespaces: [
      { name: 'atlas-cache', keys: 1523, size: '12 MB' },
      { name: 'session-store', keys: 456, size: '3.4 MB' },
    ],
    totalKeys: 1979,
    totalSize: '15.4 MB',
  };

  const queueData = {
    activeJobs: 8,
    pendingJobs: 23,
    completedToday: 1234,
    failedToday: 5,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Database Monitoring
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Monitor D1, R2, KV, and Queue metrics
        </p>
      </div>

      {/* D1 Database */}
      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[oklch(0.68_0.19_35)]/10">
            <Database className="w-6 h-6 text-[oklch(0.68_0.19_35)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              D1 Database
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {d1Data.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Total Files
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {d1Data.totalFiles.toLocaleString()}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Chunks
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {d1Data.totalChunks.toLocaleString()}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Embeddings
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {d1Data.embeddings.toLocaleString()}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Database Size
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {d1Data.size}
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Last update: {d1Data.lastUpdate.toLocaleString()}
        </div>
      </section>

      {/* R2 Storage */}
      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[oklch(0.65_0.24_250)]/10">
            <HardDrive className="w-6 h-6 text-[oklch(0.65_0.24_250)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              R2 Storage
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {r2Data.bucketName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Objects
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {r2Data.objects.toLocaleString()}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Total Size
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {r2Data.size}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Egress
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {r2Data.bandwidth.egress}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Ingress
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {r2Data.bandwidth.ingress}
            </p>
          </div>
        </div>
      </section>

      {/* KV Namespaces */}
      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[oklch(0.70_0.20_145)]/10">
            <Key className="w-6 h-6 text-[oklch(0.70_0.20_145)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              KV Namespaces
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {kvData.namespaces.length} namespaces
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {kvData.namespaces.map((ns) => (
            <div key={ns.name} className="glass rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                  {ns.name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {ns.keys} keys • {ns.size}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 glass rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Total Keys
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {kvData.totalKeys.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Total Size
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {kvData.totalSize}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Task Queues */}
      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[oklch(0.75_0.20_65)]/10">
            <Package className="w-6 h-6 text-[oklch(0.75_0.20_65)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              Task Queues
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Job processing status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Active Jobs
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {queueData.activeJobs}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Pending
            </p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {queueData.pendingJobs}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Completed Today
            </p>
            <p className="text-2xl font-bold text-[oklch(0.70_0.20_145)]">
              {queueData.completedToday.toLocaleString()}
            </p>
          </div>
          
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Failed Today
            </p>
            <p className="text-2xl font-bold text-[oklch(0.65_0.25_25)]">
              {queueData.failedToday}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-6 animate-pulse">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DatabasePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DatabaseContent />
    </Suspense>
  );
}
