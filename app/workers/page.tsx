'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Server,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Globe,
  Cpu,
  Clock,
  Zap,
  Loader2,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import type { WorkerWithMetrics } from '@/app/api/workers/route';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/workers');
      const data = await res.json();

      if (data.success) {
        setWorkers(data.data || []);
        setLastRefreshed(new Date());
      } else {
        setError(data.error || 'Failed to fetch workers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Stats
  const stats = {
    total: workers.length,
    healthy: workers.filter(w => w.status === 'healthy').length,
    warning: workers.filter(w => w.status === 'warning').length,
    error: workers.filter(w => w.status === 'error').length,
    totalRequests: workers.reduce((sum, w) => sum + w.requests, 0),
    totalErrors: workers.reduce((sum, w) => sum + w.errors, 0),
  };

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
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.68_0.19_35)]/15 flex items-center justify-center">
                <Server className="w-5 h-5 text-[oklch(0.68_0.19_35)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Worker Health
                </h1>
                <p className="text-sm text-neutral-500">
                  Real-time monitoring from Cloudflare Workers API
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {lastRefreshed && (
              <span className="text-xs text-neutral-400">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchWorkers}
              disabled={loading}
              className="glass rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-[oklch(0.68_0.19_35)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a
              href="https://dash.cloudflare.com/ff3c5e2beaea9f85fee3200bfe28da16/workers"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-[oklch(0.65_0.24_250)] transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              CF Dashboard
            </a>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total Workers"
            value={stats.total}
            icon={<Server className="w-4 h-4 text-[oklch(0.65_0.24_250)]" />}
          />
          <StatCard
            label="Healthy"
            value={stats.healthy}
            icon={<CheckCircle2 className="w-4 h-4 text-[oklch(0.70_0.20_145)]" />}
            color="text-[oklch(0.70_0.20_145)]"
          />
          <StatCard
            label="Warning"
            value={stats.warning}
            icon={<AlertTriangle className="w-4 h-4 text-[oklch(0.75_0.20_65)]" />}
            color={stats.warning > 0 ? 'text-[oklch(0.75_0.20_65)]' : undefined}
          />
          <StatCard
            label="Error"
            value={stats.error}
            icon={<AlertCircle className="w-4 h-4 text-[oklch(0.65_0.25_25)]" />}
            color={stats.error > 0 ? 'text-[oklch(0.65_0.25_25)]' : undefined}
          />
          <StatCard
            label="24h Requests"
            value={formatNumber(stats.totalRequests)}
            icon={<TrendingUp className="w-4 h-4 text-[oklch(0.65_0.24_250)]" />}
          />
          <StatCard
            label="24h Errors"
            value={stats.totalErrors}
            icon={<AlertCircle className="w-4 h-4 text-[oklch(0.65_0.25_25)]" />}
            color={stats.totalErrors > 0 ? 'text-[oklch(0.65_0.25_25)]' : undefined}
          />
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
                <p className="text-sm font-medium text-[oklch(0.65_0.25_25)]">Error loading workers</p>
                <p className="text-xs text-neutral-500 mt-0.5">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && workers.length === 0 && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[oklch(0.68_0.19_35)] animate-spin mb-3" />
            <p className="text-sm text-neutral-500">Loading worker data from Cloudflare...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && workers.length === 0 && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <Server className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 text-sm mb-1">No workers found</p>
            <p className="text-neutral-400 text-xs">
              Make sure CLOUDFLARE_API_TOKEN is set with Workers read permission.
            </p>
          </div>
        )}

        {/* Worker Cards */}
        {workers.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {workers.map((worker, idx) => (
                <WorkerCard key={worker.name} worker={worker} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className={`text-xl font-bold ${color || 'text-neutral-900 dark:text-neutral-50'}`}>
        {value}
      </p>
    </div>
  );
}

function WorkerCard({ worker, index }: { worker: WorkerWithMetrics; index: number }) {
  const statusConfig = {
    healthy: {
      bg: 'bg-[oklch(0.70_0.20_145)]/10',
      text: 'text-[oklch(0.70_0.20_145)]',
      border: 'border-[oklch(0.70_0.20_145)]/30',
      icon: CheckCircle2,
      label: 'Healthy',
    },
    warning: {
      bg: 'bg-[oklch(0.75_0.20_65)]/10',
      text: 'text-[oklch(0.75_0.20_65)]',
      border: 'border-[oklch(0.75_0.20_65)]/30',
      icon: AlertTriangle,
      label: 'Warning',
    },
    error: {
      bg: 'bg-[oklch(0.65_0.25_25)]/10',
      text: 'text-[oklch(0.65_0.25_25)]',
      border: 'border-[oklch(0.65_0.25_25)]/30',
      icon: AlertCircle,
      label: 'Error',
    },
  };

  const s = statusConfig[worker.status];
  const StatusIcon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`glass rounded-xl p-4 border-l-4 ${s.border} hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Worker info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 truncate">
              {worker.name}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
              <StatusIcon className="w-3 h-3" />
              {s.label}
            </span>
            {worker.errorRate > 5 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.65_0.25_25)]/15 text-[oklch(0.65_0.25_25)] animate-pulse">
                ⚠ High Error Rate
              </span>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-2 text-sm">
            <MetricItem
              icon={<Globe className="w-3.5 h-3.5 text-[oklch(0.65_0.24_250)]" />}
              label="Requests"
              value={formatNumber(worker.requests)}
            />
            <MetricItem
              icon={<AlertCircle className="w-3.5 h-3.5 text-[oklch(0.65_0.25_25)]" />}
              label="Errors"
              value={String(worker.errors)}
              alert={worker.errors > 0}
            />
            <MetricItem
              icon={<Zap className="w-3.5 h-3.5 text-[oklch(0.75_0.20_65)]" />}
              label="Error Rate"
              value={`${worker.errorRate}%`}
              alert={worker.errorRate > 1}
            />
            <MetricItem
              icon={<Cpu className="w-3.5 h-3.5 text-[oklch(0.68_0.19_35)]" />}
              label="CPU (p50/p99)"
              value={`${worker.p50CpuMs.toFixed(1)} / ${worker.p99CpuMs.toFixed(1)}ms`}
            />
            <MetricItem
              icon={<Clock className="w-3.5 h-3.5 text-neutral-500" />}
              label="Duration (p50/p99)"
              value={`${worker.p50DurationMs.toFixed(0)} / ${worker.p99DurationMs.toFixed(0)}ms`}
            />
            <MetricItem
              icon={<Clock className="w-3.5 h-3.5 text-neutral-400" />}
              label="Last Deploy"
              value={formatDate(worker.modified_on)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link
            href={`/logs?worker=${encodeURIComponent(worker.name)}`}
            className="glass rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-[oklch(0.65_0.24_250)] transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3 h-3" />
            Logs
          </Link>
          <a
            href={`https://dash.cloudflare.com/ff3c5e2beaea9f85fee3200bfe28da16/workers/services/view/${encodeURIComponent(worker.name)}/production`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-[oklch(0.68_0.19_35)] transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3 h-3" />
            Routes
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function MetricItem({
  icon,
  label,
  value,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div>
        <p className="text-[10px] text-neutral-400 leading-tight">{label}</p>
        <p className={`text-xs font-medium ${alert ? 'text-[oklch(0.65_0.25_25)]' : 'text-neutral-700 dark:text-neutral-300'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return `${Math.round(diffMs / 60000)}m ago`;
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
    if (diffHours < 48) return 'yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
