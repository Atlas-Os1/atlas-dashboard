#!/bin/bash

# Master wait loop - checks monitor status every 30 minutes

echo "🔍 Master Monitor Loop Started"
echo "================================"
echo ""

CHECK_COUNT=0
MAX_CHECKS=24  # 12 hours max

while [ $CHECK_COUNT -lt $MAX_CHECKS ]; do
    CHECK_COUNT=$((CHECK_COUNT + 1))
    CURRENT_TIME=$(date -u '+%H:%M UTC')
    
    echo "[$CURRENT_TIME] Check #$CHECK_COUNT/$MAX_CHECKS"
    
    # Run the monitor checker
    if ~/atlas-dashboard/check-monitor.sh; then
        echo ""
        echo "✅ WORK COMPLETE DETECTED!"
        echo "Proceeding to Phase 2: Testing & Verification"
        exit 0
    fi
    
    # Monitor still running, wait 30 minutes
    if [ $CHECK_COUNT -lt $MAX_CHECKS ]; then
        echo "Sleeping for 30 minutes until next check..."
        echo ""
        sleep 1800
    fi
done

echo "⚠️  Maximum wait time reached (12 hours)"
echo "Proceeding to verification phase anyway..."
exit 2
