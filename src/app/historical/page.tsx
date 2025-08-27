'use client';

import { useEffect, Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';
import { HISTORICAL_VESTING_SCHEMES } from '@/lib/historical-vesting-schemes';
import YearSelector from '@/components/YearSelector';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChartBarIcon, CogIcon, ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { SatoshiIcon } from '@/components/icons';
import { HistoricalSkeleton, ChartSkeleton } from '@/components/loading/Skeletons';
import { MetricCardsSkeleton, TableSkeleton } from '@/components/loading/EnhancedSkeletons';
import HistoricalMetricCards from '@/components/HistoricalMetricCards';
import SchemeTabSelector from '@/components/SchemeTabSelector';
import HistoricalDataTable from '@/components/HistoricalDataTable';
import FinancialDisclaimer from '@/components/FinancialDisclaimer';

// Lazy load the optimized historical visualization component
const HistoricalTimelineVisualization = dynamic(
  () => import('@/components/HistoricalTimelineVisualizationOptimized'),
  {
    ssr: false, // Disable server-side rendering for this client-side component
    loading: () => <ChartSkeleton /> // Show a loading component
  }
);


function HistoricalCalculatorContent() {
  const searchParams = useSearchParams();
  
  // Local state for input fields to allow empty values during editing
  const [initialGrantInput, setInitialGrantInput] = useState<string>('');
  const [annualGrantInput, setAnnualGrantInput] = useState<string>('');
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(true);
  
  const {
    selectedScheme,
    startingYear,
    costBasisMethod,
    schemeCustomizations,
    historicalPrices,
    currentBitcoinPrice,
    bitcoinChange24h,
    isLoadingPrice,
    isLoadingHistoricalData,
    historicalDataError,
    historicalResults,
    isCalculating: _isCalculating,
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

  // Sync local input state with store values when scheme changes or customizations update
  useEffect(() => {
    if (selectedScheme) {
      const effectiveInitialGrant = schemeCustomizations[selectedScheme.id]?.initialGrant ?? selectedScheme.initialGrant;
      const effectiveAnnualGrant = schemeCustomizations[selectedScheme.id]?.annualGrant ?? selectedScheme.annualGrant ?? 0;
      
      setInitialGrantInput(effectiveInitialGrant.toString());
      setAnnualGrantInput(effectiveAnnualGrant.toString());
    }
  }, [selectedScheme, schemeCustomizations]);

  // Load initial data with proper sequencing
  useEffect(() => {
    const initializeHistorical = async () => {
      try {
        // Load static data first, then other data in parallel
        await loadStaticData();
        
        // Now load price and historical data in parallel
        const promises = [
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
  const _currentYear = new Date().getFullYear();

  function formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[150px] py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-slate-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent">Learn </span>
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">from Bitcoin</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-700 leading-relaxed">
              We made too many wrong mistakes.
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
            <div className={`card ${
              selectedScheme?.id === 'accelerator'
                ? 'border-2 border-bitcoin/20 hover:border-bitcoin/30 bg-gradient-to-r from-bitcoin/5 to-orange-100/50 dark:from-bitcoin/10 dark:to-slate-800'
                : selectedScheme?.id === 'steady-builder'
                ? 'border-2 border-green-500/20 hover:border-green-500/30 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-slate-800'
                : selectedScheme?.id === 'slow-burn'
                ? 'border-2 border-blue-500/20 hover:border-blue-500/30 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-slate-800'
                : ''
            }`}>
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

            {/* Financial Disclaimer */}
            <FinancialDisclaimer />

            {/* Historical Configuration */}
            <div className="card glass overflow-hidden historical-config-card">
              <div 
                className={`flex items-center justify-between cursor-pointer ${
                  isSettingsCollapsed ? '' : 'mb-6'
                }`}
                onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
              >
                <div className="flex items-center">
                  <CogIcon className="w-5 h-5 text-bitcoin mr-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    Time Travel Settings
                  </h3>
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${
                    isSettingsCollapsed ? '-rotate-90' : ''
                  }`}
                />
              </div>

              <div className={`space-y-6 w-full max-w-full overflow-hidden transition-all duration-300 ${
                isSettingsCollapsed ? 'hidden' : ''
              }`}>
                <div className="input-container">
                  <YearSelector
                    selectedYear={startingYear}
                    onYearChange={(year) => {
                      setStartingYear(year);
                    }}
                    disabled={isLoadingHistoricalData}
                  />
                </div>

                <div className="space-y-2 input-container">
                  <label className="block text-base font-medium text-gray-700 dark:text-slate-700">
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
                      <label className="block text-base font-medium text-gray-700 dark:text-slate-700 mb-1">
                        Starting Bitcoin Award
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={initialGrantInput}
                        onChange={(e) => setInitialGrantInput(e.target.value)}
                        onBlur={() => {
                          const numValue = parseFloat(initialGrantInput) || selectedScheme.initialGrant;
                          const validValue = Math.max(0, numValue);
                          updateSchemeCustomization(selectedScheme.id, { initialGrant: validValue });
                          setInitialGrantInput(validValue.toString());
                        }}
                        className="input-field"
                        disabled={isLoadingHistoricalData}
                      />
                    </div>

                    {(selectedScheme.id === 'steady-builder' || selectedScheme.id === 'slow-burn') && (
                      <div className="input-container">
                        <label className="block text-base font-medium text-gray-700 dark:text-slate-700 mb-1">
                          Yearly Bitcoin Award
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={annualGrantInput}
                          onChange={(e) => setAnnualGrantInput(e.target.value)}
                          onBlur={() => {
                            const numValue = parseFloat(annualGrantInput) || (selectedScheme.annualGrant || 0);
                            const validValue = Math.max(0, numValue);
                            updateSchemeCustomization(selectedScheme.id, { annualGrant: validValue });
                            setAnnualGrantInput(validValue.toString());
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

            {/* Bitcoin Price Card */}
            <div className="card bg-gradient-to-r from-bitcoin/10 to-yellow-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SatoshiIcon className="w-8 h-8 text-bitcoin mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {formatUSD(currentBitcoinPrice)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-700">
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
                {/* Metric Cards Carousel */}
                <HistoricalMetricCards
                  historicalResults={historicalResults}
                  currentBitcoinPrice={currentBitcoinPrice}
                  startingYear={startingYear}
                />

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

                {/* Enhanced Annual Breakdown Table */}
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
                          
                          const historicalUsdValue = lastPoint ? lastPoint.cumulativeBitcoin * historicalBenefitValue : 0;
                          
                          tableData.push({
                            year,
                            grantCost,
                            btcAmount: lastPoint ? lastPoint.cumulativeBitcoin : 0,
                            historicalPrice: historicalBenefitValue,
                            historicalValue: historicalUsdValue,
                            currentValue: lastPoint ? lastPoint.currentValue : 0,
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