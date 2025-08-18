import { HistoricalCalculator } from '../historical-calculations';
import {
  HistoricalCalculationInputs,
  VestingScheme,
  BitcoinYearlyPrices,
  CostBasisMethod
} from '../../types/vesting';

// Mock data for testing
const currentYear = new Date().getFullYear();
const mockHistoricalPrices: Record<number, BitcoinYearlyPrices> = {
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
  },
  2023: {
    year: 2023,
    high: 44000,
    low: 16500,
    average: 30000,
    open: 16500,
    close: 42000
  },
  [currentYear]: {
    year: currentYear,
    high: 50000,
    low: 35000,
    average: 42500,
    open: 42000,
    close: 48000
  }
};

const mockBitcoinPioneerScheme: VestingScheme = {
  id: 'accelerator',
  name: 'Pioneer',
  description: 'Test scheme',
  initialGrant: 0.02,
  employeeMatchPercentage: 0,
  vestingSchedule: [
    {
      months: 0,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 0,
      description: 'Immediate access'
    },
    {
      months: 60,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 50,
      description: '50% vested at 5 years'
    },
    {
      months: 120,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 100,
      description: '100% vested at 10 years'
    }
  ]
};

const mockDollarCostAdvantageScheme: VestingScheme = {
  id: 'steady-builder',
  name: 'Stacker',
  description: 'Test scheme',
  initialGrant: 0.015,
  employeeMatchPercentage: 0,
  annualGrant: 0.001,
  vestingSchedule: [
    {
      months: 0,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 0,
      description: 'Immediate access'
    },
    {
      months: 60,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 50,
      description: '50% vested at 5 years'
    },
    {
      months: 120,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 100,
      description: '100% vested at 10 years'
    }
  ]
};

const mockWealthBuilderScheme: VestingScheme = {
  id: 'slow-burn',
  name: 'Builder',
  description: 'Test scheme',
  initialGrant: 0.002,
  employeeMatchPercentage: 0,
  annualGrant: 0.002,
  maxAnnualGrants: 9,
  vestingSchedule: [
    {
      months: 0,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 0,
      description: 'Immediate access'
    },
    {
      months: 60,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 50,
      description: '50% vested at 5 years'
    },
    {
      months: 120,
      employeeContributionPercent: 100,
      employerContributionPercent: 0,
      grantPercent: 100,
      description: '100% vested at 10 years'
    }
  ]
};

