# 🌳 Atlas Live View - Quick Start

## What You Have

A **fully functional** monitoring dashboard for all your Cloudflare Workers projects.

## 🚀 Get Started in 3 Steps

### 1. Get Your API Token

Go to: https://dash.cloudflare.com/profile/api-tokens

Create a token with these permissions:
- Workers Scripts: **Read**
- Account Analytics: **Read**

Copy the token!

### 2. Configure Environment

```bash
cd /home/flo/atlas-dashboard

# Add your token
nano .env.local
# Replace 'your_api_token_here' with actual token
```

### 3. Run It

```bash
npm run dev
```

Open http://localhost:3000

## ✅ What Works Right Now

- **Dashboard** - Overview of all projects
- **Atlas Avatar** - Animated 🌳 showing system health
- **Project Cards** - Status for each Cloudflare project
- **Analytics** - Charts and metrics
- **Navigation** - Between Dashboard/Analytics/Logs
- **Dark Mode** - Auto-detects system preference
- **Responsive** - Works on mobile/tablet/desktop

## 📍 Where Is Everything?

```
/home/flo/atlas-dashboard/  ← Project root

Key files:
- .env.local              ← Add your API token here
- lib/projects.ts         ← Configure your projects
- README.md              ← Full documentation
- SETUP.md               ← Detailed setup guide
- DEPLOYMENT.md          ← Production deployment
```

## 🎯 Next Steps

### To Use Locally
1. Add API token to `.env.local`
2. `npm run dev`
3. Open http://localhost:3000

### To Deploy to Production
1. Follow instructions in `DEPLOYMENT.md`
2. Deploy to Cloudflare Workers
3. Configure atlas.srvcflo.com domain

## 🆘 Need Help?

- **Setup issues?** → See `SETUP.md`
- **Deployment help?** → See `DEPLOYMENT.md`
- **Want to contribute?** → See `CONTRIBUTING.md`
- **Check status?** → See `PROJECT_STATUS.md`

## 📊 Current Projects Being Monitored

1. **Kiamichi Business Connect** - kiamichibizconnect.com
2. **Twisted Custom Leather** - twistedcustomleather.com
3. **SrvcFlo Platform** - srvcflo.com
4. **Minte Development** - minte.dev

To add more, edit `lib/projects.ts`

## 🔗 Links

- **GitHub:** https://github.com/Atlas-Os1/atlas-dashboard
- **Local:** http://localhost:3000 (when running)
- **Cloudflare:** https://dash.cloudflare.com

## ⚡ Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Run production build
npm run lint   # Check code quality
```

---

**You're all set!** Just add your API token and run `npm run dev` to get started.
