# Migration Guide: Updating Existing Tests

## Overview

This guide helps developers migrate existing tests to the new Vitest-based infrastructure and adopt Bitcoin-specific testing utilities. Follow this step-by-step approach to update your test files.

## 🚀 Quick Migration Checklist

For each test file you're updating:

- [ ] Update imports from Jest to Vitest
- [ ] Replace hardcoded Bitcoin data with test utilities
- [ ] Update component mocking patterns
- [ ] Migrate to Bitcoin-specific assertions
- [ ] Add performance testing where appropriate
- [ ] Verify accessibility testing
- [ ] Update error handling tests

## 📋 Step-by-Step Migration

### Step 1: Update Test File Headers

**Before (Jest):**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';

// Mock modules
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn()
}));
```

**After (Vitest):**
```typescript
import { 
  renderWithProviders, 
  screen, 
  fireEvent, 
  waitFor,
  bitcoinTestData,
  bitcoinAddressUtils,
  vi 
} from '@/test-utils';
import userEvent from '@testing-library/user-event';

// Mock modules
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn()
}));
```

### Step 2: Replace Hardcoded Test Data

**Before (Hardcoded):**
```typescript
const mockTransaction = {
  txid: 'abc123',
  amountBTC: 0.1,
  date: '2024-01-01',
  // ... many more fields
};

const mockAddress = 'bc1qsomeaddress123';
```

**After (Test Utilities):**
```typescript
const mockTransaction = bitcoinTestData.createMockTransaction({
  amountBTC: 0.1,
  date: '2024-01-01'
});

