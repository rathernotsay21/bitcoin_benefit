/**
 * Store synchronization utility for cross-store communication
 * Ensures critical data like Bitcoin price remains consistent across all stores
 */

import { useCalculatorStore } from '@/stores/calculatorStore';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';

interface SyncableData {
  bitcoinPrice?: number;
  bitcoinChange24h?: number;
}

/**
 * Sync Bitcoin price across all relevant stores
 * This ensures consistency when price updates occur from any source
 */
export const syncBitcoinPrice = (price: number, change24h: number = 0) => {
  // Update calculator store
  useCalculatorStore.setState({ 
    currentBitcoinPrice: price, 
    bitcoinChange24h: change24h 
  });
  
  // Update historical calculator store
  useHistoricalCalculatorStore.setState({ 
    currentBitcoinPrice: price 
  });
  
  // Trigger recalculations in both stores with current inputs
  const calculatorStore = useCalculatorStore.getState();
  const historicalStore = useHistoricalCalculatorStore.getState();
  
  // Only trigger calculations if we have selected schemes
  if (calculatorStore.selectedScheme) {
    calculatorStore.calculateResults();
  }
  
  if (historicalStore.selectedScheme && Object.keys(historicalStore.historicalPrices).length > 0) {
    historicalStore.calculateHistoricalResults();
  }
};

/**
 * Sync all critical data across stores
 * Can be extended to sync other shared data in the future
 */
export const syncAllStores = (data: SyncableData) => {
  if (data.bitcoinPrice !== undefined) {
    syncBitcoinPrice(data.bitcoinPrice, data.bitcoinChange24h || 0);
  }
  
  // Add more sync operations here as needed
};

/**
 * Subscribe to Bitcoin price changes in any store and propagate to others
 * Returns an unsubscribe function
 */
export const setupStoreSynchronization = () => {
  const unsubscribers: (() => void)[] = [];
  
  // Subscribe to calculator store price changes
  const unsubCalculator = useCalculatorStore.subscribe(
    (state, prevState) => {
      // Check if Bitcoin price changed
      if (state.currentBitcoinPrice !== prevState.currentBitcoinPrice) {
        // Update historical store only (avoid circular updates)
        useHistoricalCalculatorStore.setState({ 
          currentBitcoinPrice: state.currentBitcoinPrice 
        });
      }
    }
  );
  unsubscribers.push(unsubCalculator);
  
  // Subscribe to historical calculator store price changes
  const unsubHistorical = useHistoricalCalculatorStore.subscribe(
    (state, prevState) => {
      // Check if Bitcoin price changed
      if (state.currentBitcoinPrice !== prevState.currentBitcoinPrice) {
        // Update calculator store only (avoid circular updates)
        useCalculatorStore.setState({ 
          currentBitcoinPrice: state.currentBitcoinPrice,
          bitcoinChange24h: useCalculatorStore.getState().bitcoinChange24h 
        });
      }
    }
  );
  unsubscribers.push(unsubHistorical);
  
  // Return cleanup function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Hook to ensure stores stay synchronized
 * Use this in your root component or app layout
 */
export const useBitcoinPriceSync = () => {
  // This hook can be used in components to ensure price syncing
  const calculatorPrice = useCalculatorStore(state => state.currentBitcoinPrice);
  const historicalPrice = useHistoricalCalculatorStore(state => state.currentBitcoinPrice);
  
  // Return synchronized price (they should always be the same)
  return {
    price: calculatorPrice,
    isSynced: calculatorPrice === historicalPrice
  };
};
