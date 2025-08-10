# Developer Testing Onboarding Guide

## Welcome to Bitcoin Benefit Testing

This guide helps new developers get up to speed with our testing infrastructure and Bitcoin-specific testing patterns.

## 🚀 Quick Setup (5 minutes)

### 1. Environment Setup
```bash
# Clone and install
git clone <repository>
cd bitcoin_benefit
npm install

# Verify test infrastructure
npm run test
npm run test:coverage
```

### 2. Run Your First Test
```bash
# Run a specific test to verify setup
npm run test VestingScheduleCalculator.test.ts

# Expected output: All tests passing ✅
```

### 3. IDE Configuration

**VS Code Extensions (Recommended):**
- Vitest Runner
- Jest Runner (works with Vitest)
- Error Lens
- TypeScript Importer

**VS Code Settings:**
```json
{
  "vitest.enable": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "testing.automaticallyOpenPeekView": "never"
}
```

## 📚 Learning Path

### Week 1: Foundation
1. **Read**: Main [TESTING_GUIDE.md](../TESTING_GUIDE.md)
2. **Practice**: Write a simple unit test for a utility function
3. **Review**: Existing test files in `src/lib/calculators/__tests__/`

### Week 2: Bitcoin-Specific Testing
1. **Study**: Bitcoin address validation tests
2. **Practice**: Create tests using `bitcoinTestData` utilities
3. **Review**: Form validation tests in `src/components/on-chain/__tests__/`

### Week 3: Component Testing
1. **Learn**: React Testing Library patterns
2. **Practice**: Test a simple component with user interactions
3. **Review**: Chart component tests and responsive testing

### Week 4: Advanced Topics
1. **Explore**: Performance testing patterns
2. **Practice**: Write integration tests
3. **Review**: Mocking strategies and test optimization

## 🎯 Your First Test Assignment

Create a test for a simple Bitcoin utility function:

```typescript
// src/lib/utils/satoshi-converter.ts
export function btcToSatoshis(btc: number): number {
  return Math.round(btc * 100_000_000);
}

export function satoshisToBtc(satoshis: number): number {
  return satoshis / 100_000_000;
}
```

**Your Task**: Create `src/lib/utils/__tests__/satoshi-converter.test.ts`

**Solution Template**:
```typescript
import { describe, it, expect } from 'vitest';
import { btcToSatoshis, satoshisToBtc } from '../satoshi-converter';

describe('Satoshi Converter', () => {
  describe('btcToSatoshis', () => {
    it('should convert 1 BTC to 100,000,000 satoshis', () => {
      expect(btcToSatoshis(1)).toBe(100_000_000);
    });

    it('should handle fractional BTC amounts', () => {
      expect(btcToSatoshis(0.5)).toBe(50_000_000);
      expect(btcToSatoshis(0.00000001)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(btcToSatoshis(0)).toBe(0);
      expect(btcToSatoshis(21)).toBe(2_100_000_000_000_000);
    });
  });

  describe('satoshisToBtc', () => {
    it('should convert 100,000,000 satoshis to 1 BTC', () => {
      expect(satoshisToBtc(100_000_000)).toBe(1);
    });

    it('should handle fractional conversions', () => {
      expect(satoshisToBtc(50_000_000)).toBe(0.5);
      expect(satoshisToBtc(1)).toBe(0.00000001);
    });
  });
});
```

## 🔧 Essential Testing Utilities

### Quick Reference Card

```typescript
// Import everything you need
import { 
  renderWithProviders,
  bitcoinTestData,
  bitcoinFormatUtils,
  bitcoinAddressUtils,
  vi 
} from '@/test-utils';

// Create test data
const transaction = bitcoinTestData.createMockTransaction();
const validAddress = bitcoinAddressUtils.validAddresses[0];

// Mock functions
const mockFn = vi.fn();
const mockApi = vi.mock('@/lib/api');

// Test components
renderWithProviders(<MyComponent />);
```

### Most Common Patterns

