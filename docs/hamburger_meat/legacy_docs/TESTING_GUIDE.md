# Bitcoin Benefit Calculator - Comprehensive Testing Guide

## Overview

This project uses **Vitest** as the primary testing framework with React Testing Library for component testing and custom Bitcoin-specific utilities. The test infrastructure is designed to handle Bitcoin address validation, transaction processing, performance optimization testing, and comprehensive UI validation.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test files
npm run test VestingScheduleCalculator.test.ts

# Run performance tests only
npm run test -- --grep="performance"
```

## Test Infrastructure

### Core Configuration

The testing setup uses modern ES modules with comprehensive TypeScript support:

- **Framework**: Vitest with jsdom environment
- **Component Testing**: React Testing Library
- **TypeScript**: Dedicated `tsconfig.test.json` configuration
- **Coverage**: V8 provider with HTML reports
- **Performance**: Built-in timing and memory monitoring

### Key Files

- `vitest.config.ts` - Main Vitest configuration
- `src/test-setup.ts` - Global test setup and mocks
- `src/test-utils.tsx` - Bitcoin-specific testing utilities
- `tsconfig.test.json` - TypeScript configuration for tests
- `src/__mocks__/` - Global mocks directory

## Bitcoin-Specific Testing Utilities

### Import and Setup

```typescript
import { 
  renderWithProviders,
  bitcoinTestData,
  bitcoinFormatUtils,
  bitcoinAddressUtils,
  chartTestUtils,
  performanceTestUtils 
} from '@/test-utils';
```

### Bitcoin Address Testing

```typescript
// Valid test addresses
const validAddresses = bitcoinAddressUtils.validAddresses;
// ['bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', ...]

// Invalid test addresses  
const invalidAddresses = bitcoinAddressUtils.invalidAddresses;
// ['', 'invalid', 'bc1qinvalidaddress', ...]

// Validate address format
const isValid = bitcoinAddressUtils.isValidFormat(address);
```

### Bitcoin Data Generation

```typescript
// Create mock transaction
const transaction = bitcoinTestData.createMockTransaction({
  txid: 'custom-txid',
  amountBTC: 0.5,
  date: '2024-01-01',
  grantYear: 1
});

// Create multiple transactions
const transactions = bitcoinTestData.createMockTransactionList(50, {
  type: 'Annual Grant'
});

// Create mock expected grants
const grants = bitcoinTestData.createMockGrantList(4);

// Create form data
const formData = bitcoinTestData.createMockFormData({
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  vestingStartDate: '2024-01-01',
  annualGrantBtc: 0.1
});
```

### Bitcoin Formatting Validation

```typescript
// Validate BTC formatting
const btcValidation = bitcoinFormatUtils.validateBTCFormat(0.123456, 3);
expect(btcValidation.isValid).toBe(true);
expect(btcValidation.formatted).toBe('₿0.123');

// Validate USD formatting
const usdValidation = bitcoinFormatUtils.validateUSDFormat(45000);
expect(usdValidation.isValid).toBe(true);
expect(usdValidation.formatted).toMatch(/^\$[\d,]+$/);
```

### Chart Component Testing

```typescript
// Mock Recharts components
vi.mock('recharts', () => chartTestUtils.mockRechartsComponents);

// Simulate chart interactions
const chartElement = screen.getByTestId('composed-chart');
chartTestUtils.simulateChartHover(chartElement, {
  date: '2024-01-01',
  amountBTC: 0.1
});
```

## Testing Patterns

### Unit Tests - Calculator Logic

```typescript
import { VestingScheduleCalculator } from '../VestingScheduleCalculator';

