import { useEffect } from 'react';
import { OptimizedBitcoinAPI } from '@/lib/bitcoin-api-optimized';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';

interface ParallelDataLoaderOptions {
  loadStaticData?: () => Promise<void>;
  setBitcoinPrice?: (price: number, change24h: number) => void;
  setHistoricalPrices?: (data: any) => void;
  startYear?: number;
  endYear?: number;
  onError?: (error: Error) => void;
}

export function useParallelDataLoader({
  loadStaticData,
  setBitcoinPrice,
  setHistoricalPrices,
  startYear,
  endYear,
  onError,
}: ParallelDataLoaderOptions) {
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const promises: Promise<any>[] = [];
        
        // Add static data loading if provided
        if (loadStaticData) {
          promises.push(loadStaticData());
        }
        
        // Add Bitcoin price fetching if setter provided
        if (setBitcoinPrice) {
          promises.push(OptimizedBitcoinAPI.getCurrentPrice());
        }
        
        // Add historical data fetching if setter and years provided
        if (setHistoricalPrices && startYear && endYear) {
          promises.push(HistoricalBitcoinAPI.getYearlyPrices(startYear, endYear));
        }
        
        // Execute all promises in parallel
        const results = await Promise.allSettled(promises);
        
        // Process results
        let resultIndex = 0;
        
        // Static data is handled by its own function
        if (loadStaticData) {
          resultIndex++;
        }
        
        // Process Bitcoin price if it was fetched
        if (setBitcoinPrice) {
          const priceResult = results[resultIndex];
          if (priceResult.status === 'fulfilled' && priceResult.value) {
            setBitcoinPrice(priceResult.value.price, priceResult.value.change24h);
          }
          resultIndex++;
        }
        
        // Process historical prices if they were fetched
        if (setHistoricalPrices && startYear && endYear) {
          const historicalResult = results[resultIndex];
          if (historicalResult.status === 'fulfilled' && historicalResult.value) {
            setHistoricalPrices(historicalResult.value);
          }
        }
        
        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`Data loading task ${index} failed:`, result.reason);
            if (onError) {
              onError(result.reason);
            }
          }
        });
      } catch (error) {
        console.error('Failed to load data in parallel:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    };
    
    loadAllData();
  }, [loadStaticData, setBitcoinPrice, setHistoricalPrices, startYear, endYear, onError]);
}

// Enhanced version with request coalescing
class DataLoaderCoordinator {
  private static pendingRequests = new Map<string, Promise<any>>();
  
  static async loadWithCoalescing<T>(
    key: string,
    loader: () => Promise<T>
  ): Promise<T> {
    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    
    // Create new request and store it
    const promise = loader().finally(() => {
      // Clean up after completion
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}

export { DataLoaderCoordinator };