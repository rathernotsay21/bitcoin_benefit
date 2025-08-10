import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import HistoricalTimelineChart from '../HistoricalTimelineChart';
import { HistoricalCalculationResult } from '@/types/vesting';

// Use centralized Recharts mock
vi.mock('recharts', async () => {
  const rechartsMock = await import('../../__mocks__/recharts');
  return rechartsMock.default;
});

const mockHistoricalResults: HistoricalCalculationResult = {
  timeline: [
    {
      year: 2020,
      month: 1,
      cumulativeBitcoin: 0.1,
      cumulativeCostBasis: 1100,
      currentValue: 11398,
      vestedAmount: 0,
      grants: [{ year: 2020, month: 1, amount: 0.1, type: 'initial' }]
    },
    {
      year: 2021,
      month: 1,
      cumulativeBitcoin: 0.1,
      cumulativeCostBasis: 1100,
      currentValue: 15000,
      vestedAmount: 0,
      grants: []
    },
    {
      year: 2025,
      month: 1,
      cumulativeBitcoin: 0.1,
      cumulativeCostBasis: 1100,
      currentValue: 11398,
      vestedAmount: 0.05,
      grants: []
    }
  ],
  totalBitcoinGranted: 0.1,
  totalCostBasis: 1100,
  currentTotalValue: 11398,
  totalReturn: 10298,
  annualizedReturn: 0.45,
  grantBreakdown: [
    { year: 2020, month: 1, amount: 0.1, type: 'initial' }
  ],
  summary: {
    startingYear: 2020,
    endingYear: 2025,
    yearsAnalyzed: 5,
    costBasisMethod: 'average',
    averageAnnualGrant: 0.02
  }
};

describe('HistoricalTimelineChart', () => {
  const defaultProps = {
    results: mockHistoricalResults,
    startingYear: 2020,
    currentBitcoinPrice: 113976
  };

  it('renders the chart title and description', () => {
    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    expect(screen.getByText('Historical Performance Timeline (2020-2025)')).toBeInTheDocument();
    expect(screen.getByText(/Total Bitcoin Granted.*₿0.100/)).toBeInTheDocument();
    expect(screen.getByText(/Cost Basis Method.*average/)).toBeInTheDocument();
    expect(screen.getByText(/Analysis Period.*5 years/)).toBeInTheDocument();
    expect(screen.getByText(/Annualized Return.*45.0%/)).toBeInTheDocument();
  });

  it('renders the chart components', () => {
    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-btcBalance')).toBeInTheDocument();
    expect(screen.getByTestId('line-usdValue')).toBeInTheDocument();
    expect(screen.getByTestId('line-costBasis')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-btc')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-usd')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders key insights cards', () => {
    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    // Current Value card
    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('11K')).toBeInTheDocument();
    expect(screen.getByText('₿0.100 total')).toBeInTheDocument();

    // Total Cost Basis card
    expect(screen.getByText('Total Cost Basis')).toBeInTheDocument();
    expect(screen.getByText('1K')).toBeInTheDocument();
    expect(screen.getByText('Historical average prices')).toBeInTheDocument();

    // Total Return card
    expect(screen.getByText('Total Return')).toBeInTheDocument();
    expect(screen.getByText('10K')).toBeInTheDocument();
    expect(screen.getByText('936% gain')).toBeInTheDocument();
  });

  it('handles mobile responsive design', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    // Chart should still render
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    const largeValueResults = {
      ...mockHistoricalResults,
      currentTotalValue: 1500000,
      totalCostBasis: 50000,
      totalReturn: 1450000
    };

    renderWithProviders(
      <HistoricalTimelineChart
        {...defaultProps}
        results={largeValueResults}
      />
    );

    // Should format large numbers with K/M suffixes
    expect(screen.getByText('1.5M')).toBeInTheDocument();
    expect(screen.getByText('50K')).toBeInTheDocument();
    expect(screen.getByText('1.4M')).toBeInTheDocument();
  });

  it('calculates return percentage correctly', () => {
    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    // (10298 / 1100) * 100 = 936%
    expect(screen.getByText('936% gain')).toBeInTheDocument();
  });

  it('displays the correct analysis period', () => {
    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    expect(screen.getByText('Historical Performance Timeline (2020-2025)')).toBeInTheDocument();
  });

  it('shows annualized return as percentage', () => {
    renderWithProviders(<HistoricalTimelineChart {...defaultProps} />);

    // 0.45 * 100 = 45.0%
    expect(screen.getByText(/Annualized Return.*45.0%/)).toBeInTheDocument();
  });
});