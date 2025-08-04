import { useEffect, useState } from 'react';
import { BitcoinAPI } from '@/lib/bitcoin-api';

export interface BitcoinPriceData {
  price: number;
  change24h: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useBitcoinPrice(autoRefresh = true, refreshInterval = 5 * 60 * 1000) {
  const [data, setData] = useState<BitcoinPriceData>({
    price: 45000, // fallback price
    change24h: 0,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchPrice = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      const { price, change24h } = await BitcoinAPI.getCurrentPrice();
      setData({
        price,
        change24h,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Bitcoin price',
      }));
    }
  };

  useEffect(() => {
    fetchPrice();

    if (autoRefresh) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    ...data,
    refetch: fetchPrice,
  };
}