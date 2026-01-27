import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchWorkerAnalytics } from '@/lib/data-service';
import { WorkerAnalyticsChart } from '@/components/worker-analytics-chart';

async function AnalyticsContent() {
  const analytics = await fetchWorkerAnalytics();

  const totalRequests = analytics.reduce((sum, a) => sum + a.requests, 0);
  const totalErrors = analytics.reduce((sum, a) => sum + a.errors, 0);
  const avgErrorRate = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + a.errorRate, 0) / analytics.length
    : 0;
  const avgCpuTime = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + a.cpuTime, 0) / analytics.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Detailed Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalRequests.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Errors</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {totalErrors.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Error Rate</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {avgErrorRate.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg CPU Time</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {avgCpuTime.toFixed(2)}ms
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <WorkerAnalyticsChart analytics={analytics} />

        {/* Worker Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Worker Details
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Worker
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Requests
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Errors
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Error Rate
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    CPU Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.map(worker => (
                  <tr
                    key={worker.workerId}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {worker.workerName}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {worker.requests.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {worker.errors.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span
                        className={
                          worker.errorRate > 5
                            ? 'text-red-600 dark:text-red-400'
                            : worker.errorRate > 1
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-green-600 dark:text-green-400'
                        }
                      >
                        {worker.errorRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {worker.cpuTime.toFixed(2)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<div>Loading analytics...</div>}>
        <AnalyticsContent />
      </Suspense>
    </main>
  );
}
