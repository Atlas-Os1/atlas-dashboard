# Contributing to Atlas Live View

## Development Workflow

### Adding a New Project

1. Open `lib/projects.ts`
2. Add your project to the `KNOWN_PROJECTS` array:
```typescript
{
  id: 'project-slug',           // URL-friendly ID
  name: 'Project Display Name',
  domain: 'project.com',
  workerId: 'worker-script-name', // Must match Cloudflare
  status: 'unknown',
}
```

### Adding New Metrics

To add new analytics metrics:

1. **Update Types** (`types/index.ts`):
```typescript
export interface WorkerAnalytics {
  // Add new field
  newMetric: number;
}
```

2. **Update API Client** (`lib/cloudflare.ts`):
```typescript
async getWorkerAnalytics(scriptName: string): Promise<AnalyticsData | null> {
  // Fetch new metric from API
  const result = await this.fetch<AnalyticsData>(
    `/accounts/${ACCOUNT_ID}/workers/scripts/${scriptName}/analytics`
  );
  return result;
}
```

3. **Update Components** (e.g., `components/worker-analytics-chart.tsx`):
```typescript
// Display new metric
<Bar dataKey="newMetric" fill="#10b981" name="New Metric" />
```

### Adding New Pages

1. Create page in `app/` directory:
```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

2. Add to navigation (`components/navigation.tsx`):
```typescript
const links = [
  // ...
  { href: '/new-page', label: 'New Page', icon: SomeIcon },
];
```

## Code Style

### TypeScript

- Use strict TypeScript - no `any` types
- Define interfaces for all data structures
- Use async/await over promises
- Handle errors gracefully

### React Components

- Use functional components
- Prefer `'use client'` directive only when needed (interactivity)
- Server components by default for data fetching
- Use Suspense for loading states

### Styling

- Tailwind CSS utility classes
- Dark mode support with `dark:` prefix
- Responsive design with `md:`, `lg:` breakpoints
- Use Framer Motion for animations

### File Organization

```
app/              # Next.js pages (App Router)
components/       # React components
lib/             # Utilities and services
types/           # TypeScript interfaces
public/          # Static assets (if needed)
```

## Testing Locally

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Lint code
npm run lint
```

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

Examples:
```
feat: Add CPU time trend chart
fix: Correct error rate calculation
docs: Update deployment instructions
refactor: Extract API client to separate service
```

## Pull Requests

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Commit with descriptive messages

4. Push to your fork:
```bash
git push origin feature/your-feature-name
```

5. Open a PR on GitHub

## Performance Guidelines

### API Calls

- Use Next.js `revalidate` for caching:
```typescript
fetch(url, {
  next: { revalidate: 30 } // Cache for 30 seconds
})
```

- Batch API calls with `Promise.all()`
- Handle rate limits gracefully

### Component Optimization

- Use React.memo for expensive components
- Lazy load heavy components
- Optimize images (use next/image if adding images)

### Build Size

- Keep bundle size minimal
- Use dynamic imports for large dependencies
- Monitor build output for size warnings

## Future Enhancements

Ideas for future development:

### High Priority

- [ ] Real-time log streaming (SSE or WebSockets)
- [ ] D1 database integration for caching
- [ ] Alert system (email/webhook on errors)
- [ ] Historical data visualization

### Medium Priority

- [ ] User authentication (if multi-tenant)
- [ ] Custom date range selection
- [ ] Export analytics to CSV
- [ ] Worker deployment trigger from dashboard

### Low Priority

- [ ] Mobile app version
- [ ] Slack/Discord notifications
- [ ] Custom dashboard themes
- [ ] Widget system for customization

## Dependencies

### Adding New Dependencies

Be mindful of bundle size:

```bash
# Check bundle impact
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Analyze
ANALYZE=true npm run build
```

### Current Dependencies

**Production:**
- next - React framework
- react/react-dom - UI library
- framer-motion - Animations
- recharts - Charts
- lucide-react - Icons
- date-fns - Date utilities

**Development:**
- typescript - Type safety
- tailwindcss - Styling
- eslint - Code quality

## Debugging

### Enable Verbose Logging

Add to `lib/cloudflare.ts`:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('API Request:', endpoint);
  console.log('Response:', data);
}
```

### Check Build Output

```bash
# See what's being generated
npm run build

# Check static/dynamic rendering
# Look for ○ (Static) vs ƒ (Dynamic) in build output
```

### Debug API Issues

Add logging to API client:

```typescript
private async fetch<T>(endpoint: string): Promise<T> {
  console.log('Fetching:', endpoint);
  const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
    headers: this.headers,
  });
  console.log('Status:', response.status);
  // ...
}
```

## Common Development Tasks

### Update Health Thresholds

Edit `lib/projects.ts`:

```typescript
export function determineProjectStatus(
  errorRate: number,
  cpuTime: number
): 'healthy' | 'warning' | 'error' {
  // Adjust these thresholds
  if (errorRate > 5 || cpuTime > 100) {
    return 'error';
  } else if (errorRate > 1 || cpuTime > 50) {
    return 'warning';
  }
  return 'healthy';
}
```

### Change Refresh Interval

Edit `.env.local`:

```env
NEXT_PUBLIC_REFRESH_INTERVAL=15000  # 15 seconds instead of 30
```

### Customize Colors

Edit components to change color schemes:

```typescript
// components/atlas-avatar.tsx
const getColor = () => {
  switch (health.overall) {
    case 'healthy':
      return '#your-color'; // Change here
    // ...
  }
}
```

## Questions?

- Check existing issues on GitHub
- Review the documentation files
- Ask in team chat
- Create a new issue with questions

## License

This is a private internal tool. All contributions remain property of Minte.
