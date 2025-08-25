# Microsoft Clarity Implementation Guide

## 📊 Overview

This guide provides comprehensive documentation for the Microsoft Clarity analytics implementation in the Bitcoin Benefits platform. The implementation focuses on user behavior tracking, conversion optimization, and SEO insights while maintaining privacy compliance.

## 🚀 Features Implemented

### ✅ Core Analytics
- **Microsoft Clarity Integration**: Full tracking with session recordings and heatmaps
- **Cookie Consent Management**: GDPR/CCPA compliant consent system
- **User Segmentation**: Intelligent user categorization and behavioral analysis
- **Performance Monitoring**: Core Web Vitals and page performance tracking
- **Privacy Controls**: User opt-out mechanisms and data sanitization

### ✅ Tracking Coverage
- **Calculator Interactions**: All vesting scheme selections, calculations, and results
- **Historical Analysis**: Year selections, comparisons, and performance insights
- **Bitcoin Tools**: Transaction lookups, fee calculations, network status, timestamping
- **On-Chain Tracking**: Address monitoring and blockchain interactions
- **User Engagement**: Scroll depth, time on page, interaction patterns
- **Error Tracking**: Comprehensive error monitoring and debugging

### ✅ User Segmentation
- **User Types**: Visitor, Calculator User, Returning User, Power User
- **Engagement Levels**: Low, Medium, High based on interaction patterns
- **Feature Usage**: Tracking which calculators and tools are most popular
- **Behavioral Insights**: Session duration, page views, feature combinations

## 🔧 Implementation Details

### Project Configuration

The Clarity project ID is configured in environment variables:

```bash
# .env.local
NEXT_PUBLIC_CLARITY_PROJECT_ID=svem84nwfy
NEXT_PUBLIC_ENABLE_CLARITY_DEV=true  # Enable in development
```

### Core Components

#### 1. AnalyticsProvider
Central provider that manages all analytics functionality:

```typescript
// Usage in layout.tsx
<AnalyticsProvider>
  {children}
</AnalyticsProvider>
```

#### 2. CookieConsent Component
GDPR-compliant cookie consent management:

- **Granular Controls**: Separate consent for analytics, marketing, preferences
- **Customizable Settings**: Users can adjust preferences anytime
- **Persistent Storage**: Consent choices stored in localStorage
- **Privacy-First**: Necessary cookies only by default

#### 3. ClarityScript Component
Optimized script loading with consent integration:

- **Conditional Loading**: Only loads with user consent
- **Performance Optimized**: Uses `afterInteractive` strategy
- **Error Handling**: Graceful degradation on script failures
- **Development Support**: Console logging for debugging

### Tracking Hooks

#### useEngagementTracking
Tracks user engagement metrics:

```typescript
const { timeOnPage, activeTime } = useEngagementTracking({
  enabled: true,
  trackPageViews: true,
  trackTimeOnPage: true,
  pageIdentifier: '/calculator'
});
```

#### useScrollTracking
Monitors scroll depth with milestone tracking:

```typescript
const { getCurrentScrollDepth } = useScrollTracking(true);
```

#### useHistoricalTracking
Specialized tracking for historical calculator:

```typescript
const {
  trackYearSelection,
  trackSchemeSelection,
  trackResultsViewed
} = useHistoricalTracking();
```

## 🎯 Event Categories

### Calculator Events
- `calculator_started`: Calculator initialization
- `vesting_scheme_selected`: Scheme selection
- `vesting_scheme_changed`: Scheme changes
- `grant_amount_entered`: Amount input
- `growth_rate_changed`: Growth rate adjustments
- `results_viewed`: Results display
- `results_exported`: Data export

### Historical Calculator Events
- `historical_calculator_started`: Historical tool start
- `historical_year_selected`: Year range selection
- `historical_scheme_selected`: Scheme comparison
- `historical_results_viewed`: Results analysis
- `historical_comparison_viewed`: Multi-scheme comparison

### Bitcoin Tools Events
- `bitcoin_tool_used`: Tool usage tracking
- `transaction_looked_up`: Transaction searches
- `transaction_found/not_found`: Search results
- `address_searched`: Address exploration
- `fee_calculated`: Fee estimation
- `network_status_checked`: Network monitoring
- `timestamp_created/verified`: Document timestamping

### Engagement Events
- `page_view`: Page navigation
- `scroll_depth_*`: Scroll milestones (25%, 50%, 75%, 100%)
- `engaged_*`: Time milestones (30s, 1min, 3min, 5min)
- `user_inactive/reengaged`: Activity state changes

### Error Events
- `error_occurred`: General errors
- `api_error`: API failures
- `validation_error`: Form validation issues
- `network_error`: Connectivity problems

## 📈 User Segmentation Strategy

### User Types
1. **Visitor**: Initial page views, exploring content
2. **Calculator User**: Actively using calculators
3. **Returning User**: Multiple sessions, engaged browsing
4. **Power User**: High engagement, multiple tool usage

### Engagement Levels
- **Low**: Basic browsing, minimal interaction
- **Medium**: Calculator usage, multiple pages
- **High**: Extensive tool usage, long sessions

