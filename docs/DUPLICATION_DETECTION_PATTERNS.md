# Code Duplication Detection Patterns & Queries

## Quick Detection Commands for Sub-Agents

This document provides specific patterns and commands that agents should use to quickly identify code duplications in the Bitcoin Benefit codebase.

## 1. Business Logic Duplications

### Vesting Calculations
```bash
# Find similar calculation patterns
rg "vestingAmount|monthlyVesting|totalVested" src/lib/ -A 5 -B 5

# Find repeated mathematical operations
rg "(btcPrice \* |usdAmount \/ |growthRate)" src/lib/ --type ts

# Strategy-specific calculations
rg "scheme === '(pioneer|stacker|builder)'" src/ --type ts -A 10

# Compound interest calculations
rg "Math\.pow\(1 \+" src/lib/ --type ts
```

### Historical Analysis
```bash
# Date range calculations
rg "startDate.*endDate|dateRange" src/lib/historical*.ts -A 5

# Price fetching patterns
rg "getBitcoinPrice|fetchPrice|priceData" src/ --type ts

# Returns calculations
rg "calculateReturns|computeROI|totalReturn" src/lib/ --type ts
```

## 2. React Component Duplications

### Chart Components
```bash
# Recharts configuration patterns
rg "ResponsiveContainer|LineChart|AreaChart" src/components/ --type tsx -A 10

# Chart data formatting
rg "dataKey=|stroke=|fill=" src/components/charts/ --type tsx

# Tooltip customization
rg "CustomTooltip|TooltipContent|formatTooltip" src/components/ --type tsx
```

### Form Components
```bash
# Input field patterns
rg "useState.*input|onChange.*value|handleChange" src/components/ --type tsx -A 5

# Validation patterns
rg "errors\.|validate|isValid" src/components/ --type tsx

# Form submission
rg "onSubmit|handleSubmit|preventDefault" src/components/ --type tsx -A 10
```

### Loading States
```bash
# Loading patterns
rg "isLoading|loading\s*\?" src/components/ --type tsx

# Skeleton loaders
rg "Skeleton|Shimmer|LoadingPlaceholder" src/components/ --type tsx

# Suspense boundaries
rg "Suspense|fallback=|lazy\(" src/components/ --type tsx
```

## 3. API Handler Duplications

### Error Handling
```bash
# Try-catch patterns
rg "try\s*\{[\s\S]*?catch" src/app/api/ --type ts -U

# Error responses
rg "NextResponse\.json\(.*error|status\(4[0-9]{2}\)|status\(5[0-9]{2}\)" src/app/api/ --type ts

# Rate limiting
rg "rateLimit|rateLimiter|tooManyRequests" src/app/api/ --type ts
```

### Validation
```bash
# Request validation
rg "request\.json\(\)|await.*body|parse\(request" src/app/api/ --type ts

# Schema validation
rg "\.parse\(|\.safeParse\(|zod|schema" src/app/api/ --type ts

# Parameter extraction
rg "searchParams|query\.get|params\." src/app/api/ --type ts
```

## 4. Store Duplications

### Zustand Patterns
```bash
# Store creation
rg "create\<.*\>\(\(set|create\(.*=>" src/stores/ --type ts

# State updates
rg "set\(\s*\(?state" src/stores/ --type ts -A 5

# Selectors
rg "get\(\)\.|state\s*=>" src/stores/ --type ts

# Subscriptions
rg "subscribe\(|subscribeWithSelector" src/stores/ --type ts
```

### Cross-Store Communication
```bash
# Store imports
rg "from.*Store|import.*Store" src/ --type ts

# Store usage in components
rg "useStore|use.*Store\(" src/components/ --type tsx

# Store synchronization
rg "useEffect.*store|store.*subscribe" src/ --type tsx
```

## 5. Utility Function Duplications

### Formatters
```bash
# Currency formatting
rg "formatCurrency|formatUSD|toLocaleString.*currency" src/ --type ts

# Number formatting
rg "formatNumber|numberWithCommas|toFixed\(" src/ --type ts

# Date formatting
rg "formatDate|toLocaleDateString|format\(.*date" src/ --type ts
```

### Validators
```bash
# Bitcoin address validation
rg "validateBitcoin|isValidAddress|addressRegex" src/ --type ts

# Input validation
rg "isValid|validate[A-Z]|checkValid" src/lib/ --type ts

# Type guards
rg "is[A-Z][a-zA-Z]*\(.*\).*:" src/ --type ts
```

## 6. Type Definition Duplications

### Interface Patterns
```bash
# Similar interfaces
rg "interface.*\{" src/types/ --type ts -A 10

# Repeated type properties
rg "amount:.*number|price:.*number|value:.*number" src/types/ --type ts

# Union types
rg "type.*=.*\|" src/types/ --type ts
```

### Generic Types
```bash
# Generic definitions
rg "<T.*>|<.*extends" src/types/ --type ts

# Repeated generic patterns
rg "Array<|Promise<|Partial<" src/types/ --type ts
```

## 7. Configuration Duplications