describe('HistoricalCalculator', () => {
  describe('calculate', () => {
    it('should calculate historical results for Pioneer scheme', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockBitcoinPioneerScheme,
        startingYear: 2020,
        costBasisMethod: 'average',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Verify basic structure
      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('totalBitcoinGranted');
      expect(result).toHaveProperty('totalCostBasis');
      expect(result).toHaveProperty('currentTotalValue');
      expect(result).toHaveProperty('totalReturn');
      expect(result).toHaveProperty('annualizedReturn');
      expect(result).toHaveProperty('grantBreakdown');
      expect(result).toHaveProperty('summary');

      // Verify calculations for Pioneer (only initial grant)
      expect(result.totalBitcoinGranted).toBe(0.02);
      expect(result.totalCostBasis).toBe(0.02 * 11500); // 0.02 BTC * $11,500 average price in 2020
      expect(result.currentTotalValue).toBe(0.02 * 50000); // 0.02 BTC * $50,000 current price
      expect(result.totalReturn).toBe(result.currentTotalValue - result.totalCostBasis);

      // Verify grant breakdown
      expect(result.grantBreakdown).toHaveLength(1);
      expect(result.grantBreakdown[0]).toEqual({
        year: 2020,
        month: 1,
        amount: 0.02,
        type: 'initial'
      });

      // Verify summary
      expect(result.summary.startingYear).toBe(2020);
      expect(result.summary.costBasisMethod).toBe('average');
      expect(result.summary.averageAnnualGrant).toBe(0); // No annual grants for Pioneer
    });

    it('should calculate historical results for Stacker scheme', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockDollarCostAdvantageScheme,
        startingYear: 2020,
        costBasisMethod: 'low',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 45000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Count actual annual grant years (limited to 5 years for steady-builder)
      const annualGrantYears = [];
      const maxGrantYear = Math.min(2020 + 5, currentYear); // 5 year limit for Dollar Cost Advantage
      for (let year = 2021; year <= maxGrantYear; year++) {
        if (mockHistoricalPrices[year]) {
          annualGrantYears.push(year);
        }
      }
      
      const expectedTotalBitcoin = 0.015 + (0.001 * annualGrantYears.length);
      expect(result.totalBitcoinGranted).toBeCloseTo(expectedTotalBitcoin, 10);

      // Verify cost basis calculation using low prices
      let expectedCostBasis = 0.015 * 3800; // Initial grant in 2020 at low price
      
      // Add annual grants based on actual years
      for (const year of annualGrantYears) {
        expectedCostBasis += 0.001 * mockHistoricalPrices[year].low;
      }
      
      expect(result.totalCostBasis).toBe(expectedCostBasis);

      // Verify grant breakdown
      expect(result.grantBreakdown).toHaveLength(1 + annualGrantYears.length);
      expect(result.grantBreakdown[0].type).toBe('initial');
      expect(result.grantBreakdown.slice(1).every(g => g.type === 'annual')).toBe(true);

      // Verify average annual grant
      expect(result.summary.averageAnnualGrant).toBe(annualGrantYears.length > 0 ? 0.001 : 0);
    });

    it('should calculate historical results for Builder scheme', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockWealthBuilderScheme,
        startingYear: 2021,
        costBasisMethod: 'high',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 40000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Should have initial grant plus annual grants
      // Count actual years from 2022 to current year (annual grants start year after initial)
      const annualGrantYears = [];
      for (let year = 2022; year <= currentYear; year++) {
        if (mockHistoricalPrices[year]) {
          annualGrantYears.push(year);
        }
      }
      
      // Total = initial grant + annual grants (limited by maxAnnualGrants)
      const maxAnnualGrants = Math.min(annualGrantYears.length, 9); // Builder scheme has maxAnnualGrants: 9
      const expectedTotalBitcoin = 0.002 + (0.002 * maxAnnualGrants);
      expect(result.totalBitcoinGranted).toBe(expectedTotalBitcoin);

      // Verify cost basis calculation using high prices
      let expectedCostBasis = 0.002 * mockHistoricalPrices[2021].high; // Initial grant cost
      for (let i = 0; i < maxAnnualGrants; i++) {
        const year = annualGrantYears[i];
        expectedCostBasis += 0.002 * mockHistoricalPrices[year].high;
      }
      expect(result.totalCostBasis).toBe(expectedCostBasis);

      // Verify we have both initial and annual grants
      const hasInitialGrant = result.grantBreakdown.some(g => g.type === 'initial');
      const hasAnnualGrants = result.grantBreakdown.some(g => g.type === 'annual');
      expect(hasInitialGrant).toBe(true);
      expect(hasAnnualGrants).toBe(true);
    });

    it('should generate correct timeline with vesting progression', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockBitcoinPioneerScheme,
        startingYear: 2020,
        costBasisMethod: 'average',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Timeline should have entries for each month from 2020 to current
      expect(result.timeline.length).toBeGreaterThan(0);

      // First timeline point should have the initial grant
      const firstPoint = result.timeline[0];
      expect(firstPoint.year).toBe(2020);
      expect(firstPoint.month).toBe(1);
      expect(firstPoint.cumulativeBitcoin).toBe(0.02);
      expect(firstPoint.grants).toHaveLength(1);

      // Verify vesting progression
      const monthsElapsed60 = result.timeline.find(p => 
        (p.year - 2020) * 12 + (p.month - 1) >= 60
      );
      if (monthsElapsed60) {
        // After 60 months, should be 50% vested
        expect(monthsElapsed60.vestedAmount).toBe(0.02 * 0.5);
      }

      // All timeline points should have consistent cumulative values
      result.timeline.forEach(point => {
        expect(point.cumulativeBitcoin).toBeGreaterThanOrEqual(0);
        expect(point.cumulativeCostBasis).toBeGreaterThanOrEqual(0);
        expect(point.currentValue).toBe(point.cumulativeBitcoin * 50000);
        expect(point.vestedAmount).toBeLessThanOrEqual(point.cumulativeBitcoin);
      });
    });

    it('should calculate annualized return correctly', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockBitcoinPioneerScheme,
        startingYear: 2020,
        costBasisMethod: 'average',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      const currentYear = new Date().getFullYear();
      const yearsElapsed = currentYear - 2020;
      
      if (yearsElapsed > 0) {
        const expectedAnnualizedReturn = Math.pow(
          result.currentTotalValue / result.totalCostBasis,
          1 / yearsElapsed
        ) - 1;
        
        expect(result.annualizedReturn).toBeCloseTo(expectedAnnualizedReturn, 6);
      } else {
        expect(result.annualizedReturn).toBe(0);
      }
    });
  });

  describe('input validation', () => {
    const validInputs: HistoricalCalculationInputs = {
      scheme: mockBitcoinPioneerScheme,
      startingYear: 2020,
      costBasisMethod: 'average',
      historicalPrices: mockHistoricalPrices,
      currentBitcoinPrice: 50000
    };

    it('should throw error for invalid inputs object', () => {
      expect(() => {
        HistoricalCalculator.calculate(null as any);
      }).toThrow('Invalid inputs: must be an object');
    });

    it('should throw error for invalid scheme', () => {
      const inputs = { ...validInputs, scheme: null };
      expect(() => {
        HistoricalCalculator.calculate(inputs as any);
      }).toThrow('Invalid scheme: must be a valid VestingScheme object');
    });

    it('should throw error for invalid starting year', () => {
      const inputs = { ...validInputs, startingYear: 2008 };
      expect(() => {
        HistoricalCalculator.calculate(inputs);
      }).toThrow('Invalid starting year: 2008. Must be a number >= 2009.');
    });

    it('should throw error for future starting year', () => {
      const futureYear = new Date().getFullYear() + 1;
      const inputs = { ...validInputs, startingYear: futureYear };
      expect(() => {
        HistoricalCalculator.calculate(inputs);
      }).toThrow(`Invalid starting year: ${futureYear}. Cannot be in the future.`);
    });

    it('should throw error for invalid cost basis method', () => {
      const inputs = { ...validInputs, costBasisMethod: 'invalid' as CostBasisMethod };
      expect(() => {
        HistoricalCalculator.calculate(inputs);
      }).toThrow('Invalid cost basis method: invalid. Must be one of: high, low, average');
    });

    it('should throw error for invalid historical prices', () => {
      const inputs = { ...validInputs, historicalPrices: null };
      expect(() => {
        HistoricalCalculator.calculate(inputs as any);
      }).toThrow('Invalid historical prices: must be an object');
    });

    it('should throw error for invalid current Bitcoin price', () => {
      const inputs = { ...validInputs, currentBitcoinPrice: -1000 };
      expect(() => {
        HistoricalCalculator.calculate(inputs);
      }).toThrow('Invalid current Bitcoin price: -1000. Must be a positive number.');
    });

    it('should throw error when missing price data for starting year', () => {
      const inputs = { 
        ...validInputs, 
        startingYear: 2019,
        historicalPrices: mockHistoricalPrices // doesn't include 2019
      };
      expect(() => {
        HistoricalCalculator.calculate(inputs);
      }).toThrow('No historical price data available for starting year: 2019');
    });
  });

  describe('edge cases', () => {
    it('should handle scheme with zero initial grant', () => {
      const zeroInitialGrantScheme: VestingScheme = {
        ...mockWealthBuilderScheme,
        initialGrant: 0.0
      };
      
      const inputs: HistoricalCalculationInputs = {
        scheme: zeroInitialGrantScheme,
        startingYear: 2022,
        costBasisMethod: 'average',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Should only have annual grants
      expect(result.grantBreakdown.every(g => g.type === 'annual')).toBe(true);
      
      // Count grants from 2023 to current year (only where we have price data)
      const annualGrantYears = [];
      for (let year = 2023; year <= currentYear; year++) {
        if (mockHistoricalPrices[year]) {
          annualGrantYears.push(year);
        }
      }
      expect(result.totalBitcoinGranted).toBeCloseTo(0.002 * annualGrantYears.length, 10);
    });

    it('should handle scheme with zero annual grant', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockBitcoinPioneerScheme,
        startingYear: 2020,
        costBasisMethod: 'average',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Should only have initial grant
      expect(result.grantBreakdown).toHaveLength(1);
      expect(result.grantBreakdown[0].type).toBe('initial');
      expect(result.summary.averageAnnualGrant).toBe(0);
    });

    it('should handle starting year equal to current year', () => {
      const currentYear = new Date().getFullYear();
      const inputs: HistoricalCalculationInputs = {
        scheme: mockBitcoinPioneerScheme,
        startingYear: currentYear,
        costBasisMethod: 'average',
        historicalPrices: {
          ...mockHistoricalPrices,
          [currentYear]: {
            year: currentYear,
            high: 60000,
            low: 40000,
            average: 50000,
            open: 45000,
            close: 55000
          }
        },
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      expect(result.summary.yearsAnalyzed).toBe(0);
      expect(result.annualizedReturn).toBe(0);
      expect(result.timeline.length).toBeGreaterThan(0);
    });
  });

  describe('vesting calculations', () => {
    it('should calculate correct vesting amounts over time', () => {
      const inputs: HistoricalCalculationInputs = {
        scheme: mockBitcoinPioneerScheme,
        startingYear: 2020,
        costBasisMethod: 'average',
        historicalPrices: mockHistoricalPrices,
        currentBitcoinPrice: 50000
      };

      const result = HistoricalCalculator.calculate(inputs);

      // Find timeline points at key vesting milestones
      const initialPoint = result.timeline[0];
      expect(initialPoint.vestedAmount).toBe(0); // 0% vested initially

      // Find point after 60 months (5 years)
      const fiveYearPoint = result.timeline.find(p => 
        (p.year - 2020) * 12 + (p.month - 1) >= 60
      );
      if (fiveYearPoint) {
        expect(fiveYearPoint.vestedAmount).toBe(0.02 * 0.5); // 50% vested
      }

      // Find point after 120 months (10 years) - may not exist if current date is before then
      const tenYearPoint = result.timeline.find(p => 
        (p.year - 2020) * 12 + (p.month - 1) >= 120
      );
      if (tenYearPoint) {
        expect(tenYearPoint.vestedAmount).toBe(0.02 * 1.0); // 100% vested
      }
    });
  });
});