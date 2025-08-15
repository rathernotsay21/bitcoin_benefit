import { useCalculatorStore } from '@/stores/calculatorStore';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';
import { shallow } from 'zustand/shallow';

/**
 * Optimized hooks that use selectors to prevent unnecessary re-renders
 */

// Calculator Store Hooks
export const useCalculatorInputs = () => useCalculatorStore(
  (state) => ({
    selectedScheme: state.selectedScheme,
    inputs: state.inputs,
    updateInputs: state.updateInputs,
    setSelectedScheme: state.setSelectedScheme,
    updateSchemeCustomization: state.updateSchemeCustomization,
    schemeCustomizations: state.schemeCustomizations,
    getEffectiveScheme: state.getEffectiveScheme,
  }),
  shallow
);

export const useCalculatorResults = () => useCalculatorStore(
  (state) => ({
    results: state.results,
    isCalculating: state.isCalculating,
  }),
  shallow
);

export const useBitcoinPrice = () => useCalculatorStore(
  (state) => ({
    currentBitcoinPrice: state.currentBitcoinPrice,
    bitcoinChange24h: state.bitcoinChange24h,
    isLoadingPrice: state.isLoadingPrice,
    fetchBitcoinPrice: state.fetchBitcoinPrice,
  }),
  shallow
);

export const useCalculatorActions = () => useCalculatorStore(
  (state) => ({
    calculateResults: state.calculateResults,
    resetCalculator: state.resetCalculator,
    loadStaticData: state.loadStaticData,
    cleanup: state.cleanup,
  }),
  shallow
);

// Historical Calculator Store Hooks
export const useHistoricalInputs = () => useHistoricalCalculatorStore(
  (state) => ({
    selectedScheme: state.selectedScheme,
    startingYear: state.startingYear,
    costBasisMethod: state.costBasisMethod,
    schemeCustomizations: state.schemeCustomizations,
    setStartingYear: state.setStartingYear,
    setCostBasisMethod: state.setCostBasisMethod,
    setSelectedScheme: state.setSelectedScheme,
    updateSchemeCustomization: state.updateSchemeCustomization,
    getEffectiveScheme: state.getEffectiveScheme,
  }),
  shallow
);

export const useHistoricalData = () => useHistoricalCalculatorStore(
  (state) => ({
    historicalPrices: state.historicalPrices,
    currentBitcoinPrice: state.currentBitcoinPrice,
    isLoadingHistoricalData: state.isLoadingHistoricalData,
    historicalDataError: state.historicalDataError,
    fetchHistoricalData: state.fetchHistoricalData,
    fetchCurrentBitcoinPrice: state.fetchCurrentBitcoinPrice,
  }),
  shallow
);

export const useHistoricalResults = () => useHistoricalCalculatorStore(
  (state) => ({
    historicalResults: state.historicalResults,
    isCalculating: state.isCalculating,
    calculationError: state.calculationError,
  }),
  shallow
);

export const useHistoricalActions = () => useHistoricalCalculatorStore(
  (state) => ({
    calculateHistoricalResults: state.calculateHistoricalResults,
    resetCalculator: state.resetCalculator,
    loadStaticData: state.loadStaticData,
    cleanup: state.cleanup,
  }),
  shallow
);
