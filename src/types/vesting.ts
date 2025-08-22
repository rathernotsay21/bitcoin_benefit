// Optimized interface with readonly for better type inference
export interface VestingScheme {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly initialGrant: number; // in BTC
  readonly employeeMatchPercentage: 0; // Always 0, simplified for performance
  readonly annualGrant?: number; // in BTC - additional grant each year
  readonly vestingSchedule: readonly VestingMilestone[];
  readonly bonuses?: readonly VestingBonus[];
  readonly maxAnnualGrants?: number;
  readonly customVestingEvents?: readonly CustomVestingEvent[]; // Custom vesting schedule if defined
  // UI properties for enhanced display
  readonly icon?: string;
  readonly tagline?: string;
  readonly bestFor?: string;
  readonly riskLevel?: string;
}

export interface VestingMilestone {
  readonly months: number;
  readonly employeeContributionPercent: 100; // Always 100%, literal for optimization
  readonly grantPercent: number;
  readonly description: string;
}

// Custom vesting event for flexible scheduling
export interface CustomVestingEvent {
  id: string;
  timePeriod: number; // in months (3 for 90 days, 12 for 1 year, etc.)
  percentageVested: number; // cumulative percentage vested at this point
  label: string; // e.g., "90 days", "1 year", etc.
}

export interface VestingBonus {
  months: number;
  bonusPercent: number;
  description: string;
  basedOn: 'balance' | 'contributions' | 'grant';
}

export interface CalculationInputs {
  scheme: VestingScheme;
  currentBitcoinPrice: number;
  projectedBitcoinGrowth: number; // annual percentage
}

export interface VestingCalculationResult {
  timeline: VestingTimelinePoint[];
  totalCost: number;
  totalBitcoinNeeded: number;
  summary: VestingSummary;
}

export interface VestingTimelinePoint {
  month: number;
  employeeBalance: number;
  employerBalance: number;
  vestedAmount: number;
  totalBalance: number;
  bitcoinPrice: number;
  usdValue: number;
}

export interface VestingSummary {
  maxEmployerCommitment: number;
  averageVestingPeriod: number;
}

export interface BitcoinPriceData {
  price: number;
  change24h: number;
  lastUpdated: Date;
}

// Historical Bitcoin Calculator Types

// Historical price data structure
export interface BitcoinYearlyPrices {
  year: number;
  high: number;
  low: number;
  average: number;
  open: number;
  close: number;
}

// Cost basis calculation method
export type CostBasisMethod = 'high' | 'low' | 'average';

// Grant event for historical tracking
export interface GrantEvent {
  year: number;
  month: number;
  amount: number; // BTC amount
  type: 'initial' | 'annual';
}

// Historical calculation inputs
export interface HistoricalCalculationInputs {
  scheme: VestingScheme;
  startingYear: number;
  costBasisMethod: CostBasisMethod;
  historicalPrices: Record<number, BitcoinYearlyPrices>;
  currentBitcoinPrice: number;
}

// Historical timeline point
export interface HistoricalTimelinePoint {
  year: number;
  month: number;
  cumulativeBitcoin: number;
  cumulativeCostBasis: number;
  currentValue: number;
  vestedAmount: number;
  grants: GrantEvent[];
}

// Historical calculation result
export interface HistoricalCalculationResult {
  timeline: HistoricalTimelinePoint[];
  totalBitcoinGranted: number;
  totalCostBasis: number;
  currentTotalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  grantBreakdown: GrantEvent[];
  summary: {
    startingYear: number;
    endingYear: number;
    yearsAnalyzed: number;
    costBasisMethod: CostBasisMethod;
    averageAnnualGrant: number;
  };
}
