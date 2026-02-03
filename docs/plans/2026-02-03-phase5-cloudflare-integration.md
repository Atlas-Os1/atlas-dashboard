# Phase 5: Real Cloudflare Integration Implementation Plan

**Goal:** Replace all mock Cloudflare data with real API calls for live worker monitoring, logs, and health metrics.

**Branch:** `feature/phase5-cloudflare-integration`

**Tech Stack:**
- Cloudflare Workers API (Analytics Engine, Logpush, Tail Workers)
- Next.js 15 Server Actions + API Routes
- Real-time updates via Server-Sent Events (SSE)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Atlas Dashboard UI                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Workers Page │  │  Logs Page   │  │Analytics Page│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                          │                                   │
│         ┌────────────────▼────────────────┐                 │
│         │   lib/cloudflare-client.ts      │                 │
│         │  (Enhanced API Client)          │                 │
│         └────────────────┬────────────────┘                 │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │ Cloudflare API      │
                │ - Workers Scripts   │
                │ - Analytics Engine  │
                │ - Logpush           │
                │ - Tail Workers      │
                └─────────────────────┘
```

---

## Task 1: Enhance Cloudflare Client with Real Worker Data

**Files:**
- Modify: `lib/cloudflare.ts` (rename to `lib/cloudflare-client.ts`)

### Step 1: Write test for real worker list fetching

**File:** `lib/__tests__/cloudflare-client.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CloudflareClient } from '../cloudflare-client';

describe('CloudflareClient', () => {
  let client: CloudflareClient;

  beforeEach(() => {
    client = new CloudflareClient({
      accountId: 'test-account',
      apiToken: 'test-token',
    });
  });

  describe('listWorkers', () => {
    it('should fetch workers from Cloudflare API', async () => {
      const workers = await client.listWorkers();
      expect(Array.isArray(workers)).toBe(true);
    });

    it('should return worker script names', async () => {
      const workers = await client.listWorkers();
      expect(workers[0]).toHaveProperty('id');
      expect(workers[0]).toHaveProperty('script');
    });
  });
});
```

### Step 2: Run test to verify it fails

```bash
cd /home/flo/atlas-dashboard-consolidation
npm test lib/__tests__/cloudflare-client.test.ts
```

**Expected:** FAIL - CloudflareClient not properly structured

### Step 3: Implement enhanced CloudflareClient

**File:** `lib/cloudflare-client.ts`

```typescript
export interface CloudflareClientConfig {
  accountId: string;
  apiToken: string;
  baseUrl?: string;
}

export interface WorkerScript {
  id: string;
  script: string;
  created_on: string;
  modified_on: string;
  etag: string;
  handlers: string[];
  last_deployed_from?: string;
}

export interface WorkerAnalytics {
  requests: number;
  errors: number;
  errorRate: number;
  cpuTime: number;
  duration: number;
  timestamp: string;
}

export class CloudflareClient {
  private config: Required<CloudflareClientConfig>;
  private headers: HeadersInit;

  constructor(config: CloudflareClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.cloudflare.com/client/v4',
    };
    
    this.headers = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options?.headers },
    });

    if (!response.ok) {
      throw new Error(
        `Cloudflare API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API error: ${JSON.stringify(data.errors)}`);
    }

    return data.result;
  }

  async listWorkers(): Promise<WorkerScript[]> {
    return this.fetch<WorkerScript[]>(
      `/accounts/${this.config.accountId}/workers/scripts`
    );
  }

  async getWorkerAnalytics(
    scriptName: string,
    since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)
  ): Promise<WorkerAnalytics | null> {
    try {
      const sinceParam = since.toISOString();
      const untilParam = new Date().toISOString();

      const result = await this.fetch<any>(
        `/accounts/${this.config.accountId}/workers/scripts/${encodeURIComponent(
          scriptName
        )}/analytics?since=${sinceParam}&until=${untilParam}`
      );

      return {
        requests: result.data?.requests || 0,
        errors: result.data?.errors || 0,
        errorRate: result.data?.error_rate || 0,
        cpuTime: result.data?.cpu_time || 0,
        duration: result.data?.duration || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn(`Analytics not available for ${scriptName}:`, error);
      return null;
    }
  }
}

