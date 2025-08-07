import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotatedTransaction } from '@/types/on-chain';
import VestingTrackerResults from '../VestingTrackerResults';

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  formatBTC: (amount: number) => `₿${amount.toFixed(6)}`,
  formatUSD: (amount: number) => `$${amount.toLocaleString()}`
}));

describe('VestingTrackerResults', () => {
  const mockTransactions: AnnotatedTransaction[] = [
    {
      txid: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef12',
      grantYear: 1,
      type: 'Annual Grant',
      isIncoming: true,
      amountBTC: 0.5,
      amountSats: 50000000,
      date: '2023-01-15',
      blockHeight: 780000,
      valueAtTimeOfTx: 10000,
      status: 'Confirmed',
      matchScore: 0.85,
      isManuallyAnnotated: false
    },
    {
      txid: 'def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef123456789',
      grantYear: null,
      type: 'Other Transaction',
      isIncoming: true,
      amountBTC: 0.1,
      amountSats: 10000000,
      date: '2023-02-20',
      blockHeight: 785000,
      valueAtTimeOfTx: 2500,
      status: 'Confirmed',
      isManuallyAnnotated: false
    },
    {
      txid: 'ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef123456789012345',
      grantYear: 2,
      type: 'Annual Grant',
      isIncoming: true,
      amountBTC: 0.5,
      amountSats: 50000000,
      date: '2024-01-15',
      blockHeight: 820000,
      valueAtTimeOfTx: 15000,
      status: 'Confirmed',
      matchScore: 0.92,
      isManuallyAnnotated: true
    }
  ];

  const defaultProps = {
    transactions: mockTransactions,
    isLoading: false,
    error: null,
    onRetry: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
          isLoading={true}
        />
      );

      // Check for loading skeleton elements
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(document.querySelector('.card')).toBeInTheDocument();
    });

    it('should not display table when loading', () => {
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
          isLoading={true}
        />
      );

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is present', () => {
      const errorMessage = 'Failed to fetch transactions';
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
          error={errorMessage}
        />
      );

      expect(screen.getByText('Error loading transactions')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
          error="Network error"
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should not display table when error is present', () => {
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
          error="Some error"
        />
      );

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no transactions', () => {
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
        />
      );

      expect(screen.getByText('No transactions found')).toBeInTheDocument();
      expect(screen.getByText(/No transactions were found for this Bitcoin address/)).toBeInTheDocument();
    });

    it('should not display table when no transactions', () => {
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[]}
        />
      );

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Data Rendering', () => {
    it('should render transaction table with correct data', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      // Check table headers
      expect(screen.getByText('Grant Year')).toBeInTheDocument();
      expect(screen.getByText('Date Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Amount BTC')).toBeInTheDocument();
      expect(screen.getByText('USD Value')).toBeInTheDocument();
      expect(screen.getByText('Transaction ID')).toBeInTheDocument();

      // Check transaction data
      expect(screen.getByText('Year 1')).toBeInTheDocument();
      expect(screen.getByText('Year 2')).toBeInTheDocument();
      expect(screen.getByText('Unmatched')).toBeInTheDocument();
      expect(screen.getAllByText('Annual Grant')).toHaveLength(2);
      expect(screen.getByText('Other Transaction')).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByText('Jan 14, 2023')).toBeInTheDocument();
      expect(screen.getByText('Feb 19, 2023')).toBeInTheDocument();
      expect(screen.getByText('Jan 14, 2024')).toBeInTheDocument();
    });

    it('should format BTC amounts correctly', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getAllByText('₿0.500000')).toHaveLength(2);
      expect(screen.getByText('₿0.100000')).toBeInTheDocument();
    });

    it('should format USD values correctly', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByText('$10,000')).toBeInTheDocument();
      expect(screen.getByText('$2,500')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });

    it('should display N/A for null USD values', () => {
      const transactionsWithNullValue = [
        {
          ...mockTransactions[0],
          valueAtTimeOfTx: null
        }
      ];

      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={transactionsWithNullValue}
        />
      );

      expect(screen.getAllByText('N/A')).toHaveLength(2); // One in table, one in summary
    });

    it('should show manual annotation badge', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByText('Manual')).toBeInTheDocument();
    });

    it('should create clickable transaction links', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);

      // Check that links have correct format (they are sorted by date desc, so Year 2 is first)
      expect(links[0]).toHaveAttribute(
        'href',
        'https://mempool.space/tx/ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef123456789012345'
      );
      expect(links[0]).toHaveAttribute('target', '_blank');
      expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should truncate transaction IDs correctly', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByText('abc123de...cdef12')).toBeInTheDocument();
      expect(screen.getByText('def456gh...456789')).toBeInTheDocument();
      expect(screen.getByText('ghi789jk...012345')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by date in descending order by default', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      // Skip header row, check data rows
      expect(rows[1]).toHaveTextContent('Jan 14, 2024'); // Most recent first
      expect(rows[2]).toHaveTextContent('Feb 19, 2023');
      expect(rows[3]).toHaveTextContent('Jan 14, 2023');
    });

    it('should toggle sort direction when clicking same column', async () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const dateHeader = screen.getByText('Date Confirmed');
      
      // Click to sort ascending
      fireEvent.click(dateHeader);
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Jan 14, 2023'); // Oldest first
      });
    });

    it('should sort by grant year correctly', async () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const grantYearHeader = screen.getByText('Grant Year');
      fireEvent.click(grantYearHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Year 2'); // Highest grant year first
      });
    });

    it('should sort by amount correctly', async () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const amountHeader = screen.getByText('Amount BTC');
      fireEvent.click(amountHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('₿0.500000'); // Highest amount first
      });
    });

    it('should sort by type correctly', async () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const typeHeader = screen.getByText('Type');
      fireEvent.click(typeHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Other Transaction'); // Alphabetically first
      });
    });

    it('should sort by USD value correctly', async () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const valueHeader = screen.getByText('USD Value');
      fireEvent.click(valueHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('$15,000'); // Highest value first
      });
    });

    it('should display correct sort icons', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      // Date should have descending sort icon (default)
      const dateButton = screen.getByText('Date Confirmed').closest('button');
      expect(dateButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should display correct summary statistics', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Vesting grants matched
      expect(screen.getByText('Vesting Grants Matched')).toBeInTheDocument();

      expect(screen.getByText('₿1.100000')).toBeInTheDocument(); // Total BTC
      expect(screen.getByText('Total BTC Received')).toBeInTheDocument();

      expect(screen.getByText('$27,500')).toBeInTheDocument(); // Total USD value
      expect(screen.getByText('Total USD Value at Time')).toBeInTheDocument();
    });

    it('should display N/A for total USD when no values available', () => {
      const transactionsWithoutValues = mockTransactions.map(t => ({
        ...t,
        valueAtTimeOfTx: null
      }));

      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={transactionsWithoutValues}
        />
      );

      // Check that the summary shows N/A for total USD value
      const summarySection = screen.getByText('Total USD Value at Time').parentElement;
      expect(summarySection).toHaveTextContent('N/A');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(6);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
    });

    it('should have accessible sort buttons', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const sortButtons = screen.getAllByRole('button');
      sortButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should have proper link attributes for accessibility', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have overflow-x-auto for table responsiveness', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const tableContainer = screen.getByRole('table').parentElement;
      expect(tableContainer).toHaveClass('overflow-x-auto');
    });

    it('should use responsive grid for summary statistics', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const summaryGrid = screen.getByText('Vesting Grants Matched').closest('.grid');
      expect(summaryGrid).toHaveClass('grid-cols-1', 'md:grid-cols-3');
    });
  });

  describe('User Interactions', () => {
    it('should highlight rows on hover', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // First data row
      expect(dataRow).toHaveClass('hover:bg-gray-50', 'dark:hover:bg-slate-800/50');
    });

    it('should show transaction count in header', () => {
      render(<VestingTrackerResults {...defaultProps} />);

      expect(screen.getByText(/Found 3 transactions/)).toBeInTheDocument();
      expect(screen.getByText(/2 matched to vesting grants/)).toBeInTheDocument();
    });

    it('should handle singular transaction count', () => {
      render(
        <VestingTrackerResults
          {...defaultProps}
          transactions={[mockTransactions[0]]}
        />
      );

      expect(screen.getByText(/Found 1 transaction •/)).toBeInTheDocument();
    });
  });
});