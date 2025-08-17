#!/bin/bash

echo "🔄 Rebuilding Bitcoin Benefit App..."
echo ""

# Kill existing Next.js processes
echo "📋 Stopping existing processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "next start" 2>/dev/null

# Clear Next.js cache
echo "🧹 Clearing cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear browser cache notice
echo ""
echo "⚠️  IMPORTANT: Clear your browser cache!"
echo "   Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)"
echo "   Then select 'Cached images and files' and clear"
echo ""

# Rebuild
echo "🔨 Building app..."
npm run build

# Start in development mode with fallback prices
echo "🚀 Starting app with fallback prices enabled..."
echo "   This will use cached prices to avoid API rate limits"
echo ""
npm run dev

echo ""
echo "✅ App rebuilt and running at http://localhost:3000"
echo "   Using fallback prices (no API calls)"
