# Design Document

## Overview

The Bitcoin Benefits project's test infrastructure requires comprehensive repair and modernization to address configuration conflicts, module resolution issues, and outdated test expectations. The current failures stem from three primary areas: dual test runner conflicts (Jest/Vitest), string formatting and unicode escape issues, and component tests that no longer match the updated React implementation.

This design outlines a systematic approach to unify the test infrastructure, resolve configuration conflicts, fix syntax issues, and update test expectations to match the current codebase. The solution prioritizes developer experience, CI/CD reliability, and maintainable test patterns.

## Architecture

### Test Runner Consolidation Strategy

**Primary Decision: Standardize on Vitest**
- Vitest provides better ES module support and performance for modern React applications
- Native TypeScript support without additional configuration
- Better integration with Vite-based tooling (future-proofing)
- Maintains Jest-compatible API for minimal migration effort

**Configuration Architecture:**
```
Project Root
├── vitest.config.ts (unified configuration)
├── src/test-setup.ts (global test setup)
├── src/test-utils.tsx (testing utilities)
└── tests/
    ├── __mocks__/ (global mocks)
    ├── fixtures/ (test data)
    └── helpers/ (test helpers)
```

### Module Resolution Strategy

**ES Module First Approach:**
- Configure all test files to use ES modules consistently
- Update import/export statements to use ES module syntax
- Configure Vitest to handle both ES modules and CommonJS dependencies
- Implement proper module path mapping for `@/` aliases

**TypeScript Configuration:**
- Separate `tsconfig.test.json` for test-specific TypeScript settings
- Include test files in TypeScript compilation
- Proper type definitions for test utilities and mocks

### String Formatting and Unicode Handling

**Root Cause Analysis:**
The unicode escape errors are caused by malformed string literals in test files where newline characters have been escaped as `\n` instead of actual newlines. This creates invalid JavaScript syntax that the SWC parser cannot process. The issue is particularly visible in comment blocks at the top of test files.

**Solution Strategy:**
- Implement automated string literal normalization
- Configure SWC/Babel to handle unicode characters properly
- Establish string formatting standards for test files
- Create validation tools to prevent similar issues

### Import Path Updates

**Current Issue:**
Recent React restructuring has moved components, causing import path mismatches. Tests are importing from `@/app/on-chain/page` but the actual component is now at `@/app/track/page.tsx`.

**Solution Strategy:**
- Update all test import paths to match current component locations
- Implement automated import path validation
- Create mapping documentation for component relocations

## Components and Interfaces

### 1. Unified Test Configuration

**vitest.config.ts (Enhanced)**
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/',
      'out/',
      '.next/',
      'coverage/'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'src/test-utils.tsx'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
```

### 2. Test Setup and Utilities

**Enhanced Test Setup (src/test-setup.ts)**
- Global DOM mocks (ResizeObserver, IntersectionObserver, matchMedia)
- Performance API mocks for consistent testing
- Console method mocking for performance tests
- Bitcoin-specific test utilities (address validation, amount formatting)

**Test Utilities (src/test-utils.tsx)**
```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions
) => {
  // Wrapper with necessary providers
  return render(ui, options);
};

// Bitcoin-specific test utilities
export const bitcoinTestUtils = {
  formatBTC: (amount: number) => `₿${amount.toFixed(6)}`,
  createMockTransaction: (overrides = {}) => ({ /* mock data */ }),
  createMockGrant: (overrides = {}) => ({ /* mock data */ })
};
```

### 3. String Normalization System

**Automated String Repair Tool**
```typescript
// scripts/fix-test-strings.ts
export class TestStringNormalizer {
  static normalizeEscapedNewlines(content: string): string {
    // Convert \\n to actual newlines
    return content.replace(/\\\\n/g, '\n');
  }
  
