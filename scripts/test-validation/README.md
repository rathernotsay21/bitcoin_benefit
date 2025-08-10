# Test Validation and Health Check System

A comprehensive test infrastructure monitoring and validation system for the Bitcoin Benefit project that ensures test reliability, performance, and maintainability.

## 🎯 Overview

This system provides automated validation, health monitoring, and maintenance tools for the test infrastructure, addressing:

- ✅ **Test File Validation**: Syntax errors, import path issues, string formatting problems
- 🏥 **Health Monitoring**: Test reliability, performance trends, coverage tracking  
- 🪝 **Pre-commit Hooks**: Automated validation before code commits
- 📊 **Dashboard Reporting**: Comprehensive health reports with actionable recommendations

## 🚀 Quick Start

### Install Pre-commit Hooks
```bash
npm run test:hooks:install
```

### Run Full Health Dashboard
```bash
npm run test:dashboard
```

### Fix Common Issues
```bash
npm run test:maintenance
```

## 📋 Available Commands

### Core Commands
```bash
# Full health dashboard with recommendations
npm run test:dashboard

# Complete infrastructure maintenance
npm run test:maintenance

# Validate all test files
npm run test:validate

# Check test suite health metrics
npm run test:health
```

### Fixing Issues
```bash
# Fix string formatting issues in test files
npm run test:fix-strings

# Run all automated fixes
npm run test:fix-issues
```

### Pre-commit Hooks
```bash
# Install validation hooks
npm run test:hooks:install

# Check hook status
npm run test:hooks:status

# Remove hooks
npm run test:hooks:remove
```

### Standard Testing
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance

# Watch mode
npm run test:watch
```

## 🔍 What Gets Validated

### Test File Validation
- **Syntax Errors**: TypeScript compilation issues, malformed strings
- **Import Paths**: Outdated component imports (e.g., `@/app/on-chain/page` → `@/app/track/page`)
- **String Formatting**: Unicode escape issues, escaped newlines
- **Configuration**: Jest/Vitest conflicts, missing test content
- **Best Practices**: Test descriptions, assertion patterns, mocking consistency

### Health Monitoring
- **Reliability Metrics**: Success rates, flaky test detection, consistently failing tests
- **Performance Tracking**: Runtime trends, slow test identification, optimization opportunities
- **Coverage Analysis**: Coverage percentages, trends, uncovered critical paths
- **Infrastructure Status**: Hook installation, runner configuration, tooling setup

### Pre-commit Validation
- Syntax validation of modified test files
- Import path correctness checking
- String formatting verification
- Quick test execution (optional)
- Malformed string prevention

## 📊 Health Scoring

The system calculates an overall health score (0-100) based on:

### Critical Issues (30-point penalty each)
- Test files with syntax errors
- Overall health score below 50
- Consistently failing tests

### Medium Issues (10-15 point penalty)
- Test files with warnings
- Health score 50-70
- Flaky tests
- Performance degradation
- Coverage below 70%

### Infrastructure Issues (5 points per missing component)
- Pre-commit hooks not installed
- Test runner not configured
- Coverage not enabled
- Performance tests not setup

## 🏥 Health Status Levels

### 💚 Healthy (Score: 80-100)
- All validations pass
- High test reliability (>90% success rate)
- Good coverage (>70%)
- Stable performance
- Proper infrastructure setup

### 💛 Warning (Score: 50-79)
- Some warnings present
- Moderate reliability issues
- Coverage gaps
- Performance concerns
- Missing infrastructure components

### ❤️ Critical (Score: 0-49)
- Syntax errors preventing tests
- Low reliability (<50% success)
- Severe performance issues
- Critical infrastructure missing

## 🔧 Common Issues and Fixes

### Syntax Errors
**Issue**: Test files with compilation errors
```bash
# Fix automatically
npm run test:fix-strings

# Validate specific issues
npm run test:validate
```

### Import Path Issues
**Issue**: Outdated component imports
**Fix**: Update import paths manually:
```typescript
// Old
import { TrackPage } from '@/app/on-chain/page';

