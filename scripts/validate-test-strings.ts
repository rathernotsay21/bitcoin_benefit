#!/usr/bin/env node

/**
 * Test String Validator - Validation functions to detect malformed string literals
 * Can be used independently or as part of CI/CD pipeline
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Type definitions
export interface ValidationResult {
  type: 'malformed_comment' | 'unicode_character' | 'malformed_string' | 'template_literal_syntax';
  line: number;
  message: string;
  suggestion: string;
}

export class TestStringValidator {
  /**
   * Validate string literals in test files
   * Detects malformed string literals that could cause parsing errors
   */
  static validateStringLiterals(content: string): ValidationResult[] {
    const issues: ValidationResult[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for escaped newlines in comment blocks
      if (line.includes('/**\\n') || line.includes('\\n */')) {
        issues.push({
          type: 'malformed_comment',
          line: lineNumber,
          message: 'Comment block contains escaped newlines',
          suggestion: 'Use actual newlines in comment blocks'
        });
      }

      // Check for unescaped unicode characters that should be escaped
      const unicodePattern = /[^\x00-\x7F]/g;
      const unicodeMatches = line.match(unicodePattern);
      if (unicodeMatches) {
        unicodeMatches.forEach(char => {
          if (char !== '₿') { // Bitcoin symbol is allowed
            issues.push({
              type: 'unicode_character',
              line: lineNumber,
              message: `Unescaped unicode character: ${char}`,
              suggestion: `Consider escaping as \\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
            });
          }
        });
      }

      // Check for malformed string literals
      const malformedStringPattern = /["'`][^"'`]*\\n[^"'`]*["'`]/g;
      if (malformedStringPattern.test(line)) {
        issues.push({
          type: 'malformed_string',
          line: lineNumber,
          message: 'String literal contains escaped newlines',
          suggestion: 'Use template literals or actual newlines for multiline strings'
        });
      }

      // Check for syntax errors in template literals
      const templateLiteralPattern = /`[^`]*`/g;
      const templateMatches = line.match(templateLiteralPattern);
      if (templateMatches) {
        templateMatches.forEach(template => {
          try {
            // Basic validation - check for unmatched braces
            const braceCount = (template.match(/\${/g) || []).length;
            const closeBraceCount = (template.match(/}/g) || []).length;
            if (braceCount !== closeBraceCount) {
              issues.push({
                type: 'template_literal_syntax',
                line: lineNumber,
                message: 'Template literal has unmatched braces',
                suggestion: 'Check template literal syntax for proper ${} expressions'
              });
            }
          } catch (error) {
            issues.push({
              type: 'template_literal_syntax',
              line: lineNumber,
              message: 'Template literal syntax error',
              suggestion: 'Check template literal for syntax issues'
            });
          }
        });
      }
    });

    return issues;
  }

  /**
   * Validate a single test file for string formatting issues
   */
  static validateTestFile(filePath: string): ValidationResult[] {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.validateStringLiterals(content);
    } catch (error) {
      return [{
        type: 'malformed_string',
        line: 0,
        message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: 'Check file permissions and path'
      }];
    }
  }

  /**
   * Validate all test files in the project
   */
  static async validateAllTestFiles(projectRoot: string = process.cwd()): Promise<ValidationReport> {
    const testFilePatterns = [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx'
    ];

    const fileResults: FileValidationResult[] = [];

    for (const pattern of testFilePatterns) {
      try {
        const files = await glob(pattern, { cwd: projectRoot });
        
        for (const file of files) {
          const fullPath = path.join(projectRoot, file);
          const issues = this.validateTestFile(fullPath);
          
          fileResults.push({
            filePath: fullPath,
            relativePath: file,
            issues,
            hasIssues: issues.length > 0
          });
        }
      } catch (error) {
        console.error(`Error validating pattern ${pattern}:`, error);
      }
    }

    return this.generateValidationReport(fileResults);
  }

  /**
   * Check if a file has critical syntax errors that would prevent parsing
   */
  static hasCriticalSyntaxErrors(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = this.validateStringLiterals(content);
      
      // Critical errors that would prevent parsing
      const criticalTypes = ['malformed_comment', 'malformed_string', 'template_literal_syntax'];
      return issues.some(issue => criticalTypes.includes(issue.type));
    } catch (error) {
      return true; // If we can't read the file, consider it critical
    }
  }

  /**
   * Get a summary of validation issues for CI/CD reporting
   */
  static async getValidationSummary(projectRoot: string = process.cwd()): Promise<ValidationSummary> {
    const report = await this.validateAllTestFiles(projectRoot);
    
    const criticalFiles = report.fileResults.filter(file => 
      file.issues.some(issue => 
        ['malformed_comment', 'malformed_string', 'template_literal_syntax'].includes(issue.type)
      )
    );

    return {
      totalFiles: report.totalFiles,
      filesWithIssues: report.filesWithIssues,
      totalIssues: report.totalIssues,
      criticalFiles: criticalFiles.length,
      criticalIssues: criticalFiles.reduce((sum, file) => sum + file.issues.length, 0),
      wouldBlockBuild: criticalFiles.length > 0,
      issuesByType: report.issuesByType
    };
  }

  /**
   * Generate a detailed validation report
   */
  private static generateValidationReport(fileResults: FileValidationResult[]): ValidationReport {
    const filesWithIssues = fileResults.filter(f => f.hasIssues);
    const allIssues = fileResults.flatMap(f => f.issues);
    
    const issuesByType = allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFiles: fileResults.length,
      filesWithIssues: filesWithIssues.length,
      totalIssues: allIssues.length,
      issuesByType,
      fileResults
    };
  }

  /**
   * Format validation report for console output
   */
  static formatReport(report: ValidationReport): string {
    const lines: string[] = [];
    
    lines.push('🔍 Test String Validation Report');
    lines.push('================================');
    lines.push(`Total files checked: ${report.totalFiles}`);
    lines.push(`Files with issues: ${report.filesWithIssues}`);
    lines.push(`Total issues found: ${report.totalIssues}`);
    lines.push('');

    if (Object.keys(report.issuesByType).length > 0) {
      lines.push('Issues by type:');
      Object.entries(report.issuesByType).forEach(([type, count]) => {
        const icon = this.getIssueTypeIcon(type);
        lines.push(`  ${icon} ${type}: ${count}`);
      });
      lines.push('');
    }

    const filesWithIssues = report.fileResults.filter(f => f.hasIssues);
    if (filesWithIssues.length > 0) {
      lines.push('Files with issues:');
      filesWithIssues.forEach(file => {
        lines.push(`\n📁 ${file.relativePath}:`);
        file.issues.forEach(issue => {
          const icon = this.getIssueTypeIcon(issue.type);
          lines.push(`  ${icon} Line ${issue.line}: ${issue.message}`);
          lines.push(`     💡 ${issue.suggestion}`);
        });
      });
    }

    return lines.join('\n');
  }

  private static getIssueTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'malformed_comment': '💬',
      'unicode_character': '🔤',
      'malformed_string': '📝',
      'template_literal_syntax': '🔧'
    };
    return icons[type] || '⚠️';
  }
}

