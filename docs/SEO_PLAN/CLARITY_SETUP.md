# Microsoft Clarity Integration Guide

## Current Status
✅ **Clarity is already integrated** in your application at `src/components/analytics/ClarityScript.tsx`

## Verification Steps

### 1. Check Current Implementation

The Clarity script is already loaded in `src/app/layout.tsx`:
```tsx
{/* Analytics */}
<ClarityScript />
```

### 2. Verify Clarity Project ID

Check if your Clarity project ID is configured:
```bash
# Check your .env.local file for:
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id_here
```

### 3. Complete Setup (If Not Done)

If you haven't set up your Clarity project yet:

1. **Go to Microsoft Clarity**: https://clarity.microsoft.com
2. **Sign up/Sign in** with Microsoft, Google, or Facebook account
3. **Create New Project**:
   - Name: "Bitcoin Benefit"
   - Website URL: https://bitcoinbenefit.com
   - Category: "Finance"

4. **Get Your Project ID**:
   - After creating, go to Settings
   - Copy the Project ID (looks like: `abc123xyz`)

5. **Add to Environment Variables**:
```bash
# .env.local
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_actual_project_id
```

## Enhanced Clarity Configuration

### 1. Update ClarityScript Component for Better Tracking

```typescript
// src/components/analytics/ClarityScript.tsx
'use client';

import Script from 'next/script';

export function ClarityScript() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  
  if (!clarityId) {
    console.warn('Clarity Project ID not configured');
    return null;
  }

  // Only load in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${clarityId}");
            
            // Custom event tracking
            window.clarityTracker = {
              track: function(eventName, data) {
                if (window.clarity) {
                  window.clarity("set", eventName, data || "true");
                }
              }
            };
          `,
        }}
      />
    </>
  );
}
```

### 2. Add Custom Event Tracking

```typescript
// src/lib/analytics/clarity-events.ts
export const ClarityEvents = {
  // Calculator events
  CALCULATOR_STARTED: 'calculator_started',
  CALCULATOR_COMPLETED: 'calculator_completed',
  VESTING_SCHEME_SELECTED: 'vesting_scheme_selected',
  
  // Tool usage events
  BITCOIN_TOOL_USED: 'bitcoin_tool_used',
  TRANSACTION_LOOKED_UP: 'transaction_lookup',
  ADDRESS_TRACKED: 'address_tracked',
  
  // Conversion events
  CONTACT_FORM_SUBMITTED: 'contact_submitted',
  DEMO_REQUESTED: 'demo_requested',
  DOWNLOAD_RESULTS: 'results_downloaded',
  
  // Engagement events
  SCROLL_DEPTH_50: 'scroll_50',
  SCROLL_DEPTH_75: 'scroll_75',
  SCROLL_DEPTH_100: 'scroll_100',
  TIME_ON_PAGE_1MIN: 'engaged_1min',
  TIME_ON_PAGE_3MIN: 'engaged_3min',
};

// Helper function to track events
export function trackClarityEvent(eventName: string, data?: any) {
  if (typeof window !== 'undefined' && window.clarityTracker) {
    window.clarityTracker.track(eventName, data);
  }
}
```

### 3. Implement Event Tracking in Components

```typescript
// Example: Track calculator usage
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

// In your calculator component
const handleCalculate = () => {
  trackClarityEvent(ClarityEvents.CALCULATOR_STARTED, {
    scheme: selectedScheme,
    amount: grantAmount,
  });
  
  // ... calculation logic
  
  trackClarityEvent(ClarityEvents.CALCULATOR_COMPLETED);
};

// Track vesting scheme selection
const handleSchemeChange = (scheme: string) => {
  trackClarityEvent(ClarityEvents.VESTING_SCHEME_SELECTED, scheme);
  setSelectedScheme(scheme);
};
```

### 4. Add Scroll Depth Tracking

```typescript
// src/hooks/useScrollTracking.ts
import { useEffect } from 'react';
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