describe('VestingScheduleCalculator', () => {
  let calculator: VestingScheduleCalculator;

  beforeEach(() => {
    calculator = new VestingScheduleCalculator(defaultSchedule);
  });

  describe('calculateVestedAmount', () => {
    it('should calculate 50% vested at month 60', () => {
      const vested = calculator.calculateVestedAmount(1.0, 60);
      expect(vested).toBe(0.5);
    });

    it('should handle fractional grant amounts', () => {
      const vested = calculator.calculateVestedAmount(0.123456, 60);
      expect(vested).toBeCloseTo(0.061728, 6);
    });
  });
});
```

### Component Tests - Forms and Validation

```typescript
import { renderWithProviders } from '@/test-utils';
import VestingTrackerForm from '../VestingTrackerForm';

describe('VestingTrackerForm', () => {
  it('validates Bitcoin address format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VestingTrackerForm />);

    const addressInput = screen.getByLabelText(/bitcoin address/i);
    await user.type(addressInput, 'invalid');

    await waitFor(() => {
      expect(screen.getByText(/bitcoin address too short/i)).toBeInTheDocument();
    });
  });

  it('handles successful form submission', async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(<VestingTrackerForm onSubmit={mockOnSubmit} />);

    // Fill valid form data
    await user.type(screen.getByLabelText(/bitcoin address/i), 
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    await user.type(screen.getByLabelText(/vesting start date/i), '2023-01-01');
    await user.type(screen.getByLabelText(/annual grant amount/i), '0.5');

    await user.click(screen.getByRole('button', { name: /start tracking/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      vestingStartDate: '2023-01-01',
      annualGrantBtc: 0.5
    });
  });
});
```

### Integration Tests - Data Flow

```typescript
import { renderWithProviders, bitcoinTestData } from '@/test-utils';
import { useOnChainStore } from '@/stores/onChainStore';

describe('OnChainTracker Integration', () => {
  it('processes complete vesting flow', async () => {
    const transactions = bitcoinTestData.createMockTransactionList(20);
    const grants = bitcoinTestData.createMockGrantList(4);

    // Mock store with test data
    vi.mocked(useOnChainStore).mockReturnValue({
      transactions,
      expectedGrants: grants,
      isLoading: false,
      error: null,
      // ... other store properties
    });

    renderWithProviders(<OnChainTracker />);

    // Verify data rendering
    expect(screen.getByText(/20 transactions processed/i)).toBeInTheDocument();
    expect(screen.getByText(/4 expected grants/i)).toBeInTheDocument();
  });
});
```

### Performance Tests

```typescript
import { performanceTestUtils } from '@/test-utils';

describe('Processing Performance', () => {
  it('processes large datasets within time limits', async () => {
    const largeDataset = performanceTestUtils.createLargeDataset(100);
    
    const processingTime = await performanceTestUtils.measureTime(async () => {
      // Simulate processing
      await processTransactions(largeDataset.transactions);
    });

    expect(processingTime).toBeLessThan(performanceTestUtils.thresholds.SLOW_OPERATION);
  });

  it('handles memory pressure gracefully', async () => {
    const initialMemory = MemoryOptimizer.getMemoryInfo();
    
    // Create memory pressure
    const pressure = performanceTestUtils.mockMemoryPressure(30); // 30MB
    
    // Trigger optimization
    MemoryOptimizer.optimizeMemory();
    
    const finalMemory = MemoryOptimizer.getMemoryInfo();
    expect(finalMemory.usedJSHeapSize).toBeLessThan(
      initialMemory.usedJSHeapSize + performanceTestUtils.thresholds.MEMORY_LIMIT
    );
  });
});
```

### Responsive Testing

```typescript
import { responsiveTestUtils } from '@/test-utils';

describe('Responsive Behavior', () => {
  it('adapts layout across breakpoints', async () => {
    await responsiveTestUtils.testAtBreakpoints(
      () => renderWithProviders(<VestingTimeline />),
      (result, breakpoint) => {
        if (breakpoint === 'mobile') {
          expect(result.getByTestId('mobile-layout')).toBeInTheDocument();
        } else {
          expect(result.getByTestId('desktop-layout')).toBeInTheDocument();
        }
      }
    );
  });
});
```

## Mocking Strategies

### External APIs

```typescript
// Mock Bitcoin price API
vi.mock('@/lib/on-chain/price-fetcher', () => ({
  OnChainPriceFetcher: {
    fetchBatchPrices: vi.fn().mockResolvedValue({
      '2024-01-01': 45000,
      '2024-01-02': 46000
    })
  }
}));

