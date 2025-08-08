import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { useOnChainStore } from '../onChainStore';
import { MempoolAPI } from '@/lib/on-chain/mempool-api';
import { OnChainPriceFetcher } from '@/lib/on-chain/price-fetcher';
import { annotateTransactions } from '@/lib/on-chain/annotateTransactions';
import { RawTransaction, AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

// Mock external dependencies
jest.mock('@/lib/on-chain/mempool-api');
jest.mock('@/lib/on-chain/price-fetcher');
jest.mock('@/lib/on-chain/annotateTransactions');

// Test data
const mockRawTransactions: RawTransaction[] = [
  {
    txid: 'tx1_perfect_match',
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
    txid: 'tx2_other_amount',
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

const mockAnnotatedTransactions: AnnotatedTransaction[] = [
  {
    txid: 'tx1_perfect_match',
    grantYear: 1,
    type: 'Annual Grant',
    isIncoming: true,
    amountBTC: 0.5,
    amountSats: 50000000,
    date: '2023-01-01',
    blockHeight: 780000,
    valueAtTimeOfTx: 16500,
    status: 'Confirmed',
    matchScore: 0.95,
    isManuallyAnnotated: false
  },
  {
    txid: 'tx2_other_amount',
    grantYear: null,
    type: 'Other Transaction',
    isIncoming: true,
    amountBTC: 0.25,
    amountSats: 25000000,
    date: '2023-02-01',
    blockHeight: 785000,
    valueAtTimeOfTx: 23000,
    status: 'Confirmed',
    isManuallyAnnotated: false
  }
];

const mockExpectedGrants: ExpectedGrant[] = [
  {
    year: 1,
    expectedDate: '2023-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: true,
    matchedTxid: 'tx1_perfect_match',
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  },
  {
    year: 2,
    expectedDate: '2024-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: false,
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  }
];

describe('OnChainStore Integration Tests', () => {
  const mockMempoolAPI = jest.mocked(MempoolAPI);
  const mockPriceFetcher = jest.mocked(OnChainPriceFetcher);
  const mockAnnotateTransactions = jest.mocked(annotateTransactions);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockMempoolAPI.validateAddress = jest.fn().mockReturnValue(true);
    mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockResolvedValue(mockRawTransactions);
    mockMempoolAPI.prototype.hasTransactionHistory = jest.fn().mockResolvedValue(true);
    mockMempoolAPI.filterIncomingTransactions = jest.fn().mockReturnValue(mockRawTransactions);
    
    mockPriceFetcher.fetchBatchPrices = jest.fn().mockResolvedValue({
      '2023-01-01': 16500,
      '2023-02-01': 23000
    });
    
    mockAnnotateTransactions.mockReturnValue({
      annotatedTransactions: mockAnnotatedTransactions,
      expectedGrants: mockExpectedGrants
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Workflow Integration', () => {
    it('should handle complete happy path workflow', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Initial state
      expect(result.current.currentStep).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.annotatedTransactions).toEqual([]);

      // Set form data
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      expect(result.current.address).toBe('1TestAddress');
      expect(result.current.vestingStartDate).toBe('2023-01-01');
      expect(result.current.annualGrantBtc).toBe(0.5);

      // Validate and fetch
      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Verify API calls were made
      expect(mockMempoolAPI.validateAddress).toHaveBeenCalledWith('1TestAddress');
      expect(mockMempoolAPI.prototype.fetchTransactions).toHaveBeenCalledWith('1TestAddress');
      expect(mockPriceFetcher.fetchBatchPrices).toHaveBeenCalled();
      expect(mockAnnotateTransactions).toHaveBeenCalled();

      // Verify final state
      expect(result.current.currentStep).toBe('complete');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.annotatedTransactions).toEqual(mockAnnotatedTransactions);
      expect(result.current.expectedGrants).toEqual(mockExpectedGrants);
    });

    it('should handle validation errors before API calls', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Set invalid form data
      act(() => {
        result.current.setFormData({
          address: 'invalid_address',
          vestingStartDate: '2025-01-01', // Future date
          annualGrantBtc: -1 // Negative amount
        });
      });

      // Mock validation failure
      mockMempoolAPI.validateAddress = jest.fn().mockReturnValue(false);

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Should have validation errors
      expect(result.current.formErrors.address).toBeDefined();
      expect(result.current.currentStep).toBe('idle');
      expect(result.current.isLoading).toBe(false);

      // API calls should not have been made
      expect(mockMempoolAPI.prototype.fetchTransactions).not.toHaveBeenCalled();
      expect(mockPriceFetcher.fetchBatchPrices).not.toHaveBeenCalled();
    });

    it('should handle API failures gracefully', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Set valid form data
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      // Mock API failure
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValue(
        new Error('Network connection failed')
      );

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Should be in error state
      expect(result.current.error).toContain('Network connection failed');
      expect(result.current.currentStep).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.annotatedTransactions).toEqual([]);
    });

    it('should handle partial API failures with graceful degradation', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Set valid form data
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      // Mock price fetching failure but transaction fetching success
      mockPriceFetcher.fetchBatchPrices = jest.fn().mockRejectedValue(
        new Error('Price API unavailable')
      );

      // Mock annotation to return transactions without prices
      const transactionsWithoutPrices = mockAnnotatedTransactions.map(tx => ({
        ...tx,
        valueAtTimeOfTx: null
      }));
      mockAnnotateTransactions.mockReturnValue({
        annotatedTransactions: transactionsWithoutPrices,
        expectedGrants: mockExpectedGrants
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Should complete successfully but without price data
      expect(result.current.currentStep).toBe('complete');
      expect(result.current.error).toBe(null);
      expect(result.current.annotatedTransactions).toEqual(transactionsWithoutPrices);
      expect(result.current.annotatedTransactions[0].valueAtTimeOfTx).toBe(null);
    });
  });

  describe('Manual Annotation Integration', () => {
    it('should handle manual annotation updates', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state with transactions
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Verify initial state
      expect(result.current.annotatedTransactions[1].grantYear).toBe(null);
      expect(result.current.annotatedTransactions[1].type).toBe('Other Transaction');
      expect(result.current.manualAnnotations.size).toBe(0);

      // Apply manual annotation
      act(() => {
        result.current.updateManualAnnotation('tx2_other_amount', 2);
      });

      // Verify manual annotation is applied
      expect(result.current.manualAnnotations.get('tx2_other_amount')).toBe(2);
      
      // The annotated transactions should be updated
      const updatedTx = result.current.annotatedTransactions.find(tx => tx.txid === 'tx2_other_amount');
      expect(updatedTx?.grantYear).toBe(2);
      expect(updatedTx?.type).toBe('Annual Grant');
      expect(updatedTx?.isManuallyAnnotated).toBe(true);
    });

    it('should handle manual annotation removal', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Apply manual annotation
      act(() => {
        result.current.updateManualAnnotation('tx2_other_amount', 2);
      });

      expect(result.current.manualAnnotations.get('tx2_other_amount')).toBe(2);

      // Remove manual annotation
      act(() => {
        result.current.updateManualAnnotation('tx2_other_amount', null);
      });

      // Verify annotation is removed
      expect(result.current.manualAnnotations.has('tx2_other_amount')).toBe(false);
      
      // Transaction should revert to original annotation
      const revertedTx = result.current.annotatedTransactions.find(tx => tx.txid === 'tx2_other_amount');
      expect(revertedTx?.grantYear).toBe(null);
      expect(revertedTx?.type).toBe('Other Transaction');
      expect(revertedTx?.isManuallyAnnotated).toBe(false);
    });

    it('should persist manual annotations through re-annotation', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup and complete initial analysis
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Apply manual annotation
      act(() => {
        result.current.updateManualAnnotation('tx2_other_amount', 2);
      });

      expect(result.current.manualAnnotations.get('tx2_other_amount')).toBe(2);

      // Trigger re-analysis (e.g., retry after error)
      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Manual annotation should persist
      expect(result.current.manualAnnotations.get('tx2_other_amount')).toBe(2);
      const manualTx = result.current.annotatedTransactions.find(tx => tx.txid === 'tx2_other_amount');
      expect(manualTx?.grantYear).toBe(2);
      expect(manualTx?.isManuallyAnnotated).toBe(true);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle retry after network failure', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Set valid form data
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      // Mock initial failure
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValueOnce(
        new Error('Network connection failed')
      ).mockResolvedValueOnce(mockRawTransactions);

      // First attempt should fail
      await act(async () => {
        await result.current.validateAndFetch();
      });

      expect(result.current.error).toContain('Network connection failed');
      expect(result.current.currentStep).toBe('idle');

      // Retry should succeed
      await act(async () => {
        await result.current.retryOperation();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.currentStep).toBe('complete');
      expect(result.current.annotatedTransactions).toEqual(mockAnnotatedTransactions);
    });

    it('should handle retry with different form data', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Initial attempt with invalid data
      act(() => {
        result.current.setFormData({
          address: 'invalid_address',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      mockMempoolAPI.validateAddress = jest.fn().mockReturnValue(false);

      await act(async () => {
        await result.current.validateAndFetch();
      });

      expect(result.current.formErrors.address).toBeDefined();

      // Update with valid data
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      mockMempoolAPI.validateAddress = jest.fn().mockReturnValue(true);

      // Retry should succeed
      await act(async () => {
        await result.current.retryOperation();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.formErrors).toEqual({});
      expect(result.current.currentStep).toBe('complete');
    });

    it('should handle multiple consecutive failures', async () => {
      const { result } = renderHook(() => useOnChainStore());

      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      // Mock multiple failures followed by success
      mockMempoolAPI.prototype.fetchTransactions = jest.fn()
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockResolvedValueOnce(mockRawTransactions);

      // First failure
      await act(async () => {
        await result.current.validateAndFetch();
      });
      expect(result.current.error).toContain('Network error 1');

      // Second failure
      await act(async () => {
        await result.current.retryOperation();
      });
      expect(result.current.error).toContain('Network error 2');

      // Third attempt succeeds
      await act(async () => {
        await result.current.retryOperation();
      });
      expect(result.current.error).toBe(null);
      expect(result.current.currentStep).toBe('complete');
    });
  });

  describe('State Reset Integration', () => {
    it('should completely reset state including manual annotations', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup complete state
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Add manual annotation
      act(() => {
        result.current.updateManualAnnotation('tx2_other_amount', 2);
      });

      // Verify state is populated
      expect(result.current.annotatedTransactions.length).toBeGreaterThan(0);
      expect(result.current.expectedGrants.length).toBeGreaterThan(0);
      expect(result.current.manualAnnotations.size).toBeGreaterThan(0);
      expect(result.current.address).toBe('1TestAddress');

      // Reset
      act(() => {
        result.current.resetTracker();
      });

      // Verify complete reset
      expect(result.current.address).toBe('');
      expect(result.current.vestingStartDate).toBe('');
      expect(result.current.annualGrantBtc).toBe(0);
      expect(result.current.annotatedTransactions).toEqual([]);
      expect(result.current.expectedGrants).toEqual([]);
      expect(result.current.manualAnnotations.size).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.formErrors).toEqual({});
      expect(result.current.currentStep).toBe('idle');
      expect(result.current.isLoading).toBe(false);
    });

    it('should allow new analysis after reset', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Complete first analysis
      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      expect(result.current.currentStep).toBe('complete');

      // Reset
      act(() => {
        result.current.resetTracker();
      });

      // Start new analysis with different data
      act(() => {
        result.current.setFormData({
          address: '1DifferentAddress',
          vestingStartDate: '2024-01-01',
          annualGrantBtc: 1.0
        });
      });

      await act(async () => {
        await result.current.validateAndFetch();
      });

      // Should complete successfully with new data
      expect(result.current.currentStep).toBe('complete');
      expect(result.current.address).toBe('1DifferentAddress');
      expect(result.current.annualGrantBtc).toBe(1.0);
      expect(mockMempoolAPI.prototype.fetchTransactions).toHaveBeenCalledWith('1DifferentAddress');
    });
  });

  describe('Loading State Integration', () => {
    it('should properly manage loading states through workflow', async () => {
      const { result } = renderHook(() => useOnChainStore());

      // Initial state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentStep).toBe('idle');

      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      // Mock slow API calls to test loading states
      let resolveFetchTransactions: (value: RawTransaction[]) => void;
      let resolveFetchPrices: (value: Record<string, number>) => void;

      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolveFetchTransactions = resolve; })
      );
      
      mockPriceFetcher.fetchBatchPrices = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolveFetchPrices = resolve; })
      );

      // Start validation
      const validatePromise = act(async () => {
        await result.current.validateAndFetch();
      });

      // Should be in loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.currentStep).toBe('fetching');

      // Resolve transaction fetching
      act(() => {
        resolveFetchTransactions(mockRawTransactions);
      });

      // Should move to annotation step
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.currentStep).toBe('annotating');

      // Resolve price fetching
      act(() => {
        resolveFetchPrices({ '2023-01-01': 16500, '2023-02-01': 23000 });
      });

      // Wait for completion
      await validatePromise;

      // Should be complete and not loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentStep).toBe('complete');
    });

    it('should handle loading state during retry operations', async () => {
      const { result } = renderHook(() => useOnChainStore());

      act(() => {
        result.current.setFormData({
          address: '1TestAddress',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });
      });

      // Mock initial failure
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValueOnce(
        new Error('Network error')
      );

      await act(async () => {
        await result.current.validateAndFetch();
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);

      // Mock successful retry
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockResolvedValue(mockRawTransactions);

      // Start retry
      const retryPromise = act(async () => {
        await result.current.retryOperation();
      });

      // Should be loading during retry
      expect(result.current.isLoading).toBe(true);

      await retryPromise;

      // Should complete successfully
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.currentStep).toBe('complete');
    });
  });
});