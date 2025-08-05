import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YearSelector from '../YearSelector';

describe('YearSelector', () => {
  const mockOnYearChange = jest.fn();
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    mockOnYearChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
        />
      );

      expect(screen.getByLabelText(/starting year/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
      expect(screen.getByText(/historical bitcoin data available/i)).toBeInTheDocument();
    });

    it('renders with custom min and max years', () => {
      render(
        <YearSelector
          selectedYear={2018}
          onYearChange={mockOnYearChange}
          minYear={2016}
          maxYear={2022}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      const options = select.querySelectorAll('option');
      
      // Should have placeholder + years from 2022 down to 2016 (7 years + 1 placeholder = 8 options)
      expect(options).toHaveLength(8);
      
      // Check that years are in descending order (most recent first)
      expect(options[1]).toHaveValue('2022');
      expect(options[7]).toHaveValue('2016');
      
      expect(screen.getByText('Historical Bitcoin data available from 2016 to 2022')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Year Selection', () => {
    it('calls onYearChange when a year is selected', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      fireEvent.change(select, { target: { value: '2019' } });

      expect(mockOnYearChange).toHaveBeenCalledWith(2019);
    });

    it('handles invalid year input gracefully', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      fireEvent.change(select, { target: { value: 'invalid' } });

      // Should not call onYearChange with invalid input
      expect(mockOnYearChange).not.toHaveBeenCalled();
    });

    it('displays all years in descending order', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          minYear={2018}
          maxYear={2021}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      const options = Array.from(select.querySelectorAll('option')).slice(1); // Skip placeholder

      expect(options[0]).toHaveValue('2021');
      expect(options[1]).toHaveValue('2020');
      expect(options[2]).toHaveValue('2019');
      expect(options[3]).toHaveValue('2018');
    });
  });

  describe('Validation', () => {
    it('shows error for year below minimum', async () => {
      render(
        <YearSelector
          selectedYear={2010} // Below default minimum of 2015
          onYearChange={mockOnYearChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Year must be between 2015 and');
      });

      const select = screen.getByLabelText(/starting year/i);
      expect(select).toHaveClass('border-red-500');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows error for year above maximum', async () => {
      const futureYear = currentYear + 5;
      render(
        <YearSelector
          selectedYear={futureYear}
          onYearChange={mockOnYearChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(`Year must be between 2015 and ${currentYear}`);
      });

      const select = screen.getByLabelText(/starting year/i);
      expect(select).toHaveClass('border-red-500');
    });

    it('shows valid state for year within range', async () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
        />
      );

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      const select = screen.getByLabelText(/starting year/i);
      expect(select).not.toHaveClass('border-red-500');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('validates with custom min/max years', async () => {
      render(
        <YearSelector
          selectedYear={2014} // Below custom minimum
          onYearChange={mockOnYearChange}
          minYear={2016}
          maxYear={2022}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Year must be between 2016 and 2022');
      });
    });
  });

  describe('Disabled State', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          disabled={true}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      expect(select).toBeDisabled();
      expect(select).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });

    it('does not call onYearChange when disabled', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          disabled={true}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      fireEvent.change(select, { target: { value: '2019' } });

      expect(mockOnYearChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      expect(select).toHaveAttribute('aria-label', 'Select starting year for historical analysis');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('associates error message with select when invalid', async () => {
      render(
        <YearSelector
          selectedYear={2010} // Invalid year
          onYearChange={mockOnYearChange}
        />
      );

      await waitFor(() => {
        const select = screen.getByLabelText(/starting year/i);
        const errorMessage = screen.getByRole('alert');
        
        expect(select).toHaveAttribute('aria-invalid', 'true');
        expect(select).toHaveAttribute('aria-describedby', 'year-error');
        expect(errorMessage).toHaveAttribute('id', 'year-error');
      });
    });

    it('has proper label association', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
        />
      );

      const label = screen.getByText('Starting Year');
      const select = screen.getByLabelText(/starting year/i);
      
      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles same min and max year', () => {
      render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          minYear={2020}
          maxYear={2020}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      const options = select.querySelectorAll('option');
      
      // Should have placeholder + 1 year option
      expect(options).toHaveLength(2);
      expect(options[1]).toHaveValue('2020');
    });

    it('handles current year as default max', () => {
      render(
        <YearSelector
          selectedYear={currentYear}
          onYearChange={mockOnYearChange}
        />
      );

      const select = screen.getByLabelText(/starting year/i);
      const firstYearOption = select.querySelector('option[value]:not([value=""])');
      
      expect(firstYearOption).toHaveValue(currentYear.toString());
    });

    it('updates validation when props change', async () => {
      const { rerender } = render(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          minYear={2015}
          maxYear={2025}
        />
      );

      // Initially valid
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Change max year to make current selection invalid
      rerender(
        <YearSelector
          selectedYear={2020}
          onYearChange={mockOnYearChange}
          minYear={2015}
          maxYear={2019}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Year must be between 2015 and 2019');
      });
    });
  });
});