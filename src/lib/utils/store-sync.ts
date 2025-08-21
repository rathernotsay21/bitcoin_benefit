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

// Prevent circular synchronization updates
let syncInProgress = false;

/**
 * Sync Bitcoin price across all relevant stores
 * This ensures consistency when price updates occur from any source
 */
export const syncBitcoinPrice = (price: number, change24h: number = 0) => {
  // Guard against circular updates
  if (syncInProgress) return;
  
  // Ensure values are valid numbers
  const validPrice = typeof price === 'number' && !isNaN(price) && price > 0 ? price : 45000;
  const validChange = typeof change24h === 'number' && !isNaN(change24h) ? change24h : 0;
  
  // Check if values actually changed to avoid unnecessary updates
  const calculatorState = useCalculatorStore.getState();
  const historicalState = useHistoricalCalculatorStore.getState();
  
  const priceChanged = calculatorState.currentBitcoinPrice !== validPrice;
  const changeChanged = calculatorState.bitcoinChange24h !== validChange;
  
  if (!priceChanged && !changeChanged) {
    return; // No changes needed
  }
  
  syncInProgress = true;
  
  try {
    // Update calculator store
    if (priceChanged || changeChanged) {
      useCalculatorStore.setState({ 
        currentBitcoinPrice: validPrice, 
        bitcoinChange24h: validChange 
      });
    }
    
    // Update historical calculator store
    if (historicalState.currentBitcoinPrice !== validPrice) {
      useHistoricalCalculatorStore.setState({ 
        currentBitcoinPrice: validPrice 
      });
    }
    
    // DO NOT trigger automatic calculations here - let components handle this
    // This prevents circular update loops
  } finally {
    syncInProgress = false;
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
