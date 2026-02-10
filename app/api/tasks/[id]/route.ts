import { NextRequest, NextResponse } from 'next/server';
import { getTaskStore } from '../route';
import { TaskStatus, TaskPriority } from '@/lib/db/schema';

const VALID_STATUSES: TaskStatus[] = ['proposed', 'active', 'completed', 'blocked', 'cancelled'];
const VALID_PRIORITIES: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getTaskStore();
  const task = store.get(id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = getTaskStore();
    const task = store.get(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const now = new Date().toISOString();

    // Validate status if provided
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = {
      ...task,
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.assignee !== undefined && { assignee: body.assignee?.trim() || null }),
      ...(body.project !== undefined && { project: body.project?.trim() || null }),
      ...(body.tags !== undefined && {
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null,
      }),
      ...(body.due_date !== undefined && { due_date: body.due_date || null }),
      updated_at: now,
    };

    // Auto-set completed_date when status changes to completed
    if (body.status === 'completed' && task.status !== 'completed') {
      updated.completed_date = now;
    }
    // Clear completed_date if moving away from completed
    if (body.status && body.status !== 'completed' && task.status === 'completed') {
      updated.completed_date = null;
    }

    store.set(id, updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getTaskStore();

  if (!store.has(id)) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  store.delete(id);
  return NextResponse.json({ success: true, id });
}