const mockAddress = bitcoinAddressUtils.validAddresses[0];
```

### Step 3: Update Component Rendering

**Before (Basic render):**
```typescript
render(<MyComponent />);
```

**After (With providers):**
```typescript
renderWithProviders(<MyComponent />);
```

### Step 4: Update Bitcoin Address Testing

**Before (Manual validation):**
```typescript
it('should validate bitcoin address', () => {
  expect(isValidAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toBe(true);
  expect(isValidAddress('invalid')).toBe(false);
});
```

**After (Using utilities):**
```typescript
it('should validate bitcoin address', () => {
  bitcoinAddressUtils.validAddresses.forEach(address => {
    expect(isValidAddress(address)).toBe(true);
  });
  
  bitcoinAddressUtils.invalidAddresses.forEach(address => {
    expect(isValidAddress(address)).toBe(false);
  });
});
```

### Step 5: Update Formatting Tests

**Before (Manual formatting checks):**
```typescript
it('should format BTC amount', () => {
  expect(formatBTC(0.123)).toBe('₿0.123');
});
```

**After (Using validation utilities):**
```typescript
it('should format BTC amount', () => {
  const validation = bitcoinFormatUtils.validateBTCFormat(0.123, 3);
  expect(validation.isValid).toBe(true);
  expect(validation.formatted).toBe('₿0.123');
});
```

### Step 6: Update Chart Component Tests

**Before (No mocking):**
```typescript
import { ComposedChart } from 'recharts';

it('should render chart', () => {
  render(<MyChart data={data} />);
  // Chart might not render properly in test environment
});
```

**After (With mocking):**
```typescript
// Mocking handled automatically by test-utils
it('should render chart', () => {
  renderWithProviders(<MyChart data={data} />);
  
  expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
  expect(screen.getByTestId('line-amountBTC')).toBeInTheDocument();
});
```

### Step 7: Add Performance Testing

**Before (No performance testing):**
```typescript
it('should process transactions', async () => {
  const result = await processTransactions(transactions);
  expect(result).toBeDefined();
});
```

**After (With performance testing):**
```typescript
it('should process transactions efficiently', async () => {
  const largeDataset = performanceTestUtils.createLargeDataset(100);
  
  const processingTime = await performanceTestUtils.measureTime(async () => {
    const result = await processTransactions(largeDataset.transactions);
    expect(result).toBeDefined();
  });
  
  expect(processingTime).toBeLessThan(performanceTestUtils.thresholds.SLOW_OPERATION);
});
```

## 🔄 Common Migration Patterns

### Pattern 1: Form Component Migration

**Before:**
```typescript
describe('VestingForm', () => {
  it('should validate inputs', async () => {
    render(<VestingForm />);
    
    const addressInput = screen.getByLabelText(/address/);
    fireEvent.change(addressInput, { target: { value: 'invalid' } });
    
    expect(screen.getByText('Invalid address')).toBeInTheDocument();
  });
});
```

**After:**
```typescript
describe('VestingForm', () => {
  it('should validate inputs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VestingForm />);
    
    const addressInput = screen.getByLabelText(/bitcoin address/i);
    await user.type(addressInput, 'invalid');
    
    await waitFor(() => {
      expect(screen.getByText(/bitcoin address too short/i)).toBeInTheDocument();
    });
  });

  it('should accept valid addresses', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VestingForm />);
    
    const addressInput = screen.getByLabelText(/bitcoin address/i);
    await user.type(addressInput, bitcoinAddressUtils.validAddresses[0]);
    
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });
});
```

### Pattern 2: Calculator Logic Migration

**Before:**
```typescript
describe('VestingCalculator', () => {
  it('should calculate vested amount', () => {
    const calculator = new VestingCalculator();
    expect(calculator.calculateVested(1.0, 60)).toBe(0.5);
  });
});
```

**After:**
```typescript
describe('VestingCalculator', () => {
  let calculator: VestingCalculator;

  beforeEach(() => {
    calculator = new VestingCalculator();
  });

  it('should calculate vested amount at 50% milestone', () => {
    const vested = calculator.calculateVested(1.0, 60);
    expect(vested).toBe(0.5);
  });

  it('should handle fractional amounts precisely', () => {
    const vested = calculator.calculateVested(0.123456, 60);
    expect(vested).toBeCloseTo(0.061728, 6);
  });

  it('should handle edge cases', () => {
    expect(calculator.calculateVested(0, 60)).toBe(0);
    expect(calculator.calculateVested(1.0, 0)).toBe(0);
    expect(calculator.calculateVested(1.0, 120)).toBe(1.0);
  });
});
```

### Pattern 3: API Integration Migration

**Before:**
```typescript
describe('BitcoinAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch price data', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ price: 45000 })
    });
    global.fetch = mockFetch;

    const price = await fetchBitcoinPrice();
    expect(price).toBe(45000);
  });
});
```

**After:**
```typescript
// Mock handled in test-setup.ts
describe('BitcoinAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch price data efficiently', async () => {
    // Mock is already configured in test-setup.ts
    const processingTime = await performanceTestUtils.measureTime(async () => {
      const price = await fetchBitcoinPrice();
      expect(price).toBe(45000);
    });
    
    expect(processingTime).toBeLessThan(100); // Should be fast with mocking
  });

  it('should handle batch requests', async () => {
    const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
    
    const prices = await OnChainPriceFetcher.fetchBatchPrices(dates);
    
    expect(Object.keys(prices)).toEqual(dates);
    Object.values(prices).forEach(price => {
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
    });
  });
});
```

## 📊 Store Integration Migration

### Pattern 4: Zustand Store Testing

**Before:**
```typescript
import { useOnChainStore } from '@/stores/onChainStore';

// Manual store mocking
const mockStore = {
  transactions: [],
  setTransactions: jest.fn(),
  // ... other methods
};

jest.mock('@/stores/onChainStore', () => ({
  useOnChainStore: () => mockStore
}));
```

**After:**
```typescript
import { useOnChainStore } from '@/stores/onChainStore';

vi.mock('@/stores/onChainStore');
const mockUseOnChainStore = useOnChainStore as vi.MockedFunction<typeof useOnChainStore>;

const mockStore = {
  transactions: bitcoinTestData.createMockTransactionList(5),
  expectedGrants: bitcoinTestData.createMockGrantList(4),
  isLoading: false,
  error: null,
  setFormData: vi.fn(),
  validateAndFetch: vi.fn()
};

