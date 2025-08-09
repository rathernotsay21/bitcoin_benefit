# Testing Guide for Bitcoin Benefit Calculator

## Overview

This project uses Jest and React Testing Library for unit and integration testing. The test suite covers all calculator modules and ensures the reliability of financial calculations.

## Setup

```bash
# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/lib/calculators/__tests__/
├── VestingScheduleCalculator.test.ts
├── BitcoinGrowthProjector.test.ts
├── TaxImplicationCalculator.test.ts
├── EmployeeRetentionModeler.test.ts (TODO)
└── RiskAnalysisEngine.test.ts (TODO)
```

## Writing Tests

### Example Test Structure

```typescript
import { CalculatorName } from '../CalculatorName';

describe('CalculatorName', () => {
  let calculator: CalculatorName;

  beforeEach(() => {
    calculator = new CalculatorName();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      const result = calculator.methodName(input);
      expect(result).toBe(expectedOutput);
    });

    it('should handle edge case', () => {
      const result = calculator.methodName(edgeInput);
      expect(result).toBe(edgeExpectedOutput);
    });
  });
});
```

### Testing Best Practices

1. **Test both happy paths and edge cases**
   - Normal inputs
   - Boundary values
   - Invalid inputs
   - Empty/null values

2. **Use descriptive test names**
   - "should calculate vested amount correctly at 50% milestone"
   - "should return null for negative growth rates"

3. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` for setup
   - Don't rely on test execution order

4. **Test financial calculations precisely**
   ```typescript
   // Use toBeCloseTo for floating point comparisons
   expect(result).toBeCloseTo(1234.56, 2);
   ```

## Coverage Goals

- **Target**: 80%+ overall coverage
- **Critical paths**: 100% coverage for financial calculations
- **UI components**: Focus on business logic, not presentation

## Running Specific Tests

```bash
# Run a specific test file
npm test VestingScheduleCalculator.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="tax"

# Run tests in a specific directory
npm test src/lib/calculators/__tests__
```

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Add console.log for debugging
console.log('Debug value:', variable);

# Use debugger statement
debugger; // Execution will pause here when debugging
```

## Continuous Integration

Tests are automatically run on:
- Every push to main branch
- Every pull request
- Before deployment

## Common Issues and Solutions

### Issue: "Cannot find module '@/...'"
**Solution**: Ensure `tsconfig.json` path mappings are correct and Jest config includes moduleNameMapper.

### Issue: "ReferenceError: window is not defined"
**Solution**: Tests run in jsdom environment. For Node-only tests, use:
```typescript
/**
 * @jest-environment node
 */
```

### Issue: Async test timeout
**Solution**: Increase timeout for long-running tests:
```typescript
it('should handle async operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

## TODO: Additional Tests Needed

1. **EmployeeRetentionModeler tests**
   - Retention probability calculations
   - Cost effectiveness analysis
   - Retention curve modeling

2. **RiskAnalysisEngine tests**
   - Monte Carlo simulations
   - Value at Risk calculations
   - Risk scenario generation

3. **Integration tests**
   - Full vesting calculation flow
   - UI component interactions
   - API endpoint testing

4. **E2E tests** (using Cypress/Playwright)
   - Complete user workflows
   - Cross-browser testing
   - Performance testing

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Add tests for edge cases
4. Update this README if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
