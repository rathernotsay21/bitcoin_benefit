export interface VestingScheme {
  id: string;
  name: string;
  description: string;
  initialGrant: number; // in BTC
  employeeMatchPercentage: number; // Kept for backward compatibility, always 0
  maxAnnualMatch?: number; // in BTC - deprecated, not used
  annualGrant?: number; // in BTC - additional grant each year
  vestingSchedule: VestingMilestone[];
  bonuses?: VestingBonus[];
}

export interface VestingMilestone {
  months: number;
  employeeContributionPercent: number; // Always 100%
  employerContributionPercent: number; // Deprecated, not used
  grantPercent: number;
  description: string;
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
