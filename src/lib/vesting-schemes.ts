import { VestingScheme } from '@/types/vesting';

export const VESTING_SCHEMES: VestingScheme[] = [
  {
    id: 'accelerator',
    name: 'Pioneer',
    description: 'Big award for max impact',
    initialGrant: 0.02,
    employeeMatchPercentage: 0,
    icon: 'rocket',
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
    description: 'The Goldy Locks zone',
    initialGrant: 0.015,
    employeeMatchPercentage: 0,
    annualGrant: 0.001,
    maxAnnualGrants: 5, // 5 annual grants in years 1-5
    icon: 'chart-trending-up',
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
    description: 'Low cost yearly awards',
    initialGrant: 0.002, // First grant at year 0
    employeeMatchPercentage: 0,
    annualGrant: 0.002,
    maxAnnualGrants: 9, // 9 additional annual grants in years 1-9
    icon: 'building-office',
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
];;