// Singleton instance for server-side use
export const cloudflare = new CloudflareClient({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
});
```

### Step 4: Run test to verify it passes

```bash
npm test lib/__tests__/cloudflare-client.test.ts
```

**Expected:** PASS

### Step 5: Commit

```bash
git add lib/cloudflare-client.ts lib/__tests__/cloudflare-client.test.ts
git commit -m "feat(cloudflare): enhance client with real worker data fetching"
```

---

## Task 2: Implement Real-Time Tail Workers Log Streaming

**Files:**
- Create: `lib/tail-worker-client.ts`
- Create: `app/api/logs/stream/route.ts`

### Step 1: Write test for Tail Worker client

**File:** `lib/__tests__/tail-worker-client.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { TailWorkerClient } from '../tail-worker-client';

describe('TailWorkerClient', () => {
  it('should create WebSocket connection to Tail Workers', async () => {
    const client = new TailWorkerClient({
      accountId: 'test',
      apiToken: 'test',
    });

    const connection = await client.connect('test-worker');
    expect(connection).toHaveProperty('on');
    expect(connection).toHaveProperty('close');
  });

  it('should emit log events', (done) => {
    const client = new TailWorkerClient({
      accountId: 'test',
      apiToken: 'test',
    });

    client.connect('test-worker').then((conn) => {
      conn.on('log', (log) => {
        expect(log).toHaveProperty('message');
        expect(log).toHaveProperty('timestamp');
        done();
      });
    });
  });
});
```

### Step 2: Run test (watch it fail)

```bash
npm test lib/__tests__/tail-worker-client.test.ts
```

**Expected:** FAIL - TailWorkerClient not implemented

### Step 3: Implement Tail Worker client

**File:** `lib/tail-worker-client.ts`

```typescript
import { EventEmitter } from 'events';

export interface TailWorkerConfig {
  accountId: string;
  apiToken: string;
}

export interface LogEvent {
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  scriptName: string;
  metadata?: Record<string, any>;
}

export class TailWorkerClient extends EventEmitter {
  private config: TailWorkerConfig;
  private ws: WebSocket | null = null;

  constructor(config: TailWorkerConfig) {
    super();
    this.config = config;
  }

  async connect(scriptName: string): Promise<TailWorkerClient> {
    const wsUrl = `wss://api.cloudflare.com/client/v4/accounts/${
      this.config.accountId
    }/workers/scripts/${encodeURIComponent(scriptName)}/tail`;

    this.ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
    });

    this.ws.on('message', (data: string) => {
      try {
        const log: LogEvent = JSON.parse(data);
        this.emit('log', log);
      } catch (error) {
        console.error('Failed to parse log:', error);
      }
    });

    this.ws.on('error', (error) => {
      this.emit('error', error);
    });

    return this;
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### Step 4: Create SSE endpoint for log streaming

**File:** `app/api/logs/stream/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { TailWorkerClient } from '@/lib/tail-worker-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scriptName = searchParams.get('script');

  if (!scriptName) {
    return new Response('Missing script parameter', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const client = new TailWorkerClient({
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        apiToken: process.env.CLOUDFLARE_API_TOKEN!,
      });

      await client.connect(scriptName);

      client.on('log', (log) => {
        const data = encoder.encode(`data: ${JSON.stringify(log)}\n\n`);
        controller.enqueue(data);
      });

      client.on('error', (error) => {
        console.error('Tail worker error:', error);
        controller.close();
      });

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        client.close();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### Step 5: Run tests

```bash
npm test lib/__tests__/tail-worker-client.test.ts
npm run build # Verify SSE endpoint compiles
```

**Expected:** PASS

### Step 6: Commit

```bash
git add lib/tail-worker-client.ts app/api/logs/stream/route.ts lib/__tests__/tail-worker-client.test.ts
git commit -m "feat(logs): add real-time Tail Workers log streaming via SSE"
```

---

## Task 3: Replace Mock Worker Data with Real API

**Files:**
- Modify: `app/workers/page.tsx`
- Create: `lib/worker-service.ts`

### Step 1: Write test for worker service

**File:** `lib/__tests__/worker-service.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { WorkerService } from '../worker-service';

