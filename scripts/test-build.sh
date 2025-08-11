#!/bin/bash

# Bitcoin Benefit - Build Test Script
# Tests the build configuration locally before deployment

echo "🚀 Testing Bitcoin Benefit Build Configuration"
echo "============================================="

# Check Node.js version
echo "📋 Node.js Version Check:"
node_version=$(node -v)
echo "   Current: $node_version"
echo "   Required: v20.x.x"

if [[ ! "$node_version" =~ ^v20\. ]]; then
    echo "⚠️  Warning: Node.js version may not match production"
fi

echo ""

# Check for critical files
echo "📂 Critical Files Check:"
critical_files=(
    "next.config.js"
    "package.json"
    "src/app/page.tsx"
    "src/app/calculator/page.tsx"
    "src/app/historical/page.tsx"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
        exit 1
    fi
done

echo ""

# Check lint status
echo "🔍 Linting Check:"
if npm run lint --silent; then
    echo "   ✅ No lint errors"
else
    echo "   ❌ Lint errors found"
    exit 1
fi

echo ""

# Test build
echo "🏗️  Build Test:"
echo "   Running: npm run build"

if NODE_OPTIONS='--max-old-space-size=4096' npm run build; then
    echo "   ✅ Build successful"
    
    # Check build output
    if [ -d ".next" ]; then
        echo "   ✅ Build output directory created"
        
        # Check for key output files
        if [ -f ".next/BUILD_ID" ]; then
            echo "   ✅ Build ID generated"
        fi
        
        if [ -d ".next/static" ]; then
            echo "   ✅ Static assets generated"
        fi
    else
        echo "   ❌ Build output directory missing"
        exit 1
    fi
    
    echo ""
    echo "🎉 Build test completed successfully!"
    echo "   Ready for Netlify deployment"
    
else
    echo "   ❌ Build failed"
    echo ""
    echo "💡 Troubleshooting Tips:"
    echo "   • Check Next.js configuration"
    echo "   • Verify all imports are correct"
    echo "   • Review package.json dependencies"
    exit 1
fi
