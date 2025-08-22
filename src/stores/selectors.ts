import { shallow } from 'zustand/shallow';
import { useMemo } from 'react';

// Performance-optimized selectors with memoization

// Calculator selectors - memoized for better performance
export const selectCalculatorInputs = (state: any) => {
  const inputs = useMemo(() => ({
    selectedScheme: state.selectedScheme,
    inputs: state.inputs,
  }), [state.selectedScheme, state.inputs]);
  return inputs;
};

export const selectCalculatorResults = (state: any) => {
  const results = useMemo(() => ({
    results: state.results,
    isCalculating: state.isCalculating,
  }), [state.results, state.isCalculating]);
  return results;
};

export const selectBitcoinPrice = (state: any) => {
  const priceData = useMemo(() => ({
    currentBitcoinPrice: state.currentBitcoinPrice,
    bitcoinChange24h: state.bitcoinChange24h,
    isLoadingPrice: state.isLoadingPrice,
  }), [state.currentBitcoinPrice, state.bitcoinChange24h, state.isLoadingPrice]);
  return priceData;
};

// High-frequency selectors for chart components
export const selectChartData = (state: any) => {
  return useMemo(() => ({
    timeline: state.results?.timeline || [],
    isCalculating: state.isCalculating,
    currentBitcoinPrice: state.currentBitcoinPrice,
  }), [state.results?.timeline, state.isCalculating, state.currentBitcoinPrice]);
};

// Optimized selector for minimal re-renders
export const selectChartEssentials = (state: any) => {
  return useMemo(() => {
    const results = state.results;
    if (!results) return null;
    
    return {
      timeline: results.timeline?.slice(-50) || [], // Limit data points for performance
      projectedValue: results.projectedValue,
      totalReturn: results.totalReturn,
      annualizedReturn: results.annualizedReturn,
    };
  }, [state.results]);
};

export const selectStaticData = (state: any) => ({
  staticData: state.staticData,
  isLoadingStaticData: state.isLoadingStaticData,
});

export const selectCustomVestingSchedule = (state: any) => ({
  customVestingSchedule: state.customVestingSchedule,
  setCustomVestingSchedule: state.setCustomVestingSchedule,
});

// Historical selectors
export const selectHistoricalInputs = (state: any) => ({
  selectedScheme: state.selectedScheme,
  startingYear: state.startingYear,
  costBasisMethod: state.costBasisMethod,
});

export const selectHistoricalResults = (state: any) => ({
  historicalResults: state.historicalResults,
  isCalculating: state.isCalculating,
  calculationError: state.calculationError,
});

export const selectHistoricalPrices = (state: any) => ({
  historicalPrices: state.historicalPrices,
  isLoadingPrices: state.isLoadingPrices,
  priceError: state.priceError,
});

export const selectHistoricalStaticData = (state: any) => ({
  staticData: state.staticData,
  isLoadingStaticData: state.isLoadingStaticData,
});

// Combined selectors with performance optimization
export const selectCalculatorEssentials = (state: any) => {
  return useMemo(() => ({
    selectedScheme: state.selectedScheme,
    inputs: state.inputs,
    results: state.results,
    isCalculating: state.isCalculating,
    currentBitcoinPrice: state.currentBitcoinPrice,
  }), [
    state.selectedScheme,
    state.inputs,
    state.results,
    state.isCalculating,
    state.currentBitcoinPrice
  ]);
};

export const selectHistoricalEssentials = (state: any) => {
  return useMemo(() => ({
    selectedScheme: state.selectedScheme,
    startingYear: state.startingYear,
    historicalResults: state.historicalResults,
    isCalculating: state.isCalculating,
  }), [
    state.selectedScheme,
    state.startingYear,
    state.historicalResults,
    state.isCalculating
  ]);
};

// Performance utilities
export const createSelector = <T, R>(selector: (state: T) => R) => {
  let lastState: T;
  let lastResult: R;
  
  return (state: T): R => {
    if (state === lastState) {
      return lastResult;
    }
    
    lastState = state;
    lastResult = selector(state);
    return lastResult;
  };
};

// Debounced selector for high-frequency updates
export const createDebouncedSelector = <T, R>(
  selector: (state: T) => R,
  delay: number = 100
) => {
  let timeoutId: NodeJS.Timeout;
  let lastResult: R;
  
  return (state: T): R => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      lastResult = selector(state);
    }, delay);
    
    return lastResult || selector(state);
  };
};

// Export shallow comparison helper and performance utilities
export { shallow };

// Custom shallow comparison for Bitcoin-specific data
export const shallowBitcoinData = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  
  // Optimized for Bitcoin price changes
  return (
    a.currentBitcoinPrice === b.currentBitcoinPrice &&
    a.bitcoinChange24h === b.bitcoinChange24h &&
    a.isLoadingPrice === b.isLoadingPrice
  );
};

// Optimized comparison for chart data
export const shallowChartData = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  
  return (
    a.timeline?.length === b.timeline?.length &&
    a.isCalculating === b.isCalculating &&
    a.currentBitcoinPrice === b.currentBitcoinPrice
  );
};