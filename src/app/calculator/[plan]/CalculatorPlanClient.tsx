'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { VestingScheme } from '@/types/vesting';
import VestingTimelineChart from '@/components/VestingTimelineChart';
import { ErrorBoundary, CalculatorErrorBoundary, ChartErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import { ChartBarIcon, CogIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { CalculatorSkeleton } from '@/components/loading/Skeletons';

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
    getEffectiveScheme,
    loadStaticData,
  } = useCalculatorStore();

  // Load static data first, then Bitcoin price, then handle URL parameters
  useEffect(() => {
    const initializeCalculator = async () => {
      // Load static data first for instant display
      await loadStaticData();
      
      // Then fetch live Bitcoin price in background
      fetchBitcoinPrice();

      // Handle URL plan parameter
      if (planId && initialScheme && !isLoaded) {
        setSelectedScheme(initialScheme);
        setIsLoaded(true);
      }
    };

    initializeCalculator();
  }, [planId, initialScheme, isLoaded, fetchBitcoinPrice, setSelectedScheme, loadStaticData]);

  const handleSchemeSelect = useCallback((schemeId: string) => {
    const scheme = VESTING_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
      // Update URL without page reload
      window.history.replaceState(null, '', `/calculator/${schemeId}`);
    }
  }, [setSelectedScheme]);

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
                      onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateSchemeCustomization(selectedScheme.id, { initialGrant: value });
                      }, [selectedScheme.id, updateSchemeCustomization])}
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
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateSchemeCustomization(selectedScheme.id, { annualGrant: value });
                        }, [selectedScheme.id, updateSchemeCustomization])}
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
                      onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => updateInputs({ projectedBitcoinGrowth: parseFloat(e.target.value) || 0 }), [updateInputs])}
                      className="input-field"
                    />
                  </div>
                </div>
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
                    {displayScheme.vestingSchedule.map((milestone, index) => (
                      <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-slate-300">
                          {milestone.months === 0 ? 'Immediate' : `${milestone.months} months`}
                        </span>
                        <span className="font-medium dark:text-slate-100">
                          {milestone.grantPercent}% grant vested
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Vesting Schedule Explanation */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Standardized Vesting Timeline:</h5>
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="mb-3"><strong>All schemes follow the same vesting schedule:</strong> 50% at 5 years, 100% at 10 years</p>
                      
                      {displayScheme.id === 'accelerator' && (
                        <div>
                          <p className="mb-2">• <strong>Pioneer approach:</strong> 0.02 BTC immediate grant for early Bitcoin adopters</p>
                          <p className="mb-2">• <strong>Leadership positioning:</strong> Perfect for companies ready to lead in digital asset compensation</p>
                          <p>• <strong>Immediate impact:</strong> Jump-start your team's Bitcoin journey with upfront commitment</p>
                        </div>
                      )}
                      {displayScheme.id === 'steady-builder' && (
                        <div>
                          <p className="mb-2">• <strong>Strategic distribution:</strong> 0.015 BTC initial + 0.001 BTC yearly grants</p>
                          <p className="mb-2">• <strong>Risk mitigation:</strong> Minimize market timing risk with conservative approach</p>
                          <p>• <strong>Dollar-cost advantage:</strong> Ideal for companies taking measured steps into Bitcoin adoption</p>
                        </div>
                      )}
                      {displayScheme.id === 'slow-burn' && (
                        <div>
                          <p className="mb-2">• <strong>Maximum retention:</strong> 0.002 BTC yearly for 10 years (no initial grant)</p>
                          <p className="mb-2">• <strong>Loyalty focus:</strong> Designed for companies prioritizing long-term employee commitment</p>
                          <p>• <strong>Wealth building:</strong> Creates strong incentive for employees to stay and grow with the company</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {results && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Calculation Results
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-bitcoin">
                      {formatBTC(results.totalBitcoinNeeded)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">Total Bitcoin Needed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {formatUSD(results.totalCost)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">Total Cost (Current Price)</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="text-sm text-gray-600 dark:text-slate-300">
                    <p>Projections assume {inputs.projectedBitcoinGrowth || 15}% annual Bitcoin growth.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Explore More
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  href="/historical" 
                  className="btn-secondary flex items-center justify-center"
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Historical Analysis
                </Link>
                <Link 
                  href="/learn-more" 
                  className="btn-secondary flex items-center justify-center"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
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
