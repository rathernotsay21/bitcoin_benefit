// Tax calculation types
export interface TaxCalculationParams {
  btcAmount: number;
  btcPrice: number;
  costBasis: number;
  holdingPeriod: number;
  state?: string;
  filingStatus?: FilingStatus;
}

export interface TaxImplicationResult {
  proceeds: number;
  costBasis: number;
  gain: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  netProceeds: number;
  effectiveRate: number;
  taxType: 'long-term' | 'short-term';
}

export enum FilingStatus {
  SINGLE = 'SINGLE',
  MARRIED_JOINTLY = 'MARRIED_JOINTLY',
  MARRIED_SEPARATELY = 'MARRIED_SEPARATELY',
  HEAD_OF_HOUSEHOLD = 'HEAD_OF_HOUSEHOLD'
}

export interface QuarterlyPayment {
  quarter: string;
  amount: number;
  dueDate: string;
}

export interface NIITParams {
  income: number;
  investmentIncome: number;
  filingStatus: FilingStatus;
}

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
  private readonly TAX_BRACKETS_2024: TaxBracket[] = [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Number.MAX_SAFE_INTEGER, rate: 0.37 }
  ];

  private readonly STATE_TAX_RATES: Record<string, number> = {
    'CA': 0.133,
    'NY': 0.109,
    'TX': 0,
    'FL': 0,
    'WA': 0,
    'DEFAULT': 0.05
  };

  calculateTax(params: TaxCalculationParams): TaxImplicationResult {
    const {
      btcAmount,
      btcPrice,
      costBasis,
      holdingPeriod,
      state = 'DEFAULT',
      filingStatus = FilingStatus.SINGLE
    } = params;

    const proceeds = btcAmount * btcPrice;
    const gain = proceeds - costBasis;
    
    // Determine if long-term or short-term capital gains
    const isLongTerm = holdingPeriod >= 365;
    
    // Calculate federal tax
    const federalTax = isLongTerm 
      ? this.calculateLongTermCapitalGainsTax(gain, filingStatus)
      : this.calculateShortTermCapitalGainsTax(gain, filingStatus);
    
    // Calculate state tax
    const stateRate = this.STATE_TAX_RATES[state] || this.STATE_TAX_RATES['DEFAULT'];
    const stateTax = gain * stateRate;
    
    // Calculate net proceeds
    const totalTax = federalTax + stateTax;
    const netProceeds = proceeds - totalTax;
    const effectiveRate = totalTax / proceeds;
    
    return {
      proceeds,
      costBasis,
      gain,
      federalTax,
      stateTax,
      totalTax,
      netProceeds,
      effectiveRate,
      taxType: isLongTerm ? 'long-term' : 'short-term'
    };
  }

  private calculateLongTermCapitalGainsTax(gain: number, filingStatus: FilingStatus): number {
    // Long-term capital gains rates (simplified for single filers)
    const rates = [
      { threshold: 44625, rate: 0 },
      { threshold: 492300, rate: 0.15 },
      { threshold: Number.MAX_SAFE_INTEGER, rate: 0.20 }
    ];
    
    return this.calculateProgressiveTax(gain, rates);
  }

  private calculateShortTermCapitalGainsTax(gain: number, filingStatus: FilingStatus): number {
    // Short-term gains taxed as ordinary income
    return this.calculateOrdinaryIncomeTax(gain, filingStatus);
  }

  private calculateOrdinaryIncomeTax(income: number, filingStatus: FilingStatus): number {
    let tax = 0;
    let remainingIncome = income;
    
    for (const bracket of this.TAX_BRACKETS_2024) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = bracket.max === Number.MAX_SAFE_INTEGER
        ? remainingIncome
        : Math.min(remainingIncome, bracket.max - bracket.min);
      
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    
    return tax;
  }

  private calculateProgressiveTax(amount: number, rates: Array<{threshold: number, rate: number}>): number {
    for (let i = rates.length - 1; i >= 0; i--) {
      if (amount > rates[i].threshold) {
        return amount * rates[i].rate;
      }
    }
    return 0;
  }

  estimateQuarterlyPayments(annualTaxLiability: number): QuarterlyPayment[] {
    const quarterlyAmount = annualTaxLiability / 4;
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const dueDates = ['April 15', 'June 15', 'September 15', 'January 15'];
    
    return quarters.map((quarter, index) => ({
      quarter,
      amount: quarterlyAmount,
      dueDate: dueDates[index]
    }));
  }

  calculateNIIT(params: NIITParams): number {
    const { income, investmentIncome, filingStatus } = params;
    
    const thresholds: Record<FilingStatus, number> = {
      [FilingStatus.SINGLE]: 200000,
      [FilingStatus.MARRIED_JOINTLY]: 250000,
      [FilingStatus.MARRIED_SEPARATELY]: 125000,
      [FilingStatus.HEAD_OF_HOUSEHOLD]: 200000
    };
    
    const threshold = thresholds[filingStatus];
    
    if (income <= threshold) return 0;
    
    const taxableAmount = Math.min(
      investmentIncome,
      income - threshold
    );
    
    return taxableAmount * 0.038; // 3.8% NIIT rate
  }
}
