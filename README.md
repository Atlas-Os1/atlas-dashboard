# Atlas Live View 🌳

Centralized monitoring dashboard for all Minte's Cloudflare projects.

## Overview

Atlas Live View is an admin dashboard that provides real-time monitoring and analytics for all Cloudflare Workers projects. It displays project health, request analytics, error rates, CPU usage, and recent activity across all your deployments.

## Features

- **Real-Time Monitoring**: Track all projects in one place
- **Animated Atlas Avatar**: Visual system health indicator (🌳)
- **Project Cards**: Quick status overview for each project
- **Worker Analytics**: Request counts, error rates, CPU time
- **Activity Feed**: Recent deployments and events
- **Detailed Views**: Deep dive into individual project metrics
- **Auto-Refresh**: Updates every 30 seconds

## Monitored Projects

- Kiamichi Business Connect (kiamichibizconnect.com)
- Twisted Custom Leather (twistedcustomleather.com)
- SrvcFlo Platform (srvcflo.com)
- Minte Development (minte.dev)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Cloudflare Workers (via OpenNext)
- **Data Source**: Cloudflare Analytics API

## Getting Started

### Prerequisites

- Node.js 18+
- Cloudflare Account ID
- Cloudflare API Token with the following permissions:
  - Workers Scripts: Read
  - Account Analytics: Read
  - Zone: Read (optional, for domain info)

### Installation

1. Clone the repository:
```bash
cd /home/flo/atlas-dashboard
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
```env
CLOUDFLARE_ACCOUNT_ID=ff3c5e2beaea9f85fee3200bfe28da16
CLOUDFLARE_API_TOKEN=your_actual_token_here
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
atlas-dashboard/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── analytics/page.tsx    # Detailed analytics
│   ├── logs/page.tsx         # Unified logs (placeholder)
│   └── project/[id]/page.tsx # Individual project view
├── components/
│   ├── atlas-avatar.tsx      # Animated system health indicator
│   ├── project-card.tsx      # Project status card
│   ├── activity-feed.tsx     # Recent events feed
│   ├── worker-analytics-chart.tsx # Analytics visualization
│   ├── navigation.tsx        # Top navigation bar
│   └── refresh-button.tsx    # Manual refresh trigger
├── lib/
│   ├── cloudflare.ts         # Cloudflare API client
│   ├── projects.ts           # Project configuration
│   └── data-service.ts       # Data aggregation layer
└── types/
    └── index.ts              # TypeScript definitions
```

## API Endpoints Used

- `GET /accounts/{account_id}/workers/scripts` - List all workers
- `GET /accounts/{account_id}/workers/scripts/{script_name}/analytics` - Worker analytics
- `GET /zones?account.id={account_id}` - List zones (optional)

## Deployment

### Deploy to Cloudflare Workers

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Configure wrangler.toml:
```toml
name = "atlas-dashboard"
compatibility_date = "2024-01-01"

[vars]
CLOUDFLARE_ACCOUNT_ID = "ff3c5e2beaea9f85fee3200bfe28da16"
```

3. Add secrets:
```bash
wrangler secret put CLOUDFLARE_API_TOKEN
```

4. Deploy:
```bash
npm run build
wrangler deploy
```

5. Configure custom domain in Cloudflare Dashboard:
   - Go to Workers & Pages > atlas-dashboard > Settings > Domains
   - Add custom domain: `atlas.srvcflo.com` or `atlas.minte.dev`

## Configuration

### Adding New Projects

Edit `lib/projects.ts` and add your project to the `KNOWN_PROJECTS` array:

```typescript
{
  id: 'my-project',
  name: 'My Project Name',
  domain: 'myproject.com',
  workerId: 'my-worker-id', // Must match Cloudflare Worker script name
  status: 'unknown',
}
```

### Customizing Health Thresholds

Edit `lib/projects.ts` to adjust the `determineProjectStatus` function:

```typescript
export function determineProjectStatus(
  errorRate: number,
  cpuTime: number
): 'healthy' | 'warning' | 'error' {
  if (errorRate > 5 || cpuTime > 100) {
    return 'error';
  } else if (errorRate > 1 || cpuTime > 50) {
    return 'warning';
  }
  return 'healthy';
}
```

## Future Enhancements

- [ ] Real-time log streaming (requires Logpush or Tail Workers setup)
- [ ] D1 database for caching analytics data
- [ ] Server-Sent Events (SSE) for live updates
- [ ] Historical data visualization
- [ ] Alert notifications
- [ ] Performance metrics over time
- [ ] Deployment history tracking
- [ ] Worker CPU time optimization suggestions

## Troubleshooting

### No Data Showing

1. Verify your API token has the correct permissions
2. Check that worker names in `lib/projects.ts` match actual Cloudflare worker script names
3. Ensure the account ID is correct
4. Check browser console for API errors

### API Rate Limits

The dashboard caches data for 30 seconds to avoid hitting rate limits. If you need fresher data, adjust the `next: { revalidate: 30 }` value in `lib/cloudflare.ts`.

## License

Private - Minte Internal Tool

## Support

For issues or questions, contact the Minte development team.
