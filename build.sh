#!/bin/bash

# Build script for Bitcoin Benefit Calculator
echo "Building Bitcoin Benefit Calculator..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies if needed
echo "Checking dependencies..."
npm install

# Run type checking
echo "Running type check..."
npm run type-check || true

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "You can now:"
    echo "1. Run locally: npm run dev"
    echo "2. Deploy to Netlify: npm run deploy"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
