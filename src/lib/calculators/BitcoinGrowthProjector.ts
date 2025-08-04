export interface GrowthProjection {
  month: number;
  price: number;
  growthFromStart: number;
}

export class BitcoinGrowthProjector {
  private basePrice: number;
  private annualGrowthRate: number;
  
  constructor(basePrice: number, annualGrowthRate: number) {
    this.basePrice = basePrice;
    this.annualGrowthRate = annualGrowthRate;
  }
  
  /**
   * Calculate the monthly growth rate from annual rate
   */
  getMonthlyGrowthRate(): number {
    return this.annualGrowthRate / 12 / 100;
  }
  
  /**
   * Project Bitcoin price for a specific month
   */
  projectPrice(month: number): number {
    const monthlyRate = this.getMonthlyGrowthRate();
    return this.basePrice * Math.pow(1 + monthlyRate, month);
  }
  
  /**
   * Generate price projections for a range of months
   */
  generateProjections(months: number[]): GrowthProjection[] {
    return months.map(month => ({
      month,
      price: this.projectPrice(month),
      growthFromStart: ((this.projectPrice(month) / this.basePrice) - 1) * 100
    }));
  }
  
  /**
   * Calculate compound annual growth rate (CAGR) for a period
   */
  calculateCAGR(endValue: number, startValue: number, years: number): number {
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }
  
  /**
   * Project future value for a Bitcoin amount
   */
  projectFutureValue(bitcoinAmount: number, months: number): number {
    const futurePrice = this.projectPrice(months);
    return bitcoinAmount * futurePrice;
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
        finalValue: bitcoinAmount * finalPrice,
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
