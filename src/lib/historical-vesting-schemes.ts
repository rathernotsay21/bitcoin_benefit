import { VestingScheme } from '@/types/vesting';

// Historical calculator uses larger default amounts for more meaningful analysis
// All three schemes are designed to total exactly 0.1 BTC over their full vesting period
export const HISTORICAL_VESTING_SCHEMES: VestingScheme[] = [
  {
    id: 'accelerator',
    name: 'Pioneer',
    description: 'Give a big upfront for maximum impact.',
    initialGrant: 0.1, // Total: 0.1 BTC (all upfront)
    employeeMatchPercentage: 0,
    icon: '🚀',
    tagline: 'Impact',
    bestFor: 'Bold companies ready to lead',
    riskLevel: 'High',
    vestingSchedule: [
      {
        months: 0,
        employeeContributionPercent: 100,
        grantPercent: 0,
        description: 'No award unlocked yet',
      },
      {
        months: 60,
        employeeContributionPercent: 100,
        grantPercent: 50,
        description: '50% unlocked at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        grantPercent: 100,
        description: '100% unlocked at 10 years',
      },
    ],
  },
  {
    id: 'steady-builder',
    name: 'Stacker',
    description: 'Smart starting award plus yearly additions for five years.',
    initialGrant: 0.05, // Initial grant
    employeeMatchPercentage: 0,
    annualGrant: 0.01, // 0.01 BTC per year
    maxAnnualGrants: 5, // Total: 0.05 + (0.01 × 5) = 0.1 BTC
    icon: '📈',
    tagline: 'Balance',
    bestFor: 'Growing businesses',
    riskLevel: 'Medium',
    vestingSchedule: [
      {
        months: 0,
        employeeContributionPercent: 100,
        grantPercent: 0,
        description: 'Immediate access to contributions',
      },
      {
        months: 60,
        employeeContributionPercent: 100,
        grantPercent: 50,
        description: '50% unlocked at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        grantPercent: 100,
        description: '100% unlocked at 10 years',
      },
    ],
  },
  {
    id: 'slow-burn',
    name: 'Builder',
    description: 'Yearly awards only - keeps costs low and predictable.',
    initialGrant: 0.0, // No initial grant
    employeeMatchPercentage: 0,
    annualGrant: 0.01, // 0.01 BTC per year
    maxAnnualGrants: 10, // Total: 0.0 + (0.01 × 10) = 0.1 BTC
    icon: '🏗️',
    tagline: 'Low Cost',
    bestFor: 'Budget-conscious companies',
    riskLevel: 'Low',
    vestingSchedule: [
      {
        months: 0,
        employeeContributionPercent: 100,
        grantPercent: 0,
        description: 'Immediate access to contributions',
      },
      {
        months: 60,
        employeeContributionPercent: 100,
        grantPercent: 50,
        description: '50% unlocked at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        grantPercent: 100,
        description: '100% unlocked at 10 years',
      },
    ],
  },
];