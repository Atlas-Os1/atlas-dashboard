'use client';

import { CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';

export type TaskStatus = 'completed' | 'current' | 'future';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  project?: string;
  dueDate?: string;
  completedDate?: string;
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusIcons = {
    completed: CheckCircle2,
    current: Clock,
    future: AlertCircle,
  };

  const StatusIcon = statusIcons[task.status];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`w-5 h-5 ${
              task.status === 'completed'
                ? 'text-green-500'
                : task.status === 'current'
                ? 'text-blue-500'
                : 'text-gray-400'
            }`}
          />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {task.title}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
          )}
          {task.project && (
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
              {task.project}
            </span>
          )}
        </div>

        {task.dueDate && task.status !== 'completed' && (
          <span className="text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
        {task.completedDate && task.status === 'completed' && (
          <span className="text-xs text-green-600 dark:text-green-400">
            ✓ {new Date(task.completedDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
