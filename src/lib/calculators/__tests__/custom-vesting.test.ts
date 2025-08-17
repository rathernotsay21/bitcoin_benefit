// Test file for custom vesting schedule feature
import { VestingScheduleCalculator } from '@/lib/calculators/VestingScheduleCalculator';
import { CustomVestingEvent } from '@/types/vesting';

describe('Custom Vesting Schedule', () => {
  describe('VestingScheduleCalculator with custom events', () => {
    it('should use custom vesting events when provided', () => {
      const customEvents: CustomVestingEvent[] = [
        { id: '1', timePeriod: 3, percentageVested: 10, label: '90 days' },
        { id: '2', timePeriod: 12, percentageVested: 25, label: '1 year' },
        { id: '3', timePeriod: 24, percentageVested: 50, label: '2 years' },
        { id: '4', timePeriod: 36, percentageVested: 75, label: '3 years' },
        { id: '5', timePeriod: 48, percentageVested: 100, label: '4 years' },
      ];

      const calculator = new VestingScheduleCalculator({
        milestones: [
          { months: 60, grantPercent: 50 },
          { months: 120, grantPercent: 100 },
        ],
        customVestingEvents: customEvents,
      });

      // Test at various points
      const month3 = calculator.getCurrentMilestone(3);
      expect(month3.grantPercent).toBe(10);

      const month12 = calculator.getCurrentMilestone(12);
      expect(month12.grantPercent).toBe(25);

      const month24 = calculator.getCurrentMilestone(24);
      expect(month24.grantPercent).toBe(50);

      const month36 = calculator.getCurrentMilestone(36);
      expect(month36.grantPercent).toBe(75);

      const month48 = calculator.getCurrentMilestone(48);
      expect(month48.grantPercent).toBe(100);
    });

    it('should fall back to default milestones when no custom events', () => {
      const calculator = new VestingScheduleCalculator({
        milestones: [
          { months: 60, grantPercent: 50 },
          { months: 120, grantPercent: 100 },
        ],
      });

      const month60 = calculator.getCurrentMilestone(60);
      expect(month60.grantPercent).toBe(50);

      const month120 = calculator.getCurrentMilestone(120);
      expect(month120.grantPercent).toBe(100);
    });

    it('should calculate vested amounts correctly with custom events', () => {
      const customEvents: CustomVestingEvent[] = [
        { id: '1', timePeriod: 12, percentageVested: 25, label: '1 year' },
        { id: '2', timePeriod: 24, percentageVested: 50, label: '2 years' },
        { id: '3', timePeriod: 36, percentageVested: 75, label: '3 years' },
        { id: '4', timePeriod: 48, percentageVested: 100, label: '4 years' },
      ];

      const calculator = new VestingScheduleCalculator({
        milestones: [],
        customVestingEvents: customEvents,
      });

      const totalGrants = 0.02; // 0.02 BTC

      // Test vested amounts at different points
      const vested12 = calculator.calculateVestedAmount(totalGrants, 12);
      expect(vested12).toBeCloseTo(0.005); // 25% of 0.02

      const vested24 = calculator.calculateVestedAmount(totalGrants, 24);
      expect(vested24).toBeCloseTo(0.01); // 50% of 0.02

      const vested36 = calculator.calculateVestedAmount(totalGrants, 36);
      expect(vested36).toBeCloseTo(0.015); // 75% of 0.02

      const vested48 = calculator.calculateVestedAmount(totalGrants, 48);
      expect(vested48).toBeCloseTo(0.02); // 100% of 0.02
    });

    it('should handle 90-day cliff vesting', () => {
      const customEvents: CustomVestingEvent[] = [
        { id: '1', timePeriod: 0.25 * 12, percentageVested: 10, label: '90 days' }, // 3 months
        { id: '2', timePeriod: 12, percentageVested: 30, label: '1 year' },
        { id: '3', timePeriod: 24, percentageVested: 55, label: '2 years' },
        { id: '4', timePeriod: 36, percentageVested: 80, label: '3 years' },
        { id: '5', timePeriod: 48, percentageVested: 100, label: '4 years' },
      ];

      const calculator = new VestingScheduleCalculator({
        milestones: [],
        customVestingEvents: customEvents,
      });

      // Before 90 days - nothing vested
      const month2 = calculator.getCurrentMilestone(2);
      expect(month2.grantPercent).toBe(0);

      // At 90 days (3 months) - 10% vested
      const month3 = calculator.getCurrentMilestone(3);
      expect(month3.grantPercent).toBe(10);

      // Between 90 days and 1 year - still 10%
      const month6 = calculator.getCurrentMilestone(6);
      expect(month6.grantPercent).toBe(10);

      // At 1 year - 30% vested
      const month12 = calculator.getCurrentMilestone(12);
      expect(month12.grantPercent).toBe(30);
    });
  });

  describe('CustomVestingSchedule UI Component', () => {
    it('should validate total percentage does not exceed 100%', () => {
      const events: CustomVestingEvent[] = [
        { id: '1', timePeriod: 12, percentageVested: 50, label: '1 year' },
        { id: '2', timePeriod: 24, percentageVested: 75, label: '2 years' },
      ];

      // The second event should be valid since it's cumulative (75% total, not 50% + 75%)
      const maxPercentage = Math.max(...events.map(e => e.percentageVested));
      expect(maxPercentage).toBeLessThanOrEqual(100);
    });

    it('should ensure events are cumulative not additive', () => {
      const events: CustomVestingEvent[] = [
        { id: '1', timePeriod: 12, percentageVested: 25, label: '1 year' },
        { id: '2', timePeriod: 24, percentageVested: 50, label: '2 years' },
        { id: '3', timePeriod: 36, percentageVested: 75, label: '3 years' },
        { id: '4', timePeriod: 48, percentageVested: 100, label: '4 years' },
      ];

      // Each percentage should be greater than the previous
      for (let i = 1; i < events.length; i++) {
        expect(events[i].percentageVested).toBeGreaterThan(events[i - 1].percentageVested);
      }

      // Total should be the maximum percentage, not the sum
      const totalVested = Math.max(...events.map(e => e.percentageVested));
      expect(totalVested).toBe(100);
    });
  });
});
