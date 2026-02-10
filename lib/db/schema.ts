// lib/db/schema.ts

export type TaskStatus = 'proposed' | 'active' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskAction = 'created' | 'status_changed' | 'assigned' | 'commented';
export type SessionStatus = 'active' | 'completed' | 'error';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  project: string | null;
  tags: string | null;
  due_date: string | null;
  completed_date: string | null;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskActivity {
  id: number;
  task_id: string;
  action: TaskAction;
  actor: string;
  details: string | null;
  created_at: string;
}

export interface AgentSession {
  id: string;
  agent_id: string;
  label: string | null;
  kind: string | null;
  status: SessionStatus;
  last_message: string | null;
  started_at: string;
  updated_at: string;
}
