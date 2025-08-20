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
import { ChartBarIcon, ClockIcon, CogIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { HistoricalSkeleton, ChartSkeleton } from '@/components/loading/Skeletons';
import { MetricCardsSkeleton, TableSkeleton } from '@/components/loading/EnhancedSkeletons';
import HistoricalMetricCards from '@/components/HistoricalMetricCards';
import SchemeTabSelector from '@/components/SchemeTabSelector';
import HistoricalDataTable from '@/components/HistoricalDataTable';

// Lazy load the optimized historical visualization component
const HistoricalTimelineVisualization = dynamic(
  () => import('@/components/HistoricalTimelineVisualizationOptimized'),
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

  // Load initial data in parallel for faster startup
  useEffect(() => {
    const initializeHistorical = async () => {
      try {
        // Load all data in parallel for maximum speed
        const promises = [
          loadStaticData(),
          fetchCurrentBitcoinPrice(),
          fetchHistoricalData()
        ];
        
        // Execute in parallel and handle errors gracefully
        await Promise.allSettled(promises);
      } catch (error) {
        console.warn('Failed to initialize historical data:', error);
      }
    };
    
    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => initializeHistorical());
    } else {
      setTimeout(initializeHistorical, 0);
    }
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
      
      {/* Hero Section */}
      <section className="relative min-h-[300px] py-16 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Learn from </span>
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Bitcoin's Track Record</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
              See exactly how Bitcoin benefits would have grown for your employees if you had started years ago. Real data, real results.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">

        {/* Calculator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 w-full min-w-0 space-y-6 overflow-hidden max-w-full">
            {/* Scheme Selection */}
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
                currentPath="historical"
              />
            </div>

            {/* Historical Configuration */}
            <div className="card glass overflow-hidden historical-config-card">
              <div className="flex items-center mb-6">
                <CogIcon className="w-5 h-5 text-bitcoin mr-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Time Travel Settings
                </h3>
              </div>

              <div className="space-y-6 w-full max-w-full overflow-hidden">
                <div className="input-container">
                  <YearSelector
                    selectedYear={startingYear}
                    onYearChange={setStartingYear}
                    disabled={isLoadingHistoricalData}
                  />
                </div>

                <div className="space-y-2 input-container">
                  <label className="block text-base font-medium text-gray-700 dark:text-slate-300">
                    Price Assumption
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
                    Which Bitcoin price to use for calculating costs in each year
                  </p>
                </div>

                {/* Grant Customization */}
                {selectedScheme && (
                  <>
                    <div className="input-container">
                      <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Starting Bitcoin Bonus
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
                      <div className="input-container">
                        <label className="block text-base font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Yearly Bitcoin Bonus
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
              <div className="space-y-6">
                <MetricCardsSkeleton />
                <ChartSkeleton />
                <TableSkeleton />
              </div>
            )}

            {/* Error State */}
            {(historicalDataError || calculationError) && (
              <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
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
                {/* Introductory Text */}
                <div className="mb-8 px-6 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-lg text-gray-600 dark:text-slate-400 leading-[1.75] max-w-3xl mx-auto text-left px-8 md:px-12">
                    This tool shows what would have happened if you had started a Bitcoin bonus plan in the past. While Bitcoin's early days saw dramatic growth, the good news is that its wild volatility is settling down. Today's Bitcoin is more mature and stable, making it a practical choice for employee benefits. The future looks bright—you're not too late to get started!
                  </p>
                </div>
                {/* Metric Cards Carousel */}
                <HistoricalMetricCards
                  historicalResults={historicalResults}
                  currentBitcoinPrice={currentBitcoinPrice}
                  startingYear={startingYear}
                />

                {/* Historical Timeline Visualization */}
                <div className="mb-6 px-6 py-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg text-gray-600 dark:text-slate-400 leading-[1.75] max-w-2xl mx-auto text-left px-8 md:px-12">
                    This chart shows the actual journey your employee's Bitcoin bonus would have taken from your chosen starting year to today. Notice how the value has grown over time, even with Bitcoin's ups and downs along the way.
                  </p>
                </div>
                <div className="card mb-6">
                  <HistoricalTimelineVisualization
                    results={historicalResults}
                    startingYear={startingYear}
                    currentBitcoinPrice={currentBitcoinPrice}
                    historicalPrices={historicalPrices}
                    costBasisMethod={costBasisMethod}
                  />
                </div>

                {/* Enhanced Annual Breakdown Table */}
                <div className="mb-6 px-6 py-6 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-lg text-gray-600 dark:text-slate-400 leading-[1.75] max-w-2xl mx-auto text-left px-8 md:px-12">
                    Here's the year-by-year breakdown of what actually happened. You can see the real costs you would have paid each year and how much that Bitcoin would be worth today. Remember, past performance doesn't guarantee future results, but it shows Bitcoin's proven track record.
                  </p>
                </div>
                <div className="card mb-6">
                  <HistoricalDataTable
                    data={(() => {
                      // Prepare data for the enhanced table
                      const currentYear = new Date().getFullYear();
                      const startYear = startingYear;
                      const tableData = [];
                      
                      for (let year = startYear; year <= currentYear; year++) {
                        const yearPoints = historicalResults.timeline.filter(p => p.year === year);
                        if (yearPoints.length > 0) {
                          const lastPoint = yearPoints[yearPoints.length - 1];
                          const yearsFromStart = year - startingYear;
                          const vestingPercent = yearsFromStart >= 10 ? 100 : yearsFromStart >= 5 ? 50 : 0;
                          
                          // Calculate grant cost for this year
                          let grantCost = 0;
                          const yearGrants = historicalResults.grantBreakdown.filter(grant => grant.year === year);
                          if (yearGrants.length > 0) {
                            grantCost = yearGrants.reduce((sum, grant) => {
                              const grantYearPrices = historicalPrices[grant.year];
                              if (grantYearPrices) {
                                let grantPrice = 0;
                                switch (costBasisMethod) {
                                  case 'high': grantPrice = grantYearPrices.high; break;
                                  case 'low': grantPrice = grantYearPrices.low; break;
                                  case 'average': grantPrice = grantYearPrices.average; break;
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
                              case 'high': historicalBenefitValue = yearPrices.high; break;
                              case 'low': historicalBenefitValue = yearPrices.low; break;
                              case 'average': historicalBenefitValue = yearPrices.average; break;
                            }
                          }
                          
                          const historicalUsdValue = lastPoint.cumulativeBitcoin * historicalBenefitValue;
                          
                          tableData.push({
                            year,
                            grantCost,
                            btcAmount: lastPoint.cumulativeBitcoin,
                            historicalPrice: historicalBenefitValue,
                            historicalValue: historicalUsdValue,
                            currentValue: lastPoint.currentValue,
                            vestingPercent,
                            yearsFromStart
                          });
                        }
                      }
                      
                      return tableData;
                    })()}
                    currentBitcoinPrice={currentBitcoinPrice}
                    startingYear={startingYear}
                    totalCostBasis={historicalResults.totalCostBasis}
                    totalBitcoinGranted={historicalResults.totalBitcoinGranted}
                    costBasisMethod={costBasisMethod}
                  />
                </div>


              </>
            )}

            {/* Empty State */}
            {!isLoadingHistoricalData && !historicalDataError && !calculationError && !historicalResults && (
              <div className="card text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-bitcoin/20 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-8 h-8 text-bitcoin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600 dark:text-white/90">
                  Choose a plan above to see how it would have performed if you started in the past
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