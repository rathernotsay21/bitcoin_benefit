import { OnChainPriceFetcher } from '../price-fetcher';
import { RawTransaction } from '@/types/on-chain';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock setTimeout and clearTimeout for batch testing
jest.useFakeTimers();

describe('OnChainPriceFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    OnChainPriceFetcher.clearCache();
    OnChainPriceFetcher.clearBatchQueue();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('fetchPriceForDate', () => {
    it('should fetch price for a single date successfully', async () => {
      const mockResponse = {
        prices: [
          [1640995200000, 47000.50], // 2022-01-01
          [1641081600000, 47500.25], // 2022-01-02
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      
      // Fast-forward the batch delay
      jest.advanceTimersByTime(100);
      
      const price = await pricePromise;
      expect(price).toBe(47000.50);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached price if available', async () => {
      const mockResponse = {
        prices: [[1640995200000, 47000.50]]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      const pricePromise1 = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);
      const price1 = await pricePromise1;

      // Second call should use cache
      const price2 = await OnChainPriceFetcher.fetchPriceForDate('2022-01-01');

      expect(price1).toBe(47000.50);
      expect(price2).toBe(47000.50);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);

      await expect(pricePromise).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response);

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);

      await expect(pricePromise).rejects.toThrow('HTTP error! status: 429');
    });

    it('should handle empty price data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [] }),
      } as Response);

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);

      await expect(pricePromise).rejects.toThrow('No price data available for date 2022-01-01');
    });
  });

  describe('fetchBatchPrices', () => {
    it('should fetch prices for multiple dates', async () => {
      const mockResponse1 = {
        prices: [[1640995200000, 47000.50]]
      };
      const mockResponse2 = {
        prices: [[1641081600000, 48000.75]]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        } as Response);

      const dates = ['2022-01-01', '2022-01-02'];
      const prices = await OnChainPriceFetcher.fetchBatchPrices(dates);

      expect(prices).toEqual({
        '2022-01-01': 47000.50,
        '2022-01-02': 48000.75,
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should deduplicate dates in batch requests', async () => {
      const mockResponse = {
        prices: [[1640995200000, 47000.50]]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const dates = ['2022-01-01', '2022-01-01', '2022-01-01'];
      const prices = await OnChainPriceFetcher.fetchBatchPrices(dates);

      expect(prices).toEqual({
        '2022-01-01': 47000.50,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should use cached prices when available', async () => {
      const mockResponse1 = {
        prices: [[1640995200000, 47000.50]]
      };
      const mockResponse2 = {
        prices: [[1641081600000, 48000.75]]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        } as Response);

      // First batch
      const dates1 = ['2022-01-01', '2022-01-02'];
      const prices1 = await OnChainPriceFetcher.fetchBatchPrices(dates1);

      // Second batch with one cached date
      const dates2 = ['2022-01-01', '2022-01-03'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [[1641168000000, 49000.25]] }),
      } as Response);

      const prices2 = await OnChainPriceFetcher.fetchBatchPrices(dates2);

      expect(prices1).toEqual({
        '2022-01-01': 47000.50,
        '2022-01-02': 48000.75,
      });
      expect(prices2).toEqual({
        '2022-01-01': 47000.50, // From cache
        '2022-01-03': 49000.25,
      });
      expect(mockFetch).toHaveBeenCalledTimes(3); // Only 3 calls, not 4
    });

    it('should handle partial failures in batch requests', async () => {
      const mockResponse = {
        prices: [[1640995200000, 47000.50]]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockRejectedValueOnce(new Error('Network error'));

      const dates = ['2022-01-01', '2022-01-02'];
      const prices = await OnChainPriceFetcher.fetchBatchPrices(dates);

      // Should return successful price and fallback for failed one
      expect(prices).toEqual({
        '2022-01-01': 47000.50,
        '2022-01-02': 31717, // Fallback price for 2022
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimizePriceRequests', () => {
    it('should extract unique dates from transactions', () => {
      const transactions: RawTransaction[] = [
        {
          txid: 'tx1',
          status: { confirmed: true, block_height: 700000, block_time: 1640995200 }, // 2022-01-01
          vin: [],
          vout: [],
          fee: 1000,
        },
        {
          txid: 'tx2',
          status: { confirmed: true, block_height: 700001, block_time: 1641081600 }, // 2022-01-02
          vin: [],
          vout: [],
          fee: 1500,
        },
        {
          txid: 'tx3',
          status: { confirmed: true, block_height: 700002, block_time: 1640995200 }, // 2022-01-01 (duplicate)
          vin: [],
          vout: [],
          fee: 2000,
        },
      ];

      const dates = OnChainPriceFetcher.optimizePriceRequests(transactions);
      expect(dates).toEqual(['2022-01-01', '2022-01-02']);
    });

    it('should skip unconfirmed transactions', () => {
      const transactions: RawTransaction[] = [
        {
          txid: 'tx1',
          status: { confirmed: true, block_height: 700000, block_time: 1640995200 },
          vin: [],
          vout: [],
          fee: 1000,
        },
        {
          txid: 'tx2',
          status: { confirmed: false, block_height: 0, block_time: 0 },
          vin: [],
          vout: [],
          fee: 1500,
        },
      ];

      const dates = OnChainPriceFetcher.optimizePriceRequests(transactions);
      expect(dates).toEqual(['2022-01-01']);
    });

    it('should return empty array for empty transactions', () => {
      const dates = OnChainPriceFetcher.optimizePriceRequests([]);
      expect(dates).toEqual([]);
    });
  });

  describe('batch processing', () => {
    it('should batch multiple concurrent requests', async () => {
      const mockResponse1 = {
        prices: [[1640995200000, 47000.50]]
      };
      const mockResponse2 = {
        prices: [[1641081600000, 48000.75]]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        } as Response);

      // Start multiple concurrent requests
      const promise1 = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      const promise2 = OnChainPriceFetcher.fetchPriceForDate('2022-01-02');
      const promise3 = OnChainPriceFetcher.fetchPriceForDate('2022-01-01'); // Duplicate

      // Fast-forward the batch delay
      jest.advanceTimersByTime(100);

      const [price1, price2, price3] = await Promise.all([promise1, promise2, promise3]);

      expect(price1).toBe(47000.50);
      expect(price2).toBe(48000.75);
      expect(price3).toBe(47000.50); // Same as price1
      expect(mockFetch).toHaveBeenCalledTimes(2); // Only 2 unique dates
    });
  });

  describe('caching', () => {
    it('should cache prices correctly', async () => {
      const mockResponse = {
        prices: [[1640995200000, 47000.50]]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First request
      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);
      await pricePromise;

      // Check cache stats
      const stats = OnChainPriceFetcher.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.dates).toEqual(['2022-01-01']);
    });

    it('should clear cache correctly', async () => {
      const mockResponse = {
        prices: [[1640995200000, 47000.50]]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);
      await pricePromise;

      OnChainPriceFetcher.clearCache();
      const stats = OnChainPriceFetcher.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.dates).toEqual([]);
    });
  });

  describe('fallback prices', () => {
    it('should return correct fallback prices for specific years', () => {
      expect(OnChainPriceFetcher.getFallbackPrice('2021-01-01')).toBe(47686);
      expect(OnChainPriceFetcher.getFallbackPrice('2022-01-01')).toBe(31717);
      expect(OnChainPriceFetcher.getFallbackPrice('2023-01-01')).toBe(29234);
      expect(OnChainPriceFetcher.getFallbackPrice('2030-01-01')).toBe(null);
    });

    it('should use fallback prices when API fails in batch requests', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetch.mockRejectedValueOnce(new Error('API unavailable'));

      const dates = ['2022-01-01'];
      const prices = await OnChainPriceFetcher.fetchBatchPrices(dates);

      // The actual fallback value should be 31717 for 2022
      expect(prices['2022-01-01']).toBe(31717);

      consoleSpy.mockRestore();
    });

    it('should not use fallback for single date requests', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetch.mockRejectedValueOnce(new Error('API unavailable'));

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);

      await expect(pricePromise).rejects.toThrow('API unavailable');

      consoleSpy.mockRestore();
    });

    it('should handle unknown years in fallback', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetch.mockRejectedValueOnce(new Error('API unavailable'));

      const dates = ['2030-01-01']; // Future year not in fallback data
      const prices = await OnChainPriceFetcher.fetchBatchPrices(dates);

      expect(prices).toEqual({}); // No fallback for unknown years

      consoleSpy.mockRestore();
    });
  });

  describe('price rounding', () => {
    it('should round prices to 2 decimal places', async () => {
      const mockResponse = {
        prices: [[1640995200000, 47000.123456]]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);
      const price = await pricePromise;

      expect(price).toBe(47000.12);
    });
  });

  describe('closest price selection', () => {
    it('should select price closest to target date', async () => {
      const targetDate = new Date('2022-01-01T12:00:00Z').getTime();
      const mockResponse = {
        prices: [
          [targetDate - 86400000, 46000], // 1 day before
          [targetDate - 3600000, 47000],  // 1 hour before (closest)
          [targetDate + 3600000, 48000],  // 1 hour after
          [targetDate + 86400000, 49000], // 1 day after
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const pricePromise = OnChainPriceFetcher.fetchPriceForDate('2022-01-01');
      jest.advanceTimersByTime(100);
      const price = await pricePromise;

      expect(price).toBe(47000); // Closest to target time
    });
  });
});