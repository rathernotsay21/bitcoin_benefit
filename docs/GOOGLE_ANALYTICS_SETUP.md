# Google Analytics 4 Setup Guide

## Quick Setup Instructions

### 1. Google Analytics Platform Setup

1. **Go to Google Analytics**
   - Visit [analytics.google.com](https://analytics.google.com)
   - Sign in with your Google account

2. **Create a GA4 Property**
   - Click "Admin" (gear icon) in bottom left
   - Click "Create Property"
   - Enter property details:
     - Property name: `Bitcoin Benefits`
     - Time zone: Your timezone
     - Currency: USD
     - Industry: Financial Services
     - Business size: Select appropriate

3. **Set Up Data Stream**
   - Go to Admin → Data Streams
   - Click "Add stream" → "Web"
   - Enter:
     - Website URL: `https://www.bitcoinbenefits.me`
     - Stream name: `Bitcoin Benefits Web`
   - Click "Create stream"

4. **Get Your Measurement ID**
   - In the Web stream details, copy the Measurement ID
   - Format: `G-XXXXXXXXXX`
   - Save this for the next step

### 2. Configure Your Application

1. **Update Environment Variables**
   ```bash
   # In your .env.local file, add:
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_ID_HERE
   ```
   Replace `G-YOUR_ID_HERE` with your actual Measurement ID

2. **Deploy Your Changes**
   ```bash
   git add .
   git commit -m "Add Google Analytics 4 integration"
   git push
   ```

### 3. Configure Google Analytics Settings

1. **Enhanced Measurement** (Auto-tracked events)
   - Go to Admin → Data Streams → Your Web Stream
   - Under "Enhanced measurement", ensure these are ON:
     - Page views ✓
     - Scrolls ✓
     - Outbound clicks ✓
     - Site search ✓
     - Form interactions ✓
     - Video engagement ✓

2. **Set Up Conversions**
   - Go to Admin → Conversions
   - Mark these events as conversions:
     - `calculator_started` - When user starts calculator
     - `calculation_completed` - When calculation finishes
     - `tool_used` - When Bitcoin tools are used
     - `learn_page_view` - Educational content views

3. **Create Custom Events** (optional)
   - Go to Admin → Events → Create event
   - Examples:
     - Event: `high_engagement`
       - Condition: `engagement_time > 60`
     - Event: `power_user`
       - Condition: `page_views > 5`

4. **Set Up Audiences**
   - Go to Admin → Audiences
   - Create segments:
     - "Calculator Users" - Used any calculator
     - "Bitcoin Tool Users" - Used Bitcoin tools
     - "Engaged Users" - > 2 min on site
     - "Return Visitors" - Multiple sessions

### 4. Verify Installation

1. **Real-time Reports**
   - Visit your site: https://www.bitcoinbenefits.me
   - In GA4, go to Reports → Real-time
   - You should see your visit immediately

2. **Debug View**
   - Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
   - Enable it and visit your site
   - Go to Admin → Debug View in GA4
   - Verify events are firing correctly

### 5. Custom Implementation Details

#### Events Already Tracked

The following events are automatically sent to GA4:

```javascript
// Page views
- Automatic on route change

// Calculator events
- calculator_started
- calculation_completed
- scheme_selected
- results_viewed

// Tool usage
- bitcoin_tool_used
- tool_error
- tool_success

// User engagement
- scroll_depth (25%, 50%, 75%, 90%)
- time_on_page (30s, 60s, 120s, 300s)
- form_submitted
- cta_clicked
```

#### Custom Event Examples

To track custom events in your code:

```typescript
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

// Track a custom event
trackEvent('custom_action', 'category', 'label', 123);

// Track calculator usage
trackCalculatorEvent('vesting', 'calculation_started', 'steady_builder');

// Track conversions
trackConversion('G-XXXXXXXXXX/abc123', 100, 'USD');
```

### 6. Privacy & Compliance

Our implementation includes:
- ✅ IP Anonymization enabled
- ✅ Cookie consent banner
- ✅ GDPR compliance
- ✅ Secure cookie settings
- ✅ No PII collection

### 7. Reporting Setup

#### Recommended Reports

1. **User Acquisition**
   - Reports → Acquisition → User acquisition
   - See where users come from

2. **Engagement Overview**
   - Reports → Engagement → Overview
   - Monitor user behavior

3. **Conversion Tracking**
   - Reports → Engagement → Conversions
   - Track goal completions

4. **Custom Dashboard**
   - Create a dashboard with:
     - Active users
     - Calculator usage
     - Average engagement time
     - Top pages
     - Conversion rate

### 8. Integration with Microsoft Clarity

Both GA4 and Clarity work together:
- **GA4**: Quantitative data (metrics, conversions)
- **Clarity**: Qualitative data (heatmaps, recordings)

No conflicts - they complement each other!

### 9. Troubleshooting

**Not seeing data?**
- Check Measurement ID is correct
- Verify deployment completed
- Clear browser cache
- Check ad blockers

**Events not firing?**
- Use Debug View in GA4
- Check browser console for errors
- Verify environment variables

**Need help?**
- [GA4 Documentation](https://support.google.com/analytics)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)

### 10. Next Steps

After setup:
1. Wait 24-48 hours for full data
2. Set up weekly email reports
3. Create custom alerts for anomalies
4. Connect to Google Search Console
5. Set up Google Ads conversion tracking (if applicable)

---

**Last Updated**: December 2024
**Site**: https://www.bitcoinbenefits.me
**Support**: Contact your developer for assistance
