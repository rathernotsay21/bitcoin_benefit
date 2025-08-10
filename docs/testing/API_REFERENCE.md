# Bitcoin Testing Utilities API Reference

## Overview

This document provides a comprehensive API reference for all Bitcoin-specific testing utilities available in the project. These utilities are designed to make testing Bitcoin-related functionality consistent, reliable, and easy to use.

## Import Statement

```typescript
import { 
  renderWithProviders,
  bitcoinTestData,
  bitcoinFormatUtils,
  bitcoinAddressUtils,
  chartTestUtils,
  performanceTestUtils,
  formTestUtils,
  responsiveTestUtils,
  vi
} from '@/test-utils';
```

## bitcoinTestData

### createMockTransaction(overrides?)

Creates a mock Bitcoin transaction for testing.

**Signature:**
```typescript
createMockTransaction(overrides?: Partial<AnnotatedTransaction>): AnnotatedTransaction
```

**Parameters:**
- `overrides` (optional): Partial transaction object to override defaults

**Returns:** Complete `AnnotatedTransaction` object

**Example:**
```typescript
const transaction = bitcoinTestData.createMockTransaction({
  txid: 'custom-txid-12345',
  amountBTC: 0.5,
  date: '2024-01-15',
  grantYear: 2,
  type: 'Annual Grant'
});

// Default transaction structure:
// {
//   txid: 'mock-txid-<random>',
//   grantYear: 1,
//   type: 'Annual Grant',
//   isIncoming: true,
//   amountBTC: 0.1,
//   amountSats: 10000000,
//   date: '2024-01-01',
//   blockHeight: 800000,
//   valueAtTimeOfTx: 45000,
//   status: 'Confirmed',
//   matchScore: 0.95,
//   isManuallyAnnotated: false
// }
```

### createMockGrant(overrides?)

Creates a mock expected grant for testing.

**Signature:**
```typescript
createMockGrant(overrides?: Partial<ExpectedGrant>): ExpectedGrant
```

**Example:**
```typescript
const grant = bitcoinTestData.createMockGrant({
  year: 3,
  expectedDate: '2026-01-01',
  expectedAmountBTC: 0.25,
  isMatched: true
});
```

### createMockFormData(overrides?)

Creates mock form data for testing form components.

**Signature:**
```typescript
createMockFormData(overrides?: Partial<TrackerFormData>): TrackerFormData
```

**Example:**
```typescript
const formData = bitcoinTestData.createMockFormData({
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  vestingStartDate: '2024-01-01',
  annualGrantBtc: 0.1,
  totalGrants: 4
});
```

### createMockTransactionList(count, baseOverrides?)

Creates multiple mock transactions for testing large datasets.

**Signature:**
```typescript
createMockTransactionList(
  count: number, 
  baseOverrides?: Partial<AnnotatedTransaction>
): AnnotatedTransaction[]
```

**Parameters:**
- `count`: Number of transactions to create
- `baseOverrides` (optional): Base properties to apply to all transactions

**Example:**
```typescript
// Create 50 transactions with custom type
const transactions = bitcoinTestData.createMockTransactionList(50, {
  type: 'Monthly Grant',
  grantYear: 1
});

// Creates transactions with sequential dates and IDs
// txid: 'mock-txid-00000000', 'mock-txid-00000001', etc.
// date: 2024-01-01, 2024-01-31, 2024-03-01, etc.
```

### createMockGrantList(count, baseOverrides?)

Creates multiple mock expected grants.

**Signature:**
```typescript
createMockGrantList(
  count: number,
  baseOverrides?: Partial<ExpectedGrant>
): ExpectedGrant[]
```

**Example:**
```typescript
const grants = bitcoinTestData.createMockGrantList(4, {
  expectedAmountBTC: 0.25
});
```

## bitcoinFormatUtils

### validateBTCFormat(amount, expectedDecimals?)

Validates Bitcoin amount formatting and returns detailed validation results.

**Signature:**
```typescript
validateBTCFormat(amount: number, expectedDecimals?: number): {
  formatted: string;
  expected: string;
  isValid: boolean;
  matchesPattern: boolean;
  matchesExpected: boolean;
}
```

**Example:**
```typescript
const validation = bitcoinFormatUtils.validateBTCFormat(0.123456, 3);
// Returns:
// {
//   formatted: "₿0.123",
//   expected: "₿0.123", 
//   isValid: true,
//   matchesPattern: true,
//   matchesExpected: true
// }

// Use in tests:
expect(validation.isValid).toBe(true);
expect(validation.formatted).toBe('₿0.123');
```

### validateBTCSummaryFormat(amount)

Validates Bitcoin summary formatting (always 3 decimal places).

**Signature:**
```typescript
validateBTCSummaryFormat(amount: number): {
  formatted: string;
  expected: string;
  isValid: boolean;
  matchesPattern: boolean;
  matchesExpected: boolean;
}
```

