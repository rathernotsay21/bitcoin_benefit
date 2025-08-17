import { CalculationInputs, VestingCalculationResult, VestingTimelinePoint, VestingScheme } from '@/types/vesting';
import { 
  VestingScheduleCalculator, 
  BitcoinGrowthProjector,
  TaxImplicationCalculator,
  EmployeeRetentionModeler,
  RiskAnalysisEngine
} from './calculators';

export class VestingCalculator {
  static calculate(inputs: CalculationInputs): VestingCalculationResult {
    const { scheme, currentBitcoinPrice, projectedBitcoinGrowth } = inputs;
    
    // Initialize specialized calculators
    const vestingCalculator = new VestingScheduleCalculator({
      milestones: scheme.vestingSchedule,
      bonuses: scheme.bonuses,
      customVestingEvents: scheme.customVestingEvents
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
      const usdValue = point.employerBalance * bitcoinPrice;
      
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
      totalCost: totalEmployerContributions * currentBitcoinPrice,
      totalBitcoinNeeded: totalEmployerContributions,
      summary: {
        maxEmployerCommitment: totalEmployerContributions * currentBitcoinPrice,
        averageVestingPeriod: vestingCalculator.calculateAverageVestingPeriod(),
      },
    };
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
    
    // Calculate number of annual grants based on scheme
    let grantMonths = 0;
    switch (scheme.id) {
      case 'steady-builder':
        grantMonths = Math.min(60, maxMonths); // 5 years max
        break;
      case 'slow-burn':
        grantMonths = Math.min(108, maxMonths); // 9 years max (grants at months 12, 24, 36, 48, 60, 72, 84, 96, 108)
        break;
      case 'custom':
        grantMonths = Math.min(120, maxMonths); // 10 years max
        break;
      default:
        grantMonths = maxMonths;
    }
    
    // Count annual grants (at 12, 24, 36, etc. month intervals)
    const numberOfGrants = Math.floor(grantMonths / 12);
    total += annualGrant * (scheme.maxAnnualGrants || numberOfGrants);
    
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
      finalValue.usdValue,
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
      finalValue.usdValue,
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
