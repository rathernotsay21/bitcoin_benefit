/**
 * Custom hook for Bitcoin price synchronization
 * Ensures Bitcoin price remains consistent across all stores
 */

import { useEffect } from 'react';
import { setupStoreSynchronization } from '@/lib/utils/store-sync';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';

/**
 * Hook to initialize and maintain store synchronization
 * Should be used at the app root level
 */
export function useStoreSync() {
  useEffect(() => {
    // Setup store synchronization
    const cleanup = setupStoreSynchronization();
    
    // Return cleanup function
    return cleanup;
  }, []);
}

/**
 * Hook to fetch Bitcoin price and sync across all stores
 * Can be used in any component that needs to trigger a price update
 */
export function useBitcoinPrice() {
  const { currentBitcoinPrice, bitcoinChange24h, fetchBitcoinPrice, isLoadingPrice } = 
    useCalculatorStore(state => ({
      currentBitcoinPrice: state.currentBitcoinPrice,
      bitcoinChange24h: state.bitcoinChange24h,
      fetchBitcoinPrice: state.fetchBitcoinPrice,
      isLoadingPrice: state.isLoadingPrice
    }));
  
  return {
    price: currentBitcoinPrice,
    change24h: bitcoinChange24h,
    fetchPrice: fetchBitcoinPrice,
    isLoading: isLoadingPrice
  };
}

/**
 * Hook to check if stores are synchronized
 * Useful for debugging or monitoring
 */
export function useSyncStatus() {
  const calculatorPrice = useCalculatorStore(state => state.currentBitcoinPrice);
  const historicalPrice = useHistoricalCalculatorStore(state => state.currentBitcoinPrice);
  
  return {
    isSynced: calculatorPrice === historicalPrice,
    calculatorPrice,
    historicalPrice
  };
}
