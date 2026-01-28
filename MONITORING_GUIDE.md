# Monitoring Guide

Complete guide to monitoring your Cloudflare projects with Atlas Dashboard.

## Dashboard Overview

### Flo Avatar - System Health Indicator

The animated Flo avatar at the center of your dashboard provides at-a-glance health status:

**Visual Indicators:**
- **Glow Color:**
  - 🟢 Green = Healthy (all systems operational)
  - 🟡 Amber = Warning (degraded performance)
  - 🔴 Red = Critical (errors detected)
  
- **Pulse Speed:**
  - Fast pulse = Healthy, responsive system
  - Slow pulse = System under stress
  
- **Particles:**
  - Flowing particles = Optimal performance
  - Fewer particles = Degraded state
  - No particles = Critical issues

**Hover Details:**
- Avg CPU Time
- Total Requests
- Error Rate
- Active Projects

### Quick Stats

Three key metrics displayed prominently:

1. **Total Requests**: Aggregate request count across all Workers
2. **Avg CPU Time**: Average execution time (lower is better)
3. **Active Alerts**: Number of projects with warnings/errors

## Project Cards

Each project displays:

### Status Indicator
- Pulsing dot with health color
- Border glow matching status

### Sparkline Chart
- Last 12 data points
- Visual trend indicator
- Hover for exact values

### Metrics
- **Requests/min**: Current traffic rate
- **Error Rate**: Percentage of failed requests
- **Trend**: Up/down arrow showing direction

### Quick Actions (Hover)
- 👁️ **View Details**: Full project analytics
- 📄 **View Logs**: Jump to log viewer
- ⚡ **Deploy**: Trigger deployment

## Analytics Page

### Request Chart
- Line chart showing request volume over time
- Color-coded by project
- Interactive tooltips
- Time range selector

### Error Rate Chart
- Stacked area chart
- Threshold indicators
- Anomaly detection

### CPU Time Chart
- Performance trends
- P50, P95, P99 percentiles
- Comparison across projects

### Filters
- Date range picker
- Project selector
- Metric type toggle

## Logs Page

### Real-Time Logs
- Terminal-style viewer
- Syntax highlighting by log level
- Auto-scroll (toggleable)

### Log Levels
- 🔵 **DEBUG**: Detailed diagnostic info
- 🟢 **INFO**: General informational messages
- 🟡 **WARN**: Warning conditions
- 🔴 **ERROR**: Error conditions

### Features
- Search/filter logs
- Copy to clipboard
- Download logs
- Timestamp display
- Project filtering

## Database Monitoring

### D1 Database
Monitor your D1 SQL databases:
- **Total Files**: Number of indexed files
- **Chunks**: Data chunk count
- **Embeddings**: Vector embedding count
- **Size**: Total database size

**Use Case:** Track memory index growth, query performance

### R2 Storage
Track object storage:
- **Objects**: Total object count
- **Size**: Storage used
- **Bandwidth**: Egress/ingress rates
- **Recent Uploads**: Activity in last hour

**Use Case:** Monitor storage costs, identify large objects

### KV Namespaces
Key-value store metrics:
- **Keys**: Total key count per namespace
- **Size**: Storage per namespace
- **Operations**: Read/write rates

**Use Case:** Cache hit rates, data freshness

### Task Queues
Job processing status:
- **Active Jobs**: Currently processing
- **Pending**: Waiting in queue
- **Completed**: Today's successful jobs
- **Failed**: Jobs needing attention

**Use Case:** Identify bottlenecks, retry failed jobs

## Voice Commands

Activate voice control with the microphone button.

### Common Commands

**Navigation:**
- "Show me the overview"
- "Go to analytics"
- "Open logs"
- "Show database"

**Queries:**
- "What's the system health?"
- "How many errors are there?"
- "What's the error rate?"

**Actions:**
- "Refresh data"
- "Deploy [project-name]"

See [VOICE_COMMANDS.md](VOICE_COMMANDS.md) for full reference.

## Alerts and Notifications

### Alert Conditions

**Critical:**
- Error rate > 5%
- Any project in error state
- Build failures

**Warning:**
- Error rate > 1%
- CPU time > threshold
- Multiple projects degraded

### Alert Actions
1. Visual: Flo avatar turns red/amber
2. Dashboard: Alert badge on navigation
3. Voice: Flo announces critical issues
4. (Future) Email/Slack notifications

## Best Practices

### Regular Monitoring
- Check dashboard 2-3 times daily
- Review error trends weekly
- Audit logs monthly

### Performance Optimization
- Monitor CPU time trends
- Identify slow endpoints
- Optimize high-traffic routes

### Cost Management
- Track R2 bandwidth usage
- Monitor KV operation counts
- Optimize D1 query patterns

### Security
- Review audit logs regularly
- Check for unusual access patterns
- Monitor CASB findings

## Troubleshooting

### High Error Rates
1. Check logs for error messages
2. Review recent deployments
3. Check external dependencies
4. Verify API keys/secrets

### Slow Performance
1. Check CPU time metrics
2. Identify slow database queries
3. Review external API calls
4. Check for memory leaks

### Build Failures
1. Review build logs
2. Check syntax errors
3. Verify dependencies
4. Test locally first

### Missing Data
1. Verify MCP servers are responding
2. Check Cloudflare API status
3. Clear cache and refresh
4. Check API token permissions

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: Open search
- `R`: Refresh data
- `V`: Toggle voice control
- `T`: Toggle theme
- `Esc`: Close modals

## Mobile Usage

### Optimizations
- Bottom navigation bar
- Swipe gestures
- Simplified charts (sparklines)
- Touch-friendly buttons (44px min)

### Tips
- Rotate to landscape for charts
- Pinch to zoom on sparklines
- Pull to refresh on main page

---

## Getting Help

- **Documentation**: Check `/docs` folder
- **Voice Commands**: See [VOICE_COMMANDS.md](VOICE_COMMANDS.md)
- **MCP Integration**: See [MCP_INTEGRATION.md](MCP_INTEGRATION.md)
- **Issues**: Check logs first, then contact support

---

**Pro Tip:** Use voice commands for hands-free monitoring while working on other tasks!
