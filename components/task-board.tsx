'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Ban,
  X,
} from 'lucide-react';
import { TaskCard } from './task-card';
import type { Task, TaskStatus, TaskPriority } from '@/lib/db/schema';

const COLUMNS: { id: TaskStatus; title: string; icon: typeof AlertCircle; accent: string }[] = [
  {
    id: 'proposed',
    title: 'Proposed',
    icon: AlertCircle,
    accent: 'border-neutral-400/40 text-neutral-500',
  },
  {
    id: 'active',
    title: 'Active',
    icon: Clock,
    accent: 'border-[oklch(0.65_0.24_250)]/40 text-[oklch(0.65_0.24_250)]',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    accent: 'border-[oklch(0.72_0.19_149)]/40 text-[oklch(0.72_0.19_149)]',
  },
];

interface CreateTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  project: string;
  status: TaskStatus;
}

const defaultForm: CreateTaskForm = {
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  project: '',
  status: 'proposed',
};

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateTaskForm>({ ...defaultForm });
  const [creating, setCreating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Derived filter options
  const projects = Array.from(new Set(tasks.map((t) => t.project).filter(Boolean))) as string[];
  const assignees = Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean))) as string[];

  // Apply filters
  const filtered = tasks.filter((t) => {
    if (filterProject !== 'all' && t.project !== filterProject) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && t.assignee !== filterAssignee) return false;
    return true;
  });

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              updated_at: new Date().toISOString(),
              ...(newStatus === 'completed' ? { completed_date: new Date().toISOString() } : {}),
              ...(newStatus !== 'completed' && t.status === 'completed' ? { completed_date: null } : {}),
            }
          : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      // Revert on failure
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch {
      fetchTasks();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          assignee: form.assignee || undefined,
          project: form.project || undefined,
          status: form.status,
        }),
      });

      if (!res.ok) throw new Error('Failed to create');
      const task: Task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setForm({ ...defaultForm });
      setShowCreate(false);
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.68_0.19_35)]" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 glass rounded-xl p-4">
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg glass border-0 bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50 outline-none"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg glass border-0 bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50 outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg glass border-0 bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50 outline-none"
        >
          <option value="all">All Assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-neutral-400">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40 transition-colors text-neutral-500"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.68_0.19_35)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Board columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const ColIcon = col.icon;
          const colTasks = filtered.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col">
              <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border-b-2 glass ${col.accent}`}>
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4" />
                  <h2 className="font-semibold text-sm">{col.title}</h2>
                </div>
                <span className="text-xs font-medium bg-neutral-200/30 dark:bg-neutral-700/30 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="flex-1 glass rounded-b-xl p-3 space-y-3 min-h-[350px] border-t-0">
                <AnimatePresence mode="popLayout">
                  {colTasks.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-32 text-neutral-400 text-xs"
                    >
                      No {col.title.toLowerCase()} tasks
                    </motion.div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/20 dark:border-neutral-700/30">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  Create Task
                </h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional details..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50"
                    >
                      <option value="proposed">Proposed</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Assignee
                    </label>
                    <input
                      type="text"
                      value={form.assignee}
                      onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                      placeholder="DevFlo, Flo, Minte..."
                      className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Project
                    </label>
                    <input
                      type="text"
                      value={form.project}
                      onChange={(e) => setForm({ ...form, project: e.target.value })}
                      placeholder="Atlas Dashboard, Infra..."
                      className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-sm rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !form.title.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[oklch(0.68_0.19_35)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