### Constants
```bash
# Repeated constants
rg "const.*=\s*(3600|86400|604800)" src/ --type ts

# Configuration objects
rg "config\s*=\s*\{|Config\s*=|configuration" src/ --type ts -A 10

# Environment variables
rg "process\.env\.|NEXT_PUBLIC_" src/ --type ts
```

## 8. Test Code Duplications

### Test Setup
```bash
# Test fixtures
rg "beforeEach|beforeAll|afterEach" src/__tests__/ --type ts

# Mock data
rg "mock[A-Z]|fake[A-Z]|test[A-Z].*=" src/__tests__/ --type ts

# Test utilities
rg "render\(|screen\.|waitFor" src/__tests__/ --type tsx
```

## Advanced Pattern Detection

### AST-based Patterns

```javascript
// Use ast-grep for structural similarity

// Find similar function structures
ast-grep --pattern 'function $FUNC($$$PARAMS) {
  try {
    $$$BODY
  } catch ($ERR) {
    $$$CATCH
  }
}' --lang typescript

// Find similar React components
ast-grep --pattern 'const $COMPONENT = () => {
  const [$STATE, $SETTER] = useState($INIT);
  $$$REST
  return (
    $$$JSX
  );
}' --lang tsx

// Find similar API handlers
ast-grep --pattern 'export async function $METHOD(request: Request) {
  $$$BODY
  return NextResponse.json($DATA);
}' --lang typescript
```

### Semantic Patterns

```bash
# Find files with similar imports (likely similar functionality)
for file in src/**/*.ts; do
  echo "=== $file ==="
  grep "^import" "$file" | sort | md5sum
done | sort | uniq -d

# Find similar export patterns
rg "export\s+(const|function|class)" src/ --type ts | \
  awk '{print $3}' | sort | uniq -c | sort -rn | head -20
```

## Duplication Metrics Script

```typescript
// scripts/analyze-duplication.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const patterns = [
  // Critical patterns that indicate duplication
  { pattern: 'calculateVesting', weight: 10 },
  { pattern: 'try.*catch.*error', weight: 8 },
  { pattern: 'useState.*useEffect', weight: 6 },
  { pattern: 'NextResponse.json', weight: 5 },
  { pattern: 'formatCurrency', weight: 4 },
];

function analyzePattern(pattern: string, weight: number) {
  try {
    const result = execSync(
      `rg "${pattern}" src/ --type ts --type tsx --count-matches`,
      { encoding: 'utf-8' }
    );
    const matches = result.split('\n').filter(Boolean).length;
    return { pattern, matches, score: matches * weight };
  } catch {
    return { pattern, matches: 0, score: 0 };
  }
}

function generateReport() {
  const results = patterns.map(p => analyzePattern(p.pattern, p.weight));
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  
  console.log('Duplication Indicators Report');
  console.log('==============================');
  results.forEach(r => {
    console.log(`${r.pattern}: ${r.matches} matches (score: ${r.score})`);
  });
  console.log(`\nTotal Duplication Score: ${totalScore}`);
  console.log('Recommendation:', totalScore > 100 ? 'High duplication - refactor needed' : 'Acceptable duplication level');
}

generateReport();
```

## Quick Check Commands

### Overall Duplication Check
```bash
# Quick duplication percentage
npx jscpd src/ --min-lines 5 --silent --format "typescript,tsx" | grep "Duplicates"

# Top 10 most duplicated files
npx jscpd src/ --reporters json --silent | jq '.duplicates[].files[]' | sort | uniq -c | sort -rn | head -10
```

### Category-Specific Checks
```bash
# Business logic duplication
npx jscpd src/lib/ --min-lines 10 --format "typescript"

# Component duplication
npx jscpd src/components/ --min-lines 15 --format "tsx"

# API duplication
npx jscpd src/app/api/ --min-lines 8 --format "typescript"

# Store duplication
npx jscpd src/stores/ --min-lines 10 --format "typescript"
```

## Pattern Recognition Guide

### High-Priority Duplication Indicators

1. **Exact String Matches** (Priority: Critical)
   - Same error messages in multiple places
   - Repeated configuration values
   - Duplicate validation messages

2. **Structural Similarity** (Priority: High)
   - Similar try-catch blocks
   - Repeated if-else chains
   - Similar switch statements

3. **Logic Duplication** (Priority: High)
   - Same calculation formulas
   - Repeated validation logic
   - Similar data transformations

4. **Pattern Repetition** (Priority: Medium)
   - Similar component structures
   - Repeated API call patterns
   - Common state management patterns

5. **Boilerplate Code** (Priority: Low)
   - Import statements
   - Type definitions
   - Test setup code

## Agent-Specific Search Strategies

### For code-reviewer:
Focus on exact duplicates and code quality issues using ripgrep and AST patterns.

### For refactoring-specialist:
Look for structural patterns that can be abstracted using ast-grep.

### For typescript-pro:
Search for type definition duplications and opportunities for generics.

### For react-specialist:
Identify component pattern duplications and hook extraction opportunities.

### For performance-engineer:
Find duplications that impact bundle size and runtime performance.

---

Use these patterns and commands to efficiently identify code duplications throughout the codebase. Prioritize based on impact and complexity of refactoring.