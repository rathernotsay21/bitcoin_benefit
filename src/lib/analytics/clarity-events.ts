/**
 * Microsoft Clarity Event Tracking System
 * Centralized event definitions and tracking utilities
 */

// Event Categories
export const ClarityEvents = {
  // Page Navigation Events
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  
  // Calculator Events
  CALCULATOR_STARTED: 'calculator_started',
  CALCULATOR_COMPLETED: 'calculator_completed',
  CALCULATOR_ERROR: 'calculator_error',
  VESTING_SCHEME_SELECTED: 'vesting_scheme_selected',
  VESTING_SCHEME_CHANGED: 'vesting_scheme_changed',
  GRANT_AMOUNT_ENTERED: 'grant_amount_entered',
  GROWTH_RATE_CHANGED: 'growth_rate_changed',
  RESULTS_VIEWED: 'results_viewed',
  RESULTS_EXPORTED: 'results_exported',
  CHART_INTERACTION: 'chart_interaction',
  
  // Historical Calculator Events
  HISTORICAL_CALCULATOR_STARTED: 'historical_calculator_started',
  HISTORICAL_YEAR_SELECTED: 'historical_year_selected',
  HISTORICAL_SCHEME_SELECTED: 'historical_scheme_selected',
  HISTORICAL_RESULTS_VIEWED: 'historical_results_viewed',
  HISTORICAL_COMPARISON_VIEWED: 'historical_comparison_viewed',
  
  // Bitcoin Tools Events
  BITCOIN_TOOL_USED: 'bitcoin_tool_used',
  TRANSACTION_LOOKED_UP: 'transaction_lookup',
  TRANSACTION_FOUND: 'transaction_found',
  TRANSACTION_NOT_FOUND: 'transaction_not_found',
  ADDRESS_SEARCHED: 'address_searched',
  ADDRESS_TRACKED: 'address_tracked',
  FEE_CALCULATED: 'fee_calculated',
  NETWORK_STATUS_CHECKED: 'network_status_checked',
  TIMESTAMP_CREATED: 'timestamp_created',
  TIMESTAMP_VERIFIED: 'timestamp_verified',
  
  // On-Chain Tracking Events
  ONCHAIN_ADDRESS_ADDED: 'onchain_address_added',
  ONCHAIN_ADDRESS_REMOVED: 'onchain_address_removed',
  ONCHAIN_REFRESH_TRIGGERED: 'onchain_refresh_triggered',
  ONCHAIN_EXPORT_DATA: 'onchain_export_data',
  
  // User Engagement Events
  SCROLL_DEPTH_25: 'scroll_25',
  SCROLL_DEPTH_50: 'scroll_50',
  SCROLL_DEPTH_75: 'scroll_75',
  SCROLL_DEPTH_100: 'scroll_100',
  TIME_ON_PAGE_30S: 'engaged_30s',
  TIME_ON_PAGE_1MIN: 'engaged_1min',
  TIME_ON_PAGE_3MIN: 'engaged_3min',
  TIME_ON_PAGE_5MIN: 'engaged_5min',
  
  // Interaction Events
  BUTTON_CLICKED: 'button_clicked',
  LINK_CLICKED: 'link_clicked',
  TAB_CHANGED: 'tab_changed',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  TOOLTIP_VIEWED: 'tooltip_viewed',
  COPY_TO_CLIPBOARD: 'copy_to_clipboard',
  
  // Form Events
  FORM_STARTED: 'form_started',
  FORM_SUBMITTED: 'form_submitted',
  FORM_ERROR: 'form_error',
  FORM_ABANDONED: 'form_abandoned',
  
  // Error Events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  
  // Performance Events
  SLOW_LOAD: 'slow_load',
  CHART_RENDER_TIME: 'chart_render_time',
  API_RESPONSE_TIME: 'api_response_time',
  
  // Conversion Events
  CTA_CLICKED: 'cta_clicked',
  DEMO_REQUESTED: 'demo_requested',
  CONTACT_FORM_SUBMITTED: 'contact_submitted',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  SHARE_CLICKED: 'share_clicked',
  DOWNLOAD_INITIATED: 'download_initiated',
} as const;

// Type for event names
export type ClarityEventName = typeof ClarityEvents[keyof typeof ClarityEvents];

// Event data interfaces
export interface CalculatorEventData {
  scheme?: string;
  amount?: number;
  duration?: number;
  growthRate?: number;
  action?: string;
}

