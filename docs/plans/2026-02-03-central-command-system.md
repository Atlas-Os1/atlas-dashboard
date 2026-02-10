# Atlas Central Command System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Atlas Dashboard from a monitoring prototype with mock data into a fully operational central command system for managing agents, tasks, Cloudflare infrastructure, and real-time communication.

**Architecture:** Next.js 15 app with API routes that proxy to (1) Moltbot/Clawdbot gateway WebSocket for agent chat & session monitoring, (2) Cloudflare API for real worker metrics/logs/tail, and (3) D1 database for persistent task tracking. Frontend uses React with real-time updates via SSE/WebSocket.

**Tech Stack:** Next.js 16, TypeScript 5.9, Tailwind CSS v4, Framer Motion, Cloudflare Workers (deployment), D1 (task storage), Moltbot Gateway API (agent comms), Cloudflare Analytics API

---

## Phase 1: Foundation & Infrastructure

### Task 1.1: Add Wrangler Configuration

**Files:**
- Create: `wrangler.jsonc`

**Step 1: Create wrangler config**

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "atlas-dashboard",
  "main": ".open-next/worker.js",
  "compatibility_date": "2026-01-28",
  "account_id": "ff3c5e2beaea9f85fee3200bfe28da16",
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "vars": {
    "NEXT_PUBLIC_GATEWAY_URL": "wss://gateway.minte.dev"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "atlas-command-center",
      "database_id": "TBD_AFTER_CREATION"
    }
  ],
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "clawdis-storage-prod"
    }
  ]
}
```

**Step 2: Create D1 database**

```bash
npx wrangler d1 create atlas-command-center
# Copy the database_id to wrangler.jsonc
```

**Step 3: Commit**

```bash
git add wrangler.jsonc
git commit -m "infra: add wrangler configuration with D1 and R2 bindings"
```

---

### Task 1.2: D1 Schema for Tasks & Sessions

**Files:**
- Create: `migrations/0001_initial_schema.sql`
- Create: `lib/db/schema.ts`

**Step 1: Write migration**

```sql
-- migrations/0001_initial_schema.sql

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('proposed', 'active', 'completed', 'blocked', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
  assignee TEXT, -- 'devflo', 'flo', 'minte', etc.
  project TEXT,
  tags TEXT, -- JSON array as string
  due_date TEXT,
  completed_date TEXT,
  parent_task_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
);

-- Task activity log
CREATE TABLE IF NOT EXISTS task_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'status_changed', 'assigned', 'commented'
  actor TEXT NOT NULL, -- who did it
  details TEXT, -- JSON details
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Agent sessions log (cached from gateway)
CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  label TEXT,
  kind TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project ON tasks(project);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_task_activity_task ON task_activity(task_id);
CREATE INDEX idx_agent_sessions_agent ON agent_sessions(agent_id);
```

**Step 2: Write TypeScript types**

```typescript
// lib/db/schema.ts
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'proposed' | 'active' | 'completed' | 'blocked' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string | null;
  project: string | null;
  tags: string | null; // JSON array
  due_date: string | null;
  completed_date: string | null;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskActivity {
  id: number;
  task_id: string;
  action: 'created' | 'status_changed' | 'assigned' | 'commented';
  actor: string;
  details: string | null;
  created_at: string;
}

export interface AgentSession {
  id: string;
  agent_id: string;
  label: string | null;
  kind: string | null;
  status: 'active' | 'completed' | 'error';
  last_message: string | null;
  started_at: string;
  updated_at: string;
}
```

**Step 3: Apply migration**

```bash
npx wrangler d1 execute atlas-command-center --file=migrations/0001_initial_schema.sql
```

**Step 4: Commit**

```bash
git add migrations/ lib/db/
git commit -m "feat: add D1 schema for tasks, activity log, and agent sessions"
```

---

### Task 1.3: Environment & Config Setup

**Files:**
- Create: `.env.local.example`
- Update: `lib/config.ts` (create)

**Step 1: Create config module**

```typescript
// lib/config.ts
export const config = {
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'ff3c5e2beaea9f85fee3200bfe28da16',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
  },
  gateway: {
    // Moltbot gateway WebSocket URL
    url: process.env.GATEWAY_URL || 'ws://localhost:18789',
    httpUrl: process.env.GATEWAY_HTTP_URL || 'http://localhost:18789',
    token: process.env.GATEWAY_TOKEN || '',
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
  },
} as const;

export function validateConfig() {
  const missing: string[] = [];
  if (!config.cloudflare.apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!config.gateway.token) missing.push('GATEWAY_TOKEN');
  return missing;
}
```

**Step 2: Create .env.local.example**

```bash
# .env.local.example
CLOUDFLARE_ACCOUNT_ID=ff3c5e2beaea9f85fee3200bfe28da16
CLOUDFLARE_API_TOKEN=your_api_token
GATEWAY_URL=ws://localhost:18789
GATEWAY_HTTP_URL=http://localhost:18789
GATEWAY_TOKEN=your_gateway_token
ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

