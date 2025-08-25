import { CalculationInputs, VestingCalculationResult, VestingTimelinePoint, VestingScheme } from '@/types/vesting';
import { 
  VestingScheduleCalculator, 
  BitcoinGrowthProjector,
  TaxImplicationCalculator,
  EmployeeRetentionModeler,
  RiskAnalysisEngine
} from './calculators';
import { calculateUsdValue, validateSafeNumber } from './bitcoin-precision';
import { performanceMonitor, measureCalculation } from './performance-monitor';

export class VestingCalculator {
  static calculate(inputs: CalculationInputs): VestingCalculationResult {
    // Add performance monitoring for the entire calculation
    return measureCalculation('VestingCalculator.calculate', () => {
      const { scheme, currentBitcoinPrice, projectedBitcoinGrowth } = inputs;
    
    // Initialize specialized calculators with custom vesting events
    // Fix: Handle undefined bonuses field
    const vestingCalculator = new VestingScheduleCalculator({
      milestones: [...scheme.vestingSchedule],
      bonuses: scheme.bonuses ? [...scheme.bonuses] : [],
      customVestingEvents: scheme.customVestingEvents ? [...scheme.customVestingEvents] : []
    });
    
    const growthProjector = new BitcoinGrowthProjector(
      currentBitcoinPrice,
      projectedBitcoinGrowth
    );
    
    // Generate vesting timeline
    const maxMonths = Math.max(...scheme.vestingSchedule.map(m => m.months));
    const vestingTimeline = vestingCalculator.generateTimeline(
      scheme.initialGrant,
      scheme.annualGrant,
      maxMonths,
      scheme.id
    );
    
    // Build complete timeline with Bitcoin price projections
    const timeline: VestingTimelinePoint[] = vestingTimeline.map(point => {
      const bitcoinPrice = growthProjector.projectPrice(point.month);
      validateSafeNumber(bitcoinPrice, 'projected Bitcoin price');
      const usdValue = calculateUsdValue(point.employerBalance, bitcoinPrice);
      
      return {
        month: point.month,
        employeeBalance: 0, // No employee contributions in current implementation
        employerBalance: point.employerBalance,
        vestedAmount: point.vestedAmount,
        totalBalance: point.employerBalance,
        bitcoinPrice,
        usdValue
      };
    });
    
    // Calculate total employer contributions
    const totalEmployerContributions = this.calculateTotalContributions(
      scheme.initialGrant,
      scheme.annualGrant,
      maxMonths,
      scheme
    );
    
    return {
      timeline,
      totalCost: calculateUsdValue(totalEmployerContributions, currentBitcoinPrice),
      totalBitcoinNeeded: totalEmployerContributions,
      summary: {
        maxEmployerCommitment: calculateUsdValue(totalEmployerContributions, currentBitcoinPrice),
        averageVestingPeriod: vestingCalculator.calculateAverageVestingPeriod(),
      },
    };
    }, 3000); // 3 second timeout for calculations
  }
  
