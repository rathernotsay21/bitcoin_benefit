/**
 * Bitcoin-specific testing utilities and custom render functions
 * Provides comprehensive testing support for Bitcoin Benefits application
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { AnnotatedTransaction, ExpectedGrant, TrackerFormData, FormErrors } from '@/types/on-chain';
import { formatBTC, formatBTCSummary, formatUSD, formatUSDCompact } from '@/lib/utils';

// Provider wrapper for components that need context
interface TestProvidersProps {
  children: ReactNode;
}

const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  // Add any global providers here (theme, store, etc.)
  return <>{children}</>;
};

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  });
};

// Bitcoin-specific test data generators
export const bitcoinTestData = {
  /**
   * Create mock Bitcoin transaction
   */
  createMockTransaction: (overrides: Partial<AnnotatedTransaction> = {}): AnnotatedTransaction => ({
    txid: 'mock-txid-' + Math.random().toString(36).substr(2, 9),
    grantYear: 1,
    type: 'Annual Grant',
    isIncoming: true,
    amountBTC: 0.1,
    amountSats: 10000000,
    date: '2024-01-01',
    blockHeight: 800000,
    valueAtTimeOfTx: 45000,
    status: 'Confirmed',
    matchScore: 0.95,
    isManuallyAnnotated: false,
    ...overrides,
  }),

  /**
   * Create mock expected grant
   */
  createMockGrant: (overrides: Partial<ExpectedGrant> = {}): ExpectedGrant => ({
    year: 1,
    expectedDate: '2024-01-01',
    expectedAmountBTC: 0.1,
    expectedAmountSats: 10000000,
    isMatched: false,
    tolerance: {
      dateRangeDays: 90,
      amountPercentage: 20,
    },
    ...overrides,
  }),

  /**
   * Create mock form data
   */
  createMockFormData: (overrides: Partial<TrackerFormData> = {}): TrackerFormData => ({
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    vestingStartDate: '2024-01-01',
    annualGrantBtc: 0.1,
    totalGrants: 4,
    ...overrides,
  }),

  /**
   * Create multiple mock transactions for testing
   */
  createMockTransactionList: (count: number, baseOverrides: Partial<AnnotatedTransaction> = {}): AnnotatedTransaction[] => {
    return Array.from({ length: count }, (_, i) => 
      bitcoinTestData.createMockTransaction({
        txid: `mock-txid-${i.toString().padStart(8, '0')}`,
        date: new Date(2024, 0, 1 + i * 30).toISOString().split('T')[0],
        grantYear: Math.floor(i / 4) + 1,
        amountBTC: 0.1 + (i * 0.001),
        blockHeight: 800000 + i,
        ...baseOverrides,
      })
    );
  },

  /**
   * Create multiple mock grants for testing
   */
  createMockGrantList: (count: number, baseOverrides: Partial<ExpectedGrant> = {}): ExpectedGrant[] => {
    return Array.from({ length: count }, (_, i) => 
      bitcoinTestData.createMockGrant({
        year: i + 1,
        expectedDate: new Date(2024 + i, 0, 1).toISOString().split('T')[0],
        expectedAmountBTC: 0.1,
        expectedAmountSats: 10000000,
        ...baseOverrides,
      })
    );
  },
};

// Bitcoin formatting test utilities
export const bitcoinFormatUtils = {
  /**
   * Test Bitcoin amount formatting - returns validation result
   */
  validateBTCFormat: (amount: number, expectedDecimals = 3) => {
    const formatted = formatBTC(amount, expectedDecimals);
    const expected = `₿${amount.toFixed(expectedDecimals)}`;
    const matchesPattern = /^₿\d+\.\d+$/.test(formatted);
    
    return {
      formatted,
      expected,
      isValid: matchesPattern && formatted === expected,
      matchesPattern,
      matchesExpected: formatted === expected,
    };
  },

  /**
   * Test Bitcoin summary formatting - returns validation result
   */
  validateBTCSummaryFormat: (amount: number) => {
    const formatted = formatBTCSummary(amount);
    const expected = `₿${amount.toFixed(3)}`;
    const matchesPattern = /^₿\d+\.\d{3}$/.test(formatted);
    
    return {
      formatted,
      expected,
      isValid: matchesPattern && formatted === expected,
      matchesPattern,
      matchesExpected: formatted === expected,
    };
  },

  /**
   * Test USD formatting - returns validation result
   */
  validateUSDFormat: (amount: number) => {
    const formatted = formatUSD(amount);
    const matchesPattern = /^\$[\d,]+$/.test(formatted);
    
    return {
      formatted,
      isValid: matchesPattern,
      matchesPattern,
    };
  },

  /**
   * Test compact USD formatting - returns validation result
   */
  validateUSDCompactFormat: (amount: number) => {
    const formatted = formatUSDCompact(amount);
    let expectedPattern: RegExp;
    
    if (amount >= 1000000) {
      expectedPattern = /^\d+\.\d+M$/;
    } else if (amount >= 1000) {
      expectedPattern = /^\d+K$/;
    } else {
      expectedPattern = /^\$[\d,]+$/;
    }
    
    const matchesPattern = expectedPattern.test(formatted);
    
    return {
      formatted,
      isValid: matchesPattern,
      matchesPattern,
      expectedPattern: expectedPattern.source,
    };
  },
};

