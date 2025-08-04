export interface RetentionMetrics {
  retentionRate: number;
  expectedTenureMonths: number;
  vestingCompletionProbability: number;
  costPerRetainedEmployee: number;
}

export interface RetentionScenario {
  name: string;
  baseRetentionRate: number;
  vestingImpactMultiplier: number;
}

export class EmployeeRetentionModeler {
  private industryAverageRetention = 0.85; // 85% annual retention rate
  private vestingRetentionBoost = 0.15; // 15% boost from vesting incentives
  
  /**
   * Calculate retention probability for a given month
   */
  calculateRetentionProbability(
    month: number,
    hasVestingIncentive: boolean,
    vestingCompletionMonth: number
  ): number {
    const annualRate = hasVestingIncentive 
      ? this.industryAverageRetention + this.vestingRetentionBoost
      : this.industryAverageRetention;
    
    // Monthly retention rate
    const monthlyRate = Math.pow(annualRate, 1/12);
    
    // Calculate cumulative retention probability
    let probability = Math.pow(monthlyRate, month);
    
    // Add retention boost near vesting milestones
    if (hasVestingIncentive && month < vestingCompletionMonth) {
      const proximityBoost = this.calculateVestingProximityBoost(month, vestingCompletionMonth);
      probability = Math.min(1, probability * (1 + proximityBoost));
    }
    
    return probability;
  }
  
  /**
   * Calculate retention boost based on proximity to vesting milestone
   */
  private calculateVestingProximityBoost(currentMonth: number, vestingMonth: number): number {
    const monthsRemaining = vestingMonth - currentMonth;
    
    if (monthsRemaining <= 0) return 0;
    if (monthsRemaining <= 6) return 0.20; // 20% boost in last 6 months
    if (monthsRemaining <= 12) return 0.10; // 10% boost in last 12 months
    if (monthsRemaining <= 24) return 0.05; // 5% boost in last 24 months
    
    return 0;
  }
  
  /**
   * Model employee retention over time with vesting schedule
   */
  modelRetentionCurve(
    totalEmployees: number,
    vestingSchedule: Array<{ months: number; percent: number }>,
    projectionMonths: number
  ): Array<{
    month: number;
    remainingEmployees: number;
    retentionRate: number;
    vestedEmployees: number;
  }> {
    const curve = [];
    
    for (let month = 0; month <= projectionMonths; month++) {
      // Find current vesting milestone
      const currentVesting = vestingSchedule
        .filter(v => v.months <= month)
        .sort((a, b) => b.months - a.months)[0];
      
      const nextVesting = vestingSchedule
        .filter(v => v.months > month)
        .sort((a, b) => a.months - b.months)[0];
      
      const retentionProb = this.calculateRetentionProbability(
        month,
        true,
        nextVesting ? nextVesting.months : Infinity
      );
      
      const remainingEmployees = Math.round(totalEmployees * retentionProb);
      const vestedPercent = currentVesting ? currentVesting.percent : 0;
      const vestedEmployees = Math.round(remainingEmployees * (vestedPercent / 100));
      
      curve.push({
        month,
        remainingEmployees,
        retentionRate: retentionProb * 100,
        vestedEmployees
      });
    }
    
    return curve;
  }
  
  /**
   * Calculate expected tenure with and without vesting incentives
   */
  calculateExpectedTenure(hasVesting: boolean): number {
    const annualRate = hasVesting
      ? this.industryAverageRetention + this.vestingRetentionBoost
      : this.industryAverageRetention;
    
    // Expected tenure = 1 / (1 - retention rate) years
    return (1 / (1 - annualRate)) * 12; // Convert to months
  }
  
  /**
   * Compare retention scenarios
   */
  compareRetentionScenarios(
    scenarios: RetentionScenario[],
    totalEmployees: number,
    vestingValuePerEmployee: number,
    projectionYears: number
  ): Array<{
    scenario: string;
    avgRetention: number;
    totalRetained: number;
    costPerRetention: number;
    roi: number;
  }> {
    return scenarios.map(scenario => {
      const months = projectionYears * 12;
      const monthlyRate = Math.pow(scenario.baseRetentionRate * scenario.vestingImpactMultiplier, 1/12);
      
      // Calculate average retention over period
      let totalRetention = 0;
      for (let m = 1; m <= months; m++) {
        totalRetention += Math.pow(monthlyRate, m);
      }
      const avgRetention = totalRetention / months;
      
      const totalRetained = Math.round(totalEmployees * avgRetention);
      const totalCost = totalEmployees * vestingValuePerEmployee;
      const costPerRetention = totalRetained > 0 ? totalCost / totalRetained : 0;
      
      // ROI based on replacement cost savings (assume 150% of annual compensation)
      const replacementCostSavings = (totalEmployees - totalRetained) * vestingValuePerEmployee * 1.5;
      const roi = totalCost > 0 ? ((replacementCostSavings - totalCost) / totalCost) * 100 : 0;
      
      return {
        scenario: scenario.name,
        avgRetention: avgRetention * 100,
        totalRetained,
        costPerRetention,
        roi
      };
    });
  }
  
  /**
   * Calculate vesting completion probability
   */
  calculateVestingCompletionProbability(
    vestingMonths: number,
    hasIncentive: boolean
  ): number {
    return this.calculateRetentionProbability(vestingMonths, hasIncentive, vestingMonths);
  }
  
  /**
   * Estimate cost effectiveness of vesting program
   */
  calculateCostEffectiveness(
    employeeCount: number,
    vestingCostPerEmployee: number,
    vestingPeriodMonths: number,
    annualSalaryPerEmployee: number
  ): {
    withVesting: RetentionMetrics;
    withoutVesting: RetentionMetrics;
    incrementalValue: number;
  } {
    // With vesting
    const withVestingTenure = this.calculateExpectedTenure(true);
    const withVestingCompletion = this.calculateVestingCompletionProbability(vestingPeriodMonths, true);
    const withVestingRetention = Math.pow(
      this.industryAverageRetention + this.vestingRetentionBoost,
      vestingPeriodMonths / 12
    );
    
    // Without vesting
    const withoutVestingTenure = this.calculateExpectedTenure(false);
    const withoutVestingCompletion = this.calculateVestingCompletionProbability(vestingPeriodMonths, false);
    const withoutVestingRetention = Math.pow(
      this.industryAverageRetention,
      vestingPeriodMonths / 12
    );
    
    // Calculate metrics
    const withVesting: RetentionMetrics = {
      retentionRate: withVestingRetention * 100,
      expectedTenureMonths: withVestingTenure,
      vestingCompletionProbability: withVestingCompletion * 100,
      costPerRetainedEmployee: vestingCostPerEmployee / withVestingRetention
    };
    
    const withoutVesting: RetentionMetrics = {
      retentionRate: withoutVestingRetention * 100,
      expectedTenureMonths: withoutVestingTenure,
      vestingCompletionProbability: withoutVestingCompletion * 100,
      costPerRetainedEmployee: 0
    };
    
    // Calculate incremental value from improved retention
    const additionalRetained = employeeCount * (withVestingRetention - withoutVestingRetention);
    const replacementCostSaved = additionalRetained * annualSalaryPerEmployee * 1.5;
    const incrementalValue = replacementCostSaved - (employeeCount * vestingCostPerEmployee);
    
    return {
      withVesting,
      withoutVesting,
      incrementalValue
    };
  }
}