describe('WorkerService', () => {
  it('should fetch all workers with analytics', async () => {
    const service = new WorkerService();
    const workers = await service.getAllWorkersWithMetrics();
    
    expect(Array.isArray(workers)).toBe(true);
    expect(workers[0]).toHaveProperty('id');
    expect(workers[0]).toHaveProperty('status');
    expect(workers[0]).toHaveProperty('requests24h');
  });
});
```

### Step 2: Run test (watch fail)

```bash
npm test lib/__tests__/worker-service.test.ts
```

**Expected:** FAIL

### Step 3: Implement worker service

**File:** `lib/worker-service.ts`

```typescript
import { cloudflare, WorkerScript, WorkerAnalytics } from './cloudflare-client';

export interface WorkerWithMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  requests24h: number;
  errors24h: number;
  errorRate: number;
  avgCpuTime: number;
  avgDuration: number;
  lastDeployment: string;
  routes: string[];
  environment: 'production' | 'staging' | 'development';
}

export class WorkerService {
  async getAllWorkersWithMetrics(): Promise<WorkerWithMetrics[]> {
    const scripts = await cloudflare.listWorkers();
    
    const workersWithMetrics = await Promise.all(
      scripts.map(async (script) => {
        const analytics = await cloudflare.getWorkerAnalytics(script.script);
        
        const status = this.determineStatus(
          analytics?.errorRate || 0,
          analytics?.cpuTime || 0
        );

        return {
          id: script.id,
          name: script.script,
          status,
          requests24h: analytics?.requests || 0,
          errors24h: analytics?.errors || 0,
          errorRate: analytics?.errorRate || 0,
          avgCpuTime: analytics?.cpuTime || 0,
          avgDuration: analytics?.duration || 0,
          lastDeployment: script.modified_on,
          routes: [], // TODO: Fetch from zones API
          environment: this.determineEnvironment(script.script),
        };
      })
    );

    return workersWithMetrics;
  }

  private determineStatus(
    errorRate: number,
    cpuTime: number
  ): 'healthy' | 'warning' | 'error' {
    if (errorRate > 5 || cpuTime > 100) return 'error';
    if (errorRate > 1 || cpuTime > 50) return 'warning';
    return 'healthy';
  }

  private determineEnvironment(scriptName: string): 'production' | 'staging' | 'development' {
    if (scriptName.includes('-dev') || scriptName.includes('-development')) {
      return 'development';
    }
    if (scriptName.includes('-staging') || scriptName.includes('-stg')) {
      return 'staging';
    }
    return 'production';
  }
}

export const workerService = new WorkerService();
```

### Step 4: Update workers page to use real data

**File:** `app/workers/page.tsx`

```typescript
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WorkerDetailCard } from '@/components/worker-detail-card';
import { workerService } from '@/lib/worker-service';

async function fetchWorkers() {
  // Real API call - no more mock data!
  return await workerService.getAllWorkersWithMetrics();
}

