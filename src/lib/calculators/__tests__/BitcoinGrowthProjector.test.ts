import { BitcoinGrowthProjector } from '../BitcoinGrowthProjector';

describe('BitcoinGrowthProjector', () => {
  let projector: BitcoinGrowthProjector;

  beforeEach(() => {
    projector = new BitcoinGrowthProjector(50000, 15); // $50k base, 15% annual growth
  });

  describe('getMonthlyGrowthRate', () => {
    it('should convert annual rate to monthly rate', () => {
      const monthlyRate = projector.getMonthlyGrowthRate();
      expect(monthlyRate).toBeCloseTo(0.0125, 4); // 15% / 12 / 100
    });

    it('should handle negative growth rates', () => {
      const bearProjector = new BitcoinGrowthProjector(50000, -10);
      const monthlyRate = bearProjector.getMonthlyGrowthRate();
      expect(monthlyRate).toBeCloseTo(-0.00833, 4);
    });
  });

  describe('projectPrice', () => {
    it('should return base price at month 0', () => {
      expect(projector.projectPrice(0)).toBe(50000);
    });

    it('should calculate compound growth correctly', () => {
      const price12Months = projector.projectPrice(12);
      // 50000 * (1.0125)^12 ≈ 58037.45
      expect(price12Months).toBeCloseTo(58037.45, 0);
    });

    it('should handle long-term projections', () => {
      const price10Years = projector.projectPrice(120);
      // 50000 * (1.0125)^120 ≈ 222,924
      expect(price10Years).toBeGreaterThan(200000);
      expect(price10Years).toBeLessThan(250000);
    });
  });

  describe('generateProjections', () => {
    it('should generate projections for specified months', () => {
      const projections = projector.generateProjections([0, 12, 24, 36]);
      
      expect(projections).toHaveLength(4);
      expect(projections[0].price).toBe(50000);
      expect(projections[0].growthFromStart).toBe(0);
      
      expect(projections[1].month).toBe(12);
      expect(projections[1].growthFromStart).toBeCloseTo(16.07, 1);
    });
  });

  describe('calculateCAGR', () => {
    it('should calculate correct CAGR', () => {
      const cagr = projector.calculateCAGR(100000, 50000, 5);
      expect(cagr).toBeCloseTo(14.87, 1); // (2^(1/5) - 1) * 100
    });

    it('should handle fractional years', () => {
      const cagr = projector.calculateCAGR(75000, 50000, 2.5);
      expect(cagr).toBeCloseTo(17.65, 1);
    });
  });

  describe('projectFutureValue', () => {
    it('should calculate future value of Bitcoin holdings', () => {
      const futureValue = projector.projectFutureValue(0.5, 60); // 0.5 BTC after 5 years
      const expectedPrice = projector.projectPrice(60);
      expect(futureValue).toBe(0.5 * expectedPrice);
    });
  });

  describe('calculateGrowthMultiple', () => {
    it('should calculate correct growth multiple', () => {
      const multiple5Years = projector.calculateGrowthMultiple(60);
      expect(multiple5Years).toBeCloseTo(2.11, 2); // ~2.1x in 5 years at 15% annual
    });

    it('should return 1 at month 0', () => {
      expect(projector.calculateGrowthMultiple(0)).toBe(1);
    });
  });

  describe('generateScenarioAnalysis', () => {
    it('should generate multiple scenarios', () => {
      const scenarios = projector.generateScenarioAnalysis(
        1.0, // 1 BTC
        60,  // 5 years
        [
          { name: 'Bear', growthRate: -10 },
          { name: 'Base', growthRate: 15 },
          { name: 'Bull', growthRate: 50 }
        ]
      );

      expect(scenarios).toHaveLength(3);
      
      const bear = scenarios.find(s => s.scenario === 'Bear');
      expect(bear?.finalPrice).toBeLessThan(50000);
      
      const base = scenarios.find(s => s.scenario === 'Base');
      expect(base?.growthRate).toBe(15);
      
      const bull = scenarios.find(s => s.scenario === 'Bull');
      expect(bull?.finalPrice).toBeGreaterThan(200000);
    });
  });

  describe('monthsToReachTarget', () => {
    it('should calculate months to reach target value', () => {
      const months = projector.monthsToReachTarget(50000, 100000);
      // At 15% annual growth, doubling takes ~4.65 years
      expect(months).toBeCloseTo(55.8, 0);
    });

    it('should return null for impossible targets', () => {
      expect(projector.monthsToReachTarget(100000, 50000)).toBeNull();
      
      const bearProjector = new BitcoinGrowthProjector(50000, -10);
      expect(bearProjector.monthsToReachTarget(50000, 100000)).toBeNull();
    });
  });
});
