# Atlas Dashboard - Overnight Upgrade Plan

**Goal:** Transform Atlas Dashboard into a production-grade monitoring platform with modern UI, MCP backend integrations, and voice capabilities.

**Started:** 2026-01-28 05:10 UTC  
**Target Completion:** Morning (8-10 hours)  
**Status:** 🌙 In Progress

---

## Phase 1: UI Modernization with SuperDesign ✨

### 1.1 Apply SuperDesign Principles
- [ ] Read `/skill superdesign-1.0.0` for guidelines
- [ ] Create layout wireframes (ASCII art planning)
- [ ] Define modern color palette (oklch colors, no bootstrap blue)
- [ ] Select fonts: Inter for UI, Fira Code for logs
- [ ] Plan animations (Flo avatar, card transitions, data updates)

### 1.2 Component Redesign
- [ ] **Flo Avatar** - Enhanced flowing gradient with health pulsing
- [ ] **Project Cards** - Glassmorphism with subtle shadows
- [ ] **Navigation** - Modern top bar with breadcrumbs
- [ ] **Analytics Charts** - Recharts with custom styling
- [ ] **Activity Feed** - Timeline-style with icons
- [ ] **Log Viewer** - Terminal-style with syntax highlighting

### 1.3 Theme System
- [ ] Light/Dark mode toggle
- [ ] Color variables (--primary, --secondary, --accent)
- [ ] Consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
- [ ] Shadow system (sm, md, lg, xl)
- [ ] Border radius system (sm: 4px, md: 8px, lg: 12px, full: 9999px)

### 1.4 Animations
- [ ] Flo avatar: Flow speed based on system health
- [ ] Card hover effects (lift, glow)
- [ ] Data refresh transitions (fade, slide)
- [ ] Loading states (skeleton screens, spinners)
- [ ] Page transitions (Framer Motion)

---

## Phase 2: MCP Backend Integrations 🔌

### 2.1 MCP Server Setup
Create new backend routes for each MCP server:

**Monitoring & Observability:**
- [ ] `/api/audit-logs` - auditlogs MCP (track all changes)
- [ ] `/api/workers-observability` - logs, metrics, traces
- [ ] `/api/logpush` - configure log destinations
- [ ] `/api/dex-analysis` - Digital Experience Monitoring

**Analytics:**
- [ ] `/api/dns-analytics` - DNS query analytics
- [ ] `/api/radar` - Internet insights & trends

**Workers Management:**
- [ ] `/api/workers-bindings` - manage Worker bindings
- [ ] `/api/workers-builds` - CI/CD build status

**AI/Search:**
- [ ] `/api/docs-ai-search` - semantic search across docs
- [ ] `/api/docs-autorag` - RAG-powered documentation
- [ ] `/api/docs-vectorize` - vector embeddings for docs
- [ ] `/api/autorag` - general AutoRAG capabilities

**Security:**
- [ ] `/api/cloudflare-one-casb` - CASB security insights

**Development:**
- [ ] `/api/sandbox-container` - container management

### 2.2 MCP Client Implementation
```typescript
// lib/mcp-clients/
├── audit-logs.ts
├── workers-observability.ts
├── logpush.ts
├── dex-analysis.ts
├── dns-analytics.ts
├── radar.ts
├── workers-bindings.ts
├── workers-builds.ts
├── docs-ai-search.ts
├── docs-autorag.ts
├── docs-vectorize.ts
├── autorag.ts
├── cloudflare-one-casb.ts
└── sandbox-container.ts
```

### 2.3 Data Aggregation
- [ ] Create unified data service (`lib/mcp-aggregator.ts`)
- [ ] Cache MCP responses (60s TTL)
- [ ] Error handling for each MCP server
- [ ] Fallback data when MCP unavailable

### 2.4 Real-Time Updates
- [ ] Server-Sent Events (SSE) for live data
- [ ] WebSocket fallback for older browsers
- [ ] Auto-refresh on data changes
- [ ] Optimistic UI updates

---

## Phase 3: Database Monitoring Integration 📊

### 3.1 D1 Database Insights
- [ ] Query atlas-memory-index database
- [ ] Display: Total files, chunks, embeddings
- [ ] Show recent embedding operations
- [ ] Track embedding generation progress

### 3.2 R2 Storage Insights
- [ ] List files in clawdis-storage-prod
- [ ] Show storage usage, object count
- [ ] Recent uploads/downloads
- [ ] Bucket size trends

