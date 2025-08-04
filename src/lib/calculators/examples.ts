// Example: Using the modular calculators independently

import {
  VestingScheduleCalculator,
  BitcoinGrowthProjector,
  TaxImplicationCalculator,
  EmployeeRetentionModeler,
  RiskAnalysisEngine
} from '@/lib/calculators';

// Example 1: Bitcoin Growth Projections
export function calculateBitcoinGrowth() {
  const currentPrice = 50000;
  const annualGrowth = 15; // 15% annual growth
  
  const projector = new BitcoinGrowthProjector(currentPrice, annualGrowth);
  
  // Project price in 5 years
  const fiveYearPrice = projector.projectPrice(60); // 60 months
  console.log(`5-year projected price: $${fiveYearPrice.toFixed(2)}`);
  
  // Generate scenario analysis
  const scenarios = projector.generateScenarioAnalysis(
    0.1, // 0.1 BTC
    60,  // 5 years
    [
      { name: 'Bear Market', growthRate: -10 },
      { name: 'Stable', growthRate: 10 },
      { name: 'Bull Market', growthRate: 50 }
    ]
  );
  
  return scenarios;
}

// Example 2: Tax Implications
export function calculateTaxes() {
  const calculator = new TaxImplicationCalculator();
  
  const vestingValue = 100000; // $100k vested Bitcoin
  const costBasis = 20000;     // $20k original cost
  const holdingMonths = 18;     // 18 months held
  const annualIncome = 80000;  // $80k salary
  
  const taxResult = calculator.calculateVestingTax(
    vestingValue,
    costBasis,
    holdingMonths,
    annualIncome
  );
  
  console.log(`Total tax: $${taxResult.totalTax.toFixed(2)}`);
  console.log(`Net value: $${taxResult.netValue.toFixed(2)}`);
  console.log(`Effective tax rate: ${taxResult.effectiveTaxRate.toFixed(1)}%`);
  
  return taxResult;
}

// Example 3: Employee Retention Analysis
export function analyzeRetention() {
  const modeler = new EmployeeRetentionModeler();
  
  const analysis = modeler.calculateCostEffectiveness(
    100,     // 100 employees
    50000,   // $50k vesting cost per employee
    60,      // 5-year vesting period
    120000   // $120k average salary
  );
  
  console.log('With vesting:', analysis.withVesting);
  console.log('Without vesting:', analysis.withoutVesting);
  console.log(`Incremental value: $${analysis.incrementalValue.toFixed(2)}`);
  
  return analysis;
}

// Example 4: Risk Analysis
export function analyzeRisk() {
  const riskEngine = new RiskAnalysisEngine();
  
  const portfolioValue = 1000000; // $1M portfolio
  const expectedReturn = 0.15;    // 15% expected return
  const timeYears = 5;            // 5-year horizon
  
  const riskMetrics = riskEngine.calculateRiskMetrics(
    portfolioValue,
    expectedReturn,
    timeYears
  );
  
  console.log(`Volatility: ${riskMetrics.volatility.toFixed(1)}%`);
  console.log(`Value at Risk (95%): $${riskMetrics.valueAtRisk.toFixed(2)}`);
  console.log(`Sharpe Ratio: ${riskMetrics.sharpeRatio.toFixed(2)}`);
  console.log(`Probability of Loss: ${riskMetrics.probabilityOfLoss.toFixed(1)}%`);
  
  // Monte Carlo simulation
  const simulation = riskEngine.monteCarloSimulation(
    portfolioValue,
    expectedReturn,
    timeYears,
    10000 // 10,000 simulations
  );
  
  console.log(`Median outcome: $${simulation.median.toFixed(2)}`);
  console.log(`10th percentile: $${simulation.percentile10.toFixed(2)}`);
  console.log(`90th percentile: $${simulation.percentile90.toFixed(2)}`);
  console.log(`Probability of doubling: ${(simulation.probabilityOfDoubling * 100).toFixed(1)}%`);
  
  return { riskMetrics, simulation };
}

// Example 5: Complete Vesting Analysis
export function completeVestingAnalysis() {
  // Initialize all calculators
  const vestingCalc = new VestingScheduleCalculator({
    milestones: [
      { months: 0, grantPercent: 0 },
      { months: 60, grantPercent: 50 },
      { months: 120, grantPercent: 100 }
    ],
    bonuses: [
      { months: 60, bonusPercent: 10 },
      { months: 120, bonusPercent: 20 }
    ]
  });
  
  const growthProjector = new BitcoinGrowthProjector(50000, 15);
  const taxCalc = new TaxImplicationCalculator();
  const retentionModeler = new EmployeeRetentionModeler();
  const riskEngine = new RiskAnalysisEngine();
  
  // Generate vesting timeline
  const timeline = vestingCalc.generateTimeline(0.1, 0.01, 120);
  
  // Calculate final values
  const finalMonth = timeline[timeline.length - 1];
  const finalBitcoinPrice = growthProjector.projectPrice(120);
  const finalValue = finalMonth.employerBalance * finalBitcoinPrice;
  
  // Tax implications
  const taxes = taxCalc.calculateVestingTax(
    finalValue,
    5000, // Initial cost
    120,  // 10 years
    100000 // Annual income
  );
  
  // Retention impact
  const retentionCurve = retentionModeler.modelRetentionCurve(
    100,  // 100 employees
    [
      { months: 60, percent: 50 },
      { months: 120, percent: 100 }
    ],
    120   // 10-year projection
  );
  
  // Risk scenarios
  const riskScenarios = riskEngine.generateRiskScenarios();
  const riskAdjustedReturns = riskEngine.calculateRiskAdjustedReturns(
    riskScenarios,
    finalValue
  );
  
  return {
    timeline,
    finalValue,
    taxes,
    retentionImpact: retentionCurve[retentionCurve.length - 1],
    riskAnalysis: riskAdjustedReturns
  };
}
