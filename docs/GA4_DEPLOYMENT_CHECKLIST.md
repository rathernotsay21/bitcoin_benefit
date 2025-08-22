# Google Analytics Deployment Checklist

## Pre-Deployment

- [ ] Create GA4 property at [analytics.google.com](https://analytics.google.com)
- [ ] Get your Measurement ID (G-XXXXXXXXXX)
- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_ID_HERE
  ```

## Deployment Steps

1. **Test Locally**
   ```bash
   npm run build
   npm run start
   ```

2. **Deploy to Production**
   ```bash
   git add .
   git commit -m "Add Google Analytics 4 integration"
   git push origin main
   ```

3. **Add Environment Variable on Hosting Platform**
   
   **For Vercel:**
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-YOUR_ID_HERE`
   - Redeploy
   
   **For Netlify:**
   - Go to Site Settings → Environment Variables
   - Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-YOUR_ID_HERE`
   - Trigger redeploy

## Post-Deployment Verification

- [ ] Visit site and check GA4 Real-time reports
- [ ] Verify events in Debug View
- [ ] Test calculator tracking
- [ ] Check page view tracking
- [ ] Confirm cookie consent works

## Important URLs

- **Your Site**: https://www.bitcoinbenefits.me
- **GA4 Dashboard**: https://analytics.google.com
- **Debug View**: Admin → Debug View in GA4
- **Real-time**: Reports → Real-time

## Support

For issues, check:
1. Browser console for errors
2. GA4 Debug View for event details
3. Network tab for GA requests
