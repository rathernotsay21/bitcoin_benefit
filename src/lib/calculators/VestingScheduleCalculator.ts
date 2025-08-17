import { VestingTimelinePoint, CustomVestingEvent } from '@/types/vesting';

interface VestingMilestone {
  months: number;
  grantPercent: number;
  employeeContributionPercent?: number;
}

interface VestingSchedule {
  milestones: VestingMilestone[];
  bonuses?: Array<{
    months: number;
    bonusPercent: number;
  }>;
  customVestingEvents?: CustomVestingEvent[];
}

export class VestingScheduleCalculator {
  private schedule: VestingSchedule;
  
  constructor(schedule: VestingSchedule) {
    this.schedule = schedule;
  }
  
  /**
   * Get the current vesting milestone for a given month
   */
  getCurrentMilestone(month: number): VestingMilestone {
    // If custom vesting events are defined, use them instead
    if (this.schedule.customVestingEvents && this.schedule.customVestingEvents.length > 0) {
      const sortedEvents = [...this.schedule.customVestingEvents].sort((a, b) => a.timePeriod - b.timePeriod);
      
      // Find the applicable custom vesting event
      let applicableEvent = null;
      for (let i = sortedEvents.length - 1; i >= 0; i--) {
        if (month >= sortedEvents[i].timePeriod) {
          applicableEvent = sortedEvents[i];
          break;
        }
      }
      
      if (applicableEvent) {
        return {
          employeeContributionPercent: 100,
          grantPercent: applicableEvent.percentageVested,
          months: applicableEvent.timePeriod
        };
      }
      
      return {
        employeeContributionPercent: 100,
        grantPercent: 0,
        months: 0
      };
    }
    
    // Use default milestones if no custom events
    const sortedMilestones = [...this.schedule.milestones].sort((a, b) => a.months - b.months);
    
    for (let i = sortedMilestones.length - 1; i >= 0; i--) {
      if (month >= sortedMilestones[i].months) {
        return sortedMilestones[i];
      }
    }
    
    return {
      employeeContributionPercent: 100,
      grantPercent: 0,
      months: 0
    };
  }
  
  /**
   * Calculate vested amount based on total grants and current milestone
   */
  calculateVestedAmount(totalGrants: number, month: number): number {
    const milestone = this.getCurrentMilestone(month);
    return totalGrants * (milestone.grantPercent / 100);
  }
  
  /**
   * Calculate bonuses for a given month
   */
  calculateBonuses(month: number, totalBalance: number): number {
    if (!this.schedule.bonuses) return 0;
    
    return this.schedule.bonuses.reduce((total, bonus) => {
      if (month >= bonus.months) {
        return total + (totalBalance * bonus.bonusPercent / 100);
      }
      return total;
    }, 0);
  }
  
  /**
   * Calculate average vesting period weighted by grant percentages
   */
  calculateAverageVestingPeriod(): number {
    const weightedSum = this.schedule.milestones.reduce((sum, milestone) => {
      return sum + (milestone.months * milestone.grantPercent);
    }, 0);
    
    const totalWeight = this.schedule.milestones.reduce((sum, milestone) => {
      return sum + milestone.grantPercent;
    }, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  /**
   * Generate a complete vesting timeline
   */
  generateTimeline(
    initialGrant: number,
    annualGrant: number | undefined,
    maxMonths: number,
    schemeId?: string
  ): Array<{
    month: number;
    vestedAmount: number;
    totalGrants: number;
    employerBalance: number;
  }> {
    const timeline = [];
    let employerBalance = initialGrant;
    let totalGrantsAccumulated = initialGrant;
    
    for (let month = 0; month <= maxMonths; month++) {
      // Add annual grants based on scheme rules
      if (annualGrant && month > 0 && month % 12 === 0) {
        if (this.shouldAddAnnualGrant(schemeId, month)) {
          employerBalance += annualGrant;
          totalGrantsAccumulated += annualGrant;
        }
      }
      
      const vestedAmount = this.calculateVestedAmount(totalGrantsAccumulated, month);
      const bonusAmount = this.calculateBonuses(month, employerBalance);
      
      timeline.push({
        month,
        vestedAmount: vestedAmount + bonusAmount,
        totalGrants: totalGrantsAccumulated,
        employerBalance: employerBalance + bonusAmount
      });
    }
    
    return timeline;
  }
  
  private shouldAddAnnualGrant(schemeId: string | undefined, month: number): boolean {
    if (!schemeId) return true;
    
    switch (schemeId) {
      case 'steady-builder':
        return month <= 60; // 5 years
      case 'slow-burn':
        return month <= 108; // 9 years (grants at months 12, 24, 36, 48, 60, 72, 84, 96, 108)
      case 'custom':
        return month <= 120; // 10 years
      default:
        return true;
    }
  }
}
