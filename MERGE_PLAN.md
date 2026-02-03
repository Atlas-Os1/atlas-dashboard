# Atlas Admin UI - Merge Plan

**Goal:** Merge new features from `Atlas-Os1/atlas-dashboard` into `mintedmaterial/atlas-admin-ui` (the nice UI)

**Status:** Waiting for repo access to `mintedmaterial/atlas-admin-ui`

---

## Features to Merge

### 1. Agent Chat Interface (`/chat`)
**Source:** `Atlas-Os1/atlas-dashboard`
**Files:**
- `app/chat/page.tsx` - Side-by-side chat UI
- `app/api/chat/*` - Chat API routes
- `lib/gateway-client.ts` - WebSocket gateway connection
- `lib/config.ts` - Flo + DevFlo gateway configs

**Integration:**
- Add to navigation
- Connect to both gateways (Flo VPS + DevFlo container)
- Real-time messaging via WebSocket

---

### 2. Session Monitoring (`/sessions`)
**Source:** `Atlas-Os1/atlas-dashboard`
**Files:**
- `app/sessions/page.tsx` - Live session/sub-agent list
- `app/api/sessions/*` - Sessions API
- `components/session-monitor.tsx` - Real-time updates

**Integration:**
- Monitor both gateways
- Show active sessions, sub-agents, their status
- Auto-refresh every 30s

---

### 3. Task Queue System (`/tasks`)
**Source:** `Atlas-Os1/atlas-dashboard`
**Files:**
- `app/tasks/page.tsx` - Task board UI
- `app/api/tasks/*` - CRUD API
- `migrations/0001_initial_schema.sql` - D1 schema

**Integration:**
- Replace mock task data with real D1 storage
- Add error → task conversion (logs become fix tasks)
- Status: proposed, active, completed, blocked

---

### 4. Worker Health Dashboard
**Source:** `Atlas-Os1/atlas-dashboard`
**Files:**
- `lib/cloudflare-client.ts` - Real Cloudflare API
- `lib/worker-service.ts` - Worker metrics
- `components/worker-health-card.tsx` - Health widget

**Integration:**
- Add to homepage
- Real-time worker metrics (no mock data)
- Show all containers, workers, environments

---

### 5. Real-Time Logs (`/logs`)
**Source:** `Atlas-Os1/atlas-dashboard`
**Files:**
- `app/logs/page.tsx` - Log viewer
- `lib/cloudflare-logs.ts` - Log fetching

**Integration:**
- Add worker selector dropdown
- Time range filters
- Search and level filtering

---

## Infrastructure Changes

### wrangler.jsonc Updates
```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "atlas-command-center",
      "database_id": "ae039f56-5d10-4465-b734-6f037644de04"
    }
  ],
  "vars": {
    "CLOUDFLARE_ACCOUNT_ID": "ff3c5e2beaea9f85fee3200bfe28da16"
  }
}
```

### Secrets to Set
```bash
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put FLO_GATEWAY_TOKEN
wrangler secret put DEVFLO_GATEWAY_TOKEN
```

---

## Design Principles

**KEEP** from nice UI:
- Beautiful glassmorphic design
- Color scheme and branding
- Navigation structure
- Page layouts

**ADD** from new features:
- Functional components
- API routes
- Real data connections
- Gateway integrations

**AVOID:**
- Overwriting existing nice styles
- Breaking existing functionality
- Adding mock data

---

## Merge Strategy

### Phase 1: Infrastructure (DevFlo)
1. Add D1 database binding
2. Add secrets configuration
3. Update wrangler.jsonc
4. Run migrations

### Phase 2: Libraries (Flo)
1. Copy `lib/gateway-client.ts`
2. Copy `lib/cloudflare-client.ts`
3. Copy `lib/worker-service.ts`
4. Update `lib/config.ts` with both gateways

### Phase 3: API Routes (DevFlo)
1. Add `app/api/chat/*`
2. Add `app/api/sessions/*`
3. Add `app/api/tasks/*`
4. Add `app/api/workers/health`

### Phase 4: UI Components (Flo)
1. Add chat page (match nice UI design)
2. Add sessions page
3. Update tasks page (real data)
4. Add worker health card to homepage

### Phase 5: Navigation (Both)
1. Add new routes to nav
2. Test all links
3. Ensure mobile responsive

### Phase 6: Testing (Both)
1. Test both gateway connections
2. Verify all API routes work
3. Test real-time features
4. Check mobile/desktop views

---

## Success Criteria

- ✅ Nice UI design preserved
- ✅ Chat with both Flo and DevFlo works
- ✅ Session monitoring shows live data
- ✅ Task queue functional with D1 storage
- ✅ Worker health shows real metrics
- ✅ Logs page working
- ✅ All navigation working
- ✅ Mobile responsive
- ✅ No broken features from original UI

---

**Next Steps:**
1. Get repo access to `mintedmaterial/atlas-admin-ui`
2. Clone both repos
3. Create feature branch
4. Execute merge phases
5. Deploy to `atlas-admin-ui` worker
6. Test at admin.minte.dev

**ETA:** 4-6 hours (overnight work with parallel sub-agents)
