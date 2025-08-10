import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TrackerPage from '../page';
import { useOnChainStore } from '@/stores/onChainStore';
import { AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

// Mock all external dependencies
vi.mock('@/stores/onChainStore');
vi.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}));
vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
  ChartErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-error-boundary">{children}</div>
}));

// Mock form component
vi.mock('@/components/on-chain/VestingTrackerForm', () => ({
  default: ({ onSubmit, isLoading, errors }: any) => (
    <div data-testid="vesting-tracker-form">
      <input 
        data-testid="address-input" 
        placeholder="Bitcoin Address"
        onChange={(e) => {/* mock input */}}
      />
      <input 
        data-testid="date-input" 
        type="date"
        placeholder="Vesting Start Date"
      />
      <input 
        data-testid="amount-input" 
        type="number"
        placeholder="Annual Grant BTC"
      />
      <button 
        data-testid="submit-button"
        onClick={() => onSubmit({
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          vestingStartDate: '2023-01-01',
          annualGrantBtc: 0.5
        })}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Start Analysis'}
      </button>
      {Object.keys(errors || {}).map(key => (
        <div key={key} data-testid={`error-${key}`}>{errors[key]}</div>
      ))}
    </div>
  )
}));

// Mock results component
vi.mock('@/components/on-chain/VestingTrackerResults', () => ({
  default: ({ transactions, expectedGrants, isLoading, error, onRetry, onUpdateAnnotation }: any) => (
    <div data-testid="vesting-tracker-results">
      {isLoading && <div data-testid="results-loading">Loading results...</div>}
      {error && (
        <div data-testid="results-error">
          <p>{error}</p>
          <button data-testid="retry-button" onClick={onRetry}>Retry</button>
        </div>
      )}
      {transactions.length > 0 && (
        <div data-testid="results-content">
          <div data-testid="transaction-count">{transactions.length} transactions</div>
          {transactions.map((tx: AnnotatedTransaction) => (
            <div key={tx.txid} data-testid={`transaction-${tx.txid}`}>
              <span data-testid={`tx-amount-${tx.txid}`}>{tx.amountBTC}</span>
              <span data-testid={`tx-year-${tx.txid}`}>{tx.grantYear || 'Unmatched'}</span>
              <button 
                data-testid={`manual-override-${tx.txid}`}
                onClick={() => onUpdateAnnotation(tx.txid, tx.grantYear === 1 ? 2 : 1)}
              >
                Override
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}));

// Mock timeline visualizer
vi.mock('@/components/on-chain/OnChainTimelineVisualizer', () => ({
  default: ({ expectedGrants, actualTransactions }: any) => (
    <div data-testid="timeline-visualizer">
      <div data-testid="expected-grants-count">{expectedGrants.length} expected grants</div>
      <div data-testid="actual-transactions-count">{actualTransactions.length} actual transactions</div>
    </div>
  )
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ShieldCheckIcon: (props: any) => <svg data-testid="shield-icon" {...props} />,
  InformationCircleIcon: (props: any) => <svg data-testid="info-icon" {...props} />,
  ChartBarIcon: (props: any) => <svg data-testid="chart-icon" {...props} />,
  ClockIcon: (props: any) => <svg data-testid="clock-icon" {...props} />
}));

// Mock store data
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

describe('TrackerPage Integration Tests', () => {
  const mockStore = {
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
    setFormData: vi.fn(),
    validateAndFetch: vi.fn(),
    updateManualAnnotation: vi.fn(),
    resetTracker: vi.fn(),
    retryOperation: vi.fn()
  };

  beforeEach(() => {
    vi.mocked(useOnChainStore).mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial page load', () => {
    it('renders the main page with privacy disclaimer and feature overview', () => {
      render(<TrackerPage />);

      expect(screen.getByText('On-Chain Vesting Tracker')).toBeInTheDocument();
      expect(screen.getByText(/Privacy & Data Usage Notice/i)).toBeInTheDocument();
      expect(screen.getByText('Verify Your Bitcoin Vesting History')).toBeInTheDocument();
      expect(screen.getByTestId('vesting-tracker-form')).toBeInTheDocument();
    });

    it('shows feature overview when no analysis has been performed', () => {
      render(<TrackerPage />);

      expect(screen.getByText('Automatic Matching')).toBeInTheDocument();
      expect(screen.getByText('Manual Overrides')).toBeInTheDocument();
      expect(screen.getByText('Historical Values')).toBeInTheDocument();
      expect(screen.getByText('Visual Timeline')).toBeInTheDocument();
      expect(screen.getByText('Privacy Focused')).toBeInTheDocument();
      expect(screen.getByText('Real-time Updates')).toBeInTheDocument();
    });

    it('renders privacy disclaimer with collapsible details', () => {
      render(<TrackerPage />);

      const expandButton = screen.getByText('Read full privacy details');
      expect(expandButton).toBeInTheDocument();

      fireEvent.click(expandButton);

      expect(screen.getByText('Recommended Privacy Practices')).toBeInTheDocument();
      expect(screen.getByText('External API Usage')).toBeInTheDocument();
      expect(screen.getByText('Session-Only Processing')).toBeInTheDocument();

      const collapseButton = screen.getByText('Show less');
      fireEvent.click(collapseButton);

      expect(screen.queryByText('Recommended Privacy Practices')).not.toBeInTheDocument();
    });
  });

  describe('Form submission flow', () => {
    it('handles form submission and triggers validation', async () => {
      render(<TrackerPage />);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(mockStore.setFormData).toHaveBeenCalledWith({
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      });
      expect(mockStore.validateAndFetch).toHaveBeenCalled();
    });

    it('displays form errors when validation fails', () => {
      const storeWithErrors = {
        ...mockStore,
        formErrors: { address: 'Invalid Bitcoin address', annualGrantBtc: 'Amount must be positive' }
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithErrors);

      render(<TrackerPage />);

      expect(screen.getByTestId('error-address')).toHaveTextContent('Invalid Bitcoin address');
      expect(screen.getByTestId('error-annualGrantBtc')).toHaveTextContent('Amount must be positive');
    });
  });

  describe('Loading states', () => {
    it('shows loading steps during processing', () => {
      const loadingStore = {
        ...mockStore,
        isLoading: true,
        currentStep: 'fetching' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(loadingStore);

      render(<TrackerPage />);

      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
      expect(screen.getByText('Fetching Transactions')).toBeInTheDocument();
      expect(screen.getByText('Analyzing & Matching')).toBeInTheDocument();
      expect(screen.getByText('Retrieving Prices')).toBeInTheDocument();
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
    });

    it('shows different steps as active during processing', () => {
      const annotatingStore = {
        ...mockStore,
        isLoading: true,
        currentStep: 'annotating' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(annotatingStore);

      render(<TrackerPage />);

      expect(screen.getByText('Analyzing transactions and matching to vesting schedule...')).toBeInTheDocument();
    });

    it('disables form submission while loading', () => {
      const loadingStore = {
        ...mockStore,
        isLoading: true,
        currentStep: 'fetching' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(loadingStore);

      render(<TrackerPage />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Processing...');
    });
  });

  describe('Results display', () => {
    it('shows results table when transactions are loaded', () => {
      const storeWithResults = {
        ...mockStore,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithResults);

      render(<TrackerPage />);

      expect(screen.getByTestId('vesting-tracker-results')).toBeInTheDocument();
      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('2 transactions');
    });

    it('shows timeline visualizer when results are available', () => {
      const storeWithResults = {
        ...mockStore,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithResults);

      render(<TrackerPage />);

      expect(screen.getByTestId('timeline-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Vesting Timeline Analysis')).toBeInTheDocument();
    });

    it('displays analysis summary with correct counts', () => {
      const storeWithResults = {
        ...mockStore,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const,
        manualAnnotations: new Map([['tx2', 2]])
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithResults);

      render(<TrackerPage />);

      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
      
      // Check transaction count
      const transactionCountElement = screen.getByText((content, element) => {
        return element?.textContent === '2';
      });
      expect(transactionCountElement).toBeInTheDocument();
      
      // Check vesting grants matched (1 grant matched)
      const grantCountElements = screen.getAllByText('1');
      expect(grantCountElements.length).toBeGreaterThan(0);
      
      // Check manual overrides count
      const manualOverrideElements = screen.getAllByText('1');
      expect(manualOverrideElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('displays error state with retry button', () => {
      const storeWithError = {
        ...mockStore,
        error: 'Network connection failed',
        isLoading: false
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithError);

      render(<TrackerPage />);

      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Retry Analysis');
      fireEvent.click(retryButton);
      
      expect(mockStore.retryOperation).toHaveBeenCalled();
    });

    it('shows error state in results component', () => {
      const storeWithError = {
        ...mockStore,
        error: 'API request failed',
        isLoading: false,
        annotatedTransactions: [] // No transactions but error exists
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithError);

      render(<TrackerPage />);

      // The error should be passed to the results component
      expect(screen.getByTestId('vesting-tracker-results')).toBeInTheDocument();
    });
  });

  describe('Manual annotation workflow', () => {
    it('handles manual annotation updates', () => {
      const storeWithResults = {
        ...mockStore,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithResults);

      render(<TrackerPage />);

      // Find and click manual override button
      const overrideButton = screen.getByTestId('manual-override-tx1');
      fireEvent.click(overrideButton);

      expect(mockStore.updateManualAnnotation).toHaveBeenCalledWith('tx1', 2);
    });

    it('updates analysis summary when manual annotations are made', () => {
      const storeWithManualAnnotation = {
        ...mockStore,
        annotatedTransactions: mockTransactions.map(tx => 
          tx.txid === 'tx2' ? { ...tx, grantYear: 2, isManuallyAnnotated: true } : tx
        ),
        expectedGrants: mockExpectedGrants,
        manualAnnotations: new Map([['tx2', 2]]),
        currentStep: 'complete' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithManualAnnotation);

      render(<TrackerPage />);

      expect(screen.getByText('Manual Overrides')).toBeInTheDocument();
    });
  });

  describe('Reset functionality', () => {
    it('handles tracker reset', () => {
      const storeWithResults = {
        ...mockStore,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeWithResults);

      render(<TrackerPage />);

      const resetButton = screen.getByText('Reset Analysis');
      fireEvent.click(resetButton);

      expect(mockStore.resetTracker).toHaveBeenCalled();
    });

    it('clears original annotations when tracker is reset', async () => {
      let storeState = {
        ...mockStore,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const
      };

      const { rerender } = render(<TrackerPage />);

      // Simulate reset
      storeState = {
        ...mockStore,
        currentStep: 'idle' as const,
        annotatedTransactions: [],
        expectedGrants: []
      };
      vi.mocked(useOnChainStore).mockReturnValue(storeState);

      rerender(<TrackerPage />);

      // Should show feature overview again
      expect(screen.getByText('Verify Your Bitcoin Vesting History')).toBeInTheDocument();
    });
  });

  describe('Complete user journey', () => {
    it('handles full workflow from form submission to manual annotation', async () => {
      let currentStore = { ...mockStore };

      // Mock store updates for different stages
      const mockUseOnChainStore = vi.mocked(useOnChainStore);
      
      // Initial render
      mockUseOnChainStore.mockReturnValue(currentStore);
      const { rerender } = render(<TrackerPage />);

      // Step 1: Submit form
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      expect(currentStore.setFormData).toHaveBeenCalled();
      expect(currentStore.validateAndFetch).toHaveBeenCalled();

      // Step 2: Loading state
      currentStore = {
        ...currentStore,
        isLoading: true,
        currentStep: 'fetching' as const
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<TrackerPage />);

      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
      expect(screen.getByText('Fetching transaction data from blockchain...')).toBeInTheDocument();

      // Step 3: Results loaded
      currentStore = {
        ...currentStore,
        isLoading: false,
        currentStep: 'complete' as const,
        annotatedTransactions: mockTransactions,
        expectedGrants: mockExpectedGrants
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<TrackerPage />);

      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();

      // Step 4: Manual annotation
      const overrideButton = screen.getByTestId('manual-override-tx2');
      fireEvent.click(overrideButton);

      expect(currentStore.updateManualAnnotation).toHaveBeenCalledWith('tx2', 1);

      // Step 5: Reset
      const resetButton = screen.getByText('Reset Analysis');
      fireEvent.click(resetButton);

      expect(currentStore.resetTracker).toHaveBeenCalled();
    });
  });

  describe('Accessibility and UI behavior', () => {
    it('maintains proper focus management during state changes', () => {
      render(<TrackerPage />);

      const submitButton = screen.getByTestId('submit-button');
      submitButton.focus();
      expect(submitButton).toHaveFocus();
    });

    it('provides proper error boundaries', () => {
      render(<TrackerPage />);

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('chart-error-boundary')).toBeInTheDocument();
    });

    it('includes navigation component', () => {
      render(<TrackerPage />);

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('has responsive layout structure', () => {
      render(<TrackerPage />);

      const mainContainer = screen.getByText('On-Chain Vesting Tracker').closest('.max-w-7xl');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto', 'px-4');
    });
  });
});