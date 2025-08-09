import { HISTORICAL_VESTING_SCHEMES } from '../historical-vesting-schemes';

describe('Historical Vesting Schemes', () => {
  it('should have the correct default values for Pioneer', () => {
    const bitcoinPioneer = HISTORICAL_VESTING_SCHEMES.find(s => s.id === 'accelerator');
    
    expect(bitcoinPioneer).toBeDefined();
    expect(bitcoinPioneer?.name).toBe('Pioneer');
    expect(bitcoinPioneer?.initialGrant).toBe(0.1);
    expect(bitcoinPioneer?.annualGrant).toBeUndefined();
  });

  it('should have the correct default values for Dollar Cost Advantage', () => {
    const dollarCostAdvantage = HISTORICAL_VESTING_SCHEMES.find(s => s.id === 'steady-builder');
    
    expect(dollarCostAdvantage).toBeDefined();
    expect(dollarCostAdvantage?.name).toBe('Dollar Cost Advantage');
    expect(dollarCostAdvantage?.initialGrant).toBe(0.05);
    expect(dollarCostAdvantage?.annualGrant).toBe(0.01);
  });

  it('should have the correct default values for Builder', () => {
    const wealthBuilder = HISTORICAL_VESTING_SCHEMES.find(s => s.id === 'slow-burn');
    
    expect(wealthBuilder).toBeDefined();
    expect(wealthBuilder?.name).toBe('Builder');
    expect(wealthBuilder?.initialGrant).toBe(0.0);
    expect(wealthBuilder?.annualGrant).toBe(0.02);
  });

  it('should have all three schemes', () => {
    expect(HISTORICAL_VESTING_SCHEMES).toHaveLength(3);
    
    const schemeIds = HISTORICAL_VESTING_SCHEMES.map(s => s.id);
    expect(schemeIds).toContain('accelerator');
    expect(schemeIds).toContain('steady-builder');
    expect(schemeIds).toContain('slow-burn');
  });

  it('should have the same vesting schedule structure as regular schemes', () => {
    HISTORICAL_VESTING_SCHEMES.forEach(scheme => {
      expect(scheme.vestingSchedule).toHaveLength(3);
      
      // Check vesting milestones
      expect(scheme.vestingSchedule[0].months).toBe(0);
      expect(scheme.vestingSchedule[0].grantPercent).toBe(0);
      
      expect(scheme.vestingSchedule[1].months).toBe(60);
      expect(scheme.vestingSchedule[1].grantPercent).toBe(50);
      
      expect(scheme.vestingSchedule[2].months).toBe(120);
      expect(scheme.vestingSchedule[2].grantPercent).toBe(100);
    });
  });

  it('should have meaningful amounts for historical analysis', () => {
    // All schemes should have meaningful amounts (> 0.01 BTC total)
    HISTORICAL_VESTING_SCHEMES.forEach(scheme => {
      const totalBTC = scheme.initialGrant + (scheme.annualGrant ? scheme.annualGrant * 10 : 0);
      expect(totalBTC).toBeGreaterThanOrEqual(0.1);
    });
  });
});