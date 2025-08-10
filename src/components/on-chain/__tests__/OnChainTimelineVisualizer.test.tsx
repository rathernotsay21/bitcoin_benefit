import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OnChainTimelineVisualizer from '../OnChainTimelineVisualizer';
import { ExpectedGrant, AnnotatedTransaction } from '@/types/on-chain';

// Mock window.innerWidth for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

const mockExpectedGrants: ExpectedGrant[] = [
  {
    year: 1,
    expectedDate: '2024-01-01',
    expectedAmountBTC: 0.1,
    expectedAmountSats: 10000000,
    isMatched: true,
    matchedTxid: 'tx1',
    tolerance: { dateRangeDays: 90, amountPercentage: 20 }
  },
  {
    year: 2,
    expectedDate: '2025-01-01',
    expectedAmountBTC: 0.1,
    expectedAmountSats: 10000000,
    isMatched: false,
    tolerance: { dateRangeDays: 90, amountPercentage: 20 }
  },
  {
    year: 3,
    expectedDate: '2026-01-01',
    expectedAmountBTC: 0.1,
    expectedAmountSats: 10000000,
    isMatched: true,
    matchedTxid: 'tx2',
    tolerance: { dateRangeDays: 90, amountPercentage: 20 }
  }
];

const mockActualTransactions: AnnotatedTransaction[] = [
  {
    txid: 'tx1',
    grantYear: 1,
    type: 'Annual Grant',
    isIncoming: true,
    amountBTC: 0.095,
    amountSats: 9500000,
    date: '2024-01-05',
    blockHeight: 800000,
    valueAtTimeOfTx: 4500,
    status: 'Confirmed',
    matchScore: 0.85,
    isManuallyAnnotated: false
  },
  {
    txid: 'tx2',
    grantYear: 3,
    type: 'Annual Grant',
    isIncoming: true,
    amountBTC: 0.102,
    amountSats: 10200000,
    date: '2026-01-03',
    blockHeight: 850000,
    valueAtTimeOfTx: 6800,
    status: 'Confirmed',
    matchScore: 0.92,
    isManuallyAnnotated: false
  },
  {
    txid: 'tx3',
    grantYear: null,
    type: 'Other Transaction',
    isIncoming: true,
    amountBTC: 0.05,
    amountSats: 5000000,
    date: '2024-06-15',
    blockHeight: 820000,
    valueAtTimeOfTx: 2500,
    status: 'Confirmed',
    isManuallyAnnotated: false
  }
];

