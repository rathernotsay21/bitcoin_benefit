'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { VestingScheme } from '@/types/vesting';
import { ErrorBoundary, CalculatorErrorBoundary, ChartErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HelpTooltip from '@/components/HelpTooltip';
import { HELP_CONTENT } from '@/lib/help-content';
import { CogIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { CalculatorSkeleton, ChartSkeleton } from '@/components/loading/Skeletons';
import { MetricCardsSkeleton } from '@/components/loading/EnhancedSkeletons';
import VestingPresets from '@/components/VestingPresets';
import CustomVestingSchedule from '@/components/CustomVestingSchedule';
import VestingProgress from '@/components/VestingProgress';
import MetricCards from '@/components/MetricCards';
import SchemeTabSelector from '@/components/SchemeTabSelector';

// Lazy load the chart component
const VestingTimelineChart = dynamic(
  () => import('@/components/VestingTimelineChart'),
  {
    ssr: false, // Disable server-side rendering for this client-side component
    loading: () => <ChartSkeleton /> // Show a loading component
  }
);

interface CalculatorPlanClientProps {
  initialScheme: VestingScheme | undefined;
  planId: string;
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
  const [selectedVestingPreset, setSelectedVestingPreset] = useState<string>(''); // No default preset

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
  const handleInitialGrantChange = useCallback((schemeId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateSchemeCustomization(schemeId, { initialGrant: value });
  }, [updateSchemeCustomization]);

  const handleAnnualGrantChange = useCallback((schemeId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateSchemeCustomization(schemeId, { annualGrant: value });
  }, [updateSchemeCustomization]);

  const handleBitcoinGrowthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateInputs({ projectedBitcoinGrowth: parseFloat(e.target.value) || 0 });
  }, [updateInputs]);

  // Helper to set default vesting preset
  const _applyDefaultVestingPreset = useCallback((schemeId: string) => {
    // Define default Recruit preset events
    const recruitEvents = [
      { id: `recruit-1-${Date.now()}`, timePeriod: 3, percentageVested: 10, label: '90 Days' },
      { id: `recruit-2-${Date.now()}`, timePeriod: 12, percentageVested: 40, label: 'Year 1' },
      { id: `recruit-3-${Date.now()}`, timePeriod: 24, percentageVested: 100, label: 'Year 2' },
    ];
    
    // Clear any existing custom events and apply Recruit preset
    const currentEvents = schemeCustomizations[schemeId]?.customVestingEvents || [];
    currentEvents.forEach(event => removeCustomVestingEvent(schemeId, event.id));
    recruitEvents.forEach(event => addCustomVestingEvent(schemeId, event));
    setSelectedVestingPreset('recruit');
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

  const handleSchemeSelect = useCallback((schemeId: string) => {
    const scheme = VESTING_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      // DO NOT apply any preset automatically when switching schemes
      // Clear any custom events to show the plan's default schedule
      const currentEvents = schemeCustomizations[schemeId]?.customVestingEvents || [];
      currentEvents.forEach(event => removeCustomVestingEvent(schemeId, event.id));
      setSelectedVestingPreset('');
      // Update URL without page reload
      window.history.replaceState(null, '', `/calculator/${schemeId}`);
    }
  }, [setSelectedScheme, schemeCustomizations, removeCustomVestingEvent]);

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
    <div className="min-h-screen transition-colors duration-300">
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
              Design a plan that's right for your team
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">

        {/* Calculator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Scheme Selection */}
          <div className="lg:col-span-1 w-full min-w-0">
            {/* Bitcoin Price Banner */}
            <div className="card mb-6 bg-gradient-to-r from-bitcoin/10 to-yellow-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SatoshiIcon className="w-8 h-8 text-bitcoin mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {formatUSD(currentBitcoinPrice)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      Current Bitcoin Price
                      {isLoadingPrice && <span className="ml-2 animate-pulse">Updating...</span>}
                    </div>
                  </div>
                </div>
                {bitcoinChange24h !== 0 && bitcoinChange24h != null && (
                  <div className={`text-right ${bitcoinChange24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-lg font-semibold">
                      {bitcoinChange24h > 0 ? '+' : ''}{bitcoinChange24h.toFixed(2)}%
                    </div>
                    <div className="text-sm">24h Change</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card glass">
              <div className="flex items-center mb-6">
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
              {selectedScheme && (
                <VestingPresets
                  schemeId={selectedScheme.id}
                  selectedPreset={selectedVestingPreset}
                  onPresetSelect={(presetId, events) => {
                    setSelectedVestingPreset(presetId);
                    // Clear existing custom events and add new ones
                    const currentEvents = schemeCustomizations[selectedScheme.id]?.customVestingEvents || [];
                    currentEvents.forEach(event => removeCustomVestingEvent(selectedScheme.id, event.id));
                    events.forEach(event => addCustomVestingEvent(selectedScheme.id, event));
                  }}
                />
              )}
            </div>

            {/* Scheme Customization */}
            {selectedScheme && (
              <div className="card mt-6 glass">
                <div className="flex items-center mb-6">
                  <CogIcon className="w-5 h-5 text-bitcoin mr-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Customize Your Plan
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                      Bitcoin Bonus Amount
                      <HelpTooltip content={HELP_CONTENT.initialGrant} />
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={schemeCustomizations[selectedScheme.id]?.initialGrant ?? selectedScheme.initialGrant}
                      onChange={handleInitialGrantChange(selectedScheme.id)}
                      className="input-field"
                    />
                  </div>

                  {(selectedScheme.id === 'steady-builder' || selectedScheme.id === 'slow-burn') && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center">
                        Yearly Bitcoin Bonus
                        <HelpTooltip content={HELP_CONTENT.annualGrant} />
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={(schemeCustomizations[selectedScheme.id]?.annualGrant ?? selectedScheme.annualGrant) || 0}
                        onChange={handleAnnualGrantChange(selectedScheme.id)}
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
                      value={inputs.projectedBitcoinGrowth || 15}
                      onChange={handleBitcoinGrowthChange}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Custom Vesting Schedule Dialog */}
                <div className="mt-4">
                  <CustomVestingSchedule
                    schemeId={selectedScheme.id}
                    customVestingEvents={schemeCustomizations[selectedScheme.id]?.customVestingEvents || []}
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
            {/* Metric Cards Carousel */}
            <div className="mb-8 px-6 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-lg text-gray-600 dark:text-slate-400 leading-[1.75] max-w-3xl mx-auto text-left px-8 md:px-12">
                This tool shows you how a Bitcoin award could play out for one of your employees. The numbers on the right will change based on the plan, schedule, and growth you set on the left. It helps you see how a small investment in Bitcoin today could become a great reward for your team down the road.
              </p>
            </div>
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

            {/* Unlocking Progress */}
            {displayScheme && (
              <>
                <div className="mb-6 mt-8 px-6 py-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg text-gray-600 dark:text-slate-400 leading-[1.75] max-w-2xl mx-auto text-left px-8 md:px-12">
                    The bar below shows you how much of the Bitcoin award an employee has actually earned at any point in time. They earn it piece by piece the longer they stay with you, according to the schedule you set.
                  </p>
                </div>
              <VestingProgress
                scheme={displayScheme}
                customVestingEvents={displayScheme.customVestingEvents}
                className="mb-6"
              />
              </>
            )}

            {/* Unlocking Timeline Chart */}
            <div className="mb-6 px-6 py-6 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
              <p className="text-lg text-gray-600 dark:text-slate-400 leading-[1.75] max-w-2xl mx-auto text-left px-8 md:px-12">
                The 10-year projection chart gives you a look at potential future value. It shows how the total value of the Bitcoin award in U.S. dollars could grow over the next 10 years, based on the annual growth percentage you entered.
              </p>
            </div>
            <div className="card w-full overflow-hidden">
              <ChartErrorBoundary>
                {results && displayScheme ? (
                  <VestingTimelineChart
                    timeline={results.timeline}
                    initialGrant={displayScheme.initialGrant}
                    annualGrant={displayScheme.annualGrant}
                    projectedBitcoinGrowth={inputs.projectedBitcoinGrowth || 15}
                    currentBitcoinPrice={currentBitcoinPrice}
                    schemeId={displayScheme.id}
                    customVestingEvents={displayScheme.customVestingEvents}
                  />
                ) : (
                  <ChartSkeleton />
                )}
              </ChartErrorBoundary>
            </div>

            {/* Detailed Breakdown */}
            {displayScheme && (
              <div className="card mt-6">
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  {displayScheme.name} Plan Details
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                    <span className="text-gray-600 dark:text-slate-300">Starting Award</span>
                    <span className="font-semibold dark:text-slate-100">{formatBTC(displayScheme.initialGrant)}</span>
                  </div>
                  {displayScheme.annualGrant && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                      <span className="text-gray-600 dark:text-slate-300">Yearly Award</span>
                      <span className="font-semibold dark:text-slate-100">{formatBTC(displayScheme.annualGrant)} per year</span>
                    </div>
                  )}

                  {displayScheme.bonuses && displayScheme.bonuses.length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                      <span className="text-gray-600 dark:text-slate-300">Awards</span>
                      <span className="font-semibold dark:text-slate-100">
                        {displayScheme.bonuses.map(b => `${b.bonusPercent}%`).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-slate-300">Time to Earn 100%</span>
                    <span className="font-semibold dark:text-slate-100">
                      {maxVestingMonths >= 12 
                        ? `${Math.round(maxVestingMonths / 12)} year${Math.round(maxVestingMonths / 12) !== 1 ? 's' : ''}`
                        : `${maxVestingMonths} month${maxVestingMonths !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Unlocking Schedule */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Earning Schedule</h4>
                  <div className="space-y-2">
                    {displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0 ? (
                      // Show custom vesting events
                      displayScheme.customVestingEvents
                        .sort((a, b) => a.timePeriod - b.timePeriod)
                        .map((event, _index) => (
                          <div key={event.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm py-3 border-b border-gray-50 dark:border-slate-700">
                            <span className="text-gray-600 dark:text-slate-300 font-medium">
                              {event.label}
                            </span>
                            <span className="font-bold text-base sm:text-sm dark:text-slate-100 text-right sm:text-left">
                              {(() => {
                                const events = displayScheme.customVestingEvents?.sort((a, b) => a.timePeriod - b.timePeriod) || [];
                                const currentIndex = events.findIndex(e => e.id === event.id);
                                const incrementalPercent = currentIndex === 0 ? event.percentageVested : event.percentageVested - (events[currentIndex - 1]?.percentageVested || 0);
                                return `+${incrementalPercent}% → ${event.percentageVested}% total`;
                              })()}
                            </span>
                          </div>
                        ))
                    ) : (
                      // Show default unlocking schedule
                      displayScheme.vestingSchedule.map((milestone, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm py-3 border-b border-gray-50 dark:border-slate-700">
                          <span className="text-gray-600 dark:text-slate-300 font-medium">
                            {milestone.months === 0 ? 'Immediate' : `${milestone.months} months`}
                          </span>
                          <span className="font-bold text-base sm:text-sm dark:text-slate-100 text-right sm:text-left">
                          {milestone.grantPercent}% award earned
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Unlocking Schedule Explanation */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0 ? (
                      // Custom Schedule Active
                      <>
                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          Custom Earning Timeline
                        </h5>
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          <p className="mb-3">
                            This plan uses a <strong>custom earning schedule</strong> with {displayScheme.customVestingEvents.length} milestone{displayScheme.customVestingEvents.length !== 1 ? 's' : ''},
                            completing over {maxVestingMonths >= 12 
                              ? `${Math.round(maxVestingMonths / 12)} year${Math.round(maxVestingMonths / 12) !== 1 ? 's' : ''}`
                              : `${maxVestingMonths} month${maxVestingMonths !== 1 ? 's' : ''}`}.
                          </p>
                          <div className="mt-2 space-y-1">
                            {displayScheme.customVestingEvents
                              .sort((a, b) => a.timePeriod - b.timePeriod)
                              .map((event, index) => (
                                <p key={event.id} className="text-xs">
                                  • {event.label || `Milestone ${index + 1}`}: {event.percentageVested}% unlocked at {event.timePeriod} month{event.timePeriod !== 1 ? 's' : ''}
                                </p>
                              ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      // Default Schedule Active
                      <>
                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          {displayScheme.name} Earning Timeline
                        </h5>
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          {/* Show the default unlocking schedule for this plan */}
                          <p className="mb-3">
                            <strong>Default {displayScheme.name} schedule:</strong> Unlocking over {Math.round(maxVestingMonths / 12)} years
                          </p>
                          
                          {/* Show plan-specific descriptions only when using default schedule */}
                          {displayScheme.id === 'accelerator' && (
                            <div>
                              <p className="mb-2">• <strong>Pioneer approach:</strong> 0.02 BTC immediate grant for early Bitcoin adopters</p>
                              <p className="mb-2">• <strong>Leadership positioning:</strong> Perfect for companies ready to lead in digital asset compensation</p>
                              <p>• <strong>Immediate impact:</strong> Jump-start your team's Bitcoin journey with upfront commitment</p>
                            </div>
                          )}
                          {displayScheme.id === 'steady-builder' && (
                            <div>
                              <p className="mb-2">• <strong>Strategic distribution:</strong> Large initial grant + small yearly grants</p>
                              <p className="mb-2">• <strong>Risk mitigation:</strong> Reduce market timing risk with conservative approach</p>
                              <p>• <strong>Dollar-cost advantage:</strong> Ideal for companies taking measured steps into Bitcoin adoption</p>
                            </div>
                          )}
                          {displayScheme.id === 'slow-burn' && (
                            <div>
                              <p className="mb-2">• <strong>Delayed expense:</strong> BTC yearly for 10 years (no initial grant)</p>
                              <p className="mb-2">• <strong>Highest Cost:</strong> Designed for companies prioritizing short-term savings</p>
                              <p>• <strong>Wealth building:</strong> Build the same reserve at a slower rate</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}




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
