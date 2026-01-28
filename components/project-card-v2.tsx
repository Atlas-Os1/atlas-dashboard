'use client';

import { motion } from 'framer-motion';
import { Project } from '@/types';
import { 
  ExternalLink, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getHealthColor, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCardV2({ project, index = 0 }: ProjectCardProps) {
  const healthColor = getHealthColor(project.status);
  
  const getStatusIcon = () => {
    switch (project.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" style={{ color: healthColor }} />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" style={{ color: healthColor }} />;
      case 'error':
        return <XCircle className="w-5 h-5" style={{ color: healthColor }} />;
      default:
        return <Activity className="w-5 h-5 text-neutral-400" />;
    }
  };

  // Mock sparkline data (in production, this would come from real metrics)
  const sparklineData = Array.from({ length: 12 }, () => Math.random() * 100);
  const maxValue = Math.max(...sparklineData);
  const normalizedData = sparklineData.map(v => (v / maxValue) * 100);

  // Mock recent metrics
  const requestsPerMin = Math.floor(Math.random() * 2000) + 100;
  const errorRate = project.status === 'healthy' ? 0.1 : project.status === 'warning' ? 2.5 : 8.3;
  const trend = Math.random() > 0.5 ? 'up' : 'down';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative card-lift"
    >
      {/* Glassmorphic Card */}
      <div className="glass rounded-xl p-6 relative overflow-hidden">
        {/* Status Border Glow */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ 
            backgroundColor: healthColor,
            boxShadow: `0 0 20px ${healthColor}`,
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {getStatusIcon()}
              </motion.div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                {project.name}
              </h3>
            </div>
            
            <a
              href={`https://${project.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[oklch(0.65_0.24_250)] hover:text-[oklch(0.55_0.24_250)] transition-colors group/link"
            >
              <span className="truncate">{project.domain}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Status Pulse Indicator */}
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: healthColor }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Sparkline Chart */}
        <div className="mb-4 h-12 flex items-end gap-0.5">
          {normalizedData.map((value, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                backgroundColor: healthColor,
                opacity: 0.6,
                height: `${value}%`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              whileHover={{ opacity: 1 }}
            />
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Requests/min
            </p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                {formatNumber(requestsPerMin)}
              </p>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Error Rate
            </p>
            <p 
              className="text-lg font-bold"
              style={{ color: errorRate > 5 ? getHealthColor('error') : 'inherit' }}
            >
              {errorRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
          {project.lastDeployment ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Deployed {formatDistanceToNow(project.lastDeployment, { addSuffix: true })}
            </p>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No recent deployments
            </p>
          )}

          {/* Quick Actions (visible on hover) */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/project/${project.id}`}
              className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </Link>
            <Link
              href={`/logs?project=${project.id}`}
              className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="View Logs"
            >
              <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </Link>
            <button
              className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="Deploy"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement deploy action
                console.log('Deploy', project.name);
              }}
            >
              <Zap className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        {/* Gradient Overlay (hover effect) */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${healthColor}, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  );
}
