'use client';

import { motion } from 'framer-motion';
import { ActivityEvent } from '@/types';
import { Rocket, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'deployment':
        return <Rocket className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'deployment':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Recent Activity
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.project}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {event.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
