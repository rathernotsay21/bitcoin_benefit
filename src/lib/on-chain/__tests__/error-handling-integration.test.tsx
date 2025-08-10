/**
 * 
 * Integration tests for comprehensive on-chain error handling and recovery
 * Tests complete error flow from user input to error resolution
 * 
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, type MockedFunction } from 'vitest';
import { useOnChainStore } from '@/stores/onChainStore';
import OnChainTrackerPage from '@/app/track/page';
import { MempoolAPIError } from '@/lib/on-chain/mempool-api';
import { OnChainTrackingError } from '@/lib/on-chain/error-handler';

// Mock the store
vi.mock('@/stores/onChainStore');
const mockUseOnChainStore = useOnChainStore as MockedFunction<typeof useOnChainStore>;

// Mock Navigation component
vi.mock('@/components/Navigation', () => ({
  default: function MockNavigation() {
    return <div data-testid="navigation">Navigation</div>;
  }
}));

// Mock the icon components
vi.mock('@heroicons/react/24/outline', () => ({
  ShieldCheckIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="shield-icon" {...props}>
      <path d="shield" />
    </svg>
  ),
  InformationCircleIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="info-icon" {...props}>
      <path d="info" />
    </svg>
  ),
  ChartBarIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="chart-icon" {...props}>
      <path d="chart" />
    </svg>
  ),
  ClockIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="clock-icon" {...props}>
      <path d="clock" />
    </svg>
  ),
  ExclamationTriangleIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="warning-icon" {...props}>
      <path d="warning" />
    </svg>
  ),
  MagnifyingGlassIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="magnifying-glass-icon" {...props}>
      <path d="magnifying-glass" />
    </svg>
  ),
  CalculatorIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="calculator-icon" {...props}>
      <path d="calculator" />
    </svg>
  ),
  CurrencyDollarIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="currency-dollar-icon" {...props}>
      <path d="currency-dollar" />
    </svg>
  ),
  CheckIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="check-icon" {...props}>
      <path d="check" />
    </svg>
  ),
  DocumentMagnifyingGlassIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="document-magnifying-glass-icon" {...props}>
      <path d="document-magnifying-glass" />
    </svg>
  ),
  PencilIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="pencil-icon" {...props}>
      <path d="pencil" />
    </svg>
  ),
  BanknotesIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="banknotes-icon" {...props}>
      <path d="banknotes" />
    </svg>
  ),
  LockClosedIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="lock-closed-icon" {...props}>
      <path d="lock-closed" />
    </svg>
  ),
  BoltIcon: ({ className, ...props }: any) => (
    <svg className={className} data-testid="bolt-icon" {...props}>
      <path d="bolt" />
    </svg>
  )
}));

// Mock the on-chain components - using optimized versions that match current implementation
vi.mock('@/components/on-chain/VestingTrackerFormOptimized', () => ({
  default: function MockVestingTrackerFormOptimized({ onSubmit }: any) {
    return (
      <div data-testid="vesting-tracker-form">
        <button
          data-testid="submit-form"
          onClick={() => onSubmit({
            address: 'test-address',
            vestingStartDate: '2020-01-01',
            annualGrantBtc: 1.0,
            totalGrants: 5
          })}
        >
          Submit Form
        </button>
      </div>
    );
  }
}));

vi.mock('@/components/on-chain/VestingTrackerResultsOptimized', () => ({
  default: function MockVestingTrackerResultsOptimized({ 
    transactions, 
    error, 
    onRetry, 
    partialDataAvailable, 
    onContinueWithPartialData 
  }: any) {
    if (error) {
      return (
        <div data-testid="results-error">
          <p>{error}</p>
          <button data-testid="retry-results" onClick={onRetry}>
            Retry Results
          </button>
        </div>
      );
    }

    if (partialDataAvailable) {
      return (
        <div data-testid="partial-data-results">
          <p>Partial data available</p>
          <button data-testid="continue-partial" onClick={onContinueWithPartialData}>
            Continue with Partial Data
          </button>
        </div>
      );
    }

    return (
      <div data-testid="transaction-results">
        <p>Transactions: {transactions.length}</p>
      </div>
    );
  }
}));

vi.mock('@/components/on-chain/OnChainTimelineVisualizer', () => ({
  default: function MockOnChainTimelineVisualizer() {
    return <div data-testid="timeline-visualizer">Timeline Chart</div>;
  }
}));

vi.mock('@/components/on-chain/PerformanceMonitoringDashboard', () => ({
  default: function MockPerformanceMonitoringDashboard() {
    return <div data-testid="performance-dashboard">Performance Dashboard</div>;
  }
}));

vi.mock('@/components/on-chain/OnChainErrorBoundaries', () => ({
  OnChainErrorBoundary: ({ children, onRetry }: any) => (
    <div data-testid="error-boundary">
      {children}
      {onRetry && <button data-testid="error-boundary-retry" onClick={onRetry}>Retry</button>}
    </div>
  ),
  TransactionFetchErrorBoundary: ({ children }: any) => (
    <div data-testid="transaction-error-boundary">{children}</div>
  ),
  PriceFetchErrorBoundary: ({ children }: any) => (
    <div data-testid="price-error-boundary">{children}</div>
  ),
  TimelineErrorBoundary: ({ children }: any) => (
    <div data-testid="timeline-error-boundary">{children}</div>
  )
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

describe('OnChain Error Handling Integration', () => {
  // Default mock store state - updated to match current store interface
  const defaultMockState = {
    address: '',
    vestingStartDate: '',
    annualGrantBtc: 0,
    totalGrants: 5,
    annotatedTransactions: [],
    expectedGrants: [],
    manualAnnotations: new Map(),
    isLoading: false,
    error: null,
    currentStep: 'idle' as const,
    formErrors: {},
    partialDataAvailable: false,
    lastError: null,
    retryCount: 0,
    setFormData: vi.fn(),
    validateAndFetch: vi.fn(),
    updateManualAnnotation: vi.fn(),
    resetTracker: vi.fn(),
    retryOperation: vi.fn(),
    continueWithPartialData: vi.fn(),
    clearError: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOnChainStore.mockReturnValue(defaultMockState);
  });

  describe('Error Display and Recovery', () => {
    it('should display network error with appropriate recovery options', async () => {
      const mockState = {
        ...defaultMockState,
        error: 'Network connection failed. Please check your connection and try again.',
        isLoading: false,
        retryCount: 1
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed. Please check your connection and try again.')).toBeInTheDocument();
      expect(screen.getByText('Retry attempt: 1')).toBeInTheDocument();

      // Should have Try Again button
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      // Should have Check Mempool.space button for network errors
      expect(screen.getByRole('button', { name: /check mempool\.space service status/i })).toBeInTheDocument();

      // Should have Reset button
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should display validation error without external service buttons', async () => {
      const mockState = {
        ...defaultMockState,
        error: 'Invalid Bitcoin address format',
        isLoading: false
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Invalid Input')).toBeInTheDocument();
      expect(screen.getByText('Invalid Bitcoin address format')).toBeInTheDocument();

      // Should have Try Again button
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      // Should NOT have Check Mempool.space button for validation errors
      expect(screen.queryByRole('button', { name: /check mempool\.space service status/i })).not.toBeInTheDocument();

      // Should have Reset button
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should handle retry operation with error clearing', async () => {
      const mockClearError = vi.fn();
      const mockRetryOperation = vi.fn();

      const mockState = {
        ...defaultMockState,
        error: 'Network error',
        clearError: mockClearError,
        retryOperation: mockRetryOperation
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
      expect(mockRetryOperation).toHaveBeenCalledTimes(1);
    });

    it('should open external link when checking Mempool.space', async () => {
      const mockState = {
        ...defaultMockState,
        error: 'Network timeout occurred'
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      const mempoolButton = screen.getByRole('button', { name: /check mempool\.space service status/i });
      fireEvent.click(mempoolButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://mempool.space', '_blank');
    });

    it('should handle reset tracker operation', async () => {
      const mockResetTracker = vi.fn();

      const mockState = {
        ...defaultMockState,
        error: 'Some error',
        resetTracker: mockResetTracker
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      expect(mockResetTracker).toHaveBeenCalledTimes(1);
    });
  });

  describe('Partial Data Handling', () => {
    it('should display partial data notice with continuation options', async () => {
      const mockState = {
        ...defaultMockState,
        partialDataAvailable: true,
        annotatedTransactions: [{
          txid: 'test-tx',
          grantYear: 1,
          type: 'Annual Grant',
          amountBTC: 1.0,
          date: '2020-01-01',
          isManuallyAnnotated: false,
          valueAtTimeOfTx: null
        }]
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Partial Data Available')).toBeInTheDocument();
      expect(screen.getByText(/Transaction data was retrieved successfully, but some historical price data is unavailable/)).toBeInTheDocument();

      // Should have both continuation options
      expect(screen.getAllByRole('button', { name: /continue with partial data/i })).toHaveLength(2);
      expect(screen.getByRole('button', { name: /retry price fetch/i })).toBeInTheDocument();
    });

    it('should handle continue with partial data', async () => {
      const mockContinueWithPartialData = vi.fn();

      const mockState = {
        ...defaultMockState,
        partialDataAvailable: true,
        continueWithPartialData: mockContinueWithPartialData
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      const continueButtons = screen.getAllByRole('button', { name: /continue with partial data/i });
      fireEvent.click(continueButtons[0]);

      expect(mockContinueWithPartialData).toHaveBeenCalledTimes(1);
    });

    it('should handle retry price fetch from partial data state', async () => {
      const mockClearError = vi.fn();
      const mockRetryOperation = vi.fn();

      const mockState = {
        ...defaultMockState,
        partialDataAvailable: true,
        clearError: mockClearError,
        retryOperation: mockRetryOperation
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      const retryButton = screen.getByRole('button', { name: /retry price fetch/i });
      fireEvent.click(retryButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
      expect(mockRetryOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States and Progress', () => {
    it('should display loading steps during processing', async () => {
      const mockState = {
        ...defaultMockState,
        isLoading: true,
        currentStep: 'fetching' as const
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
      expect(screen.getByText('Fetching Transactions')).toBeInTheDocument();
      expect(screen.getByText('Fetching transaction data from blockchain...')).toBeInTheDocument();
    });

    it('should show different loading steps based on current step', async () => {
      // Test annotation step
      let mockState = {
        ...defaultMockState,
        isLoading: true,
        currentStep: 'annotating' as const
      };
      const { rerender } = render(<OnChainTrackerPage />);
      mockUseOnChainStore.mockReturnValue(mockState);
      rerender(<OnChainTrackerPage />);

      expect(screen.getByText('Analyzing & Matching')).toBeInTheDocument();
      expect(screen.getByText('Analyzing transactions and matching to vesting schedule...')).toBeInTheDocument();

      // Test pricing step
      mockState = {
        ...defaultMockState,
        isLoading: true,
        currentStep: 'pricing' as const
      };
      mockUseOnChainStore.mockReturnValue(mockState);
      rerender(<OnChainTrackerPage />);

      expect(screen.getByText('Retrieving Values')).toBeInTheDocument();
      expect(screen.getByText('Retrieving historical benefit values...')).toBeInTheDocument();
    });
  });

  describe('Results Display and Error Boundaries', () => {
    it('should display transaction results when available', async () => {
      const mockState = {
        ...defaultMockState,
        annotatedTransactions: [
          {
            txid: 'test-tx-1',
            grantYear: 1,
            type: 'Annual Grant',
            amountBTC: 1.0,
            date: '2020-01-01',
            isManuallyAnnotated: false,
            valueAtTimeOfTx: 50000
          }
        ],
        expectedGrants: [
          {
            grantYear: 1,
            expectedDate: '2020-01-01',
            expectedAmountBTC: 1.0,
            actualAmountBTC: 1.0,
            status: 'fulfilled' as const
          }
        ],
        currentStep: 'complete' as const
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByTestId('transaction-results')).toBeInTheDocument();
      expect(screen.getByText('Transactions: 1')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-visualizer')).toBeInTheDocument();
    });

    it('should display results error with retry functionality', async () => {
      const mockRetryOperation = vi.fn();
      const mockClearError = vi.fn();

      const mockState = {
        ...defaultMockState,
        annotatedTransactions: [],
        error: 'Failed to load transaction data',
        retryOperation: mockRetryOperation,
        clearError: mockClearError
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load transaction data')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
      expect(mockRetryOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complete Error Recovery Flow', () => {
    it('should handle complete error-to-success flow', async () => {
      const mockSetFormData = vi.fn();
      const mockValidateAndFetch = vi.fn();
      const mockClearError = vi.fn();
      const mockRetryOperation = vi.fn();

      // Start with error state
      let mockState = {
        ...defaultMockState,
        error: 'Network connection failed',
        setFormData: mockSetFormData,
        validateAndFetch: mockValidateAndFetch,
        clearError: mockClearError,
        retryOperation: mockRetryOperation
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      const { rerender } = render(<OnChainTrackerPage />);

      // Should show error state
      expect(screen.getByText('Connection Error')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
      expect(mockRetryOperation).toHaveBeenCalledTimes(1);

      // Simulate transition to loading state
      mockState = {
        ...defaultMockState,
        isLoading: true,
        currentStep: 'fetching' as const,
        error: null,
        setFormData: mockSetFormData,
        validateAndFetch: mockValidateAndFetch,
        clearError: mockClearError,
        retryOperation: mockRetryOperation
      };
      mockUseOnChainStore.mockReturnValue(mockState);
      rerender(<OnChainTrackerPage />);

      // Should show loading state
      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
      expect(screen.getByText('Fetching Transactions')).toBeInTheDocument();

      // Simulate successful completion
      mockState = {
        ...defaultMockState,
        isLoading: false,
        currentStep: 'complete' as const,
        error: null,
        annotatedTransactions: [
          {
            txid: 'test-tx-1',
            grantYear: 1,
            type: 'Annual Grant',
            amountBTC: 1.0,
            date: '2020-01-01',
            isManuallyAnnotated: false,
            valueAtTimeOfTx: 50000
          }
        ],
        expectedGrants: [
          {
            grantYear: 1,
            expectedDate: '2020-01-01',
            expectedAmountBTC: 1.0,
            actualAmountBTC: 1.0,
            status: 'fulfilled' as const
          }
        ],
        setFormData: mockSetFormData,
        validateAndFetch: mockValidateAndFetch,
        clearError: mockClearError,
        retryOperation: mockRetryOperation
      };
      mockUseOnChainStore.mockReturnValue(mockState);
      rerender(<OnChainTrackerPage />);

      // Should show successful results
      expect(screen.getByTestId('transaction-results')).toBeInTheDocument();
      expect(screen.getByText('Transactions: 1')).toBeInTheDocument();
      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
    });

    it('should handle form submission with error handling', async () => {
      const mockSetFormData = vi.fn();
      const mockValidateAndFetch = vi.fn();

      const mockState = {
        ...defaultMockState,
        setFormData: mockSetFormData,
        validateAndFetch: mockValidateAndFetch
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      // Submit form
      const submitButton = screen.getByTestId('submit-form');
      fireEvent.click(submitButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        address: 'test-address',
        vestingStartDate: '2020-01-01',
        annualGrantBtc: 1.0,
        totalGrants: 5
      });
      expect(mockValidateAndFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple error types in sequence', async () => {
      const mockClearError = vi.fn();
      const mockRetryOperation = vi.fn();
      const mockContinueWithPartialData = vi.fn();

      // Start with network error
      let mockState = {
        ...defaultMockState,
        error: 'Network timeout',
        clearError: mockClearError,
        retryOperation: mockRetryOperation,
        continueWithPartialData: mockContinueWithPartialData
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      const { rerender } = render(<OnChainTrackerPage />);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();

      // Transition to partial data state
      mockState = {
        ...defaultMockState,
        error: null,
        partialDataAvailable: true,
        annotatedTransactions: [{
          txid: 'test-tx',
          grantYear: 1,
          type: 'Annual Grant',
          amountBTC: 1.0,
          date: '2020-01-01',
          isManuallyAnnotated: false,
          valueAtTimeOfTx: null
        }],
        clearError: mockClearError,
        retryOperation: mockRetryOperation,
        continueWithPartialData: mockContinueWithPartialData
      };
      mockUseOnChainStore.mockReturnValue(mockState);
      rerender(<OnChainTrackerPage />);

      expect(screen.getByText('Partial Data Available')).toBeInTheDocument();

      // Continue with partial data - use the first button (from the page component)
      const continueButtons = screen.getAllByRole('button', { name: /continue with partial data/i });
      fireEvent.click(continueButtons[0]);

      expect(mockContinueWithPartialData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Feature Overview and Initial State', () => {
    it('should display feature overview when no results are available', async () => {
      const mockState = {
        ...defaultMockState,
        currentStep: 'idle' as const,
        annotatedTransactions: []
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Verify Your Transparent Vesting History')).toBeInTheDocument();
      expect(screen.getByText('Automatic Matching')).toBeInTheDocument();
      expect(screen.getByText('Manual Overrides')).toBeInTheDocument();
      expect(screen.getByText('Historical Values')).toBeInTheDocument();
      expect(screen.getByText('Visual Timeline')).toBeInTheDocument();
      expect(screen.getByText('Privacy Focused')).toBeInTheDocument();
      expect(screen.getByText('Real-time Updates')).toBeInTheDocument();
    });

    it('should display privacy disclaimer with expandable details', async () => {
      render(<OnChainTrackerPage />);

      expect(screen.getByText('Privacy & Data Usage Notice')).toBeInTheDocument();
      expect(screen.getByText('Data Transmission')).toBeInTheDocument();
      expect(screen.getByText('No Data Storage')).toBeInTheDocument();

      // Should have expandable details
      const expandButton = screen.getByRole('button', { name: /read full privacy details/i });
      fireEvent.click(expandButton);

      expect(screen.getByText('Recommended Privacy Practices')).toBeInTheDocument();
      expect(screen.getByText('External API Usage')).toBeInTheDocument();
      expect(screen.getByText('Session-Only Processing')).toBeInTheDocument();

      // Should be able to collapse
      const collapseButton = screen.getByRole('button', { name: /show less/i });
      fireEvent.click(collapseButton);

      expect(screen.queryByText('Recommended Privacy Practices')).not.toBeInTheDocument();
    });
  });
});