**1. Form Testing**
```typescript
it('validates user input', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Form />);
  
  await user.type(screen.getByLabelText(/address/i), 'invalid');
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

**2. Bitcoin Address Testing**
```typescript
it('accepts valid Bitcoin addresses', () => {
  bitcoinAddressUtils.validAddresses.forEach(address => {
    expect(validateAddress(address)).toBe(true);
  });
});
```

**3. Async Operations**
```typescript
it('handles async data loading', async () => {
  renderWithProviders(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## 🐛 Common Beginner Issues

### Issue 1: Import Errors
```bash
❌ Error: Cannot find module '@/components/...'
✅ Solution: Check import paths and aliases
```

### Issue 2: Async Test Failures
```bash
❌ Error: Test times out or element not found
✅ Solution: Use waitFor() for async operations
```

### Issue 3: Mock Not Working
```bash
❌ Error: Mock function not called
✅ Solution: Check mock placement and vi.clearAllMocks()
```

### Issue 4: Bitcoin Address Validation
```bash
❌ Error: Valid address marked as invalid
✅ Solution: Use bitcoinAddressUtils.validAddresses
```

## 📋 Daily Workflow

### Before Starting Development
```bash
# Pull latest changes and ensure tests pass
git pull
npm install
npm run test
```

### While Developing
```bash
# Run tests in watch mode
npm run test:watch

# Run tests for specific files
npm run test -- path/to/component
```

### Before Committing
```bash
# Run full test suite
npm run test

# Check coverage
npm run test:coverage

# Ensure no linting issues
npm run lint
```

## 🎨 Code Review Checklist

When reviewing tests, check for:

- [ ] **Descriptive test names** - Clear what is being tested
- [ ] **AAA pattern** - Arrange, Act, Assert structure
- [ ] **Edge cases covered** - Boundary values and error cases
- [ ] **Proper mocking** - External dependencies mocked
- [ ] **No test interdependence** - Tests can run in any order
- [ ] **Bitcoin-specific utilities used** - Consistent test data
- [ ] **Performance considerations** - Large datasets use performance utilities
- [ ] **Accessibility testing** - ARIA attributes and screen reader support

## 🚀 Performance Testing Quick Start

### Basic Performance Test
```typescript
import { performanceTestUtils } from '@/test-utils';

it('processes data efficiently', async () => {
  const largeDataset = performanceTestUtils.createLargeDataset(100);
  
  const time = await performanceTestUtils.measureTime(async () => {
    await processData(largeDataset);
  });
  
  expect(time).toBeLessThan(performanceTestUtils.thresholds.SLOW_OPERATION);
});
```

### Memory Usage Test
```typescript
it('manages memory efficiently', () => {
  const pressure = performanceTestUtils.mockMemoryPressure(50); // 50MB
  
  // Your code here
  
  // Memory should be cleaned up
  expect(getCurrentMemoryUsage()).toBeLessThan(threshold);
});
```

## 🎯 Next Steps

### After Onboarding Week 1-4:

1. **Contribute**: Add tests to increase coverage
2. **Optimize**: Identify and fix slow tests
3. **Mentor**: Help onboard the next developer
4. **Innovate**: Suggest improvements to testing infrastructure

### Advanced Topics to Explore:

- **E2E Testing**: Full user workflows with Playwright
- **Visual Regression**: Component screenshot testing  
- **API Contract Testing**: Ensure API compatibility
- **Load Testing**: Stress testing with many users

## 📞 Getting Help

### Resources:
- **Internal**: Team chat for quick questions
- **Documentation**: [TESTING_GUIDE.md](../TESTING_GUIDE.md) for comprehensive reference
- **Examples**: Browse `src/**/__tests__/` for patterns
- **External**: [Vitest Docs](https://vitest.dev/), [RTL Docs](https://testing-library.com/)

### Quick Help Commands:
```bash
# See all available test scripts
npm run

# Get test coverage report
npm run test:coverage

# Debug specific test
npm run test -- --reporter=verbose YourTest.test.ts
```

---

**Welcome to the team! Let's build robust, well-tested Bitcoin applications together! 🚀₿**
