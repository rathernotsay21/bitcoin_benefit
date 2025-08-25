# React Architecture Analysis & Action Plan

This document outlines the findings of our React architecture analysis and provides a prioritized action plan for optimization.

---

## Zustand State Management

### Critical Optimizations

-   [x] **Fix Debounce Logic Issue:** The current `setTimeout` should be replaced with a proper debouncing function to prevent excessive calculations on rapid input changes.

    ```typescript
    // Create debounced calculate function
    const debouncedCalculate = debounce(() => {
      get().calculateResults();
    }, 300);

    // In updateInputs:
    updateInputs: (newInputs) => {
      set((state) => ({
        inputs: { ...state.inputs, ...newInputs }
      }));
      debouncedCalculate();
    }
    ```

-   [x] **Address Memory Leak in `onChainStore`:** Clear all intervals and timers when the tracker is reset to prevent memory leaks from pending asynchronous operations.

    ```typescript
    // In onChainStore
    resetTracker: () => {
      // Clear any pending operations
      clearAnnotationCache();
      MemoryOptimizer.optimizeMemory();

      // Cancel pending promises to prevent state updates on unmounted components
      abortController?.abort();
    }
    ```

-   [x] **Implement State Synchronization:** Add cross-store communication to ensure critical data, like the Bitcoin price, is consistent across all relevant stores.

    ```typescript
    // Create a shared price sync middleware or utility function
    const syncBitcoinPrice = (price: number) => {
      useCalculatorStore.setState({ currentBitcoinPrice: price });
      useHistoricalCalculatorStore.setState({ currentBitcoinPrice: price });
    };
    ```

---

## Component Architecture

### Issues Found

-   [x] **Add Reset State to ErrorBoundary:** The `ErrorBoundary` component needs a mechanism to reset its state, allowing users to dismiss the error without a full page reload.

    ```typescript
    // Add reset mechanism to ErrorBoundary component
    class ErrorBoundary extends React.Component {
      // ... existing state and methods

      resetError = () => {
        this.setState({ hasError: false, error: null });
      }

      render() {
        if (this.state.hasError) {
          return <ErrorFallback error={this.state.error} reset={this.resetError} />;
        }
        return this.props.children;
      }
    }
    ```

-   [x] **Memoize Chart Components:** Wrap expensive chart components with `React.memo` to prevent unnecessary re-renders when their props have not changed.

    ```typescript
    // Wrap expensive chart computations to avoid re-renders
    const MemoizedVestingChart = React.memo(VestingTimelineChartRecharts,
      (prevProps, nextProps) => {
        // Custom comparison function for deep equality check if needed
        return prevProps.timeline === nextProps.timeline &&
               prevProps.currentBitcoinPrice === nextProps.currentBitcoinPrice;
      }
    );
    ```

---

## Performance Patterns

### Critical Issues

-   [x] **Add `useMemo` for Chart Data:** Expensive data calculations, like processing yearly data for charts, should be wrapped in `useMemo` to ensure they only run when their dependencies change.

    ```typescript
    const yearlyData = useMemo(() =>
      extendedTimeline
        .filter((_, index) => index % 12 === 0)
        .slice(0, 21)
        .map(/* ... */),
      [extendedTimeline] // Add all relevant dependencies
    );
    ```

-   [x] **Use `useCallback` for Event Handlers:** Wrap event handlers passed to child components (especially memoized ones) in `useCallback` to prevent them from being recreated on every render.
    - Wrapped handleSchemeSelect and input onChange handlers in CalculatorPlanClient
    - Wrapped onMouseMove and onMouseLeave in VestingTimelineChartRecharts
    - Wrapped handleYearChange in YearSelector
    - Wrapped showAdvanced toggle in RiskAnalysisCard
    - VestingTrackerFormOptimized already had all handlers properly wrapped

-   [x] **Optimize Recharts Rendering:** Add optimization props to the Recharts components to improve rendering performance, especially on mobile devices.

    ```typescript
    <ResponsiveContainer debounce={100}>
      <ComposedChart
        throttleDelay={50}
        isAnimationActive={!isMobile}
      >
        {/* ...chart contents... */}
      </ComposedChart>
    </ResponsiveContainer>
    ```

---

## Recommended Custom Hooks

To improve code reuse and separation of concerns, create the following custom hooks.

### `useCalculation` Hook

Encapsulates the logic for triggering calculations and accessing results.

```typescript
export function useCalculation() {
  const store = useCalculatorStore();

  // The debounce logic is now encapsulated within the hook
  const calculate = useDebounce(store.calculateResults, 300);

  return {
    results: store.results,
    isCalculating: store.isCalculating,
    calculate
  };
}
```

### `useChartData` Hook

Memoizes the transformation of raw data into a format suitable for charts.

```typescript
export function useChartData(timeline: VestingTimelinePoint[]) {
  return useMemo(() => ({
    yearlyData: processYearlyData(timeline),
    metrics: calculateMetrics(timeline),
    milestones: generateMilestones(timeline)
  }), [timeline]);
}
```

### `useBitcoinPriceSync` Hook

Centralizes the logic for fetching and syncing the Bitcoin price across stores.

```typescript
export function useBitcoinPriceSync() {
  const { price, change24h } = useBitcoinPrice(); // Assumes a hook that fetches price

  useEffect(() => {
    // Sync across all stores whenever the price changes
    syncAllStores(price, change24h);
  }, [price, change24h]);
}
```

---

## Chart Integration

### Optimizations Needed

-   [x] **Implement Virtualization for Large Datasets:** For large tables or lists of data, use a virtualization library like `react-window` to render only the visible rows.
    - Installed react-window and @types/react-window
    - Created VirtualizedAnnualBreakdown component with FixedSizeList
    - Integrated into VestingTimelineChartRecharts for the annual breakdown table
    - Optimized to only virtualize when displaying more than 10 rows
    - Maintains all styling and responsive design from original table

    ```typescript
    import { FixedSizeList } from 'react-window';

    // In your component rendering the data table
    <FixedSizeList
      height={400}
      itemCount={yearlyData.length}
      itemSize={50} // The height of each row
      width={'100%'}
    >
      {Row}
    </FixedSizeList>
    ```

-   [x] **Lazy Load Chart Components:** Use `dynamic` import to lazy-load chart components. This will reduce the initial bundle size and improve page load time, showing a skeleton loader while the component loads.

    ```typescript
    import dynamic from 'next/dynamic';

    const VestingChart = dynamic(
      () => import('./VestingTimelineChartRecharts'),
      {
        ssr: false, // Disable server-side rendering for this client-side component
        loading: () => <ChartSkeleton /> // Show a loading component
      }
    );
    ```

-   [ ] **Consider Canvas Rendering for Performance:** For charts with over 1,000 data points, Recharts (which uses SVG) can become slow. Evaluate a canvas-based library like Chart.js for these specific high-density charts.

---