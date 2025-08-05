import { HistoricalBitcoinAPI } from '../historical-bitcoin-api';
import { BitcoinYearlyPrices } from '@/types/vesting';

// Mock fetch globally
global.fetch = jest.fn();

describe('HistoricalBitcoinAPI', () => {
  beforeEach(() => {
    // Clear cache before each test
    HistoricalBitcoinAPI.clearCache();
    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
  });

  describe('getYearlyPrice', () => {
    const mockCoinGeckoResponse = {
      prices: [
        [1609459200000, 29000], // Jan 1, 2021
        [1612137600000, 35000], // Feb 1, 2021
        [1614556800000, 45000], // Mar 1, 2021
        [1617235200000, 58000], // Apr 1, 2021
        [1619827200000, 55000], // May 1, 2021
        [1622505600000, 35000], // Jun 1, 2021
        [1625097600000, 33000], // Jul 1, 2021
        [1627776000000, 40000], // Aug 1, 2021
        [1630454400000, 47000], // Sep 1, 2021
        [1633046400000, 48000], // Oct 1, 2021
        [1635724800000, 61000], // Nov 1, 2021
        [1638316800000, 57000], // Dec 1, 2021
      ]
    };

    it('should fetch and format yearly price data correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoinGeckoResponse
      });

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2021);

      expect(result).toEqual({
        year: 2021,
        high: 61000,
        low: 29000,
        average: 45250,
        open: 29000,
        close: 57000
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('coins/bitcoin/market_chart/range'),
        expect.objectContaining({
          headers: { 'Accept': 'application/json' }
        })
      );
    });

    it('should cache results and return cached data on subsequent calls', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoinGeckoResponse
      });

      // First call should fetch from API
      const result1 = await HistoricalBitcoinAPI.getYearlyPrice(2021);
      
      // Second call should use cache
      const result2 = await HistoricalBitcoinAPI.getYearlyPrice(2021);

      expect(result1).toEqual(result2);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid year (too early)', async () => {
      await expect(HistoricalBitcoinAPI.getYearlyPrice(2014))
        .rejects.toThrow('Year 2014 is outside the valid range');
    });

    it('should throw error for invalid year (future)', async () => {
      const futureYear = new Date().getFullYear() + 2;
      await expect(HistoricalBitcoinAPI.getYearlyPrice(futureYear))
        .rejects.toThrow(`Year ${futureYear} is outside the valid range`);
    });

    it('should return fallback data when API fails and no cache exists', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2020);

      expect(result).toEqual({
        year: 2020,
        high: 28994,
        low: 4106,
        average: 11111,
        open: 7179,
        close: 28994
      });
    });

    it('should return expired cache data when API fails', async () => {
      // First, populate cache
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoinGeckoResponse
      });

      await HistoricalBitcoinAPI.getYearlyPrice(2021);

      // Mock cache as expired by manipulating time
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 25 * 60 * 60 * 1000); // 25 hours later

      // Mock API failure
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2021);

      expect(result.year).toBe(2021);
      expect(result.high).toBe(61000);

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should handle HTTP errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2019);

      expect(result).toEqual({
        year: 2019,
        high: 13016,
        low: 3391,
        average: 7179,
        open: 3742,
        close: 7179
      });
    });

    it('should handle empty price data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [] })
      });

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2018);

      expect(result).toEqual({
        year: 2018,
        high: 17527,
        low: 3191,
        average: 7532,
        open: 13880,
        close: 3742
      });
    });
  });

  describe('getYearlyPrices', () => {
    it('should fetch multiple years of data', async () => {
      const mockResponse2020 = {
        prices: [[1577836800000, 7200], [1609459200000, 29000]]
      };
      const mockResponse2021 = {
        prices: [[1609459200000, 29000], [1640995200000, 47000]]
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2020
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2021
        });

      const result = await HistoricalBitcoinAPI.getYearlyPrices(2020, 2021);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result[2020]).toBeDefined();
      expect(result[2021]).toBeDefined();
      expect(result[2020].year).toBe(2020);
      expect(result[2021].year).toBe(2021);
    });

    it('should handle invalid year ranges by clamping to valid range', async () => {
      const currentYear = new Date().getFullYear();
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ prices: [[1577836800000, 30000], [1609459200000, 35000]] })
      });

      const result = await HistoricalBitcoinAPI.getYearlyPrices(2010, currentYear + 5);

      // Should clamp to 2015 - currentYear
      const years = Object.keys(result).map(Number);
      expect(Math.min(...years)).toBe(2015);
      expect(Math.max(...years)).toBe(currentYear);
    });

    it('should handle partial failures gracefully', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ prices: [[1577836800000, 7200], [1609459200000, 29000]] })
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await HistoricalBitcoinAPI.getYearlyPrices(2020, 2021);

      expect(result[2020]).toBeDefined();
      expect(result[2021]).toBeDefined(); // Should have fallback data
      expect(result[2020].year).toBe(2020);
      expect(result[2021].year).toBe(2021);
    });
  });

  describe('cache management', () => {
    it('should clear cache correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [[1577836800000, 30000]] })
      });

      await HistoricalBitcoinAPI.getYearlyPrice(2020);
      
      let stats = HistoricalBitcoinAPI.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.years).toContain(2020);

      HistoricalBitcoinAPI.clearCache();
      
      stats = HistoricalBitcoinAPI.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.years).toHaveLength(0);
    });

    it('should provide accurate cache statistics', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ prices: [[1577836800000, 30000]] })
      });

      await HistoricalBitcoinAPI.getYearlyPrice(2020);
      await HistoricalBitcoinAPI.getYearlyPrice(2021);

      const stats = HistoricalBitcoinAPI.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.years).toEqual([2020, 2021]);
    });
  });

  describe('data formatting', () => {
    it('should round prices to 2 decimal places', async () => {
      const mockResponse = {
        prices: [
          [1609459200000, 29000.123456],
          [1640995200000, 47000.987654]
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2021);

      expect(result.high).toBe(47000.99);
      expect(result.low).toBe(29000.12);
      expect(result.average).toBe(38000.56);
      expect(result.open).toBe(29000.12);
      expect(result.close).toBe(47000.99);
    });

    it('should handle single price point correctly', async () => {
      const mockResponse = {
        prices: [[1609459200000, 35000]]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await HistoricalBitcoinAPI.getYearlyPrice(2021);

      expect(result.high).toBe(35000);
      expect(result.low).toBe(35000);
      expect(result.average).toBe(35000);
      expect(result.open).toBe(35000);
      expect(result.close).toBe(35000);
    });
  });

  describe('fallback data', () => {
    it('should provide reasonable fallback data for known years', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('API unavailable'));

      const result2017 = await HistoricalBitcoinAPI.getYearlyPrice(2017);
      const result2021 = await HistoricalBitcoinAPI.getYearlyPrice(2021);

      expect(result2017.year).toBe(2017);
      expect(result2017.high).toBeGreaterThan(result2017.low);
      expect(result2017.average).toBeGreaterThan(0);

      expect(result2021.year).toBe(2021);
      expect(result2021.high).toBeGreaterThan(result2021.low);
      expect(result2021.average).toBeGreaterThan(0);
    });

    it('should provide estimated data for years without fallback', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('API unavailable'));

      const currentYear = new Date().getFullYear();
      const result = await HistoricalBitcoinAPI.getYearlyPrice(currentYear);

      expect(result.year).toBe(currentYear);
      expect(result.high).toBeGreaterThan(result.low);
      expect(result.average).toBeGreaterThan(0);
      expect(result.high).toBe(result.average * 1.5);
      expect(result.low).toBe(result.average * 0.5);
    });
  });
});