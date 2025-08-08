export interface RiskMetrics {
  volatility: number;
  valueAtRisk: number;
  sharpeRatio: number;
  maxDrawdown: number;
  probabilityOfLoss: number;
}

export interface RiskScenario {
  name: string;
  probability: number;
  bitcoinPriceChange: number;
  impact: string;
}

export class RiskAnalysisEngine {
  private historicalVolatility: number;
  private riskFreeRate: number;

  constructor(options: { historicalVolatility?: number; riskFreeRate?: number } = {}) {
    this.historicalVolatility = options.historicalVolatility || 0.70; // Default to 70% annual volatility
    this.riskFreeRate = options.riskFreeRate || 0.045; // Default to 4.5% risk-free rate
  }
  
  /**
   * Calculate Value at Risk (VaR) using parametric method
   */
  calculateValueAtRisk(
    portfolioValue: number,
    confidenceLevel: number,
    timePeriodDays: number
  ): number {
    // Z-scores for common confidence levels
    const zScores: { [key: number]: number } = {
      0.90: 1.28,
      0.95: 1.65,
      0.99: 2.33
    };
    
    const zScore = zScores[confidenceLevel] || 1.65;
    const dailyVolatility = this.historicalVolatility / Math.sqrt(252); // Trading days per year
    const periodVolatility = dailyVolatility * Math.sqrt(timePeriodDays);
    
    return portfolioValue * zScore * periodVolatility;
  }
  
  /**
   * Calculate portfolio volatility with Bitcoin allocation
   */
  calculatePortfolioVolatility(
    bitcoinAllocation: number,
    otherAssetsVolatility: number = 0.15
  ): number {
    const bitcoinWeight = bitcoinAllocation / 100;
    const otherWeight = 1 - bitcoinWeight;
    
    // Assuming low correlation between Bitcoin and traditional assets
    const correlation = 0.2;
    
    const variance = 
      Math.pow(bitcoinWeight * this.historicalVolatility, 2) +
      Math.pow(otherWeight * otherAssetsVolatility, 2) +
      2 * bitcoinWeight * otherWeight * this.historicalVolatility * otherAssetsVolatility * correlation;
    
    return Math.sqrt(variance);
  }
  
  /**
   * Calculate Sharpe Ratio for Bitcoin investment
   */
  calculateSharpeRatio(
    expectedReturn: number,
    volatility: number = this.historicalVolatility
  ): number {
    return (expectedReturn - this.riskFreeRate) / volatility;
  }
  
  /**
   * Calculate maximum drawdown based on historical patterns
   */
  calculateMaxDrawdown(
    currentValue: number,
    confidenceLevel: number = 0.95
  ): number {
    // Historical Bitcoin drawdowns
    const historicalDrawdowns = [0.93, 0.84, 0.70, 0.50, 0.35];
    const index = Math.floor((1 - confidenceLevel) * historicalDrawdowns.length);
    
    return currentValue * historicalDrawdowns[Math.min(index, historicalDrawdowns.length - 1)];
  }
  
  /**
   * Calculate probability of loss over a time period
   */
  calculateProbabilityOfLoss(
    expectedReturn: number,
    timePeriodYears: number
  ): number {
    const annualizedVolatility = this.historicalVolatility * Math.sqrt(timePeriodYears);
    const zScore = -expectedReturn / annualizedVolatility;
    
    // Standard normal cumulative distribution approximation
    return this.normalCDF(zScore);
  }
  
