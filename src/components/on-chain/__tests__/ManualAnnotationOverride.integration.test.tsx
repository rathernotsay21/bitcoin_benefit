import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOnChainStore } from '@/stores/onChainStore';
import { AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

// Mock the dependencies
vi.mock('@/lib/on-chain/mempool-api', () => ({
  mempoolAPI: {
    fetchTransactions: vi.fn()
  }
}));

vi.mock('@/lib/on-chain/price-fetcher', () => ({
  OnChainPriceFetcher: {
    optimizePriceRequests: vi.fn(() => []),
    fetchBatchPrices: vi.fn(() => Promise.resolve({}))
  }
}));

vi.mock('@/lib/on-chain/annotateTransactions', () => ({
  annotateTransactions: vi.fn(),
  generateExpectedGrants: vi.fn(),
  applyManualAnnotations: vi.fn()
}));

vi.mock('@/lib/on-chain/validation', () => ({
  validateTrackerForm: vi.fn(() => ({ success: true })),
  validateField: vi.fn()
}));

const mockTransactions: AnnotatedTransaction[] = [
  {
    txid: 'tx1',
    grantYear: 1,
    type: 'Annual Grant',
    isIncoming: true,
    amountBTC: 0.5,
    amountSats: 50000000,
    date: '2023-01-15',
    blockHeight: 123456,
    valueAtTimeOfTx: 10000,
    status: 'Confirmed',
    matchScore: 0.85,
    isManuallyAnnotated: false
  },
  {
    txid: 'tx2',
    grantYear: null,
    type: 'Other Transaction',
    isIncoming: true,
    amountBTC: 0.25,
    amountSats: 25000000,
    date: '2023-06-15',
    blockHeight: 123789,
    valueAtTimeOfTx: 7500,
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
    matchedTxid: 'tx1',
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

describe('ManualAnnotationOverride Integration Tests', () => {
  describe('Store integration', () => {
    it('updates manual annotations in store when updateManualAnnotation is called', () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state
      act(() => {
        result.current.setFormData({
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        });

        // Manually set the state to simulate completed annotation
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).currentStep = 'complete';
      });

      // Test manual annotation update
      act(() => {
        result.current.updateManualAnnotation('tx2', 2);
      });

      // Verify the manual annotation was stored
      expect(result.current.manualAnnotations.get('tx2')).toBe(2);
    });

    it('calls applyManualAnnotations when manual annotation is updated', async () => {
      const { applyManualAnnotations } = await import('@/lib/on-chain/annotateTransactions');
      const mockApplyManualAnnotations = applyManualAnnotations as any;

      // Setup mock to return updated data
      mockApplyManualAnnotations.mockReturnValue({
        annotatedTransactions: mockTransactions.map(tx => 
          tx.txid === 'tx2' 
            ? { ...tx, grantYear: 2, type: 'Annual Grant' as const, isManuallyAnnotated: true }
            : tx
        ),
        expectedGrants: mockExpectedGrants.map(grant => 
          grant.year === 2
            ? { ...grant, isMatched: true, matchedTxid: 'tx2' }
            : grant
        )
      });

      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).currentStep = 'complete';
      });

      // Test manual annotation update
      act(() => {
        result.current.updateManualAnnotation('tx2', 2);
      });

      // Verify applyManualAnnotations was called
      expect(mockApplyManualAnnotations).toHaveBeenCalledWith(
        mockTransactions,
        mockExpectedGrants,
        expect.any(Map)
      );
    });

    it('preserves historical prices when updating manual annotations', () => {
      const { result } = renderHook(() => useOnChainStore());

      const historicalPrices = { '2023-01-15': 20000, '2023-06-15': 30000 };

      // Setup initial state with price data
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).historicalPrices = historicalPrices;
        (result.current as any).currentStep = 'complete';
      });

      // Test manual annotation update
      act(() => {
        result.current.updateManualAnnotation('tx2', 2);
      });

      // Verify historical prices are preserved
      expect(result.current.historicalPrices).toEqual(historicalPrices);
    });

    it('updates transaction USD values after manual annotation', async () => {
      const { applyManualAnnotations } = await import('@/lib/on-chain/annotateTransactions');
      const mockApplyManualAnnotations = applyManualAnnotations as any;

      const updatedTransaction = {
        ...mockTransactions[1],
        grantYear: 2,
        type: 'Annual Grant' as const,
        isManuallyAnnotated: true
      };

      mockApplyManualAnnotations.mockReturnValue({
        annotatedTransactions: [mockTransactions[0], updatedTransaction],
        expectedGrants: mockExpectedGrants
      });

      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state with price data
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).historicalPrices = { '2023-06-15': 30000 };
        (result.current as any).currentStep = 'complete';
      });

      // Test manual annotation update
      act(() => {
        result.current.updateManualAnnotation('tx2', 2);
      });

      // Verify USD value is calculated for the updated transaction
      const updatedTx = result.current.annotatedTransactions.find(tx => tx.txid === 'tx2');
      expect(updatedTx?.valueAtTimeOfTx).toBe(Math.round(0.25 * 30000 * 100) / 100);
    });
  });

  describe('Error handling', () => {
    it('handles errors in applyManualAnnotations gracefully', async () => {
      const { applyManualAnnotations } = await import('@/lib/on-chain/annotateTransactions');
      const mockApplyManualAnnotations = applyManualAnnotations as any;

      // Make applyManualAnnotations throw an error
      mockApplyManualAnnotations.mockImplementation(() => {
        throw new Error('Annotation error');
      });

      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).currentStep = 'complete';
      });

      // Test that error doesn't crash the application
      act(() => {
        result.current.updateManualAnnotation('tx2', 2);
      });

      // The store should handle the error gracefully
      // (This test verifies the component doesn't crash)
      expect(result.current.currentStep).toBe('complete');
    });
  });

  describe('State consistency', () => {
    it('maintains consistency between manual annotations and transaction state', () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).currentStep = 'complete';
      });

      // Apply multiple manual annotations
      act(() => {
        result.current.updateManualAnnotation('tx1', null); // Unmatch tx1
        result.current.updateManualAnnotation('tx2', 1); // Match tx2 to year 1
      });

      // Verify manual annotations map is consistent
      expect(result.current.manualAnnotations.get('tx1')).toBe(null);
      expect(result.current.manualAnnotations.get('tx2')).toBe(1);
    });

    it('allows reassigning the same transaction multiple times', () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).currentStep = 'complete';
      });

      // Apply multiple changes to the same transaction
      act(() => {
        result.current.updateManualAnnotation('tx2', 1); // First change
      });
      
      expect(result.current.manualAnnotations.get('tx2')).toBe(1);

      act(() => {
        result.current.updateManualAnnotation('tx2', 2); // Second change
      });

      expect(result.current.manualAnnotations.get('tx2')).toBe(2);

      act(() => {
        result.current.updateManualAnnotation('tx2', null); // Third change
      });

      expect(result.current.manualAnnotations.get('tx2')).toBe(null);
    });
  });

  describe('Reset functionality', () => {
    it('clears manual annotations when resetTracker is called', () => {
      const { result } = renderHook(() => useOnChainStore());

      // Setup initial state and add manual annotations
      act(() => {
        (result.current as any).annotatedTransactions = mockTransactions;
        (result.current as any).expectedGrants = mockExpectedGrants;
        (result.current as any).currentStep = 'complete';
        
        result.current.updateManualAnnotation('tx1', null);
        result.current.updateManualAnnotation('tx2', 1);
      });

      // Verify annotations exist
      expect(result.current.manualAnnotations.size).toBe(2);

      // Reset the tracker
      act(() => {
        result.current.resetTracker();
      });

      // Verify manual annotations are cleared
      expect(result.current.manualAnnotations.size).toBe(0);
      expect(result.current.annotatedTransactions).toEqual([]);
      expect(result.current.expectedGrants).toEqual([]);
    });
  });
});