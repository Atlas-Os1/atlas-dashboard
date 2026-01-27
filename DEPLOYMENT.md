# Deployment Guide - Atlas Live View

## Prerequisites

Before deploying, you need:

1. **Cloudflare Account** with Workers enabled
2. **Cloudflare API Token** with these permissions:
   - Workers Scripts: Read
   - Account Analytics: Read
   - Workers Scripts: Edit (for deployment)
3. **Wrangler CLI** installed globally

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler.

## Step 3: Create wrangler.toml

Create a `wrangler.toml` file in the project root:

```toml
name = "atlas-dashboard"
main = ".next/server/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = ".next/static"

[vars]
CLOUDFLARE_ACCOUNT_ID = "ff3c5e2beaea9f85fee3200bfe28da16"
```

## Step 4: Set Secrets

Add your Cloudflare API token as a secret:

```bash
cd /home/flo/atlas-dashboard
wrangler secret put CLOUDFLARE_API_TOKEN
```

When prompted, paste your actual API token.

## Step 5: Build for Production

```bash
npm run build
```

## Step 6: Deploy to Cloudflare Workers

### Option A: Using @opennext/cloudflare

1. Install the adapter:
```bash
npm install -D @opennext/cloudflare
```

2. Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

3. Deploy with Wrangler:
```bash
wrangler deploy
```

### Option B: Manual Deployment

If using a different deployment method, follow these steps:

1. Build the Next.js app:
```bash
npm run build
```

2. Deploy the `.next` directory contents to Cloudflare Workers
3. Configure environment variables in the Cloudflare Dashboard

## Step 7: Configure Custom Domain

1. Go to Cloudflare Dashboard
2. Navigate to **Workers & Pages** > **atlas-dashboard**
3. Click **Settings** > **Domains**
4. Click **Add Custom Domain**
5. Enter `atlas.srvcflo.com` or `atlas.minte.dev`
6. Follow the DNS configuration steps

## Step 8: Verify Deployment

1. Visit your deployed URL (e.g., `https://atlas-dashboard.workers.dev`)
2. Or visit your custom domain (e.g., `https://atlas.srvcflo.com`)
3. Check that:
   - Dashboard loads correctly
   - Project cards display
   - Atlas avatar is animated
   - Navigation works
   - Analytics data loads (if API token is valid)

## Environment Variables

The following environment variables are required:

- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID (set in wrangler.toml)
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token (set as secret)

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear the Next.js cache:
```bash
rm -rf .next
```

2. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Try building again:
```bash
npm run build
```

### API Token Issues

If the dashboard shows "No data available":

1. Verify your API token has the correct permissions
2. Check the token in Cloudflare Dashboard > My Profile > API Tokens
3. Ensure the token includes:
   - Workers Scripts: Read
   - Account Analytics: Read

### Worker Script Names

If projects don't show data:

1. Check actual worker names in Cloudflare Dashboard
2. Update `lib/projects.ts` with correct `workerId` values
3. Worker IDs must match the actual script names in Cloudflare

### Deployment Fails

If `wrangler deploy` fails:

1. Check your wrangler version:
```bash
wrangler --version
```

2. Update if needed:
```bash
npm install -g wrangler@latest
```

3. Verify authentication:
```bash
wrangler whoami
```

## Production Checklist

Before going live:

- [ ] Valid Cloudflare API token configured
- [ ] Worker IDs in `lib/projects.ts` match actual workers
- [ ] Custom domain configured and DNS propagated
- [ ] Test all pages (Dashboard, Analytics, Logs, Project details)
- [ ] Verify auto-refresh works
- [ ] Check mobile responsiveness
- [ ] Test dark mode
- [ ] Monitor for errors in Cloudflare Dashboard

## Continuous Deployment

### GitHub Actions (Optional)

You can set up automatic deployments on push to main:

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

2. Add secrets to GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Add `CLOUDFLARE_API_TOKEN`
   - Add `CLOUDFLARE_ACCOUNT_ID`

## Performance Optimization

To optimize performance:

1. **Enable Caching**: The app already caches API responses for 30 seconds
2. **D1 Database**: Consider adding D1 to cache analytics data longer
3. **Edge Locations**: Cloudflare Workers automatically deploy to all edge locations
4. **Image Optimization**: Use Cloudflare Image Resizing if adding images

## Monitoring

After deployment, monitor:

- Worker request analytics in Cloudflare Dashboard
- Error rates and CPU usage
- User access patterns
- API rate limit usage

## Support

For deployment issues, check:

- Cloudflare Workers Documentation: https://developers.cloudflare.com/workers/
- Wrangler Documentation: https://developers.cloudflare.com/workers/wrangler/
- Next.js Documentation: https://nextjs.org/docs
