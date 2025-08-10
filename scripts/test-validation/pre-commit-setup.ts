#!/usr/bin/env node

/**
 * Pre-commit Hook Setup
 * 
 * Configures Git hooks to validate test files before commits:
 * - Validates test file syntax and formatting
 * - Checks import paths and configurations
 * - Runs quick health checks on modified tests
 * - Prevents commits with test infrastructure issues
 */

import { writeFile, chmod, mkdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

interface HookConfig {
  validateSyntax: boolean;
  validateImports: boolean;
  runQuickTests: boolean;
  checkFormatting: boolean;
  preventBadStrings: boolean;
  timeoutMs: number;
}

export class PreCommitHookSetup {
  private projectRoot: string;
  private hooksDir: string;
  private preCommitHook: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.hooksDir = join(projectRoot, '.git', 'hooks');
    this.preCommitHook = join(this.hooksDir, 'pre-commit');
  }

  async setupHooks(config: Partial<HookConfig> = {}): Promise<void> {
    const defaultConfig: HookConfig = {
      validateSyntax: true,
      validateImports: true,
      runQuickTests: false, // Disabled by default for speed
      checkFormatting: true,
      preventBadStrings: true,
      timeoutMs: 30000 // 30 seconds max
    };

    const finalConfig = { ...defaultConfig, ...config };

    console.log('🪝 Setting up pre-commit hooks...');

    // Ensure .git/hooks directory exists
    await mkdir(this.hooksDir, { recursive: true });

    // Create pre-commit hook
    await this.createPreCommitHook(finalConfig);

    // Create supporting scripts
    await this.createSupportingScripts();

    // Install hook dependencies
    await this.setupHookDependencies();

    console.log('✅ Pre-commit hooks installed successfully!');
    console.log('\n📋 Hook Configuration:');
    Object.entries(finalConfig).forEach(([key, value]) => {
      console.log('  ' + key + ': ' + value);
    });

    console.log('\n💡 To temporarily bypass hooks, use: git commit --no-verify');
  }

  private async createPreCommitHook(config: HookConfig): Promise<void> {
    const hookScript = this.generateHookScript(config);
    
    await writeFile(this.preCommitHook, hookScript, { mode: 0o755 });
    await chmod(this.preCommitHook, 0o755);
    
    console.log('✅ Created pre-commit hook: ' + this.preCommitHook);
  }

  private generateHookScript(config: HookConfig): string {
    return `#!/bin/bash

# Bitcoin Benefit Pre-commit Hook
# Validates test files before allowing commits

set -e

echo "🔍 Running pre-commit validation..."

# Configuration
VALIDATE_SYNTAX=${config.validateSyntax}
VALIDATE_IMPORTS=${config.validateImports}
RUN_QUICK_TESTS=${config.runQuickTests}
CHECK_FORMATTING=${config.checkFormatting}
PREVENT_BAD_STRINGS=${config.preventBadStrings}
TIMEOUT_MS=${config.timeoutMs}

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "\${GREEN}ℹ️  \$1\${NC}"
}

log_warn() {
    echo -e "\${YELLOW}⚠️  \$1\${NC}"
}

log_error() {
    echo -e "\${RED}❌ \$1\${NC}"
}

# Check if we're in a git repository
if [ ! -d .git ]; then
    log_error "Not in a git repository"
    exit 1
fi

# Get list of modified test files
MODIFIED_TEST_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "\\.(test|spec)\\.(ts|tsx|js|jsx)\$" || true)

if [ -z "\$MODIFIED_TEST_FILES" ]; then
    log_info "No test files modified, skipping validation"
    exit 0
fi

echo "📝 Modified test files:"
echo "\$MODIFIED_TEST_FILES" | sed 's/^/  /'

# Create temporary directory for validation
TEMP_DIR=\$(mktemp -d)
trap "rm -rf \$TEMP_DIR" EXIT

# Validation functions
validate_syntax() {
    log_info "Validating syntax..."
    
    for file in \$MODIFIED_TEST_FILES; do
        if [ -f "\$file" ]; then
            # Check TypeScript compilation
            if ! timeout \${TIMEOUT_MS}ms npx tsc --noEmit --skipLibCheck "\$file" 2>/dev/null; then
                log_error "Syntax error in \$file"
                return 1
            fi
        fi
    done
    
    log_info "Syntax validation passed"
    return 0
}

validate_imports() {
    log_info "Validating import paths..."
    
    for file in \$MODIFIED_TEST_FILES; do
        if [ -f "\$file" ]; then
            # Check for common import issues
            if grep -q "from '@/app/on-chain/page'" "\$file"; then
                log_error "Outdated import path in \$file: @/app/on-chain/page should be @/app/track/page"
                return 1
            fi
            
            # Check for mixed Jest/Vitest imports
            if grep -q "jest" "\$file" && grep -q "vitest" "\$file"; then
                log_error "Mixed Jest/Vitest imports in \$file"
                return 1
            fi
        fi
    done
    
    log_info "Import validation passed"
    return 0
}

check_formatting() {
    log_info "Checking string formatting..."
    
    for file in \$MODIFIED_TEST_FILES; do
        if [ -f "\$file" ]; then
            # Check for malformed unicode escapes
            if grep -n "\\\\\\\\u[0-9a-fA-F]\\{0,3\\}[^0-9a-fA-F]" "\$file"; then
                log_error "Malformed unicode escape in \$file"
                return 1
            fi
            
            # Check for escaped newlines that should be actual newlines
            if grep -n "\\\\\\\\\\\\\\\\n" "\$file" | grep -v "JSON.stringify"; then
                log_warn "Found escaped newlines in \$file - consider using actual newlines"
            fi
        fi
    done
    
    log_info "Formatting check passed"
    return 0
}

prevent_bad_strings() {
    log_info "Checking for problematic strings..."
    
    for file in \$MODIFIED_TEST_FILES; do
        if [ -f "\$file" ]; then
            # Check for incomplete test implementations
            if grep -q "TODO\\|FIXME\\|XXX" "\$file"; then
                log_warn "Found TODO/FIXME markers in \$file"
            fi
            
            # Check for console.log in non-performance tests
            if [[ ! "\$file" =~ performance ]] && grep -q "console\\.log" "\$file"; then
                log_warn "Found console.log in \$file - consider removing for cleaner tests"
            fi
        fi
    done
    
    log_info "String validation passed"
    return 0
}

run_quick_tests() {
    log_info "Running quick tests on modified files..."
    
    # Run only the modified test files
    for file in \$MODIFIED_TEST_FILES; do
        if [ -f "\$file" ]; then
            if ! timeout \${TIMEOUT_MS}ms npm run test -- "\$file" --run 2>/dev/null; then
                log_error "Tests failed in \$file"
                return 1
            fi
        fi
    done
    
    log_info "Quick tests passed"
    return 0
}

# Run validations based on configuration
VALIDATION_FAILED=false

if [ "\$VALIDATE_SYNTAX" = "true" ]; then
    if ! validate_syntax; then
        VALIDATION_FAILED=true
    fi
fi

if [ "\$VALIDATE_IMPORTS" = "true" ]; then
    if ! validate_imports; then
        VALIDATION_FAILED=true
    fi
fi

if [ "\$CHECK_FORMATTING" = "true" ]; then
    if ! check_formatting; then
        VALIDATION_FAILED=true
    fi
fi

if [ "\$PREVENT_BAD_STRINGS" = "true" ]; then
    if ! prevent_bad_strings; then
        VALIDATION_FAILED=true
    fi
fi

if [ "\$RUN_QUICK_TESTS" = "true" ]; then
    if ! run_quick_tests; then
        VALIDATION_FAILED=true
    fi
fi

# Final result
if [ "\$VALIDATION_FAILED" = "true" ]; then
    log_error "Pre-commit validation failed!"
    echo ""
    echo "💡 To fix issues automatically, try:"
    echo "  npm run test:validate"
    echo "  npm run test:fix-strings"
    echo ""
    echo "🚫 To bypass this check (not recommended), use:"
    echo "  git commit --no-verify"
    echo ""
    exit 1
else
    log_info "All validations passed! ✨"
    exit 0
fi
`;
  }

  private async createSupportingScripts(): Promise<void> {
    // Create quick validation script
    const quickValidatorScript = `#!/usr/bin/env node

const { TestFileValidator } = require('./test-validation/test-file-validator');

async function runQuickValidation() {
  const validator = new TestFileValidator();
  
  // Get staged files
  const { execSync } = require('child_process');
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8' })
    .split('\\n')
    .filter(file => file.match(/\\.(test|spec)\\.(ts|tsx|js|jsx)$/));

  if (stagedFiles.length === 0) {
    console.log('✅ No test files to validate');
    return;
  }

  console.log('🔍 Validating ' + stagedFiles.length + ' staged test files...');
  
  const result = await validator.validateSpecificFiles(stagedFiles);
  validator.printResults(result);
  
  process.exit(result.passed ? 0 : 1);
}

runQuickValidation().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
`;

    await writeFile(
      join(this.projectRoot, 'scripts', 'quick-test-validation.js'),
      quickValidatorScript
    );

    // Create test fixing script
    const testFixerScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const { join } = require('path');

async function fixTestIssues() {
  console.log('🔧 Running automated test fixes...');
  
  try {
    // Run string normalizer
    execSync('node scripts/test-string-normalizer.ts', { stdio: 'inherit' });
    
    // Run validation after fixes
    execSync('node scripts/validate-all-test-files.js', { stdio: 'inherit' });
    
    console.log('✅ Test fixes completed');
  } catch (error) {
    console.error('❌ Fix process failed:', error.message);
    process.exit(1);
  }
}

fixTestIssues();
`;

    await writeFile(
      join(this.projectRoot, 'scripts', 'fix-test-issues.js'),
      testFixerScript
    );

    console.log('✅ Created supporting scripts');
  }

  private async setupHookDependencies(): Promise<void> {
    // Update package.json scripts if needed
    const packageJsonPath = join(this.projectRoot, 'package.json');
    
    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      
      const newScripts = {
        'test:validate': 'node scripts/test-validation/test-file-validator.ts',
        'test:health': 'node scripts/test-validation/test-health-monitor.ts',
        'test:fix-strings': 'node scripts/test-string-normalizer.ts',
        'test:quick-validate': 'node scripts/quick-test-validation.js',
        'test:fix-issues': 'node scripts/fix-test-issues.js',
        'precommit:validate': 'node scripts/quick-test-validation.js'
      };

      let updated = false;
      Object.entries(newScripts).forEach(([script, command]) => {
        if (!packageJson.scripts[script]) {
          packageJson.scripts[script] = command;
          updated = true;
        }
      });

      if (updated) {
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json scripts');
      }

    } catch (error) {
      console.warn('⚠️ Could not update package.json scripts:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async removeHooks(): Promise<void> {
    try {
      if (existsSync(this.preCommitHook)) {
        const fs = await import('fs/promises');
        await fs.unlink(this.preCommitHook);
        console.log('✅ Pre-commit hook removed');
      } else {
        console.log('ℹ️ No pre-commit hook found to remove');
      }
    } catch (error) {
      console.error('❌ Failed to remove hooks:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async checkHookStatus(): Promise<void> {
    console.log('🔍 Checking pre-commit hook status...');
    
    if (existsSync(this.preCommitHook)) {
      console.log('✅ Pre-commit hook is installed');
      
      try {
        const hookContent = await readFile(this.preCommitHook, 'utf-8');
        if (hookContent.includes('Bitcoin Benefit Pre-commit Hook')) {
          console.log('✅ Hook appears to be our custom validation hook');
        } else {
          console.log('⚠️ Pre-commit hook exists but may not be our validation hook');
        }
      } catch (error) {
        console.log('⚠️ Could not read hook content');
      }
    } else {
      console.log('❌ No pre-commit hook installed');
    }

    // Check if git hooks are enabled
    try {
      execSync('git config core.hooksPath', { stdio: 'pipe' });
      console.log('ℹ️ Custom hooks path is configured');
    } catch (error) {
      console.log('ℹ️ Using default hooks path');
    }
  }

  static async createConfigFile(projectRoot: string, config: Partial<HookConfig>): Promise<void> {
    const configPath = join(projectRoot, '.test-validation-config.json');
    const defaultConfig: HookConfig = {
      validateSyntax: true,
      validateImports: true,
      runQuickTests: false,
      checkFormatting: true,
      preventBadStrings: true,
      timeoutMs: 30000
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    await writeFile(configPath, JSON.stringify(finalConfig, null, 2));
    console.log('✅ Created config file: ' + configPath);
  }
}

// CLI execution
if (require.main === module) {
  const setup = new PreCommitHookSetup();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'install':
      setup.setupHooks()
        .then(() => console.log('🎉 Installation complete!'))
        .catch(error => {
          console.error('❌ Installation failed:', error);
          process.exit(1);
        });
      break;
      
    case 'remove':
      setup.removeHooks()
        .then(() => console.log('🗑️ Removal complete!'))
        .catch(error => {
          console.error('❌ Removal failed:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      setup.checkHookStatus();
      break;
      
    case 'config':
      const configOptions = {
        validateSyntax: process.argv.includes('--syntax'),
        validateImports: process.argv.includes('--imports'),
        runQuickTests: process.argv.includes('--quick-tests'),
        checkFormatting: process.argv.includes('--formatting'),
        preventBadStrings: process.argv.includes('--strings'),
        timeoutMs: 30000
      };
      
      PreCommitHookSetup.createConfigFile(process.cwd(), configOptions)
        .then(() => console.log('📝 Config created!'))
        .catch(error => {
          console.error('❌ Config creation failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('🪝 Pre-commit Hook Setup');
      console.log('');
      console.log('Usage:');
      console.log('  node pre-commit-setup.js install     # Install hooks');
      console.log('  node pre-commit-setup.js remove      # Remove hooks');
      console.log('  node pre-commit-setup.js status      # Check status');
      console.log('  node pre-commit-setup.js config      # Create config file');
      console.log('');
      console.log('Config options:');
      console.log('  --syntax      # Enable syntax validation');
      console.log('  --imports     # Enable import validation');
      console.log('  --quick-tests # Enable quick test runs');
      console.log('  --formatting  # Enable formatting checks');
      console.log('  --strings     # Enable string validation');
      break;
  }
}

export type { HookConfig };
