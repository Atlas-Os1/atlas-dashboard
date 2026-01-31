import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  worker: string;
  message: string;
  metadata?: Record<string, any>;
}

// Mock data - In production, fetch from Cloudflare Logpush or Tail Workers
async function fetchLogs(): Promise<LogEntry[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      timestamp: '2026-01-31T15:23:45.123Z',
      level: 'info',
      worker: 'atlas-dashboard',
      message: 'Request processed successfully',
      metadata: { path: '/analytics', duration: '45ms', status: 200 },
    },
    {
      timestamp: '2026-01-31T15:23:42.567Z',
      level: 'error',
      worker: 'atlas-api',
      message: 'Database query timeout',
      metadata: { query: 'SELECT * FROM metrics', duration: '5000ms', status: 500 },
    },
    {
      timestamp: '2026-01-31T15:23:38.891Z',
      level: 'warn',
      worker: 'devflo-moltworker',
      message: 'High memory usage detected',
      metadata: { memory: '128MB', threshold: '100MB' },
    },
    {
      timestamp: '2026-01-31T15:23:35.234Z',
      level: 'info',
      worker: 'gateway-proxy',
      message: 'Proxy request forwarded',
      metadata: { target: 'https://api.example.com', duration: '120ms' },
    },
    {
      timestamp: '2026-01-31T15:23:30.456Z',
      level: 'debug',
      worker: 'webhook-handler',
      message: 'Webhook payload validation',
      metadata: { source: 'github', event: 'push' },
    },
    {
      timestamp: '2026-01-31T15:23:25.789Z',
      level: 'error',
      worker: 'atlas-dashboard',
      message: 'Failed to fetch analytics data',
      metadata: { error: 'Network timeout', retry: true },
    },
    {
      timestamp: '2026-01-31T15:23:20.012Z',
      level: 'info',
      worker: 'atlas-dashboard',
      message: 'User session started',
      metadata: { userId: 'flo', ip: '192.168.1.1' },
    },
  ];
}

function LogLevelBadge({ level }: { level: LogEntry['level'] }) {
  const configs = {
    info: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: Info },
    warn: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: AlertCircle },
    error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: AlertCircle },
    debug: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', icon: CheckCircle },
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {level.toUpperCase()}
    </span>
  );
}

async function LogsContent() {
  const logs = await fetchLogs();

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
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unified Logs</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time logs from all Cloudflare Workers
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Worker Filter */}
          <select className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="all">All Workers</option>
            <option value="atlas-dashboard">atlas-dashboard</option>
            <option value="atlas-api">atlas-api</option>
            <option value="devflo-moltworker">devflo-moltworker</option>
          </select>

          {/* Level Filter */}
          <select className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>

          {/* Actions */}
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Cloudflare Dashboard Link */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Advanced Log Analysis
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              For real-time tail logs and advanced filtering, use the Cloudflare Dashboard
            </p>
          </div>
          <a
            href="https://dash.cloudflare.com/ff3c5e2beaea9f85fee3200bfe28da16/workers/logpush"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Cloudflare Logs
          </a>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Worker
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <LogLevelBadge level={log.level} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    {log.worker}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white mb-1">{log.message}</div>
                    {log.metadata && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          Show metadata
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Enhanced Logging Setup
        </h3>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>To enable real-time log streaming and advanced filtering:</p>
          <ol className="list-decimal list-inside space-y-1 pl-4">
            <li>Configure <strong>Logpush</strong> in Cloudflare Dashboard to send logs to R2 or D1</li>
            <li>Set up <strong>Tail Workers</strong> for real-time log streaming via WebSocket</li>
            <li>Add API token with <strong>Logs Read</strong> permission to environment variables</li>
            <li>Implement SSE endpoint in <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">lib/logs-stream.ts</code></li>
          </ol>
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Current view shows mock data for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading logs...</p>
            </div>
          </div>
        }
      >
        <LogsContent />
      </Suspense>
    </main>
  );
}
