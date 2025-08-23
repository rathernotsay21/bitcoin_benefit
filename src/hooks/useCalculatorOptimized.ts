'use client';

import { useCallback, useMemo, useTransition, useDeferredValue, startTransition } from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { VestingScheme } from '@/types/vesting';

/**
 * Optimized selectors to prevent unnecessary re-renders
 */
export const calculatorSelectors = {
  // Core state selectors
  selectedScheme: (state: any) => state.selectedScheme,
  inputs: (state: any) => state.inputs,
  results: (state: any) => state.results,
  isCalculating: (state: any) => state.isCalculating,
  currentBitcoinPrice: (state: any) => state.currentBitcoinPrice,
  
  // Granular input selectors
  salaryAmount: (state: any) => state.inputs?.salary || 0,
  equityAllocation: (state: any) => state.inputs?.equityPercentage || 0,
  bitcoinGrowthRate: (state: any) => state.inputs?.projectedBitcoinGrowth || 0,
  
  // Result selectors
  totalProjectedValue: (state: any) => state.results?.totalProjectedValue || 0,
  projectionData: (state: any) => state.results?.projectionData || [],
  
  // UI state selectors
  isLoadingPrice: (state: any) => state.isLoadingPrice,
  bitcoinChange24h: (state: any) => state.bitcoinChange24h,
};

/**
 * Hook for optimized calculator state management with React 18 features
 */
export function useCalculatorOptimized() {
  const [isPending, startTransition] = useTransition();
  
  // Use granular selectors to prevent unnecessary re-renders
  const selectedScheme = useCalculatorStore(calculatorSelectors.selectedScheme);
  const inputs = useCalculatorStore(calculatorSelectors.inputs);
  const results = useCalculatorStore(calculatorSelectors.results);
  const isCalculating = useCalculatorStore(calculatorSelectors.isCalculating);
  const currentBitcoinPrice = useCalculatorStore(calculatorSelectors.currentBitcoinPrice);
  
  // Store actions
  const setSelectedScheme = useCalculatorStore(state => state.setSelectedScheme);
  const updateInputs = useCalculatorStore(state => state.updateInputs);
  const calculateResults = useCalculatorStore(state => state.calculateResults);
  
  // Defer expensive result data for smooth UI
  const deferredResults = useDeferredValue(results);
  
  // Memoize chart data transformation
  const chartData = useMemo(() => {
    if (!deferredResults?.projectionData) return [];
    
    return deferredResults.projectionData.map((item: any) => ({
      year: item.year,
      totalValue: item.totalValue,
      vestedAmount: item.vestedAmount,
      unvestedAmount: item.unvestedAmount,
      employeeContribution: item.employeeContribution,
    }));
  }, [deferredResults]);
  
  // Memoize total calculations
  const totals = useMemo(() => {
    if (!deferredResults) return { total: 0, vested: 0, unvested: 0 };
    
    return {
      total: deferredResults.totalProjectedValue || 0,
      vested: deferredResults.totalVestedValue || 0,
      unvested: deferredResults.totalUnvestedValue || 0,
    };
  }, [deferredResults]);
  
  // Optimized scheme change with transition
  const handleSchemeChange = useCallback((newScheme: VestingScheme) => {
    startTransition(() => {
      setSelectedScheme(newScheme);
      // Calculations will be triggered automatically by store
    });
  }, [setSelectedScheme]);
  
  // Optimized input updates with debouncing built-in
  const handleInputChange = useCallback((updates: Partial<typeof inputs>) => {
    startTransition(() => {
      updateInputs(updates);
    });
  }, [updateInputs]);
  
  // Force recalculation with transition
  const recalculate = useCallback(() => {
    startTransition(() => {
      calculateResults();
    });
  }, [calculateResults]);
  
  return {
    // State
    selectedScheme,
    inputs,
    results: deferredResults,
    chartData,
    totals,
    currentBitcoinPrice,
    
    // Loading states
    isCalculating: isCalculating || isPending,
    isPending,
    isStale: results !== deferredResults,
    
    // Actions
    handleSchemeChange,
    handleInputChange,
    recalculate,
  };
}

/**
 * Hook for chart-specific optimizations
 */
export function useChartOptimized() {
  const results = useCalculatorStore(calculatorSelectors.projectionData);
  const deferredChartData = useDeferredValue(results);
  
  // Transform data only when deferred value changes
  const processedData = useMemo(() => {
    if (!deferredChartData || deferredChartData.length === 0) {
      return [];
    }
    
    // Process chart data with optimizations
    return deferredChartData.map((point: any, index: number) => ({
      ...point,
      // Add any chart-specific transformations
      label: `Year ${index + 1}`,
      formattedValue: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(point.totalValue),
    }));
  }, [deferredChartData]);
  
  return {
    data: processedData,
    isLoading: results !== deferredChartData,
  };
}

/**
 * Hook for performance monitoring in development
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useMemo(() => {
    if (process.env.NODE_ENV === 'production') {
      return 0;
    }
    
    const count = performance.now();
    console.log(`[${componentName}] Render at ${count.toFixed(2)}ms`);
    return count;
  }, [componentName]);
  
  return { renderCount };
}