export default async function WorkersPage() {
  const workers = await fetchWorkers();
  
  const stats = {
    total: workers.length,
    healthy: workers.filter((w) => w.status === 'healthy').length,
    warning: workers.filter((w) => w.status === 'warning').length,
    error: workers.filter((w) => w.status === 'error').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* ... existing UI code ... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workers.map((worker) => (
          <WorkerDetailCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
}
```

### Step 5: Run tests

```bash
npm test lib/__tests__/worker-service.test.ts
npm run build
```

**Expected:** PASS + clean build

### Step 6: Commit

```bash
git add lib/worker-service.ts app/workers/page.tsx lib/__tests__/worker-service.test.ts
git commit -m "feat(workers): replace mock data with real Cloudflare API calls"
```

---

## Task 4: Update Logs Page with Real-Time Streaming

**Files:**
- Modify: `app/logs/page.tsx`
- Create: `components/log-stream.tsx`

### Step 1: Create log stream component

**File:** `components/log-stream.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { LogEvent } from '@/lib/tail-worker-client';

interface LogStreamProps {
  scriptName: string;
}

export function LogStream({ scriptName }: LogStreamProps) {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/logs/stream?script=${encodeURIComponent(scriptName)}`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const log: LogEvent = JSON.parse(event.data);
      setLogs((prev) => [log, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [scriptName]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-slate-400">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      <div className="space-y-1 font-mono text-sm">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              log.level === 'error'
                ? 'bg-red-500/10 text-red-400'
                : log.level === 'warn'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-slate-800/50 text-slate-300'
            }`}
          >
            <span className="text-slate-500">[{log.timestamp}]</span>{' '}
            <span className="font-semibold">{log.level.toUpperCase()}</span>{' '}
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 2: Update logs page

**File:** `app/logs/page.tsx`

```typescript
import { Suspense } from 'react';
import { LogStream } from '@/components/log-stream';
import { workerService } from '@/lib/worker-service';

export default async function LogsPage() {
  const workers = await workerService.getAllWorkersWithMetrics();
  const [selectedWorker, setSelectedWorker] = useState(workers[0]?.name || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Worker selector dropdown */}
      <select
        value={selectedWorker}
        onChange={(e) => setSelectedWorker(e.target.value)}
        className="px-4 py-2 bg-slate-800 rounded-lg"
      >
        {workers.map((worker) => (
          <option key={worker.id} value={worker.name}>
            {worker.name}
          </option>
        ))}
      </select>

      {/* Live log stream */}
      <Suspense fallback={<div>Connecting...</div>}>
        <LogStream scriptName={selectedWorker} />
      </Suspense>
    </div>
  );
}
```

### Step 3: Test manually

```bash
npm run dev
# Open http://localhost:3000/logs
# Verify logs stream in real-time
```

### Step 4: Commit

```bash
git add components/log-stream.tsx app/logs/page.tsx
git commit -m "feat(logs): add real-time log streaming from Tail Workers"
```

---

## Task 5: Add Worker Health Dashboard

**Files:**
- Create: `app/api/workers/health/route.ts`
- Create: `components/worker-health-card.tsx`
- Modify: `app/page.tsx` (add health cards to dashboard)

### Step 1: Create health API endpoint

**File:** `app/api/workers/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { workerService } from '@/lib/worker-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workers = await workerService.getAllWorkersWithMetrics();
    
    const health = {
      totalWorkers: workers.length,
      healthy: workers.filter((w) => w.status === 'healthy').length,
      warning: workers.filter((w) => w.status === 'warning').length,
      error: workers.filter((w) => w.status === 'error').length,
      totalRequests24h: workers.reduce((sum, w) => sum + w.requests24h, 0),
      totalErrors24h: workers.reduce((sum, w) => sum + w.errors24h, 0),
      avgErrorRate: workers.reduce((sum, w) => sum + w.errorRate, 0) / workers.length,
      workers: workers.map((w) => ({
        name: w.name,
        status: w.status,
        errorRate: w.errorRate,
      })),
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Error fetching worker health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch worker health' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create worker health card component

**File:** `components/worker-health-card.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Server, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface WorkerHealth {
  totalWorkers: number;
  healthy: number;
  warning: number;
  error: number;
  totalRequests24h: number;
  totalErrors24h: number;
  avgErrorRate: number;
}

export function WorkerHealthCard() {
  const [health, setHealth] = useState<WorkerHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/workers/health');
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error('Failed to fetch worker health:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return <div className="animate-pulse bg-slate-800/50 rounded-xl h-48" />;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Server className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold">Worker Health</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{health.healthy}</div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Healthy
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400">{health.warning}</div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Warning
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">{health.error}</div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Error
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Total Requests (24h)</span>
          <span className="font-semibold text-blue-400">
            {health.totalRequests24h.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Total Errors (24h)</span>
          <span className="font-semibold text-red-400">
            {health.totalErrors24h.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Avg Error Rate</span>
          <span className="font-semibold text-amber-400">
            {health.avgErrorRate.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Add to dashboard homepage

**File:** `app/page.tsx`

```typescript
import { WorkerHealthCard } from '@/components/worker-health-card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Atlas Command Center</h1>
        
        {/* Add Worker Health Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkerHealthCard />
          {/* ... other cards ... */}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Test

```bash
npm run dev
# Open http://localhost:3000
# Verify worker health card displays real data
```

### Step 5: Commit

```bash
git add app/api/workers/health/route.ts components/worker-health-card.tsx app/page.tsx
git commit -m "feat(dashboard): add real-time worker health monitoring card"
```

---

## Task 6: Environment Configuration

**Files:**
- Create: `.env.local.example`
- Modify: `README.md` (update setup instructions)

### Step 1: Create env example

**File:** `.env.local.example`

```env
# Cloudflare Credentials (REQUIRED)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# Refresh Interval (Optional)
NEXT_PUBLIC_REFRESH_INTERVAL=30000

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_TAIL_WORKERS=true
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=true
```

### Step 2: Update README

Add to README.md:

```markdown
## Real Cloudflare Integration

Atlas Dashboard now uses **real Cloudflare API data** instead of mocks.

### Setup Required

1. Create a Cloudflare API token with these permissions:
   - Workers Scripts: Read
   - Account Analytics: Read
   - Logs: Read

2. Set environment variables:

\`\`\`bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
\`\`\`

3. Restart the dev server:

\`\`\`bash
npm run dev
\`\`\`

### Features

- ✅ Real worker list from Cloudflare API
- ✅ Live analytics (requests, errors, CPU time)
- ✅ Real-time log streaming via Tail Workers
- ✅ Worker health monitoring with auto-refresh
```

### Step 3: Commit

```bash
git add .env.local.example README.md
git commit -m "docs: add Cloudflare API setup instructions for real data"
```

---

## Task 7: Testing & Verification

### Step 1: Run all tests

```bash
npm test
```

**Expected:** All tests pass

### Step 2: Build for production

```bash
npm run build
```

**Expected:** Clean build, no errors

### Step 3: Manual verification checklist

- [ ] Workers page shows real data from Cloudflare API
- [ ] Worker health card on homepage displays live stats
- [ ] Logs page streams real-time logs via SSE
- [ ] Worker selector dropdown populated with real workers
- [ ] Error rates and status indicators update correctly
- [ ] Dashboard auto-refreshes every 30 seconds

### Step 4: Commit verification notes

```bash
echo "## Phase 5 Verification

- [x] All tests passing
- [x] Production build clean
- [x] Real worker data fetching
- [x] Live log streaming working
- [x] Health monitoring accurate
" > docs/phase5-verification.md

git add docs/phase5-verification.md
git commit -m "docs: add Phase 5 verification checklist"
```

---

## Success Criteria

- ✅ No mock data in workers page
- ✅ Real-time log streaming from Tail Workers
- ✅ Worker health dashboard with live data
- ✅ All tests passing
- ✅ Production build clean
- ✅ Environment configuration documented

---

## Next Steps (Post-Phase 5)

1. Integrate with Phase 2 (Agent Chat) for log context in chat
2. Add alerting system for worker errors
3. Historical analytics graphs (30/60/90 days)
4. Logpush integration for long-term storage

---

**Estimated Time:** 2-3 hours  
**Dependencies:** None (can run in parallel with Phases 3-4)  
**Risk Level:** Low (existing API client, just enhancing)