### validateUSDFormat(amount)

Validates USD currency formatting.

**Signature:**
```typescript
validateUSDFormat(amount: number): {
  formatted: string;
  isValid: boolean;
  matchesPattern: boolean;
}
```

**Example:**
```typescript
const validation = bitcoinFormatUtils.validateUSDFormat(45000);
expect(validation.formatted).toMatch(/^\$[\d,]+$/);
expect(validation.isValid).toBe(true);
```

### validateUSDCompactFormat(amount)

Validates compact USD formatting (K, M suffixes).

**Signature:**
```typescript
validateUSDCompactFormat(amount: number): {
  formatted: string;
  isValid: boolean;
  matchesPattern: boolean;
  expectedPattern: string;
}
```

**Example:**
```typescript
const validation = bitcoinFormatUtils.validateUSDCompactFormat(1500000);
// Returns: { formatted: "1.5M", isValid: true, ... }
```

## bitcoinAddressUtils

### validAddresses

Array of valid Bitcoin addresses for testing.

**Type:** `string[]`

**Example:**
```typescript
const validAddress = bitcoinAddressUtils.validAddresses[0];
// 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

// Test all valid addresses
bitcoinAddressUtils.validAddresses.forEach(address => {
  expect(validateAddress(address)).toBe(true);
});
```

**Available addresses:**
- `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` (Bech32)
- `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (Legacy P2PKH)
- `3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy` (P2SH)
- `bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4` (Bech32 v0)

### invalidAddresses

Array of invalid Bitcoin addresses for testing error cases.

**Type:** `string[]`

**Example:**
```typescript
bitcoinAddressUtils.invalidAddresses.forEach(address => {
  expect(validateAddress(address)).toBe(false);
});
```

**Available invalid addresses:**
- `''` (Empty string)
- `'invalid'` (Too short)
- `'bc1qinvalidaddress'` (Invalid checksum)
- `'1InvalidAddress123'` (Invalid characters)
- `'not-a-bitcoin-address'` (Completely invalid)

### isValidFormat(address)

Checks if address format is valid for testing purposes.

**Signature:**
```typescript
isValidFormat(address: string): boolean
```

## chartTestUtils

### mockRechartsComponents

Pre-configured mock components for Recharts testing.

**Type:** `Record<string, React.ComponentType<any>>`

**Example:**
```typescript
// Automatic mocking
vi.mock('recharts', () => chartTestUtils.mockRechartsComponents);

// Manual usage
const MockChart = chartTestUtils.mockRechartsComponents.ComposedChart;
```

**Available components:**
- `ComposedChart`
- `Line`
- `Scatter`
- `XAxis`
- `YAxis`
- `CartesianGrid`
- `Tooltip`
- `Legend`
- `ResponsiveContainer`
- `ReferenceLine`

### simulateChartHover(chartElement, dataPoint)

Simulates mouse hover on chart elements.

**Signature:**
```typescript
simulateChartHover(chartElement: HTMLElement, dataPoint: any): void
```

**Example:**
```typescript
const chart = screen.getByTestId('composed-chart');
chartTestUtils.simulateChartHover(chart, {
  date: '2024-01-01',
  amountBTC: 0.1,
  value: 45000
});
```

### simulateChartLeave(chartElement)

Simulates mouse leave on chart elements.

**Signature:**
```typescript
simulateChartLeave(chartElement: HTMLElement): void
```

## performanceTestUtils

### measureTime(fn)

Measures execution time of a function.

**Signature:**
```typescript
measureTime(fn: () => Promise<void> | void): Promise<number>
```

**Returns:** Execution time in milliseconds

**Example:**
```typescript
const processingTime = await performanceTestUtils.measureTime(async () => {
  await processLargeDataset(data);
});

