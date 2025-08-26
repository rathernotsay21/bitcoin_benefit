import { describe, it, expect } from 'vitest';
import { VestingCalculator } from '../vesting-calculations';
import { VESTING_SCHEMES } from '../vesting-schemes';

describe('Vesting Schemes Total Calculation Verification', () => {
  const currentBitcoinPrice = 100000;
  const projectedBitcoinGrowth = 50;

  it('Pioneer (Accelerator) should have 0.02 BTC total with no annual grants', () => {
    const pioneer = VESTING_SCHEMES.find(s => s.id === 'accelerator')!;
    const result = VestingCalculator.calculate({
      scheme: pioneer,
      currentBitcoinPrice,
      projectedBitcoinGrowth,
    });

    expect(pioneer.initialGrant).toBe(0.02);
    expect(pioneer.annualGrant).toBeUndefined();
    expect(result.totalBitcoinNeeded).toBe(0.02);
  });

  it('Stacker (Steady Builder) should have 0.02 BTC total (0.015 + 5 * 0.001)', () => {
    const stacker = VESTING_SCHEMES.find(s => s.id === 'steady-builder')!;
    const result = VestingCalculator.calculate({
      scheme: stacker,
      currentBitcoinPrice,
      projectedBitcoinGrowth,
    });

    expect(stacker.initialGrant).toBe(0.015);
    expect(stacker.annualGrant).toBe(0.001);
    expect(stacker.maxAnnualGrants).toBe(5);
    expect(result.totalBitcoinNeeded).toBe(0.02); // 0.015 + 5 * 0.001 = 0.02
  });

  it('Builder (Slow Burn) should have 0.02 BTC total (0.002 + 9 * 0.002)', () => {
    const builder = VESTING_SCHEMES.find(s => s.id === 'slow-burn')!;
    const result = VestingCalculator.calculate({
      scheme: builder,
      currentBitcoinPrice,
      projectedBitcoinGrowth,
    });

    expect(builder.initialGrant).toBe(0.002);
    expect(builder.annualGrant).toBe(0.002);
    expect(builder.maxAnnualGrants).toBe(9);
    expect(result.totalBitcoinNeeded).toBeCloseTo(0.02, 8); // 0.002 + 9 * 0.002 = 0.02
  });

  it('All schemes should total 0.02 BTC when fully vested', () => {
    const schemes = VESTING_SCHEMES;
    
    schemes.forEach(scheme => {
      const result = VestingCalculator.calculate({
        scheme,
        currentBitcoinPrice,
        projectedBitcoinGrowth,
      });

      expect(result.totalBitcoinNeeded).toBeCloseTo(0.02, 8);
      console.log(`${scheme.name}: ${result.totalBitcoinNeeded} BTC`);
    });
  });

  it('Stacker annual grants should stop after 5 years', () => {
    const stacker = VESTING_SCHEMES.find(s => s.id === 'steady-builder')!;
    const result = VestingCalculator.calculate({
      scheme: stacker,
      currentBitcoinPrice,
      projectedBitcoinGrowth,
    });

    // Check the timeline for grants
    const grantsPerYear = result.timeline
      .filter((_, index) => index % 12 === 0 && index > 0 && index <= 120)
      .map((point, yearIndex) => {
        const prevYearPoint = result.timeline[(yearIndex) * 12];
        return point.employerBalance - (prevYearPoint?.employerBalance || 0);
      });

    // Should have grants for years 1-5 only
    expect(grantsPerYear[0]).toBeCloseTo(0.001, 5); // Year 1
    expect(grantsPerYear[1]).toBeCloseTo(0.001, 5); // Year 2
    expect(grantsPerYear[2]).toBeCloseTo(0.001, 5); // Year 3
    expect(grantsPerYear[3]).toBeCloseTo(0.001, 5); // Year 4
    expect(grantsPerYear[4]).toBeCloseTo(0.001, 5); // Year 5
    expect(grantsPerYear[5]).toBeCloseTo(0, 5);     // Year 6 - no grant
    expect(grantsPerYear[6]).toBeCloseTo(0, 5);     // Year 7 - no grant
  });

  it('Builder annual grants should stop after 9 years', () => {
    const builder = VESTING_SCHEMES.find(s => s.id === 'slow-burn')!;
    const result = VestingCalculator.calculate({
      scheme: builder,
      currentBitcoinPrice,
      projectedBitcoinGrowth,
    });

    // Check the timeline for grants
    const grantsPerYear = result.timeline
      .filter((_, index) => index % 12 === 0 && index > 0 && index <= 120)
      .map((point, yearIndex) => {
        const prevYearPoint = result.timeline[(yearIndex) * 12];
        return point.employerBalance - (prevYearPoint?.employerBalance || 0);
      });

    // Should have grants for years 1-9
    for (let i = 0; i < 9; i++) {
      expect(grantsPerYear[i]).toBeCloseTo(0.002, 5); // Years 1-9
    }
    expect(grantsPerYear[9]).toBeCloseTo(0, 5); // Year 10 - no grant
  });
});