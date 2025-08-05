import { act, renderHook } from '@testing-library/react';
import { useHistoricalCalculatorStore } from '../historicalCalculatorStore';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { VestingScheme, BitcoinYearlyPrices } from '@/types/vesting';

// Mock the APIs
jest.mock('@/lib/historical-bitcoin-api');
jest.mock('@/lib/bitcoin-api');

const mockHistoricalBitcoinAPI = HistoricalBitcoinAPI as jest.Mocked<typeof HistoricalBitcoinAPI>;
const mockBitcoinAPI = BitcoinAPI as jest.Mocked<typeof BitcoinAPI>;

// Mock vesting scheme for testing
const mockScheme: VestingScheme = {
  id: 'test-scheme',
  name: 'Test Scheme',
  description: 'Test scheme for unit tests',
  initialGrant: 0.1,
  employeeMatchPercentage: 0,
  annualGrant: 0.05,
  vestingSchedule: [
    {
      months: 12,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 25,
      description: '25% after 1 year'
    },
    {
      months: 24,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 50,
      description: '50% after 2 years'
    },
    {
      months: 36,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 75,
      description: '75% after 3 years'
    },
    {
      months: 48,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 100,
      description: '100% after 4 years'
    }
  ]
};

// Mock historical price data
const mockHistoricalPrices: Record<number, BitcoinYearlyPrices> = {
  2020: {
    year: 2020,
    high: 29000,
    low: 4000,
    average: 11000,
    open: 7200,
    close: 28994
  },
  2021: {
    year: 2021,
    high: 69000,
    low: 29000,
    average: 47000,
    open: 28994,
    close: 46306
  },
  2022: {
    year: 2022,
    high: 48000,
    low: 15500,
    average: 31000,
    open: 46306,
    close: 16547
  }
};