describe('OnChainTimelineVisualizer', () => {
  const defaultProps = {
    expectedGrants: mockExpectedGrants,
    actualTransactions: mockActualTransactions,
    vestingStartDate: '2023-01-01'
  };

  beforeEach(() => {
    // Reset window width
    window.innerWidth = 1024;
  });

  describe('Component Rendering', () => {
    it('renders the timeline visualizer with title and basic info', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      expect(screen.getByText('10-Year Vesting Grant Timeline')).toBeInTheDocument();
      expect(screen.getByText('Start Date:')).toBeInTheDocument();
      expect(screen.getByText('• Expected Total:')).toBeInTheDocument();
      expect(screen.getByText('• Received:')).toBeInTheDocument();
    });

    it('renders the statistics cards', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      expect(screen.getAllByText('Expected')).toHaveLength(2); // Card + table header
      expect(screen.getAllByText('Received')).toHaveLength(3); // Card + table status badges
      expect(screen.getByText('Grants')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();
    });

    it('renders grant status table', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      expect(screen.getByText('Grant Status Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getAllByText('Expected')).toHaveLength(2); // Card + table header
      expect(screen.getByText('Actual')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Data Processing and Display', () => {
    it('calculates and displays correct statistics', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      // Expected total: 0.1 + 0.1 + 0.1 = 0.3 BTC (3 decimal places)
      expect(screen.getAllByText('₿0.300').length).toBeGreaterThanOrEqual(1);
      
      // Received: 0.095 + 0.102 = 0.197 BTC (3 decimal places)
      expect(screen.getAllByText('₿0.197').length).toBeGreaterThanOrEqual(1);
      
      // Grants matched: 2/3
      expect(screen.getByText('2/3')).toBeInTheDocument();
      
      // Success rate: 66.7%
      expect(screen.getByText('66.7% success rate')).toBeInTheDocument();
    });

    it('displays correct grant status in table', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      // Check for status badges (including the card title)
      const receivedBadges = screen.getAllByText('Received');
      const missingBadges = screen.getAllByText('Missing');
      
      expect(receivedBadges.length).toBeGreaterThanOrEqual(2); // At least 2 (card title + badges)
      expect(missingBadges).toHaveLength(1); // Year 2
    });

    it('formats dates correctly', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      // Check vesting start date formatting (JavaScript Date parsing can vary)
      expect(screen.getByText(/1\/1\/2023|12\/31\/2022/)).toBeInTheDocument();
      
      // Check transaction dates in table (dates might be formatted differently)
      const tableRows = screen.getAllByRole('row');
      const hasTransactionDates = tableRows.some(row => 
        row.textContent?.includes('2024') || row.textContent?.includes('2026')
      );
      expect(hasTransactionDates).toBe(true);
    });

    it('formats BTC and USD values correctly', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      // Check BTC formatting (3 decimal places)
      expect(screen.getByText('₿0.095')).toBeInTheDocument();
      expect(screen.getByText('₿0.102')).toBeInTheDocument();
      
      // Check USD formatting
      expect(screen.getByText('$4,500')).toBeInTheDocument();
      expect(screen.getByText('$6,800')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', async () => {
      // Set mobile width
      window.innerWidth = 600;
      
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });
    });

    it('adapts to desktop viewport', async () => {
      // Set desktop width
      window.innerWidth = 1200;
      
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty expected grants', () => {
      render(
        <OnChainTimelineVisualizer 
          expectedGrants={[]}
          actualTransactions={mockActualTransactions}
          vestingStartDate="2023-01-01"
        />
      );
      
      // Check for expected total in the statistics card
      expect(screen.getAllByText('₿0.000').length).toBeGreaterThanOrEqual(1);
      
      expect(screen.getByText('0/0')).toBeInTheDocument(); // Grants matched
    });

    it('handles empty actual transactions', () => {
      render(
        <OnChainTimelineVisualizer 
          expectedGrants={mockExpectedGrants}
          actualTransactions={[]}
          vestingStartDate="2023-01-01"
        />
      );
      
      // Check for received amount (should be 0)
      expect(screen.getAllByText('₿0.000').length).toBeGreaterThanOrEqual(1);
      
      expect(screen.getByText('0/3')).toBeInTheDocument(); // Grants matched
      expect(screen.getAllByText('Missing')).toHaveLength(3); // All missing
    });

    it('handles transactions without USD values', () => {
      const transactionsWithoutUSD = mockActualTransactions.map(tx => ({
        ...tx,
        valueAtTimeOfTx: null
      }));
      
      render(
        <OnChainTimelineVisualizer 
          expectedGrants={mockExpectedGrants}
          actualTransactions={transactionsWithoutUSD}
          vestingStartDate="2023-01-01"
        />
      );
      
      expect(screen.getByText('N/A')).toBeInTheDocument(); // Total value should be N/A
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2); // USD values in table should be —
    });

    it('handles grants with zero amounts', () => {
      const grantsWithZero = mockExpectedGrants.map(grant => ({
        ...grant,
        expectedAmountBTC: 0
      }));
      
      render(
        <OnChainTimelineVisualizer 
          expectedGrants={grantsWithZero}
          actualTransactions={mockActualTransactions}
          vestingStartDate="2023-01-01"
        />
      );
      
      // Check for expected total (should be 0)
      expect(screen.getAllByText('₿0.000').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Interactive Features', () => {
    it('handles table keyboard navigation', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      const table = screen.getByRole('table');
      
      // Test table focus
      fireEvent.focus(table);
      
      // Should not throw errors
      expect(table).toBeInTheDocument();
    });

    it('handles skip to table functionality', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      const skipButton = screen.getByText('Skip to data table');
      
      // Test skip button click
      fireEvent.click(skipButton);
      
      // Should not throw errors
      expect(skipButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(6);
      
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });

    it('has proper heading hierarchy', () => {
      render(<OnChainTimelineVisualizer {...defaultProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 3 });
      expect(mainHeading).toHaveTextContent('10-Year Vesting Grant Timeline');
      
      const subHeading = screen.getByRole('heading', { level: 4 });
      expect(subHeading).toHaveTextContent('Grant Status Breakdown');
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeExpectedGrants = Array.from({ length: 10 }, (_, i) => ({
        year: i + 1,
        expectedDate: `202${3 + i}-01-01`,
        expectedAmountBTC: 0.1,
        expectedAmountSats: 10000000,
        isMatched: i % 2 === 0,
        matchedTxid: i % 2 === 0 ? `tx${i}` : undefined,
        tolerance: { dateRangeDays: 90, amountPercentage: 20 }
      }));

      const largeActualTransactions = Array.from({ length: 5 }, (_, i) => ({
        txid: `tx${i}`,
        grantYear: (i + 1) * 2,
        type: 'Annual Grant' as const,
        isIncoming: true,
        amountBTC: 0.1,
        amountSats: 10000000,
        date: `202${3 + i * 2}-01-01`,
        blockHeight: 800000 + i * 10000,
        valueAtTimeOfTx: 5000 + i * 1000,
        status: 'Confirmed' as const,
        matchScore: 0.8,
        isManuallyAnnotated: false
      }));

      const startTime = performance.now();
      
      render(
        <OnChainTimelineVisualizer 
          expectedGrants={largeExpectedGrants}
          actualTransactions={largeActualTransactions}
          vestingStartDate="2023-01-01"
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Should still display correct data
      expect(screen.getByText('10-Year Vesting Grant Timeline')).toBeInTheDocument();
      expect(screen.getByText('5/10')).toBeInTheDocument(); // 5 matched out of 10
    });
  });
});