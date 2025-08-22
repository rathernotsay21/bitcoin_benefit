#!/bin/bash

# Quick setup script for Bitcoin Benefits Analytics
# Run this to create your .env.local file with the correct configuration

cat > .env.local << EOL
# Google Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TTJBTRGB7N

# Microsoft Clarity Configuration  
NEXT_PUBLIC_CLARITY_PROJECT_ID=svem84nwfy

# Site Configuration
NEXT_PUBLIC_BASE_URL=https://www.bitcoinbenefits.me
NEXT_PUBLIC_API_URL=https://www.bitcoinbenefits.me/api

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COOKIES_BANNER=true

# Development Options
NEXT_PUBLIC_ENABLE_CLARITY_DEV=false
EOL

echo "✅ .env.local file created with your Google Analytics ID: G-TTJBTRGB7N"
echo "📊 Google Analytics and Microsoft Clarity are now configured!"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. Deploy to your hosting platform"
echo "3. Verify tracking at: https://analytics.google.com"
