'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ChevronRight,
  ArrowRight,
  Trash2,
  Ban,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/lib/db/schema';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

const priorityConfig: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  critical: {
    bg: 'bg-[oklch(0.55_0.22_25)]/15',
    text: 'text-[oklch(0.55_0.22_25)]',
    dot: 'bg-[oklch(0.55_0.22_25)]',
  },
  high: {
    bg: 'bg-[oklch(0.65_0.18_45)]/15',
    text: 'text-[oklch(0.65_0.18_45)]',
    dot: 'bg-[oklch(0.65_0.18_45)]',
  },
  medium: {
    bg: 'bg-[oklch(0.75_0.15_85)]/15',
    text: 'text-[oklch(0.75_0.15_85)]',
    dot: 'bg-[oklch(0.75_0.15_85)]',
  },
  low: {
    bg: 'bg-[oklch(0.65_0.24_250)]/15',
    text: 'text-[oklch(0.65_0.24_250)]',
    dot: 'bg-[oklch(0.65_0.24_250)]',
  },
};

const statusConfig: Record<TaskStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  proposed: { icon: AlertCircle, color: 'text-neutral-400', label: 'Proposed' },
  active: { icon: Clock, color: 'text-[oklch(0.65_0.24_250)]', label: 'Active' },
  completed: { icon: CheckCircle2, color: 'text-[oklch(0.72_0.19_149)]', label: 'Done' },
  blocked: { icon: Ban, color: 'text-[oklch(0.55_0.22_25)]', label: 'Blocked' },
  cancelled: { icon: Ban, color: 'text-neutral-500', label: 'Cancelled' },
};

// Status transition map: what can this status move to?
const transitions: Record<TaskStatus, TaskStatus[]> = {
  proposed: ['active'],
  active: ['completed', 'blocked'],
  blocked: ['active', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const nextStatuses = transitions[task.status];
  const tags: string[] = task.tags ? JSON.parse(task.tags) : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-xl p-4 hover:shadow-lg transition-shadow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon className={`w-4 h-4 flex-shrink-0 ${status.color}`} />
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 truncate">
            {task.title}
          </h3>
        </div>
        <span className={`flex-shrink-0 ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2 pl-6">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 pl-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100/60 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/20 dark:border-neutral-700/30">
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
          )}
          {task.project && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[oklch(0.68_0.15_300)]/15 text-[oklch(0.68_0.15_300)]">
              {task.project}
            </span>
          )}
        </div>

        {/* Status transition buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {nextStatuses.map((next) => {
            const nextCfg = statusConfig[next];
            const NextIcon = next === 'completed' ? CheckCircle2 : ArrowRight;
            return (
              <button
                key={next}
                onClick={() => onStatusChange?.(task.id, next)}
                title={`Move to ${nextCfg.label}`}
                className={`p-1 rounded-md hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40 transition-colors ${nextCfg.color}`}
              >
                <NextIcon className="w-3.5 h-3.5" />
              </button>
            );
          })}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              title="Delete task"
              className="p-1 rounded-md hover:bg-red-100/40 dark:hover:bg-red-900/20 transition-colors text-neutral-400 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Completed / Due date */}
      {task.completed_date && task.status === 'completed' && (
        <div className="text-[10px] text-[oklch(0.72_0.19_149)] mt-2 pl-6">
          ✓ Completed {new Date(task.completed_date).toLocaleDateString()}
        </div>
      )}
      {task.due_date && task.status !== 'completed' && (
        <div className="text-[10px] text-neutral-400 mt-2 pl-6">
          Due {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}

export type { Task, TaskStatus, TaskPriority };
