# Test String Normalization Utilities

This directory contains utilities for fixing and validating string formatting issues in test files, specifically designed to address the malformed comment blocks and escaped newline issues that were causing test failures.

## Overview

The test infrastructure repair utilities consist of three main components:

1. **TestStringNormalizer** - Core normalization logic with comprehensive validation
2. **Simple Test File Fixer** - Practical script for fixing common issues
3. **Validation Scripts** - Tools for detecting and verifying fixes

## Quick Fix

If you just need to fix the test files quickly:

```bash
# Fix all test files
node scripts/fix-test-files.js

# Validate the fixes
node scripts/validate-fixes.js
```

## Utilities

### 1. TestStringNormalizer (`test-string-normalizer.ts`)

The comprehensive TypeScript utility with full validation and reporting capabilities.

**Features:**
- Normalizes escaped newlines in comment blocks
- Fixes unicode escape sequences
- Validates string literals for syntax errors
- Creates backups before making changes
- Generates detailed processing reports

**Usage:**
```bash
npx ts-node scripts/test-string-normalizer.ts
```

**Methods:**
- `normalizeEscapedNewlines()` - Converts `\\n` to actual newlines
- `fixUnicodeEscapes()` - Handles unicode characters properly
- `normalizeCommentBlocks()` - Fixes malformed comment blocks
- `validateStringLiterals()` - Detects potential syntax issues
- `processTestFile()` - Process a single file
- `processAllTestFiles()` - Process all test files in the project

### 2. Simple Test File Fixer (`fix-test-files.js`)

A practical Node.js script for quickly fixing common issues without TypeScript compilation overhead.

**Features:**
- Fixes malformed comment blocks at file start
- Handles escaped newlines
- Processes unicode characters
- Creates backups automatically
- Simple, fast execution

**Usage:**
```bash
node scripts/fix-test-files.js
```

### 3. Test String Validator (`validate-test-strings.ts`)

Standalone validation utility for detecting string formatting issues.

**Features:**
- Validates string literals in test files
- Detects malformed comment blocks
- Identifies unicode character issues
- Can be used in CI/CD pipelines
- Multiple output formats

**Usage:**
```bash
# Full validation report
npx ts-node scripts/validate-test-strings.ts validate

# Brief summary for CI/CD
npx ts-node scripts/validate-test-strings.ts summary

# Check for critical issues only
npx ts-node scripts/validate-test-strings.ts check-critical
```

### 4. Fix Validation (`validate-fixes.js`)

Simple validation script to verify that fixes have been applied correctly.

**Usage:**
```bash
node scripts/validate-fixes.js
```

## Common Issues Fixed

### 1. Malformed Comment Blocks

**Before:**
```javascript
/**\n * Comprehensive tests for on-chain error handling\n * Tests error scenarios\n */
```

**After:**
```javascript
/**
 * Comprehensive tests for on-chain error handling
 * Tests error scenarios
 */
```

### 2. Escaped Newlines in Strings

**Before:**
```javascript
const message = "Line 1\\nLine 2\\nLine 3";
```

**After:**
```javascript
const message = "Line 1\nLine 2\nLine 3";
```

### 3. Unicode Character Issues

**Before:**
```javascript
const symbol = "\\u20BF"; // Bitcoin symbol
```

**After:**
```javascript
const symbol = "₿"; // Bitcoin symbol
```

## Integration with Development Workflow

### Pre-commit Hook

Add to your `.git/hooks/pre-commit`:

```bash
#!/bin/sh
node scripts/validate-fixes.js
if [ $? -ne 0 ]; then
  echo "❌ Test file validation failed. Run 'node scripts/fix-test-files.js' to fix issues."
  exit 1
fi
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Validate test file formatting
  run: |
    node scripts/validate-fixes.js
    if [ $? -ne 0 ]; then
      echo "Test files have formatting issues"
      exit 1
    fi
```

### Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "fix-tests": "node scripts/fix-test-files.js",
    "validate-tests": "node scripts/validate-fixes.js",
    "test:format": "node scripts/validate-fixes.js && npm test"
  }
}
```

## Backup and Recovery

All utilities create backup files before making changes:

- Original file: `src/lib/test.ts`
- Backup file: `src/lib/test.ts.backup`

To restore from backup:
```bash
# Restore a single file
mv src/lib/test.ts.backup src/lib/test.ts

# Restore all backups
find . -name "*.backup" -exec sh -c 'mv "$1" "${1%.backup}"' _ {} \;
```

## Troubleshooting

### TypeScript Compilation Issues

If you encounter TypeScript compilation errors with the `.ts` utilities:

1. Use the JavaScript versions instead:
   ```bash
   node scripts/fix-test-files.js
   node scripts/validate-fixes.js
   ```

2. Or ensure your TypeScript configuration is correct:
   ```bash
   npm install -g ts-node
   npx ts-node --version
   ```

### Module Resolution Issues

If you see module resolution errors:

1. Ensure dependencies are installed:
   ```bash
   npm install glob @types/glob
   ```

2. Use the standalone JavaScript utilities which have no external dependencies beyond Node.js built-ins.

### Permission Issues

If you encounter permission errors:

```bash
chmod +x scripts/*.js
chmod +x scripts/*.ts
```

## Best Practices

1. **Always run validation after fixes:**
   ```bash
   node scripts/fix-test-files.js && node scripts/validate-fixes.js
   ```

2. **Review changes before committing:**
   ```bash
   git diff
   ```

3. **Test your tests after fixing:**
   ```bash
   npm test
   ```

4. **Keep backups until you're confident:**
   - Don't delete `.backup` files immediately
   - Test thoroughly before removing backups

5. **Use in CI/CD:**
   - Add validation to your CI pipeline
   - Fail builds on formatting issues
   - Automate fixes where appropriate

## Requirements Addressed

This utility addresses the following requirements from the test infrastructure repair specification:

- **2.1**: Automated string repair for escaped newlines and unicode issues
- **2.2**: Proper handling of unicode characters (Bitcoin symbols, etc.)
- **2.3**: Validation functions to detect malformed string literals
- **2.4**: Prevention of syntax errors in test files

The utilities ensure that test files can be parsed correctly by the JavaScript/TypeScript engine and that string literals are properly formatted for reliable test execution.