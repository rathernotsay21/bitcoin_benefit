import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoricalTimelineChart from '../HistoricalTimelineChart';
import { HistoricalCalculationResult } from '@/types/vesting';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

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

  beforeEach(() => {
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders the chart title and description', () => {
    render(<HistoricalTimelineChart {...defaultProps} />);

    expect(screen.getByText('Historical Performance Timeline (2020-2025)')).toBeInTheDocument();
    expect(screen.getByText(/Total Bitcoin Granted.*₿0.100000/)).toBeInTheDocument();
    expect(screen.getByText(/Cost Basis Method.*average/)).toBeInTheDocument();
    expect(screen.getByText(/Analysis Period.*5 years/)).toBeInTheDocument();
    expect(screen.getByText(/Annualized Return.*45.0%/)).toBeInTheDocument();
  });

  it('renders the chart components', () => {
    render(<HistoricalTimelineChart {...defaultProps} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('line')).toHaveLength(3); // BTC Balance, USD Value, Cost Basis
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getAllByTestId('y-axis')).toHaveLength(2); // Left and right axes
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders key insights cards', () => {
    render(<HistoricalTimelineChart {...defaultProps} />);

    // Current Value card
    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('11K')).toBeInTheDocument();
    expect(screen.getByText('₿0.100000 total')).toBeInTheDocument();

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

    render(<HistoricalTimelineChart {...defaultProps} />);

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

    render(
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
    render(<HistoricalTimelineChart {...defaultProps} />);

    // (10298 / 1100) * 100 = 936%
    expect(screen.getByText('936% gain')).toBeInTheDocument();
  });

  it('displays the correct analysis period', () => {
    render(<HistoricalTimelineChart {...defaultProps} />);

    expect(screen.getByText('Historical Performance Timeline (2020-2025)')).toBeInTheDocument();
  });

  it('shows annualized return as percentage', () => {
    render(<HistoricalTimelineChart {...defaultProps} />);

    // 0.45 * 100 = 45.0%
    expect(screen.getByText(/Annualized Return.*45.0%/)).toBeInTheDocument();
  });
});