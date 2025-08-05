import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YearSelector from '../YearSelector';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';

// Mock the historical calculator store
jest.mock('@/stores/historicalCalculatorStore');

const mockUseHistoricalCalculatorStore = useHistoricalCalculatorStore as jest.MockedFunction<typeof useHistoricalCalculatorStore>;

describe('YearSelector Integration', () => {
  const mockSetStartingYear = jest.fn();
  
  beforeEach(() => {
    mockSetStartingYear.mockClear();
    
    // Mock the store state and actions
    mockUseHistoricalCalculatorStore.mockReturnValue({
      startingYear: 2020,
      setStartingYear: mockSetStartingYear,
      // Mock other required store properties
      selectedScheme: null,
      costBasisMethod: 'average',
      schemeCustomizations: {},
      historicalPrices: {},
      currentBitcoinPrice: 45000,
      isLoadingHistoricalData: false,
      historicalDataError: null,
      historicalResults: null,
      isCalculating: false,
      calculationError: null,
      setCostBasisMethod: jest.fn(),
      setSelectedScheme: jest.fn(),
      updateSchemeCustomization: jest.fn(),
      fetchHistoricalData: jest.fn(),
      fetchCurrentBitcoinPrice: jest.fn(),
      calculateHistoricalResults: jest.fn(),
      resetCalculator: jest.fn(),
      getEffectiveScheme: jest.fn(),
    });
  });

  it('integrates with historical calculator store', async () => {
    const TestComponent = () => {
      const { startingYear, setStartingYear } = useHistoricalCalculatorStore();
      
      return (
        <YearSelector
          selectedYear={startingYear}
          onYearChange={setStartingYear}
        />
      );
    };

    render(<TestComponent />);

    // Verify initial state
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();

    // Change year
    const select = screen.getByLabelText(/starting year/i);
    fireEvent.change(select, { target: { value: '2019' } });

    // Verify store action was called
    expect(mockSetStartingYear).toHaveBeenCalledWith(2019);
  });

  it('handles store state changes', () => {
    // First render with 2020
    const { rerender } = render(
      <YearSelector
        selectedYear={2020}
        onYearChange={mockSetStartingYear}
      />
    );

    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();

    // Simulate store state change to 2018
    rerender(
      <YearSelector
        selectedYear={2018}
        onYearChange={mockSetStartingYear}
      />
    );

    expect(screen.getByDisplayValue('2018')).toBeInTheDocument();
  });

  it('works with loading state', () => {
    render(
      <YearSelector
        selectedYear={2020}
        onYearChange={mockSetStartingYear}
        disabled={true} // Simulate loading state
      />
    );

    const select = screen.getByLabelText(/starting year/i);
    expect(select).toBeDisabled();
    expect(select).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('validates years within Bitcoin history range', async () => {
    render(
      <YearSelector
        selectedYear={2008} // Before Bitcoin existed
        onYearChange={mockSetStartingYear}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Year must be between 2015 and');
    });
  });

  it('provides appropriate year range for Bitcoin historical data', () => {
    render(
      <YearSelector
        selectedYear={2020}
        onYearChange={mockSetStartingYear}
      />
    );

    const select = screen.getByLabelText(/starting year/i);
    const options = Array.from(select.querySelectorAll('option')).slice(1); // Skip placeholder

    // Should include years from current year down to 2015
    const currentYear = new Date().getFullYear();
    const expectedYearCount = currentYear - 2015 + 1;
    
    expect(options).toHaveLength(expectedYearCount);
    expect(options[0]).toHaveValue(currentYear.toString());
    expect(options[options.length - 1]).toHaveValue('2015');
  });
});