import { useEffect } from 'react';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';
import { getUserSegmentation } from '@/lib/analytics/user-segmentation';

interface HistoricalTrackingOptions {
  enabled?: boolean;
  trackCalculations?: boolean;
  trackComparisons?: boolean;
  trackSchemeChanges?: boolean;
}

/**
 * Hook to track historical calculator usage
 */
export function useHistoricalTracking(options: HistoricalTrackingOptions = {}) {
  const {
    enabled = true,
    trackCalculations = true,
    trackComparisons = true,
    trackSchemeChanges = true,
  } = options;
  
  const { analyticsEnabled, trackEvent } = useAnalytics();

  // Track historical calculator initialization
  useEffect(() => {
    if (enabled && analyticsEnabled) {
      const segmentation = getUserSegmentation();
      
      trackEvent(ClarityEvents.HISTORICAL_CALCULATOR_STARTED, {
        timestamp: new Date().toISOString(),
        user_insights: segmentation.getUserInsights(),
      });

      // Update user segmentation
      segmentation.trackPageView('/historical');
    }
  }, [enabled, analyticsEnabled, trackEvent]);

  // Tracking functions
  const trackYearSelection = (year: number, yearRange?: { start: number; end: number }) => {
    if (!enabled || !analyticsEnabled) return;

    trackEvent(ClarityEvents.HISTORICAL_YEAR_SELECTED, {
      year,
      yearRange,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  const trackSchemeSelection = (scheme: string, previousScheme?: string) => {
    if (!enabled || !analyticsEnabled || !trackSchemeChanges) return;

    trackEvent(ClarityEvents.HISTORICAL_SCHEME_SELECTED, {
      scheme,
      previousScheme,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  const trackResultsViewed = (data: {
    scheme: string;
    year: number;
    grantAmount?: number;
    totalValue?: number;
    performance?: string;
  }) => {
    if (!enabled || !analyticsEnabled || !trackCalculations) return;

    trackEvent(ClarityEvents.HISTORICAL_RESULTS_VIEWED, {
      ...data,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  const trackComparison = (data: {
    schemes: string[];
    year: number;
    comparisonType: 'scheme_comparison' | 'year_comparison' | 'performance_analysis';
    bestPerformer?: string;
    worstPerformer?: string;
  }) => {
    if (!enabled || !analyticsEnabled || !trackComparisons) return;

    trackEvent(ClarityEvents.HISTORICAL_COMPARISON_VIEWED, {
      ...data,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  const trackDataExport = (data: {
    exportType: 'csv' | 'json' | 'pdf';
    scheme: string;
    year: number;
    dataPoints: number;
  }) => {
    if (!enabled || !analyticsEnabled) return;

    trackEvent(ClarityEvents.RESULTS_EXPORTED, {
      ...data,
      calculator_type: 'historical',
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  const trackPerformanceAnalysis = (data: {
    analysisType: 'roi_analysis' | 'cost_basis_comparison' | 'growth_analysis';
    timeframe: string;
    schemes: string[];
    insights: string[];
  }) => {
    if (!enabled || !analyticsEnabled) return;

    trackEvent('historical_performance_analysis', {
      ...data,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  const trackUserInsight = (insight: {
    type: 'best_year' | 'worst_year' | 'optimal_scheme' | 'cost_basis_impact';
    value: string | number;
    context: string;
  }) => {
    if (!enabled || !analyticsEnabled) return;

    trackEvent('historical_user_insight', {
      ...insight,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  };

  return {
    trackYearSelection,
    trackSchemeSelection,
    trackResultsViewed,
    trackComparison,
    trackDataExport,
    trackPerformanceAnalysis,
    trackUserInsight,
    isEnabled: enabled && analyticsEnabled,
  };
}