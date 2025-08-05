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

// Real vesting scheme from the existing system
const bitcoinPioneerScheme: VestingScheme = {
  id: 'accelerator',
  name: 'Bitcoin Pioneer',
  description: 'Front-loaded Bitcoin allocation for early believers',
  initialGrant: 0.5,
  employeeMatchPercentage: 0,
  vestingSchedule: [
    {
      months: 6,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 25,
      description: '25% after 6 months'
    },
    {
      months: 12,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 50,
      description: '50% after 1 year'
    },
    {
      months: 18,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 75,
      description: '75% after 18 months'
    },
    {
      months: 24,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 100,
      description: '100% after 2 years'
    }
  ]
};

// Realistic historical price data
const realisticHistoricalPrices: Record<number, BitcoinYearlyPrices> = {
  2020: {
    year: 2020,
    high: 28994,
    low: 4106,
    average: 11111,
    open: 7179,
    close: 28994
  },
  2021: {
    year: 2021,
    high: 68789,
    low: 28994,
    average: 47686,
    open: 28994,
    close: 46306
  },
  2022: {
    year: 2022,
    high: 48086,
    low: 15460,
    average: 31717,
    open: 46306,
    close: 16547
  },
  2023: {
    year: 2023,
    high: 44700,
    low: 15460,
    average: 29234,
    open: 16547,
    close: 42258
  },
  2024: {
    year: 2024,
    high: 73750,
    low: 38505,
    average: 56127,
    open: 42258,
    close: 70000
  }
};