**Step 3: Commit**

```bash
git add lib/config.ts .env.local.example
git commit -m "infra: add centralized config with validation"
```

---

## Phase 2: Agent Communication Hub

### Task 2.1: Gateway API Client

**Files:**
- Create: `lib/gateway/client.ts`
- Create: `lib/gateway/types.ts`

**Step 1: Define gateway types**

```typescript
// lib/gateway/types.ts
export interface GatewaySession {
  sessionKey: string;
  kind: string;
  channel: string;
  agentId: string;
  label?: string;
  lastActivity?: string;
  messages?: GatewayMessage[];
}

export interface GatewayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  toolCalls?: any[];
}

export interface GatewayStatus {
  version: string;
  uptime: number;
  agents: string[];
  sessions: number;
}

export interface SendMessageRequest {
  sessionKey?: string;
  agentId?: string;
  message: string;
}

export interface SendMessageResponse {
  sessionKey: string;
  response: string;
}
```

**Step 2: Implement gateway HTTP client**

```typescript
// lib/gateway/client.ts
import { config } from '../config';
import type {
  GatewaySession,
  GatewayStatus,
  SendMessageRequest,
  SendMessageResponse,
  GatewayMessage,
} from './types';

class GatewayClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = config.gateway.httpUrl;
    this.token = config.gateway.token;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gateway API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async getStatus(): Promise<GatewayStatus> {
    return this.fetch<GatewayStatus>('/api/status');
  }

  async listSessions(): Promise<GatewaySession[]> {
    return this.fetch<GatewaySession[]>('/api/sessions');
  }

  async getSessionHistory(sessionKey: string, limit = 50): Promise<GatewayMessage[]> {
    return this.fetch<GatewayMessage[]>(
      `/api/sessions/${encodeURIComponent(sessionKey)}/messages?limit=${limit}`
    );
  }

  async sendMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
    return this.fetch<SendMessageResponse>('/api/sessions/send', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}

export const gateway = new GatewayClient();
```

**Step 3: Commit**

```bash
git add lib/gateway/
git commit -m "feat: add gateway API client for agent communication"
```

---

### Task 2.2: Chat API Routes

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `app/api/chat/[sessionKey]/route.ts`
- Create: `app/api/sessions/route.ts`

**Step 1: Sessions API route**

```typescript
// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { gateway } from '@/lib/gateway/client';

export async function GET() {
  try {
    const sessions = await gateway.listSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
```

**Step 2: Chat send route**

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gateway } from '@/lib/gateway/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionKey, agentId, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const response = await gateway.sendMessage({ sessionKey, agentId, message });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

**Step 3: Session history route**

```typescript
// app/api/chat/[sessionKey]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gateway } from '@/lib/gateway/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionKey: string }> }
) {
  try {
    const { sessionKey } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const messages = await gateway.getSessionHistory(sessionKey, limit);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch session history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add app/api/chat/ app/api/sessions/
git commit -m "feat: add API routes for agent chat and session management"
```

---

### Task 2.3: Chat UI Component

**Files:**
- Create: `components/agent-chat.tsx`
- Create: `components/chat-message.tsx`
- Create: `app/chat/page.tsx`

**Step 1: Chat message component**

```typescript
// components/chat-message.tsx
'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  agentName?: string;
}

export function ChatMessage({ role, content, timestamp, agentName }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-[oklch(0.65_0.24_250)]/20 text-[oklch(0.65_0.24_250)]'
          : 'bg-[oklch(0.68_0.19_35)]/20 text-[oklch(0.68_0.19_35)]'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        {!isUser && agentName && (
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
            {agentName}
          </span>
        )}
        <div className={`glass rounded-2xl px-4 py-3 ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}>
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
            {content}
          </p>
        </div>
        {timestamp && (
          <span className="text-[10px] text-neutral-400 mt-1 block">
            {format(new Date(timestamp), 'HH:mm')}
          </span>
        )}
      </div>
    </motion.div>
  );
}
```

**Step 2: Agent chat component**

```typescript
// components/agent-chat.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2, MessageCircle } from 'lucide-react';
import { ChatMessage } from './chat-message';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface AgentChatProps {
  agentId?: string;
  agentName?: string;
  sessionKey?: string;
  className?: string;
}

