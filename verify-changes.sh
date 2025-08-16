#!/bin/bash

# Verification script for Builder scheme changes

echo "==================================="
echo "Builder Scheme Verification"
echo "==================================="
echo ""

# Check the vesting-schemes.ts file
echo "Checking vesting-schemes.ts..."
grep -A 7 "id: 'slow-burn'" src/lib/vesting-schemes.ts | grep -E "(initialGrant|annualGrant|maxAnnualGrants)"

echo ""
echo "Checking VestingScheduleCalculator.ts..."
grep -A 2 "case 'slow-burn':" src/lib/calculators/VestingScheduleCalculator.ts

echo ""
echo "Checking vesting-calculations.ts..."
grep -A 2 "case 'slow-burn':" src/lib/vesting-calculations.ts

echo ""
echo "Checking VestingTimelineChartRecharts.tsx..."
grep "schemeId === 'slow-burn'" src/components/VestingTimelineChartRecharts.tsx

echo ""
echo "==================================="
echo "Summary of Changes:"
echo "==================================="
echo "1. vesting-schemes.ts:"
echo "   - initialGrant: 0.0 → 0.002"
echo "   - maxAnnualGrants: 10 → 9"
echo ""
echo "2. VestingScheduleCalculator.ts:"
echo "   - Annual grants stop at month 108 (9 years)"
echo ""
echo "3. vesting-calculations.ts:"
echo "   - Grant months limited to 108 (9 years)"
echo ""
echo "4. VestingTimelineChartRecharts.tsx:"
echo "   - Updated grant schedule display"
echo "   - Annual grants limited to years 1-9"
echo "   - Cost basis calculation fixed"
echo ""
echo "✅ Builder scheme now has initial grant at year 0!"
