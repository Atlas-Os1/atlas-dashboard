# Atlas Command Center Consolidation Plan
**Date:** 2026-01-31  
**Status:** In Progress  
**Goal:** Consolidate admin UI features into atlas-dashboard and enhance monitoring capabilities

## Background

The `atlas-admin-ui` references were found in worker code but no separate repository exists. This plan consolidates all admin and monitoring features into the unified `atlas-dashboard` application.

## Current State Audit

### ✅ Existing Features
- **Worker Analytics** (`/analytics`) - Real-time worker monitoring with metrics
- **Database Page** (`/database`) - D1, R2, KV monitoring  
- **Logs Page** (`/logs`) - Basic placeholder for log viewing
- **Main Dashboard** (`/`) - System overview with Flo avatar and health
- **MCP Integration** - 14 Cloudflare MCP servers integrated
- **Voice Control** - ElevenLabs integration for voice commands

### ❌ Missing Features (To Add)
1. **Task Tracking UI** - Track completed, current, and future tasks
2. **Enhanced Worker Monitoring** - Deep Cloudflare integration with live metrics
3. **Enhanced Logs Page** - Direct link to Cloudflare log viewer with filtering

## Implementation Plan

### Phase 1: Task Tracking UI
**File:** `app/tasks/page.tsx`  
**Components:** `components/task-board.tsx`, `components/task-card.tsx`

Features:
- Three-column board: Completed | Current | Future
- Task cards with status, priority, assignee
- Drag-and-drop support (optional)
- Integration with project tracking data
- Filters: by project, priority, assignee

### Phase 2: Enhanced Worker Monitoring  
**File:** `app/workers/page.tsx`  
**Components:** `components/worker-detail-card.tsx`, `components/worker-metrics-chart.tsx`

Features:
- List all Cloudflare Workers with real-time status
- Per-worker detailed metrics (requests, errors, CPU, duration)
- Live tail logs for each worker
- Deployment history and rollback
- Environment variables viewer
- Route configuration display

### Phase 3: Enhanced Logs Page
**File:** Update existing `app/logs/page.tsx`

Features:
- Direct integration with Cloudflare Logpush/Tail Workers
- Link to Cloudflare Dashboard log viewer
- Basic filtering (by worker, date range, log level)
- Search functionality
- Export logs to file
- Real-time log streaming (WebSocket)

### Phase 4: Navigation Update
**File:** Update `components/navigation-v2.tsx`

Add new routes:
- `/tasks` - Task Tracking
- `/workers` - Worker Monitoring (separate from analytics)
- Enhanced `/logs` link

## Technical Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom + shadcn/ui patterns
- **API Integration:** Cloudflare Workers API, MCP servers
- **Real-time:** Server-Sent Events (SSE) or WebSocket for live data
- **Data Sources:**
  - Cloudflare Workers API
  - Cloudflare Analytics Engine  
  - MCP aggregator
  - D1 for task storage (optional)

## Git Workflow

Using **git worktrees** for isolation:

```bash
# Create worktree for consolidation work
git worktree add ../atlas-dashboard-consolidation -b feature/command-center-consolidation

# Work in isolated branch
cd ../atlas-dashboard-consolidation

# Commit after each phase
git add .
git commit -m "feat: add task tracking UI (Phase 1)"
git commit -m "feat: enhance worker monitoring page (Phase 2)"
git commit -m "feat: enhance logs page with Cloudflare integration (Phase 3)"
git commit -m "feat: update navigation with new features (Phase 4)"

# Push and create PR
git push -u origin feature/command-center-consolidation
```

## Success Criteria

- ✅ All features implemented and tested
- ✅ Navigation updated with new pages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Integration tests passing
- ✅ Documentation updated
- ✅ PR created and merged to main

## Timeline

- **Phase 1:** ~2 hours (Task Tracking UI)
- **Phase 2:** ~3 hours (Worker Monitoring)
- **Phase 3:** ~2 hours (Enhanced Logs)
- **Phase 4:** ~30 minutes (Navigation)
- **Total:** ~7.5 hours

## Deployment

1. Merge to `main` branch
2. Automated deployment via Cloudflare Workers (existing CI/CD)
3. Update DNS/routing if needed
4. Announce in #clawd-flo-updates

---

**Next Steps:** Execute phases sequentially using git worktree for isolation.