### 3.3 KV Storage Insights
- [ ] List KV namespaces
- [ ] Show key count, storage size
- [ ] Recent reads/writes
- [ ] Cache hit rates

### 3.4 Task Queue Monitoring
- [ ] Show active jobs from Queues
- [ ] Display job status (pending, running, complete)
- [ ] Track job completion rates
- [ ] Show failed jobs with errors

---

## Phase 4: Voice Integration with ElevenLabs 🎙️

### 4.1 ElevenLabs Setup
- [ ] Add ELEVENLABS_API_KEY to environment
- [ ] Select voice (Flo's voice ID: tbd)
- [ ] Configure voice settings (stability, similarity)

### 4.2 Voice Commands
Implement voice control for:
- [ ] "Show me project health" → Navigate to overview
- [ ] "What's the error rate?" → Display error metrics
- [ ] "Show logs for [project]" → Open project logs
- [ ] "Refresh data" → Trigger manual refresh
- [ ] "Deploy [project]" → Initiate deployment

### 4.3 Voice Responses
- [ ] System status announcements
- [ ] Alert notifications (errors, high CPU)
- [ ] Deployment confirmations
- [ ] Data summaries on request

### 4.4 UI Components
- [ ] Voice indicator (mic icon, listening state)
- [ ] Speech-to-text display
- [ ] Voice command history
- [ ] Settings for voice preferences

---

## Phase 5: Cloudflare Deployment 🚀

### 5.1 Build Configuration
- [ ] Update wrangler.toml with all bindings
- [ ] Add environment variables as secrets
- [ ] Configure caching rules
- [ ] Set up custom domain (atlas.srvcflo.com)

### 5.2 Optimization
- [ ] Code splitting for faster loads
- [ ] Image optimization (Cloudflare Images)
- [ ] Minify JS/CSS
- [ ] Enable compression (Brotli, Gzip)

### 5.3 Testing
- [ ] Test all MCP integrations
- [ ] Test voice commands
- [ ] Test on mobile/tablet
- [ ] Test error states
- [ ] Load testing (simulate heavy traffic)

### 5.4 Deployment Steps
```bash
# 1. Build
cd ~/atlas-dashboard
npm run build

# 2. Deploy
wrangler deploy

# 3. Configure domain
wrangler custom-domains add atlas.srvcflo.com

# 4. Verify
curl https://atlas.srvcflo.com/api/status
```

---

## Phase 6: Documentation 📚

### 6.1 Update README
- [ ] New features overview
- [ ] MCP server documentation
- [ ] Voice command reference
- [ ] Deployment instructions

### 6.2 Create Guides
- [ ] `VOICE_COMMANDS.md` - All voice commands
- [ ] `MCP_INTEGRATION.md` - How MCP servers work
- [ ] `MONITORING_GUIDE.md` - How to interpret metrics
- [ ] `DEPLOYMENT.md` - Deployment checklist

### 6.3 API Documentation
- [ ] OpenAPI spec for all endpoints
- [ ] Example requests/responses
- [ ] Error codes reference

---

## Success Criteria ✅

- [ ] Dashboard loads in <2s on 4G
- [ ] All MCP servers responding correctly
- [ ] Voice commands work reliably
- [ ] Real-time updates working
- [ ] Deployed to atlas.srvcflo.com
- [ ] Mobile responsive
- [ ] All tests passing
- [ ] Documentation complete

---

## Resources

**Repos:**
- Atlas Dashboard: ~/atlas-dashboard
- MCP Servers: https://github.com/cloudflare/mcp-server-cloudflare

**Cloudflare Assets:**
- Account ID: ff3c5e2beaea9f85fee3200bfe28da16
- D1 Database: atlas-memory-index (1abf2fbc-6073-4ab3-87a3-8adab74f427d)
- R2 Bucket: clawdis-storage-prod
- Workers: memory-embedder, others

**Skills:**
- SuperDesign: /skill superdesign-1.0.0
- Brainstorming: /skill brainstorming
- Writing Plans: /skill writing-plans

**Keys:**
- ElevenLabs API Key: (from .env.local)
- Cloudflare API Token: (from .env.local)

---

## Timeline Estimate

- Phase 1 (UI): 2-3 hours
- Phase 2 (MCP): 3-4 hours
- Phase 3 (DB): 1 hour
- Phase 4 (Voice): 2 hours
- Phase 5 (Deploy): 1 hour
- Phase 6 (Docs): 1 hour

**Total: 10-12 hours** (overnight completion expected by morning)

---

**Status:** 🌙 Ready to start overnight work
