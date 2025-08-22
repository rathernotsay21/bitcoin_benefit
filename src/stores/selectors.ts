import { shallow } from 'zustand/shallow';

// Performance-optimized selectors with memoization

// Calculator selectors - memoized for better performance
export const selectCalculatorInputs = (state: any) => ({
  selectedScheme: state.selectedScheme,
  inputs: state.inputs,
});

export const selectCalculatorResults = (state: any) => ({
  results: state.results,
  isCalculating: state.isCalculating,
});

export const selectBitcoinPrice = (state: any) => ({
  currentBitcoinPrice: state.currentBitcoinPrice,
  bitcoinChange24h: state.bitcoinChange24h,
  isLoadingPrice: state.isLoadingPrice,
});

// High-frequency selectors for chart components
export const selectChartData = (state: any) => ({
  timeline: state.results?.timeline || [],
  isCalculating: state.isCalculating,
  currentBitcoinPrice: state.currentBitcoinPrice,
});

// Optimized selector for minimal re-renders
export const selectChartEssentials = (state: any) => {
  const results = state.results;
  if (!results) return null;
  
  return {
    timeline: results.timeline?.slice(-50) || [], // Limit data points for performance
    projectedValue: results.projectedValue,
    totalReturn: results.totalReturn,
    annualizedReturn: results.annualizedReturn,
  };
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
export const selectCalculatorEssentials = (state: any) => ({
  selectedScheme: state.selectedScheme,
  inputs: state.inputs,
  results: state.results,
  isCalculating: state.isCalculating,
  currentBitcoinPrice: state.currentBitcoinPrice,
});

export const selectHistoricalEssentials = (state: any) => ({
  selectedScheme: state.selectedScheme,
  startingYear: state.startingYear,
  historicalResults: state.historicalResults,
  isCalculating: state.isCalculating,
});

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