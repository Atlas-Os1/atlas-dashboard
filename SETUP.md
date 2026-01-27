# Quick Setup Guide

## 1. Get Your Cloudflare API Token

### Creating the API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Click **Create Custom Token**
4. Configure the token:

   **Token name:** `atlas-dashboard`
   
   **Permissions:**
   - Account > Workers Scripts > Read
   - Account > Account Analytics > Read
   - Zone > Zone > Read (optional)
   
   **Account Resources:**
   - Include > Specific account > Select your account
   
   **Zone Resources:**
   - Include > All zones (or select specific zones)
   
5. Click **Continue to summary**
6. Click **Create Token**
7. **IMPORTANT:** Copy the token immediately - you won't see it again!

### Alternative: Use Existing Token

If you already have a token with the right permissions, you can use that instead.

To check existing tokens:
- Go to https://dash.cloudflare.com/profile/api-tokens
- Review permissions of existing tokens

## 2. Local Development Setup

### Quick Start

```bash
cd /home/flo/atlas-dashboard

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local and add your actual API token
nano .env.local
# or
code .env.local

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

### Environment Variables

Your `.env.local` should look like:

```env
CLOUDFLARE_ACCOUNT_ID=ff3c5e2beaea9f85fee3200bfe28da16
CLOUDFLARE_API_TOKEN=your_actual_token_here_not_placeholder
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

**Replace `your_actual_token_here_not_placeholder` with the token you created!**

## 3. Verify Setup

1. Start the dev server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. You should see:
   - The Atlas avatar (🌳) in the center
   - Project cards for all monitored projects
   - Worker analytics charts (if workers exist)
   - Activity feed

### Troubleshooting "No Data"

If you see "No data available" or empty charts:

**Check 1: API Token**
- Make sure you pasted the actual token, not the placeholder
- Verify the token hasn't expired
- Check permissions in Cloudflare Dashboard

**Check 2: Worker Names**
- Open `lib/projects.ts`
- Verify `workerId` values match your actual Cloudflare worker script names
- Check your workers at: https://dash.cloudflare.com/workers

**Check 3: Account ID**
- Verify the account ID in `.env.local` is correct
- Find your account ID at: https://dash.cloudflare.com/ (in the URL or sidebar)

**Check 4: Console Errors**
- Open browser DevTools (F12)
- Check Console tab for API errors
- Look for 401 (auth error) or 404 (not found) errors

## 4. Customize for Your Projects

### Update Project List

Edit `lib/projects.ts`:

```typescript
export const KNOWN_PROJECTS: Project[] = [
  {
    id: 'your-project-id',        // Unique ID for routing
    name: 'Your Project Name',    // Display name
    domain: 'yourproject.com',    // Domain name
    workerId: 'your-worker-id',   // MUST match Cloudflare worker script name
    status: 'unknown',
  },
  // ... add more projects
];
```

**Important:** The `workerId` must exactly match the script name in Cloudflare:
- Go to https://dash.cloudflare.com/workers
- Copy the exact script name
- Paste as `workerId` in the config

### Find Your Worker Script Names

```bash
# Using Wrangler CLI (if installed)
wrangler list

# Or check in Cloudflare Dashboard:
# https://dash.cloudflare.com/workers
```

## 5. Test Everything

### Local Testing Checklist

- [ ] Dashboard loads at http://localhost:3000
- [ ] Atlas avatar animates
- [ ] Project cards show with correct names
- [ ] Analytics data populates (if workers exist)
- [ ] Activity feed shows recent events
- [ ] Click on a project card → detail page works
- [ ] Navigation works (Dashboard, Analytics, Logs)
- [ ] Refresh button works
- [ ] No console errors

### If Using Real Workers

If you have actual Cloudflare Workers deployed:

- [ ] Verify request counts are accurate
- [ ] Check error rates match reality
- [ ] Confirm CPU time metrics display
- [ ] Test that data updates on refresh

## 6. Common Issues

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Issue: API returns 401 Unauthorized

**Solution:**
- Your API token is invalid or expired
- Create a new token following Step 1
- Update `.env.local` with the new token
- Restart the dev server

### Issue: API returns 404 Not Found

**Solution:**
- Worker script name doesn't exist
- Check `workerId` in `lib/projects.ts`
- Verify actual worker names in Cloudflare Dashboard
- Update config with correct names

### Issue: "No analytics data"

**Solution:**
- Workers might not have received any requests yet
- Check if workers are deployed and receiving traffic
- Analytics might take a few minutes to populate
- Try refreshing after some time

### Issue: Build fails

**Solution:**
```bash
# Clear everything and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

## 7. Ready to Deploy?

Once local development works, see [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Need Help?

1. Check the [README.md](./README.md) for general info
2. See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
3. Review Cloudflare Workers docs: https://developers.cloudflare.com/workers/
4. Check Next.js docs: https://nextjs.org/docs
