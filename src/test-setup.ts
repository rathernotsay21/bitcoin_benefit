/**
 * Test setup for Vitest
 * Configures testing environment and global utilities
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.performance if not available
if (typeof window !== 'undefined' && !window.performance) {
  Object.defineProperty(window, 'performance', {
    value: {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000
      }
    },
    writable: true
  });
}

// Mock global performance if not available
if (typeof global !== 'undefined' && !global.performance) {
  global.performance = {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 20000000,
      jsHeapSizeLimit: 100000000
    }
  } as any;
}

// Mock console methods for performance tests
global.console = {
  ...console,
  log: vi.fn(console.log),
  warn: vi.fn(console.warn),
  error: vi.fn(console.error),
  info: vi.fn(console.info)
};

// Increase timeout for performance tests
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000
});

// Mock external APIs for consistent performance testing
vi.mock('../lib/on-chain/mempool-api', () => ({
  mempoolAPI: {
    fetchTransactions: vi.fn().mockImplementation(async (address: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return Array.from({ length: 50 }, (_, i) => ({
        txid: `mock-txid-${i.toString().padStart(8, '0')}`,
        date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
        amountBTC: 0.1 + (i * 0.001),
        fee: 0.0001,
        inputs: [{ address: 'mock-input', value: 1000000 }],
        outputs: [{ address: 'mock-output', value: 999900 }],
        blockHeight: 800000 + i,
        blockTime: new Date(2023, 0, 1 + i).getTime() / 1000
      }));
    })
  }
}));

vi.mock('../lib/on-chain/price-fetcher', () => ({
  OnChainPriceFetcher: {
    fetchBatchPrices: vi.fn().mockImplementation(async (dates: string[]) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return dates.reduce((acc, date) => {
        acc[date] = 40000 + Math.random() * 10000;
        return acc;
      }, {} as Record<string, number>);
    }),
    optimizePriceRequests: vi.fn().mockImplementation((transactions: any[]) => {
      return [...new Set(transactions.map(t => t.date))];
    }),
    clearCache: vi.fn(),
    getCacheStats: vi.fn().mockReturnValue({
      hitRate: 0.7,
      size: 100,
      totalRequests: 1000,
      cacheHits: 700
    })
  }
}));

// Performance testing utilities
export const performanceTestHelpers = {
  measureTime: async (fn: () => Promise<void> | void): Promise<number> => {
    const start = performance.now();
    await fn();
    return performance.now() - start;
  },
  
  createMockData: (count: number) => ({
    transactions: Array.from({ length: count }, (_, i) => ({
      txid: `mock-${i}`,
      date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
      amountBTC: 0.1,
      valueAtTimeOfTx: 4500,
      type: 'Annual Grant',
      grantYear: 1,
      isManuallyAnnotated: false,
      blockHeight: 800000 + i,
      blockTime: new Date(2023, 0, 1 + i).getTime() / 1000
    })),
    expectedGrants: Array.from({ length: Math.ceil(count / 4) }, (_, i) => ({
      year: i + 1,
      expectedDate: new Date(2023 + i, 0, 1).toISOString().split('T')[0],
      amountBTC: 1.0,
      status: 'matched',
      actualTransaction: null
    }))
  }),
  
  simulateNetworkDelay: (ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms)),
  
  mockMemoryPressure: (sizeMB: number) => 
    new Array(sizeMB * 1024 * 256).fill('data') // Rough MB simulation
};

export default performanceTestHelpers;