export interface ToolEventData {
  tool?: string;
  action?: string;
  value?: string;
  success?: boolean;
}

export interface EngagementEventData {
  duration?: number;
  depth?: number;
  element?: string;
  value?: any;
}

export interface ErrorEventData {
  error?: string;
  code?: string | number;
  source?: string;
  details?: any;
}

// Main tracking function
export function trackClarityEvent(
  eventName: ClarityEventName | string,
  data?: CalculatorEventData | ToolEventData | EngagementEventData | ErrorEventData | any
): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Ensure Clarity tracker is available
    if (window.clarityTracker && window.clarityTracker.track) {
      // Filter out sensitive data
      const sanitizedData = sanitizeEventData(data);
      
      // Track the event
      window.clarityTracker.track(eventName, sanitizedData);
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Clarity Event]', eventName, sanitizedData);
      }
    } else {
      // Queue event if Clarity isn't ready yet
      if (process.env.NODE_ENV === 'development') {
        console.log('[Clarity] Event queued (tracker not ready):', eventName, data);
      }
    }
  } catch (error) {
    console.error('[Clarity] Error tracking event:', error);
  }
}

// Sanitize event data to remove sensitive information
function sanitizeEventData(data: any): any {
  if (!data) return data;
  
  // Create a copy to avoid mutating original
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'email', 'phone', 'ssn', 'creditCard', 'apiKey', 'privateKey'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  // Truncate long strings
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 200) {
      sanitized[key] = sanitized[key].substring(0, 200) + '...';
    }
  });
  
  return sanitized;
}

// Utility function to track page views with additional context
export function trackPageView(path?: string, referrer?: string): void {
  trackClarityEvent(ClarityEvents.PAGE_VIEW, {
    path: path || window.location.pathname,
    referrer: referrer || document.referrer,
    timestamp: new Date().toISOString(),
  });
}

// Track user engagement milestones
export function trackEngagement(duration: number): void {
  if (duration >= 30 && duration < 60) {
    trackClarityEvent(ClarityEvents.TIME_ON_PAGE_30S);
  } else if (duration >= 60 && duration < 180) {
    trackClarityEvent(ClarityEvents.TIME_ON_PAGE_1MIN);
  } else if (duration >= 180 && duration < 300) {
    trackClarityEvent(ClarityEvents.TIME_ON_PAGE_3MIN);
  } else if (duration >= 300) {
    trackClarityEvent(ClarityEvents.TIME_ON_PAGE_5MIN);
  }
}

// Track errors with context
export function trackError(error: Error | string, source?: string): void {
  trackClarityEvent(ClarityEvents.ERROR_OCCURRED, {
    error: error instanceof Error ? error.message : error,
    source: source || 'unknown',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}

// Track API errors specifically
export function trackApiError(endpoint: string, status: number, error?: string): void {
  trackClarityEvent(ClarityEvents.API_ERROR, {
    endpoint,
    status,
    error,
    timestamp: new Date().toISOString(),
  });
}

// Track calculator-specific events
export function trackCalculatorEvent(action: string, data?: CalculatorEventData): void {
  const eventMap: Record<string, ClarityEventName> = {
    start: ClarityEvents.CALCULATOR_STARTED,
    complete: ClarityEvents.CALCULATOR_COMPLETED,
    schemeSelect: ClarityEvents.VESTING_SCHEME_SELECTED,
    schemeChange: ClarityEvents.VESTING_SCHEME_CHANGED,
    viewResults: ClarityEvents.RESULTS_VIEWED,
    export: ClarityEvents.RESULTS_EXPORTED,
  };
  
  const eventName = eventMap[action] || ClarityEvents.CALCULATOR_STARTED;
  trackClarityEvent(eventName, data);
}

// Track Bitcoin tool usage
export function trackToolUsage(tool: string, action: string, success: boolean = true): void {
  trackClarityEvent(ClarityEvents.BITCOIN_TOOL_USED, {
    tool,
    action,
    success,
    timestamp: new Date().toISOString(),
  });
}

// Set custom user tags for segmentation
export function setUserTags(tags: Record<string, string>): void {
  if (typeof window !== 'undefined' && window.clarityTracker) {
    window.clarityTracker.setCustomTags(tags);
  }
}

// Identify user (if you have user authentication)
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.clarityTracker) {
    window.clarityTracker.identify(userId, undefined, traits);
  }
}