#!/bin/bash

# Atlas Dashboard Monitoring Script
# Checks for completion and updates status

LOG_FILE="$HOME/atlas-dashboard/MONITOR-LOG.md"
STATE_FILE="$HOME/atlas-dashboard/.monitor-state.json"

check_completion() {
    local current_time=$(date +%s)
    local start_time=$(date -d "2026-01-28 05:10:00" +%s)
    local elapsed=$((current_time - start_time))
    local hours=$((elapsed / 3600))
    
    echo "=== Monitor Check at $(date -u '+%H:%M UTC') ==="
    echo "Elapsed time: ${hours}h $(((elapsed % 3600) / 60))m"
    
    # Check for completion indicators
    cd "$HOME/atlas-dashboard"
    
    # Look for completion markers
    if [ -f "DEPLOYMENT-TEST-REPORT.md" ]; then
        echo "✅ DEPLOYMENT TEST REPORT FOUND - Work appears COMPLETE!"
        return 0
    fi
    
    if [ -f "MORNING-SUMMARY.md" ]; then
        echo "✅ MORNING SUMMARY FOUND - Work appears COMPLETE!"
        return 0
    fi
    
    # Check git for completion commit
    if git log -1 --pretty=format:"%s" | grep -i "complete\|ready\|deploy"; then
        echo "✅ Completion commit found - Work may be COMPLETE!"
        return 0
    fi
    
    # Check recent file modifications
    echo ""
    echo "Recent file changes (last 5 minutes):"
    find . -type f -name "*.tsx" -o -name "*.ts" -mmin -5 2>/dev/null | grep -v node_modules | head -10
    
    echo ""
    echo "📊 Current MCP files:"
    ls -1 lib/mcp/*.ts 2>/dev/null | wc -l
    echo "/14 MCP integrations"
    
    echo ""
    echo "Status: IN PROGRESS ⏳"
    return 1
}

# Main loop
CHECKS=0
MAX_CHECKS=24  # 24 checks * 30 min = 12 hours

while [ $CHECKS -lt $MAX_CHECKS ]; do
    CHECKS=$((CHECKS + 1))
    
    if check_completion; then
        echo ""
        echo "🎉 Work completed! Starting verification phase..."
        exit 0
    fi
    
    if [ $CHECKS -lt $MAX_CHECKS ]; then
        echo ""
        echo "Next check in 30 minutes..."
        echo "================================"
        echo ""
        sleep 1800  # 30 minutes
    fi
done

echo "⚠️  Max monitoring time reached (12 hours)"
echo "Proceeding to verification anyway..."
exit 2
