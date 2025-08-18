#!/bin/bash
echo "Testing color consistency..."
cd /Users/rathernotsay/Documents/GitHub/bitcoin_benefit

# Check for any remaining white backgrounds
echo "Checking for white backgrounds..."
grep -r "bg-white" src/ --include="*.tsx" --include="*.jsx" --include="*.css" || echo "No bg-white found ✅"

# Check for hardcoded white colors
echo "Checking for hardcoded white..."
grep -r "background.*white" src/ --include="*.css" | grep -v "dark:" || echo "No hardcoded white backgrounds ✅"

# Check for proper text colors
echo "Checking text colors..."
grep -r "text-slate-700" src/ --include="*.tsx" --include="*.jsx" | head -5 || echo "No text-slate-700 found"

echo "Build test..."
npm run build 2>&1 | tail -20