export function useScrollTracking() {
  useEffect(() => {
    const tracked = new Set<string>();
    
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight * 100;
      
      if (scrollPercentage >= 50 && !tracked.has('50')) {
        trackClarityEvent(ClarityEvents.SCROLL_DEPTH_50);
        tracked.add('50');
      }
      
      if (scrollPercentage >= 75 && !tracked.has('75')) {
        trackClarityEvent(ClarityEvents.SCROLL_DEPTH_75);
        tracked.add('75');
      }
      
      if (scrollPercentage >= 95 && !tracked.has('100')) {
        trackClarityEvent(ClarityEvents.SCROLL_DEPTH_100);
        tracked.add('100');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
```

## Clarity Dashboard Configuration

### 1. Set Up Heatmaps
- Navigate to Heatmaps in Clarity dashboard
- Enable for key pages:
  - `/` (Homepage)
  - `/calculator/*` (All calculator pages)
  - `/bitcoin-tools` (Tools page)
  - `/historical` (Historical analysis)

### 2. Configure Recordings
- Set recording sample rate to 100% initially
- After 1 week, adjust based on traffic:
  - < 1000 sessions/day: Keep at 100%
  - 1000-5000 sessions/day: Set to 50%
  - > 5000 sessions/day: Set to 25%

### 3. Set Up Filters
Create saved filters for:
- **High-value users**: Session time > 3 minutes
- **Calculator users**: Visited /calculator/*
- **Tool users**: Visited /bitcoin-tools
- **Bounced sessions**: Single page, < 10 seconds
- **Mobile users**: Device type = Mobile

### 4. Configure Alerts
Set up email alerts for:
- Rage clicks (> 3 clicks in 2 seconds)
- JavaScript errors
- Dead clicks (clicks with no response)
- Quick backs (< 5 seconds on page)

## Privacy & Compliance

### 1. Update Privacy Policy
Add Clarity disclosure:
```markdown
## Analytics and Performance Monitoring

We use Microsoft Clarity to understand how users interact with our website. 
Clarity collects:
- Anonymized usage data
- Session recordings (with sensitive data masked)
- Heatmaps of user interactions

No personal information is collected or stored. All data is anonymized and 
used solely to improve user experience.

To opt out, you can disable cookies in your browser settings.
```

### 2. Cookie Consent (If Required)
```typescript
// src/components/CookieConsent.tsx
export function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);
  
  useEffect(() => {
    const savedConsent = localStorage.getItem('analytics-consent');
    if (savedConsent !== null) {
      setConsent(savedConsent === 'true');
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'true');
    setConsent(true);
    // Enable Clarity
    window.clarity && window.clarity('consent');
  };
  
  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'false');
    setConsent(false);
    // Disable Clarity
    window.clarity && window.clarity('stop');
  };
  
  if (consent !== null) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p>We use cookies to improve your experience. </p>
        <div className="flex gap-2">
          <button onClick={handleDecline}>Decline</button>
          <button onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
}
```

## Testing Clarity Integration

### 1. Verify Installation
1. Open Chrome DevTools
2. Go to Network tab
3. Filter by "clarity"
4. Reload page
5. Should see requests to `clarity.ms`

### 2. Check Console
```javascript
// In browser console
window.clarity // Should be defined
clarity('event', 'test_event'); // Test custom event
```

### 3. Real-time Verification
1. Go to Clarity dashboard
2. Click "Live" or "Recordings"
3. Open your site in another tab
4. Should see session appear within 2-3 minutes

## Clarity Insights & Optimization

### Week 1-2: Initial Analysis
- Identify high-exit pages
- Find rage click areas
- Discover dead clicks
- Review JavaScript errors

### Week 3-4: Optimization
Based on Clarity data:
- Fix UI issues causing rage clicks
- Improve CTAs with low interaction
- Optimize high-bounce pages
- Fix broken elements

### Monthly Review
- Compare heatmaps month-over-month
- Track conversion funnel improvements
- Analyze user path patterns
- Review session recordings for UX issues

## Troubleshooting

### Clarity Not Loading
```bash
# Check environment variable
echo $NEXT_PUBLIC_CLARITY_PROJECT_ID

# Verify in browser
# Should see Clarity script in page source
```

### No Data in Dashboard
- Wait 2-3 minutes after implementation
- Check if running in production mode
- Verify project ID matches dashboard
- Check for ad blockers

### Custom Events Not Tracking
```javascript
// Debug in console
window.clarity('event', 'debug_test');
// Check Network tab for clarity request
```

## Support Resources
- **Clarity Documentation**: https://docs.microsoft.com/en-us/clarity/
- **Clarity Support**: https://clarity.microsoft.com/support
- **Community Forum**: https://techcommunity.microsoft.com/t5/microsoft-clarity/bd-p/MicrosoftClarity