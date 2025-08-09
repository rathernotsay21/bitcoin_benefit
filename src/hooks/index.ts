/**
 * Central export file for all custom hooks
 * Provides a single import point for hook consumers
 */

// Core hooks
export { useBitcoinPrice } from './useBitcoinPrice';
export type { BitcoinPriceData } from './useBitcoinPrice';

// Debounce utilities
export {
  useDebouncedCallback,
  useDebouncedValue,
  useDebouncedState,
  useDebouncedSearch,
  useDebouncedStoreUpdate
} from './useDebounce';

// Store synchronization
export { useStoreSync } from './useStoreSync';

// New calculation hooks
export {
  useCalculation,
  useCalculationInputs,
  useCalculator
} from './useCalculation';

// Chart data hooks
export {
  useChartData,
  useComparisonChartData,
  useAreaChartData,
  useLineChartData,
  useBarChartData,
  useProgressData,
  useSparklineData
} from './useChartData';
export type { ChartDataResult } from './useChartData';

// Bitcoin price synchronization
export {
  useBitcoinPriceSync,
  useSyncedBitcoinPrice,
  useBitcoinPriceDisplay
} from './useBitcoinPriceSync';
