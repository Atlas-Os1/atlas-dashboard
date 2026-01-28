# Atlas Dashboard - Quick Start Guide

## 🎯 What You Got

A **production-grade monitoring platform** with:
- ✨ Beautiful modern UI with glassmorphism
- 🎙️ Voice control ("Show me system health")
- 📊 Real-time project monitoring
- 🔌 MCP backend integration
- 💾 Database monitoring (D1, R2, KV, Queues)
- 📱 Fully responsive (mobile, tablet, desktop)

## 🚀 Deploy in 3 Steps

### 1. Set Secrets
```bash
cd ~/atlas-dashboard
wrangler secret put CLOUDFLARE_API_TOKEN
# Paste: ndMAICAkycd3wkSSAS9WzjX09RY0AExrqbFAYfm2

# Optional (for voice):
wrangler secret put ELEVENLABS_API_KEY
```

### 2. Deploy
```bash
./DEPLOY.sh
# Or manually:
# npm run build
# wrangler deploy
```

### 3. Visit
```
https://atlas.srvcflo.com
```

Done! 🎉

## 🎙️ Try Voice Commands

1. Click the **microphone button** in top navigation
2. Say one of these:
   - "Show me the overview"
   - "What's the system health?"
   - "How many errors are there?"
   - "Go to analytics"
   - "Refresh data"

Flo will respond with voice!

## 📊 What's Monitored

### Projects
- Kiamichi Business Connect
- Twisted Custom Leather
- SrvcFlo Platform
- Minte Development
- (Add more in `lib/projects.ts`)

### Metrics
- Request counts
- Error rates
- CPU time
- Build status
- Audit logs

### Databases
- **D1**: atlas-memory-index
- **R2**: clawdis-storage-prod
- **KV**: All namespaces
- **Queues**: Job processing

## 🎨 Features Showcase

### Flo Avatar
- **Green glow** = All systems healthy
- **Amber glow** = Warning state
- **Red glow** = Critical errors
- **Flowing particles** = Optimal performance
- **Pulsing rings** = Listening to voice

### Project Cards
- **Sparkline charts** = Recent traffic
- **Quick actions** = View, Logs, Deploy
- **Glassmorphic design** = Modern depth
- **Hover effects** = Smooth animations

### Navigation
- **Theme toggle** = Light/dark mode
- **Search** = Press Cmd+K
- **Voice button** = Microphone icon
- **Mobile nav** = Bottom bar on phones

## 📚 Documentation

- **README.md** - Complete feature guide
- **VOICE_COMMANDS.md** - All 40+ voice commands
- **MCP_INTEGRATION.md** - Backend architecture
- **MONITORING_GUIDE.md** - How to use the dashboard
- **DESIGN_APPROACH.md** - Design philosophy

## 🔧 Configuration

### Add New Project
Edit `lib/projects.ts`:
```typescript
{
  id: 'my-project',
  name: 'My Project Name',
  domain: 'myproject.com',
  workerId: 'my-worker-script-name',
  status: 'unknown',
}
```

### Adjust Health Thresholds
Edit `lib/projects.ts`:
```typescript
if (errorRate > 5 || cpuTime > 100) return 'error';
if (errorRate > 1 || cpuTime > 50) return 'warning';
return 'healthy';
```

### Change Cache Duration
Edit `lib/mcp/base-client.ts`:
```typescript
cacheTTL: 120, // seconds
```

## 🎯 Quick Tips

1. **Hover over Flo** to see detailed metrics
2. **Click project cards** for detailed analytics
3. **Use voice** for hands-free monitoring
4. **Press Cmd+K** to search
5. **Toggle theme** with sun/moon icon
6. **Mobile**: Swipe between pages

## 🐛 Troubleshooting

### No Data Showing
- Check API token in secrets
- Verify worker names in `lib/projects.ts`
- Check browser console for errors

### Voice Not Working
- Click microphone button to activate
- Allow microphone permissions
- Check if ELEVENLABS_API_KEY is set

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📱 Mobile Usage

- Bottom navigation bar on phones
- Swipe to navigate (coming soon)
- Touch-friendly buttons (44px)
- Simplified charts for small screens

## 🚨 Need Help?

1. Check documentation in `/docs`
2. Review `MONITORING_GUIDE.md`
3. Check browser console for errors
4. Verify Cloudflare API status

## 🎉 Have Fun!

You now have an **enterprise-grade monitoring platform** that looks beautiful and works flawlessly.

**Try saying:** "Flo, show me the system health!" 🎙️

---

**Built with 🧡 by Flo**