// Bitcoin address validation utilities
export const bitcoinAddressUtils = {
  /**
   * Valid Bitcoin addresses for testing
   */
  validAddresses: [
    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Bech32
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Legacy P2PKH
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // P2SH
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // Bech32 v0
  ],

  /**
   * Invalid Bitcoin addresses for testing
   */
  invalidAddresses: [
    '', // Empty
    'invalid', // Too short
    'bc1qinvalidaddress', // Invalid checksum
    '1InvalidAddress123', // Invalid characters
    'not-a-bitcoin-address', // Completely invalid
  ],

  /**
   * Check if address format is valid for testing
   */
  isValidFormat: (address: string): boolean => {
    return bitcoinAddressUtils.validAddresses.includes(address);
  },
};

// Chart testing utilities
export const chartTestUtils = {
  /**
   * Mock Recharts components for consistent testing
   */
  mockRechartsComponents: {
    ComposedChart: ({ children, onMouseMove, onMouseLeave, ...props }: any) => (
      <div 
        data-testid="composed-chart" 
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {children}
      </div>
    ),
    Line: ({ dataKey, ...props }: any) => <div data-testid={`line-${dataKey}`} {...props} />,
    Scatter: ({ dataKey, ...props }: any) => <div data-testid={`scatter-${dataKey}`} {...props} />,
    XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
    YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
    CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
    Tooltip: ({ content, ...props }: any) => <div data-testid="tooltip" {...props} />,
    Legend: ({ content, ...props }: any) => <div data-testid="legend" {...props} />,
    ResponsiveContainer: ({ children, ...props }: any) => (
      <div data-testid="responsive-container" {...props}>
        {children}
      </div>
    ),
    ReferenceLine: (props: any) => <div data-testid="reference-line" {...props} />,
  },

  /**
   * Simulate chart interactions
   */
  simulateChartHover: (chartElement: HTMLElement, dataPoint: any) => {
    const event = new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    Object.defineProperty(event, 'target', {
      value: { ...dataPoint },
      enumerable: true,
    });
    chartElement.dispatchEvent(event);
  },

  /**
   * Simulate chart leave
   */
  simulateChartLeave: (chartElement: HTMLElement) => {
    const event = new MouseEvent('mouseleave', {
      bubbles: true,
    });
    chartElement.dispatchEvent(event);
  },
};

// Performance testing utilities
export const performanceTestUtils = {
  /**
   * Measure execution time of a function
   */
  measureTime: async (fn: () => Promise<void> | void): Promise<number> => {
    const start = performance.now();
    await fn();
    return performance.now() - start;
  },

  /**
   * Create large dataset for performance testing
   */
  createLargeDataset: (size: number) => ({
    transactions: bitcoinTestData.createMockTransactionList(size),
    grants: bitcoinTestData.createMockGrantList(Math.ceil(size / 4)),
  }),

  /**
   * Simulate network delay
   */
  simulateNetworkDelay: (ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Mock memory pressure for testing
   */
  mockMemoryPressure: (sizeMB: number) => 
    new Array(sizeMB * 1024 * 256).fill('test-data'),

  /**
   * Performance thresholds for testing
   */
  thresholds: {
    FAST_OPERATION: 100, // ms
    MEDIUM_OPERATION: 500, // ms
    SLOW_OPERATION: 1000, // ms
    MEMORY_LIMIT: 50, // MB
  },
};

// Form testing utilities
export const formTestUtils = {
  /**
   * Create form errors for testing
   */
  createMockErrors: (overrides: Partial<FormErrors> = {}): FormErrors => ({
    address: undefined,
    vestingStartDate: undefined,
    annualGrantBtc: undefined,
    totalGrants: undefined,
    general: undefined,
    ...overrides,
  }),

  /**
   * Validate form data structure
   */
  validateFormData: (data: TrackerFormData): FormErrors => {
    const errors: FormErrors = {};
    
    if (!data.address) {
      errors.address = 'Bitcoin address is required';
    } else if (!bitcoinAddressUtils.isValidFormat(data.address)) {
      errors.address = 'Invalid Bitcoin address format';
    }
    
    if (!data.vestingStartDate) {
      errors.vestingStartDate = 'Vesting start date is required';
    }
    
    if (!data.annualGrantBtc || data.annualGrantBtc <= 0) {
      errors.annualGrantBtc = 'Annual grant amount must be greater than 0';
    }
    
    if (!data.totalGrants || data.totalGrants <= 0) {
      errors.totalGrants = 'Total grants must be greater than 0';
    }
    
    return errors;
  },
};

// Responsive testing utilities
export const responsiveTestUtils = {
  /**
   * Set viewport size for responsive testing
   */
  setViewportSize: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  },

  /**
   * Common breakpoints for testing
   */
  breakpoints: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1024, height: 768 },
    large: { width: 1440, height: 900 },
  },

  /**
   * Test component at different breakpoints
   */
  testAtBreakpoints: async (
    renderFn: () => RenderResult,
    testFn: (result: RenderResult, breakpoint: string) => void | Promise<void>
  ) => {
    for (const [name, size] of Object.entries(responsiveTestUtils.breakpoints)) {
      responsiveTestUtils.setViewportSize(size.width, size.height);
      const result = renderFn();
      await testFn(result, name);
      result.unmount();
    }
  },
};

// Export everything for easy importing
export * from '@testing-library/react';
export { vi } from 'vitest';

// Note: Individual utilities are already exported above

// Default export for convenience
export default {
  render: renderWithProviders,
  ...bitcoinTestData,
  ...bitcoinFormatUtils,
  ...bitcoinAddressUtils,
  ...chartTestUtils,
  ...performanceTestUtils,
  ...formTestUtils,
  ...responsiveTestUtils,
};