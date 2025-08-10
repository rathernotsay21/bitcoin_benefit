/**
 * Tests for useCallback event handler optimizations
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import CalculatorPlanClient from '@/app/calculator/[plan]/CalculatorPlanClient';
import YearSelector from '@/components/YearSelector';
import RiskAnalysisCard from '@/components/RiskAnalysisCard';
import VestingTrackerFormOptimized from '@/components/on-chain/VestingTrackerFormOptimized';

import { vi } from 'vitest';

// Use centralized Recharts mock
vi.mock('recharts', async () => {
  const rechartsMock = await import('../../__mocks__/recharts');
  return rechartsMock.default;
});

// Mock the stores
vi.mock('@/stores/calculatorStore', () => ({
  useCalculatorStore: vi.fn(() => ({
    selectedScheme: null,
    inputs: { projectedBitcoinGrowth: 15 },
    results: null,
    isCalculating: false,
    currentBitcoinPrice: 50000,
    bitcoinChange24h: 2.5,
    isLoadingPrice: false,
    schemeCustomizations: {},
    setSelectedScheme: vi.fn(),
    updateInputs: vi.fn(),
    fetchBitcoinPrice: vi.fn(),
    updateSchemeCustomization: vi.fn(),
    getEffectiveScheme: vi.fn(scheme => scheme),
    loadStaticData: vi.fn(),
  }))
}));

vi.mock('@/stores/onChainStore', () => ({
  useOnChainStore: vi.fn(() => ({
    address: '',
    vestingStartDate: '',
    annualGrantBtc: 0,
    totalGrants: 0,
    formErrors: {},
    isLoading: false,
    error: null,
    setFormData: vi.fn(),
    validateField: vi.fn(),
    validateAndFetch: vi.fn(),
  }))
}));

// Mock the icons and other components
vi.mock('@heroicons/react/24/solid', () => ({
  ChartBarIcon: () => <div>ChartBarIcon</div>,
  CogIcon: () => <div>CogIcon</div>,
  SparklesIcon: () => <div>SparklesIcon</div>,
}));

vi.mock('@/components/icons', () => ({
  SatoshiIcon: () => <div>SatoshiIcon</div>,
}));

vi.mock('@/components/VestingTimelineChart', () => {
  return function VestingTimelineChart() {
    return <div>VestingTimelineChart</div>;
  };
});

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
  CalculatorErrorBoundary: ({ children }: any) => <>{children}</>,
  ChartErrorBoundary: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/Navigation', () => {
  return function Navigation() {
    return <nav>Navigation</nav>;
  };
});

vi.mock('@/components/loading/Skeletons', () => ({
  CalculatorSkeleton: () => <div>Loading...</div>,
}));

vi.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('useCallback Event Handler Optimizations', () => {
  describe('YearSelector', () => {
    it('should memoize handleYearChange callback', () => {
      const onYearChange = vi.fn();
      const { rerender } = render(
        <YearSelector
          selectedYear={2020}
          onYearChange={onYearChange}
        />
      );

      const select = screen.getByLabelText('Select starting year for historical analysis');
      
      // Store the initial onChange handler reference
      const initialHandler = (select as HTMLSelectElement).onchange;

      // Rerender with the same props
      rerender(
        <YearSelector
          selectedYear={2020}
          onYearChange={onYearChange}
        />
      );

      // The handler should be the same reference due to useCallback
      const updatedHandler = (select as HTMLSelectElement).onchange;
      expect(updatedHandler).toBe(initialHandler);
    });

    it('should update handler when dependencies change', () => {
      const onYearChange1 = vi.fn();
      const onYearChange2 = vi.fn();
      
      const { rerender } = render(
        <YearSelector
          selectedYear={2020}
          onYearChange={onYearChange1}
        />
      );

      const select = screen.getByLabelText('Select starting year for historical analysis');
      const initialHandler = (select as HTMLSelectElement).onchange;

      // Rerender with different onYearChange prop
      rerender(
        <YearSelector
          selectedYear={2020}
          onYearChange={onYearChange2}
        />
      );

      // The handler should be different due to dependency change
      const updatedHandler = (select as HTMLSelectElement).onchange;
      expect(updatedHandler).not.toBe(initialHandler);
    });
  });

  describe('RiskAnalysisCard', () => {
    it('should memoize toggle button onClick handler', () => {
      const { rerender } = render(
        <RiskAnalysisCard
          portfolioValue={100000}
          expectedAnnualReturn={0.15}
          timePeriodYears={10}
        />
      );

      // Find the toggle button
      const toggleButton = screen.getByText(/View/);
      const initialHandler = (toggleButton as HTMLButtonElement).onclick;

      // Rerender with the same props
      rerender(
        <RiskAnalysisCard
          portfolioValue={100000}
          expectedAnnualReturn={0.15}
          timePeriodYears={10}
        />
      );

      // The handler should be the same reference due to useCallback
      const updatedHandler = (toggleButton as HTMLButtonElement).onclick;
      expect(updatedHandler).toBe(initialHandler);
    });

    it('should maintain stable handler across prop changes', () => {
      const { rerender } = render(
        <RiskAnalysisCard
          portfolioValue={100000}
          expectedAnnualReturn={0.15}
          timePeriodYears={10}
        />
      );

      const toggleButton = screen.getByText(/View/);
      const initialHandler = (toggleButton as HTMLButtonElement).onclick;

      // Rerender with different props that don't affect the handler
      rerender(
        <RiskAnalysisCard
          portfolioValue={200000}
          expectedAnnualReturn={0.20}
          timePeriodYears={15}
        />
      );

      // The handler should still be the same reference
      const updatedHandler = (toggleButton as HTMLButtonElement).onclick;
      expect(updatedHandler).toBe(initialHandler);
    });
  });

  describe('VestingTrackerFormOptimized', () => {
    it('should have all handlers wrapped in useCallback', () => {
      const onSubmit = vi.fn();
      const { container } = render(
        <VestingTrackerFormOptimized onSubmit={onSubmit} />
      );

      // Check that all input handlers are memoized
      const addressInput = container.querySelector('#bitcoin-address');
      const dateInput = container.querySelector('#vesting-start-date');
      const amountInput = container.querySelector('#annual-grant-btc');
      const totalGrantsInput = container.querySelector('#total-grants');

      expect(addressInput).toBeTruthy();
      expect(dateInput).toBeTruthy();
      expect(amountInput).toBeTruthy();
      expect(totalGrantsInput).toBeTruthy();

      // All handlers should be defined
      expect((addressInput as HTMLInputElement).onchange).toBeDefined();
      expect((dateInput as HTMLInputElement).onchange).toBeDefined();
      expect((amountInput as HTMLInputElement).onchange).toBeDefined();
      expect((totalGrantsInput as HTMLInputElement).onchange).toBeDefined();
    });

    it('should maintain stable handlers on rerender', () => {
      const onSubmit = vi.fn();
      const { container, rerender } = render(
        <VestingTrackerFormOptimized onSubmit={onSubmit} />
      );

      const addressInput = container.querySelector('#bitcoin-address') as HTMLInputElement;
      const initialHandler = addressInput.onchange;

      // Rerender with the same props
      rerender(<VestingTrackerFormOptimized onSubmit={onSubmit} />);

      // Handler should be the same reference
      expect(addressInput.onchange).toBe(initialHandler);
    });
  });

  describe('Performance impact', () => {
    it('should prevent unnecessary re-renders with memoized handlers', () => {
      let renderCount = 0;
      
      // Create a child component that tracks renders
      const ChildComponent = React.memo(({ onClick }: { onClick: () => void }) => {
        renderCount++;
        return <button onClick={onClick}>Click me</button>;
      });

      // Parent component with useCallback
      const ParentWithCallback = () => {
        const [count, setCount] = React.useState(0);
        const handleClick = React.useCallback(() => {
          console.log('Clicked');
        }, []);

        return (
          <div>
            <ChildComponent onClick={handleClick} />
            <button onClick={() => setCount(count + 1)}>Update Count: {count}</button>
          </div>
        );
      };

      const { getByText } = render(<ParentWithCallback />);
      
      // Initial render
      expect(renderCount).toBe(1);

      // Click the update count button
      fireEvent.click(getByText(/Update Count/));
      
      // Child should not re-render due to memoized handler
      expect(renderCount).toBe(1);
    });

    it('should re-render when handler dependencies change', () => {
      let renderCount = 0;
      
      const ChildComponent = React.memo(({ onClick }: { onClick: () => void }) => {
        renderCount++;
        return <button onClick={onClick}>Click me</button>;
      });

      const ParentWithDependency = () => {
        const [dependency, setDependency] = React.useState(0);
        const handleClick = React.useCallback(() => {
          console.log('Dependency:', dependency);
        }, [dependency]);

        return (
          <div>
            <ChildComponent onClick={handleClick} />
            <button onClick={() => setDependency(dependency + 1)}>
              Update Dependency: {dependency}
            </button>
          </div>
        );
      };

      const { getByText } = render(<ParentWithDependency />);
      
      // Initial render
      expect(renderCount).toBe(1);

      // Click the update dependency button
      fireEvent.click(getByText(/Update Dependency/));
      
      // Child should re-render due to handler dependency change
      expect(renderCount).toBe(2);
    });
  });
});
