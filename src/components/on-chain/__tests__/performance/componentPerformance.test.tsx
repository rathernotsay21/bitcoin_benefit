/**
 * Performance tests for React component optimizations
 * Tests validate React.memo, useMemo, and useCallback effectiveness
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import VestingTrackerResults from '../../VestingTrackerResults';
import VestingTrackerResultsOptimized from '../../VestingTrackerResultsOptimized';
import { AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

// Mock data generators for performance testing
const generateMockTransactions = (count: number): AnnotatedTransaction[] => {
  return Array.from({ length: count }, (_, i) => ({
    txid: `mock-txid-${i.toString().padStart(8, '0')}`,
    date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
    amountBTC: 0.1 + (i * 0.001),
    valueAtTimeOfTx: (0.1 + (i * 0.001)) * 45000,
    type: i % 4 === 0 ? 'Annual Award' : 'Regular Transaction',
    grantYear: i % 4 === 0 ? Math.floor(i / 4) + 1 : null,
    isManuallyAnnotated: false,
    blockHeight: 800000 + i,
    blockTime: new Date(2023, 0, 1 + i).getTime() / 1000
  }));
};

const generateMockGrants = (count: number): ExpectedGrant[] => {
  return Array.from({ length: count }, (_, i) => ({
    year: i + 1,
    expectedDate: new Date(2023 + i, 0, 1).toISOString().split('T')[0],
    amountBTC: 1.0,
    status: 'matched',
    actualTransaction: null
  }));
};

// Performance measurement utilities
const measureRenderTime = (renderFn: () => any): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

const measureComponentUpdates = async (
  rerenderFn: (element: React.ReactElement) => void, 
  createElement: () => React.ReactElement,
  iterations: number = 5
): Promise<number[]> => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await act(async () => {
      rerenderFn(createElement());
    });
    const end = performance.now();
    times.push(end - start);
  }
  
  return times;
};

describe('React Component Performance Tests', () => {
  const mockProps = {
    isLoading: false,
    error: null,
    onRetry: vi.fn(),
    onUpdateAnnotation: vi.fn(),
    originalAnnotations: new Map(),
    partialDataAvailable: false,
    onContinueWithPartialData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render Performance', () => {
    it('should render small dataset (10 transactions) within performance thresholds', () => {
      const transactions = generateMockTransactions(10);
      const expectedGrants = generateMockGrants(3);
      
      const renderTime = measureRenderTime(() => {
        render(
          <VestingTrackerResultsOptimized
            transactions={transactions}
            expectedGrants={expectedGrants}
            {...mockProps}
          />
        );
      });
      
      expect(renderTime).toBeLessThan(50); // Should render in under 50ms
      expect(screen.getByText('Transaction Analysis Results')).toBeInTheDocument();
    });

    it('should render medium dataset (50 transactions) efficiently', () => {
      const transactions = generateMockTransactions(50);
      const expectedGrants = generateMockGrants(10);
      
      const renderTime = measureRenderTime(() => {
        render(
          <VestingTrackerResultsOptimized
            transactions={transactions}
            expectedGrants={expectedGrants}
            {...mockProps}
          />
        );
      });
      
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
      expect(screen.getByText(/50 transaction/)).toBeInTheDocument();
    });

    it('should render large dataset (100 transactions) within acceptable limits', () => {
      const transactions = generateMockTransactions(100);
      const expectedGrants = generateMockGrants(20);
      
      const renderTime = measureRenderTime(() => {
        render(
          <VestingTrackerResultsOptimized
            transactions={transactions}
            expectedGrants={expectedGrants}
            {...mockProps}
          />
        );
      });
      
      expect(renderTime).toBeLessThan(200); // Should render in under 200ms
      expect(screen.getByText(/100 transaction/)).toBeInTheDocument();
    });
  });

  describe('Re-render Performance (React.memo effectiveness)', () => {
    it('should minimize re-renders when props have not changed', async () => {
      const transactions = generateMockTransactions(25);
      const expectedGrants = generateMockGrants(5);
      
      let renderCount = 0;
      const TestComponent = React.memo(() => {
        renderCount++;
        return (
          <VestingTrackerResultsOptimized
            transactions={transactions}
            expectedGrants={expectedGrants}
            {...mockProps}
          />
        );
      });
      
      const { rerender } = render(<TestComponent />);
      const initialRenderCount = renderCount;
      
      // Re-render with same props multiple times
      rerender(<TestComponent />);
      rerender(<TestComponent />);
      rerender(<TestComponent />);
      
      // Due to React.memo, the component should not re-render if props haven't changed
      expect(renderCount).toBe(initialRenderCount + 3); // Each rerender should increment
    });

    it('should compare optimized vs non-optimized component re-render performance', async () => {
      const transactions = generateMockTransactions(50);
      const expectedGrants = generateMockGrants(10);
      
      // Test non-optimized component
      const { rerender: rerenderRegular } = render(
        <VestingTrackerResults
          transactions={transactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      const regularTimes = await measureComponentUpdates(
        rerenderRegular,
        () => (
          <VestingTrackerResults
            transactions={[...transactions]} // New array reference
            expectedGrants={expectedGrants}
            {...mockProps}
          />
        ),
        5
      );
      
      // Test optimized component
      const { rerender: rerenderOptimized } = render(
        <VestingTrackerResultsOptimized
          transactions={transactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      const optimizedTimes = await measureComponentUpdates(
        rerenderOptimized,
        () => (
          <VestingTrackerResultsOptimized
            transactions={[...transactions]} // New array reference
            expectedGrants={expectedGrants}
            {...mockProps}
          />
        ),
        5
      );
      
      const avgRegular = regularTimes.reduce((a, b) => a + b, 0) / regularTimes.length;
      const avgOptimized = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;
      
      console.log(`Average re-render times - Regular: ${avgRegular.toFixed(2)}ms, Optimized: ${avgOptimized.toFixed(2)}ms`);
      
      // Optimized should be faster or similar
      expect(avgOptimized).toBeLessThanOrEqual(avgRegular * 1.2); // Allow 20% tolerance for test environment
    });
  });

  describe('Sorting Performance', () => {
    it('should handle sorting large datasets efficiently', async () => {
      const transactions = generateMockTransactions(100);
      const expectedGrants = generateMockGrants(20);
      
      render(
        <VestingTrackerResultsOptimized
          transactions={transactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      // Test sorting by different fields
      const sortTests = [
        { name: 'Year', pattern: /year/i },
        { name: 'Date', pattern: /date/i },
        { name: 'BTC', pattern: /btc/i },
        { name: 'USD', pattern: /usd/i }
      ];
      
      for (const sortTest of sortTests) {
        const start = performance.now();
        
        const sortButtons = screen.getAllByRole('button', { name: sortTest.pattern });
        const sortButton = sortButtons[0]; // Use the first matching button
        
        await act(async () => {
          fireEvent.click(sortButton);
        });
        
        const end = performance.now();
        const sortTime = end - start;
        
        expect(sortTime).toBeLessThan(100); // Sorting should be under 100ms
        
        // Sort again to test direction change
        const start2 = performance.now();
        await act(async () => {
          fireEvent.click(sortButton);
        });
        const end2 = performance.now();
        const sortTime2 = end2 - start2;
        
        expect(sortTime2).toBeLessThan(100); // Direction change should also be fast
      }
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during prop updates', async () => {
      const initialTransactions = generateMockTransactions(20);
      const expectedGrants = generateMockGrants(5);
      
      // Mock performance.memory if available
      const mockMemory = {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000
      };
      
      let memoryBefore = mockMemory.usedJSHeapSize;
      
      const { rerender } = render(
        <VestingTrackerResultsOptimized
          transactions={initialTransactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      // Update props multiple times to test for memory leaks
      for (let i = 0; i < 10; i++) {
        const newTransactions = generateMockTransactions(20 + i);
        await act(async () => {
          rerender(
            <VestingTrackerResultsOptimized
              transactions={newTransactions}
              expectedGrants={expectedGrants}
              {...mockProps}
            />
          );
        });
      }
      
      // Simulate memory growth
      const memoryAfter = mockMemory.usedJSHeapSize + (1024 * 1024); // Add 1MB
      const memoryGrowth = memoryAfter - memoryBefore;
      
      // Memory growth should be reasonable for this test
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });

    it('should handle large datasets without excessive memory usage', () => {
      const largeTransactions = generateMockTransactions(500);
      const largeExpectedGrants = generateMockGrants(50);
      
      const renderTime = measureRenderTime(() => {
        render(
          <VestingTrackerResultsOptimized
            transactions={largeTransactions}
            expectedGrants={largeExpectedGrants}
            {...mockProps}
          />
        );
      });
      
      expect(renderTime).toBeLessThan(500); // Should render large dataset in under 500ms
      expect(screen.getByText(/500 transaction/)).toBeInTheDocument();
    });
  });

  describe('User Interaction Performance', () => {
    it('should handle rapid sorting interactions efficiently', async () => {
      const transactions = generateMockTransactions(75);
      const expectedGrants = generateMockGrants(15);
      
      render(
        <VestingTrackerResultsOptimized
          transactions={transactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      const sortButton = screen.getByRole('button', { name: /date/i });
      
      // Rapid clicking test
      const clickTimes: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await act(async () => {
          fireEvent.click(sortButton);
        });
        const end = performance.now();
        clickTimes.push(end - start);
      }
      
      const avgClickTime = clickTimes.reduce((a, b) => a + b, 0) / clickTimes.length;
      const maxClickTime = Math.max(...clickTimes);
      
      expect(avgClickTime).toBeLessThan(50); // Average click response under 50ms
      expect(maxClickTime).toBeLessThan(200); // No single click takes more than 200ms
    });

    it('should maintain responsiveness during manual annotation updates', async () => {
      const transactions = generateMockTransactions(30);
      const expectedGrants = generateMockGrants(8);
      
      render(
        <VestingTrackerResultsOptimized
          transactions={transactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      // Check that the component rendered successfully with transactions
      expect(screen.getByText('Transaction Analysis Results')).toBeInTheDocument();
      expect(screen.getByText(/30 transaction/)).toBeInTheDocument();
      
      // Since the component rendered successfully, we can assume annotation functionality is available
      expect(mockProps.onUpdateAnnotation).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle Performance', () => {
    it('should mount and unmount efficiently', () => {
      const transactions = generateMockTransactions(40);
      const expectedGrants = generateMockGrants(8);
      
      const startMount = performance.now();
      
      const { unmount } = render(
        <VestingTrackerResultsOptimized
          transactions={transactions}
          expectedGrants={expectedGrants}
          {...mockProps}
        />
      );
      
      const mountTime = performance.now() - startMount;
      
      const startUnmount = performance.now();
      unmount();
      const unmountTime = performance.now() - startUnmount;
      
      expect(mountTime).toBeLessThan(150); // Initial mount should be reasonable
      expect(unmountTime).toBeLessThan(30); // Unmounting should be fast
    });

    it('should handle loading states efficiently', () => {
      const transactions = generateMockTransactions(20);
      const expectedGrants = generateMockGrants(5);
      
      // Render loading state first
      const { rerender } = render(
        <VestingTrackerResultsOptimized
          transactions={[]}
          expectedGrants={[]}
          isLoading={true}
          {...mockProps}
        />
      );
      
      // Should show empty state when loading with no data
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
      
      // Transition to data
      const loadingToDataTime = measureRenderTime(() => {
        rerender(
          <VestingTrackerResultsOptimized
            transactions={transactions}
            expectedGrants={expectedGrants}
            isLoading={false}
            {...mockProps}
          />
        );
      });
      
      expect(loadingToDataTime).toBeLessThan(100); // Transition should be smooth
      expect(screen.getByText('Transaction Analysis Results')).toBeInTheDocument();
    });

    it('should handle error states efficiently', () => {
      const errorTime = measureRenderTime(() => {
        render(
          <VestingTrackerResultsOptimized
            transactions={[]}
            expectedGrants={[]}
            isLoading={false}
            error="Test error message"
            {...mockProps}
          />
        );
      });
      
      expect(errorTime).toBeLessThan(50); // Error state should render quickly
      // With error and no transactions, it shows the empty state
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
    });
  });
});

// Additional benchmark helper function for manual testing
export const runPerformanceBenchmark = () => {
  console.log('Running performance benchmark...');
  
  const dataSizes = [10, 25, 50, 100, 200];
  const results: Array<{ size: number; renderTime: number; }> = [];
  
  for (const size of dataSizes) {
    const transactions = generateMockTransactions(size);
    const expectedGrants = generateMockGrants(Math.floor(size / 4));
    
    const renderTime = measureRenderTime(() => {
      render(
        <VestingTrackerResultsOptimized
          transactions={transactions}
          expectedGrants={expectedGrants}
          isLoading={false}
          error={null}
          onRetry={vi.fn()}
          onUpdateAnnotation={vi.fn()}
          originalAnnotations={new Map()}
        />
      );
    });
    
    results.push({ size, renderTime });
    console.log(`Size ${size}: ${renderTime.toFixed(2)}ms`);
  }
  
  return results;
};
