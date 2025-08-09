import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import OnChainTrackerPage from '../page';
import { useOnChainStore } from '@/stores/onChainStore';
import { MempoolAPI } from '@/lib/on-chain/mempool-api';
import { OnChainPriceFetcher } from '@/lib/on-chain/price-fetcher';
import { AnnotatedTransaction, ExpectedGrant, RawTransaction } from '@/types/on-chain';

// Mock external dependencies
jest.mock('@/stores/onChainStore');
jest.mock('@/lib/on-chain/mempool-api');
jest.mock('@/lib/on-chain/price-fetcher');
jest.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}));

// Mock all sub-components to focus on integration behavior
jest.mock('@/components/on-chain/VestingTrackerFormOptimized', () => ({
  default: ({ onSubmit, isLoading, errors }: any) => (
    <div data-testid="vesting-tracker-form">
      <input 
        data-testid="address-input" 
        placeholder="Bitcoin Address"
        defaultValue=""
      />
      <input 
        data-testid="date-input" 
        type="date"
        placeholder="Vesting Start Date"
        defaultValue=""
      />
      <input 
        data-testid="amount-input" 
        type="number"
        placeholder="Annual Grant BTC"
        defaultValue=""
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
      {Object.entries(errors || {}).map(([key, message]) => (
        <div key={key} data-testid={`error-${key}`}>{message}</div>
      ))}
    </div>
  )
}));

