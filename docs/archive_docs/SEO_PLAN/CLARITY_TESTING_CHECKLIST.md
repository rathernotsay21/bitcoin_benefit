# Microsoft Clarity Testing Checklist

## 🚀 Pre-Deployment Testing

### ✅ Environment Configuration
- [ ] `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set in production environment
- [ ] `NEXT_PUBLIC_ENABLE_CLARITY_DEV=true` for development testing
- [ ] No sensitive information in environment variables
- [ ] Build process completes without errors

### ✅ Cookie Consent Testing
- [ ] Cookie consent banner appears for new visitors
- [ ] All consent options (Analytics, Preferences, Marketing) work
- [ ] "Accept All" enables analytics tracking
- [ ] "Necessary Only" disables analytics tracking  
- [ ] Custom preferences save correctly
- [ ] Consent persists across page refreshes
- [ ] Re-opening preferences shows saved state

### ✅ Analytics Loading
- [ ] Clarity script loads only with analytics consent
- [ ] `window.clarity` is available after script loads
- [ ] `window.clarityTracker` provides custom methods
- [ ] No console errors related to Clarity
- [ ] Script uses `afterInteractive` loading strategy

### ✅ Event Tracking
#### Calculator Events
- [ ] Calculator start events fire on page load
- [ ] Scheme selection changes are tracked
- [ ] Input value changes trigger events (debounced)
- [ ] Results viewing is recorded
- [ ] Export actions are captured

#### Historical Calculator Events
- [ ] Historical calculator initialization tracked
- [ ] Year selection changes recorded
- [ ] Scheme comparisons logged
- [ ] Performance analysis events captured

#### Bitcoin Tools Events
- [ ] Transaction lookup events (found/not found)
- [ ] Fee calculation events
- [ ] Network status check events
- [ ] Address search events
- [ ] Document timestamp events

#### Engagement Events
- [ ] Page view events with segmentation data
- [ ] Scroll depth milestones (25%, 50%, 75%, 100%)
- [ ] Time on page milestones (30s, 1min, 3min, 5min)
- [ ] User activity/inactivity detection
- [ ] Page exit events with session data

### ✅ User Segmentation
- [ ] New users classified as "visitor"
- [ ] Calculator usage updates user type
- [ ] Multiple page views increase engagement level
- [ ] Tool usage updates feature flags
- [ ] Custom tags appear in Clarity dashboard
- [ ] User insights are accurate

### ✅ Privacy & Compliance
- [ ] No tracking without consent
- [ ] Sensitive data is sanitized from events
- [ ] Users can withdraw consent
- [ ] Privacy policy links work
- [ ] GDPR compliance messaging is clear

### ✅ Performance Impact
- [ ] Clarity script doesn't block page rendering
- [ ] No impact on Core Web Vitals
- [ ] Event tracking is debounced appropriately
- [ ] No memory leaks from event listeners
- [ ] Bundle size impact is minimal

### ✅ Error Handling
- [ ] Clarity script failures don't break the site
- [ ] Missing consent doesn't cause errors
- [ ] Invalid event data is handled gracefully
- [ ] Network failures are managed properly

## 🧪 Development Testing with ClarityTester

### Test Component Functionality
- [ ] ClarityTester appears in development mode only
- [ ] Status indicators show correct values
- [ ] Basic event test works
- [ ] Page view tracking works
- [ ] Calculator event tracking works
- [ ] Error event tracking works
- [ ] Form event tracking works
- [ ] Scroll event tracking works
- [ ] User segmentation data is accurate
- [ ] Clarity API availability check works

### Browser Console Verification
- [ ] Events logged in development mode
- [ ] No tracking errors in console
- [ ] Segmentation updates visible
- [ ] Cookie consent changes logged

## 📊 Production Verification

### Clarity Dashboard Checks
- [ ] Project receives events successfully
- [ ] Session recordings are captured
- [ ] Heatmaps are generated
- [ ] Custom events appear in dashboard
- [ ] User segmentation tags are visible

### Analytics Data Quality
- [ ] Event data includes user insights
- [ ] Timestamps are accurate
- [ ] Event names are consistent
- [ ] No PII in tracked data
- [ ] Error events provide useful context

### User Experience Validation
- [ ] Cookie banner is not intrusive
- [ ] Site works without analytics
- [ ] No performance degradation
- [ ] Mobile experience is optimized
- [ ] Loading states work properly

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### Events Not Appearing
1. Check consent status in browser storage
2. Verify Clarity script loaded successfully
3. Confirm project ID is correct
4. Check network requests in developer tools

#### Performance Issues
1. Monitor Core Web Vitals in Lighthouse
2. Check event frequency and data size
3. Verify script loading strategy
4. Review console for errors

#### Privacy Compliance
1. Ensure consent banner displays correctly
2. Verify tracking stops without consent
3. Check data sanitization functions
4. Test opt-out mechanisms

#### Development Debugging
1. Use ClarityTester component
2. Enable development logging
3. Check browser console output
4. Verify environment variables

## 📝 Testing Documentation

### Test Scenarios to Document
1. **First-time visitor journey**: Consent → tracking → segmentation
2. **Returning user behavior**: Preference persistence → re-engagement
3. **Calculator power user**: Multiple tools → advanced features → exports
4. **Error scenarios**: Network failures → script loading issues → consent withdrawal
5. **Privacy scenarios**: Consent management → data control → opt-out

### Performance Benchmarks
- Page load time impact: < 50ms
- First Contentful Paint: No degradation
- Core Web Vitals: Maintain green scores
- Bundle size increase: < 10KB gzipped

### Analytics Goals
- Calculator completion rate tracking
- Feature adoption measurement
- User journey optimization
- Error rate monitoring
- Conversion funnel analysis

---

**Testing Completion**: ✅ All items checked  
**Reviewer**: _______________  
**Date**: _______________  
**Production Ready**: ✅ / ❌