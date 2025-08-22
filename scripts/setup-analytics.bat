@echo off
REM Quick setup script for Bitcoin Benefits Analytics
REM Run this to create your .env.local file with the correct configuration

echo # Google Analytics Configuration > .env.local
echo NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TTJBTRGB7N >> .env.local
echo. >> .env.local
echo # Microsoft Clarity Configuration >> .env.local
echo NEXT_PUBLIC_CLARITY_PROJECT_ID=svem84nwfy >> .env.local
echo. >> .env.local
echo # Site Configuration >> .env.local
echo NEXT_PUBLIC_BASE_URL=https://www.bitcoinbenefits.me >> .env.local
echo NEXT_PUBLIC_API_URL=https://www.bitcoinbenefits.me/api >> .env.local
echo. >> .env.local
echo # Feature Flags >> .env.local
echo NEXT_PUBLIC_ENABLE_ANALYTICS=true >> .env.local
echo NEXT_PUBLIC_ENABLE_COOKIES_BANNER=true >> .env.local
echo. >> .env.local
echo # Development Options >> .env.local
echo NEXT_PUBLIC_ENABLE_CLARITY_DEV=false >> .env.local

echo.
echo ✅ .env.local file created with your Google Analytics ID: G-TTJBTRGB7N
echo 📊 Google Analytics and Microsoft Clarity are now configured!
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Deploy to your hosting platform
echo 3. Verify tracking at: https://analytics.google.com
