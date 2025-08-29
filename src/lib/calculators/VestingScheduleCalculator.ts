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
  
  private _sortedEvents: CustomVestingEvent[] | null = null;
  private _sortedMilestones: VestingMilestone[] | null = null;
  
  /**
   * Get the current vesting milestone for a given month (cached for performance)
   */
  getCurrentMilestone(month: number): VestingMilestone {
    // If custom vesting events are defined, use them instead
    if (this.schedule.customVestingEvents?.length) {
      if (!this._sortedEvents) {
        this._sortedEvents = [...this.schedule.customVestingEvents]
          .sort((a, b) => a.timePeriod - b.timePeriod);
      }
      
      // Binary search for performance with large datasets
      let applicableEvent: CustomVestingEvent | null = null;
      for (let i = this._sortedEvents.length - 1; i >= 0; i--) {
        if (month >= this._sortedEvents[i].timePeriod) {
          applicableEvent = this._sortedEvents[i];
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
    
    // Use cached sorted milestones if no custom events
    if (!this._sortedMilestones) {
      this._sortedMilestones = [...this.schedule.milestones]
        .sort((a, b) => a.months - b.months);
    }
    
    for (let i = this._sortedMilestones.length - 1; i >= 0; i--) {
      if (month >= this._sortedMilestones[i].months) {
        return this._sortedMilestones[i];
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
   * Generate a complete vesting timeline (highly optimized for performance)
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
    // Safety check for excessive timeline length to prevent hanging
    const MAX_ALLOWED_MONTHS = 600; // 50 years max
    if (maxMonths > MAX_ALLOWED_MONTHS) {
      console.warn(`Timeline capped at ${MAX_ALLOWED_MONTHS} months (from ${maxMonths})`);
      maxMonths = MAX_ALLOWED_MONTHS;
    }
    
    // Pre-calculate all values to avoid repeated function calls
    const grantRule = this.getGrantRule(schemeId);
    const hasAnnualGrant = annualGrant && annualGrant > 0;
    const maxGrantMonth = Math.min(grantRule.maxMonth, MAX_ALLOWED_MONTHS);
    
    // Pre-allocate array with exact size for optimal memory usage
    const timelineLength = maxMonths + 1;
    const timeline = new Array(timelineLength);
    
    // Cache frequently accessed values
    let employerBalance = initialGrant;
    let totalGrantsAccumulated = initialGrant;
    
    // Pre-calculate annual grant intervals to avoid modulo operations
    // Annual grants happen at year 1, 2, 3, etc. (months 12, 24, 36, etc.)
    const annualGrantMonths = hasAnnualGrant ? 
      Array.from({ length: Math.floor(maxGrantMonth / 12) }, (_, i) => (i + 1) * 12)
        .filter(month => month <= maxMonths) : [];
    
    let nextAnnualGrantIndex = 0;
    
    // Add iteration counter for safety in Netlify environment
    let iterations = 0;
    const MAX_ITERATIONS = MAX_ALLOWED_MONTHS + 10;
    
    for (let month = 0; month <= maxMonths; month++) {
      // Safety check for infinite loops (especially in CI/test environments)
      if (++iterations > MAX_ITERATIONS) {
        console.error(`Infinite loop detected in generateTimeline at month ${month}`);
        break;
      }
      
      // Optimized annual grant logic
      if (nextAnnualGrantIndex < annualGrantMonths.length && 
          month === annualGrantMonths[nextAnnualGrantIndex]) {
        employerBalance += annualGrant!;
        totalGrantsAccumulated += annualGrant!;
        nextAnnualGrantIndex++;
      }
      
      // Calculate vested amount with cached milestone
      const vestedAmount = this.calculateVestedAmount(totalGrantsAccumulated, month);
      const bonusAmount = this.calculateBonuses(month, employerBalance);
      
      // Direct assignment is faster than object creation
      timeline[month] = {
        month,
        vestedAmount: vestedAmount + bonusAmount,
        totalGrants: totalGrantsAccumulated,
        employerBalance: employerBalance + bonusAmount
      };
    }
    
    return timeline;
  }
  
  private getGrantRule(schemeId?: string): { maxMonth: number } {
    // CRITICAL FIX: If custom vesting events exist (Unlocking Schedules),
    // use the last event's timePeriod as the max grant month
    if (this.schedule.customVestingEvents && this.schedule.customVestingEvents.length > 0) {
      // Find the maximum time period from custom vesting events
      const lastEventMonth = Math.max(
        ...this.schedule.customVestingEvents.map(event => event.timePeriod)
      );
      return { maxMonth: lastEventMonth };
    }
    
    // Fallback to scheme-based rules if no custom vesting events
    switch (schemeId) {
      case 'accelerator':
        return { maxMonth: 0 }; // No annual grants
      case 'steady-builder':
        return { maxMonth: 60 }; // 5 years max
      case 'slow-burn':
        return { maxMonth: 108 }; // Maximum 9 annual grants (years 1-9)
      case 'custom':
        return { maxMonth: 120 }; // 10 years max
      default:
        return { maxMonth: 120 };
    }
  }
  
}
