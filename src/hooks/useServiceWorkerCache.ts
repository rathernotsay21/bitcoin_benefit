'use client';

import { useEffect, useState, useCallback } from 'react';

// Phase 3.2: Hook for Service Worker cache management and monitoring
export interface CacheStats {
  [cacheName: string]: {
    itemCount: number;
    totalSize: number;
    limit: string | number;
    oldestItem: Date | null;
    newestItem: Date | null;
    error?: string;
  };
}

export interface ServiceWorkerCacheState {
  isSupported: boolean;
  isRegistered: boolean;
  cacheStats: CacheStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useServiceWorkerCache() {
  const [state, setState] = useState<ServiceWorkerCacheState>({
    isSupported: false,
    isRegistered: false,
    cacheStats: null,
    isLoading: false,
    error: null
  });

  // Check if service worker is supported and registered
  useEffect(() => {
    const checkServiceWorker = async () => {
      if (typeof window === 'undefined') return;

      const isSupported = 'serviceWorker' in navigator;
      setState(prev => ({ ...prev, isSupported }));

      if (isSupported) {
        try {
          const registration = await navigator.serviceWorker.ready;
          setState(prev => ({ 
            ...prev, 
            isRegistered: !!registration.active 
          }));
        } catch (error) {
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to check service worker registration' 
          }));
        }
      }
    };

    checkServiceWorker();
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(async (): Promise<CacheStats | null> => {
    if (!state.isSupported || !state.isRegistered) {
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        throw new Error('No active service worker');
      }

      const messageChannel = new MessageChannel();
      
      return new Promise<CacheStats | null>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Cache stats request timed out'));
        }, 5000);

        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          const { cacheStats, error } = event.data;
          
          setState(prev => ({ 
            ...prev, 
            cacheStats, 
            isLoading: false,
            error: error || null
          }));
          
          resolve(cacheStats || null);
        };

        registration.active.postMessage(
          { action: 'getCacheStats' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, [state.isSupported, state.isRegistered]);

  // Clear all caches
  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !state.isRegistered) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        throw new Error('No active service worker');
      }

      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Clear cache request timed out'));
        }, 10000);

        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          const { success, error } = event.data;
          
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: error || null,
            cacheStats: null // Clear stats after cache clear
          }));
          
          resolve(success || false);
        };

        registration.active.postMessage(
          { action: 'clearCache' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return false;
    }
  }, [state.isSupported, state.isRegistered]);

  // Preload a specific route
  const preloadRoute = useCallback(async (route: string): Promise<boolean> => {
    if (!state.isSupported || !state.isRegistered) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        throw new Error('No active service worker');
      }

      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Preload request timed out'));
        }, 10000);

        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          const { preloaded, error } = event.data;
          resolve(preloaded === route && !error);
        };

        registration.active.postMessage(
          { action: 'preloadRoute', data: { route } },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error preloading route:', error);
      return false;
    }
  }, [state.isSupported, state.isRegistered]);

  // Update Bitcoin data in cache
  const updateBitcoinData = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !state.isRegistered) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        throw new Error('No active service worker');
      }

      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Bitcoin data update request timed out'));
        }, 15000);

        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          const { bitcoinDataUpdated, error } = event.data;
          resolve(bitcoinDataUpdated && !error);
        };

        registration.active.postMessage(
          { action: 'updateBitcoinData' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error updating Bitcoin data:', error);
      return false;
    }
  }, [state.isSupported, state.isRegistered]);

  // Calculate total cache size
  const getTotalCacheSize = useCallback((): number => {
    if (!state.cacheStats) return 0;
    
    return Object.values(state.cacheStats).reduce((total, stats) => {
      return total + (stats.totalSize || 0);
    }, 0);
  }, [state.cacheStats]);

  // Get cache size in human-readable format
  const getFormattedCacheSize = useCallback((): string => {
    const totalSize = getTotalCacheSize();
    
    if (totalSize === 0) return '0 B';
    if (totalSize < 1024) return `${totalSize} B`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
    if (totalSize < 1024 * 1024 * 1024) return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
    return `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, [getTotalCacheSize]);

  // Get cache health score (0-100)
  const getCacheHealthScore = useCallback((): number => {
    if (!state.cacheStats) return 0;
    
    const stats = Object.values(state.cacheStats);
    if (stats.length === 0) return 0;
    
    let score = 0;
    let validStats = 0;
    
    stats.forEach(stat => {
      if (stat.error) return;
      validStats++;
      
      // Calculate score based on cache utilization
      if (typeof stat.limit === 'number' && stat.itemCount > 0) {
        const utilization = stat.itemCount / stat.limit;
        if (utilization > 0.9) score += 50; // High utilization but not overflowing
        else if (utilization > 0.5) score += 75;
        else if (utilization > 0.1) score += 100;
        else score += 25; // Low utilization
      } else {
        score += 75; // No limit means healthy
      }
    });
    
    return validStats > 0 ? Math.round(score / validStats) : 0;
  }, [state.cacheStats]);

  return {
    ...state,
    getCacheStats,
    clearCache,
    preloadRoute,
    updateBitcoinData,
    getTotalCacheSize,
    getFormattedCacheSize,
    getCacheHealthScore
  };
}