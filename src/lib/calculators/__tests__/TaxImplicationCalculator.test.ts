import { TaxImplicationCalculator } from '../TaxImplicationCalculator';

describe('TaxImplicationCalculator', () => {
  let calculator: TaxImplicationCalculator;

  beforeEach(() => {
    calculator = new TaxImplicationCalculator();
  });

  describe('calculateIncomeTax', () => {
    it('should calculate tax for low income correctly', () => {
      const tax = calculator.calculateIncomeTax(10000);
      expect(tax).toBe(1000); // 10% of $10,000
    });

    it('should handle multiple tax brackets', () => {
      const tax = calculator.calculateIncomeTax(50000);
      // $11,000 * 10% + ($44,725 - $11,000) * 12% + ($50,000 - $44,725) * 22%
      // = $1,100 + $4,047 + $1,160.50 = $6,307.50
      expect(tax).toBeCloseTo(6307.50, 2);
    });

    it('should calculate tax for high income', () => {
      const tax = calculator.calculateIncomeTax(600000);
      // Complex calculation through all brackets
      expect(tax).toBeGreaterThan(150000);
      expect(tax).toBeLessThan(225000);
    });
  });

  describe('calculateCapitalGainsTax', () => {
    it('should apply short-term rate for holdings < 12 months', () => {
      const tax = calculator.calculateCapitalGainsTax(10000, false, 100000);
      expect(tax).toBe(3700); // 37% of $10,000
    });

    it('should apply 0% long-term rate for low income', () => {
      const tax = calculator.calculateCapitalGainsTax(10000, true, 40000);
      expect(tax).toBe(0);
    });

    it('should apply 15% long-term rate for medium income', () => {
      const tax = calculator.calculateCapitalGainsTax(10000, true, 100000);
      expect(tax).toBe(1500); // 15% of $10,000
    });

    it('should apply 20% long-term rate for high income', () => {
      const tax = calculator.calculateCapitalGainsTax(10000, true, 500000);
      expect(tax).toBe(2000); // 20% of $10,000
    });
  });

  describe('calculateVestingTax', () => {
    it('should calculate total tax implications correctly', () => {
      const result = calculator.calculateVestingTax(
        100000, // $100k vested value
        20000,  // $20k cost basis
        24,     // 2 years (long-term)
        80000   // $80k annual income
      );

      expect(result.grossValue).toBe(100000);
      expect(result.taxableIncome).toBe(100000);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.capitalGainsTax).toBeGreaterThan(0);
      expect(result.netValue).toBeLessThan(100000);
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeLessThan(50);
    });

    it('should handle zero cost basis', () => {
      const result = calculator.calculateVestingTax(
        50000,  // $50k vested value
        0,      // Zero cost basis
        12,     // 1 year
        60000   // $60k income
      );

      expect(result.capitalGainsTax).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(result.incomeTax);
    });
  });

  describe('calculateWithdrawalStrategy', () => {
    it('should spread withdrawals over specified years', () => {
      const strategy = calculator.calculateWithdrawalStrategy(
        500000, // $500k total value
        5,      // 5 years
        100000  // $100k annual income
      );

      expect(strategy).toHaveLength(5);
      
      strategy.forEach(year => {
        expect(year.withdrawalAmount).toBe(100000);
        expect(year.tax).toBe(15000); // 15% long-term capital gains
        expect(year.netAmount).toBe(85000);
      });
    });

    it('should handle single-year withdrawal', () => {
      const strategy = calculator.calculateWithdrawalStrategy(100000, 1, 80000);
      
      expect(strategy).toHaveLength(1);
      expect(strategy[0].withdrawalAmount).toBe(100000);
    });
  });

  describe('compareVestingSchedules', () => {
    it('should compare tax efficiency of different schedules', () => {
      const schedules = [
        {
          name: 'Front-loaded',
          vestedAmounts: [
            { month: 12, value: 100000 },
            { month: 24, value: 0 }
          ]
        },
        {
          name: 'Spread-out',
          vestedAmounts: [
            { month: 12, value: 50000 },
            { month: 24, value: 50000 }
          ]
        }
      ];

      const comparison = calculator.compareVestingSchedules(schedules, 80000);

      expect(comparison).toHaveLength(2);
      
      const frontLoaded = comparison.find(c => c.scheduleName === 'Front-loaded');
      const spreadOut = comparison.find(c => c.scheduleName === 'Spread-out');
      
      expect(frontLoaded).toBeDefined();
      expect(spreadOut).toBeDefined();
      
      // Spread-out should be more tax efficient
      expect(spreadOut!.totalTax).toBeLessThan(frontLoaded!.totalTax);
      expect(spreadOut!.taxSavings).toBeGreaterThan(0);
    });
  });
});
