/**
 * Custom hook for centralizing Bitcoin price fetching and synchronization
 * Ensures all stores remain synchronized with the latest Bitcoin price
 */

import { useEffect, useCallback, useRef } from 'react';
import { useBitcoinPrice } from './useBitcoinPrice';
import { syncAllStores, setupStoreSynchronization } from '@/lib/utils/store-sync';

interface UseBitcoinPriceSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onPriceUpdate?: (price: number, change24h: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook that centralizes Bitcoin price fetching and syncs across all stores
 * Manages automatic price updates and ensures consistency across the application
 */
export function useBitcoinPriceSync(options: UseBitcoinPriceSyncOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 5 * 60 * 1000, // 5 minutes default
    onPriceUpdate,
    onError
  } = options;
  
  // Get price data from the Bitcoin price hook
  const { price, change24h, isLoading, error, refetch } = useBitcoinPrice(
    autoSync,
    syncInterval
  );
  
  // Track if we've set up store synchronization
  const syncCleanupRef = useRef<(() => void) | null>(null);
  
  // Track previous price to detect changes
  const prevPriceRef = useRef<{ price: number; change24h: number }>({
    price: 0,
    change24h: 0
  });
  
  // Set up store synchronization on mount
  useEffect(() => {
    if (!syncCleanupRef.current) {
      syncCleanupRef.current = setupStoreSynchronization();
    }
    
    // Cleanup on unmount
    return () => {
      if (syncCleanupRef.current) {
        syncCleanupRef.current();
        syncCleanupRef.current = null;
      }
    };
  }, []);
  
  // Sync price across all stores whenever it changes
  useEffect(() => {
    // Check if price has actually changed
    if (
      price !== prevPriceRef.current.price ||
      change24h !== prevPriceRef.current.change24h
    ) {
      // Update previous price reference
      prevPriceRef.current = { price, change24h };
      
      // Sync across all stores
      syncAllStores({ bitcoinPrice: price, bitcoinChange24h: change24h });
      
      // Call optional callback
      if (onPriceUpdate) {
        onPriceUpdate(price, change24h);
      }
    }
  }, [price, change24h, onPriceUpdate]);
  
  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);
  
  // Manual sync function
  const syncNow = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err : new Error('Failed to fetch Bitcoin price'));
      }
    }
  }, [refetch, onError]);
  
  // Force sync across all stores with current values
  const forceSync = useCallback(() => {
    syncAllStores({ bitcoinPrice: price, bitcoinChange24h: change24h });
  }, [price, change24h]);
  
  return {
    // Current price data
    price,
    change24h,
    
    // Loading and error states
    isLoading,
    error,
    
    // Manual control functions
    syncNow,       // Fetch new price and sync
    forceSync,     // Force sync current price to all stores
    refetch,       // Direct access to refetch function
    
    // Utility information
    isAutoSyncing: autoSync,
    syncInterval,
    lastSyncTime: prevPriceRef.current.price !== 0 ? new Date() : null
  };
}

/**
 * Lightweight hook for components that only need to read the synced price
 * Does not trigger fetches or manage synchronization
 */
export function useSyncedBitcoinPrice() {
  const { price, change24h } = useBitcoinPrice(false); // Disable auto-refresh
  
  return {
    price,
    change24h,
    formattedPrice: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price),
    formattedChange: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`
  };
}

/**
 * Hook for components that need to display price with real-time updates
 * Includes formatting and display utilities
 */
export function useBitcoinPriceDisplay(options: UseBitcoinPriceSyncOptions = {}) {
  const { price, change24h, isLoading, syncNow } = useBitcoinPriceSync(options);
  
  const priceColor = change24h >= 0 ? 'text-green-600' : 'text-red-600';
  const priceIcon = change24h >= 0 ? '↑' : '↓';
  
  return {
    price,
    change24h,
    isLoading,
    syncNow,
    display: {
      price: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price),
      change: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`,
      color: priceColor,
      icon: priceIcon,
      trend: change24h >= 0 ? 'up' : 'down'
    }
  };
}
