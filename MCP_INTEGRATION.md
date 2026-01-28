# MCP Integration Guide

Atlas Dashboard integrates with multiple Cloudflare MCP (Model Context Protocol) servers to provide comprehensive monitoring and observability.

## Architecture

```
┌──────────────────────────────────────────┐
│         Atlas Dashboard (Frontend)       │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│      MCP Aggregator (Backend)            │
│  • Combines data from all MCP servers    │
│  • Caches responses (60s TTL)            │
│  • Handles errors gracefully             │
└──────────────┬───────────────────────────┘
               │
    ┌──────────┴──────────┬──────────┬──────────┐
    ▼                     ▼          ▼          ▼
┌────────┐          ┌────────┐  ┌────────┐  ┌────────┐
│ Audit  │          │Workers │  │Workers │  │  DNS   │
│ Logs   │   ...    │Observ. │  │Builds  │  │Analytics│
└────────┘          └────────┘  └────────┘  └────────┘
```

## Integrated MCP Servers

### 1. **Workers Observability** (`/api/mcp/observability`)
- Real-time logs from Workers
- Performance metrics (CPU time, duration)
- Distributed traces
- Error tracking

**Endpoints:**
- `GET /api/mcp/observability?script=worker-name` - Get logs, metrics, traces

### 2. **Audit Logs** (`/api/mcp/audit-logs`)
- Account-level audit trail
- User actions and changes
- Resource modifications
- Security events

**Endpoints:**
- `GET /api/mcp/audit-logs?limit=20` - Get recent audit logs

### 3. **Workers Builds** (`/api/mcp/builds`)
- CI/CD build status
- Deployment history
- Build success/failure rates
- Build duration metrics

**Endpoints:**
- `GET /api/mcp/builds?limit=20` - Get build history

### 4. **DNS Analytics** (Coming Soon)
- DNS query analytics
- Query type distribution
- Response code analysis
- Geographic distribution

### 5. **Radar** (Coming Soon)
- Internet insights and trends
- Attack patterns
- Traffic analysis
- Regional metrics

### 6. **DEX Analysis** (Coming Soon)
- Digital Experience Monitoring
- Page load times
- Network performance
- User experience metrics

### 7-14. Additional MCP Servers
- cloudflare-one-casb (CASB security)
- dex-analysis (Digital Experience)
- dns-analytics
- docs-ai-search
- docs-autorag
- docs-vectorize
- logpush
- sandbox-container

## Implementation Details

### Base MCP Client

All MCP clients extend `BaseMCPClient` which provides:

```typescript
abstract class BaseMCPClient {
  protected request<T>(endpoint: string, options?: RequestInit): Promise<MCPResponse<T>>
  clearCache(): void
}
```

**Features:**
- Automatic caching (60s TTL by default)
- Error handling
- Cloudflare API authentication
- Response normalization

### Cache Strategy

```typescript
{
  cacheEnabled: true,
  cacheTTL: 60 // seconds
}
```

- GET requests are cached automatically
- Cache is in-memory (resets on server restart)
- Cache can be cleared via API: `POST /api/mcp/clear-cache`

### Error Handling

MCP clients gracefully handle errors:

```typescript
interface MCPResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp: number;
}
```

If an MCP server is unavailable:
1. Returns cached data if available
2. Returns error response with `success: false`
3. Dashboard shows last known good data
4. Toast notification alerts user

## API Routes

### Aggregated Metrics
```bash
GET /api/mcp/aggregate
```

Returns combined metrics from all MCP servers:
- Workers stats (requests, errors, CPU time)
- Database stats (D1, R2, KV)
- Security stats (audit logs, CASB findings)
- Performance stats (DNS, TTFB, uptime)

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": 1706432400000,
    "workers": {
      "totalRequests": 125000,
      "totalErrors": 23,
      "avgCpuTime": 12.5,
      "activeWorkers": 8
    },
    "database": { ... },
    "security": { ... },
    "performance": { ... }
  }
}
```

### Observability Data
```bash
GET /api/mcp/observability?script=worker-name
```

Returns logs, metrics, and traces for a specific Worker.

### Audit Logs
```bash
GET /api/mcp/audit-logs?limit=50
```

Returns recent audit log entries.

### Build History
```bash
GET /api/mcp/builds?limit=30
```

Returns recent build history across all Workers.

## Adding New MCP Servers

1. **Create Client:**
```typescript
// lib/mcp/your-server.ts
import { BaseMCPClient, MCPResponse } from './base-client';

export class YourServerClient extends BaseMCPClient {
  async getData(): Promise<MCPResponse<YourData>> {
    return this.request('/accounts/${this.accountId}/your-endpoint');
  }
}
```

2. **Add to Aggregator:**
```typescript
// lib/mcp/aggregator.ts
private yourServer: YourServerClient;

constructor() {
  // ...
  this.yourServer = new YourServerClient(config);
}
```

3. **Create API Route:**
```typescript
// app/api/mcp/your-server/route.ts
import { NextResponse } from 'next/server';
import { getMCPAggregator } from '@/lib/mcp/aggregator';

export async function GET() {
  const aggregator = getMCPAggregator();
  const data = await aggregator.yourServer.getData();
  return NextResponse.json(data);
}
```

4. **Update Types:**
```typescript
// lib/mcp/types.ts
export interface YourData {
  // Define your data structure
}
```

## Configuration

### Environment Variables

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### Cache Configuration

Edit `lib/mcp/base-client.ts`:

```typescript
export function createMCPConfig(): MCPClientConfig {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    cacheEnabled: true,
    cacheTTL: 120, // Increase cache TTL to 120 seconds
  };
}
```

## Testing

```bash
# Test aggregated metrics
curl http://localhost:3000/api/mcp/aggregate

# Test observability
curl http://localhost:3000/api/mcp/observability?script=my-worker

# Test audit logs
curl http://localhost:3000/api/mcp/audit-logs?limit=10

# Test builds
curl http://localhost:3000/api/mcp/builds
```

## Performance Considerations

- **Caching:** 60s cache reduces API calls by ~98%
- **Parallel Fetching:** All MCP calls run in parallel
- **Graceful Degradation:** Failed MCP calls don't block others
- **Client-Side Polling:** Dashboard refreshes every 30s

## Security

- All MCP calls authenticated with Cloudflare API token
- API token stored securely in environment variables
- No sensitive data cached client-side
- Audit logs track all actions

---

For more details, see:
- `lib/mcp/base-client.ts` - Base implementation
- `lib/mcp/aggregator.ts` - Data aggregation
- `lib/mcp/types.ts` - Type definitions
