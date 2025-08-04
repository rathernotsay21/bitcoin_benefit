import { CalculationInputs, VestingCalculationResult, VestingTimelinePoint } from '@/types/vesting';

export class VestingCalculator {
  static calculate(inputs: CalculationInputs): VestingCalculationResult {
    const { scheme, currentBitcoinPrice, projectedBitcoinGrowth } = inputs;
    
    const timeline: VestingTimelinePoint[] = [];
    const maxMonths = Math.max(...scheme.vestingSchedule.map(m => m.months));
    
    let employerBalance = scheme.initialGrant;
    let totalEmployerContributions = scheme.initialGrant;
    let totalGrantsAccumulated = scheme.initialGrant; // Track total grants for vesting calculations
    
    const monthlyGrowthRate = projectedBitcoinGrowth / 12 / 100;
    
    for (let month = 0; month <= maxMonths; month++) {
      
      // Add annual grants (at 12, 24, 36, etc. month intervals)
      if (scheme.annualGrant && month > 0 && month % 12 === 0) {
        if (scheme.id === 'steady-builder' && month <= 60) {
          // Steady Builder: only add grants for the first 5 years (months 12, 24, 36, 48, 60)
          employerBalance += scheme.annualGrant;
          totalEmployerContributions += scheme.annualGrant;
          totalGrantsAccumulated += scheme.annualGrant;
        } else if (scheme.id === 'slow-burn' && month <= 120) {
          // Slow Burn: add grants for all 10 years (months 12, 24, 36, ..., 120)
          employerBalance += scheme.annualGrant;
          totalEmployerContributions += scheme.annualGrant;
          totalGrantsAccumulated += scheme.annualGrant;
        } else if (scheme.id === 'custom' && month <= 120) {
          // High Roller (custom): add grants for all 10 years (months 12, 24, 36, ..., 120)
          employerBalance += scheme.annualGrant;
          totalEmployerContributions += scheme.annualGrant;
          totalGrantsAccumulated += scheme.annualGrant;
        } else if (scheme.id !== 'steady-builder' && scheme.id !== 'slow-burn' && scheme.id !== 'custom') {
          // For other schemes with annual grants (if any), continue as normal
          employerBalance += scheme.annualGrant;
          totalEmployerContributions += scheme.annualGrant;
          totalGrantsAccumulated += scheme.annualGrant;
        }
      }
      
      // Calculate vested amount based on current milestone
      const currentMilestone = this.getCurrentMilestone(scheme, month);
      const vestedAmount = this.calculateVestedAmount(
        totalGrantsAccumulated, // Use total accumulated grants
        currentMilestone
      );
      
      // Apply bonuses
      const bonusAmount = this.calculateBonuses(scheme, month, employerBalance);
      
      // Calculate Bitcoin price with growth
      const bitcoinPrice = currentBitcoinPrice * Math.pow(1 + monthlyGrowthRate, month);
      
      const totalBalance = employerBalance + bonusAmount;
      
      timeline.push({
        month,
        employeeBalance: 0, // No employee contributions
        employerBalance: employerBalance + bonusAmount,
        vestedAmount: vestedAmount + bonusAmount,
        totalBalance,
        bitcoinPrice,
        usdValue: totalBalance * bitcoinPrice,
      });
    }
    
    return {
      timeline,
      totalCost: totalEmployerContributions * currentBitcoinPrice,
      totalBitcoinNeeded: totalEmployerContributions,
      summary: {
        maxEmployerCommitment: totalEmployerContributions * currentBitcoinPrice,
        averageVestingPeriod: this.calculateAverageVestingPeriod(scheme),
      },
    };
  }
  
  private static getCurrentMilestone(scheme: any, month: number) {
    const sortedMilestones = [...scheme.vestingSchedule].sort((a, b) => a.months - b.months);
    
    for (let i = sortedMilestones.length - 1; i >= 0; i--) {
      if (month >= sortedMilestones[i].months) {
        return sortedMilestones[i];
      }
    }
    
    return {
      employeeContributionPercent: 100,
      grantPercent: 0,
    };
  }
  
  private static calculateVestedAmount(
    totalGrants: number,
    milestone: any
  ): number {
    const vestedGrants = totalGrants * (milestone.grantPercent / 100);
    
    return vestedGrants;
  }
  
  private static calculateBonuses(scheme: any, month: number, totalBalance: number): number {
    if (!scheme.bonuses) return 0;
    
    return scheme.bonuses.reduce((total: number, bonus: any) => {
      if (month >= bonus.months) {
        return total + (totalBalance * bonus.bonusPercent / 100);
      }
      return total;
    }, 0);
  }
  
  private static calculateAverageVestingPeriod(scheme: any): number {
    const weightedSum = scheme.vestingSchedule.reduce((sum: number, milestone: any) => {
      return sum + (milestone.months * milestone.grantPercent);
    }, 0);
    
    const totalWeight = scheme.vestingSchedule.reduce((sum: number, milestone: any) => {
      return sum + milestone.grantPercent;
    }, 0);
    
    return weightedSum / totalWeight;
  }
}