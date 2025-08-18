#!/bin/bash

echo "Rebuilding styles with new color palette..."

cd /Users/rathernotsay/Documents/GitHub/bitcoin_benefit

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf .next 2>/dev/null

# Rebuild CSS
echo "Rebuilding CSS and application..."
npm run build

echo "Build complete. Please restart your development server with 'npm run dev'"
