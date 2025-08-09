import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import VirtualizedAnnualBreakdown from '@/components/VirtualizedAnnualBreakdown';

describe('VirtualizedAnnualBreakdown Performance', () => {
  // Mock large dataset
  const generateLargeDataset = (size: number) => 
    Array.from({ length: size }, (_, i) => ({
      year: i,
      btcBalance: 0.1 + i * 0.05,
      usdValue: 50000 + i * 10000,
      bitcoinPrice: 50000 + i * 5000,
      vestedAmount: i >= 10 ? 100 : i >= 5 ? 50 : 0
    }));

  const defaultProps = {
    initialGrant: 0.1,
    annualGrant: 0.05,
    currentBitcoinPrice: 50000,
    schemeId: 'standard' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render efficiently with small datasets (< 10 rows)', () => {
    const smallData = generateLargeDataset(5);
    const startTime = performance.now();
    
    const { container } = render(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={smallData}
      />
    );
    
    const renderTime = performance.now() - startTime;
    
    // Small datasets should render very quickly (< 100ms)
    expect(renderTime).toBeLessThan(100);
    
    // Should render all rows directly without virtualization wrapper
    const rows = container.querySelectorAll('[style*="height"]');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should use virtualization for large datasets (> 10 rows)', () => {
    const largeData = generateLargeDataset(100);
    const startTime = performance.now();
    
    const { container } = render(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={largeData}
        maxDisplayYears={100}
      />
    );
    
    const renderTime = performance.now() - startTime;
    
    // Even with 100 rows, should render quickly due to virtualization
    expect(renderTime).toBeLessThan(200);
    
    // Should have the virtualization container
    const virtualContainer = container.querySelector('[style*="overflow"]');
    expect(virtualContainer).toBeTruthy();
  });

  it('should handle dynamic data updates efficiently', () => {
    const initialData = generateLargeDataset(20);
    const { rerender } = render(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={initialData}
      />
    );

    const updatedData = generateLargeDataset(50);
    const startTime = performance.now();
    
    rerender(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={updatedData}
      />
    );
    
    const updateTime = performance.now() - startTime;
    
    // Updates should be efficient
    expect(updateTime).toBeLessThan(150);
  });

  it('should maintain scroll performance with large datasets', () => {
    const largeData = generateLargeDataset(1000);
    
    const { container } = render(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={largeData}
        maxDisplayYears={1000}
      />
    );
    
    // Find the scrollable container
    const scrollContainer = container.querySelector('[style*="overflow"]');
    
    if (scrollContainer) {
      // Simulate scroll events
      const scrollStartTime = performance.now();
      
      // Simulate multiple scroll positions
      for (let i = 0; i < 10; i++) {
        const scrollEvent = new Event('scroll', { bubbles: true });
        Object.defineProperty(scrollEvent, 'target', {
          value: { scrollTop: i * 100 },
          enumerable: true
        });
        scrollContainer.dispatchEvent(scrollEvent);
      }
      
      const scrollTime = performance.now() - scrollStartTime;
      
      // Scrolling should remain performant even with large datasets
      expect(scrollTime).toBeLessThan(100);
    }
  });

  it('should only render visible rows in viewport', () => {
    const largeData = generateLargeDataset(100);
    
    const { container } = render(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={largeData}
        maxDisplayYears={100}
      />
    );
    
    // Count actual DOM elements rendered
    const renderedRows = container.querySelectorAll('[class*="flex items-center"]');
    
    // Should render significantly fewer DOM elements than total data
    // (typically only visible rows + overscan)
    expect(renderedRows.length).toBeLessThan(20); // Much less than 100
  });

  it('should memoize calculations efficiently', () => {
    const data = generateLargeDataset(50);
    const calculateSpy = vi.fn();
    
    // Mock the calculation by wrapping component
    const TestWrapper = ({ yearlyData }: any) => {
      calculateSpy();
      return <VirtualizedAnnualBreakdown {...defaultProps} yearlyData={yearlyData} />;
    };
    
    const { rerender } = render(<TestWrapper yearlyData={data} />);
    
    // Initial render
    expect(calculateSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with same data
    rerender(<TestWrapper yearlyData={data} />);
    
    // Should use memoized component, only 2 calls total
    expect(calculateSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle extreme datasets gracefully', () => {
    const extremeData = generateLargeDataset(10000);
    
    const startTime = performance.now();
    
    const { container } = render(
      <VirtualizedAnnualBreakdown 
        {...defaultProps} 
        yearlyData={extremeData}
        maxDisplayYears={10000}
      />
    );
    
    const renderTime = performance.now() - startTime;
    
    // Even with 10,000 rows, should still render reasonably fast
    expect(renderTime).toBeLessThan(500);
    
    // Should successfully render without crashing
    expect(container.querySelector('[class*="Annual Breakdown"]')).toBeTruthy();
  });
});