mockUseOnChainStore.mockReturnValue(mockStore);
```

## 🎯 Responsive Design Migration

### Pattern 5: Responsive Component Testing

**Before:**
```typescript
it('should adapt to mobile', () => {
  // Manual viewport changes
  Object.defineProperty(window, 'innerWidth', { value: 375 });
  window.dispatchEvent(new Event('resize'));
  
  render(<ResponsiveComponent />);
  expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
});
```

**After:**
```typescript
it('should adapt across breakpoints', async () => {
  await responsiveTestUtils.testAtBreakpoints(
    () => renderWithProviders(<ResponsiveComponent />),
    (result, breakpoint) => {
      if (breakpoint === 'mobile') {
        expect(result.getByTestId('mobile-layout')).toBeInTheDocument();
      } else {
        expect(result.getByTestId('desktop-layout')).toBeInTheDocument();
      }
    }
  );
});
```

## 🚨 Common Migration Issues

### Issue 1: Import Path Errors

**Problem:**
```bash
Error: Cannot find module '@/test-utils'
```

**Solution:**
Check that you're importing from the correct path:
```typescript
// ✅ Correct
import { renderWithProviders } from '@/test-utils';

// ❌ Wrong
import { renderWithProviders } from '../test-utils';
```

### Issue 2: Mock Function Errors

**Problem:**
```bash
TypeError: vi.fn() is not a function
```

**Solution:**
Ensure you're importing `vi` from the test utils:
```typescript
// ✅ Correct
import { vi } from '@/test-utils';

// ❌ Wrong
import { vi } from 'vitest'; // Use test-utils instead
```

### Issue 3: Chart Rendering Errors

**Problem:**
```bash
Error: Cannot read property 'x' of undefined
```

**Solution:**
Chart mocking is handled automatically. Just ensure you're using the test IDs:
```typescript
// ✅ Correct
expect(screen.getByTestId('composed-chart')).toBeInTheDocument();

// ❌ Wrong - Don't test Recharts internals
expect(screen.getByRole('svg')).toBeInTheDocument();
```

### Issue 4: Bitcoin Address Validation Failing

**Problem:**
```bash
Test fails with valid Bitcoin address
```

**Solution:**
Use the provided test addresses:
```typescript
// ✅ Correct
const address = bitcoinAddressUtils.validAddresses[0];

// ❌ Wrong - Don't create your own
const address = 'bc1qsomeaddress';
```

## 📈 Performance Migration

### Before: No Performance Testing
```typescript
it('should process data', async () => {
  const result = await processLargeDataset(data);
  expect(result).toBeDefined();
});
```

### After: With Performance Validation
```typescript
it('should process data efficiently', async () => {
  const dataset = performanceTestUtils.createLargeDataset(200);
  
  const time = await performanceTestUtils.measureTime(async () => {
    const result = await processLargeDataset(dataset.transactions);
    expect(result).toBeDefined();
  });
  
  expect(time).toBeLessThan(performanceTestUtils.thresholds.SLOW_OPERATION);
});
```

## ✅ Migration Verification

After migrating a test file, verify:

1. **All tests pass**: `npm run test YourFile.test.ts`
2. **No console errors**: Check for warnings or errors
3. **Performance**: Tests complete in reasonable time
4. **Coverage**: Maintain or improve test coverage

## 🎯 Migration Priority Guide

**High Priority (Migrate First):**
- Calculator and business logic tests
- Form validation tests
- Bitcoin address and amount handling

**Medium Priority:**
- Component rendering tests
- Store integration tests
- Chart component tests

**Low Priority (When Time Permits):**
- UI interaction tests
- Responsive design tests
- Performance optimization tests

## 📞 Getting Help

If you encounter issues during migration:

1. **Check Examples**: Look at migrated test files in the codebase
2. **Consult Documentation**: Reference the main [TESTING_GUIDE.md](../TESTING_GUIDE.md)
3. **Ask for Help**: Reach out to team members familiar with the new system
4. **Test Incrementally**: Migrate one test case at a time

## 🏆 Migration Success Checklist

For each migrated test file:

- [ ] Imports updated to use test utilities
- [ ] Hardcoded Bitcoin data replaced with generators
- [ ] Component rendering uses `renderWithProviders`
- [ ] Mocking patterns updated to Vitest
- [ ] Performance testing added where appropriate
- [ ] All tests pass with new infrastructure
- [ ] No degradation in test coverage
- [ ] Tests run efficiently (no timeouts)

---

**Remember**: Migration is an opportunity to improve test quality, not just change syntax. Take time to enhance coverage and add performance testing while you're updating each file.
