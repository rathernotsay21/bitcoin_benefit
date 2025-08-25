# Code Duplication Detection & Elimination Implementation Guide

## Technical Implementation Details

This guide provides specific technical instructions for executing the Code Duplication Elimination Plan.

## Phase 1: Discovery Tools & Techniques

### 1.1 Automated Detection Tools

#### Pattern-Based Detection
```bash
# Use ripgrep for pattern matching
rg --type ts --type tsx -A 5 -B 5 "similar_pattern" src/

# Use ast-grep for structural similarity
ast-grep --pattern 'function $NAME($$$) { $$$ }' --lang typescript
```

#### Duplication Detection Commands
```bash
# JavaScript/TypeScript duplication detection
npx jscpd src/ --min-lines 5 --min-tokens 50 --format "typescript,tsx"

# Generate detailed report
npx jscpd src/ --reporters "html,json" --output reports/duplication/
```

### 1.2 Manual Analysis Patterns

#### Common Duplication Patterns to Search For:

1. **Calculation Logic**
   - Search: `calculateVesting`, `computeReturns`, `getBitcoinValue`
   - Files: `/src/lib/vesting-*.ts`, `/src/lib/historical-*.ts`
   - Pattern: Similar mathematical operations with different parameters

2. **API Handlers**
   - Search: `fetch`, `try...catch`, `res.status`
   - Files: `/src/app/api/*/route.ts`
   - Pattern: Repeated error handling and response formatting

3. **React Components**
   - Search: `useState`, `useEffect`, `useMemo`
   - Files: `/src/components/**/*.tsx`
   - Pattern: Similar component structure with minor variations

4. **Store Actions**
   - Search: `set(state =>`, `get().`, `subscribe`
   - Files: `/src/stores/*.ts`
   - Pattern: Repeated state update patterns

5. **Utility Functions**
   - Search: `export const`, `formatCurrency`, `formatDate`
   - Files: `/src/lib/utils/*.ts`
   - Pattern: Similar formatting and transformation logic

### 1.3 Metrics Collection

#### Key Metrics to Track:
```typescript
interface DuplicationMetrics {
  totalLines: number;
  duplicatedLines: number;
  duplicationPercentage: number;
  hotspots: Array<{
    file: string;
    duplicatedBlocks: number;
    impactScore: number; // 1-10 based on criticality
  }>;
  categories: {
    businessLogic: number;
    uiComponents: number;
    utilities: number;
    configuration: number;
    tests: number;
  };
}
```

## Phase 2: Categorization Framework

### 2.1 Priority Matrix

| Category | Priority | Risk Level | Refactoring Complexity | Business Impact |
|----------|----------|------------|----------------------|-----------------|
| Vesting Calculations | P0 - Critical | High | High | Critical |
| Historical Analysis | P0 - Critical | High | High | Critical |
| API Security | P0 - Critical | High | Medium | Critical |
| Chart Components | P1 - High | Medium | Medium | High |
| Form Validation | P1 - High | Medium | Low | High |
| Store Logic | P1 - High | Medium | Medium | High |
| UI Components | P2 - Medium | Low | Low | Medium |
| Utilities | P2 - Medium | Low | Low | Medium |
| Test Helpers | P3 - Low | Low | Low | Low |

### 2.2 Duplication Types

#### Type 1: Exact Duplicates
```typescript
// Example: Identical code blocks
const formatBitcoinValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};
```

#### Type 2: Parameterized Duplicates
```typescript
// Example: Same logic, different parameters
const calculatePioneerVesting = (data) => { /* logic */ };
const calculateStackerVesting = (data) => { /* similar logic */ };
const calculateBuilderVesting = (data) => { /* similar logic */ };
```

#### Type 3: Structural Duplicates
```typescript
// Example: Same structure, different implementation
const PioneerChart = () => { /* chart logic */ };
const StackerChart = () => { /* similar chart logic */ };
```

## Phase 3: Refactoring Patterns

### 3.1 Extract Common Functions

#### Before:
```typescript
// In multiple files
const validateBitcoinAddress = (address: string) => {
  // validation logic repeated
};
```

