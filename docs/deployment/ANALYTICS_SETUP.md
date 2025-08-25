# Analytics Configuration Complete! 🎉

## Your IDs
- **Google Analytics ID**: `G-TTJBTRGB7N` ✅
- **Microsoft Clarity ID**: `svem84nwfy` ✅
- **Website**: https://www.bitcoinbenefits.me

## Quick Setup (Choose your OS)

### Mac/Linux:
```bash
./scripts/setup-analytics.sh
```

### Windows:
```cmd
scripts\setup-analytics.bat
```

### Manual Setup:
Create `.env.local` file in your project root with:

```env
# Google Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TTJBTRGB7N

# Microsoft Clarity Configuration  
NEXT_PUBLIC_CLARITY_PROJECT_ID=svem84nwfy

# Site Configuration
NEXT_PUBLIC_BASE_URL=https://www.bitcoinbenefits.me

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COOKIES_BANNER=true
```

## Deploy Instructions

### 1. Local Test
```bash
npm run build
npm run start
# Visit http://localhost:3000
```

### 2. Deploy to Vercel
```bash
vercel --prod
```
Then add environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-TTJBTRGB7N`
- Add `NEXT_PUBLIC_CLARITY_PROJECT_ID` = `svem84nwfy`

### 3. Deploy to Netlify
```bash
git push origin main
```
Then add environment variables in Netlify:
- Site Settings → Environment Variables
- Add both GA and Clarity IDs

## Verify Installation

### Google Analytics
1. Visit your site: https://www.bitcoinbenefits.me
2. Check GA4 Real-time: https://analytics.google.com
3. You should see yourself as an active user

### Microsoft Clarity
1. Visit: https://clarity.microsoft.com
2. Select your project
3. Check for active sessions

## What's Being Tracked

### Automatic Events
- Page views (all routes)
- Calculator interactions
- Tool usage
- Scroll depth
- Time on page
- Form submissions
- Error tracking

### Custom Events
- `calculator_started` - When user begins calculation
- `calculation_completed` - When results are shown
- `bitcoin_tool_used` - Tool interactions
- `engagement_milestone` - Time/scroll milestones

## Troubleshooting

**Not seeing data?**
1. Check browser console for errors
2. Verify IDs are correct in `.env.local`
3. Clear cache and rebuild: `npm run build`
4. Check ad blockers aren't blocking

**Events not firing?**
1. Open GA4 Debug View
2. Install GA Debugger extension
3. Check Network tab for GA requests

## Support

- GA4 Dashboard: https://analytics.google.com
- Clarity Dashboard: https://clarity.microsoft.com
- Your GA ID: `G-TTJBTRGB7N`
- Your Clarity ID: `svem84nwfy`

---
Last Updated: December 2024