describe('Historical Calculator Store Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup realistic mock implementations
    mockHistoricalBitcoinAPI.getYearlyPrices.mockResolvedValue(realisticHistoricalPrices);
    mockBitcoinAPI.getCurrentPrice.mockResolvedValue({ price: 70000, change24h: 3.2 });
  });

  afterEach(() => {
    const { result } = renderHook(() => useHistoricalCalculatorStore());
    act(() => {
      result.current.resetCalculator();
    });
  });

  it('should perform complete historical calculation workflow', async () => {
    const { result } = renderHook(() => useHistoricalCalculatorStore());
    
    // Step 1: Set starting year (should trigger data fetch)
    await act(async () => {
      result.current.setStartingYear(2020);
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // Verify historical data was fetched
    expect(mockHistoricalBitcoinAPI.getYearlyPrices).toHaveBeenCalledWith(2020, expect.any(Number));
    expect(result.current.historicalPrices).toEqual(realisticHistoricalPrices);
    expect(result.current.isLoadingHistoricalData).toBe(false);
    expect(result.current.historicalDataError).toBeNull();
    
    // Step 2: Set cost basis method
    act(() => {
      result.current.setCostBasisMethod('average');
    });
    
    expect(result.current.costBasisMethod).toBe('average');
    
    // Step 3: Fetch current Bitcoin price
    await act(async () => {
      await result.current.fetchCurrentBitcoinPrice();
    });
    
    expect(result.current.currentBitcoinPrice).toBe(70000);
    
    // Step 4: Select scheme (should trigger calculation)
    await act(async () => {
      result.current.setSelectedScheme(bitcoinPioneerScheme);
      // Wait for calculation
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // Verify calculation results
    expect(result.current.selectedScheme).toEqual(bitcoinPioneerScheme);
    expect(result.current.historicalResults).not.toBeNull();
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.calculationError).toBeNull();
    
    const results = result.current.historicalResults!;
    
    // Verify result structure
    expect(results).toHaveProperty('timeline');
    expect(results).toHaveProperty('totalBitcoinGranted');
    expect(results).toHaveProperty('totalCostBasis');
    expect(results).toHaveProperty('currentTotalValue');
    expect(results).toHaveProperty('totalReturn');
    expect(results).toHaveProperty('annualizedReturn');
    expect(results).toHaveProperty('grantBreakdown');
    expect(results).toHaveProperty('summary');
    
    // Verify calculation logic
    expect(results.totalBitcoinGranted).toBe(0.5); // Only initial grant for Bitcoin Pioneer
    expect(results.totalCostBasis).toBe(0.5 * realisticHistoricalPrices[2020].average); // 0.5 * 11111
    expect(results.currentTotalValue).toBe(0.5 * 70000); // 0.5 * current price
    expect(results.totalReturn).toBe(results.currentTotalValue - results.totalCostBasis);
    
    // Verify timeline has data points
    expect(results.timeline.length).toBeGreaterThan(0);
    expect(results.timeline[0].year).toBe(2020);
    
    // Verify summary
    expect(results.summary.startingYear).toBe(2020);
    expect(results.summary.costBasisMethod).toBe('average');
    expect(results.summary.yearsAnalyzed).toBeGreaterThan(0);
  });

  it('should handle scheme customization in calculations', async () => {
    const { result } = renderHook(() => useHistoricalCalculatorStore());
    
    // Setup initial state
    await act(async () => {
      result.current.setStartingYear(2020);
      await new Promise(resolve => setTimeout(resolve, 200));
      await result.current.fetchCurrentBitcoinPrice();
    });
    
    // Customize the scheme
    const customization = { initialGrant: 1.0 }; // Double the initial grant
    
    await act(async () => {
      result.current.updateSchemeCustomization(bitcoinPioneerScheme.id, customization);
      result.current.setSelectedScheme(bitcoinPioneerScheme);
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // Verify customization was applied
    const effectiveScheme = result.current.getEffectiveScheme(bitcoinPioneerScheme);
    expect(effectiveScheme.initialGrant).toBe(1.0);
    
    // Verify calculation used customized values
    const results = result.current.historicalResults!;
    expect(results.totalBitcoinGranted).toBe(1.0); // Customized amount
    expect(results.totalCostBasis).toBe(1.0 * realisticHistoricalPrices[2020].average);
    expect(results.currentTotalValue).toBe(1.0 * 70000);
  });

  it('should handle different cost basis methods correctly', async () => {
    const { result } = renderHook(() => useHistoricalCalculatorStore());
    
    // Setup initial state
    await act(async () => {
      result.current.setStartingYear(2020);
      await new Promise(resolve => setTimeout(resolve, 200));
      await result.current.fetchCurrentBitcoinPrice();
      result.current.setSelectedScheme(bitcoinPioneerScheme);
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    const averageResults = result.current.historicalResults!;
    const averageCostBasis = averageResults.totalCostBasis;
    
    // Change to high cost basis method
    await act(async () => {
      result.current.setCostBasisMethod('high');
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    const highResults = result.current.historicalResults!;
    const highCostBasis = highResults.totalCostBasis;
    
    // Change to low cost basis method
    await act(async () => {
      result.current.setCostBasisMethod('low');
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    const lowResults = result.current.historicalResults!;
    const lowCostBasis = lowResults.totalCostBasis;
    
    // Verify different cost basis methods produce different results
    expect(highCostBasis).toBeGreaterThan(averageCostBasis);
    expect(averageCostBasis).toBeGreaterThan(lowCostBasis);
    
    // Verify the specific calculations
    const priceData = realisticHistoricalPrices[2020];
    expect(highCostBasis).toBe(0.5 * priceData.high);
    expect(lowCostBasis).toBe(0.5 * priceData.low);
  });

  it('should handle year changes and recalculate appropriately', async () => {
    const { result } = renderHook(() => useHistoricalCalculatorStore());
    
    // Start with 2020
    await act(async () => {
      result.current.setStartingYear(2020);
      await new Promise(resolve => setTimeout(resolve, 200));
      await result.current.fetchCurrentBitcoinPrice();
      result.current.setSelectedScheme(bitcoinPioneerScheme);
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    const results2020 = result.current.historicalResults!;
    
    // Change to 2021
    await act(async () => {
      result.current.setStartingYear(2021);
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    const results2021 = result.current.historicalResults!;
    
    // Verify different starting years produce different results
    expect(results2021.summary.startingYear).toBe(2021);
    expect(results2021.summary.yearsAnalyzed).toBeLessThan(results2020.summary.yearsAnalyzed);
    
    // Cost basis should be different due to different year prices
    expect(results2021.totalCostBasis).not.toBe(results2020.totalCostBasis);
    expect(results2021.totalCostBasis).toBe(0.5 * realisticHistoricalPrices[2021].average);
  });
});