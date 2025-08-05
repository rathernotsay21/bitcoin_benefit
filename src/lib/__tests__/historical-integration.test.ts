import { HistoricalCalculator } from '../historical-calculations';
import { HistoricalBitcoinAPI } from '../historical-bitcoin-api';
import { VESTING_SCHEMES } from '../vesting-schemes';
import {
  HistoricalCalculationInputs,
  BitcoinYearlyPrices
} from '../../types/vesting';

// Mock the API to avoid actual network calls in tests
jest.mock('../historical-bitcoin-api');
const mockHistoricalBitcoinAPI = HistoricalBitcoinAPI as jest.Mocked<typeof HistoricalBitcoinAPI>;

describe('Historical Calculator Integration', () => {
  const mockPriceData: Record<number, BitcoinYearlyPrices> = {
    2020: {
      year: 2020,
      high: 29000,
      low: 3800,
      average: 11500,
      open: 7200,
      close: 28900
    },
    2021: {
      year: 2021,
      high: 69000,
      low: 28800,
      average: 47500,
      open: 28900,
      close: 46200
    },
    2022: {
      year: 2022,
      high: 48000,
      low: 15500,
      average: 31000,
      open: 46200,
      close: 16500
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHistoricalBitcoinAPI.getYearlyPrices.mockResolvedValue(mockPriceData);
  });

  it('should integrate with all three vesting schemes', async () => {
    // Test with each vesting scheme
    for (const scheme of VESTING_SCHEMES) {
      const inputs: HistoricalCalculationInputs = {
        scheme,
        startingYear: 2020,
        costBasisMethod: 'average',
        historicalPrices: mockPriceData,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Verify basic structure
      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('totalBitcoinGranted');
      expect(result).toHaveProperty('totalCostBasis');
      expect(result).toHaveProperty('currentTotalValue');
      expect(result).toHaveProperty('totalReturn');
      expect(result).toHaveProperty('grantBreakdown');
      expect(result).toHaveProperty('summary');

      // Verify calculations are reasonable
      expect(result.totalBitcoinGranted).toBeGreaterThanOrEqual(0);
      expect(result.totalCostBasis).toBeGreaterThanOrEqual(0);
      expect(result.currentTotalValue).toBeGreaterThanOrEqual(0);
      expect(result.timeline.length).toBeGreaterThan(0);

      // Verify scheme-specific behavior
      if (scheme.id === 'accelerator') {
        // Bitcoin Pioneer should only have initial grant
        expect(result.grantBreakdown.every(g => g.type === 'initial')).toBe(true);
        expect(result.summary.averageAnnualGrant).toBe(0);
      } else if (scheme.id === 'slow-burn') {
        // Wealth Builder should only have annual grants
        expect(result.grantBreakdown.every(g => g.type === 'annual')).toBe(true);
      } else if (scheme.id === 'steady-builder') {
        // Dollar Cost Advantage should have both
        const hasInitial = result.grantBreakdown.some(g => g.type === 'initial');
        const hasAnnual = result.grantBreakdown.some(g => g.type === 'annual');
        expect(hasInitial).toBe(true);
        expect(hasAnnual).toBe(true);
      }
    }
  });

  it('should work with different cost basis methods', () => {
    const baseInputs: HistoricalCalculationInputs = {
      scheme: VESTING_SCHEMES[1], // Dollar Cost Advantage
      startingYear: 2020,
      costBasisMethod: 'average',
      historicalPrices: mockPriceData,
      currentBitcoinPrice: 50000
    };

    const methods: Array<'high' | 'low' | 'average'> = ['high', 'low', 'average'];
    const results = methods.map(method => {
      const inputs = { ...baseInputs, costBasisMethod: method };
      return HistoricalCalculator.calculate(inputs);
    });

    // High cost basis should be highest, low should be lowest
    expect(results[0].totalCostBasis).toBeGreaterThan(results[1].totalCostBasis); // high > low
    expect(results[2].totalCostBasis).toBeGreaterThan(results[1].totalCostBasis); // average > low
    expect(results[0].totalCostBasis).toBeGreaterThan(results[2].totalCostBasis); // high > average

    // All should have same Bitcoin amounts and current values
    results.forEach(result => {
      expect(result.totalBitcoinGranted).toBe(results[0].totalBitcoinGranted);
      expect(result.currentTotalValue).toBe(results[0].currentTotalValue);
    });
  });

  it('should handle timeline generation correctly', () => {
    const inputs: HistoricalCalculationInputs = {
      scheme: VESTING_SCHEMES[0], // Bitcoin Pioneer
      startingYear: 2020,
      costBasisMethod: 'average',
      historicalPrices: mockPriceData,
      currentBitcoinPrice: 50000
    };

    const result = HistoricalCalculator.calculate(inputs);

    // Timeline should be chronologically ordered
    for (let i = 1; i < result.timeline.length; i++) {
      const prev = result.timeline[i - 1];
      const curr = result.timeline[i];
      
      const prevDate = prev.year * 12 + prev.month;
      const currDate = curr.year * 12 + curr.month;
      
      expect(currDate).toBeGreaterThanOrEqual(prevDate);
    }

    // Cumulative values should be non-decreasing
    for (let i = 1; i < result.timeline.length; i++) {
      const prev = result.timeline[i - 1];
      const curr = result.timeline[i];
      
      expect(curr.cumulativeBitcoin).toBeGreaterThanOrEqual(prev.cumulativeBitcoin);
      expect(curr.cumulativeCostBasis).toBeGreaterThanOrEqual(prev.cumulativeCostBasis);
    }

    // Vested amount should never exceed cumulative Bitcoin
    result.timeline.forEach(point => {
      expect(point.vestedAmount).toBeLessThanOrEqual(point.cumulativeBitcoin);
    });
  });

  it('should calculate returns correctly', () => {
    const inputs: HistoricalCalculationInputs = {
      scheme: VESTING_SCHEMES[0], // Bitcoin Pioneer
      startingYear: 2020,
      costBasisMethod: 'average',
      historicalPrices: mockPriceData,
      currentBitcoinPrice: 50000
    };

    const result = HistoricalCalculator.calculate(inputs);

    // Total return should equal current value minus cost basis
    const expectedReturn = result.currentTotalValue - result.totalCostBasis;
    expect(result.totalReturn).toBeCloseTo(expectedReturn, 2);

    // Annualized return should be reasonable
    if (result.summary.yearsAnalyzed > 0) {
      expect(result.annualizedReturn).toBeGreaterThan(-1); // Not less than -100%
      expect(result.annualizedReturn).toBeLessThan(10); // Not more than 1000%
    }
  });

  it('should handle edge case with minimal data', () => {
    const minimalPriceData: Record<number, BitcoinYearlyPrices> = {
      2023: {
        year: 2023,
        high: 44000,
        low: 16500,
        average: 30000,
        open: 16500,
        close: 42000
      }
    };

    const inputs: HistoricalCalculationInputs = {
      scheme: VESTING_SCHEMES[0], // Bitcoin Pioneer
      startingYear: 2023,
      costBasisMethod: 'average',
      historicalPrices: minimalPriceData,
      currentBitcoinPrice: 50000
    };

    const result = HistoricalCalculator.calculate(inputs);

    // Should still work with minimal data
    expect(result.timeline.length).toBeGreaterThan(0);
    expect(result.totalBitcoinGranted).toBe(0.02); // Initial grant only
    expect(result.grantBreakdown).toHaveLength(1);
    expect(result.summary.yearsAnalyzed).toBeLessThanOrEqual(2); // 2023 to current year
  });
});