  /**
   * Calculate total employer contributions based on scheme rules
   */
  private static calculateTotalContributions(
    initialGrant: number,
    annualGrant: number | undefined,
    maxMonths: number,
    scheme: VestingScheme
  ): number {
    let total = initialGrant;
    
    if (!annualGrant) return total;
    
    // CRITICAL FIX: Check for custom vesting events first (Unlocking Schedules)
    let maxGrantMonths = maxMonths;
    if (scheme.customVestingEvents && scheme.customVestingEvents.length > 0) {
      // Use the last custom vesting event's time period as the grant limit
      maxGrantMonths = Math.max(
        ...scheme.customVestingEvents.map(event => event.timePeriod)
      );
    }
    
    // Calculate number of annual grants based on scheme with explicit rules
    let numberOfGrants = 0;
    switch (scheme.id) {
      case 'accelerator':
        numberOfGrants = 0; // Pioneer scheme has no annual grants
        break;
      case 'steady-builder':
        // Respect custom vesting events or default to 5 years max
        const steadyMax = scheme.customVestingEvents?.length > 0 ? maxGrantMonths : 60;
        numberOfGrants = Math.min(5, Math.floor(Math.min(steadyMax, maxMonths) / 12));
        break;
      case 'slow-burn':
        // Respect custom vesting events or default to 9 years max
        const slowMax = scheme.customVestingEvents?.length > 0 ? maxGrantMonths : 108;
        numberOfGrants = Math.min(9, Math.floor(Math.min(slowMax, maxMonths) / 12));
        break;
      case 'custom':
        // Respect custom vesting events or default to 10 years max
        const customMax = scheme.customVestingEvents?.length > 0 ? maxGrantMonths : 120;
        numberOfGrants = Math.floor(Math.min(customMax, maxMonths) / 12);
        break;
      default:
        // Use custom vesting events limit or fallback to scheme defaults
        const defaultMax = scheme.customVestingEvents?.length > 0 ? maxGrantMonths : maxMonths;
        numberOfGrants = scheme.maxAnnualGrants || Math.floor(defaultMax / 12);
    }
    
    total += annualGrant * numberOfGrants;
    
    return total;
  }
  
  /**
   * Calculate advanced metrics using specialized calculators
   */
  static calculateAdvancedMetrics(
    inputs: CalculationInputs,
    additionalParams: {
      employeeCount?: number;
      annualSalaryPerEmployee?: number;
      employeeAnnualIncome?: number;
      riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    } = {}
  ) {
    const basicResult = this.calculate(inputs);
    const { currentBitcoinPrice, projectedBitcoinGrowth } = inputs;
    
    // Initialize calculators
    const taxCalculator = new TaxImplicationCalculator();
    const retentionModeler = new EmployeeRetentionModeler();
    const riskEngine = new RiskAnalysisEngine();
    const growthProjector = new BitcoinGrowthProjector(currentBitcoinPrice, projectedBitcoinGrowth);
    
    // Calculate tax implications
    const finalValue = basicResult.timeline[basicResult.timeline.length - 1];
    const taxImplications = taxCalculator.calculateVestingTax(
      finalValue?.usdValue ?? 0,
      basicResult.totalCost,
      basicResult.timeline.length,
      additionalParams.employeeAnnualIncome || 100000
    );
    
    // Calculate retention metrics
    const retentionAnalysis = additionalParams.employeeCount && additionalParams.annualSalaryPerEmployee
      ? retentionModeler.calculateCostEffectiveness(
          additionalParams.employeeCount,
          basicResult.totalCost / additionalParams.employeeCount,
          basicResult.timeline.length,
          additionalParams.annualSalaryPerEmployee
        )
      : null;
    
    // Calculate risk metrics
    const riskMetrics = riskEngine.calculateRiskMetrics(
      finalValue?.usdValue ?? 0,
      projectedBitcoinGrowth / 100,
      basicResult.timeline.length / 12
    );
    
    // Generate growth scenarios
    const growthScenarios = growthProjector.generateScenarioAnalysis(
      basicResult.totalBitcoinNeeded,
      basicResult.timeline.length,
      [
        { name: 'Conservative', growthRate: projectedBitcoinGrowth * 0.5 },
        { name: 'Base Case', growthRate: projectedBitcoinGrowth },
        { name: 'Optimistic', growthRate: projectedBitcoinGrowth * 1.5 }
      ]
    );
    
    return {
      ...basicResult,
      advancedMetrics: {
        taxImplications,
        retentionAnalysis,
        riskMetrics,
        growthScenarios
      }
    };
  }
}

// Re-export calculator classes for direct use
export {
  VestingScheduleCalculator,
  BitcoinGrowthProjector,
  TaxImplicationCalculator,
  EmployeeRetentionModeler,
  RiskAnalysisEngine
} from './calculators';
