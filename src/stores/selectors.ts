import { shallow } from 'zustand/shallow';

// High-performance selectors with TypeScript optimization

// Typed selector factory for better inference and performance
type StoreState = {
  selectedScheme: any;
  inputs: any;
  results: any;
  isCalculating: boolean;
  currentBitcoinPrice: number;
  bitcoinChange24h: number;
  isLoadingPrice: boolean;
};

// Pre-compiled selectors to avoid object creation on every call
const calculatorInputsSelector = (state: StoreState) => ({
  selectedScheme: state.selectedScheme,
  inputs: state.inputs,
});

const calculatorResultsSelector = (state: StoreState) => ({
  results: state.results,
  isCalculating: state.isCalculating,
});

const bitcoinPriceSelector = (state: StoreState) => ({
  currentBitcoinPrice: state.currentBitcoinPrice,
  bitcoinChange24h: state.bitcoinChange24h,
  isLoadingPrice: state.isLoadingPrice,
});

// Export optimized selectors
export const selectCalculatorInputs = calculatorInputsSelector;
export const selectCalculatorResults = calculatorResultsSelector;
export const selectBitcoinPrice = bitcoinPriceSelector;

// High-frequency selectors for chart components with performance optimization
const chartDataSelector = (state: StoreState) => {
  const timeline = state.results?.timeline;
  return {
    timeline: timeline || [],
    isCalculating: state.isCalculating,
    currentBitcoinPrice: state.currentBitcoinPrice,
  };
};

// Optimized selector for minimal re-renders with intelligent data slicing
const chartEssentialsSelector = (state: StoreState) => {
  const results = state.results;
  if (!results) return null;
  
  const timeline = results.timeline;
  return {
    timeline: timeline && timeline.length > 50 
      ? timeline.slice(-50) // Take last 50 points for performance
      : timeline || [],
    projectedValue: results.projectedValue,
    totalReturn: results.totalReturn,
    annualizedReturn: results.annualizedReturn,
  };
};

export const selectChartData = chartDataSelector;
export const selectChartEssentials = chartEssentialsSelector;

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