describe('useHistoricalCalculatorStore', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockHistoricalBitcoinAPI.getYearlyPrices.mockResolvedValue(mockHistoricalPrices);
    mockBitcoinAPI.getCurrentPrice.mockResolvedValue({ price: 45000, change24h: 2.5 });
  });

  afterEach(() => {
    // Reset store state after each test
    const { result } = renderHook(() => useHistoricalCalculatorStore());
    act(() => {
      result.current.resetCalculator();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      expect(result.current.selectedScheme).toBeNull();
      expect(result.current.startingYear).toBe(2020);
      expect(result.current.costBasisMethod).toBe('average');
      expect(result.current.schemeCustomizations).toEqual({});
      expect(result.current.historicalPrices).toEqual({});
      expect(result.current.currentBitcoinPrice).toBe(45000);
      expect(result.current.isLoadingHistoricalData).toBe(false);
      expect(result.current.historicalDataError).toBeNull();
      expect(result.current.historicalResults).toBeNull();
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.calculationError).toBeNull();
    });
  });

  describe('setStartingYear', () => {
    it('should update starting year and trigger data fetch', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      act(() => {
        result.current.setStartingYear(2021);
      });
      
      expect(result.current.startingYear).toBe(2021);
      
      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      
      expect(mockHistoricalBitcoinAPI.getYearlyPrices).toHaveBeenCalledWith(2021, expect.any(Number));
    });
  });

  describe('setCostBasisMethod', () => {
    it('should update cost basis method and trigger recalculation', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      act(() => {
        result.current.setCostBasisMethod('high');
      });
      
      expect(result.current.costBasisMethod).toBe('high');
    });
  });

  describe('setSelectedScheme', () => {
    it('should update selected scheme and trigger calculation', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      act(() => {
        result.current.setSelectedScheme(mockScheme);
      });
      
      expect(result.current.selectedScheme).toEqual(mockScheme);
    });
  });

  describe('updateSchemeCustomization', () => {
    it('should update scheme customization', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      const customization = { initialGrant: 0.2 };
      
      act(() => {
        result.current.updateSchemeCustomization('test-scheme', customization);
      });
      
      expect(result.current.schemeCustomizations['test-scheme']).toEqual(customization);
    });

    it('should merge multiple customizations for the same scheme', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      act(() => {
        result.current.updateSchemeCustomization('test-scheme', { initialGrant: 0.2 });
        result.current.updateSchemeCustomization('test-scheme', { annualGrant: 0.1 });
      });
      
      expect(result.current.schemeCustomizations['test-scheme']).toEqual({
        initialGrant: 0.2,
        annualGrant: 0.1
      });
    });
  });

  describe('fetchHistoricalData', () => {
    it('should fetch historical data successfully', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      await act(async () => {
        await result.current.fetchHistoricalData();
      });
      
      expect(result.current.isLoadingHistoricalData).toBe(false);
      expect(result.current.historicalPrices).toEqual(mockHistoricalPrices);
      expect(result.current.historicalDataError).toBeNull();
      expect(mockHistoricalBitcoinAPI.getYearlyPrices).toHaveBeenCalledWith(2020, expect.any(Number));
    });

    it('should handle fetch errors gracefully', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      const errorMessage = 'API Error';
      mockHistoricalBitcoinAPI.getYearlyPrices.mockRejectedValue(new Error(errorMessage));
      
      await act(async () => {
        await result.current.fetchHistoricalData();
      });
      
      expect(result.current.isLoadingHistoricalData).toBe(false);
      expect(result.current.historicalDataError).toBe(errorMessage);
      expect(result.current.historicalPrices).toEqual({});
    });

    it('should set loading state during fetch', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockHistoricalBitcoinAPI.getYearlyPrices.mockReturnValue(controlledPromise);
      
      // Start the fetch
      act(() => {
        result.current.fetchHistoricalData();
      });
      
      // Check loading state is true
      expect(result.current.isLoadingHistoricalData).toBe(true);
      
      // Resolve the promise
      await act(async () => {
        resolvePromise!(mockHistoricalPrices);
        await controlledPromise;
      });
      
      // Check loading state is false
      expect(result.current.isLoadingHistoricalData).toBe(false);
    });
  });

  describe('fetchCurrentBitcoinPrice', () => {
    it('should fetch current Bitcoin price successfully', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      await act(async () => {
        await result.current.fetchCurrentBitcoinPrice();
      });
      
      expect(result.current.currentBitcoinPrice).toBe(45000);
      expect(mockBitcoinAPI.getCurrentPrice).toHaveBeenCalled();
    });

    it('should handle price fetch errors gracefully', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      mockBitcoinAPI.getCurrentPrice.mockRejectedValue(new Error('Price API Error'));
      
      const originalPrice = result.current.currentBitcoinPrice;
      
      await act(async () => {
        await result.current.fetchCurrentBitcoinPrice();
      });
      
      // Should keep the original price on error
      expect(result.current.currentBitcoinPrice).toBe(originalPrice);
    });
  });

  describe('calculateHistoricalResults', () => {
    it('should not calculate without selected scheme', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      act(() => {
        result.current.calculateHistoricalResults();
      });
      
      expect(result.current.historicalResults).toBeNull();
      expect(result.current.calculationError).toBeNull();
    });

    it('should show error when no historical data available', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      act(() => {
        result.current.setSelectedScheme(mockScheme);
        result.current.calculateHistoricalResults();
      });
      
      expect(result.current.calculationError).toBe('Historical price data not available. Please try again.');
    });

    it('should show error when starting year data is missing', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      // Set historical prices but without the starting year
      await act(async () => {
        result.current.setSelectedScheme(mockScheme);
        result.current.setStartingYear(2019); // Year not in mock data
      });
      
      // Manually set some historical prices without the starting year
      act(() => {
        useHistoricalCalculatorStore.setState({ 
          historicalPrices: mockHistoricalPrices // This doesn't include 2019
        });
        result.current.calculateHistoricalResults();
      });
      
      expect(result.current.calculationError).toBe('No historical price data available for 2019. Please select a different year.');
    });
  });

  describe('getEffectiveScheme', () => {
    it('should return original scheme when no customizations', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      const effectiveScheme = result.current.getEffectiveScheme(mockScheme);
      
      expect(effectiveScheme).toEqual(mockScheme);
    });

    it('should apply customizations to scheme', () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      const customization = { initialGrant: 0.2, annualGrant: 0.1 };
      
      act(() => {
        result.current.updateSchemeCustomization(mockScheme.id, customization);
      });
      
      const effectiveScheme = result.current.getEffectiveScheme(mockScheme);
      
      expect(effectiveScheme).toEqual({
        ...mockScheme,
        ...customization
      });
    });
  });

  describe('resetCalculator', () => {
    it('should reset all state to initial values', async () => {
      const { result } = renderHook(() => useHistoricalCalculatorStore());
      
      // Modify state
      await act(async () => {
        result.current.setSelectedScheme(mockScheme);
        result.current.setStartingYear(2021);
        result.current.setCostBasisMethod('high');
        result.current.updateSchemeCustomization('test', { initialGrant: 0.5 });
        await result.current.fetchHistoricalData();
      });
      
      // Reset
      act(() => {
        result.current.resetCalculator();
      });
      
      // Check all values are reset
      expect(result.current.selectedScheme).toBeNull();
      expect(result.current.startingYear).toBe(2020);
      expect(result.current.costBasisMethod).toBe('average');
      expect(result.current.schemeCustomizations).toEqual({});
      expect(result.current.historicalPrices).toEqual({});
      expect(result.current.historicalResults).toBeNull();
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.calculationError).toBeNull();
      expect(result.current.historicalDataError).toBeNull();
      expect(result.current.isLoadingHistoricalData).toBe(false);
    });
  });
});