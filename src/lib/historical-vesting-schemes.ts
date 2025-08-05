import { VestingScheme } from '@/types/vesting';

// Historical calculator uses larger default amounts for more meaningful analysis
export const HISTORICAL_VESTING_SCHEMES: VestingScheme[] = [
  {
    id: 'accelerator',
    name: 'Bitcoin Pioneer',
    description: 'Jump-start your team\'s Bitcoin journey with immediate grants. Perfect for companies ready to lead in digital asset compensation.',
    initialGrant: 0.1, // Increased from 0.02 for historical analysis
    employeeMatchPercentage: 0,
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
        description: '50% vested at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 100,
        description: '100% vested at 10 years',
      },
    ],
  },
  {
    id: 'steady-builder',
    name: 'Dollar Cost Advantage',
    description: 'Minimize market timing risk with strategic yearly distributions. Ideal for conservative approaches to Bitcoin adoption.',
    initialGrant: 0.05, // Increased from 0.015 for historical analysis
    employeeMatchPercentage: 0,
    annualGrant: 0.01, // Increased from 0.001 for historical analysis
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
        description: '50% vested at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 100,
        description: '100% vested at 10 years',
      },
    ],
  },
  {
    id: 'slow-burn',
    name: 'Wealth Builder',
    description: 'Maximum retention incentive with 10-year distribution. Designed for companies prioritizing employee loyalty.',
    initialGrant: 0.0, // Remains 0 as specified
    employeeMatchPercentage: 0,
    annualGrant: 0.02, // Increased from 0.002 for historical analysis
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
        description: '50% vested at 5 years',
      },
      {
        months: 120,
        employeeContributionPercent: 100,
        employerContributionPercent: 0,
        grantPercent: 100,
        description: '100% vested at 10 years',
      },
    ],
  },
];