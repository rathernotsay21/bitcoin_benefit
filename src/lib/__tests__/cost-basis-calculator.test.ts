import { CostBasisCalculator } from '../cost-basis-calculator';
import { BitcoinYearlyPrices, CostBasisMethod, GrantEvent } from '../../types/vesting';

describe('CostBasisCalculator', () => {
  // Mock historical price data
  const mockPrices2020: BitcoinYearlyPrices = {
    year: 2020,
    high: 29000,
    low: 3800,
    average: 11500,
    open: 7200,
    close: 28900
  };

  const mockPrices2021: BitcoinYearlyPrices = {
    year: 2021,
    high: 69000,
    low: 28800,
    average: 47500,
    open: 29000,
    close: 46200
  };

  const mockHistoricalPrices = {
    2020: mockPrices2020,
    2021: mockPrices2021
  };

  const mockGrants: GrantEvent[] = [
    { year: 2020, month: 1, amount: 1.0, type: 'initial' },
    { year: 2020, month: 6, amount: 0.5, type: 'annual' },
    { year: 2021, month: 1, amount: 0.5, type: 'annual' }
  ];

  describe('calculateYearlyCost', () => {
    it('should calculate cost using high price method', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        1.0,
        2020,
        mockPrices2020,
        'high'
      );
      expect(result).toBe(29000); // 1.0 BTC * $29,000
    });

    it('should calculate cost using low price method', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        1.0,
        2020,
        mockPrices2020,
        'low'
      );
      expect(result).toBe(3800); // 1.0 BTC * $3,800
    });

    it('should calculate cost using average price method', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        1.0,
        2020,
        mockPrices2020,
        'average'
      );
      expect(result).toBe(11500); // 1.0 BTC * $11,500
    });

    it('should calculate cost for fractional Bitcoin amounts', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        0.5,
        2020,
        mockPrices2020,
        'average'
      );
      expect(result).toBe(5750); // 0.5 BTC * $11,500
    });

    it('should handle zero amount', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        0,
        2020,
        mockPrices2020,
        'high'
      );
      expect(result).toBe(0);
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          -1,
          2020,
          mockPrices2020,
          'high'
        );
      }).toThrow('Invalid amount: -1. Amount must be a non-negative number.');
    });

    it('should throw error for invalid amount', () => {
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          NaN,
          2020,
          mockPrices2020,
          'high'
        );
      }).toThrow('Invalid amount: NaN. Amount must be a non-negative number.');
    });

    it('should throw error for invalid year', () => {
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          2008, // Before Bitcoin existed
          mockPrices2020,
          'high'
        );
      }).toThrow('Invalid year: 2008. Year must be between 2009 and');
    });

    it('should throw error for future year', () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          futureYear,
          mockPrices2020,
          'high'
        );
      }).toThrow(`Invalid year: ${futureYear}. Year must be between 2009 and`);
    });

    it('should throw error for year mismatch', () => {
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          2021, // Different year than price data
          mockPrices2020,
          'high'
        );
      }).toThrow('Price data year (2020) does not match requested year (2021)');
    });

    it('should throw error for invalid cost basis method', () => {
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          2020,
          mockPrices2020,
          'invalid' as CostBasisMethod
        );
      }).toThrow('Invalid cost basis method: invalid');
    });

    it('should throw error for invalid price data', () => {
      const invalidPrices = {
        ...mockPrices2020,
        high: -1000 // Invalid negative price
      };
      
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          2020,
          invalidPrices,
          'high'
        );
      }).toThrow('Invalid price values in historical data');
    });

    it('should throw error when low price is greater than high price', () => {
      const invalidPrices = {
        ...mockPrices2020,
        low: 30000,
        high: 20000 // High is less than low
      };
      
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          2020,
          invalidPrices,
          'high'
        );
      }).toThrow('Invalid price data: low price (30000) cannot be greater than high price (20000)');
    });

    it('should throw error when average price is outside low-high range', () => {
      const invalidPrices = {
        ...mockPrices2020,
        average: 50000 // Average is greater than high
      };
      
      expect(() => {
        CostBasisCalculator.calculateYearlyCost(
          1.0,
          2020,
          invalidPrices,
          'average'
        );
      }).toThrow('Invalid price data: average price (50000) must be between low (3800) and high (29000)');
    });
  });

  describe('getTotalCostBasis', () => {
    it('should calculate total cost basis for multiple grants', () => {
      const result = CostBasisCalculator.getTotalCostBasis(
        mockGrants,
        mockHistoricalPrices,
        'average'
      );
      
      // Expected: (1.0 * 11500) + (0.5 * 11500) + (0.5 * 47500) = 11500 + 5750 + 23750 = 41000
      expect(result).toBe(41000);
    });

    it('should calculate total cost basis using high prices', () => {
      const result = CostBasisCalculator.getTotalCostBasis(
        mockGrants,
        mockHistoricalPrices,
        'high'
      );
      
      // Expected: (1.0 * 29000) + (0.5 * 29000) + (0.5 * 69000) = 29000 + 14500 + 34500 = 78000
      expect(result).toBe(78000);
    });

    it('should calculate total cost basis using low prices', () => {
      const result = CostBasisCalculator.getTotalCostBasis(
        mockGrants,
        mockHistoricalPrices,
        'low'
      );
      
      // Expected: (1.0 * 3800) + (0.5 * 3800) + (0.5 * 28800) = 3800 + 1900 + 14400 = 20100
      expect(result).toBe(20100);
    });

    it('should handle empty grants array', () => {
      const result = CostBasisCalculator.getTotalCostBasis(
        [],
        mockHistoricalPrices,
        'average'
      );
      expect(result).toBe(0);
    });

    it('should throw error for missing historical price data', () => {
      const grantsWithMissingYear: GrantEvent[] = [
        { year: 2022, month: 1, amount: 1.0, type: 'initial' } // 2022 not in mock data
      ];

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          grantsWithMissingYear,
          mockHistoricalPrices,
          'average'
        );
      }).toThrow('No historical price data available for year 2022');
    });

    it('should throw error for invalid grants array', () => {
      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          'invalid' as any,
          mockHistoricalPrices,
          'average'
        );
      }).toThrow('Grants must be an array');
    });

    it('should throw error for invalid grant object', () => {
      const invalidGrants = [
        { year: 2020, month: 1, amount: 1.0, type: 'initial' },
        null // Invalid grant
      ];

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          invalidGrants as any,
          mockHistoricalPrices,
          'average'
        );
      }).toThrow('Invalid grant at index 1: must be an object');
    });

    it('should throw error for invalid grant month', () => {
      const invalidGrants: GrantEvent[] = [
        { year: 2020, month: 13, amount: 1.0, type: 'initial' } // Invalid month
      ];

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          invalidGrants,
          mockHistoricalPrices,
          'average'
        );
      }).toThrow('Invalid grant month at index 0: 13. Must be between 1 and 12.');
    });

    it('should throw error for invalid grant type', () => {
      const invalidGrants = [
        { year: 2020, month: 1, amount: 1.0, type: 'invalid' }
      ];

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          invalidGrants as any,
          mockHistoricalPrices,
          'average'
        );
      }).toThrow('Invalid grant type at index 0: invalid. Must be \'initial\' or \'annual\'.');
    });
  });

  describe('getCostBasisBreakdown', () => {
    it('should provide cost basis breakdown by year', () => {
      const result = CostBasisCalculator.getCostBasisBreakdown(
        mockGrants,
        mockHistoricalPrices,
        'average'
      );

      expect(result).toEqual({
        2020: {
          totalBitcoin: 1.5, // 1.0 + 0.5
          totalCost: 17250, // (1.0 * 11500) + (0.5 * 11500)
          grants: [
            { year: 2020, month: 1, amount: 1.0, type: 'initial' },
            { year: 2020, month: 6, amount: 0.5, type: 'annual' }
          ]
        },
        2021: {
          totalBitcoin: 0.5,
          totalCost: 23750, // 0.5 * 47500
          grants: [
            { year: 2021, month: 1, amount: 0.5, type: 'annual' }
          ]
        }
      });
    });

    it('should handle single year breakdown', () => {
      const singleYearGrants: GrantEvent[] = [
        { year: 2020, month: 1, amount: 1.0, type: 'initial' }
      ];

      const result = CostBasisCalculator.getCostBasisBreakdown(
        singleYearGrants,
        mockHistoricalPrices,
        'high'
      );

      expect(result).toEqual({
        2020: {
          totalBitcoin: 1.0,
          totalCost: 29000,
          grants: [
            { year: 2020, month: 1, amount: 1.0, type: 'initial' }
          ]
        }
      });
    });

    it('should handle empty grants array', () => {
      const result = CostBasisCalculator.getCostBasisBreakdown(
        [],
        mockHistoricalPrices,
        'average'
      );

      expect(result).toEqual({});
    });

    it('should throw error for missing historical price data', () => {
      const grantsWithMissingYear: GrantEvent[] = [
        { year: 2022, month: 1, amount: 1.0, type: 'initial' }
      ];

      expect(() => {
        CostBasisCalculator.getCostBasisBreakdown(
          grantsWithMissingYear,
          mockHistoricalPrices,
          'average'
        );
      }).toThrow('No historical price data available for year 2022');
    });
  });

  describe('validation methods', () => {
    it('should validate historical prices object structure', () => {
      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          mockGrants,
          null as any,
          'average'
        );
      }).toThrow('Historical prices must be an object');
    });

    it('should validate year keys in historical prices', () => {
      const invalidHistoricalPrices = {
        'invalid-year': mockPrices2020
      };

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          mockGrants,
          invalidHistoricalPrices as any,
          'average'
        );
      }).toThrow('Invalid year key in historical prices: invalid-year');
    });

    it('should validate year consistency in historical prices', () => {
      const inconsistentPrices = {
        2020: { ...mockPrices2020, year: 2019 } // Year mismatch
      };

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          mockGrants,
          inconsistentPrices,
          'average'
        );
      }).toThrow('Year mismatch in historical prices: key is 2020 but data year is 2019');
    });

    it('should validate missing required fields in price data', () => {
      const incompletePrices = {
        2020: {
          year: 2020,
          high: 29000,
          low: 3800
          // Missing average, open, close
        }
      };

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          mockGrants,
          incompletePrices as any,
          'average'
        );
      }).toThrow('Missing required field in prices: average');
    });

    it('should validate price values are positive numbers', () => {
      const invalidPrices = {
        2020: {
          ...mockPrices2020,
          high: 0 // Invalid zero price
        }
      };

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          mockGrants,
          invalidPrices,
          'high'
        );
      }).toThrow('Invalid price values in historical data');
    });

    it('should validate price values are finite', () => {
      const invalidPrices = {
        2020: {
          ...mockPrices2020,
          average: Infinity // Invalid infinite price
        }
      };

      expect(() => {
        CostBasisCalculator.getTotalCostBasis(
          mockGrants,
          invalidPrices,
          'average'
        );
      }).toThrow('Invalid price values in historical data');
    });
  });

  describe('edge cases', () => {
    it('should handle very small Bitcoin amounts', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        0.00000001, // 1 satoshi
        2020,
        mockPrices2020,
        'average'
      );
      expect(result).toBe(0.00000001 * 11500);
    });

    it('should handle very large Bitcoin amounts', () => {
      const result = CostBasisCalculator.calculateYearlyCost(
        1000000, // 1 million BTC
        2020,
        mockPrices2020,
        'average'
      );
      expect(result).toBe(1000000 * 11500);
    });

    it('should handle current year', () => {
      const currentYear = new Date().getFullYear();
      const currentYearPrices = {
        ...mockPrices2020,
        year: currentYear
      };

      const result = CostBasisCalculator.calculateYearlyCost(
        1.0,
        currentYear,
        currentYearPrices,
        'average'
      );
      expect(result).toBe(11500);
    });

    it('should handle Bitcoin genesis year (2009)', () => {
      const genesisPrices = {
        year: 2009,
        high: 0.1,
        low: 0.001,
        average: 0.05,
        open: 0.001,
        close: 0.1
      };

      const result = CostBasisCalculator.calculateYearlyCost(
        1.0,
        2009,
        genesisPrices,
        'average'
      );
      expect(result).toBe(0.05);
    });
  });
});