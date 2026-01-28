#!/bin/bash
# Atlas Dashboard Deployment Script
# Run this to deploy to Cloudflare Workers

set -e

echo "🚀 Atlas Dashboard Deployment"
echo "=============================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the atlas-dashboard directory"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

echo "✅ Prerequisites checked"
echo ""

# Build the project
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful"
echo ""

# Check if secrets are set
echo "🔐 Checking secrets..."
echo "Note: You need to set these secrets if not already done:"
echo "  - CLOUDFLARE_API_TOKEN"
echo "  - ELEVENLABS_API_KEY (optional)"
echo ""
read -p "Have you set the secrets? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting secrets now..."
    echo ""
    echo "Enter CLOUDFLARE_API_TOKEN:"
    wrangler secret put CLOUDFLARE_API_TOKEN
    
    echo ""
    read -p "Do you want to add ELEVENLABS_API_KEY? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Enter ELEVENLABS_API_KEY:"
        wrangler secret put ELEVENLABS_API_KEY
    fi
fi

echo ""
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Configuring custom domain..."
wrangler custom-domains add atlas.srvcflo.com || echo "Note: Domain may already be configured"

echo ""
echo "=============================="
echo "✨ Deployment Complete! ✨"
echo "=============================="
echo ""
echo "Your dashboard is now live at:"
echo "  🔗 https://atlas.srvcflo.com"
echo ""
echo "Next steps:"
echo "  1. Visit https://atlas.srvcflo.com"
echo "  2. Test the voice commands"
echo "  3. Explore the MCP integrations"
echo "  4. Monitor your projects!"
echo ""
echo "Documentation:"
echo "  📖 README.md - Getting started"
echo "  🎙️ VOICE_COMMANDS.md - Voice control guide"
echo "  🔌 MCP_INTEGRATION.md - MCP server docs"
echo "  📊 MONITORING_GUIDE.md - Monitoring guide"
echo ""
echo "Happy monitoring! 🎉"