  /**
   * Normal cumulative distribution function approximation
   */
  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
  }
  
  /**
   * Generate risk scenarios for stress testing
   */
  generateRiskScenarios(): RiskScenario[] {
    return [
      {
        name: 'Severe Market Crash',
        probability: 0.05,
        bitcoinPriceChange: -80,
        impact: 'Major loss of value, similar to 2018 crash'
      },
      {
        name: 'Significant Correction',
        probability: 0.15,
        bitcoinPriceChange: -50,
        impact: 'Substantial loss, typical crypto winter'
      },
      {
        name: 'Moderate Downturn',
        probability: 0.25,
        bitcoinPriceChange: -30,
        impact: 'Notable loss, common in volatile markets'
      },
      {
        name: 'Stable Growth',
        probability: 0.30,
        bitcoinPriceChange: 20,
        impact: 'Modest gains, below historical average'
      },
      {
        name: 'Strong Bull Market',
        probability: 0.20,
        bitcoinPriceChange: 100,
        impact: 'Significant gains, typical bull cycle'
      },
      {
        name: 'Extreme Rally',
        probability: 0.05,
        bitcoinPriceChange: 300,
        impact: 'Exceptional gains, rare but possible'
      }
    ];
  }
  
  /**
   * Calculate risk-adjusted returns
   */
  calculateRiskAdjustedReturns(
    scenarios: RiskScenario[],
    initialInvestment: number
  ): {
    expectedValue: number;
    standardDeviation: number;
    bestCase: number;
    worstCase: number;
    probabilityOfProfit: number;
  } {
    // Calculate expected value
    const expectedValue = scenarios.reduce((sum, scenario) => {
      const finalValue = initialInvestment * (1 + scenario.bitcoinPriceChange / 100);
      return sum + (scenario.probability * finalValue);
    }, 0);
    
    // Calculate standard deviation
    const variance = scenarios.reduce((sum, scenario) => {
      const finalValue = initialInvestment * (1 + scenario.bitcoinPriceChange / 100);
      return sum + (scenario.probability * Math.pow(finalValue - expectedValue, 2));
    }, 0);
    const standardDeviation = Math.sqrt(variance);
    
    // Find best and worst cases
    const values = scenarios.map(s => initialInvestment * (1 + s.bitcoinPriceChange / 100));
    const bestCase = Math.max(...values);
    const worstCase = Math.min(...values);
    
    // Calculate probability of profit
    const probabilityOfProfit = scenarios
      .filter(s => s.bitcoinPriceChange > 0)
      .reduce((sum, s) => sum + s.probability, 0);
    
    return {
      expectedValue,
      standardDeviation,
      bestCase,
      worstCase,
      probabilityOfProfit
    };
  }
  
  /**
   * Calculate comprehensive risk metrics
   */
  calculateRiskMetrics(
    portfolioValue: number,
    expectedAnnualReturn: number,
    timePeriodYears: number
  ): RiskMetrics {
    const volatility = this.historicalVolatility;
    const valueAtRisk = this.calculateValueAtRisk(portfolioValue, 0.95, timePeriodYears * 252);
    const sharpeRatio = this.calculateSharpeRatio(expectedAnnualReturn);
    const maxDrawdown = this.calculateMaxDrawdown(portfolioValue);
    const probabilityOfLoss = this.calculateProbabilityOfLoss(expectedAnnualReturn, timePeriodYears);
    
    return {
      volatility: volatility * 100,
      valueAtRisk,
      sharpeRatio,
      maxDrawdown,
      probabilityOfLoss: probabilityOfLoss * 100
    };
  }
  
  /**
   * Generate Monte Carlo simulation for portfolio outcomes
   */
  monteCarloSimulation(
    initialValue: number,
    annualReturn: number,
    years: number,
    simulations: number = 1000
  ): {
    median: number;
    percentile10: number;
    percentile90: number;
    probabilityOfDoubling: number;
  } {
    const results: number[] = [];
    const annualVolatility = this.historicalVolatility;
    
    for (let i = 0; i < simulations; i++) {
      let value = initialValue;
      
      for (let year = 0; year < years; year++) {
        // Generate random return based on normal distribution
        const randomReturn = this.generateNormalRandom(annualReturn, annualVolatility);
        value *= (1 + randomReturn);
      }
      
      results.push(value);
    }
    
    // Sort results for percentile calculations
    results.sort((a, b) => a - b);
    
    const median = results[Math.floor(simulations * 0.5)];
    const percentile10 = results[Math.floor(simulations * 0.1)];
    const percentile90 = results[Math.floor(simulations * 0.9)];
    const probabilityOfDoubling = results.filter(r => r >= initialValue * 2).length / simulations;
    
    return {
      median,
      percentile10,
      percentile90,
      probabilityOfDoubling
    };
  }
  
  /**
   * Generate normal random number using Box-Muller transform
   */
  private generateNormalRandom(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }
}
