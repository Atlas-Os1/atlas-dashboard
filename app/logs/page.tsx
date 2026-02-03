'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Search,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
  Bug,
  AlertTriangle,
  ChevronDown,
  Pause,
  Play,
  Loader2,
  XCircle,
} from 'lucide-react';
import type { WorkerLogEntry } from '@/lib/cloudflare-logs';

// ─── Constants ───────────────────────────────────────────────────────

const LOG_LEVELS = [
  { value: 'all', label: 'All Levels', icon: FileText },
  { value: 'error', label: 'Error', icon: XCircle },
  { value: 'warn', label: 'Warning', icon: AlertTriangle },
  { value: 'info', label: 'Info', icon: Info },
  { value: 'debug', label: 'Debug', icon: Bug },
] as const;

const TIME_RANGES = [
  { value: '15m', label: 'Last 15 min', ms: 15 * 60 * 1000 },
  { value: '1h', label: 'Last hour', ms: 60 * 60 * 1000 },
  { value: '6h', label: 'Last 6 hours', ms: 6 * 60 * 60 * 1000 },
  { value: '24h', label: 'Last 24 hours', ms: 24 * 60 * 60 * 1000 },
  { value: '7d', label: 'Last 7 days', ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string; icon: typeof Info }> = {
  error: {
    bg: 'bg-[oklch(0.65_0.25_25)]/10',
    text: 'text-[oklch(0.65_0.25_25)]',
    border: 'border-[oklch(0.65_0.25_25)]/30',
    icon: XCircle,
  },
  warn: {
    bg: 'bg-[oklch(0.75_0.20_65)]/10',
    text: 'text-[oklch(0.75_0.20_65)]',
    border: 'border-[oklch(0.75_0.20_65)]/30',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-[oklch(0.65_0.24_250)]/10',
    text: 'text-[oklch(0.65_0.24_250)]',
    border: 'border-[oklch(0.65_0.24_250)]/30',
    icon: Info,
  },
  debug: {
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-500',
    border: 'border-neutral-500/30',
    icon: Bug,
  },
  log: {
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-500',
    border: 'border-neutral-500/30',
    icon: CheckCircle,
  },
};

const REFRESH_INTERVAL = 15_000; // 15 seconds

// ─── Component ───────────────────────────────────────────────────────

export default function LogsPage() {
  const [logs, setLogs] = useState<WorkerLogEntry[]>([]);
  const [workers, setWorkers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('6h');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch available workers
  useEffect(() => {
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const names = data.data.map((w: { name: string }) => w.name).sort();
          setWorkers(names);
        }
      })
      .catch(() => {
        // Workers list not critical; ignore
      });
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const timeRange = TIME_RANGES.find(t => t.value === selectedTimeRange);
      const since = new Date(Date.now() - (timeRange?.ms || 6 * 60 * 60 * 1000)).toISOString();
      const until = new Date().toISOString();

      const params = new URLSearchParams({
        since,
        until,
        limit: '200',
      });

      if (selectedLevel !== 'all') params.set('level', selectedLevel);
      if (searchQuery) params.set('search', searchQuery);

      const workerName = selectedWorker === 'all' ? 'all' : selectedWorker;
      const res = await fetch(`/api/workers/${encodeURIComponent(workerName)}/logs?${params}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.data || []);
        setLastRefreshed(new Date());
      } else {
        setError(data.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [selectedWorker, selectedLevel, selectedTimeRange, searchQuery]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(fetchLogs, REFRESH_INTERVAL);
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefresh, fetchLogs]);

  // Stats
  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;
  const uniqueWorkers = [...new Set(logs.map(l => l.scriptName))];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-[oklch(0.68_0.19_35)] transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.65_0.24_250)]/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[oklch(0.65_0.24_250)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Worker Logs
                </h1>
                <p className="text-sm text-neutral-500">
                  Real-time logs from Cloudflare Workers via Observability API
                </p>
              </div>
            </div>
          </div>

          {/* Refresh info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {lastRefreshed && (
              <span className="text-xs text-neutral-400">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`glass rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-2 transition-all ${
                autoRefresh
                  ? 'text-[oklch(0.70_0.20_145)] border-[oklch(0.70_0.20_145)]/30'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {autoRefresh ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Auto-refresh ON
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Auto-refresh
                </>
              )}
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="glass rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-[oklch(0.65_0.24_250)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-neutral-500 mb-1">Total Entries</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{logs.length}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-[oklch(0.65_0.25_25)]" /> Errors
            </p>
            <p className={`text-xl font-bold ${errorCount > 0 ? 'text-[oklch(0.65_0.25_25)]' : 'text-neutral-900 dark:text-neutral-50'}`}>
              {errorCount}
            </p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-[oklch(0.75_0.20_65)]" /> Warnings
            </p>
            <p className={`text-xl font-bold ${warnCount > 0 ? 'text-[oklch(0.75_0.20_65)]' : 'text-neutral-900 dark:text-neutral-50'}`}>
              {warnCount}
            </p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-neutral-500 mb-1">Workers</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{uniqueWorkers.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.24_250)]/40 border border-neutral-200/50 dark:border-neutral-700/50"
              />
            </div>

            {/* Worker Selector */}
            <div className="relative">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.24_250)]/40 border border-neutral-200/50 dark:border-neutral-700/50 cursor-pointer"
              >
                <option value="all">All Workers</option>
                {workers.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.24_250)]/40 border border-neutral-200/50 dark:border-neutral-700/50 cursor-pointer"
              >
                {LOG_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Time Range */}
            <div className="relative">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.24_250)]/40 border border-neutral-200/50 dark:border-neutral-700/50 cursor-pointer"
              >
                {TIME_RANGES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 border-l-4 border-[oklch(0.65_0.25_25)]"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[oklch(0.65_0.25_25)] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[oklch(0.65_0.25_25)]">
                  Error fetching logs
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && logs.length === 0 && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[oklch(0.65_0.24_250)] animate-spin mb-3" />
            <p className="text-sm text-neutral-500">Fetching worker logs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 text-sm mb-1">No logs found</p>
            <p className="text-neutral-400 text-xs">
              Try adjusting your filters or time range. Make sure CLOUDFLARE_API_TOKEN is set.
            </p>
          </div>
        )}

        {/* Log Entries */}
        {logs.length > 0 && (
          <div className="glass rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[140px_70px_140px_1fr] gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200/50 dark:border-neutral-700/50 bg-neutral-100/50 dark:bg-neutral-800/50">
              <div>Timestamp</div>
              <div>Level</div>
              <div>Worker</div>
              <div>Message</div>
            </div>

            {/* Log Rows */}
            <div className="divide-y divide-neutral-200/30 dark:divide-neutral-700/30 max-h-[calc(100vh-480px)] overflow-y-auto">
              <AnimatePresence initial={false}>
                {logs.map((log, idx) => {
                  const style = LEVEL_STYLES[log.level] || LEVEL_STYLES.log;
                  const LevelIcon = style.icon;
                  const isExpanded = expandedLog === idx;
                  const isError = log.level === 'error';
                  const hasExceptions = log.exceptions && log.exceptions.length > 0;

                  return (
                    <motion.div
                      key={`${log.timestamp}-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className={`cursor-pointer transition-colors ${
                        isError
                          ? 'bg-[oklch(0.65_0.25_25)]/5 hover:bg-[oklch(0.65_0.25_25)]/10'
                          : 'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50'
                      }`}
                      onClick={() => setExpandedLog(isExpanded ? null : idx)}
                    >
                      <div className="grid grid-cols-[140px_70px_140px_1fr] gap-2 px-4 py-2.5 items-start">
                        {/* Timestamp */}
                        <span className="text-xs font-mono text-neutral-500 whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </span>

                        {/* Level Badge */}
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${style.text}`}>
                          <LevelIcon className="w-3 h-3" />
                          {log.level.toUpperCase()}
                        </span>

                        {/* Worker */}
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate font-medium">
                          {log.scriptName}
                        </span>

                        {/* Message */}
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${isError ? 'text-[oklch(0.65_0.25_25)] font-medium' : 'text-neutral-800 dark:text-neutral-200'}`}>
                            {log.message.join(' ')}
                          </p>
                          {hasExceptions && !isExpanded && (
                            <span className="text-xs text-[oklch(0.65_0.25_25)]/70 mt-0.5 inline-block">
                              {log.exceptions!.length} exception{log.exceptions!.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-3"
                        >
                          <div className="ml-[140px] pl-2 border-l-2 border-neutral-200 dark:border-neutral-700 space-y-2">
                            {/* Full message */}
                            <div>
                              <span className="text-xs text-neutral-400 block mb-1">Full Message</span>
                              <pre className="text-xs font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg p-3">
                                {log.message.join('\n')}
                              </pre>
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className="text-neutral-400">
                                Outcome: <span className={`font-medium ${log.outcome === 'ok' ? 'text-[oklch(0.70_0.20_145)]' : 'text-[oklch(0.65_0.25_25)]'}`}>{log.outcome}</span>
                              </span>
                              <span className="text-neutral-400">
                                Type: <span className="font-medium text-neutral-600 dark:text-neutral-300">{log.eventType}</span>
                              </span>
                              {log.rayId && (
                                <span className="text-neutral-400">
                                  Ray ID: <span className="font-mono text-neutral-600 dark:text-neutral-300">{log.rayId}</span>
                                </span>
                              )}
                            </div>

                            {/* Exceptions */}
                            {hasExceptions && (
                              <div>
                                <span className="text-xs text-[oklch(0.65_0.25_25)] font-medium block mb-1">
                                  Exceptions
                                </span>
                                {log.exceptions!.map((exc, i) => (
                                  <div key={i} className="bg-[oklch(0.65_0.25_25)]/5 rounded-lg p-3 mb-1">
                                    <p className="text-xs font-mono text-[oklch(0.65_0.25_25)] font-bold">{exc.name}</p>
                                    <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300 mt-1">{exc.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  } catch {
    return ts;
  }
}