### Custom Tags
- `user_type`: Current user classification
- `engagement_level`: Interaction intensity
- `session_page_views`: Pages visited in session
- `tools_used_count`: Number of tools accessed
- `calculator_used`: Calculator engagement flag
- `feature_combination`: Multiple feature usage patterns

## 🔒 Privacy & Compliance

### Cookie Categories
1. **Necessary**: Required for functionality (always enabled)
2. **Analytics**: Microsoft Clarity tracking (user consent)
3. **Preferences**: User settings and preferences
4. **Marketing**: Future marketing tools (currently unused)

### Data Sanitization
- **Sensitive Data Removal**: Automatic filtering of PII
- **String Truncation**: Long strings limited to 200 characters
- **Error Context**: Safe error tracking without exposing secrets

### User Rights
- **Opt-out**: Easy consent withdrawal
- **Data Control**: Granular permission settings
- **Transparency**: Clear explanation of data usage

## 🧪 Testing & Verification

### Development Testing
The `ClarityTester` component (development only) provides:

- **Event Testing**: Manual trigger of all event types
- **Status Monitoring**: Real-time analytics status
- **API Verification**: Clarity script loading confirmation
- **Segmentation Testing**: User classification validation

### Testing Checklist
- [ ] Cookie consent banner displays
- [ ] Clarity script loads with consent
- [ ] Events fire correctly in browser console
- [ ] User segmentation updates properly
- [ ] Error tracking captures issues
- [ ] Performance impact minimal

### Production Verification
1. **Clarity Dashboard**: Check session recordings and heatmaps
2. **Event Tracking**: Verify custom events in Clarity
3. **User Segmentation**: Review user classification accuracy
4. **Performance**: Monitor Core Web Vitals impact
5. **Privacy**: Confirm consent compliance

## 📊 Analytics Insights

### Key Metrics to Monitor
1. **Calculator Engagement**:
   - Scheme selection patterns
   - Completion rates
   - Time to results
   - Export frequency

2. **Tool Usage**:
   - Most popular Bitcoin tools
   - Success/failure rates
   - User flow patterns
   - Error occurrence

3. **User Journey**:
   - Entry points
   - Feature adoption
   - Drop-off points
   - Conversion funnels

4. **Performance**:
   - Page load times
   - Calculator response times
   - Error rates
   - User satisfaction indicators

### Conversion Events
- Calculator completion
- Tool usage success
- Data export actions
- Return visits
- Feature exploration depth

## 🚀 SEO Improvements from Tracking

### User Behavior Insights
1. **Content Optimization**: Identify popular calculator configurations
2. **Navigation Improvement**: Optimize user flow based on heatmaps
3. **Feature Prioritization**: Focus development on high-engagement tools
4. **Performance Optimization**: Address slow-loading components
5. **Error Reduction**: Fix common user experience issues

### Content Strategy
- **Landing Page Optimization**: Based on entry point analysis
- **Feature Highlighting**: Promote underutilized but valuable tools
- **Educational Content**: Create guides for complex features
- **Mobile Experience**: Optimize based on device usage patterns

## 🔧 Development Workflow

### Adding New Events
1. Add event constant to `ClarityEvents` in `clarity-events.ts`
2. Create tracking function or use existing `trackClarityEvent`
3. Add user segmentation context if relevant
4. Test with ClarityTester component
5. Document in this guide

### Component Integration
```typescript
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';

function MyComponent() {
  const { trackEvent, trackCalculatorEvent } = useAnalytics();
  
  const handleAction = () => {
    trackEvent('custom_action', {
      component: 'MyComponent',
      value: 'action_data'
    });
  };
}
```

### Store Integration
```typescript
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

// In store actions
trackClarityEvent(ClarityEvents.CALCULATOR_STARTED, {
  scheme: schemeId,
  user_insights: getUserSegmentation().getUserInsights(),
});
```

## 📝 Best Practices

### Event Naming
- Use descriptive, consistent naming
- Include context in event data
- Avoid PII in event names or data
- Use snake_case for consistency

### Data Collection
- Minimize data collection to essential insights
- Sanitize all user input before tracking
- Include user segmentation context
- Track success and failure states

### Performance
- Use debounced tracking for frequent events
- Batch related events when possible
- Monitor analytics script impact
- Lazy load non-critical tracking

### Privacy
- Always check consent before tracking
- Provide clear opt-out mechanisms
- Document data usage transparently
- Regular consent re-confirmation

## 🐛 Troubleshooting

### Common Issues
1. **Events Not Appearing**: Check consent status and script loading
2. **Console Errors**: Verify environment configuration
3. **Performance Issues**: Review event frequency and data size
4. **Privacy Compliance**: Ensure consent before tracking

### Debug Tools
- **ClarityTester**: Development component for testing
- **Browser Console**: Event logging in development
- **Clarity Dashboard**: Production event verification
- **Network Tab**: Script loading confirmation

### Support Resources
- **Microsoft Clarity Documentation**: https://docs.microsoft.com/en-us/clarity/
- **Project Dashboard**: https://clarity.microsoft.com/
- **Implementation Guide**: This document

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team