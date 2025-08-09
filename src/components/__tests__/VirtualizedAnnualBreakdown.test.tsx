import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualizedAnnualBreakdown from '../VirtualizedAnnualBreakdown';

describe('VirtualizedAnnualBreakdown', () => {
  const mockYearlyData = Array.from({ length: 21 }, (_, i) => ({
    year: i,
    btcBalance: 0.1 + i * 0.05,
    usdValue: 50000 + i * 10000,
    bitcoinPrice: 50000 + i * 5000,
    vestedAmount: i >= 10 ? 100 : i >= 5 ? 50 : 0
  }));

  const defaultProps = {
    yearlyData: mockYearlyData,
    initialGrant: 0.1,
    annualGrant: 0.05,
    currentBitcoinPrice: 50000,
    schemeId: 'standard'
  };

  it('renders the component title', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} />);
    expect(screen.getByText('Annual Breakdown')).toBeInTheDocument();
  });

  it('renders the correct number of years based on maxDisplayYears', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} maxDisplayYears={5} />);
    // Check that only 5 years are displayed (0-4)
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('displays the total grant cost summary', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} />);
    expect(screen.getByText('Total Grant Cost')).toBeInTheDocument();
  });

  it('shows vesting status badges', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} />);
    expect(screen.getByText('0% Vested')).toBeInTheDocument();
    expect(screen.getByText('50% Vested')).toBeInTheDocument();
    expect(screen.getByText('100% Vested')).toBeInTheDocument();
  });

  it('handles small datasets without virtualization', () => {
    const smallData = mockYearlyData.slice(0, 5);
    render(<VirtualizedAnnualBreakdown {...defaultProps} yearlyData={smallData} />);
    // Should render all 5 rows directly without virtualization
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('handles large datasets with virtualization', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} maxDisplayYears={15} />);
    // Should only render visible rows through virtualization
    expect(screen.getByText('Annual Breakdown')).toBeInTheDocument();
  });

  it('calculates total BTC correctly for slow-burn scheme', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} schemeId="slow-burn" />);
    expect(screen.getByText(/₿\d+\.\d+ total grants/)).toBeInTheDocument();
  });

  it('displays grant cost for initial grant at year 0', () => {
    render(<VirtualizedAnnualBreakdown {...defaultProps} />);
    // Year 0 should have a grant cost displayed
    expect(screen.getByText('Grant Cost')).toBeInTheDocument();
  });

  it('handles undefined annualGrant prop gracefully', () => {
    const propsWithoutAnnual = { ...defaultProps, annualGrant: undefined };
    render(<VirtualizedAnnualBreakdown {...propsWithoutAnnual} />);
    expect(screen.getByText('Annual Breakdown')).toBeInTheDocument();
  });
});
