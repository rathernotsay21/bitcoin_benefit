import { calculateUsdValue, validateSafeNumber } from '../bitcoin-precision';

export interface GrowthProjection {
  month: number;
  price: number;
  growthFromStart: number;
}

export class BitcoinGrowthProjector {
  private readonly basePrice: number;
  private readonly annualGrowthRate: number;
  private readonly monthlyGrowthRate: number; // Cache the calculated rate
  private readonly annualRateDecimal: number; // Pre-calculate decimal conversion
  
  constructor(basePrice: number, annualGrowthRate: number) {
    validateSafeNumber(basePrice, 'base Bitcoin price');
    validateSafeNumber(annualGrowthRate, 'annual growth rate');
    
    this.basePrice = basePrice;
    this.annualGrowthRate = annualGrowthRate;
    // Pre-calculate and cache expensive operations
    this.annualRateDecimal = annualGrowthRate / 100;
    this.monthlyGrowthRate = Math.pow(1 + this.annualRateDecimal, 1/12) - 1;
  }
  
  /**
   * Get the pre-calculated monthly growth rate (optimized)
   */
  getMonthlyGrowthRate(): number {
    return this.monthlyGrowthRate;
  }
  
  /**
   * Project Bitcoin price for a specific month (optimized)
   */
  projectPrice(month: number): number {
    // Use cached monthlyGrowthRate to avoid recalculation
    return this.basePrice * Math.pow(1 + this.monthlyGrowthRate, month);
  }
  
  /**
   * Generate price projections for a range of months (vectorized for performance)
   */
  generateProjections(months: number[]): GrowthProjection[] {
    const projections = new Array(months.length);
    const basePrice = this.basePrice; // Local variable for better performance
    const monthlyRate = this.monthlyGrowthRate;
    
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const price = basePrice * Math.pow(1 + monthlyRate, month);
      projections[i] = {
        month,
        price,
        growthFromStart: ((price / basePrice) - 1) * 100
      };
    }
    
    return projections;
  }
  
  /**
   * Calculate compound annual growth rate (CAGR) for a period
   */
  calculateCAGR(endValue: number, startValue: number, years: number): number {
    // Input validation to prevent division by zero and invalid calculations
    if (!Number.isFinite(endValue) || !Number.isFinite(startValue) || !Number.isFinite(years)) {
      throw new Error('All inputs must be finite numbers');
    }
    
    if (startValue <= 0) {
      throw new Error('Starting value must be greater than zero');
    }
    
    if (endValue <= 0) {
      throw new Error('Ending value must be greater than zero');
    }
    
    if (years <= 0) {
      throw new Error('Years must be greater than zero');
    }
    
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }
  
  /**
   * Project future value for a Bitcoin amount
   */
  projectFutureValue(bitcoinAmount: number, months: number): number {
    validateSafeNumber(bitcoinAmount, 'Bitcoin amount for projection');
    const futurePrice = this.projectPrice(months);
    return calculateUsdValue(bitcoinAmount, futurePrice);
  }
  
  /**
   * Calculate the value growth multiple over a period
   */
  calculateGrowthMultiple(months: number): number {
    return this.projectPrice(months) / this.basePrice;
  }
  
  /**
   * Generate scenario analysis with different growth rates
   */
  generateScenarioAnalysis(
    bitcoinAmount: number,
    months: number,
    scenarios: { name: string; growthRate: number }[]
  ): Array<{
    scenario: string;
    growthRate: number;
    finalPrice: number;
    finalValue: number;
    growthMultiple: number;
  }> {
    return scenarios.map(scenario => {
      const projector = new BitcoinGrowthProjector(this.basePrice, scenario.growthRate);
      const finalPrice = projector.projectPrice(months);
      
      return {
        scenario: scenario.name,
        growthRate: scenario.growthRate,
        finalPrice,
        finalValue: calculateUsdValue(bitcoinAmount, finalPrice),
        growthMultiple: finalPrice / this.basePrice
      };
    });
  }
  
  /**
   * Calculate how long it takes to reach a target value
   */
  monthsToReachTarget(currentValue: number, targetValue: number): number | null {
    if (this.annualGrowthRate <= 0 || targetValue <= currentValue) {
      return null;
    }
    
    const monthlyRate = this.getMonthlyGrowthRate();
    return Math.log(targetValue / currentValue) / Math.log(1 + monthlyRate);
  }
}
