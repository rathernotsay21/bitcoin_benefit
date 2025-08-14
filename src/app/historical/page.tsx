'use client';

import Link from 'next/link';
import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';
import { HISTORICAL_VESTING_SCHEMES } from '@/lib/historical-vesting-schemes';
import YearSelector from '@/components/YearSelector';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChartBarIcon, ClockIcon, CogIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { HistoricalSkeleton, ChartSkeleton } from '@/components/loading/Skeletons';

// Lazy load the historical visualization component
const HistoricalTimelineVisualization = dynamic(
  () => import('@/components/HistoricalTimelineVisualization'),
  {
    ssr: false, // Disable server-side rendering for this client-side component
    loading: () => <ChartSkeleton /> // Show a loading component
  }
);

function formatBTC(amount: number): string {
  return `₿${amount.toFixed(3)}`;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function HistoricalCalculatorContent() {
  const searchParams = useSearchParams();
  
  const {
    selectedScheme,
    startingYear,
    costBasisMethod,
    schemeCustomizations,
    historicalPrices,
    currentBitcoinPrice,
    isLoadingHistoricalData,
    historicalDataError,
    historicalResults,
    isCalculating,
    calculationError,
    
    setStartingYear,
    setCostBasisMethod,
    setSelectedScheme,
    updateSchemeCustomization,
    fetchHistoricalData,
    fetchCurrentBitcoinPrice,
    getEffectiveScheme,
    loadStaticData,
  } = useHistoricalCalculatorStore();

  // Handle scheme query parameter
  useEffect(() => {
    const schemeParam = searchParams.get('scheme');
    if (schemeParam) {
      // Map scheme names to valid IDs
      const schemeMap: Record<string, string> = {
        'accelerator': 'accelerator',
        'steady-builder': 'steady-builder',
        'slow-burn': 'slow-burn',
        // Also handle the display names
        'pioneer': 'accelerator',
        'stacker': 'steady-builder',
        'builder': 'slow-burn'
      };
      
      const schemeId = schemeMap[schemeParam.toLowerCase()];
      if (schemeId) {
        const scheme = HISTORICAL_VESTING_SCHEMES.find(s => s.id === schemeId);
        if (scheme && (!selectedScheme || selectedScheme.id !== schemeId)) {
          setSelectedScheme(scheme);
        }
      }
    }
  }, [searchParams, selectedScheme, setSelectedScheme]);

  // Load initial data
  useEffect(() => {
    const initializeHistorical = async () => {
      // Load static data first for instant display
      await loadStaticData();
      
      // Then fetch current price and historical data in background
      fetchCurrentBitcoinPrice();
      fetchHistoricalData();
    };
    
    initializeHistorical();
  }, [fetchCurrentBitcoinPrice, fetchHistoricalData, loadStaticData]);

  const handleSchemeSelect = (schemeId: string) => {
    const scheme = HISTORICAL_VESTING_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      setSelectedScheme(scheme);
    }
  };

  const displayScheme = selectedScheme ? getEffectiveScheme(selectedScheme) : null;
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">

        {/* Calculator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 w-full min-w-0 space-y-6">
            {/* Scheme Selection */}
            <div className="card glass">
              <div className="flex items-center mb-6">
                <SatoshiIcon className="w-6 h-6 text-bitcoin mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Historical Strategy
                </h2>
              </div>

              <div className="space-y-4">
                {HISTORICAL_VESTING_SCHEMES.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                      selectedScheme?.id === scheme.id
                        ? 'border-bitcoin bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-slate-600 hover:border-bitcoin hover:shadow-md hover:scale-102'
                    }`}
                    onClick={() => handleSchemeSelect(scheme.id)}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="scheme"
                        className="text-orange-600"
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

            {/* Historical Configuration */}
            <div className="card glass">
              <div className="flex items-center mb-4">
                <CogIcon className="w-5 h-5 text-bitcoin mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Historical Strategy
                </h3>
              </div>

              <div className="space-y-4">
                <YearSelector
                  selectedYear={startingYear}
                  onYearChange={setStartingYear}
                  disabled={isLoadingHistoricalData}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Benefit Cost Method
                  </label>
                  <select
                    value={costBasisMethod}
                    onChange={(e) => setCostBasisMethod(e.target.value as 'high' | 'low' | 'average')}
                    className="input-field"
                    disabled={isLoadingHistoricalData}
                  >
                    <option value="average">Yearly Average Price</option>
                    <option value="high">Yearly High Price</option>
                    <option value="low">Yearly Low Price</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Method used to calculate the initial cost for employee benefit grants
                  </p>
                </div>

                {/* Grant Customization */}
                {selectedScheme && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Initial Grant (BTC)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={schemeCustomizations[selectedScheme.id]?.initialGrant ?? selectedScheme.initialGrant}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateSchemeCustomization(selectedScheme.id, { initialGrant: value });
                        }}
                        className="input-field"
                        disabled={isLoadingHistoricalData}
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
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            updateSchemeCustomization(selectedScheme.id, { annualGrant: value });
                          }}
                          className="input-field"
                          disabled={isLoadingHistoricalData}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>


          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 w-full min-w-0 overflow-hidden">
            {/* Loading State */}
            {isLoadingHistoricalData && (
              <div className="card text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  Loading Historical Data
                </h3>
                <p className="text-gray-600 dark:text-slate-300">
                  Fetching benefit value data from {startingYear} to {currentYear}...
                </p>
              </div>
            )}

            {/* Error State */}
            {(historicalDataError || calculationError) && (
              <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="text-center">
                  <div className="text-red-600 dark:text-red-400 text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                    {historicalDataError ? 'Data Loading Error' : 'Calculation Error'}
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mb-4">
                    {historicalDataError || calculationError}
                  </p>
                  <button
                    onClick={fetchHistoricalData}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoadingHistoricalData && !historicalDataError && !calculationError && historicalResults && displayScheme && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {formatBTC(historicalResults.totalBitcoinGranted)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">Total Benefits Granted</div>
                  </div>
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {formatUSD(historicalResults.totalCostBasis)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">Total Benefit Cost</div>
                  </div>
                  <div className="card text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatUSD(historicalResults.currentTotalValue)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">Value</div>
                  </div>
                </div>

                {/* Historical Timeline Visualization */}
                <div className="card mb-6">
                  <HistoricalTimelineVisualization
                    results={historicalResults}
                    startingYear={startingYear}
                    currentBitcoinPrice={currentBitcoinPrice}
                    historicalPrices={historicalPrices}
                    costBasisMethod={costBasisMethod}
                  />
                </div>

                {/* Annual Breakdown */}
                <div className="card mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Annual Breakdown
                  </h3>
                  
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase">Year</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase hidden sm:table-cell">Grant Cost</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase">BTC</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase hidden md:table-cell">BTC Price</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase hidden lg:table-cell">Historical USD</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase">Current USD</th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {(() => {
                          // Get yearly data points (December of each year or current month for current year)
                          const currentYear = new Date().getFullYear();
                          const startYear = startingYear;
                          const yearlyPoints = [];
                          
                          for (let year = startYear; year <= currentYear; year++) {
                            // Find the last point for this year (December or current month for current year)
                            const yearPoints = historicalResults.timeline.filter(p => p.year === year);
                            if (yearPoints.length > 0) {
                              const lastPoint = yearPoints[yearPoints.length - 1];
                              yearlyPoints.push(lastPoint);
                            }
                          }
                          
                          return yearlyPoints.map((point) => {
                            const year = point.year;
                            const yearsFromStart = year - startingYear;
                            const vestingPercent = yearsFromStart >= 10 ? 100 : yearsFromStart >= 5 ? 50 : 0;
                            
                            // Calculate grant cost for this year
                            let grantCost = 0;
                            // Look for grants that were allocated in this year from the grant breakdown
                            const yearGrants = historicalResults.grantBreakdown.filter(grant => grant.year === year);
                            if (yearGrants.length > 0) {
                              grantCost = yearGrants.reduce((sum, grant) => {
                                const grantYearPrices = historicalPrices[grant.year];
                                if (grantYearPrices) {
                                  let grantPrice = 0;
                                  switch (costBasisMethod) {
                                    case 'high':
                                      grantPrice = grantYearPrices.high;
                                      break;
                                    case 'low':
                                      grantPrice = grantYearPrices.low;
                                      break;
                                    case 'average':
                                      grantPrice = grantYearPrices.average;
                                      break;
                                  }
                                  return sum + (grant.amount * grantPrice);
                                }
                                return sum;
                              }, 0);
                            }
                            
                            // Get historical benefit value for this year
                            const yearPrices = historicalPrices[year];
                            let historicalBenefitValue = 0;
                            if (yearPrices) {
                              switch (costBasisMethod) {
                                case 'high':
                                  historicalBenefitValue = yearPrices.high;
                                  break;
                                case 'low':
                                  historicalBenefitValue = yearPrices.low;
                                  break;
                                case 'average':
                                  historicalBenefitValue = yearPrices.average;
                                  break;
                              }
                            }
                            
                            // Calculate historical USD value using that year's value
                            const historicalUsdValue = point.cumulativeBitcoin * historicalBenefitValue;

                            return (
                              <tr key={year} className={
                                yearsFromStart === 10 ? 'bg-green-50 dark:bg-green-900/20' : 
                                yearsFromStart === 5 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                              }>
                                <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{year}</td>
                                <td className="px-2 sm:px-4 py-2 text-sm text-gray-700 dark:text-white/90 hidden sm:table-cell">
                                  {grantCost > 0 ? (
                                    <span className="font-medium text-orange-600 dark:text-orange-400">{formatUSD(grantCost)}</span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-white/50">—</span>
                                  )}
                                </td>
                                <td className="px-2 sm:px-4 py-2 text-sm text-gray-700 dark:text-white/90">{formatBTC(point.cumulativeBitcoin)}</td>
                                <td className="px-2 sm:px-4 py-2 text-sm text-gray-700 dark:text-white/90 hidden md:table-cell">
                                  {historicalBenefitValue > 0 ? formatUSD(historicalBenefitValue) : '—'}
                                </td>
                                <td className="px-2 sm:px-4 py-2 text-sm text-gray-700 dark:text-white/90 hidden lg:table-cell">
                                  {historicalBenefitValue > 0 ? formatUSD(historicalUsdValue) : '—'}
                                </td>
                                <td className="px-2 sm:px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatUSD(point.currentValue)}
                                </td>
                                <td className="px-2 sm:px-4 py-2 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    vestingPercent === 100 ? 'bg-green-100 text-green-800' :
                                    vestingPercent === 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {vestingPercent}% Vested
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Grant Cost Summary */}
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-semibold text-orange-900 dark:text-orange-200">Total Benefit Cost</h5>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          Based on historical {costBasisMethod} benefit values for each grant year
                        </p>

                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
                          {formatUSD(historicalResults.totalCostBasis)}
                        </div>
                        <div className="text-xs text-bitcoin dark:text-bitcoin">
                          {formatBTC(historicalResults.totalBitcoinGranted)} total grants
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {formatUSD(historicalResults.totalReturn)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Total Return</div>
                      <div className="text-sm text-gray-500 dark:text-white/70">
                        {formatPercent(historicalResults.totalReturn / historicalResults.totalCostBasis)} gain
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {formatPercent(historicalResults.annualizedReturn)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Annualized Return</div>
                      <div className="text-sm text-gray-500 dark:text-white/70">
                        Over {historicalResults.summary.yearsAnalyzed} years
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-white/80">Analysis Period:</span>
                          <span className="font-semibold dark:text-white">
                            {historicalResults.summary.startingYear} - {historicalResults.summary.endingYear}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-white/80">Benefit Cost Method:</span>
                          <span className="font-semibold dark:text-white capitalize">
                            {historicalResults.summary.costBasisMethod}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-white/80">Average Annual Grant:</span>
                          <span className="font-semibold dark:text-white">
                            {formatBTC(historicalResults.summary.averageAnnualGrant)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-white/80">Current Benefit Value:</span>
                          <span className="font-semibold dark:text-white">
                            {formatUSD(currentBitcoinPrice)} per unit
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!isLoadingHistoricalData && !historicalDataError && !calculationError && !historicalResults && (
              <div className="card text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600 dark:text-white/90">
                  Select a vesting scheme to see how it would have performed historically
                </p>
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

export default function HistoricalCalculatorPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<HistoricalSkeleton />}>
        <HistoricalCalculatorContent />
      </Suspense>
    </ErrorBoundary>
  );
}