#### After:
```typescript
// src/lib/validators/bitcoin.ts
export const validateBitcoinAddress = (address: string): boolean => {
  // single source of truth
};

// Import wherever needed
import { validateBitcoinAddress } from '@/lib/validators/bitcoin';
```

### 3.2 Strategy Pattern for Vesting Schemes

#### Before:
```typescript
// Duplicated calculation logic
if (scheme === 'pioneer') {
  // pioneer calculation
} else if (scheme === 'stacker') {
  // stacker calculation
} else if (scheme === 'builder') {
  // builder calculation
}
```

#### After:
```typescript
// src/lib/vesting/strategies.ts
interface VestingStrategy {
  calculate(params: VestingParams): VestingResult;
  getName(): string;
  getDescription(): string;
}

const strategies: Record<VestingScheme, VestingStrategy> = {
  pioneer: new PioneerStrategy(),
  stacker: new StackerStrategy(),
  builder: new BuilderStrategy(),
};

export const calculateVesting = (scheme: VestingScheme, params: VestingParams) => {
  return strategies[scheme].calculate(params);
};
```

### 3.3 Custom Hook Extraction

#### Before:
```typescript
// Repeated in multiple components
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [data, setData] = useState<T | null>(null);

useEffect(() => {
  // fetch logic
}, []);
```

#### After:
```typescript
// src/hooks/useAsyncData.ts
export const useAsyncData = <T>(fetcher: () => Promise<T>, deps: any[] = []) => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    // unified fetch logic
  }, deps);

  return state;
};
```

### 3.4 Component Composition

#### Before:
```typescript
// Multiple similar chart components
const VestingChart = () => { /* 200 lines */ };
const HistoricalChart = () => { /* 180 similar lines */ };
```

#### After:
```typescript
// src/components/charts/BaseChart.tsx
const BaseChart = ({ data, config, children }: BaseChartProps) => {
  // shared chart logic
  return (
    <ChartContainer>
      {children}
    </ChartContainer>
  );
};

// Composed components
const VestingChart = () => (
  <BaseChart data={vestingData} config={vestingConfig}>
    <VestingSpecificContent />
  </BaseChart>
);
```

### 3.5 API Middleware Pattern

#### Before:
```typescript
// Repeated in every API route
export async function GET(request: Request) {
  try {
    // rate limiting
    // validation
    // business logic
    // error handling
  } catch (error) {
    // error response
  }
}
```

#### After:
```typescript
// src/lib/api/middleware.ts
export const withApiMiddleware = (
  handler: ApiHandler,
  options?: MiddlewareOptions
) => {
  return async (request: Request) => {
    // unified middleware logic
    try {
      await rateLimiter(request);
      await validator(request, options?.schema);
      const result = await handler(request);
      return apiResponse(result);
    } catch (error) {
      return errorResponse(error);
    }
  };
};

// Usage in routes
export const GET = withApiMiddleware(async (request) => {
  // just business logic
  return data;
});
```

## Phase 4: Testing Strategy

### 4.1 Test Before Refactoring

```typescript
// Create characterization tests
describe('Current Behavior', () => {
  it('should maintain exact calculation results', () => {
    const originalResult = originalCalculation(testData);
    const refactoredResult = refactoredCalculation(testData);
    expect(refactoredResult).toEqual(originalResult);
  });
});
```

### 4.2 Golden Master Testing

```typescript
// Capture current outputs
const captureGoldenMaster = () => {
  const scenarios = loadTestScenarios();
  const results = scenarios.map(scenario => ({
    input: scenario,
    output: currentImplementation(scenario)
  }));
  saveToFile('golden-master.json', results);
};

// Validate against golden master
const validateRefactoring = () => {
  const goldenMaster = loadGoldenMaster();
  goldenMaster.forEach(({ input, output }) => {
    const newOutput = refactoredImplementation(input);
    expect(newOutput).toEqual(output);
  });
};
```

### 4.3 Performance Benchmarking

