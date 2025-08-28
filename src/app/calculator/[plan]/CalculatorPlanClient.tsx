'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { VestingScheme, CustomVestingEvent } from '@/types/vesting';
import { ErrorBoundary, CalculatorErrorBoundary, ChartErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HelpTooltip from '@/components/HelpTooltip';
import { HELP_CONTENT } from '@/lib/help-content';
import { CogIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { CalculatorSkeleton, ChartSkeleton } from '@/components/loading/Skeletons';
import { MetricCardsSkeleton } from '@/components/loading/EnhancedSkeletons';
import VestingPresets, { VESTING_PRESETS } from '@/components/VestingPresets';
import CustomVestingSchedule from '@/components/CustomVestingSchedule';
import VestingProgress from '@/components/VestingProgress';
import MetricCards from '@/components/MetricCards';
import SchemeTabSelector from '@/components/SchemeTabSelector';
import FinancialDisclaimer from '@/components/FinancialDisclaimer';
import VirtualizedAnnualBreakdown from '@/components/VirtualizedAnnualBreakdownOptimized';

// Lazy load the chart component
const VestingTimelineChart = dynamic(
  () => import('@/components/VestingTimelineChartRecharts'),
  {
    ssr: false, // Disable server-side rendering for this client-side component
    loading: () => <ChartSkeleton /> // Show a loading component
  }
);

interface CalculatorPlanClientProps {
  initialScheme: VestingScheme | undefined;
  planId: string;
  initialBitcoinPrice?: number;
}

function formatBTC(amount: number): string {
  return `₿${amount.toFixed(3)}`;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function CalculatorContent({ initialScheme, planId }: CalculatorPlanClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedVestingPreset, setSelectedVestingPreset] = useState<string>('reward'); // Default to Reward preset
  const [isCustomizationCollapsed, setIsCustomizationCollapsed] = useState(true);
  
  // Local state for input fields to allow empty values during editing
  const [initialGrantInput, setInitialGrantInput] = useState<string>('');
  const [annualGrantInput, setAnnualGrantInput] = useState<string>('');
  const [growthRateInput, setGrowthRateInput] = useState<string>('');

  const {
    selectedScheme,
    inputs,
    results,
    isCalculating: _isCalculating,
    currentBitcoinPrice,
    bitcoinChange24h,
    isLoadingPrice,
    schemeCustomizations,
    setSelectedScheme,
    updateInputs,
    fetchBitcoinPrice,
    updateSchemeCustomization,
    addCustomVestingEvent,
    removeCustomVestingEvent,
    updateCustomVestingEvent,
    getEffectiveScheme,
    loadStaticData,
  } = useCalculatorStore();

  // Define all callbacks at the component level
  // Input change handlers - update local state and trigger immediate calculation
  const handleInitialGrantChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInitialGrantInput(value);
    // Trigger immediate update for valid numeric values
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateSchemeCustomization(selectedScheme.id, { initialGrant: numValue });
    }
  }, [selectedScheme.id, updateSchemeCustomization]);

  const handleAnnualGrantChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAnnualGrantInput(value);
    // Trigger immediate update for valid numeric values
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateSchemeCustomization(selectedScheme.id, { annualGrant: numValue });
    }
  }, [selectedScheme.id, updateSchemeCustomization]);

  const handleBitcoinGrowthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGrowthRateInput(e.target.value);
  }, []);

  // Blur handlers - parse, validate, and sync with store
  const handleInitialGrantBlur = useCallback((schemeId: string, defaultValue: number) => () => {
    const numValue = parseFloat(initialGrantInput) || defaultValue;
    const validValue = Math.max(0, numValue); // Ensure non-negative
    updateSchemeCustomization(schemeId, { initialGrant: validValue });
    setInitialGrantInput(validValue.toString());
  }, [initialGrantInput, updateSchemeCustomization]);

  const handleAnnualGrantBlur = useCallback((schemeId: string, defaultValue: number) => () => {
    const numValue = parseFloat(annualGrantInput) || defaultValue;
    const validValue = Math.max(0, numValue); // Ensure non-negative
    updateSchemeCustomization(schemeId, { annualGrant: validValue });
    setAnnualGrantInput(validValue.toString());
  }, [annualGrantInput, updateSchemeCustomization]);

  const handleBitcoinGrowthBlur = useCallback((defaultValue: number) => () => {
    const numValue = parseFloat(growthRateInput) || defaultValue;
    const clampedValue = Math.min(Math.max(numValue, 0), 70); // Enforce limits
    updateInputs({ projectedBitcoinGrowth: clampedValue });
    setGrowthRateInput(clampedValue.toString());
  }, [growthRateInput, updateInputs]);

  // Helper to set default vesting preset
  const _applyDefaultVestingPreset = useCallback((schemeId: string) => {
    // Define default Reward preset events
    const rewardEvents = [
      { id: `reward-1-${Date.now()}`, timePeriod: 60, percentageVested: 50, label: 'Year 5' },
      { id: `reward-2-${Date.now()}`, timePeriod: 120, percentageVested: 100, label: 'Year 10' },
    ];
    
    // Clear any existing custom events and apply Reward preset
    const currentEvents = schemeCustomizations[schemeId]?.customVestingEvents || [];
    currentEvents.forEach(event => removeCustomVestingEvent(schemeId, event.id));
    rewardEvents.forEach(event => addCustomVestingEvent(schemeId, event));
    setSelectedVestingPreset('reward');
  }, [schemeCustomizations, removeCustomVestingEvent, addCustomVestingEvent]);

  // Load all data in parallel for faster initialization
  useEffect(() => {
    const initializeCalculator = async () => {
      // Load static data and Bitcoin price in parallel
      const promises = [
        loadStaticData(),
        fetchBitcoinPrice()
      ];
      
      // Execute in parallel and handle errors gracefully
      await Promise.allSettled(promises);

      // Handle URL plan parameter
      if (planId && initialScheme && !isLoaded) {
        setSelectedScheme(initialScheme);
        // DO NOT apply any preset automatically - let the plan's default schedule show
        // Users can choose to apply a preset manually if they want
        setIsLoaded(true);
      }
    };

    initializeCalculator();
  }, [planId, initialScheme, isLoaded, fetchBitcoinPrice, setSelectedScheme, loadStaticData]);

  // Sync local input state with store values when scheme changes or customizations update
  useEffect(() => {
    if (selectedScheme) {
      const effectiveInitialGrant = schemeCustomizations[selectedScheme.id]?.initialGrant ?? selectedScheme.initialGrant;
      const effectiveAnnualGrant = schemeCustomizations[selectedScheme.id]?.annualGrant ?? selectedScheme.annualGrant ?? 0;
      
      setInitialGrantInput(effectiveInitialGrant.toString());
      setAnnualGrantInput(effectiveAnnualGrant.toString());
    }
  }, [selectedScheme, schemeCustomizations]);

  // Sync growth rate input with store value
  useEffect(() => {
    setGrowthRateInput((inputs.projectedBitcoinGrowth || 15).toString());
  }, [inputs.projectedBitcoinGrowth]);

  const handleSchemeSelect = useCallback((schemeId: string) => {
    const scheme = VESTING_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      
      // Clear any existing custom events for the new scheme
      const currentEvents = schemeCustomizations[schemeId]?.customVestingEvents || [];
      currentEvents.forEach(event => removeCustomVestingEvent(schemeId, event.id));
      
      // If a preset is currently selected, apply it to the new scheme
      if (selectedVestingPreset && VESTING_PRESETS[selectedVestingPreset as keyof typeof VESTING_PRESETS]) {
        const preset = VESTING_PRESETS[selectedVestingPreset as keyof typeof VESTING_PRESETS];
        // Create new events with unique IDs using timestamp and index
        const timestamp = Date.now();
        const presetEvents = preset.events.map((event, index) => ({
          ...event,
          id: `${selectedVestingPreset}-${timestamp}-${index}` // More robust ID generation
        }));
        
        // Apply the preset events to the new scheme
        presetEvents.forEach(event => addCustomVestingEvent(schemeId, event));
      }
      // Preserve the preset selection - don't clear it
      
      // Update URL without page reload
      window.history.replaceState(null, '', `/calculator/${schemeId}`);
    }
  }, [setSelectedScheme, schemeCustomizations, removeCustomVestingEvent, selectedVestingPreset, addCustomVestingEvent]);

  const displayScheme = selectedScheme ? getEffectiveScheme(selectedScheme) : null;
  
  // Calculate maxVestingMonths dynamically based on active schedule
  const maxVestingMonths = (() => {
    if (!displayScheme) return 0;
    
    // If custom vesting events are present, use the last event's timePeriod
    if (displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0) {
      const sortedEvents = [...displayScheme.customVestingEvents].sort((a, b) => a.timePeriod - b.timePeriod);
      return sortedEvents[sortedEvents.length - 1]?.timePeriod || 48;
    }
    
    // Otherwise use the original plan's schedule
    return Math.max(...displayScheme.vestingSchedule.map(m => m.months));
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[150px] py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-slate-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent">Build a </span>
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Sound Money Plan</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              A nickel ain't worth a dime anymore.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">
        {/* Calculator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Scheme Selection */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className={`card transition-all duration-300 ${
              selectedScheme?.id === 'accelerator'
                ? 'border-2 border-bitcoin/20 hover:border-bitcoin/30 bg-gradient-to-r from-bitcoin/5 to-orange-100/50 dark:from-bitcoin/10 dark:to-slate-800'
                : selectedScheme?.id === 'steady-builder'
                ? 'border-2 border-green-500/20 hover:border-green-500/30 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-slate-800'
                : selectedScheme?.id === 'slow-burn'
                ? 'border-2 border-blue-500/20 hover:border-blue-500/30 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-slate-800'
                : 'glass'
            }`}>
              <div className="flex items-center justify-center mb-6">
                <SatoshiIcon className="w-6 h-6 text-bitcoin mr-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  Choose a Plan
                </h2>
              </div>

              {/* Enhanced Scheme Tabs Selector */}
              <SchemeTabSelector 
                selectedScheme={selectedScheme}
                onSchemeSelect={handleSchemeSelect}
                currentPath="calculator"
              />
              
              {/* Vesting Presets Component - Moved here from Customize section */}
              {displayScheme && (
                <VestingPresets
                  schemeId={displayScheme.id}
                  selectedPreset={selectedVestingPreset}
                  onPresetSelect={(presetId, events) => {
                    setSelectedVestingPreset(presetId);
                    // Clear existing custom events and add new ones
                    const currentEvents = schemeCustomizations[displayScheme.id]?.customVestingEvents || [];
                    currentEvents.forEach(event => removeCustomVestingEvent(displayScheme.id, event.id));
                    events.forEach(event => addCustomVestingEvent(displayScheme.id, event));
                  }}
                />
              )}
            </div>

            {/* Financial Disclaimer */}
            <FinancialDisclaimer />

            {/* Scheme Customization */}
            {selectedScheme && (
              <div className="card mt-6 glass">
                <div 
                  className={`flex items-center justify-between cursor-pointer ${
                    isCustomizationCollapsed ? '' : 'mb-6'
                  }`}
                  onClick={() => setIsCustomizationCollapsed(!isCustomizationCollapsed)}
                >
                  <div className="flex items-center">
                    <CogIcon className="w-5 h-5 text-bitcoin mr-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                      Customize Your Plan
                    </h3>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${
                      isCustomizationCollapsed ? '-rotate-90' : ''
                    }`}
                  />
                </div>

                <div className={`space-y-6 transition-all duration-300 ${
                  isCustomizationCollapsed ? 'hidden' : ''
                }`}>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                      Bitcoin Award Amount
                      <HelpTooltip content={HELP_CONTENT.initialGrant} />
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={initialGrantInput}
                      onChange={handleInitialGrantChange}
                      onBlur={handleInitialGrantBlur(selectedScheme.id, selectedScheme.initialGrant)}
                      className="input-field"
                    />
                  </div>

                  {(selectedScheme.id === 'steady-builder' || selectedScheme.id === 'slow-burn') && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                        Yearly Bitcoin Award
                        <HelpTooltip content={HELP_CONTENT.annualGrant} />
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={annualGrantInput}
                        onChange={handleAnnualGrantChange}
                        onBlur={handleAnnualGrantBlur(selectedScheme.id, selectedScheme.annualGrant || 0)}
                        className="input-field"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                      Projected Annual Growth (%)
                      <HelpTooltip content={HELP_CONTENT.projectedGrowth} />
                    </label>
                    <input
                      type="number"
                      value={growthRateInput}
                      onChange={handleBitcoinGrowthChange}
                      onBlur={handleBitcoinGrowthBlur(15)}
                      className="input-field"
                      max="70"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Custom Vesting Schedule Dialog */}
                <div className={`mt-4 ${isCustomizationCollapsed ? 'hidden' : ''}`}>
                  <CustomVestingSchedule
                    schemeId={selectedScheme.id}
                    customVestingEvents={[...(schemeCustomizations[selectedScheme.id]?.customVestingEvents || [])]}
                    onAddEvent={(event) => addCustomVestingEvent(selectedScheme.id, event)}
                    onRemoveEvent={(eventId) => removeCustomVestingEvent(selectedScheme.id, eventId)}
                    onUpdateEvent={(eventId, updates) => updateCustomVestingEvent(selectedScheme.id, eventId, updates)}
                    triggerClassName="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 w-full min-w-0 overflow-hidden">
            {/* Unlock Timeline - Above chart */}
            {displayScheme && (
              <VestingProgress
                scheme={displayScheme}
                customVestingEvents={[...(displayScheme.customVestingEvents || [])]}
                className="mb-4"
              />
            )}
            
            {/* Bitcoin Price Projection Chart - Below VestingProgress, no card wrapper */}
            <ChartErrorBoundary>
              {results && displayScheme ? (
                <VestingTimelineChart
                  timeline={results.timeline}
                  initialGrant={displayScheme.initialGrant}
                  annualGrant={displayScheme.annualGrant}
                  projectedBitcoinGrowth={inputs.projectedBitcoinGrowth || 15}
                  currentBitcoinPrice={currentBitcoinPrice}
                  schemeId={displayScheme.id}
                  customVestingEvents={[...(displayScheme.customVestingEvents || [])]}
                />
              ) : (
                <ChartSkeleton />
              )}
            </ChartErrorBoundary>
            
            <React.Fragment>
            {/* Metric Cards Carousel */}
            <CalculatorErrorBoundary>
              {results && displayScheme ? (
                <MetricCards
                  displayScheme={displayScheme}
                  currentBitcoinPrice={currentBitcoinPrice}
                  results={results}
                  inputs={inputs}
                />
              ) : (
                <MetricCardsSkeleton />
              )}
            </CalculatorErrorBoundary>

            {/* Annual Breakdown Table */}
            {results && displayScheme && (
              <div className="card w-full overflow-hidden mt-8 md:mt-10 p-6 border-2 border-bitcoin dark:border-0">
                <VirtualizedAnnualBreakdown
                  yearlyData={results.timeline.filter((_, i) => i % 12 === 0).map((point, year) => ({
                    year,
                    btcBalance: point.employerBalance || 0,
                    usdValue: (point.employerBalance || 0) * (point.bitcoinPrice || currentBitcoinPrice),
                    bitcoinPrice: point.bitcoinPrice || currentBitcoinPrice,
                    vestedAmount: point.vestedAmount || 0,
                    vestingPercent: year >= 10 ? 100 : year >= 5 ? 50 : 0,
                    grantSize: year === 0 ? displayScheme.initialGrant : (displayScheme.annualGrant || 0),
                    grantCost: 0,
                    isInitialGrant: year === 0
                  }))}
                  initialGrant={displayScheme.initialGrant}
                  annualGrant={displayScheme.annualGrant}
                  currentBitcoinPrice={currentBitcoinPrice}
                  schemeId={displayScheme.id}
                  maxDisplayYears={11}
                />
              </div>
            )}

            </React.Fragment>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CalculatorPlanClient({ initialScheme, planId }: CalculatorPlanClientProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CalculatorSkeleton />}>
        <CalculatorErrorBoundary>
          <CalculatorContent initialScheme={initialScheme} planId={planId} />
        </CalculatorErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  );
}