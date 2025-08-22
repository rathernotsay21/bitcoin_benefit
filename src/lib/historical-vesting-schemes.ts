import { VestingScheme } from '@/types/vesting';

// Historical calculator uses larger default amounts for more meaningful analysis
export const HISTORICAL_VESTING_SCHEMES: VestingScheme[] = [
  {
    id: 'accelerator',
    name: 'Pioneer',
    description: 'Give a big upfront for maximum impact.',
    initialGrant: 0.1, // Increased from 0.02 for historical analysis
    employeeMatchPercentage: 0,
    icon: '🚀',
    tagline: 'Impact',
    bestFor: 'Bold companies ready to lead',
    riskLevel: 'High',
    vestingSchedule: [
      {
        months: 0,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 0,
        description: 'No award earned yet',
      },
      {
        months: 60,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 50,
        description: '50% earned at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 100,
        description: '100% earned at 10 years',
      },
    ],
  },
  {
    id: 'steady-builder',
    name: 'Stacker',
    description: 'Smart starting award plus yearly additions for five years.',
    initialGrant: 0.05, // Increased from 0.015 for historical analysis
    employeeMatchPercentage: 0,
    annualGrant: 0.01, // Increased from 0.001 for historical analysis
    maxAnnualGrants: 5, // Annual grants for the first 5 years
    icon: '📈',
    tagline: 'Balance',
    bestFor: 'Growing businesses',
    riskLevel: 'Medium',
    vestingSchedule: [
      {
        months: 0,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 0,
        description: 'Immediate access to contributions',
      },
      {
        months: 60,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 50,
        description: '50% unlocked at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 100,
        description: '100% unlocked at 10 years',
      },
    ],
  },
  {
    id: 'slow-burn',
    name: 'Builder',
    description: 'Yearly awards only - keeps costs low and predictable.',
    initialGrant: 0.0, // Remains 0 as specified
    employeeMatchPercentage: 0,
    annualGrant: 0.02, // Increased from 0.002 for historical analysis
    maxAnnualGrants: 10,
    icon: '🏗️',
    tagline: 'Low Cost',
    bestFor: 'Budget-conscious companies',
    riskLevel: 'Low',
    vestingSchedule: [
      {
        months: 0,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 0,
        description: 'Immediate access to contributions',
      },
      {
        months: 60,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 50,
        description: '50% unlocked at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 100,
        description: '100% unlocked at 10 years',
      },
    ],
  },
];