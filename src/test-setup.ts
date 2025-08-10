/**
 * Test setup for Vitest
 * Configures testing environment and global utilities
 * Enhanced with comprehensive DOM mocks and Bitcoin-specific utilities
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Enhanced window.matchMedia mock with responsive breakpoint support
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => {
    // Parse common breakpoints for responsive testing
    const breakpoints = {
      '(max-width: 640px)': window.innerWidth <= 640,
      '(max-width: 768px)': window.innerWidth <= 768,
      '(max-width: 1024px)': window.innerWidth <= 1024,
      '(max-width: 1280px)': window.innerWidth <= 1280,
      '(min-width: 641px)': window.innerWidth >= 641,
      '(min-width: 769px)': window.innerWidth >= 769,
      '(min-width: 1025px)': window.innerWidth >= 1025,
      '(min-width: 1281px)': window.innerWidth >= 1281,
      '(prefers-color-scheme: dark)': false,
      '(prefers-reduced-motion: reduce)': false,
    };
    
    return {
      matches: breakpoints[query as keyof typeof breakpoints] || false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

// Enhanced IntersectionObserver mock with callback support
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  private callback: IntersectionObserverCallback;
  private elements: Set<Element> = new Set();
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '';
    this.thresholds = options?.threshold ? 
      (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : 
      [0];
  }
  
  disconnect() {
    this.elements.clear();
  }
  
  observe(element: Element) {
    this.elements.add(element);
    // Simulate immediate intersection for testing
    setTimeout(() => {
      this.callback([{
        target: element,
        isIntersecting: true,
        intersectionRatio: 1,
        intersectionRect: element.getBoundingClientRect(),
        boundingClientRect: element.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now()
      }], this);
    }, 0);
  }
  
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  
  takeRecords() {
    return [];
  }
} as any;

// Enhanced ResizeObserver mock with callback support
global.ResizeObserver = class ResizeObserver {
  private callback: ResizeObserverCallback;
  private elements: Set<Element> = new Set();
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  disconnect() {
    this.elements.clear();
  }
  
  observe(element: Element) {
    this.elements.add(element);
    // Simulate immediate resize event for testing
    setTimeout(() => {
      this.callback([{
        target: element,
        contentRect: {
          x: 0,
          y: 0,
          width: 1024,
          height: 768,
          top: 0,
          right: 1024,
          bottom: 768,
          left: 0,
          toJSON: () => ({})
        },
        borderBoxSize: [{
          blockSize: 768,
          inlineSize: 1024
        }],
        contentBoxSize: [{
          blockSize: 768,
          inlineSize: 1024
        }],
        devicePixelContentBoxSize: [{
          blockSize: 768,
          inlineSize: 1024
        }]
      }], this);
    }, 0);
  }
  
  unobserve(element: Element) {
    this.elements.delete(element);
  }
};

// Mock additional DOM APIs commonly used in Bitcoin applications
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock scrollTo for chart interactions
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock getComputedStyle for responsive components
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
    width: '1024px',
    height: '768px',
  })),
  writable: true,
});

// Mock clipboard API for Bitcoin address copying
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock crypto API for Bitcoin address validation
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockImplementation((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
  writable: true,
});

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
