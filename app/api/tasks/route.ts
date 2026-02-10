import { NextRequest, NextResponse } from 'next/server';
import { Task, TaskStatus, TaskPriority } from '@/lib/db/schema';

// In-memory store - will be replaced with D1 at deploy time
const taskStore: Map<string, Task> = new Map();

// Seed some initial tasks so the board isn't empty on first load
function seedIfEmpty() {
  if (taskStore.size > 0) return;
  const seeds: Omit<Task, 'created_at' | 'updated_at'>[] = [
    {
      id: 'seed-1',
      title: 'Set up D1 database bindings',
      description: 'Create D1 database and apply migrations for task persistence',
      status: 'proposed',
      priority: 'high',
      assignee: 'DevFlo',
      project: 'Atlas Dashboard',
      tags: '["infra","D1"]',
      due_date: null,
      completed_date: null,
      parent_task_id: null,
    },
    {
      id: 'seed-2',
      title: 'Integrate Cloudflare Analytics API',
      description: 'Replace mock analytics data with real Cloudflare worker metrics',
      status: 'active',
      priority: 'high',
      assignee: 'DevFlo',
      project: 'Atlas Dashboard',
      tags: '["analytics","cloudflare"]',
      due_date: null,
      completed_date: null,
      parent_task_id: null,
    },
    {
      id: 'seed-3',
      title: 'Deploy central command v2',
      description: 'Build and deploy the consolidated dashboard to Cloudflare Workers',
      status: 'proposed',
      priority: 'critical',
      assignee: 'Flo',
      project: 'Infrastructure',
      tags: '["deploy","workers"]',
      due_date: null,
      completed_date: null,
      parent_task_id: null,
    },
    {
      id: 'seed-4',
      title: 'Navigation v2 with glassmorphic design',
      description: 'Redesigned nav with OKLCH colors and glass effects',
      status: 'completed',
      priority: 'medium',
      assignee: 'DevFlo',
      project: 'Atlas Dashboard',
      tags: '["UI","design"]',
      due_date: null,
      completed_date: '2026-02-02T00:00:00.000Z',
      parent_task_id: null,
    },
  ];
  const now = new Date().toISOString();
  for (const s of seeds) {
    taskStore.set(s.id, { ...s, created_at: now, updated_at: now });
  }
}

export function getTaskStore() {
  seedIfEmpty();
  return taskStore;
}

export async function GET(request: NextRequest) {
  try {
    seedIfEmpty();
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as TaskStatus | null;
    const project = url.searchParams.get('project');
    const assignee = url.searchParams.get('assignee');
    const priority = url.searchParams.get('priority') as TaskPriority | null;

    let tasks = Array.from(taskStore.values());

    if (status) tasks = tasks.filter((t) => t.status === status);
    if (project) tasks = tasks.filter((t) => t.project === project);
    if (assignee) tasks = tasks.filter((t) => t.assignee === assignee);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);

    // Sort: most recently updated first
    tasks.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    seedIfEmpty();
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      description: body.description?.trim() || null,
      status: body.status || 'proposed',
      priority: body.priority || 'medium',
      assignee: body.assignee?.trim() || null,
      project: body.project?.trim() || null,
      tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
      due_date: body.due_date || null,
      completed_date: null,
      parent_task_id: body.parent_task_id || null,
      created_at: now,
      updated_at: now,
    };

    taskStore.set(task.id, task);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
