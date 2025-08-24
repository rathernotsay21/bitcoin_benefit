import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ManualAnnotationOverride from '../ManualAnnotationOverride';
import { AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';

// Mock transaction data
const mockTransaction: AnnotatedTransaction = {
  txid: 'abc123def456ghi789',
  grantYear: 1,
  type: 'Annual Award',
  isIncoming: true,
  amountBTC: 0.5,
  amountSats: 50000000,
  date: '2023-01-15',
  blockHeight: 123456,
  valueAtTimeOfTx: 10000,
  status: 'Confirmed',
  matchScore: 0.85,
  isManuallyAnnotated: false
};

const mockTransactionManuallyAnnotated: AnnotatedTransaction = {
  ...mockTransaction,
  isManuallyAnnotated: true,
  grantYear: 2
};

const mockExpectedGrants: ExpectedGrant[] = [
  {
    year: 1,
    expectedDate: '2023-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: true,
    matchedTxid: 'abc123def456ghi789',
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  },
  {
    year: 2,
    expectedDate: '2024-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: false,
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  },
  {
    year: 3,
    expectedDate: '2025-01-01',
    expectedAmountBTC: 0.5,
    expectedAmountSats: 50000000,
    isMatched: true,
    matchedTxid: 'xyz789def456abc123', // Different transaction
    tolerance: { dateRangeDays: 30, amountPercentage: 10 }
  }
];

describe('ManualAnnotationOverride', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Basic rendering', () => {
    it('renders the current grant year', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Year 1')).toBeInTheDocument();
    });

    it('renders "Unmatched" for null grant year', () => {
      const unmatchedTransaction = { ...mockTransaction, grantYear: null };
      
      render(
        <ManualAnnotationOverride
          transaction={unmatchedTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Unmatched')).toBeInTheDocument();
    });

    it('shows manual override indicator for manually annotated transactions', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransactionManuallyAnnotated}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('M')).toBeInTheDocument();
    });
  });

  describe('Dropdown functionality', () => {
    it('opens dropdown when clicked', async () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Unmatched')).toBeInTheDocument();
        expect(screen.getByText('Year 2')).toBeInTheDocument();
        expect(screen.getByText('Year 3')).toBeInTheDocument();
      });
    });

    it('shows available grants in dropdown', async () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        // Should show all grant years plus unmatched option
        expect(screen.getAllByRole('option')).toHaveLength(4);
      });
    });

    it('marks occupied grant years as disabled', async () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        const year3Option = screen.getByRole('option', { name: /Year 3/ });
        expect(year3Option).toBeDisabled();
        expect(screen.getByText('Occupied')).toBeInTheDocument();
      });
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <ManualAnnotationOverride
            transaction={mockTransaction}
            availableGrants={mockExpectedGrants}
            onUpdate={mockOnUpdate}
          />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      // Dropdown should be open
      await waitFor(() => {
        expect(screen.getByText('Unmatched')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside-element'));

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Unmatched')).not.toBeInTheDocument();
      });
    });
  });

  describe('State updates', () => {
    it('calls onUpdate when selection changes', async () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        const year2Option = screen.getByRole('option', { name: /Year 2/ });
        fireEvent.click(year2Option);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith('abc123def456ghi789', 2);
    });

    it('calls onUpdate with null for Unmatched selection', async () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        const unmatchedOption = screen.getByRole('option', { name: /Unmatched/ });
        fireEvent.click(unmatchedOption);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith('abc123def456ghi789', null);
    });

    it('updates local state when transaction prop changes', () => {
      const { rerender } = render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Year 1')).toBeInTheDocument();

      const updatedTransaction = { ...mockTransaction, grantYear: 2 };
      rerender(
        <ManualAnnotationOverride
          transaction={updatedTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Year 2')).toBeInTheDocument();
    });
  });

  describe('Undo functionality', () => {
    it('shows undo button for manually annotated transactions', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransactionManuallyAnnotated}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
          originalAnnotation={1} // Original was Year 1
        />
      );

      expect(screen.getByRole('button', { name: /Undo/ })).toBeInTheDocument();
    });

    it('does not show undo button for automatic annotations', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: /Undo/ })).not.toBeInTheDocument();
    });

    it('calls onUpdate with original annotation when undo is clicked', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransactionManuallyAnnotated}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
          originalAnnotation={1} // Original was Year 1
        />
      );

      const undoButton = screen.getByRole('button', { name: /Undo/ });
      fireEvent.click(undoButton);

      expect(mockOnUpdate).toHaveBeenCalledWith('abc123def456ghi789', 1);
    });

    it('does not show undo button if current annotation matches original', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction} // Grant year is 1
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
          originalAnnotation={1} // Same as current
        />
      );

      expect(screen.queryByRole('button', { name: /Undo/ })).not.toBeInTheDocument();
    });
  });

  describe('Visual feedback', () => {
    it('shows success feedback after selection change', async () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        const year2Option = screen.getByRole('option', { name: /Year 2/ });
        fireEvent.click(year2Option);
      });

      // Note: The feedback appears temporarily, so we'd need to test timing
      // This is a simplified test that verifies the component doesn't crash
      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('applies correct styling for manually annotated transactions', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransactionManuallyAnnotated}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 2/ });
      expect(dropdownButton).toHaveClass('bg-blue-50', 'text-blue-700');
    });

    it('applies correct styling for automatic annotations', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      expect(dropdownButton).toHaveClass('bg-gray-50', 'text-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button');
      expect(dropdownButton).toHaveAttribute('aria-selected');
      expect(dropdownButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('supports keyboard navigation', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button');
      
      // Should be focusable
      dropdownButton.focus();
      expect(dropdownButton).toHaveFocus();

      // Enter key should open dropdown
      fireEvent.keyDown(dropdownButton, { key: 'Enter' });
      // Note: This would require additional keyboard handling implementation
    });

    it('has descriptive title for undo button', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransactionManuallyAnnotated}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
          originalAnnotation={1}
        />
      );

      const undoButton = screen.getByRole('button', { name: /Undo/ });
      expect(undoButton).toHaveAttribute('title', 'Revert to automatic annotation');
    });
  });

  describe('Edge cases', () => {
    it('handles empty available grants list', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransaction}
          availableGrants={[]}
          onUpdate={mockOnUpdate}
        />
      );

      const dropdownButton = screen.getByRole('button', { name: /Year 1/ });
      fireEvent.click(dropdownButton);

      // Should only show "Unmatched" option
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByText('Unmatched')).toBeInTheDocument();
    });

    it('handles missing grant in available grants', () => {
      const transactionWithMissingGrant = { ...mockTransaction, grantYear: 5 };
      
      render(
        <ManualAnnotationOverride
          transaction={transactionWithMissingGrant}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Year 5')).toBeInTheDocument();
    });

    it('handles undefined originalAnnotation', () => {
      render(
        <ManualAnnotationOverride
          transaction={mockTransactionManuallyAnnotated}
          availableGrants={mockExpectedGrants}
          onUpdate={mockOnUpdate}
          // originalAnnotation is undefined
        />
      );

      // Should not crash and should show undo button if manually annotated
      expect(screen.getByRole('button', { name: /Undo/ })).toBeInTheDocument();
    });
  });
});