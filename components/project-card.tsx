'use client';

import { motion } from 'framer-motion';
import { Project } from '@/types';
import { ExternalLink, Activity, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusIcon = () => {
    switch (project.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'healthy':
        return 'border-green-500';
      case 'warning':
        return 'border-amber-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 ${getStatusColor()} p-6 transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h3>
          </div>
          
          <a
            href={`https://${project.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
          >
            {project.domain}
            <ExternalLink className="w-3 h-3" />
          </a>

          {project.lastDeployment && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last deployed {formatDistanceToNow(project.lastDeployment, { addSuffix: true })}
            </p>
          )}
        </div>

        <Link
          href={`/project/${project.id}`}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Details</span>
        </Link>
      </div>
    </motion.div>
  );
}
