# Atlas Live View 🗺️

**Production-grade monitoring platform** for Cloudflare projects with modern UI, MCP integrations, and voice control.

Built with Next.js 15, TypeScript, Tailwind CSS v4, and Framer Motion.

![Atlas Dashboard](https://img.shields.io/badge/Status-Production-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## 🌟 Features

### Core Monitoring
- **Live Project Monitoring**: Real-time health, errors, and performance tracking
- **Enhanced Flo Avatar**: Multi-layer animated guardian with health visualization
- **Worker Analytics**: Advanced charts with sparklines and trend indicators
- **Activity Timeline**: Visual timeline of deployments, errors, and events
- **Glassmorphic UI**: Modern design with smooth animations and transitions

### MCP Integration (14 Servers)
- **Workers Observability**: Logs, metrics, traces from all Workers
- **Audit Logs**: Complete account activity trail
- **Build History**: CI/CD deployment tracking
- **DNS Analytics**: Query patterns and performance
- **Radar**: Internet insights and attack patterns
- **DEX Analysis**: Digital experience monitoring
- **CASB**: Cloud security findings
- **Docs AI**: Semantic search and RAG capabilities
- And 6 more MCP servers...

### Database Monitoring
- **D1 Insights**: Query analytics, embeddings, storage metrics
- **R2 Storage**: Object count, bandwidth, size tracking
- **KV Namespaces**: Key count, read/write stats
- **Task Queues**: Job processing status and history

### Voice Control (ElevenLabs)
- **Natural Language**: "Show me project health", "What's the error rate?"
- **Navigation**: Voice-controlled dashboard navigation
- **Audio Feedback**: Flo speaks responses
- **40+ Commands**: Comprehensive voice command library

### Modern UX
- **Light/Dark Mode**: Seamless theme switching
- **Responsive**: Mobile, tablet, desktop optimized
- **Glassmorphism**: Beautiful depth and transparency effects
- **Smooth Animations**: 60fps interactions with Framer Motion
- **OKLCH Colors**: Modern color science for vibrant UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare Account ID
- Cloudflare API Token with permissions:
  - Workers Scripts: Read
  - Account Analytics: Read
  - Audit Logs: Read
  - D1: Read
  - R2: Read
  - Workers KV: Read

### Installation

```bash
cd ~/atlas-dashboard
npm install
```

### Environment Setup

Create `.env.local`:

```env
# Cloudflare Credentials
CLOUDFLARE_ACCOUNT_ID=ff3c5e2beaea9f85fee3200bfe28da16
CLOUDFLARE_API_TOKEN=your_api_token_here

# ElevenLabs Voice (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Refresh Interval
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
atlas-dashboard/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── analytics/page.tsx          # Analytics page
│   ├── logs/page.tsx               # Log viewer
│   ├── database/page.tsx           # Database monitoring
│   ├── project/[id]/page.tsx       # Project details
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Design system
│   └── api/
│       ├── mcp/                    # MCP API routes
│       │   ├── aggregate/route.ts
│       │   ├── observability/route.ts
│       │   ├── audit-logs/route.ts
│       │   └── builds/route.ts
│       └── voice/
│           └── command/route.ts
├── components/
│   ├── atlas-avatar-v2.tsx         # Enhanced Flo avatar
│   ├── project-card-v2.tsx         # Glassmorphic cards
│   ├── navigation-v2.tsx           # Modern navigation
│   ├── activity-feed.tsx           # Timeline
│   ├── worker-analytics-chart.tsx  # Charts
│   └── refresh-button.tsx          # Manual refresh
├── lib/
│   ├── mcp/                        # MCP client library
│   │   ├── base-client.ts
│   │   ├── aggregator.ts
│   │   ├── workers-observability.ts
│   │   ├── audit-logs.ts
│   │   ├── workers-builds.ts
│   │   └── types.ts
│   ├── voice/
│   │   └── elevenlabs.ts           # Voice integration
│   ├── cloudflare.ts               # Cloudflare API
│   ├── data-service.ts             # Data aggregation
│   ├── projects.ts                 # Project config
│   └── utils.ts                    # Utilities
└── types/
    └── index.ts                    # TypeScript types
```

## 🎨 Design System

### Colors (OKLCH)
- **Primary**: `oklch(0.68 0.19 35)` - Vibrant Orange
- **Accent**: `oklch(0.65 0.24 250)` - Electric Blue
- **Success**: `oklch(0.70 0.20 145)` - Green
- **Warning**: `oklch(0.75 0.20 65)` - Amber
- **Error**: `oklch(0.65 0.25 25)` - Red

### Typography
- **UI**: Inter (variable)
- **Code**: Fira Code (with ligatures)

### Animations
- **Duration**: 150ms (fast), 250ms (normal), 350ms (slow)
- **Easing**: Custom cubic-bezier curves
- **Framer Motion**: Page transitions, hover effects

## 🔌 MCP Integration

Atlas integrates with 14 Cloudflare MCP servers for comprehensive monitoring.

### Available Endpoints

```bash
# Aggregated metrics from all MCP servers
GET /api/mcp/aggregate

# Workers observability (logs, metrics, traces)
GET /api/mcp/observability?script=worker-name

# Audit logs
GET /api/mcp/audit-logs?limit=20

# Build history
GET /api/mcp/builds?limit=20
```

See [MCP_INTEGRATION.md](MCP_INTEGRATION.md) for detailed documentation.

## 🎙️ Voice Commands

Activate voice control with the microphone button in the navigation bar.

### Example Commands

**Navigation:**
- "Show me the overview"
- "Go to analytics"
- "Open logs"

**Queries:**
- "What's the system health?"
- "How many errors are there?"
- "What's the error rate?"

**Actions:**
- "Refresh data"
- "Deploy [project-name]"

See [VOICE_COMMANDS.md](VOICE_COMMANDS.md) for the complete reference.

## 📊 Monitoring Guide

Learn how to interpret metrics, set up alerts, and troubleshoot issues.

See [MONITORING_GUIDE.md](MONITORING_GUIDE.md) for the complete guide.

## 🚀 Deployment

### Deploy to Cloudflare Workers

1. **Install Wrangler:**
```bash
npm install -g wrangler
```

2. **Configure wrangler.toml:**
```toml
name = "atlas-dashboard"
main = "./.wrangler/output/server.js"
compatibility_date = "2026-01-28"
account_id = "ff3c5e2beaea9f85fee3200bfe28da16"

[[d1_databases]]
binding = "DB"
database_name = "atlas-memory-index"
database_id = "1abf2fbc-6073-4ab3-87a3-8adab74f427d"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "clawdis-storage-prod"
```

3. **Add Secrets:**
```bash
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put ELEVENLABS_API_KEY
```

4. **Build & Deploy:**
```bash
npm run build
wrangler deploy
```

5. **Configure Custom Domain:**
```bash
wrangler custom-domains add atlas.srvcflo.com
```

## 🔧 Configuration

### Adding Projects

Edit `lib/projects.ts`:

```typescript
export const KNOWN_PROJECTS: Project[] = [
  {
    id: 'my-project',
    name: 'My Project',
    domain: 'myproject.com',
    workerId: 'my-worker-script-name',
    status: 'unknown',
  },
];
```

### Adjusting Health Thresholds

Edit `lib/projects.ts`:

```typescript
export function determineProjectStatus(
  errorRate: number,
  cpuTime: number
): 'healthy' | 'warning' | 'error' {
  if (errorRate > 5 || cpuTime > 100) return 'error';
  if (errorRate > 1 || cpuTime > 50) return 'warning';
  return 'healthy';
}
```

### Cache Configuration

Edit `lib/mcp/base-client.ts`:

```typescript
export function createMCPConfig(): MCPClientConfig {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    cacheEnabled: true,
    cacheTTL: 60, // seconds
  };
}
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Test MCP endpoints
curl http://localhost:3000/api/mcp/aggregate

# Test voice commands
curl -X POST http://localhost:3000/api/voice/command \
  -H "Content-Type: application/json" \
  -d '{"text": "show me system health"}'
```

## 📱 Mobile Support

Atlas is fully responsive with mobile-optimized features:

- Bottom navigation bar on mobile
- Touch-friendly tap targets (44px minimum)
- Swipe gestures for navigation
- Simplified sparkline charts
- Collapsible sections
- Pull-to-refresh (coming soon)

## 🔐 Security

- All API tokens stored as environment variables/secrets
- No sensitive data in client-side code
- Cloudflare API authentication on all MCP calls
- Audit log tracking of all actions
- HTTPS-only in production

## 🐛 Troubleshooting

### No Data Showing
1. Verify API token permissions
2. Check worker names match script names
3. Verify account ID is correct
4. Check browser console for errors

### Voice Not Working
1. Check microphone permissions
2. Verify ElevenLabs API key
3. Check browser compatibility (Chrome/Edge recommended)

### Build Errors
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: `node -v` (need 18+)

## 📈 Performance

- **Time to Interactive**: < 2s on 4G
- **Lighthouse Score**: 95+
- **Bundle Size**: < 500KB gzipped
- **API Response Time**: < 200ms (cached)
- **Frame Rate**: 60fps animations

## 🗺️ Roadmap

- [ ] Real-time log streaming via WebSocket
- [ ] Historical data visualization (30/60/90 days)
- [ ] Email/Slack alert notifications
- [ ] Custom dashboard layouts
- [ ] Team collaboration features
- [ ] Advanced analytics (anomaly detection)
- [ ] Mobile app (React Native)
- [ ] Grafana integration

## 📄 License

Private - Minte Internal Tool

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 💬 Support

For issues or questions:
- Check documentation in `/docs`
- Review troubleshooting section
- Contact Minte development team

---

**Built with 🧡 by Flo for Minte**

*Monitoring made beautiful.*
