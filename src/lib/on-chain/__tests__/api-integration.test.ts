import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MempoolAPI, MempoolAPIError } from '../mempool-api';
import { OnChainPriceFetcher } from '../price-fetcher';
import { annotateTransactions } from '../annotateTransactions';
import { RawTransaction, AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

// Mock fetch globally for API tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test data
const mockRawTransactions: RawTransaction[] = [
  {
    txid: 'tx1_annual_grant',
    status: {
      confirmed: true,
      block_height: 780000,
      block_time: 1672531200 // 2023-01-01
    },
    vin: [],
    vout: [
      { scriptpubkey_address: '1TestAddress', value: 50000000 } // 0.5 BTC
    ],
    fee: 1000
  },
  {
    txid: 'tx2_other_transaction',
    status: {
      confirmed: true,
      block_height: 785000,
      block_time: 1675209600 // 2023-02-01
    },
    vin: [],
    vout: [
      { scriptpubkey_address: '1TestAddress', value: 25000000 } // 0.25 BTC
    ],
    fee: 1000
  }
];

const mockMempoolResponse = [
  {
    txid: 'tx1_annual_grant',
    version: 1,
    locktime: 0,
    vin: [],
    vout: [
      {
        scriptpubkey: 'script',
        scriptpubkey_asm: 'asm',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: '1TestAddress',
        value: 50000000
      }
    ],
    size: 225,
    weight: 900,
    fee: 1000,
    status: {
      confirmed: true,
      block_height: 780000,
      block_hash: 'block_hash',
      block_time: 1672531200
    }
  },
  {
    txid: 'tx2_other_transaction',
    version: 1,
    locktime: 0,
    vin: [],
    vout: [
      {
        scriptpubkey: 'script',
        scriptpubkey_asm: 'asm',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: '1TestAddress',
        value: 25000000
      }
    ],
    size: 225,
    weight: 900,
    fee: 1000,
    status: {
      confirmed: true,
      block_height: 785000,
      block_hash: 'block_hash',
      block_time: 1675209600
    }
  }
];

const mockPriceResponse = {
  '2023-01-01': 16500,
  '2023-02-01': 23000
};

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MempoolAPI Integration', () => {
    it('should successfully fetch and process transaction data', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMempoolResponse
      });

      const api = new MempoolAPI();
      const result = await api.fetchTransactions('1TestAddress');

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith(
        'https://mempool.space/api/address/1TestAddress/txs',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': 'Bitcoin-Vesting-Tracker/1.0'
          })
        })
      );

      // Verify data transformation
      expect(result).toHaveLength(2);
      expect(result[0].txid).toBe('tx1_annual_grant');
      expect(result[0].status.block_time).toBe(1672531200);
      expect(result[1].txid).toBe('tx2_other_transaction');
    });

    it('should handle API rate limiting with retry', async () => {
      const api = new MempoolAPI({ retryDelay: 10, maxRetries: 2 });

      // First call returns rate limit error
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests'
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMempoolResponse
        });

      const result = await api.fetchTransactions('1TestAddress');

      // Should have retried once
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should handle network timeouts', async () => {
      const api = new MempoolAPI({ timeout: 100, maxRetries: 0 });

      // Mock slow response that exceeds timeout
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockMempoolResponse
          }), 200);
        })
      );

      await expect(api.fetchTransactions('1TestAddress'))
        .rejects.toThrow('Request timeout');
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      const api = new MempoolAPI();
      await expect(api.fetchTransactions('1TestAddress'))
        .rejects.toThrow('Invalid API response format');
    });

    it('should filter incoming transactions correctly', () => {
      const filtered = MempoolAPI.filterIncomingTransactions(mockRawTransactions, '1TestAddress');
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].txid).toBe('tx1_annual_grant');
      expect(filtered[1].txid).toBe('tx2_other_transaction');
    });

    it('should calculate received amounts correctly', () => {
      const amount1 = MempoolAPI.getReceivedAmount(mockRawTransactions[0], '1TestAddress');
      const amount2 = MempoolAPI.getReceivedAmount(mockRawTransactions[1], '1TestAddress');
      
      expect(amount1).toBe(50000000); // 0.5 BTC
      expect(amount2).toBe(25000000); // 0.25 BTC
    });
  });

  describe('Price Fetcher Integration', () => {
    it('should fetch batch prices successfully', async () => {
      // Mock historical Bitcoin API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPriceResponse
      });

      const prices = await OnChainPriceFetcher.fetchBatchPrices(['2023-01-01', '2023-02-01']);

      expect(prices).toEqual(mockPriceResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/historical-prices'),
        expect.any(Object)
      );
    });

    it('should handle price API failures gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Price API unavailable'));

      await expect(OnChainPriceFetcher.fetchBatchPrices(['2023-01-01']))
        .rejects.toThrow('Price API unavailable');
    });

    it('should optimize price requests by deduplicating dates', () => {
      const transactions = [
        { ...mockRawTransactions[0], status: { ...mockRawTransactions[0].status, block_time: 1672531200 } },
        { ...mockRawTransactions[1], status: { ...mockRawTransactions[1].status, block_time: 1672531200 } }, // Same date
        { ...mockRawTransactions[0], status: { ...mockRawTransactions[0].status, block_time: 1675209600 } }
      ];

      const uniqueDates = OnChainPriceFetcher.optimizePriceRequests(transactions);
      
      // Should deduplicate to only unique dates
      expect(uniqueDates).toHaveLength(2);
      expect(uniqueDates).toContain('2023-01-01');
      expect(uniqueDates).toContain('2023-02-01');
    });
  });

  describe('Annotation Algorithm Integration', () => {
    it('should integrate with real transaction and price data', () => {
      const vestingStartDate = '2023-01-01';
      const annualGrantBtc = 0.5;
      const historicalPrices = mockPriceResponse;

      const result = annotateTransactions(
        mockRawTransactions,
        '1TestAddress',
        vestingStartDate,
        annualGrantBtc,
        historicalPrices
      );

      expect(result.annotatedTransactions).toHaveLength(2);
      expect(result.expectedGrants).toHaveLength(10); // 10 years of expected grants

      // First transaction should match Year 1 grant
      const firstTx = result.annotatedTransactions[0];
      expect(firstTx.grantYear).toBe(1);
      expect(firstTx.type).toBe('Annual Grant');
      expect(firstTx.valueAtTimeOfTx).toBe(16500);

      // Second transaction should not match (different amount)
      const secondTx = result.annotatedTransactions[1];
      expect(secondTx.grantYear).toBe(null);
      expect(secondTx.type).toBe('Other Transaction');
      expect(secondTx.valueAtTimeOfTx).toBe(23000);
    });

    it('should handle edge cases in annotation matching', () => {
      // Create transaction with amount very close to expected grant
      const closeMatchTransaction: RawTransaction = {
        txid: 'tx_close_match',
        status: {
          confirmed: true,
          block_height: 780000,
          block_time: 1672617600 // 2023-01-02 (1 day after expected)
        },
        vin: [],
        vout: [
          { scriptpubkey_address: '1TestAddress', value: 49500000 } // 0.495 BTC (1% less than 0.5)
        ],
        fee: 1000
      };

      const result = annotateTransactions(
        [closeMatchTransaction],
        '1TestAddress',
        '2023-01-01',
        0.5,
        { '2023-01-02': 16500 }
      );

      // Should still match due to tolerance
      expect(result.annotatedTransactions[0].grantYear).toBe(1);
      expect(result.annotatedTransactions[0].type).toBe('Annual Grant');
      expect(result.annotatedTransactions[0].matchScore).toBeGreaterThan(0.75);
    });

    it('should handle transactions without price data', () => {
      const result = annotateTransactions(
        mockRawTransactions,
        '1TestAddress',
        '2023-01-01',
        0.5,
        {} // No price data
      );

      expect(result.annotatedTransactions).toHaveLength(2);
      expect(result.annotatedTransactions[0].valueAtTimeOfTx).toBe(null);
      expect(result.annotatedTransactions[1].valueAtTimeOfTx).toBe(null);
    });
  });

  describe('End-to-End API Workflow', () => {
    it('should handle complete API workflow with all services', async () => {
      // Mock all API calls
      mockFetch
        // Mempool API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMempoolResponse
        })
        // Price API call
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPriceResponse
        });

      // Step 1: Fetch transactions
      const api = new MempoolAPI();
      const transactions = await api.fetchTransactions('1TestAddress');
      
      expect(transactions).toHaveLength(2);

      // Step 2: Filter incoming transactions
      const incomingTransactions = MempoolAPI.filterIncomingTransactions(transactions, '1TestAddress');
      
      expect(incomingTransactions).toHaveLength(2);

      // Step 3: Fetch historical prices
      const uniqueDates = OnChainPriceFetcher.optimizePriceRequests(incomingTransactions);
      const prices = await OnChainPriceFetcher.fetchBatchPrices(uniqueDates);
      
      expect(prices).toEqual(mockPriceResponse);

      // Step 4: Annotate transactions
      const result = annotateTransactions(
        incomingTransactions,
        '1TestAddress',
        '2023-01-01',
        0.5,
        prices
      );

      // Verify final result
      expect(result.annotatedTransactions).toHaveLength(2);
      expect(result.expectedGrants).toHaveLength(10);
      
      const grantTransaction = result.annotatedTransactions.find(tx => tx.grantYear === 1);
      expect(grantTransaction).toBeDefined();
      expect(grantTransaction?.valueAtTimeOfTx).toBe(16500);
    });

    it('should handle partial failures in API workflow', async () => {
      // Mock successful transaction fetch but failed price fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMempoolResponse
        })
        .mockRejectedValueOnce(new Error('Price API unavailable'));

      const api = new MempoolAPI();
      
      // Step 1: Fetch transactions (succeeds)
      const transactions = await api.fetchTransactions('1TestAddress');
      expect(transactions).toHaveLength(2);

      // Step 2: Try to fetch prices (fails)
      const uniqueDates = OnChainPriceFetcher.optimizePriceRequests(transactions);
      
      let prices = {};
      try {
        prices = await OnChainPriceFetcher.fetchBatchPrices(uniqueDates);
      } catch (error) {
        // Expected to fail, continue with empty prices
        expect(error).toBeInstanceOf(Error);
      }

      // Step 3: Annotate with empty prices (graceful degradation)
      const result = annotateTransactions(
        transactions,
        '1TestAddress',
        '2023-01-01',
        0.5,
        prices
      );

      // Should still work but without price data
      expect(result.annotatedTransactions).toHaveLength(2);
      expect(result.annotatedTransactions[0].valueAtTimeOfTx).toBe(null);
      expect(result.annotatedTransactions[1].valueAtTimeOfTx).toBe(null);
    });

    it('should handle API errors with proper error types', async () => {
      // Test different error scenarios
      const testCases = [
        {
          name: 'Network Error',
          mockError: () => mockFetch.mockRejectedValueOnce(new TypeError('Network error')),
          expectedError: 'Network error'
        },
        {
          name: 'HTTP 404',
          mockError: () => mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found'
          }),
          expectedError: 'HTTP 404: Not Found'
        },
        {
          name: 'HTTP 500',
          mockError: () => mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
          }),
          expectedError: 'HTTP 500: Internal Server Error'
        },
        {
          name: 'Invalid JSON',
          mockError: () => mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => { throw new Error('Invalid JSON'); }
          }),
          expectedError: 'Unexpected error: Invalid JSON'
        }
      ];

      for (const testCase of testCases) {
        mockFetch.mockClear();
        testCase.mockError();

        const api = new MempoolAPI({ maxRetries: 0 }); // No retries for faster testing
        
        await expect(api.fetchTransactions('1TestAddress'))
          .rejects.toThrow(testCase.expectedError);
      }
    });

    it('should validate Bitcoin addresses before API calls', async () => {
      const api = new MempoolAPI();

      // Test invalid addresses
      const invalidAddresses = [
        '',
        'invalid',
        '1234567890',
        'bc1invalid',
        null,
        undefined
      ];

      for (const address of invalidAddresses) {
        await expect(api.fetchTransactions(address as any))
          .rejects.toThrow(MempoolAPIError);
      }

      // Should not have made any API calls
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle concurrent API requests', async () => {
      // Mock multiple successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMempoolResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPriceResponse
        });

      const api = new MempoolAPI();

      // Make concurrent requests
      const [transactionsResult, pricesResult] = await Promise.all([
        api.fetchTransactions('1TestAddress'),
        OnChainPriceFetcher.fetchBatchPrices(['2023-01-01', '2023-02-01'])
      ]);

      expect(transactionsResult).toHaveLength(2);
      expect(pricesResult).toEqual(mockPriceResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Mock Validation and Consistency', () => {
    it('should maintain consistent mock behavior across tests', async () => {
      // Verify mocks are properly reset between tests
      expect(mockFetch).toHaveBeenCalledTimes(0);

      // Test that mocks work as expected
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMempoolResponse
      });

      const api = new MempoolAPI();
      const result = await api.fetchTransactions('1TestAddress');

      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should properly mock error scenarios', async () => {
      // Test that error mocks work correctly
      mockFetch.mockRejectedValueOnce(new Error('Mocked error'));

      const api = new MempoolAPI({ maxRetries: 0 });
      
      await expect(api.fetchTransactions('1TestAddress'))
        .rejects.toThrow('Mocked error');
    });

    it('should validate mock data structure matches real API', () => {
      // Verify mock data has correct structure
      expect(mockMempoolResponse[0]).toHaveProperty('txid');
      expect(mockMempoolResponse[0]).toHaveProperty('status.confirmed');
      expect(mockMempoolResponse[0]).toHaveProperty('status.block_time');
      expect(mockMempoolResponse[0]).toHaveProperty('vout');
      expect(mockMempoolResponse[0].vout[0]).toHaveProperty('scriptpubkey_address');
      expect(mockMempoolResponse[0].vout[0]).toHaveProperty('value');

      // Verify price data structure
      expect(mockPriceResponse).toHaveProperty('2023-01-01');
      expect(typeof mockPriceResponse['2023-01-01']).toBe('number');
    });
  });
});