export function AgentChat({ agentId = 'main', agentName = 'DevFlo', sessionKey, className }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(sessionKey || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load session history if sessionKey provided
  useEffect(() => {
    if (activeSession) {
      fetch(`/api/chat/${encodeURIComponent(activeSession)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data.map((m: any) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp || new Date().toISOString(),
            })));
          }
        })
        .catch(console.error);
    }
  }, [activeSession]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: activeSession,
          agentId,
          message: userMessage.content,
        }),
      });

      const data = await res.json();

      if (data.sessionKey && !activeSession) {
        setActiveSession(data.sessionKey);
      }

      if (data.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Send failed:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Failed to send message. Check gateway connection.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col glass rounded-2xl overflow-hidden ${className || 'h-[600px]'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200/10">
        <div className="w-8 h-8 rounded-full bg-[oklch(0.68_0.19_35)]/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-[oklch(0.68_0.19_35)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{agentName}</h3>
          <p className="text-xs text-neutral-500">
            {activeSession ? `Session: ${activeSession.slice(0, 12)}...` : 'New conversation'}
          </p>
        </div>
        <div className={`ml-auto w-2 h-2 rounded-full ${sending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Start a conversation with {agentName}</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              agentName={msg.role === 'assistant' ? agentName : undefined}
            />
          ))}
        </AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-neutral-400"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">{agentName} is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-200/10">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}...`}
            rows={1}
            className="flex-1 resize-none bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.68_0.19_35)]/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-[oklch(0.68_0.19_35)] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Chat page**

```typescript
// app/chat/page.tsx
import { Suspense } from 'react';
import { AgentChat } from '@/components/agent-chat';
import { ArrowLeft, Bot } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="glass p-2 rounded-xl hover:bg-neutral-200/20 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-[oklch(0.68_0.19_35)]" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Agent Chat
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChatSkeleton name="DevFlo" />}>
          <AgentChat agentId="main" agentName="DevFlo" className="h-[calc(100vh-200px)]" />
        </Suspense>
        <Suspense fallback={<ChatSkeleton name="Flo" />}>
          <AgentChat agentId="flo" agentName="Flo" className="h-[calc(100vh-200px)]" />
        </Suspense>
      </div>
    </div>
  );
}

function ChatSkeleton({ name }: { name: string }) {
  return (
    <div className="glass rounded-2xl h-[calc(100vh-200px)] flex items-center justify-center">
      <p className="text-neutral-400 text-sm">Loading {name}...</p>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add components/agent-chat.tsx components/chat-message.tsx app/chat/
git commit -m "feat: add agent chat UI with real-time messaging"
```

---

## Phase 3: Real Task Tracking

### Task 3.1: Task API Routes (CRUD)

**Files:**
- Create: `app/api/tasks/route.ts`
- Create: `app/api/tasks/[id]/route.ts`

**Step 1: Tasks list/create route**

```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

// For local dev, use in-memory store; in production, use D1 via getRequestContext()
let taskStore: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const project = url.searchParams.get('project');
    const assignee = url.searchParams.get('assignee');

    let filtered = [...taskStore];
    if (status) filtered = filtered.filter(t => t.status === status);
    if (project) filtered = filtered.filter(t => t.project === project);
    if (assignee) filtered = filtered.filter(t => t.assignee === assignee);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description || null,
      status: body.status || 'proposed',
      priority: body.priority || 'medium',
      assignee: body.assignee || null,
      project: body.project || null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      due_date: body.due_date || null,
      completed_date: null,
      parent_task_id: body.parent_task_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    taskStore.push(task);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
```

**Step 2: Task update/delete route**

```typescript
// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Reference same store (in production this is D1)
// This is a placeholder - the real implementation will use D1 bindings

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: fetch from D1
  return NextResponse.json({ error: 'Not implemented yet' }, { status: 501 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // TODO: update in D1
  return NextResponse.json({ error: 'Not implemented yet' }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: delete from D1
  return NextResponse.json({ success: true });
}
```

**Step 3: Commit**

```bash
git add app/api/tasks/
git commit -m "feat: add task CRUD API routes"
```

---

### Task 3.2: Replace Mock Task Data with Real UI

**Files:**
- Update: `app/tasks/page.tsx` (rewrite)
- Update: `components/task-board.tsx` (rewrite)
- Update: `components/task-card.tsx` (rewrite)

This task involves rewriting the task page to use the API instead of mock data, and adding create/edit/status-change functionality.

**Key changes:**
- Remove all hardcoded mock task data
- Add `useEffect` to fetch from `/api/tasks`
- Add "Create Task" dialog
- Add drag-and-drop between columns (proposed → active → completed)
- Add task detail sidebar
- Filter by project, priority, assignee

**Step 1: Rewrite task-card with real interactivity** (interactive status changes, edit button)

**Step 2: Rewrite task-board with API integration** (fetch from API, optimistic updates)

**Step 3: Rewrite tasks page with create dialog and filters**

**Step 4: Commit**

```bash
git add app/tasks/ components/task-board.tsx components/task-card.tsx
git commit -m "feat: replace mock task data with real API-driven task board"
```

---

## Phase 4: Sub-Agent & Session Monitoring

### Task 4.1: Sessions Dashboard Component

**Files:**
- Create: `components/sessions-monitor.tsx`
- Create: `app/sessions/page.tsx`

**Step 1: Build sessions monitor component**

Shows all active agent sessions, sub-agents being spun up, their status, last messages, and elapsed time. Auto-refreshes every 10 seconds.

Key features:
- List all active sessions with agent ID, kind, last activity
- Visual indicators for session type (main, sub-agent, webhook)
- Click to expand and see last N messages
- Kill session button
- Auto-refresh indicator

**Step 2: Build sessions page**

**Step 3: Commit**

```bash
git add components/sessions-monitor.tsx app/sessions/
git commit -m "feat: add sub-agent and session monitoring UI"
```

---

## Phase 5: Real Cloudflare Integration

### Task 5.1: Worker Logs & Tail Integration

**Files:**
- Update: `app/logs/page.tsx` (rewrite from placeholder)
- Create: `app/api/workers/[name]/logs/route.ts`
- Create: `lib/cloudflare-logs.ts`

**Step 1: Implement Cloudflare tail log client**

Uses Cloudflare API to fetch recent invocation logs. For real-time tailing, implement SSE endpoint that polls Cloudflare's tail API.

**Step 2: Rewrite logs page with real data** (remove all mock/placeholder content)

**Step 3: Add error aggregation view** (group errors by worker, show frequency, stack traces)

**Step 4: Commit**

```bash
git add lib/cloudflare-logs.ts app/api/workers/ app/logs/
git commit -m "feat: add real Cloudflare worker logs and tail integration"
```

---

### Task 5.2: Worker Health Dashboard

**Files:**
- Update: `app/workers/page.tsx` (rewrite from placeholder)
- Create: `app/api/workers/route.ts`

**Step 1: Implement workers list API** (real Cloudflare API data, not mock)

**Step 2: Rewrite workers page** with:
- Real-time status for each worker
- Request count, error rate, CPU time charts
- Last deployment timestamp
- Quick-action buttons (view logs, view routes)
- Alert badges for unhealthy workers

**Step 3: Commit**

```bash
git add app/workers/ app/api/workers/
git commit -m "feat: add real worker health monitoring with Cloudflare API"
```

---

## Phase 6: Navigation & Dashboard Integration

### Task 6.1: Update Navigation

**Files:**
- Update: `components/navigation-v2.tsx`

Add new routes:
- `/chat` - Agent Chat (new)
- `/sessions` - Sub-agent Monitor (new)
- Keep existing: `/`, `/workers`, `/analytics`, `/logs`, `/database`, `/tasks`, `/settings`

**Step 1: Update navigation with new routes and icons**

**Step 2: Commit**

```bash
git add components/navigation-v2.tsx
git commit -m "feat: update navigation with chat and sessions routes"
```

---

### Task 6.2: Dashboard Home Integration

**Files:**
- Update: `app/page.tsx`

Add to the main dashboard:
- Agent status cards (DevFlo, Flo - online/offline, last activity)
- Active task summary with quick-create button
- Active sessions count with link to sessions page
- Recent chat preview
- Worker health summary

**Step 1: Integrate new data sources into dashboard home**

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate agent status, tasks, and sessions into dashboard home"
```

---

## Phase 7: Testing & Deployment

### Task 7.1: Add Tests

**Files:**
- Create: `__tests__/api/tasks.test.ts`
- Create: `__tests__/api/sessions.test.ts`
- Create: `__tests__/components/agent-chat.test.tsx`
- Create: `vitest.config.ts` (if not exists)

**Step 1: Set up Vitest for Next.js**

**Step 2: Write API route tests for tasks CRUD**

**Step 3: Write component tests for chat**

**Step 4: Commit**

```bash
git add __tests__/ vitest.config.ts
git commit -m "test: add tests for task API and chat components"
```

---

### Task 7.2: Build & Deploy

**Step 1: Verify build passes**

```bash
npm run build
```

**Step 2: Deploy to Cloudflare**

```bash
npm run deploy
```

**Step 3: Verify deployment at atlas.srvcflo.com**

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: production build verification"
git push origin feature/command-center-consolidation
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1.1-1.3 | Infrastructure (wrangler, D1, config) |
| 2 | 2.1-2.3 | Agent communication (gateway client, chat UI) |
| 3 | 3.1-3.2 | Real task tracking (API + UI rewrite) |
| 4 | 4.1 | Sub-agent & session monitoring |
| 5 | 5.1-5.2 | Real Cloudflare integration (logs, workers) |
| 6 | 6.1-6.2 | Navigation & dashboard integration |
| 7 | 7.1-7.2 | Testing & deployment |

**Estimated scope:** ~15 tasks, iterative delivery (each phase is independently shippable).
