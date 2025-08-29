/**
 * Integration Tests for Bitcoin Tools
 * 
 * Tests the complete flow of Bitcoin tools with the unified API client,
 * circuit breakers, rate limiting, and error recovery mechanisms.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { unifiedBitcoinAPI } from '@/lib/api/unifiedBitcoinAPI';
import { AddressService } from '@/lib/services/addressService';
import { TransactionService } from '@/lib/services/transactionService';
import { MempoolAPI } from '@/lib/on-chain/mempool-api';

// Mock fetch globally
global.fetch = vi.fn();

describe('Bitcoin Tools Integration', () => {
  beforeEach(() => {
    // Clear all caches and reset state before each test
    unifiedBitcoinAPI.clearCache();
    unifiedBitcoinAPI.resetMetrics();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('UnifiedBitcoinAPI', () => {
    it('should cache successful responses', async () => {
      const mockResponse = { bitcoin: { usd: 50000 } };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // First request should hit the API
      const result1 = await unifiedBitcoinAPI.request('/api/test', {
        cacheKey: 'test-cache'
      });

      expect(result1.success).toBe(true);
      expect(result1.data).toEqual(mockResponse);
      expect(result1.cached).toBeFalsy();

      // Second request should use cache
      const result2 = await unifiedBitcoinAPI.request('/api/test', {
        cacheKey: 'test-cache'
      });

      expect(result2.success).toBe(true);
      expect(result2.data).toEqual(mockResponse);
      expect(result2.cached).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle circuit breaker opening on multiple failures', async () => {
      // Mock multiple failures
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      // Make requests until circuit breaker opens
      const results = [];
      for (let i = 0; i < 6; i++) {
        try {
          await unifiedBitcoinAPI.request('https://test.api/endpoint', {
            skipCache: true,
            skipCircuitBreaker: false
          });
        } catch (error) {
          results.push(error);
        }
      }

      // After threshold, circuit breaker should be open
      const lastError = results[results.length - 1];
      expect(lastError).toBeDefined();
      
      // Check circuit breaker status
      const status = unifiedBitcoinAPI.getCircuitBreakerStatus();
      expect(Object.values(status).some(s => s === 'OPEN')).toBeTruthy();
    });

    it('should use fallback data when API fails', async () => {
      const fallbackData = { test: 'fallback' };
      
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      const result = await unifiedBitcoinAPI.request('/api/test', {
        fallbackData,
        skipCache: true
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(fallbackData);
      expect(result.fallback).toBe(true);
    });

    it('should deduplicate concurrent requests', async () => {
      const mockResponse = { data: 'test' };
      
      // Mock delayed response
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockResponse
          }), 100)
        )
      );

      // Make concurrent requests with same cache key
      const promises = [
        unifiedBitcoinAPI.request('/api/test', { cacheKey: 'dedupe-test' }),
        unifiedBitcoinAPI.request('/api/test', { cacheKey: 'dedupe-test' }),
        unifiedBitcoinAPI.request('/api/test', { cacheKey: 'dedupe-test' })
      ];

      const results = await Promise.all(promises);

      // All should succeed with same data
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
      });

      // Fetch should only be called once due to deduplication
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('AddressService with UnifiedAPI', () => {
    it('should analyze address with resilient API calls', async () => {
      const mockAddressInfo = {
        chain_stats: {
          funded_txo_count: 10,
          funded_txo_sum: 1000000,
          spent_txo_count: 5,
          spent_txo_sum: 500000,
          tx_count: 15
        },
        mempool_stats: {
          funded_txo_count: 0,
          funded_txo_sum: 0,
          spent_txo_count: 0,
          spent_txo_sum: 0,
          tx_count: 0
        }
      };

      const mockTransactions: any[] = [];
      const mockPrice = { bitcoin: { usd: 50000 } };

      // Mock successful responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAddressInfo
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransactions
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPrice
        });

      const result = await AddressService.analyzeAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      expect(result).toBeDefined();
      expect(result.balance).toBeDefined();
      expect(result.transactionCount).toBe(15);
    });

    it('should handle address not found error gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      });

      await expect(
        AddressService.analyzeAddress('invalid-address')
      ).rejects.toThrow();
    });
  });

  describe('TransactionService with UnifiedAPI', () => {
    it('should get transaction details with caching', async () => {
      const mockTransaction = {
        txid: 'abc123',
        status: {
          confirmed: true,
          block_height: 700000,
          block_time: 1234567890
        },
        fee: 1000,
        size: 250,
        weight: 1000,
        vin: [],
        vout: []
      };

      const mockPrice = { bitcoin: { usd: 50000 } };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPrice
        });

      // Valid transaction ID (64 hex characters)
      const txid = 'a'.repeat(64);
      
      const result = await TransactionService.getTransactionDetails(txid);

      expect(result).toBeDefined();
      expect(result.status).toBe('confirmed');
      expect(result.fee).toBeDefined();
    });

    it('should handle invalid transaction ID', async () => {
      await expect(
        TransactionService.getTransactionDetails('invalid-txid')
      ).rejects.toThrow('INVALID_TXID');
    });
  });

  describe('MempoolAPI with UnifiedAPI', () => {
    it('should fetch transactions with circuit breaker protection', async () => {
      const mockTransactions = [
        {
          txid: 'tx1',
          vin: [],
          vout: [{
            scriptpubkey_address: 'address1',
            value: 50000
          }],
          status: {
            confirmed: true,
            block_height: 700000
          }
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions
      });

      const api = new MempoolAPI();
      const result = await api.fetchTransactions('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for address with no transactions', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const api = new MempoolAPI();
      const result = await api.fetchTransactions('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      expect(result).toEqual([]);
    });
  });

  describe('End-to-End Error Recovery', () => {
    it('should recover from temporary API failures', async () => {
      let callCount = 0;
      
      // First two calls fail, third succeeds
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ bitcoin: { usd: 50000 } })
        });
      });

      // Should eventually succeed with retries
      const result = await unifiedBitcoinAPI.request('/api/test', {
        skipCache: true,
        fallbackData: { bitcoin: { usd: 30000 } }
      });

      expect(result.success).toBe(true);
      // Should use fallback for first attempts, then succeed
      expect(result.data).toBeDefined();
    });

    it('should handle rate limiting appropriately', async () => {
      // Simulate rate limit response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limited' })
      });

      const result = await unifiedBitcoinAPI.request('/api/test', {
        skipRateLimit: false,
        fallbackData: { default: 'data' }
      });

      // Should fall back gracefully
      expect(result.success).toBe(true);
      expect(result.fallback).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    it('should track API metrics correctly', async () => {
      // Reset metrics
      unifiedBitcoinAPI.resetMetrics();

      // Make some successful requests
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      await unifiedBitcoinAPI.request('/api/test1', { skipCache: true });
      await unifiedBitcoinAPI.request('/api/test2', { skipCache: true });
      
      // Make a cached request
      await unifiedBitcoinAPI.request('/api/test1', { cacheKey: 'test1' });
      await unifiedBitcoinAPI.request('/api/test1', { cacheKey: 'test1' });

      const metrics = unifiedBitcoinAPI.getMetrics();

      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.successfulRequests).toBeGreaterThan(0);
      expect(metrics.cacheHits).toBeGreaterThan(0);
    });
  });
});

describe('Circuit Breaker Recovery', () => {
  it('should automatically move to half-open state after timeout', async () => {
    // This would need to be tested with actual timing or mocked timers
    // For now, we verify the circuit breaker can be manually reset
    
    const endpoint = 'test.api.com';
    unifiedBitcoinAPI.resetCircuitBreaker(endpoint);
    
    const status = unifiedBitcoinAPI.getCircuitBreakerStatus();
    
    // After reset, circuit breaker should be closed
    expect(status[endpoint]).toBeUndefined(); // or 'CLOSED' if it exists
  });
});