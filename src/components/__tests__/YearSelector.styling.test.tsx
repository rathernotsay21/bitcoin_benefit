import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import YearSelector from '../YearSelector';

describe('YearSelector Styling', () => {
  it('uses consistent styling with existing calculator components', () => {
    render(
      <YearSelector
        selectedYear={2020}
        onYearChange={() => {}}
      />
    );

    const select = screen.getByLabelText(/starting year/i);
    
    // Should use the input-field class from globals.css (consistent with other form inputs)
    expect(select).toHaveClass('input-field');
  });

  it('applies error styling consistently', () => {
    render(
      <YearSelector
        selectedYear={2010} // Invalid year to trigger error state
        onYearChange={() => {}}
      />
    );

    const select = screen.getByLabelText(/starting year/i);
    
    // Should have red border for error state
    expect(select).toHaveClass('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
  });

  it('applies disabled styling consistently', () => {
    render(
      <YearSelector
        selectedYear={2020}
        onYearChange={() => {}}
        disabled={true}
      />
    );

    const select = screen.getByLabelText(/starting year/i);
    
    // Should have disabled styling
    expect(select).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('has proper spacing and layout', () => {
    const { container } = render(
      <YearSelector
        selectedYear={2020}
        onYearChange={() => {}}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    
    // Should have space-y-2 for vertical spacing
    expect(wrapper).toHaveClass('space-y-2');
  });

  it('uses consistent text styling', () => {
    render(
      <YearSelector
        selectedYear={2020}
        onYearChange={() => {}}
      />
    );

    const label = screen.getByText('Starting Year');
    const helperText = screen.getByText(/historical bitcoin data available/i);
    
    // Label should use consistent styling
    expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    
    // Helper text should use muted styling
    expect(helperText).toHaveClass('text-sm', 'text-gray-700');
  });

  it('error message uses consistent error styling', () => {
    render(
      <YearSelector
        selectedYear={2010} // Invalid year
        onYearChange={() => {}}
      />
    );

    const errorMessage = screen.getByRole('alert');
    
    // Should use consistent error text styling
    expect(errorMessage).toHaveClass('text-sm', 'text-red-600');
  });
});