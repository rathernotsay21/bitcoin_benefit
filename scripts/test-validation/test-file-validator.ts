#!/usr/bin/env node

/**
 * Comprehensive Test File Validator
 * 
 * Validates test files for:
 * - Syntax errors and malformed strings
 * - Configuration issues
 * - Import path correctness
 * - Testing best practices
 * - Performance considerations
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { execSync } from 'child_process';

interface ValidationIssue {
  file: string;
  type: 'error' | 'warning' | 'info';
  category: 'syntax' | 'imports' | 'config' | 'performance' | 'best-practices';
  message: string;
  line?: number;
  suggestion?: string;
}

interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
  summary: {
    totalFiles: number;
    filesWithErrors: number;
    filesWithWarnings: number;
    categoryCounts: Record<string, number>;
  };
}

export class TestFileValidator {
  private projectRoot: string;
  private testExtensions = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];
  private validationRules: ValidationRule[] = [];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.initializeValidationRules();
  }

  private initializeValidationRules(): void {
    this.validationRules = [
      new SyntaxValidationRule(),
      new ImportPathValidationRule(this.projectRoot),
      new StringFormattingRule(),
      new TestConfigurationRule(),
      new PerformanceTestRule(),
      new BestPracticesRule(),
      new UnicodeHandlingRule(),
      new MockingPatternRule()
    ];
  }

  async validateAllTestFiles(): Promise<ValidationResult> {
    const testFiles = await this.findTestFiles();
    const issues: ValidationIssue[] = [];
    let filesWithErrors = 0;
    let filesWithWarnings = 0;
    const categoryCounts: Record<string, number> = {};

    console.log(`🔍 Validating ${testFiles.length} test files...`);

    for (const file of testFiles) {
      try {
        const fileIssues = await this.validateFile(file);
        issues.push(...fileIssues);

        const hasErrors = fileIssues.some(issue => issue.type === 'error');
        const hasWarnings = fileIssues.some(issue => issue.type === 'warning');

        if (hasErrors) filesWithErrors++;
        if (hasWarnings) filesWithWarnings++;

        // Count by category
        fileIssues.forEach(issue => {
          categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
        });

        if (fileIssues.length > 0) {
          console.log(`  📄 ${relative(this.projectRoot, file)}: ${fileIssues.length} issues`);
        }
      } catch (error) {
        issues.push({
          file,
          type: 'error',
          category: 'syntax',
          message: `Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        filesWithErrors++;
      }
    }

    const passed = filesWithErrors === 0;

    return {
      passed,
      issues,
      summary: {
        totalFiles: testFiles.length,
        filesWithErrors,
        filesWithWarnings,
        categoryCounts
      }
    };
  }

  private async findTestFiles(): Promise<string[]> {
    const testFiles: string[] = [];

    async function scanDirectory(dir: string): Promise<void> {
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stats = await stat(fullPath);

          if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
            await scanDirectory(fullPath);
          } else if (stats.isFile()) {
            if (testFiles.some(ext => entry.endsWith(ext))) {
              testFiles.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    }

    await scanDirectory(join(this.projectRoot, 'src'));
    return testFiles;
  }

  private async validateFile(filePath: string): Promise<ValidationIssue[]> {
    const content = await readFile(filePath, 'utf-8');
    const issues: ValidationIssue[] = [];

    for (const rule of this.validationRules) {
      try {
        const ruleIssues = await rule.validate(filePath, content);
        issues.push(...ruleIssues);
      } catch (error) {
        issues.push({
          file: filePath,
          type: 'error',
          category: 'config',
          message: `Validation rule failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return issues;
  }

  static printResults(result: ValidationResult): void {
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('═══════════════════════');
    console.log(`Total files checked: ${result.summary.totalFiles}`);
    console.log(`Files with errors: ${result.summary.filesWithErrors}`);
    console.log(`Files with warnings: ${result.summary.filesWithWarnings}`);
    
    if (Object.keys(result.summary.categoryCounts).length > 0) {
      console.log('\nIssues by category:');
      Object.entries(result.summary.categoryCounts).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    }

    if (result.issues.length > 0) {
      console.log('\n📋 DETAILED ISSUES');
      console.log('═══════════════════');
      
      const groupedIssues = result.issues.reduce((groups, issue) => {
        const key = issue.file;
        if (!groups[key]) groups[key] = [];
        groups[key].push(issue);
        return groups;
      }, {} as Record<string, ValidationIssue[]>);

      Object.entries(groupedIssues).forEach(([file, issues]) => {
        console.log(`\n📄 ${relative(process.cwd(), file)}`);
        issues.forEach(issue => {
          const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`  ${icon} [${issue.category}] ${issue.message}`);
          if (issue.line) console.log(`     Line ${issue.line}`);
          if (issue.suggestion) console.log(`     💡 ${issue.suggestion}`);
        });
      });
    }

    console.log(`\n${result.passed ? '✅ All tests passed validation!' : '❌ Validation failed'}`);
  }
}

// Validation Rules
abstract class ValidationRule {
  abstract validate(filePath: string, content: string): Promise<ValidationIssue[]>;
}

class SyntaxValidationRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    try {
      // Use TypeScript compiler to check syntax
      execSync(`npx tsc --noEmit --skipLibCheck "${filePath}"`, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
    } catch (error) {
      const errorOutput = error instanceof Error ? error.message : 'Syntax error';
      if (errorOutput.includes('error TS')) {
        issues.push({
          file: filePath,
          type: 'error',
          category: 'syntax',
          message: 'TypeScript compilation failed',
          suggestion: 'Check syntax and fix TypeScript errors'
        });
      }
    }

    return issues;
  }
}

class ImportPathValidationRule extends ValidationRule {
  constructor(private projectRoot: string) {
    super();
  }

  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/import.*from\s+['"](@\/[^'"]+)['"]/);
      
      if (importMatch) {
        const importPath = importMatch[1];
        const resolvedPath = importPath.replace('@/', 'src/');
        
        try {
          await stat(join(this.projectRoot, resolvedPath));
        } catch {
          // Try with common extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          for (const ext of extensions) {
            try {
              await stat(join(this.projectRoot, resolvedPath + ext));
              found = true;
              break;
            } catch {
              continue;
            }
          }

          if (!found) {
            issues.push({
              file: filePath,
              type: 'error',
              category: 'imports',
              message: `Import path not found: ${importPath}`,
              line: i + 1,
              suggestion: 'Update import path to match current file structure'
            });
          }
        }
      }
    }

    return issues;
  }
}

class StringFormattingRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for escaped newlines that should be actual newlines
      if (line.includes('\\\\n') && !line.includes('JSON.stringify')) {
        issues.push({
          file: filePath,
          type: 'warning',
          category: 'syntax',
          message: 'Found escaped newlines that may need normalization',
          line: i + 1,
          suggestion: 'Convert \\\\n to actual newlines in template strings'
        });
      }

      // Check for malformed unicode escapes
      if (line.match(/\\u[0-9a-fA-F]{0,3}[^0-9a-fA-F]/)) {
        issues.push({
          file: filePath,
          type: 'error',
          category: 'syntax',
          message: 'Malformed unicode escape sequence',
          line: i + 1,
          suggestion: 'Fix unicode escape sequences or use actual characters'
        });
      }
    }

    return issues;
  }
}

class TestConfigurationRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for Jest/Vitest conflicts
    if (content.includes('jest') && content.includes('vitest')) {
      issues.push({
        file: filePath,
        type: 'warning',
        category: 'config',
        message: 'File contains both Jest and Vitest imports',
        suggestion: 'Use Vitest exclusively for consistency'
      });
    }

    // Check for proper test setup
    if (!content.includes('import') && !content.includes('describe') && !content.includes('test')) {
      issues.push({
        file: filePath,
        type: 'warning',
        category: 'config',
        message: 'File appears to be empty or missing test content',
        suggestion: 'Add test cases or remove empty test file'
      });
    }

    return issues;
  }
}

class PerformanceTestRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (filePath.includes('performance.test')) {
      if (!content.includes('performance.now()') && !content.includes('Date.now()')) {
        issues.push({
          file: filePath,
          type: 'warning',
          category: 'performance',
          message: 'Performance test without timing measurements',
          suggestion: 'Add performance.now() or similar timing measurements'
        });
      }

      if (content.includes('console.log') && !content.includes('console.time')) {
        issues.push({
          file: filePath,
          type: 'info',
          category: 'performance',
          message: 'Consider using console.time() for performance logging',
          suggestion: 'Replace console.log with console.time/timeEnd for better timing'
        });
      }
    }

    return issues;
  }
}

class BestPracticesRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for proper test descriptions
    const describeMatches = content.match(/describe\(['"][^'"]*['"],/g);
    if (describeMatches) {
      describeMatches.forEach(match => {
        if (match.includes('Test') || match.includes('test')) {
          issues.push({
            file: filePath,
            type: 'info',
            category: 'best-practices',
            message: 'Test description contains redundant "test" word',
            suggestion: 'Describe what the component/function does, not that it\'s a test'
          });
        }
      });
    }

    // Check for proper assertions
    if (content.includes('expect(') && !content.includes('toEqual') && !content.includes('toBe')) {
      issues.push({
        file: filePath,
        type: 'warning',
        category: 'best-practices',
        message: 'Tests with expect() but no assertions found',
        suggestion: 'Add proper assertions like toEqual, toBe, etc.'
      });
    }

    return issues;
  }
}

class UnicodeHandlingRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for Bitcoin symbols and ensure proper handling
    if (content.includes('₿') || content.includes('bitcoin')) {
      if (!content.includes('UTF-8') && !content.includes('unicode')) {
        issues.push({
          file: filePath,
          type: 'info',
          category: 'best-practices',
          message: 'File contains Bitcoin symbols - ensure proper unicode handling',
          suggestion: 'Consider adding unicode handling tests'
        });
      }
    }

    return issues;
  }
}

class MockingPatternRule extends ValidationRule {
  async validate(filePath: string, content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Check for inconsistent mocking patterns
    if (content.includes('jest.mock') && content.includes('vi.mock')) {
      issues.push({
        file: filePath,
        type: 'error',
        category: 'config',
        message: 'Mixed Jest and Vitest mocking patterns',
        suggestion: 'Use vi.mock consistently for Vitest'
      });
    }

    // Check for Recharts mocking
    if (content.includes('recharts') && !content.includes('__mocks__')) {
      issues.push({
        file: filePath,
        type: 'info',
        category: 'best-practices',
        message: 'Recharts usage without explicit mocking',
        suggestion: 'Consider using centralized Recharts mocks from __mocks__ directory'
      });
    }

    return issues;
  }
}

// CLI execution
if (require.main === module) {
  const validator = new TestFileValidator();
  
  validator.validateAllTestFiles()
    .then(result => {
      TestFileValidator.printResults(result);
      process.exit(result.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export type { ValidationIssue, ValidationResult };
