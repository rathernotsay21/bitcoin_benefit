import { VestingScheme } from '@/types/vesting';

export const VESTING_SCHEMES: VestingScheme[] = [
  {
    id: 'accelerator',
    name: 'Pioneer',
    description: 'Lean into Bitcoin with immediate compensation.',
    initialGrant: 0.02,
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
    description: 'Minimize market timing risk with annual grants.',
    initialGrant: 0.015,
    employeeMatchPercentage: 0,
    annualGrant: 0.001,
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
    description: 'Conservatively spread costs across entire vesting period.',
    initialGrant: 0.002,
    employeeMatchPercentage: 0,
    annualGrant: 0.002,
    maxAnnualGrants: 9,
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