// Mock mempool API
vi.mock('@/lib/on-chain/mempool-api', () => ({
  mempoolAPI: {
    fetchTransactions: vi.fn().mockResolvedValue([
      // Mock transaction data
    ])
  }
}));
```

### Zustand Stores

```typescript
// Mock store
vi.mock('@/stores/onChainStore');
const mockStore = {
  transactions: [],
  isLoading: false,
  error: null,
  setFormData: vi.fn(),
  validateAndFetch: vi.fn()
};

const mockUseOnChainStore = useOnChainStore as vi.MockedFunction<typeof useOnChainStore>;
mockUseOnChainStore.mockReturnValue(mockStore);
```

### Chart Components

```typescript
// Recharts mocking is handled automatically by test-utils
// Components receive proper test IDs and interaction handlers
expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
expect(screen.getByTestId('line-amountBTC')).toBeInTheDocument();
```

## Testing Best Practices

### 1. Descriptive Test Names

```typescript
// ✅ Good
it('should calculate 50% vested amount at month 60 milestone', () => {

// ❌ Bad  
it('should calculate vested amount', () => {
```

### 2. Test Structure (AAA Pattern)

```typescript
it('should validate Bitcoin address format', async () => {
  // Arrange
  const user = userEvent.setup();
  renderWithProviders(<AddressInput />);
  
  // Act
  await user.type(screen.getByLabelText(/address/i), 'invalid-address');
  
  // Assert
  expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
});
```

### 3. Edge Cases and Boundaries

```typescript
describe('Bitcoin amount validation', () => {
  it('should accept minimum satoshi amount', () => {
    expect(validateAmount(0.00000001)).toBe(true);
  });

  it('should reject amounts exceeding 21 BTC', () => {
    expect(validateAmount(21.1)).toBe(false);
  });

  it('should handle zero amount', () => {
    expect(validateAmount(0)).toBe(false);
  });

  it('should handle negative amounts', () => {
    expect(validateAmount(-0.1)).toBe(false);
  });
});
```

### 4. Async Testing

```typescript
// ✅ Proper async testing
it('should fetch and display transaction data', async () => {
  renderWithProviders(<TransactionList />);
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
  
  expect(screen.getByText(/5 transactions/i)).toBeInTheDocument();
});
```

### 5. Accessibility Testing

```typescript
it('has proper ARIA attributes', () => {
  renderWithProviders(<VestingForm />);
  
  const addressInput = screen.getByLabelText(/bitcoin address/i);
  expect(addressInput).toHaveAttribute('aria-invalid', 'false');
  expect(addressInput).toHaveAttribute('aria-describedby', 'address-help');
});

it('displays error with proper ARIA role', async () => {
  const user = userEvent.setup();
  renderWithProviders(<VestingForm />);
  
  await user.type(screen.getByLabelText(/address/i), 'invalid');
  
  const errorMessage = await screen.findByText(/invalid format/i);
  expect(errorMessage).toHaveAttribute('role', 'alert');
});
```

## Performance Testing

### Benchmarking Components

```typescript
describe('Component Performance', () => {
  it('renders large datasets efficiently', async () => {
    const startTime = performance.now();
    
    renderWithProviders(
      <VestingTimeline 
        transactions={bitcoinTestData.createMockTransactionList(200)} 
      />
    );
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(200); // Under 200ms
  });
});
```

### Memory Leak Detection

```typescript
it('does not leak memory on component unmount', () => {
  const { unmount } = renderWithProviders(<ExpensiveComponent />);
  
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  unmount();
  
  // Trigger garbage collection if available
  if (global.gc) global.gc();
  
  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  
  // Memory should not grow significantly
  expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // 1MB tolerance
});
```

### Concurrent Processing Tests

```typescript
it('processes transactions concurrently within time limits', async () => {
  const transactions = bitcoinTestData.createMockTransactionList(50);
  
  const processingTime = await performanceTestUtils.measureTime(async () => {
    await processOnChainDataConcurrently(
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      '2024-01-01',
      1.0,
      { maxConcurrentOperations: 5 }
    );
  });
  
  expect(processingTime).toBeLessThan(8000); // Under 8 seconds
});
```

## Migration Guide: Jest to Vitest

### Configuration Changes

```typescript
// OLD: jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};

// NEW: vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts']
  }
});
```

### Import Changes

```typescript
// OLD: Jest
import { jest } from '@jest/globals';

// NEW: Vitest
import { vi } from 'vitest';

// Update mocking
jest.mock() → vi.mock()
jest.fn() → vi.fn()
jest.spyOn() → vi.spyOn()
```

### Test File Updates

```typescript
// OLD: Jest describe/it/expect are global
describe('Test', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});

