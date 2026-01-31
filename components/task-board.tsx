'use client';

import { useState } from 'react';
import { TaskCard, Task, TaskStatus } from './task-card';
import { Filter } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Get unique projects for filter
  const projects = Array.from(new Set(tasks.map((t) => t.project).filter(Boolean)));

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterProject !== 'all' && task.project !== filterProject) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  // Group tasks by status
  const tasksByStatus = {
    completed: filteredTasks.filter((t) => t.status === 'completed'),
    current: filteredTasks.filter((t) => t.status === 'current'),
    future: filteredTasks.filter((t) => t.status === 'future'),
  };

  const columns = [
    {
      id: 'completed' as TaskStatus,
      title: 'Completed',
      color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-300',
      tasks: tasksByStatus.completed,
    },
    {
      id: 'current' as TaskStatus,
      title: 'Current',
      color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-300',
      tasks: tasksByStatus.current,
    },
    {
      id: 'future' as TaskStatus,
      title: 'Future',
      color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      textColor: 'text-gray-800 dark:text-gray-300',
      tasks: tasksByStatus.future,
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Task Board - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div
              className={`${column.color} border-2 rounded-t-lg px-4 py-3 flex items-center justify-between`}
            >
              <h2 className={`font-bold text-lg ${column.textColor}`}>{column.title}</h2>
              <span
                className={`${column.textColor} bg-white/50 dark:bg-black/30 px-2 py-1 rounded-full text-sm font-semibold`}
              >
                {column.tasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 border-2 border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg p-4 space-y-3 min-h-[400px]">
              {column.tasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
                  No {column.title.toLowerCase()} tasks
                </div>
              ) : (
                column.tasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