// Type definitions
export interface FileValidationResult {
  filePath: string;
  relativePath: string;
  issues: ValidationResult[];
  hasIssues: boolean;
}

export interface ValidationReport {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  fileResults: FileValidationResult[];
}

export interface ValidationSummary {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  criticalFiles: number;
  criticalIssues: number;
  wouldBlockBuild: boolean;
  issuesByType: Record<string, number>;
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'validate';
  
  switch (command) {
    case 'validate':
      await runValidation();
      break;
    case 'summary':
      await runSummary();
      break;
    case 'check-critical':
      await checkCritical();
      break;
    default:
      console.log('Usage: validate-test-strings [validate|summary|check-critical]');
      console.log('  validate      - Full validation report');
      console.log('  summary       - Brief summary for CI/CD');
      console.log('  check-critical - Check for build-blocking issues');
      process.exit(1);
  }
}

async function runValidation() {
  console.log('🔍 Validating test string formatting...\n');
  
  const report = await TestStringValidator.validateAllTestFiles();
  console.log(TestStringValidator.formatReport(report));
  
  if (report.filesWithIssues > 0) {
    console.log('\n💡 To fix these issues automatically, run:');
    console.log('   npx ts-node scripts/test-string-normalizer.ts');
    process.exit(1);
  } else {
    console.log('\n✅ All test files have valid string formatting!');
  }
}

async function runSummary() {
  const summary = await TestStringValidator.getValidationSummary();
  
  console.log(JSON.stringify(summary, null, 2));
  
  if (summary.wouldBlockBuild) {
    process.exit(1);
  }
}

async function checkCritical() {
  const summary = await TestStringValidator.getValidationSummary();
  
  if (summary.criticalFiles > 0) {
    console.log(`❌ Found ${summary.criticalFiles} files with critical syntax errors`);
    console.log(`   These would prevent tests from running properly`);
    process.exit(1);
  } else {
    console.log('✅ No critical syntax errors found');
  }
}

// Check if this is the main module (works for both CommonJS and ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}