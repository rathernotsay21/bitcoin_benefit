'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { VestingScheme } from '@/types/vesting';
import { ErrorBoundary, CalculatorErrorBoundary, ChartErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChartBarIcon, CogIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { CalculatorSkeleton, ChartSkeleton } from '@/components/loading/Skeletons';
import VestingPresets from '@/components/VestingPresets';

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
  const [selectedVestingPreset, setSelectedVestingPreset] = useState<string>('recruit'); // Default to Recruit

  const {
    selectedScheme,
    inputs,
    results,
    isCalculating,
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
  const applyDefaultVestingPreset = useCallback((schemeId: string) => {
    // Define default Recruit preset events
    const recruitEvents = [
      { id: `recruit-1-${Date.now()}`, timePeriod: 3, percentageVested: 5, label: '90 Days' },
      { id: `recruit-2-${Date.now()}`, timePeriod: 12, percentageVested: 20, label: 'Year 1' },
      { id: `recruit-3-${Date.now()}`, timePeriod: 24, percentageVested: 40, label: 'Year 2' },
      { id: `recruit-4-${Date.now()}`, timePeriod: 36, percentageVested: 60, label: 'Year 3' },
      { id: `recruit-5-${Date.now()}`, timePeriod: 48, percentageVested: 100, label: 'Year 4' },
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
        // Apply default Recruit preset
        applyDefaultVestingPreset(initialScheme.id);
        setIsLoaded(true);
      }
    };

    initializeCalculator();
  }, [planId, initialScheme, isLoaded, fetchBitcoinPrice, setSelectedScheme, loadStaticData, applyDefaultVestingPreset]);

  const handleSchemeSelect = useCallback((schemeId: string) => {
    const scheme = VESTING_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      // Apply default Recruit preset for new scheme
      applyDefaultVestingPreset(scheme.id);
      // Update URL without page reload
      window.history.replaceState(null, '', `/calculator/${schemeId}`);
    }
  }, [setSelectedScheme, applyDefaultVestingPreset]);

  const displayScheme = selectedScheme ? getEffectiveScheme(selectedScheme) : null;
  const maxVestingMonths = displayScheme ? Math.max(...displayScheme.vestingSchedule.map(m => m.months)) : 0;

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">

        {/* Calculator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Scheme Selection */}
          <div className="lg:col-span-1 w-full min-w-0">
            <div className="card glass">
              <div className="flex items-center mb-6">
                <SatoshiIcon className="w-6 h-6 text-bitcoin mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Pick a Strategy
                </h2>
              </div>

              <div className="space-y-4">
                {/* Predefined Schemes */}
                {VESTING_SCHEMES.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${selectedScheme?.id === scheme.id
                        ? 'border-bitcoin bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-slate-600 hover:border-bitcoin hover:shadow-md hover:scale-102'
                      }`}
                    onClick={() => handleSchemeSelect(scheme.id)}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="scheme"
                        className="w-5 h-5 text-bitcoin focus:ring-bitcoin"
                        checked={selectedScheme?.id === scheme.id}
                        onChange={() => handleSchemeSelect(scheme.id)}
                      />
                      <label className="ml-3 font-bold text-lg text-gray-900 dark:text-slate-100">{scheme.name}</label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 ml-6">
                      {scheme.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheme Customization */}
            {selectedScheme && (
              <div className="card mt-6 glass">
                <div className="flex items-center mb-4">
                  <CogIcon className="w-5 h-5 text-bitcoin mr-2" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    Customize Your Scheme
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Initial Grant (BTC)
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Annual Grant (BTC)
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Projected Annual Growth (%)
                    </label>
                    <input
                      type="number"
                      value={inputs.projectedBitcoinGrowth || 15}
                      onChange={handleBitcoinGrowthChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                {/* Vesting Presets Component */}
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
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 w-full min-w-0 overflow-hidden">
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
                {bitcoinChange24h !== 0 && (
                  <div className={`text-right ${bitcoinChange24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-lg font-semibold">
                      {bitcoinChange24h > 0 ? '+' : ''}{bitcoinChange24h.toFixed(2)}%
                    </div>
                    <div className="text-sm">24h Change</div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            {displayScheme && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatBTC(displayScheme.initialGrant)}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-300">Initial Grant</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {formatUSD(displayScheme.initialGrant * currentBitcoinPrice)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-300">Initial USD Value</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {results && results.timeline.length > 120 
                      ? formatUSD(results.timeline[120].employerBalance * results.timeline[120].bitcoinPrice)
                      : (() => {
                        // Calculate fallback 10-year value based on scheme type
                        let totalBTC = displayScheme.initialGrant;
                        if (displayScheme.annualGrant) {
                          const maxAnnualYears = displayScheme.id === 'slow-burn' ? 10 : 5;
                          const yearsToAdd = Math.min(10, maxAnnualYears);
                          totalBTC += displayScheme.annualGrant * yearsToAdd;
                        }
                        const projectedPrice = currentBitcoinPrice * Math.pow(1.15, 10);
                        return formatUSD(totalBTC * projectedPrice);
                      })()
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-300">10-Year USD Value</div>
                </div>
              </div>
            )}

            {/* Vesting Timeline Chart */}
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                    Vesting Timeline
                  </h3>
                  <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-slate-400">
                      <div className="text-4xl mb-2">📊</div>
                      <div>
                        {isCalculating ? 'Calculating timeline...' : 'Select a scheme to see 20-year projections'}
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </ChartErrorBoundary>
            </div>

            {/* Detailed Breakdown */}
            {displayScheme && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Scheme Details: {displayScheme.name}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                    <span className="text-gray-600 dark:text-slate-300">Initial Grant</span>
                    <span className="font-semibold dark:text-slate-100">{formatBTC(displayScheme.initialGrant)}</span>
                  </div>
                  {displayScheme.annualGrant && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                      <span className="text-gray-600 dark:text-slate-300">Annual Grant</span>
                      <span className="font-semibold dark:text-slate-100">{formatBTC(displayScheme.annualGrant)} per year</span>
                    </div>
                  )}

                  {displayScheme.bonuses && displayScheme.bonuses.length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                      <span className="text-gray-600 dark:text-slate-300">Bonuses</span>
                      <span className="font-semibold dark:text-slate-100">
                        {displayScheme.bonuses.map(b => `${b.bonusPercent}%`).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-slate-300">Full Vesting Period</span>
                    <span className="font-semibold dark:text-slate-100">
                      {Math.round(maxVestingMonths / 12)} years
                    </span>
                  </div>
                </div>

                {/* Vesting Schedule */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Vesting Schedule</h4>
                  <div className="space-y-2">
                    {displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0 ? (
                      // Show custom vesting events
                      displayScheme.customVestingEvents
                        .sort((a, b) => a.timePeriod - b.timePeriod)
                        .map((event, index) => (
                          <div key={event.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm py-3 border-b border-gray-50 dark:border-slate-700">
                            <span className="text-gray-600 dark:text-slate-300 font-medium">
                              {event.label}
                            </span>
                            <span className="font-bold text-base sm:text-sm dark:text-slate-100 text-right sm:text-left">
                              {(() => {
                                const events = displayScheme.customVestingEvents?.sort((a, b) => a.timePeriod - b.timePeriod) || [];
                                const currentIndex = events.findIndex(e => e.id === event.id);
                                const incrementalPercent = currentIndex === 0 ? event.percentageVested : event.percentageVested - events[currentIndex - 1].percentageVested;
                                return `+${incrementalPercent}% → ${event.percentageVested}% total`;
                              })()}
                            </span>
                          </div>
                        ))
                    ) : (
                      // Show default vesting schedule
                      displayScheme.vestingSchedule.map((milestone, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 text-sm py-3 border-b border-gray-50 dark:border-slate-700">
                          <span className="text-gray-600 dark:text-slate-300 font-medium">
                            {milestone.months === 0 ? 'Immediate' : `${milestone.months} months`}
                          </span>
                          <span className="font-bold text-base sm:text-sm dark:text-slate-100 text-right sm:text-left">
                            {milestone.grantPercent}% grant vested
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Vesting Schedule Explanation */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      {displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0 
                        ? 'Custom Vesting Timeline:'
                        : 'Standardized Vesting Timeline:'}
                    </h5>
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      {displayScheme.customVestingEvents && displayScheme.customVestingEvents.length > 0 ? (
                        <p className="mb-3">
                          <strong>Using custom vesting schedule</strong> with {displayScheme.customVestingEvents.length} vesting event(s)
                        </p>
                      ) : (
                        <p className="mb-3"><strong>All schemes follow the same vesting schedule:</strong> 50% at 5 years, 100% at 10 years</p>
                      )}
                      
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
