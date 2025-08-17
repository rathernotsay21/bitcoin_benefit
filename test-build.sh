#!/bin/bash

# Quick test build script
echo "Testing Bitcoin Benefit Calculator build..."

cd /Users/rathernotsay/Documents/GitHub/bitcoin_benefit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run type check
echo "Running type check..."
npm run type-check 2>&1 | tail -20

echo ""
echo "Type check complete. Run 'npm run build' to build the full application."
