import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../page';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';

// Mock the APIs
jest.mock('@/lib/bitcoin-api');
jest.mock('@/lib/historical-bitcoin-api');

const mockBitcoinAPI = BitcoinAPI as jest.Mocked<typeof BitcoinAPI>;
const mockHistoricalBitcoinAPI = HistoricalBitcoinAPI as jest.Mocked<typeof HistoricalBitcoinAPI>;

describe('Home Page', () => {
  beforeEach(() => {
    // Mock API responses
    mockBitcoinAPI.getCurrentPrice.mockResolvedValue({
      price: 113976,
      change24h: 2.5,
      lastUpdated: new Date(),
    });

    mockHistoricalBitcoinAPI.getYearlyPrice.mockResolvedValue({
      year: 2020,
      high: 29000,
      low: 3200,
      average: 11000,
      open: 7200,
      close: 28900,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders the main heading', () => {
    render(<HomePage />);
    
    expect(screen.getAllByText('Secure their future. Secure your team.')).toHaveLength(2);
  });

  it('renders navigation links', () => {
    render(<HomePage />);
    
    expect(screen.getAllByText('Historical Analysis')).toHaveLength(3);
    expect(screen.getByText('Try Calculator')).toBeInTheDocument();
  });

  it('renders the historical performance example with cost basis and present value', async () => {
    render(<HomePage />);
    
    // Check that the historical performance example section exists
    expect(screen.getByText('Historical Performance Example')).toBeInTheDocument();
    
    // Check all the data points
    expect(screen.getByText('Starting Year')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    
    expect(screen.getByText('Initial Grant')).toBeInTheDocument();
    expect(screen.getByText('₿0.1')).toBeInTheDocument();
    
    expect(screen.getByText('Cost Basis (2020)')).toBeInTheDocument();
    expect(screen.getByText('Present Value (2025)')).toBeInTheDocument();
    expect(screen.getByText('Total Return')).toBeInTheDocument();
    
    // Wait for dynamic values to load
    await waitFor(() => {
      expect(screen.getByText('$1,100')).toBeInTheDocument();
      expect(screen.getByText('$11,398')).toBeInTheDocument();
      expect(screen.getByText('+936% ($10,298)')).toBeInTheDocument();
    });
  });

  it('renders the vesting scheme cards', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Bitcoin Pioneer')).toBeInTheDocument();
    expect(screen.getByText('Dollar Cost Advantage')).toBeInTheDocument();
    expect(screen.getByText('Wealth Builder')).toBeInTheDocument();
  });

  it('renders the benefits section', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Why Bitcoin Vesting?')).toBeInTheDocument();
    expect(screen.getByText('Enhanced Retention')).toBeInTheDocument();
    expect(screen.getByText('Financial Education')).toBeInTheDocument();
    expect(screen.getByText('Transparent & Trackable')).toBeInTheDocument();
  });

  it('renders the CTA section with both calculators', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Ready to Start Planning?')).toBeInTheDocument();
    expect(screen.getByText('Future Calculator')).toBeInTheDocument();
    expect(screen.getAllByText('Historical Analysis')).toHaveLength(3);
  });

  it('has proper links to the historical calculator', () => {
    render(<HomePage />);
    
    const historicalLinks = screen.getAllByText('Historical Analysis');
    expect(historicalLinks.length).toBeGreaterThan(0);
    
    // Check that at least one link points to /historical
    const linkElements = historicalLinks.filter(link => 
      link.closest('a')?.getAttribute('href') === '/historical'
    );
    expect(linkElements.length).toBeGreaterThan(0);
  });
});