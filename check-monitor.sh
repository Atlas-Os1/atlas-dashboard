#!/bin/bash

# Check if monitor script is still running and handle completion

MONITOR_PID=$(pgrep -f "monitor.sh" | head -1)

if [ -z "$MONITOR_PID" ]; then
    echo "🎉 Monitor script has exited - work likely COMPLETE!"
    echo ""
    echo "Checking for completion markers..."
    
    cd "$HOME/atlas-dashboard"
    
    if [ -f "DEPLOYMENT-TEST-REPORT.md" ] || [ -f "MORNING-SUMMARY.md" ]; then
        echo "✅ Completion files found!"
        exit 0
    elif git log -1 --pretty=format:"%s" | grep -iq "complete\|ready\|finish"; then
        echo "✅ Completion commit found!"
        exit 0
    else
        echo "⚠️  Monitor exited but no clear completion marker"
        echo "Proceeding to verification anyway..."
        exit 0
    fi
else
    echo "⏳ Monitor still running (PID: $MONITOR_PID)"
    echo "Monitoring session active - waiting for completion..."
    exit 1
fi
