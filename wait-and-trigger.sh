#!/bin/bash

# Wait for completion and trigger Phase 2
# Checks every hour if work is complete

echo "🔄 Starting completion checker..."
echo "Will check every hour for work completion"
echo ""

HOURS=0
MAX_HOURS=14  # 14 hours max wait

while [ $HOURS -lt $MAX_HOURS ]; do
    HOURS=$((HOURS + 1))
    CURRENT_TIME=$(date -u '+%H:%M UTC')
    
    echo "[$CURRENT_TIME] Hour $HOURS check..."
    
    # Check if ANY completion markers exist
    cd "$HOME/atlas-dashboard"
    
    # Check for completion files
    if [ -f "DEPLOYMENT-TEST-REPORT.md" ] || [ -f "MORNING-SUMMARY.md" ]; then
        echo "✅ Completion files found!"
        exit 0
    fi
    
    # Check git for completion
    if git log -1 --pretty=format:"%s" 2>/dev/null | grep -iq "complete\|ready\|deploy.*success"; then
        echo "✅ Completion commit found!"
        exit 0
    fi
    
    # Check if monitors are still running
    if ! pgrep -f "monitor.sh" > /dev/null 2>&1 && ! pgrep -f "master-wait.sh" > /dev/null 2>&1; then
        echo "✅ All monitors exited - work appears complete!"
        exit 0
    fi
    
    # Show current progress
    MCP_COUNT=$(ls lib/mcp/*.ts 2>/dev/null | grep -v types | grep -v base-client | wc -l)
    API_COUNT=$(find app/api/mcp -name "route.ts" 2>/dev/null | wc -l)
    echo "   Progress: $MCP_COUNT MCP clients, $API_COUNT API routes"
    
    # Still waiting
    if [ $HOURS -lt $MAX_HOURS ]; then
        echo "   Status: Still in progress..."
        echo "   Next check in 1 hour"
        echo ""
        sleep 3600  # 1 hour
    fi
done

echo "⏰ Maximum wait time reached"
exit 0