```typescript
// src/__tests__/performance/duplication-impact.test.ts
import { performance } from 'perf_hooks';

describe('Performance Impact', () => {
  it('should not degrade performance', () => {
    const iterations = 10000;
    
    // Baseline
    const baselineStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      originalImplementation(testData);
    }
    const baselineTime = performance.now() - baselineStart;
    
    // Refactored
    const refactoredStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      refactoredImplementation(testData);
    }
    const refactoredTime = performance.now() - refactoredStart;
    
    // Should be within 10% of baseline
    expect(refactoredTime).toBeLessThan(baselineTime * 1.1);
  });
});
```

## Phase 5: Prevention Mechanisms

### 5.1 ESLint Configuration

```javascript
// .eslintrc.js additions
module.exports = {
  plugins: ['sonarjs'],
  rules: {
    'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-identical-conditions': 'error',
    'sonarjs/no-identical-expressions': 'error',
  },
};
```

### 5.2 Pre-commit Hook

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run check-duplication"
    }
  },
  "scripts": {
    "check-duplication": "jscpd src/ --threshold 3 --exitCode 1"
  }
}
```

### 5.3 CI/CD Integration

```yaml
# .github/workflows/duplication-check.yml
name: Code Duplication Check
on: [pull_request]
jobs:
  check-duplication:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check for duplications
        run: |
          npx jscpd src/ \
            --threshold 3 \
            --reporters "console,github-pr" \
            --exitCode 1
```

## Common Refactoring Scenarios

### Scenario 1: Duplicate Validation Logic

**Problem:** Same validation repeated in multiple places
**Solution:** Create validation schema with Zod

```typescript
// src/lib/validation/schemas.ts
export const bitcoinAddressSchema = z.string().refine(
  (val) => validateBitcoinAddress(val),
  { message: 'Invalid Bitcoin address' }
);

// Use everywhere
const validated = bitcoinAddressSchema.parse(input);
```

### Scenario 2: Duplicate API Calls

**Problem:** Same fetch logic in multiple components
**Solution:** Create API client with React Query

```typescript
// src/lib/api/client.ts
export const useBitcoinPrice = () => {
  return useQuery({
    queryKey: ['bitcoin-price'],
    queryFn: fetchBitcoinPrice,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Scenario 3: Duplicate State Management

**Problem:** Similar store slices with repeated logic
**Solution:** Create store factory

```typescript
// src/stores/factory.ts
export const createCalculatorStore = <T>(
  name: string,
  initialState: T,
  actions: StoreActions<T>
) => {
  return create<T & CommonActions>((set, get) => ({
    ...initialState,
    ...actions(set, get),
    reset: () => set(initialState),
    hydrate: (state: T) => set(state),
  }));
};
```

## Monitoring & Maintenance

### Continuous Monitoring

```bash
# Add to package.json scripts
"scripts": {
  "duplication:check": "jscpd src/ --format 'typescript,tsx' --reporters 'console'",
  "duplication:report": "jscpd src/ --reporters 'html' --output reports/",
  "duplication:trend": "node scripts/track-duplication-metrics.js"
}
```

### Metrics Dashboard

Create a simple dashboard to track progress:
- Current duplication percentage
- Trend over time
- Hotspot files
- Recently introduced duplications
- Refactoring velocity

## Tools & Resources

### Required Tools:
- `jscpd` - JavaScript Copy/Paste Detector
- `ast-grep` - Structural code search
- `sonarjs` - ESLint plugin for code quality
- `semgrep` - Static analysis tool

### Installation:
```bash
npm install --save-dev \
  jscpd \
  eslint-plugin-sonarjs \
  @ast-grep/cli
```

### Reference Documentation:
- [JSCPD Documentation](https://github.com/kucherenko/jscpd)
- [AST-GREP Guide](https://ast-grep.github.io/)
- [SonarJS Rules](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [Refactoring Catalog](https://refactoring.com/catalog/)

---

This implementation guide provides concrete, actionable steps for each phase of the duplication elimination plan. Follow these patterns and use the provided tools to systematically improve code quality while maintaining system stability.