  static fixUnicodeEscapes(content: string): string {
    // Handle unicode characters properly
    return content.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => 
      String.fromCharCode(parseInt(code, 16))
    );
  }
  
  static processTestFile(filePath: string): void {
    // Read, normalize, and write back test files
  }
}
```

### 4. Component Test Modernization

**Test Expectation Updates**
- Bitcoin amount formatting: Update expectations to match actual component output
- Chart component selectors: Use correct test IDs and data attributes
- Responsive behavior: Proper viewport mocking and testing
- Error boundary testing: Match current error handling implementation

**Mock Strategy Standardization**
```typescript
// src/__mocks__/recharts.tsx
export const mockRechartsComponents = {
  ComposedChart: ({ children, ...props }: any) => (
    <div data-testid="composed-chart" {...props}>{children}</div>
  ),
  // ... other chart components
};
```

### 5. Performance Test Infrastructure

**Dedicated Performance Testing Setup**
- Separate performance test configuration
- Consistent timing and memory measurement utilities
- Mock external APIs for reliable performance testing
- Benchmark comparison and regression detection

## Data Models

### Test Configuration Model
```typescript
interface TestConfig {
  runner: 'vitest';
  environment: 'jsdom';
  setupFiles: string[];
  coverage: CoverageConfig;
  performance: PerformanceConfig;
}

interface PerformanceConfig {
  thresholds: PerformanceThresholds;
  mockAPIs: boolean;
  memoryTracking: boolean;
}
```

### Test Expectation Model
```typescript
interface ComponentTestExpectation {
  bitcoinFormatting: {
    pattern: RegExp;
    examples: string[];
  };
  chartElements: {
    testIds: string[];
    selectors: string[];
  };
  responsiveBehavior: {
    breakpoints: number[];
    expectedChanges: string[];
  };
}
```

## Error Handling

### Configuration Error Recovery
- Automatic detection of Jest/Vitest conflicts
- Clear error messages for module resolution issues
- Fallback configurations for different environments
- Validation of test setup before running tests

### String Formatting Error Prevention
- Pre-commit hooks to validate test file syntax
- Automated string normalization in CI/CD
- Clear error messages for unicode escape issues
- Documentation of proper string formatting patterns

### Test Failure Analysis
- Categorization of test failures (infrastructure vs. functional)
- Automated suggestions for common test fixes
- Integration with CI/CD to prevent deployment on infrastructure failures
- Clear reporting of test health metrics

## Testing Strategy

### Migration Testing Approach
1. **Phase 1**: Fix configuration conflicts and string formatting issues
2. **Phase 2**: Update component test expectations to match current implementation
3. **Phase 3**: Modernize performance tests and add regression detection
4. **Phase 4**: Implement comprehensive test documentation and standards

### Test Categories and Standards

**Unit Tests**
- Focus on individual component and utility function testing
- Use consistent mocking patterns
- Maintain high coverage for critical business logic

**Integration Tests**
- Test complete user workflows
- Validate error handling and recovery flows
- Ensure proper data flow between components

**Performance Tests**
- Benchmark critical operations
- Monitor memory usage and optimization effectiveness
- Validate concurrent processing improvements

**Visual/Component Tests**
- Test responsive behavior across breakpoints
- Validate accessibility compliance
- Ensure proper chart rendering and interactions

### Continuous Integration Integration
- Parallel test execution for faster feedback
- Separate performance test runs to avoid flaky results
- Clear reporting of test categories and failure reasons
- Automatic retry for infrastructure-related failures

## Implementation Considerations

### Backward Compatibility
- Maintain Jest-compatible API where possible
- Gradual migration approach to minimize disruption
- Clear migration guides for developers
- Fallback support during transition period

### Performance Optimization
- Parallel test execution
- Efficient mocking strategies
- Optimized test data generation
- Smart test selection based on code changes

### Developer Experience
- Fast test feedback loops
- Clear error messages and debugging information
- Integrated IDE support for test running and debugging
- Comprehensive documentation and examples

### Maintenance and Monitoring
- Automated test health monitoring
- Regular review of test performance and reliability
- Proactive identification of flaky tests
- Continuous improvement of test infrastructure