// New  
import { TrackPage } from '@/app/track/page';
```

### String Formatting Issues
**Issue**: Escaped newlines in test strings
```bash
# Auto-fix with string normalizer
npm run test:fix-strings
```

### Flaky Tests
**Issue**: Tests that pass/fail inconsistently
1. Check health report for specific test names
2. Investigate timing issues, async operations
3. Add proper waits and assertions
4. Mock external dependencies

### Performance Issues
**Issue**: Slow test execution
1. Identify slow tests in health report
2. Optimize database operations
3. Use proper mocking
4. Consider parallel execution

## 📁 System Architecture

### Core Components

```
scripts/test-validation/
├── test-file-validator.ts     # Validates test file syntax and imports
├── test-health-monitor.ts     # Tracks test performance and reliability  
├── pre-commit-setup.ts        # Configures Git hooks
└── dashboard.ts               # Main reporting interface
```

### Data Storage

```
.test-health/
├── history.json              # Test run history and metrics
└── latest-report.json        # Most recent dashboard report
```

### Configuration Files

```
.test-validation-config.json  # Hook configuration
.git/hooks/pre-commit         # Git pre-commit hook
vitest.config.ts              # Test runner configuration
```

## ⚙️ Configuration

### Pre-commit Hook Options
```bash
# Create custom config
node scripts/test-validation/pre-commit-setup.ts config --syntax --imports --formatting

# Available flags:
--syntax        # Enable syntax validation
--imports       # Enable import path validation  
--quick-tests   # Enable quick test runs (slower)
--formatting    # Enable string formatting checks
--strings       # Enable string content validation
```

### Dashboard Customization
The dashboard automatically adapts to your project structure and provides context-aware recommendations based on:
- Bitcoin-specific testing patterns
- Recharts component mocking
- Performance test requirements
- Next.js component testing

## 🚨 Troubleshooting

### "Module not found" errors
```bash
# Check TypeScript configuration
npm run type-check

# Verify import paths
npm run test:validate
```

### Pre-commit hooks not running
```bash
# Check hook status
npm run test:hooks:status

# Reinstall hooks
npm run test:hooks:remove
npm run test:hooks:install
```

### Performance issues
```bash
# Check system health
npm run test:health

# Run maintenance
npm run test:maintenance
```

### CI/CD Integration
```bash
# Add to your CI pipeline
npm run test:validate  # Validate before running tests
npm run test           # Run test suite
npm run test:health    # Generate health report
```

## 📈 Monitoring and Maintenance

### Daily Workflow
1. **Pre-commit**: Hooks automatically validate changes
2. **Development**: Use `npm run test:watch` for active development
3. **Health Checks**: Run `npm run test:health` weekly

### Weekly Maintenance
```bash
# Complete infrastructure check
npm run test:maintenance

# Review health trends
npm run test:dashboard
```

### Monthly Reviews
1. Analyze health score trends
2. Address persistent flaky tests
3. Optimize slow test performance
4. Update validation rules as needed

## 🔄 Integration with Existing Workflow

This system integrates seamlessly with the existing Bitcoin Benefit test infrastructure:

- **Vitest**: Uses existing Vitest configuration
- **Coverage**: Leverages existing coverage setup
- **Mocking**: Works with established Recharts mocks
- **TypeScript**: Validates against project TypeScript config
- **Git**: Integrates with standard Git workflow

## 💡 Best Practices

### Writing Tests
- Use descriptive test names (avoid "Test" or "test" in descriptions)
- Implement proper error handling in tests
- Mock external dependencies consistently
- Keep test files focused and maintainable

### Performance
- Avoid unnecessary DOM queries
- Use efficient test data generation
- Mock heavy operations
- Consider test parallelization for large suites

### Reliability
- Write deterministic tests
- Handle async operations properly
- Use proper cleanup in test hooks
- Avoid test interdependencies

## 🎛️ Advanced Usage

### Custom Validation Rules
Extend the `ValidationRule` class in `test-file-validator.ts` to add project-specific validations.

### Health Metrics Customization
Modify scoring algorithms in `test-health-monitor.ts` to match your team's quality standards.

### Hook Customization
Edit pre-commit hook templates in `pre-commit-setup.ts` for custom validation workflows.

---

## 📞 Support

For issues or questions about the test validation system:

1. Check the health dashboard: `npm run test:dashboard`
2. Run maintenance mode: `npm run test:maintenance`
3. Review validation output: `npm run test:validate`
4. Check system status: `npm run test:hooks:status`

The system provides detailed error messages and actionable recommendations to help resolve issues quickly.