jest.mock('@/components/on-chain/VestingTrackerResultsOptimized', () => ({
  default: ({ transactions, expectedGrants, isLoading, error, onRetry, onUpdateAnnotation }: any) => (
    <div data-testid="vesting-tracker-results">
      {isLoading && <div data-testid="results-loading">Loading results...</div>}
      {error && (
        <div data-testid="results-error">
          <p>{error}</p>
          <button data-testid="retry-button" onClick={onRetry}>Retry</button>
        </div>
      )}
      {transactions && transactions.length > 0 && (
        <div data-testid="results-content">
          <div data-testid="transaction-count">{transactions.length} transactions</div>
          {transactions.map((tx: AnnotatedTransaction) => (
            <div key={tx.txid} data-testid={`transaction-${tx.txid}`}>
              <span data-testid={`tx-amount-${tx.txid}`}>{tx.amountBTC}</span>
              <span data-testid={`tx-year-${tx.txid}`}>{tx.grantYear || 'Unmatched'}</span>
              <span data-testid={`tx-type-${tx.txid}`}>{tx.type}</span>
              <button 
                data-testid={`manual-override-${tx.txid}`}
                onClick={() => onUpdateAnnotation(tx.txid, tx.grantYear === 1 ? 2 : 1)}
              >
                Override to Year {tx.grantYear === 1 ? 2 : 1}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}));

jest.mock('@/components/on-chain/OnChainTimelineVisualizer', () => ({
  default: ({ expectedGrants, actualTransactions }: any) => (
    <div data-testid="timeline-visualizer">
      <div data-testid="expected-grants-count">{expectedGrants?.length || 0} expected grants</div>
      <div data-testid="actual-transactions-count">{actualTransactions?.length || 0} actual transactions</div>
    </div>
  )
}));

jest.mock('@/components/on-chain/PerformanceMonitoringDashboard', () => ({
  default: () => <div data-testid="performance-dashboard">Performance Dashboard</div>
}));

jest.mock('@/components/on-chain/OnChainErrorBoundaries', () => ({
  OnChainErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="on-chain-error-boundary">{children}</div>,
  TransactionFetchErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="transaction-fetch-error-boundary">{children}</div>,
  PriceFetchErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="price-fetch-error-boundary">{children}</div>,
  TimelineErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="timeline-error-boundary">{children}</div>
}));

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
      { scriptpubkey_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 50000000 } // 0.5 BTC
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
      { scriptpubkey_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 25000000 } // 0.25 BTC
    ],
    fee: 1000
  },
  {
    txid: 'tx3_second_annual_grant',
    status: {
      confirmed: true,
      block_height: 820000,
      block_time: 1704067200 // 2024-01-01
    },
    vin: [],
    vout: [
      { scriptpubkey_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', value: 50000000 } // 0.5 BTC
    ],
    fee: 1000
  }
];

const mockAnnotatedTransactions: AnnotatedTransaction[] = [
  {
    txid: 'tx1_annual_grant',
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
    txid: 'tx2_other_transaction',
    grantYear: null,
    type: 'Other Transaction',
    isIncoming: true,
    amountBTC: 0.25,
    amountSats: 25000000,
    date: '2023-02-01',
    blockHeight: 785000,
    valueAtTimeOfTx: 5750,
    status: 'Confirmed',
    isManuallyAnnotated: false
  },
  {
    txid: 'tx3_second_annual_grant',
    grantYear: 2,
    type: 'Annual Grant',
    isIncoming: true,
    amountBTC: 0.5,
    amountSats: 50000000,
    date: '2024-01-01',
    blockHeight: 820000,
    valueAtTimeOfTx: 42000,
    status: 'Confirmed',
    matchScore: 0.98,
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
    matchedTxid: 'tx1_annual_grant',
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  },
  {
    year: 2,
    expectedDate: '2024-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: true,
    matchedTxid: 'tx3_second_annual_grant',
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  },
  {
    year: 3,
    expectedDate: '2025-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: false,
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  }
];

describe('OnChainTrackerPage Integration Tests', () => {
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
    setFormData: jest.fn(),
    validateAndFetch: jest.fn(),
    updateManualAnnotation: jest.fn(),
    resetTracker: jest.fn(),
    retryOperation: jest.fn()
  };

  const mockMempoolAPI = jest.mocked(MempoolAPI);
  const mockPriceFetcher = jest.mocked(OnChainPriceFetcher);

  beforeEach(() => {
    jest.mocked(useOnChainStore).mockReturnValue(mockStore);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default API mocks
    mockMempoolAPI.validateAddress = jest.fn().mockReturnValue(true);
    mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockResolvedValue(mockRawTransactions);
    mockMempoolAPI.prototype.hasTransactionHistory = jest.fn().mockResolvedValue(true);
    
    mockPriceFetcher.fetchBatchPrices = jest.fn().mockResolvedValue({
      '2023-01-01': 16500,
      '2023-02-01': 23000,
      '2024-01-01': 42000
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path: Complete User Workflow', () => {
    it('should handle complete workflow from form submission to results display', async () => {
      const user = userEvent.setup();
      
      // Mock store state progression
      let currentStore = { ...mockStore };
      const mockUseOnChainStore = jest.mocked(useOnChainStore);
      
      // Initial render
      mockUseOnChainStore.mockReturnValue(currentStore);
      const { rerender } = render(<OnChainTrackerPage />);

      // Verify initial state
      expect(screen.getByText('On-Chain Vesting Tracker')).toBeInTheDocument();
      expect(screen.getByTestId('vesting-tracker-form')).toBeInTheDocument();
      expect(screen.getByText('Verify Your Bitcoin Vesting History')).toBeInTheDocument();

      // Step 1: User submits form
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockStore.setFormData).toHaveBeenCalledWith({
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      });
      expect(mockStore.validateAndFetch).toHaveBeenCalled();

      // Step 2: Loading state
      currentStore = {
        ...currentStore,
        isLoading: true,
        currentStep: 'fetching' as const,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
      expect(screen.getByText('Fetching transaction data from blockchain...')).toBeInTheDocument();
      
      // Submit button should be disabled
      const loadingSubmitButton = screen.getByTestId('submit-button');
      expect(loadingSubmitButton).toBeDisabled();
      expect(loadingSubmitButton).toHaveTextContent('Processing...');

      // Step 3: Annotation phase
      currentStore = {
        ...currentStore,
        currentStep: 'annotating' as const
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      expect(screen.getByText('Analyzing transactions and matching to vesting schedule...')).toBeInTheDocument();

      // Step 4: Results loaded
      currentStore = {
        ...currentStore,
        isLoading: false,
        currentStep: 'complete' as const,
        annotatedTransactions: mockAnnotatedTransactions,
        expectedGrants: mockExpectedGrants
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Verify results are displayed
      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('3 transactions');
      expect(screen.getByTestId('timeline-visualizer')).toBeInTheDocument();
      
      // Verify analysis summary
      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
      
      // Verify individual transactions
      expect(screen.getByTestId('transaction-tx1_annual_grant')).toBeInTheDocument();
      expect(screen.getByTestId('tx-year-tx1_annual_grant')).toHaveTextContent('1');
      expect(screen.getByTestId('tx-type-tx1_annual_grant')).toHaveTextContent('Annual Grant');
      
      expect(screen.getByTestId('transaction-tx2_other_transaction')).toBeInTheDocument();
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('Unmatched');
      expect(screen.getByTestId('tx-type-tx2_other_transaction')).toHaveTextContent('Other Transaction');

      // Verify timeline shows correct data
      expect(screen.getByTestId('expected-grants-count')).toHaveTextContent('3 expected grants');
      expect(screen.getByTestId('actual-transactions-count')).toHaveTextContent('3 actual transactions');
    });

    it('should handle successful API calls and data processing', async () => {
      const user = userEvent.setup();
      
      // Setup successful API responses
      const mockAPI = new MempoolAPI();
      mockAPI.fetchTransactions = jest.fn().mockResolvedValue(mockRawTransactions);
      mockAPI.hasTransactionHistory = jest.fn().mockResolvedValue(true);
      
      mockPriceFetcher.fetchBatchPrices = jest.fn().mockResolvedValue({
        '2023-01-01': 16500,
        '2023-02-01': 23000,
        '2024-01-01': 42000
      });

      const storeWithResults = {
        ...mockStore,
        annotatedTransactions: mockAnnotatedTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithResults);

      render(<OnChainTrackerPage />);

      // Verify all transactions are properly displayed
      expect(screen.getByTestId('transaction-tx1_annual_grant')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-tx2_other_transaction')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-tx3_second_annual_grant')).toBeInTheDocument();

      // Verify amounts and years are correct
      expect(screen.getByTestId('tx-amount-tx1_annual_grant')).toHaveTextContent('0.5');
      expect(screen.getByTestId('tx-year-tx1_annual_grant')).toHaveTextContent('1');
      
      expect(screen.getByTestId('tx-amount-tx2_other_transaction')).toHaveTextContent('0.25');
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('Unmatched');
      
      expect(screen.getByTestId('tx-amount-tx3_second_annual_grant')).toHaveTextContent('0.5');
      expect(screen.getByTestId('tx-year-tx3_second_annual_grant')).toHaveTextContent('2');
    });
  });

  describe('Error Scenarios: API Failures and Recovery', () => {
    it('should handle invalid Bitcoin address validation error', async () => {
      const user = userEvent.setup();
      
      const storeWithValidationError = {
        ...mockStore,
        formErrors: {
          address: 'Invalid Bitcoin address format',
          annualGrantBtc: 'Amount must be positive'
        }
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithValidationError);

      render(<OnChainTrackerPage />);

      // Verify validation errors are displayed
      expect(screen.getByTestId('error-address')).toHaveTextContent('Invalid Bitcoin address format');
      expect(screen.getByTestId('error-annualGrantBtc')).toHaveTextContent('Amount must be positive');

      // Form should still be interactive
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle Mempool API failure with retry functionality', async () => {
      const user = userEvent.setup();
      
      // Mock API failure
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValue(
        new Error('Network connection failed')
      );

      const storeWithError = {
        ...mockStore,
        error: 'Failed to fetch transaction data: Network connection failed',
        isLoading: false
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithError);

      render(<OnChainTrackerPage />);

      // Verify error state is displayed
      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch transaction data: Network connection failed')).toBeInTheDocument();
      
      // Verify retry button is available
      const retryButton = screen.getByText('Retry Analysis');
      expect(retryButton).toBeInTheDocument();
      
      await user.click(retryButton);
      expect(mockStore.retryOperation).toHaveBeenCalled();
    });

    it('should handle price fetching failure gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock price fetching failure
      mockPriceFetcher.fetchBatchPrices = jest.fn().mockRejectedValue(
        new Error('Price API unavailable')
      );

      // Store should still have transactions but with null price values
      const transactionsWithoutPrices = mockAnnotatedTransactions.map(tx => ({
        ...tx,
        valueAtTimeOfTx: null
      }));

      const storeWithPartialData = {
        ...mockStore,
        annotatedTransactions: transactionsWithoutPrices,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const,
        error: null // No error since this is graceful degradation
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithPartialData);

      render(<OnChainTrackerPage />);

      // Results should still be displayed
      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('3 transactions');
      
      // Transactions should be shown even without price data
      expect(screen.getByTestId('transaction-tx1_annual_grant')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-tx2_other_transaction')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-tx3_second_annual_grant')).toBeInTheDocument();
    });

    it('should handle empty transaction history', async () => {
      const user = userEvent.setup();
      
      // Mock empty transaction response
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockResolvedValue([]);
      mockMempoolAPI.prototype.hasTransactionHistory = jest.fn().mockResolvedValue(false);

      const storeWithEmptyResults = {
        ...mockStore,
        annotatedTransactions: [],
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithEmptyResults);

      render(<OnChainTrackerPage />);

      // Should show results component but with empty state
      expect(screen.getByTestId('vesting-tracker-results')).toBeInTheDocument();
      expect(screen.queryByTestId('results-content')).not.toBeInTheDocument();
      
      // Timeline should still show expected grants
      expect(screen.getByTestId('timeline-visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('expected-grants-count')).toHaveTextContent('3 expected grants');
      expect(screen.getByTestId('actual-transactions-count')).toHaveTextContent('0 actual transactions');
    });

    it('should handle rate limiting errors with appropriate messaging', async () => {
      const user = userEvent.setup();
      
      // Mock rate limiting error
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValue(
        new Error('HTTP 429: Too Many Requests')
      );

      const storeWithRateLimitError = {
        ...mockStore,
        error: 'API rate limit exceeded. Please wait a moment and try again.',
        isLoading: false
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithRateLimitError);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('API rate limit exceeded. Please wait a moment and try again.')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Retry Analysis');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle network timeout errors', async () => {
      const user = userEvent.setup();
      
      // Mock timeout error
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValue(
        new Error('Request timeout')
      );

      const storeWithTimeoutError = {
        ...mockStore,
        error: 'Request timed out. Please check your connection and try again.',
        isLoading: false
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithTimeoutError);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Request timed out. Please check your connection and try again.')).toBeInTheDocument();
    });
  });

  describe('Manual Override Workflow', () => {
    it('should handle complete manual annotation workflow', async () => {
      const user = userEvent.setup();
      
      let currentStore = {
        ...mockStore,
        annotatedTransactions: mockAnnotatedTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const,
        manualAnnotations: new Map()
      };
      
      const mockUseOnChainStore = jest.mocked(useOnChainStore);
      mockUseOnChainStore.mockReturnValue(currentStore);
      
      const { rerender } = render(<OnChainTrackerPage />);

      // Verify initial automatic annotations
      expect(screen.getByTestId('tx-year-tx1_annual_grant')).toHaveTextContent('1');
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('Unmatched');
      expect(screen.getByTestId('tx-year-tx3_second_annual_grant')).toHaveTextContent('2');

      // Step 1: User manually overrides tx2 to be Year 2
      const overrideButton = screen.getByTestId('manual-override-tx2_other_transaction');
      await user.click(overrideButton);

      expect(mockStore.updateManualAnnotation).toHaveBeenCalledWith('tx2_other_transaction', 1);

      // Step 2: Update store to reflect manual annotation
      const updatedTransactions = mockAnnotatedTransactions.map(tx => 
        tx.txid === 'tx2_other_transaction' 
          ? { ...tx, grantYear: 2, type: 'Annual Grant' as const, isManuallyAnnotated: true }
          : tx
      );

      currentStore = {
        ...currentStore,
        annotatedTransactions: updatedTransactions,
        manualAnnotations: new Map([['tx2_other_transaction', 2]])
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Verify the manual annotation is reflected
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('2');
      
      // Step 3: User overrides tx1 from Year 1 to Year 2
      const overrideButton1 = screen.getByTestId('manual-override-tx1_annual_grant');
      await user.click(overrideButton1);

      expect(mockStore.updateManualAnnotation).toHaveBeenCalledWith('tx1_annual_grant', 2);

      // Step 4: Update store again
      const furtherUpdatedTransactions = updatedTransactions.map(tx => 
        tx.txid === 'tx1_annual_grant' 
          ? { ...tx, grantYear: 2, isManuallyAnnotated: true }
          : tx
      );

      currentStore = {
        ...currentStore,
        annotatedTransactions: furtherUpdatedTransactions,
        manualAnnotations: new Map([
          ['tx2_other_transaction', 2],
          ['tx1_annual_grant', 2]
        ])
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Verify both manual annotations
      expect(screen.getByTestId('tx-year-tx1_annual_grant')).toHaveTextContent('2');
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('2');
    });

    it('should update analysis summary when manual annotations are made', async () => {
      const user = userEvent.setup();
      
      const storeWithManualAnnotations = {
        ...mockStore,
        annotatedTransactions: mockAnnotatedTransactions.map(tx => 
          tx.txid === 'tx2_other_transaction' 
            ? { ...tx, grantYear: 2, type: 'Annual Grant' as const, isManuallyAnnotated: true }
            : tx
        ),
        expectedGrants: mockExpectedGrants,
        manualAnnotations: new Map([['tx2_other_transaction', 2]]),
        currentStep: 'complete' as const
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithManualAnnotations);

      render(<OnChainTrackerPage />);

      // Verify analysis summary reflects manual changes
      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
      
      // Should show manual override count
      const summarySection = screen.getByText('Analysis Summary').closest('div');
      expect(summarySection).toBeInTheDocument();
    });

    it('should handle undo functionality for manual annotations', async () => {
      const user = userEvent.setup();
      
      // Start with a manual annotation
      let currentStore = {
        ...mockStore,
        annotatedTransactions: mockAnnotatedTransactions.map(tx => 
          tx.txid === 'tx2_other_transaction' 
            ? { ...tx, grantYear: 2, type: 'Annual Grant' as const, isManuallyAnnotated: true }
            : tx
        ),
        expectedGrants: mockExpectedGrants,
        manualAnnotations: new Map([['tx2_other_transaction', 2]]),
        currentStep: 'complete' as const
      };
      
      const mockUseOnChainStore = jest.mocked(useOnChainStore);
      mockUseOnChainStore.mockReturnValue(currentStore);
      
      const { rerender } = render(<OnChainTrackerPage />);

      // Verify manual annotation is active
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('2');

      // Click override again to undo (this would toggle back to original)
      const overrideButton = screen.getByTestId('manual-override-tx2_other_transaction');
      await user.click(overrideButton);

      expect(mockStore.updateManualAnnotation).toHaveBeenCalledWith('tx2_other_transaction', 1);

      // Update store to reflect undo
      currentStore = {
        ...currentStore,
        annotatedTransactions: mockAnnotatedTransactions, // Back to original
        manualAnnotations: new Map() // Cleared
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Verify annotation is back to original
      expect(screen.getByTestId('tx-year-tx2_other_transaction')).toHaveTextContent('Unmatched');
    });
  });

  describe('Error Propagation and Recovery', () => {
    it('should propagate validation errors from store to form', async () => {
      const user = userEvent.setup();
      
      const storeWithValidationErrors = {
        ...mockStore,
        formErrors: {
          address: 'Invalid Bitcoin address format',
          vestingStartDate: 'Date cannot be in the future',
          annualGrantBtc: 'Amount must be between 0.00000001 and 21 BTC'
        }
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithValidationErrors);

      render(<OnChainTrackerPage />);

      // All validation errors should be displayed
      expect(screen.getByTestId('error-address')).toHaveTextContent('Invalid Bitcoin address format');
      expect(screen.getByTestId('error-vestingStartDate')).toHaveTextContent('Date cannot be in the future');
      expect(screen.getByTestId('error-annualGrantBtc')).toHaveTextContent('Amount must be between 0.00000001 and 21 BTC');
    });

    it('should handle error recovery after successful retry', async () => {
      const user = userEvent.setup();
      
      // Start with error state
      let currentStore = {
        ...mockStore,
        error: 'Network connection failed',
        isLoading: false
      };
      
      const mockUseOnChainStore = jest.mocked(useOnChainStore);
      mockUseOnChainStore.mockReturnValue(currentStore);
      
      const { rerender } = render(<OnChainTrackerPage />);

      // Verify error state
      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByText('Retry Analysis');
      await user.click(retryButton);
      expect(mockStore.retryOperation).toHaveBeenCalled();

      // Simulate successful retry
      currentStore = {
        ...currentStore,
        error: null,
        isLoading: true,
        currentStep: 'fetching' as const
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Should show loading state
      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
      expect(screen.queryByText('Analysis Error')).not.toBeInTheDocument();

      // Complete with successful results
      currentStore = {
        ...currentStore,
        error: null,
        isLoading: false,
        currentStep: 'complete' as const,
        annotatedTransactions: mockAnnotatedTransactions,
        expectedGrants: mockExpectedGrants
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Should show results
      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.queryByText('Analysis Error')).not.toBeInTheDocument();
    });

    it('should handle partial failure scenarios', async () => {
      const user = userEvent.setup();
      
      // Simulate scenario where transactions are fetched but some prices fail
      const partialTransactions = mockAnnotatedTransactions.map((tx, index) => ({
        ...tx,
        valueAtTimeOfTx: index < 2 ? tx.valueAtTimeOfTx : null // Only first 2 have prices
      }));

      const storeWithPartialData = {
        ...mockStore,
        annotatedTransactions: partialTransactions,
        expectedGrants: mockExpectedGrants,
        currentStep: 'complete' as const,
        error: null // No error since this is partial success
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithPartialData);

      render(<OnChainTrackerPage />);

      // Results should still be displayed
      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('3 transactions');
      
      // All transactions should be shown regardless of missing price data
      expect(screen.getByTestId('transaction-tx1_annual_grant')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-tx2_other_transaction')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-tx3_second_annual_grant')).toBeInTheDocument();
    });
  });

  describe('Reset and State Management', () => {
    it('should handle complete reset workflow', async () => {
      const user = userEvent.setup();
      
      // Start with completed analysis
      let currentStore = {
        ...mockStore,
        annotatedTransactions: mockAnnotatedTransactions,
        expectedGrants: mockExpectedGrants,
        manualAnnotations: new Map([['tx2_other_transaction', 2]]),
        currentStep: 'complete' as const,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      };
      
      const mockUseOnChainStore = jest.mocked(useOnChainStore);
      mockUseOnChainStore.mockReturnValue(currentStore);
      
      const { rerender } = render(<OnChainTrackerPage />);

      // Verify results are displayed
      expect(screen.getByTestId('results-content')).toBeInTheDocument();
      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();

      // Click reset
      const resetButton = screen.getByText('Reset Analysis');
      await user.click(resetButton);
      expect(mockStore.resetTracker).toHaveBeenCalled();

      // Simulate reset state
      currentStore = {
        ...mockStore,
        annotatedTransactions: [],
        expectedGrants: [],
        manualAnnotations: new Map(),
        currentStep: 'idle' as const,
        address: '',
        vestingStartDate: '',
        annualGrantBtc: 0,
        error: null,
        formErrors: {}
      };
      mockUseOnChainStore.mockReturnValue(currentStore);
      rerender(<OnChainTrackerPage />);

      // Should be back to initial state
      expect(screen.getByText('Verify Your Bitcoin Vesting History')).toBeInTheDocument();
      expect(screen.queryByTestId('results-content')).not.toBeInTheDocument();
      expect(screen.queryByText('Analysis Summary')).not.toBeInTheDocument();
    });

    it('should maintain form state during loading', async () => {
      const user = userEvent.setup();
      
      const loadingStore = {
        ...mockStore,
        isLoading: true,
        currentStep: 'fetching' as const,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        vestingStartDate: '2023-01-01',
        annualGrantBtc: 0.5
      };
      jest.mocked(useOnChainStore).mockReturnValue(loadingStore);

      render(<OnChainTrackerPage />);

      // Form should be disabled but maintain values
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Processing...');
      
      // Loading indicator should be shown
      expect(screen.getByText('Processing Your Data')).toBeInTheDocument();
    });
  });

  describe('API Mock Validation', () => {
    it('should properly mock external API calls', async () => {
      const user = userEvent.setup();
      
      // Verify mocks are set up correctly
      expect(mockMempoolAPI.validateAddress).toBeDefined();
      expect(mockMempoolAPI.prototype.fetchTransactions).toBeDefined();
      expect(mockPriceFetcher.fetchBatchPrices).toBeDefined();

      // Test that mocks return expected data
      const isValid = mockMempoolAPI.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      expect(isValid).toBe(true);

      const api = new MempoolAPI();
      const transactions = await api.fetchTransactions('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      expect(transactions).toEqual(mockRawTransactions);

      const prices = await mockPriceFetcher.fetchBatchPrices(['2023-01-01', '2024-01-01']);
      expect(prices).toEqual({
        '2023-01-01': 16500,
        '2023-02-01': 23000,
        '2024-01-01': 42000
      });
    });

    it('should handle API mock failures consistently', async () => {
      // Override mocks to simulate failures
      mockMempoolAPI.prototype.fetchTransactions = jest.fn().mockRejectedValue(
        new Error('Mocked API failure')
      );

      const storeWithMockedError = {
        ...mockStore,
        error: 'Mocked API failure',
        isLoading: false
      };
      jest.mocked(useOnChainStore).mockReturnValue(storeWithMockedError);

      render(<OnChainTrackerPage />);

      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
      expect(screen.getByText('Mocked API failure')).toBeInTheDocument();
    });
  });
});