export interface TaxCalculationResult {
  grossValue: number;
  taxableIncome: number;
  incomeTax: number;
  capitalGainsTax: number;
  totalTax: number;
  netValue: number;
  effectiveTaxRate: number;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export class TaxImplicationCalculator {
  private incomeTaxBrackets: TaxBracket[] = [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 }
  ];
  
  private capitalGainsRates = {
    shortTerm: 0.37, // Taxed as ordinary income at highest bracket
    longTerm: {
      low: 0,
      medium: 0.15,
      high: 0.20
    }
  };
  
  /**
   * Calculate income tax based on progressive tax brackets
   */
  calculateIncomeTax(taxableIncome: number): number {
    let tax = 0;
    let previousMax = 0;
    
    for (const bracket of this.incomeTaxBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        tax += taxableInBracket * bracket.rate;
      }
    }
    
    return tax;
  }
  
  /**
   * Calculate capital gains tax based on holding period
   */
  calculateCapitalGainsTax(
    gains: number,
    isLongTerm: boolean,
    annualIncome: number
  ): number {
    if (!isLongTerm) {
      // Short-term gains taxed as ordinary income
      return gains * this.capitalGainsRates.shortTerm;
    }
    
    // Long-term capital gains rates based on income
    let rate: number;
    if (annualIncome < 44625) {
      rate = this.capitalGainsRates.longTerm.low;
    } else if (annualIncome < 492300) {
      rate = this.capitalGainsRates.longTerm.medium;
    } else {
      rate = this.capitalGainsRates.longTerm.high;
    }
    
    return gains * rate;
  }
  
  /**
   * Calculate tax implications for vested Bitcoin
   */
  calculateVestingTax(
    vestedBitcoinValue: number,
    costBasis: number,
    holdingPeriodMonths: number,
    annualIncome: number
  ): TaxCalculationResult {
    // Income tax on vested value
    const taxableIncome = vestedBitcoinValue;
    const incomeTax = this.calculateIncomeTax(taxableIncome + annualIncome) - this.calculateIncomeTax(annualIncome);
    
    // Capital gains tax on appreciation
    const gains = Math.max(0, vestedBitcoinValue - costBasis);
    const isLongTerm = holdingPeriodMonths >= 12;
    const capitalGainsTax = this.calculateCapitalGainsTax(gains, isLongTerm, annualIncome);
    
    const totalTax = incomeTax + capitalGainsTax;
    const netValue = vestedBitcoinValue - totalTax;
    const effectiveTaxRate = vestedBitcoinValue > 0 ? (totalTax / vestedBitcoinValue) * 100 : 0;
    
    return {
      grossValue: vestedBitcoinValue,
      taxableIncome,
      incomeTax,
      capitalGainsTax,
      totalTax,
      netValue,
      effectiveTaxRate
    };
  }
  
  /**
   * Calculate tax-efficient withdrawal strategy
   */
  calculateWithdrawalStrategy(
    totalBitcoinValue: number,
    yearsToWithdraw: number,
    annualIncome: number
  ): Array<{
    year: number;
    withdrawalAmount: number;
    tax: number;
    netAmount: number;
  }> {
    const annualWithdrawal = totalBitcoinValue / yearsToWithdraw;
    const strategy = [];
    
    for (let year = 1; year <= yearsToWithdraw; year++) {
      const tax = this.calculateCapitalGainsTax(
        annualWithdrawal,
        true, // Assume long-term holding
        annualIncome
      );
      
      strategy.push({
        year,
        withdrawalAmount: annualWithdrawal,
        tax,
        netAmount: annualWithdrawal - tax
      });
    }
    
    return strategy;
  }
  
  /**
   * Compare tax implications of different vesting schedules
   */
  compareVestingSchedules(
    schedules: Array<{
      name: string;
      vestedAmounts: Array<{ month: number; value: number }>;
    }>,
    annualIncome: number
  ): Array<{
    scheduleName: string;
    totalTax: number;
    effectiveRate: number;
    taxSavings: number;
  }> {
    const results = schedules.map(schedule => {
      const totalValue = schedule.vestedAmounts.reduce((sum, v) => sum + v.value, 0);
      const totalTax = schedule.vestedAmounts.reduce((sum, vesting) => {
        const tax = this.calculateVestingTax(
          vesting.value,
          0, // Assuming zero cost basis for simplicity
          vesting.month,
          annualIncome
        );
        return sum + tax.totalTax;
      }, 0);
      
      return {
        scheduleName: schedule.name,
        totalTax,
        effectiveRate: (totalTax / totalValue) * 100,
        taxSavings: 0 // Will be calculated relative to highest tax schedule
      };
    });
    
    // Calculate tax savings relative to highest tax schedule
    const maxTax = Math.max(...results.map(r => r.totalTax));
    results.forEach(result => {
      result.taxSavings = maxTax - result.totalTax;
    });
    
    return results;
  }
}
