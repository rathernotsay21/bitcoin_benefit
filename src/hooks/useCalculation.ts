/**
 * Custom hook for encapsulating calculation logic
 * Provides a simplified interface for triggering calculations and accessing results
 */

import { useMemo } from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { useDebouncedCallback } from './useDebounce';

/**
 * Hook that encapsulates the logic for triggering calculations and accessing results
 * Includes built-in debouncing to prevent excessive recalculations
 */
export function useCalculation() {
  const store = useCalculatorStore();
  
  // Create a debounced calculate function with 300ms delay
  const calculate = useDebouncedCallback(
    () => {
      store.calculateResults();
    },
    300,
    [] // No dependencies since store.calculateResults is stable
  );
  
  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Current calculation results
    results: store.results,
    
    // Loading state
    isCalculating: store.isCalculating,
    
    // Debounced calculation trigger
    calculate,
    
    // Force immediate calculation (bypasses debounce)
    calculateNow: () => {
      calculate.flush();
    },
    
    // Cancel any pending calculations
    cancelCalculation: () => {
      calculate.cancel();
    },
    
    // Check if a calculation is pending
    hasPendingCalculation: () => {
      return calculate.pending();
    }
  }), [store.results, store.isCalculating, calculate]);
}

/**
 * Hook for accessing calculation inputs
 * Separates input management from calculation logic
 */
export function useCalculationInputs() {
  const { inputs, updateInputs, selectedScheme, setSelectedScheme } = useCalculatorStore();
  
  return useMemo(() => ({
    inputs,
    selectedScheme,
    updateInputs,
    setSelectedScheme
  }), [inputs, selectedScheme, updateInputs, setSelectedScheme]);
}

/**
 * Combined hook for full calculator functionality
 * Provides both inputs and calculation controls
 */
export function useCalculator() {
  const calculation = useCalculation();
  const inputs = useCalculationInputs();
  
  return {
    ...calculation,
    ...inputs
  };
}