expect(processingTime).toBeLessThan(1000); // Under 1 second
```

### createLargeDataset(size)

Creates large test datasets for performance testing.

**Signature:**
```typescript
createLargeDataset(size: number): {
  transactions: AnnotatedTransaction[];
  grants: ExpectedGrant[];
}
```

**Example:**
```typescript
const { transactions, grants } = performanceTestUtils.createLargeDataset(500);
// Creates 500 transactions and 125 grants
```

### simulateNetworkDelay(ms)

Simulates network delay for testing async operations.

**Signature:**
```typescript
simulateNetworkDelay(ms: number): Promise<void>
```

**Example:**
```typescript
await performanceTestUtils.simulateNetworkDelay(100);
// Simulates 100ms network delay
```

### mockMemoryPressure(sizeMB)

Creates memory pressure for testing memory optimization.

**Signature:**
```typescript
mockMemoryPressure(sizeMB: number): any[]
```

**Example:**
```typescript
const pressure = performanceTestUtils.mockMemoryPressure(50);
// Creates ~50MB of test data
```

### thresholds

Performance testing thresholds.

**Type:**
```typescript
{
  FAST_OPERATION: 100;    // ms
  MEDIUM_OPERATION: 500;  // ms
  SLOW_OPERATION: 1000;   // ms
  MEMORY_LIMIT: 50;       // MB
}
```

**Example:**
```typescript
expect(operationTime).toBeLessThan(
  performanceTestUtils.thresholds.FAST_OPERATION
);
```

## formTestUtils

### createMockErrors(overrides?)

Creates mock form errors for testing error states.

**Signature:**
```typescript
createMockErrors(overrides?: Partial<FormErrors>): FormErrors
```

**Example:**
```typescript
const errors = formTestUtils.createMockErrors({
  address: 'Invalid Bitcoin address',
  annualGrantBtc: 'Amount must be positive'
});
```

### validateFormData(data)

Validates form data and returns errors.

**Signature:**
```typescript
validateFormData(data: TrackerFormData): FormErrors
```

**Example:**
```typescript
const errors = formTestUtils.validateFormData({
  address: '',
  vestingStartDate: '2024-01-01',
  annualGrantBtc: -1,
  totalGrants: 4
});

expect(errors.address).toBe('Bitcoin address is required');
expect(errors.annualGrantBtc).toBe('Annual grant amount must be greater than 0');
```

## responsiveTestUtils

### setViewportSize(width, height)

Sets viewport size for responsive testing.

**Signature:**
```typescript
setViewportSize(width: number, height: number): void
```

**Example:**
```typescript
responsiveTestUtils.setViewportSize(375, 667); // Mobile
// Component should adapt to mobile layout
```

### breakpoints

Common breakpoints for testing.

**Type:**
```typescript
{
  mobile: { width: 375, height: 667 };
  tablet: { width: 768, height: 1024 };
  desktop: { width: 1024, height: 768 };
  large: { width: 1440, height: 900 };
}
```

### testAtBreakpoints(renderFn, testFn)

Tests component behavior across different breakpoints.

**Signature:**
```typescript
testAtBreakpoints(
  renderFn: () => RenderResult,
  testFn: (result: RenderResult, breakpoint: string) => void | Promise<void>
): Promise<void>
```

**Example:**
```typescript
await responsiveTestUtils.testAtBreakpoints(
  () => renderWithProviders(<MyComponent />),
  (result, breakpoint) => {
    if (breakpoint === 'mobile') {
      expect(result.getByTestId('mobile-nav')).toBeInTheDocument();
    } else {
      expect(result.getByTestId('desktop-nav')).toBeInTheDocument();
    }
  }
);
```

## renderWithProviders

Enhanced render function with context providers.

**Signature:**
```typescript
renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult
```

**Example:**
```typescript
// Instead of render()
const { getByText } = renderWithProviders(<MyComponent />);

// Automatically includes necessary providers
```

## Global Mocks and Setup

### DOM APIs

The following DOM APIs are automatically mocked:

- `window.matchMedia` - Responsive design testing
- `IntersectionObserver` - Scroll-based interactions
- `ResizeObserver` - Component resize handling
- `navigator.clipboard` - Bitcoin address copying
- `window.crypto` - Cryptographic operations
- `window.performance` - Performance monitoring

### Console Methods

Console methods are mocked for performance tests:

```typescript
// Access mocked console
expect(console.log).toHaveBeenCalledWith('Debug message');
```

### Performance APIs

Performance monitoring is available:

```typescript
// Measure memory usage
const memoryInfo = performance.memory;

// Measure execution time
const start = performance.now();
// ... operation
const duration = performance.now() - start;
```

## Error Handling Utilities

### Common Error Patterns

```typescript
// Network error simulation
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockRejectedValue(new Error('Network error'))
}));

// Validation error simulation
const errors = formTestUtils.createMockErrors({
  general: 'Something went wrong'
});
```

## Best Practices

### 1. Use Appropriate Utilities

```typescript
// ✅ Use Bitcoin-specific utilities
const address = bitcoinAddressUtils.validAddresses[0];

// ❌ Don't hardcode test data
const address = 'bc1qsomeaddress...';
```

### 2. Leverage Data Generators

```typescript
// ✅ Generate consistent test data
const transactions = bitcoinTestData.createMockTransactionList(10);

// ❌ Don't manually create arrays
const transactions = [
  { txid: 'tx1', ... },
  { txid: 'tx2', ... },
  // ...
];
```

### 3. Use Performance Utilities

```typescript
// ✅ Use performance utilities
const time = await performanceTestUtils.measureTime(fn);

// ❌ Don't manually measure time
const start = Date.now();
await fn();
const time = Date.now() - start;
```

---

This API reference covers all available Bitcoin-specific testing utilities. For additional examples and patterns, see the main [TESTING_GUIDE.md](../TESTING_GUIDE.md).
