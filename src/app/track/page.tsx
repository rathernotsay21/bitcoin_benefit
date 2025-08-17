'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnChainStore } from '@/stores/onChainStore';
// Lazy load heavy components for better performance with loading states
const VestingTrackerFormOptimized = dynamic(
  () => import('@/components/on-chain/VestingTrackerFormOptimized'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-96 bg-gray-100 dark:bg-slate-800 rounded-lg" />
  }
);
const VestingTrackerResultsOptimized = dynamic(
  () => import('@/components/on-chain/VestingTrackerResultsOptimized'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-64 bg-gray-100 dark:bg-slate-800 rounded-lg" />
  }
);
const OnChainTimelineVisualizer = dynamic(
  () => import('@/components/on-chain/OnChainTimelineVisualizer'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-48 bg-gray-100 dark:bg-slate-800 rounded-lg" />
  }
);
const PerformanceMonitoringDashboard = dynamic(
  () => import('@/components/on-chain/PerformanceMonitoringDashboard'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-32 bg-gray-100 dark:bg-slate-800 rounded-lg" />
  }
);
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  OnChainErrorBoundary,
  TransactionFetchErrorBoundary,
  PriceFetchErrorBoundary,
  TimelineErrorBoundary
} from '@/components/on-chain/OnChainErrorBoundaries';
// Optimize icon imports - only import what's used immediately
import {
  ShieldCheckIcon,
  InformationCircleIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Import all icons directly to avoid excessive preloading
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  PencilIcon,
  BanknotesIcon,
  LockClosedIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

import dynamic from 'next/dynamic';

// Privacy Disclaimer Component
function PrivacyDisclaimer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Announce expansion state to screen readers
  const announceToggle = (expanded: boolean) => {
    const announcement = expanded ? 'Privacy details expanded' : 'Privacy details collapsed';
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;

    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    announceToggle(newExpanded);

    // Focus the expanded content for screen readers
    if (newExpanded && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8"
      role="region"
      aria-labelledby="privacy-heading"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ShieldCheckIcon className="w-6 h-6 text-blue-500" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3
            id="privacy-heading"
            className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2"
          >
            Privacy & Data Usage Notice
          </h3>

          <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <InformationCircleIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium mb-1">Data Transmission</p>
                  <p className="text-xs">Addresses are sent to public APIs to fetch transaction data.</p>
                </div>
              </div>

              <div className="flex items-start">
                <ShieldCheckIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium mb-1">No Data Storage</p>
                  <p className="text-xs">No data is stored on our servers.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggle}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-expanded={isExpanded}
              aria-controls="privacy-details"
            >
              {isExpanded ? 'Show less' : 'Read full privacy details'}
            </button>

            {isExpanded && (
              <div
                id="privacy-details"
                ref={contentRef}
                className="mt-4 p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg space-y-3"
                tabIndex={-1}
                role="region"
                aria-label="Detailed privacy information"
              >
                <div>
                  <h4 className="font-semibold mb-2">Recommended Privacy Practices</h4>
                  <ul className="space-y-1 text-xs list-disc list-inside" role="list">
                    <li>Use a view-only wallet or watch-only address for enhanced privacy</li>
                    <li>Consider using a fresh address that doesn't reveal your full transaction history</li>
                    <li>All calculations and data processing occur locally in your browser</li>
                    <li>No user data is logged, stored, or transmitted to our servers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">External API Usage</h4>
                  <ul className="space-y-1 text-xs list-disc list-inside" role="list">
                    <li><strong>Mempool.space:</strong> Fetches transparent transaction history (address and transaction data)</li>
                    <li><strong>CoinGecko:</strong> Retrieves historical benefit values (dates only, no address data)</li>
                    <li>These are public APIs that don't require authentication or store request data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Session-Only Processing</h4>
                  <ul className="space-y-1 text-xs list-disc list-inside" role="list">
                    <li>All data is cleared when you close the browser tab or refresh the page</li>
                    <li>Manual annotations and calculations exist only during your current session</li>
                    <li>No persistent storage or cookies are used for user data</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Steps Component
function LoadingSteps({ currentStep, pricingProgress }: {
  currentStep: string;
  pricingProgress?: { current: number; total: number; currentDate?: string }
}) {
  const steps = [
    { id: 'fetching', label: 'Fetching Transactions', icon: MagnifyingGlassIcon, description: 'Fetching transaction data from blockchain...' },
    { id: 'annotating', label: 'Analyzing & Matching', icon: CalculatorIcon, description: 'Analyzing transactions and matching to vesting schedule...' },
    { id: 'pricing', label: 'Retrieving Values', icon: CurrencyDollarIcon, description: 'Retrieving historical benefit values...' },
    { id: 'complete', label: 'Analysis Complete', icon: CheckIcon, description: 'All processing complete' }
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.id === currentStep);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getCurrentStepIndex();
  const currentStepData = steps[currentIndex];

  return (
    <div
      className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6"
      role="status"
      aria-live="polite"
      aria-label="Processing status"
    >
      <div className="flex items-center justify-center mb-6">
        <ClockIcon className="w-6 h-6 text-bitcoin mr-2" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Processing Your Data
        </h3>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Currently {currentStepData?.label.toLowerCase()}. Step {currentIndex + 1} of {steps.length}.
      </div>

      <div className="space-y-4" role="list" aria-label="Processing steps">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center p-3 rounded-lg transition-all duration-300 ${isActive
                ? 'bg-bitcoin/10 border-2 border-bitcoin'
                : isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
                }`}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`mr-3 ${isActive ? 'animate-pulse' : ''}`}
                aria-hidden="true"
              >
                {isActive ? (
                  <ClockIcon className="w-6 h-6 text-bitcoin" />
                ) : (
                  <step.icon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive
                  ? 'text-bitcoin'
                  : isCompleted
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-slate-400'
                  }`}>
                  {step.label}
                  <span className="sr-only">
                    {isActive ? ' (in progress)' : isCompleted ? ' (completed)' : ' (pending)'}
                  </span>
                </p>
                {isActive && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {step.description}
                    </p>
                    {step.id === 'pricing' && pricingProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-500 mb-1">
                          <span>Fetching prices ({pricingProgress.current}/{pricingProgress.total})</span>
                          {pricingProgress.currentDate && (
                            <span>{pricingProgress.currentDate}</span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-bitcoin h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((pricingProgress.current / pricingProgress.total) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {isActive && (
                <div
                  className="w-4 h-4 border-2 border-bitcoin border-t-transparent rounded-full animate-spin ml-2"
                  aria-hidden="true"
                ></div>
              )}
              {isCompleted && (
                <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400 ml-2" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Feature Overview Component
function FeatureOverview() {
  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Automatic Matching',
      description: 'Smart algorithm matches transactions to expected vesting grants based on timing and amounts'
    },
    {
      icon: PencilIcon,
      title: 'Manual Overrides',
      description: 'Easily reassign transactions to different grant years with dropdown controls and undo functionality'
    },
    {
      icon: BanknotesIcon,
      title: 'Historical Values',
      description: 'See USD values at the time of each transaction using historical benefit value data'
    },
    {
      icon: ChartBarIcon,
      title: 'Verify On-Chain',
      description: 'See grants and vesting anytime online without creating yet another account with some bank you\'ll never use again'
    },
    {
      icon: LockClosedIcon,
      title: 'Privacy Focused',
      description: 'All processing happens locally in your browser with no server-side data storage'
    },
    {
      icon: BoltIcon,
      title: 'Real-time Updates',
      description: 'See instant feedback as you make changes with responsive interface and visual indicators'
    }
  ];

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Don't Trust. Verify.
        </h2>
        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Track and verify your vesting grants against actual transaction data.
          Ensure your compensation is properly accounted for with automated matching and manual override capabilities.
        </p>
      </div>

      <div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label="Application features"
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center p-4 focus-within:ring-2 focus-within:ring-bitcoin focus-within:ring-offset-2 rounded-lg"
            role="listitem"
          >
            <feature.icon className="w-8 h-8 text-bitcoin dark:text-bitcoin mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Page Component
export default function TrackerPage() {
  const {
    address,
    vestingStartDate,
    annualGrantBtc,
    totalGrants,
    annotatedTransactions,
    expectedGrants,
    manualAnnotations,
    isLoading,
    error,
    currentStep,
    formErrors,
    partialDataAvailable,
    lastError,
    retryCount,
    pricingProgress,
    setFormData,
    validateAndFetch,
    updateManualAnnotation,
    resetTracker,
    retryOperation,
    continueWithPartialData,
    clearError
  } = useOnChainStore();

  // Track original annotations for undo functionality
  const [originalAnnotations, setOriginalAnnotations] = useState<Map<string, number | null>>(new Map());

  // Refs for accessibility announcements
  const statusRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Store original annotations when transactions are first loaded
  useEffect(() => {
    if (annotatedTransactions.length > 0 && originalAnnotations.size === 0 && currentStep === 'complete') {
      const originals = new Map<string, number | null>();
      annotatedTransactions.forEach(tx => {
        if (!tx.isManuallyAnnotated) {
          originals.set(tx.txid, tx.grantYear);
        }
      });
      setOriginalAnnotations(originals);
    }
  }, [annotatedTransactions, originalAnnotations.size, currentStep]);

  // Clear original annotations when tracker is reset
  useEffect(() => {
    if (currentStep === 'idle' && originalAnnotations.size > 0) {
      setOriginalAnnotations(new Map());
    }
  }, [currentStep, originalAnnotations.size]);

  // Announce status changes to screen readers
  useEffect(() => {
    if (currentStep === 'complete' && annotatedTransactions.length > 0) {
      const matchedGrants = Math.min(annotatedTransactions.filter(t => t.type === 'Annual Grant').length, totalGrants || 5);
      const announcement = `Analysis complete. Found ${annotatedTransactions.length} transactions with ${matchedGrants} vesting grants matched.`;
      announceToScreenReader(announcement);
    }
  }, [currentStep, annotatedTransactions, totalGrants]);

  // Announce errors to screen readers
  useEffect(() => {
    if (error && !isLoading) {
      announceToScreenReader(`Error occurred: ${error}`);
    }
  }, [error, isLoading]);

  const announceToScreenReader = (message: string) => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;

    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  const handleFormSubmit = async (formData: { address: string; vestingStartDate: string; annualGrantBtc: number; totalGrants: number }) => {
    // Update form data immediately
    setFormData(formData);

    // Announce to screen reader
    announceToScreenReader('Starting new transaction analysis');

    // Start fresh analysis immediately (validateAndFetch will clear all previous state)
    await validateAndFetch();
  };

  const handleAnnotationUpdate = (txid: string, grantYear: number | null) => {
    updateManualAnnotation(txid, grantYear);
    const grantText = grantYear === null ? 'unmatched' : `Year ${grantYear}`;
    announceToScreenReader(`Transaction annotation updated to ${grantText}`);
  };

  const handleRetryWithErrorHandling = () => {
    clearError();
    retryOperation();
    announceToScreenReader('Retrying transaction analysis');
  };

  const handleContinueWithPartialData = () => {
    continueWithPartialData();
    announceToScreenReader('Continuing with partial data');
  };

  const handleReset = () => {
    resetTracker();
    announceToScreenReader('Analysis reset. Ready for new input.');
  };

  const hasResults = annotatedTransactions.length > 0;
  const showLoadingSteps = isLoading && currentStep !== 'idle';
  const showFeatureOverview = currentStep === 'idle' && !hasResults;

  return (
    <OnChainErrorBoundary onRetry={handleRetryWithErrorHandling}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Skip links for accessibility */}
        <div className="sr-only focus:not-sr-only">
          <a
            href="#main-content"
            className="fixed top-4 left-4 bg-bitcoin text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-bitcoin-light"
          >
            Skip to main content
          </a>
          <a
            href="#form-section"
            className="fixed top-4 left-32 bg-bitcoin text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-bitcoin-light"
          >
            Skip to tracker form
          </a>
        </div>

        <Navigation />

        <main
          id="main-content"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden"
          role="main"
        >
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Vesting Tracker
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
              Verify grant history any time with complete transparency
            </p>
          </header>

          {/* Privacy Disclaimer */}
          <PrivacyDisclaimer />

          {/* Status announcements for screen readers */}
          <div
            ref={statusRef}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
            id="status-announcements"
          ></div>

          {/* Error announcements for screen readers */}
          <div
            ref={errorRef}
            className="sr-only"
            aria-live="assertive"
            aria-atomic="true"
            id="error-announcements"
          ></div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Sidebar - Form and Status */}
            <aside className="lg:col-span-1 w-full min-w-0" role="complementary" aria-label="Tracker configuration and status">
              <div className="sticky top-8 space-y-6">
                {/* Input Form */}
                <section
                  id="form-section"
                  className="card"
                  aria-labelledby="form-heading"
                >
                  <h2 id="form-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Tracking Configuration
                  </h2>

                  <VestingTrackerFormOptimized
                    onSubmit={handleFormSubmit}
                  />
                </section>

                {/* Loading Steps */}
                {showLoadingSteps && (
                  <section aria-labelledby="loading-heading">
                    <h2 id="loading-heading" className="sr-only">Processing Status</h2>
                    <LoadingSteps currentStep={currentStep} pricingProgress={pricingProgress} />
                  </section>
                )}

                {/* Status Summary */}
                {hasResults && (
                  <section
                    className="card"
                    aria-labelledby="summary-heading"
                  >
                    <h3 id="summary-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Analysis Summary
                    </h3>

                    <div className="space-y-4" role="list" aria-label="Analysis statistics">
                      <div
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                        role="listitem"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Transactions Found
                        </span>
                        <span
                          className="text-lg font-bold text-gray-900 dark:text-white"
                          aria-label={`${annotatedTransactions.length} transactions found`}
                        >
                          {annotatedTransactions.length}
                        </span>
                      </div>

                      <div
                        className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        role="listitem"
                      >
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Vesting Grants Matched
                        </span>
                        <span
                          className="text-lg font-bold text-green-800 dark:text-green-300"
                          aria-label={`${Math.min(annotatedTransactions.filter(t => t.type === 'Annual Grant').length, totalGrants || 5)} vesting grants matched`}
                        >
                          {Math.min(annotatedTransactions.filter(t => t.type === 'Annual Grant').length, totalGrants || 5)}
                        </span>
                      </div>

                      {manualAnnotations.size > 0 && (
                        <div
                          className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                          role="listitem"
                        >
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Manual Overrides
                          </span>
                          <span
                            className="text-lg font-bold text-blue-800 dark:text-blue-300"
                            aria-label={`${manualAnnotations.size} manual overrides applied`}
                          >
                            {manualAnnotations.size}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleReset}
                      className="w-full mt-4 btn-secondary"
                      aria-label="Reset analysis and clear all data"
                    >
                      Reset Analysis
                    </button>
                  </section>
                )}

                {/* Partial Data Notice */}
                {partialDataAvailable && (
                  <section
                    className="card border-yellow-200 dark:border-yellow-800"
                    role="alert"
                    aria-labelledby="partial-data-heading"
                  >
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                      <div className="flex-grow">
                        <h3 id="partial-data-heading" className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          Partial Data Available
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                          Transaction data was retrieved successfully, but some historical price data is unavailable.
                          You can continue with benefit amounts only or retry to fetch missing values.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleContinueWithPartialData}
                            className="btn-secondary flex items-center justify-center"
                            aria-describedby="partial-data-heading"
                          >
                            Continue with Partial Data
                          </button>
                          <button
                            onClick={handleRetryWithErrorHandling}
                            className="btn-primary flex items-center justify-center"
                            aria-describedby="partial-data-heading"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry Price Fetch
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Enhanced Error Display */}
                {error && !isLoading && !partialDataAvailable && (
                  <section
                    className="card"
                    role="alert"
                    aria-labelledby="error-heading"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 id="error-heading" className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {error.includes('Network') || error.includes('connection') || error.includes('timeout')
                          ? 'Connection Error'
                          : error.includes('Invalid') || error.includes('address') || error.includes('format')
                            ? 'Invalid Input'
                            : 'Analysis Error'
                        }
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 mb-4">
                        {error}
                      </p>

                      {retryCount > 0 && (
                        <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">
                          Retry attempt: {retryCount}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          onClick={handleRetryWithErrorHandling}
                          className="btn-primary inline-flex items-center"
                          aria-describedby="error-heading"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Try Again
                        </button>

                        {(error.includes('Network') || error.includes('connection') || error.includes('timeout')) && (
                          <button
                            onClick={() => window.open('https://mempool.space', '_blank')}
                            className="btn-secondary inline-flex items-center"
                            aria-label="Check Mempool.space service status (opens in new tab)"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Check Mempool.space
                          </button>
                        )}

                        <button
                          onClick={handleReset}
                          className="btn-secondary"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </aside>

            {/* Right Content - Results and Visualization */}
            <main className="lg:col-span-2 w-full min-w-0" role="main" aria-label="Analysis results and visualization">
              {showFeatureOverview && (
                <section aria-labelledby="features-heading">
                  <h2 id="features-heading" className="sr-only">Application Features</h2>
                  <FeatureOverview />
                </section>
              )}

              {/* Timeline Visualization with Enhanced Error Boundaries */}
              {hasResults && !isLoading && expectedGrants.length > 0 && (
                <section
                  className="card mb-8"
                  aria-labelledby="timeline-heading"
                >
                  <div className="flex items-center mb-6">
                    <ChartBarIcon className="w-6 h-6 text-bitcoin mr-2" aria-hidden="true" />
                    <h3 id="timeline-heading" className="text-xl font-bold text-gray-900 dark:text-white">
                      Vesting Timeline
                    </h3>
                  </div>

                  <TimelineErrorBoundary fallbackMessage="Timeline visualization encountered an error. The data table below still shows your complete transaction history.">
                    <PriceFetchErrorBoundary
                      onRetry={handleRetryWithErrorHandling}
                      allowPartialData={true}
                    >
                      <OnChainTimelineVisualizer
                        expectedGrants={expectedGrants}
                        actualTransactions={annotatedTransactions}
                        vestingStartDate={vestingStartDate}
                      />
                    </PriceFetchErrorBoundary>
                  </TimelineErrorBoundary>
                </section>
              )}

              {/* Results Table with Error Boundary */}
              {(hasResults || isLoading) && (
                <section
                  className="mb-8"
                  aria-labelledby="results-heading"
                >
                  <h2 id="results-heading" className="sr-only">Transaction Analysis Results</h2>
                  <TransactionFetchErrorBoundary onRetry={handleRetryWithErrorHandling}>
                    <VestingTrackerResultsOptimized
                      transactions={annotatedTransactions}
                      expectedGrants={expectedGrants}
                      isLoading={isLoading}
                      error={error}
                      onRetry={handleRetryWithErrorHandling}
                      onUpdateAnnotation={handleAnnotationUpdate}
                      originalAnnotations={originalAnnotations}
                      partialDataAvailable={partialDataAvailable}
                      onContinueWithPartialData={handleContinueWithPartialData}
                    />
                  </TransactionFetchErrorBoundary>
                </section>
              )}
            </main>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </OnChainErrorBoundary>
  );
}