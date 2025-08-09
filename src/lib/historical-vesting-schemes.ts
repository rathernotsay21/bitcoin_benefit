import { VestingScheme } from '@/types/vesting';

// Historical calculator uses larger default amounts for more meaningful analysis
export const HISTORICAL_VESTING_SCHEMES: VestingScheme[] = [
  {
    id: 'accelerator',
    name: 'Pioneer',
    description: 'Immediate grants for companies ready to lead in digital asset compensation.',
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
    name: 'Stacker',
    description: 'Minimize market timing risk with annual grants during the first five years.',
    initialGrant: 0.05, // Increased from 0.015 for historical analysis
    employeeMatchPercentage: 0,
    annualGrant: 0.01, // Increased from 0.001 for historical analysis
    maxAnnualGrants: 5, // Annual grants for the first 5 years
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
    name: 'Builder',
    description: 'Most conservative approach to spread costs across entire vesting period.',
    initialGrant: 0.0, // Remains 0 as specified
    employeeMatchPercentage: 0,
    annualGrant: 0.02, // Increased from 0.002 for historical analysis
    maxAnnualGrants: 10,
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