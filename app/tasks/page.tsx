import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ListTodo } from 'lucide-react';
import { TaskBoard } from '@/components/task-board';
import { Task } from '@/components/task-card';

// Mock data - In production, this would fetch from D1 or API
async function fetchTasks(): Promise<Task[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    // Completed Tasks
    {
      id: '1',
      title: 'Add MCP Integration',
      description: 'Integrate 14 Cloudflare MCP servers for comprehensive monitoring',
      status: 'completed',
      priority: 'high',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      completedDate: '2026-01-27',
      tags: ['MCP', 'Integration'],
    },
    {
      id: '2',
      title: 'Implement Voice Control',
      description: 'Add ElevenLabs voice control with 40+ commands',
      status: 'completed',
      priority: 'medium',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      completedDate: '2026-01-26',
      tags: ['Voice', 'ElevenLabs'],
    },
    {
      id: '3',
      title: 'Design Flo Avatar',
      description: 'Create multi-layer animated Flo avatar with health visualization',
      status: 'completed',
      priority: 'high',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      completedDate: '2026-01-25',
      tags: ['UI', 'Design'],
    },
    {
      id: '4',
      title: 'Setup Cloudflare Workers',
      description: 'Deploy atlas-dashboard to Cloudflare Workers',
      status: 'completed',
      priority: 'critical',
      assignee: 'Flo',
      project: 'Infrastructure',
      completedDate: '2026-01-24',
      tags: ['Deployment', 'Workers'],
    },

    // Current Tasks
    {
      id: '5',
      title: 'Add Task Tracking UI',
      description: 'Build three-column task board for completed/current/future tasks',
      status: 'current',
      priority: 'high',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      dueDate: '2026-01-31',
      tags: ['UI', 'Features'],
    },
    {
      id: '6',
      title: 'Enhanced Worker Monitoring',
      description: 'Deep Cloudflare integration with live metrics and tail logs',
      status: 'current',
      priority: 'high',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      dueDate: '2026-01-31',
      tags: ['Monitoring', 'Workers'],
    },
    {
      id: '7',
      title: 'Improve Logs Page',
      description: 'Add Cloudflare log viewer integration with filtering and search',
      status: 'current',
      priority: 'medium',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      dueDate: '2026-01-31',
      tags: ['Logs', 'Integration'],
    },

    // Future Tasks
    {
      id: '8',
      title: 'Real-time Log Streaming',
      description: 'Implement WebSocket-based real-time log streaming',
      status: 'future',
      priority: 'medium',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      tags: ['Logs', 'Real-time'],
    },
    {
      id: '9',
      title: 'Email/Slack Alerts',
      description: 'Send notifications for critical errors and deployments',
      status: 'future',
      priority: 'low',
      assignee: 'Flo',
      project: 'Atlas Dashboard',
      tags: ['Notifications', 'Alerts'],
    },
    {
      id: '10',
      title: 'Historical Data Viz',
      description: 'Add 30/60/90 day historical data visualization',
      status: 'future',
      priority: 'low',
      project: 'Atlas Dashboard',
      tags: ['Analytics', 'Charts'],
    },
    {
      id: '11',
      title: 'Mobile App',
      description: 'Build React Native mobile app for on-the-go monitoring',
      status: 'future',
      priority: 'low',
      assignee: 'Flo',
      project: 'Atlas Mobile',
      tags: ['Mobile', 'React Native'],
    },
    {
      id: '12',
      title: 'Custom Dashboards',
      description: 'Allow users to create and save custom dashboard layouts',
      status: 'future',
      priority: 'medium',
      project: 'Atlas Dashboard',
      tags: ['Customization', 'UI'],
    },
    {
      id: '13',
      title: 'Grafana Integration',
      description: 'Export metrics to Grafana for advanced visualization',
      status: 'future',
      priority: 'low',
      project: 'Integration',
      tags: ['Grafana', 'Metrics'],
    },
  ];
}

async function TasksContent() {
  const tasks = await fetchTasks();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <ListTodo className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Tracker</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Track project progress across all Atlas initiatives
        </p>
      </div>

      <TaskBoard tasks={tasks} />
    </div>
  );
}

export default function TasksPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <ListTodo className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
            </div>
          </div>
        }
      >
        <TasksContent />
      </Suspense>
    </main>
  );
}
