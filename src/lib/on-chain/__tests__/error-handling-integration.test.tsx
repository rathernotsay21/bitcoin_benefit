/**
 * 
 * Integration tests for comprehensive on-chain error handling and recovery
 * Tests complete error flow from user input to error resolution
 * 
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useOnChainStore } from '@/stores/onChainStore';
import OnChainTrackerPage from '@/app/track/page';
import { MempoolAPIError } from '@/lib/on-chain/mempool-api';
import { OnChainTrackingError } from '@/lib/on-chain/error-handler';

// Mock the store
jest.mock('@/stores/onChainStore');
const mockUseOnChainStore = useOnChainStore as jest.MockedFunction<typeof useOnChainStore>;

// Mock Navigation component
jest.mock('@/components/Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation</div>;
  };
});

// Mock the icon components
jest.mock('@heroicons/react/24/outline', () => ({
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
  )
}));

// Mock the on-chain components
jest.mock('@/components/on-chain/VestingTrackerForm', () => {
  return function MockVestingTrackerForm({ onSubmit }: any) {
    return (
      <div data-testid="vesting-tracker-form">
        <button
          data-testid="submit-form"
          onClick={() => onSubmit({
            address: 'test-address',
            vestingStartDate: '2020-01-01',
            annualGrantBtc: 1.0
          })}
        >
          Submit Form
        </button>
      </div>
    );
  };
});

jest.mock('@/components/on-chain/VestingTrackerResults', () => {
  return function MockVestingTrackerResults({ 
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
  };
});

jest.mock('@/components/on-chain/OnChainTimelineVisualizer', () => {
  return function MockOnChainTimelineVisualizer() {
    return <div data-testid="timeline-visualizer">Timeline Chart</div>;
  };
});

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

describe('OnChain Error Handling Integration', () => {
  // Default mock store state
  const defaultMockState = {
    address: '',
    vestingStartDate: '',
    annualGrantBtc: 0,
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
    setFormData: jest.fn(),
    validateAndFetch: jest.fn(),
    updateManualAnnotation: jest.fn(),
    resetTracker: jest.fn(),
    retryOperation: jest.fn(),
    continueWithPartialData: jest.fn(),
    clearError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(screen.getByText(/Network connection failed/)).toBeInTheDocument();
      expect(screen.getByText('Retry attempt: 1')).toBeInTheDocument();

      // Should have Try Again button
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      // Should have Check Mempool.space button for network errors
      expect(screen.getByRole('button', { name: /check mempool\\.space/i })).toBeInTheDocument();

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
      expect(screen.queryByRole('button', { name: /check mempool\\.space/i })).not.toBeInTheDocument();

      // Should have Reset button
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should handle retry operation with error clearing', async () => {
      const mockClearError = jest.fn();
      const mockRetryOperation = jest.fn();

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

      const mempoolButton = screen.getByRole('button', { name: /check mempool\\.space/i });
      fireEvent.click(mempoolButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://mempool.space', '_blank');
    });

    it('should handle reset tracker operation', async () => {
      const mockResetTracker = jest.fn();

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
      expect(screen.getByText(/transaction data was retrieved successfully/)).toBeInTheDocument();

      // Should have both continuation options
      expect(screen.getByRole('button', { name: /continue with partial data/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry price fetch/i })).toBeInTheDocument();
    });

    it('should handle continue with partial data', async () => {
      const mockContinueWithPartialData = jest.fn();

      const mockState = {
        ...defaultMockState,
        partialDataAvailable: true,
        continueWithPartialData: mockContinueWithPartialData
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      const continueButton = screen.getByRole('button', { name: /continue with partial data/i });
      fireEvent.click(continueButton);

      expect(mockContinueWithPartialData).toHaveBeenCalledTimes(1);
    });

    it('should handle retry price fetch from partial data state', async () => {
      const mockClearError = jest.fn();
      const mockRetryOperation = jest.fn();

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

      expect(screen.getByText('Retrieving Prices')).toBeInTheDocument();
      expect(screen.getByText('Retrieving historical Bitcoin prices...')).toBeInTheDocument();
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
      const mockRetryOperation = jest.fn();
      const mockClearError = jest.fn();

      const mockState = {
        ...defaultMockState,
        annotatedTransactions: [],
        error: 'Failed to load transaction data',
        retryOperation: mockRetryOperation,
        clearError: mockClearError
      };
      mockUseOnChainStore.mockReturnValue(mockState);

      render(<OnChainTrackerPage />);

      expect(screen.getByTestId('results-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load transaction data')).toBeInTheDocument();

      const retryButton = screen.getByTestId('retry-results');
      fireEvent.click(retryButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
      expect(mockRetryOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complete Error Recovery Flow', () => {
    it('should handle complete error-to-success flow', async () => {
      const mockSetFormData = jest.fn();
      const mockValidateAndFetch = jest.fn();
      const mockClearError = jest.fn();
      const mockRetryOperation = jest.fn();

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
      const mockSetFormData = jest.fn();
      const mockValidateAndFetch = jest.fn();

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
        annualGrantBtc: 1.0
      });
      expect(mockValidateAndFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple error types in sequence', async () => {
      const mockClearError = jest.fn();
      const mockRetryOperation = jest.fn();
      const mockContinueWithPartialData = jest.fn();

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

      // Continue with partial data
      const continueButton = screen.getByRole('button', { name: /continue with partial data/i });
      fireEvent.click(continueButton);

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

      expect(screen.getByText('Verify Your Bitcoin Vesting History')).toBeInTheDocument();
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