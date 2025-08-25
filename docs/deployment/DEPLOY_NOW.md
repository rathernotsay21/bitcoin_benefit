# 🚀 Quick Deploy Commands

## Your Analytics IDs
```
Google Analytics: G-TTJBTRGB7N
Microsoft Clarity: svem84nwfy
```

## 1. Setup Environment (Run ONE of these)
```bash
# Mac/Linux
./scripts/setup-analytics.sh

# Windows
scripts\setup-analytics.bat

# Manual - Create .env.local with:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TTJBTRGB7N
NEXT_PUBLIC_CLARITY_PROJECT_ID=svem84nwfy
NEXT_PUBLIC_BASE_URL=https://www.bitcoinbenefits.me
```

## 2. Build & Deploy
```bash
npm run build
git add .
git commit -m "Add Google Analytics G-TTJBTRGB7N"
git push
```

## 3. Add to Hosting Platform

### Vercel
```
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-TTJBTRGB7N
NEXT_PUBLIC_CLARITY_PROJECT_ID = svem84nwfy
```

### Netlify
```
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-TTJBTRGB7N
NEXT_PUBLIC_CLARITY_PROJECT_ID = svem84nwfy
```

## 4. Verify
- GA4: https://analytics.google.com (Real-time)
- Clarity: https://clarity.microsoft.com (Sessions)

✅ Ready to deploy!
