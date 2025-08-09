import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoricalCalculatorPage from '../page';
import { useHistoricalCalculatorStore } from '@/stores/historicalCalculatorStore';

// Mock the historical calculator store
jest.mock('@/stores/historicalCalculatorStore');

const mockUseHistoricalCalculatorStore = useHistoricalCalculatorStore as jest.MockedFunction<typeof useHistoricalCalculatorStore>;

describe('Historical Calculator Page', () => {
  const mockSetStartingYear = jest.fn();
  const mockSetCostBasisMethod = jest.fn();
  const mockSetSelectedScheme = jest.fn();
  const mockFetchHistoricalData = jest.fn();
  const mockFetchCurrentBitcoinPrice = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseHistoricalCalculatorStore.mockReturnValue({
      selectedScheme: null,
      startingYear: 2020,
      costBasisMethod: 'average',
      schemeCustomizations: {},
      historicalPrices: {},
      currentBitcoinPrice: 45000,
      isLoadingHistoricalData: false,
      historicalDataError: null,
      historicalResults: null,
      isCalculating: false,
      calculationError: null,
      
      setStartingYear: mockSetStartingYear,
      setCostBasisMethod: mockSetCostBasisMethod,
      setSelectedScheme: mockSetSelectedScheme,
      updateSchemeCustomization: jest.fn(),
      fetchHistoricalData: mockFetchHistoricalData,
      fetchCurrentBitcoinPrice: mockFetchCurrentBitcoinPrice,
      resetCalculator: jest.fn(),
      getEffectiveScheme: jest.fn((scheme) => scheme),
    });
  });

  it('renders the historical calculator page', () => {
    render(<HistoricalCalculatorPage />);

    expect(screen.getByText('Historical Bitcoin Calculator')).toBeInTheDocument();
    expect(screen.getByText('Analyze how your vesting scheme would have performed using historical Bitcoin data')).toBeInTheDocument();
  });

  it('renders the YearSelector component', () => {
    render(<HistoricalCalculatorPage />);

    expect(screen.getByLabelText(/starting year/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
  });

  it('integrates YearSelector with the store', async () => {
    render(<HistoricalCalculatorPage />);

    const yearSelect = screen.getByLabelText(/starting year/i);
    fireEvent.change(yearSelect, { target: { value: '2019' } });

    expect(mockSetStartingYear).toHaveBeenCalledWith(2019);
  });

  it('renders cost basis method selector', () => {
    render(<HistoricalCalculatorPage />);

    const costBasisSelect = screen.getByDisplayValue('Yearly Average Price');
    expect(costBasisSelect).toBeInTheDocument();

    fireEvent.change(costBasisSelect, { target: { value: 'high' } });
    expect(mockSetCostBasisMethod).toHaveBeenCalledWith('high');
  });

  it('renders vesting scheme selection', () => {
    render(<HistoricalCalculatorPage />);

    expect(screen.getByText('Pioneer')).toBeInTheDocument();
    expect(screen.getByText('Dollar Cost Advantage')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
  });

  it('calls fetch functions on mount', () => {
    render(<HistoricalCalculatorPage />);

    expect(mockFetchCurrentBitcoinPrice).toHaveBeenCalled();
    expect(mockFetchHistoricalData).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    mockUseHistoricalCalculatorStore.mockReturnValue({
      ...mockUseHistoricalCalculatorStore(),
      isLoadingHistoricalData: true,
    });

    render(<HistoricalCalculatorPage />);

    expect(screen.getByText('Loading Historical Data')).toBeInTheDocument();
    expect(screen.getByText(/fetching bitcoin price data/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseHistoricalCalculatorStore.mockReturnValue({
      ...mockUseHistoricalCalculatorStore(),
      historicalDataError: 'Failed to fetch data',
    });

    render(<HistoricalCalculatorPage />);

    expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('disables inputs during loading', () => {
    mockUseHistoricalCalculatorStore.mockReturnValue({
      ...mockUseHistoricalCalculatorStore(),
      isLoadingHistoricalData: true,
    });

    render(<HistoricalCalculatorPage />);

    const yearSelect = screen.getByLabelText(/starting year/i);
    const costBasisSelect = screen.getByDisplayValue('Yearly Average Price');

    expect(yearSelect).toBeDisabled();
    expect(costBasisSelect).toBeDisabled();
  });

  it('shows empty state when no results', () => {
    render(<HistoricalCalculatorPage />);

    expect(screen.getByText('Ready to Analyze')).toBeInTheDocument();
    expect(screen.getByText('Select a vesting scheme to see how it would have performed historically')).toBeInTheDocument();
  });
});