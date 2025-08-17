import { shallow } from 'zustand/shallow';

// Calculator selectors
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

// Combined selectors for components that need multiple pieces of state
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

// Export shallow comparison helper
export { shallow };