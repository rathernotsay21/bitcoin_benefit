import { shallow } from 'zustand/shallow';
import type { CalculatorState } from './calculatorStore';
import type { HistoricalCalculatorState } from './historicalCalculatorStore';

// High-performance selectors with TypeScript optimization

// Calculator Store Selectors - Optimized for minimal re-renders
export const selectCalculatorInputs = (state: CalculatorState) => ({
  selectedScheme: state.selectedScheme,
  inputs: state.inputs,
});

export const selectCalculatorResults = (state: CalculatorState) => ({
  results: state.results,
  isCalculating: state.isCalculating,
});

export const selectBitcoinPrice = (state: CalculatorState) => ({
  currentBitcoinPrice: state.currentBitcoinPrice,
  bitcoinChange24h: state.bitcoinChange24h,
  isLoadingPrice: state.isLoadingPrice,
});

// Granular selectors for specific values
export const selectCurrentBitcoinPrice = (state: CalculatorState) => state.currentBitcoinPrice;
export const selectIsCalculating = (state: CalculatorState) => state.isCalculating;
export const selectSelectedScheme = (state: CalculatorState) => state.selectedScheme;
export const selectVestingResults = (state: CalculatorState) => state.results;

// High-frequency selectors for chart components with performance optimization
export const selectChartData = (state: CalculatorState) => {
  const timeline = state.results?.timeline;
  return {
    timeline: timeline || [],
    isCalculating: state.isCalculating,
    currentBitcoinPrice: state.currentBitcoinPrice,
  };
};

// Optimized selector for minimal re-renders with intelligent data slicing
export const selectChartEssentials = (state: CalculatorState) => {
  const results = state.results;
  if (!results) return null;
  
  const timeline = results.timeline;
  return {
    timeline: timeline && timeline.length > 50 
      ? timeline.slice(-50) // Take last 50 points for performance
      : timeline || [],
    totalCost: results.totalCost,
    totalBitcoinNeeded: results.totalBitcoinNeeded,
    summary: results.summary,
  };
};

export const selectStaticData = (state: CalculatorState) => ({
  staticDataLoaded: state.staticDataLoaded,
  staticCalculations: state.staticCalculations,
});

export const selectSchemeCustomizations = (state: CalculatorState) => state.schemeCustomizations;

// Historical selectors
export const selectHistoricalInputs = (state: HistoricalCalculatorState) => ({
  selectedScheme: state.selectedScheme,
  startingYear: state.startingYear,
  costBasisMethod: state.costBasisMethod,
});

export const selectHistoricalResults = (state: HistoricalCalculatorState) => ({
  historicalResults: state.historicalResults,
  isCalculating: state.isCalculating,
  calculationError: state.calculationError,
});

export const selectHistoricalPrices = (state: HistoricalCalculatorState) => ({
  historicalPrices: state.historicalPrices,
  isLoadingHistoricalData: state.isLoadingHistoricalData,
  historicalDataError: state.historicalDataError,
});

export const selectHistoricalStaticData = (state: HistoricalCalculatorState) => ({
  staticDataLoaded: state.staticDataLoaded,
  currentBitcoinPrice: state.currentBitcoinPrice,
});

// Combined selectors with performance optimization
export const selectCalculatorEssentials = (state: CalculatorState) => ({
  selectedScheme: state.selectedScheme,
  inputs: state.inputs,
  results: state.results,
  isCalculating: state.isCalculating,
  currentBitcoinPrice: state.currentBitcoinPrice,
});

export const selectHistoricalEssentials = (state: HistoricalCalculatorState) => ({
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