// NEW: Vitest - can be imported or global
import { describe, it, expect } from 'vitest';
// OR configure globals: true in vitest.config.ts
```

### Mock Updates

```typescript
// OLD: Jest mocks
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn()
}));

// NEW: Vitest mocks
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn()
}));
```

### Async Testing

```typescript
// OLD: Jest async
it('should handle async', async () => {
  await waitFor(() => {
    expect(screen.getByText('loaded')).toBeInTheDocument();
  });
});

// NEW: Vitest async (same syntax, but better ES module support)
it('should handle async', async () => {
  await waitFor(() => {
    expect(screen.getByText('loaded')).toBeInTheDocument();
  });
});
```

## Error Handling and Debugging

### Common Issues

**1. Module Resolution Errors**
```bash
# Error: Cannot find module '@/components/...'
# Solution: Check vitest.config.ts alias configuration
resolve: {
  alias: {
    '@': resolve(__dirname, './src')
  }
}
```

**2. ES Module Import Issues**
```typescript
// Error: SyntaxError: Cannot use import statement outside a module
// Solution: Configure Vitest for ES modules
test: {
  server: {
    deps: {
      inline: ['problematic-package']
    }
  }
}
```

**3. Bitcoin Address Validation Failing**
```typescript
// Issue: Test addresses not validating
// Solution: Use provided test addresses
const validAddress = bitcoinAddressUtils.validAddresses[0];
```

### Debugging Tests

```typescript
// Enable debug mode
it.only('debug this test', () => {
  console.log('Debug info:', testData);
  screen.debug(); // Print DOM
});

// Use debugger
it('should debug', async () => {
  renderWithProviders(<Component />);
  debugger; // Execution pauses here
  await user.click(screen.getByRole('button'));
});
```

### Test Isolation

```typescript
describe('Component Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Clear localStorage if used
    localStorage.clear();
  });
});
```

## Coverage and Quality

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        'src/test-utils.tsx',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Quality Metrics

- **Unit Tests**: 80%+ coverage for business logic
- **Component Tests**: Focus on user interactions and edge cases
- **Integration Tests**: Critical user workflows
- **Performance Tests**: Key optimization validation

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:affected && npm run lint"
    }
  }
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Test Categories

```bash
# Run by category
npm run test -- --grep="unit"
npm run test -- --grep="integration" 
npm run test -- --grep="performance"
npm run test -- --grep="e2e"
```

## Resources and References

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Bitcoin Address Formats](https://en.bitcoin.it/wiki/Address)

### Internal Resources
- `src/test-setup.ts` - Global test configuration
- `src/test-utils.tsx` - Bitcoin-specific utilities
- `docs/PROJECT_SUMMARY.md` - Project architecture overview

### Best Practices
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

*Last updated: August 2025 - Test infrastructure version 2.0*
