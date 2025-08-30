import { VestingScheduleCalculator } from '../VestingScheduleCalculator';

describe('VestingScheduleCalculator', () => {
  const defaultSchedule = {
    milestones: [
      { months: 0, grantPercent: 0 },
      { months: 60, grantPercent: 50 },
      { months: 120, grantPercent: 100 }
    ],
    bonuses: [
      { months: 60, bonusPercent: 10 },
      { months: 120, bonusPercent: 20 }
    ]
  };

  let calculator: VestingScheduleCalculator;

  beforeEach(() => {
    calculator = new VestingScheduleCalculator(defaultSchedule);
  });

  describe('getCurrentMilestone', () => {
    it('should return initial milestone at month 0', () => {
      const milestone = calculator.getCurrentMilestone(0);
      expect(milestone.grantPercent).toBe(0);
      expect(milestone.months).toBe(0);
    });

    it('should return 50% milestone at month 60', () => {
      const milestone = calculator.getCurrentMilestone(60);
      expect(milestone.grantPercent).toBe(50);
      expect(milestone.months).toBe(60);
    });

    it('should return 100% milestone at month 120', () => {
      const milestone = calculator.getCurrentMilestone(120);
      expect(milestone.grantPercent).toBe(100);
      expect(milestone.months).toBe(120);
    });

    it('should return correct milestone for intermediate months', () => {
      const milestone = calculator.getCurrentMilestone(75);
      expect(milestone.grantPercent).toBe(50);
      expect(milestone.months).toBe(60);
    });
  });

  describe('calculateVestedAmount', () => {
    it('should calculate 0% vested at month 0', () => {
      const vested = calculator.calculateVestedAmount(1.0, 0);
      expect(vested).toBe(0);
    });

    it('should calculate 50% vested at month 60', () => {
      const vested = calculator.calculateVestedAmount(1.0, 60);
      expect(vested).toBe(0.5);
    });

    it('should calculate 100% vested at month 120', () => {
      const vested = calculator.calculateVestedAmount(1.0, 120);
      expect(vested).toBe(1.0);
    });

    it('should handle fractional grant amounts', () => {
      const vested = calculator.calculateVestedAmount(0.123456, 60);
      expect(vested).toBeCloseTo(0.061728, 6);
    });
  });

  describe('calculateBonuses', () => {
    it('should return 0 bonus before first bonus milestone', () => {
      const bonus = calculator.calculateBonuses(30, 1000);
      expect(bonus).toBe(0);
    });

    it('should calculate 10% bonus at month 60', () => {
      const bonus = calculator.calculateBonuses(60, 1000);
      expect(bonus).toBe(100);
    });

    it('should calculate cumulative bonuses after month 120', () => {
      const bonus = calculator.calculateBonuses(120, 1000);
      expect(bonus).toBe(300); // 10% + 20% = 30%
    });
  });

  describe('calculateAverageVestingPeriod', () => {
    it('should calculate weighted average vesting period', () => {
      const avgPeriod = calculator.calculateAverageVestingPeriod();
      // (0*0 + 60*50 + 120*100) / (0 + 50 + 100) = 15000 / 150 = 100 months
      expect(avgPeriod).toBe(100);
    });

    it('should handle single milestone', () => {
      const singleMilestoneCalc = new VestingScheduleCalculator({
        milestones: [{ months: 48, grantPercent: 100 }]
      });
      expect(singleMilestoneCalc.calculateAverageVestingPeriod()).toBe(48);
    });
  });

  describe('generateTimeline', () => {
    it('should generate complete timeline with initial grant only', () => {
      const timeline = calculator.generateTimeline(0.1, undefined, 120);
      
      expect(timeline).toHaveLength(121); // 0 to 120 months
      expect(timeline[0].totalGrants).toBe(0.1);
      expect(timeline[120].totalGrants).toBe(0.1);
    });

    it('should include annual grants for steady-builder scheme', () => {
      const timeline = calculator.generateTimeline(0.01, 0.002, 120, 'steady-builder');
      
      // Should have initial + 5 annual grants (at months 12, 24, 36, 48, 60)
      expect(timeline[60].totalGrants).toBeCloseTo(0.020, 3);
      expect(timeline[120].totalGrants).toBeCloseTo(0.020, 3); // No more grants after 60 months
    });

    it('should include annual grants for slow-burn scheme', () => {
      const timeline = calculator.generateTimeline(0.002, 0.002, 120, 'slow-burn');
      
      // Should have initial grant at month 0 + 9 annual grants (at months 12, 24, ..., 108)
      expect(timeline[120].totalGrants).toBeCloseTo(0.020, 3);
    });

    it('should calculate vested amounts correctly over time', () => {
      const timeline = calculator.generateTimeline(0.1, undefined, 120);
      
      expect(timeline[0].vestedAmount).toBe(0);
      expect(timeline[60].vestedAmount).toBeCloseTo(0.06, 3); // 50% + 10% bonus
      expect(timeline[120].vestedAmount).toBeCloseTo(0.13, 2); // 100% + 30% bonus (10% + 20%)
    });
  });
});
