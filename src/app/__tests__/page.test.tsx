import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import HomePage from '../page';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock the APIs
vi.mock('@/lib/bitcoin-api', () => ({
  BitcoinAPI: {
    getCurrentPrice: vi.fn()
  }
}));

vi.mock('@/lib/historical-bitcoin-api', () => ({
  HistoricalBitcoinAPI: {
    getYearlyPrice: vi.fn()
  }
}));

const mockBitcoinAPI = BitcoinAPI as any;
const mockHistoricalBitcoinAPI = HistoricalBitcoinAPI as any;

describe('Home Page', () => {
  beforeEach(() => {
    // Mock API responses
    mockBitcoinAPI.getCurrentPrice.mockResolvedValue({
      price: 113976,
      change24h: 2.5,

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
    vi.clearAllMocks();
  });
  it('renders the main heading', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
    expect(screen.getAllByText('Secure their future. Secure your team.')).toHaveLength(2);
  });

  it('renders navigation links', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
    expect(screen.getAllByText('Calculator')).toHaveLength(2); // Desktop and mobile nav
    expect(screen.getByText('Start Planning')).toBeInTheDocument();
  });

  it('renders the historical performance example with cost basis and present value', async () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
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
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Pioneer')).toBeInTheDocument();
    expect(screen.getByText('Stacker')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
  });

  it('renders the benefits section', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Stop Losing Your Best People')).toBeInTheDocument();
    expect(screen.getByText('Compete with Big Companies')).toBeInTheDocument();
    expect(screen.getByText('Build Employee Loyalty')).toBeInTheDocument();
    expect(screen.getByText('Easy to Understand & Track')).toBeInTheDocument();
  });

  it('renders the CTA section with both calculators', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Ready to Start Planning?')).toBeInTheDocument();
    expect(screen.getByText('Planning Calculator')).toBeInTheDocument();
    expect(screen.getByText('Historical Results')).toBeInTheDocument();
  });

  it('has proper links to the historical calculator', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    
    const historicalLinks = screen.getAllByText('Try Historical Analysis');
    expect(historicalLinks.length).toBeGreaterThan(0);
    
    // Check that at least one link points to /historical
    const linkElements = historicalLinks.filter(link => 
      link.closest('a')?.getAttribute('href') === '/historical'
    );
    expect(linkElements.length).toBeGreaterThan(0);
  });
});