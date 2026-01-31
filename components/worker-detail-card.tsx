'use client';

import { useState } from 'react';
import {
  Activity,
  Zap,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

export interface WorkerDetails {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  requests24h: number;
  errors24h: number;
  errorRate: number;
  avgCpuTime: number;
  avgDuration: number;
  lastDeployment?: string;
  routes?: string[];
  environment?: 'production' | 'staging' | 'development';
}

interface WorkerDetailCardProps {
  worker: WorkerDetails;
}

export function WorkerDetailCard({ worker }: WorkerDetailCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    healthy: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
    },
  };

  const envColors = {
    production: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    staging: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    development: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  const colors = statusColors[worker.status];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 ${colors.border} overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`${colors.bg} px-4 py-3 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${colors.text}`} />
          <div>
            <h3 className={`font-bold ${colors.text}`}>{worker.name}</h3>
            {worker.environment && (
              <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${envColors[worker.environment]}`}>
                {worker.environment}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${colors.text} uppercase`}>{worker.status}</span>
          {expanded ? (
            <ChevronUp className={`w-5 h-5 ${colors.text}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${colors.text}`} />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Requests</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {(worker.requests24h / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Errors</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{worker.errors24h}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Error Rate</span>
          </div>
          <p
            className={`text-lg font-bold ${
              worker.errorRate > 5
                ? 'text-red-600 dark:text-red-400'
                : worker.errorRate > 1
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {worker.errorRate.toFixed(2)}%
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">CPU Time</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {worker.avgCpuTime.toFixed(2)}ms
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Routes */}
          {worker.routes && worker.routes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Routes:</h4>
              <div className="space-y-1">
                {worker.routes.map((route) => (
                  <div
                    key={route}
                    className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                  >
                    {route}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Deployment */}
          {worker.lastDeployment && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Last Deployment:
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(worker.lastDeployment).toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={`https://dash.cloudflare.com/ff3c5e2beaea9f85fee3200bfe28da16/workers/services/view/${worker.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View in Cloudflare
            </a>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              View Logs
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              View Metrics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
