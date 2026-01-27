#!/bin/bash
# Atlas Live View - First Run Helper Script

echo "🌳 Atlas Live View - First Run Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "📝 Creating from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your Cloudflare API token"
    echo "   Get token at: https://dash.cloudflare.com/profile/api-tokens"
    echo ""
    read -p "Press Enter to edit .env.local now (or Ctrl+C to exit)..."
    ${EDITOR:-nano} .env.local
fi

echo ""
echo "🔍 Checking environment configuration..."

# Check if API token is set
if grep -q "your_api_token_here" .env.local; then
    echo "⚠️  Warning: .env.local still contains placeholder API token"
    echo "   You need to replace 'your_api_token_here' with a real token"
    echo ""
    read -p "Do you want to edit .env.local now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env.local
    fi
fi

echo ""
echo "📦 Checking dependencies..."

if [ ! -d node_modules ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Ready to start!"
echo ""
echo "Commands:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build for production"
echo "  npm run start  - Run production build"
echo ""
read -p "Start development server now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🌟 Starting Atlas Live View..."
    echo "   Open http://localhost:3000 in your browser"
    echo ""
    npm run dev
fi
