'use client';

import { useEffect, useState } from 'react';
import { Server, AlertCircle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';

interface WorkerHealth {
  totalWorkers: number;
  healthy: number;
  warning: number;
  error: number;
  totalRequests24h: number;
  totalErrors24h: number;
  avgErrorRate: number;
  timestamp: string;
}

export function WorkerHealthCard() {
  const [health, setHealth] = useState<WorkerHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/workers/health');
        const data = await res.json();
        setHealth(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch worker health:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const healthPercentage = health.totalWorkers > 0
    ? (health.healthy / health.totalWorkers) * 100
    : 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Worker Health</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3 h-3" />
          {lastUpdate && (
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="text-3xl font-bold text-green-400">{health.healthy}</div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-1 mt-1">
            <CheckCircle2 className="w-4 h-4" />
            Healthy
          </div>
        </div>
        <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="text-3xl font-bold text-amber-400">{health.warning}</div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-1 mt-1">
            <AlertCircle className="w-4 h-4" />
            Warning
          </div>
        </div>
        <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="text-3xl font-bold text-red-400">{health.error}</div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-1 mt-1">
            <AlertCircle className="w-4 h-4" />
            Error
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Overall Health</span>
          <span className="text-sm font-semibold text-white">
            {healthPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              healthPercentage >= 80 ? 'bg-green-500' :
              healthPercentage >= 50 ? 'bg-amber-500' :
              'bg-red-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
          <span className="text-slate-400">Total Requests (24h)</span>
          <span className="font-semibold text-blue-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {health.totalRequests24h.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
          <span className="text-slate-400">Total Errors (24h)</span>
          <span className="font-semibold text-red-400">
            {health.totalErrors24h.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
          <span className="text-slate-400">Avg Error Rate</span>
          <span className={`font-semibold ${
            health.avgErrorRate > 5 ? 'text-red-400' :
            health.avgErrorRate > 1 ? 'text-amber-400' :
            'text-green-400'
          }`}>
            {health.avgErrorRate.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
