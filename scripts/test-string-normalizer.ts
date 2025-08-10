#!/usr/bin/env node

/**
 * Test String Normalizer - Automated string repair script for test files
 * Fixes escaped newlines and unicode issues in test files
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export class TestStringNormalizer {
  /**
   * Normalize escaped newlines in string literals
   * Converts \\n to actual newlines in comment blocks and string literals
   */
  static normalizeEscapedNewlines(content: string): string {
    // Fix escaped newlines in comment blocks (/**\n * comment \n */)
    const commentBlockPattern = /\/\*\*\\n\s*\*([^*]|\*(?!\/))*\*\//g;
    content = content.replace(commentBlockPattern, (match) => {
      return match.replace(/\\n/g, '\n');
    });

    // Fix escaped newlines in template literals and string literals
    const stringLiteralPattern = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    content = content.replace(stringLiteralPattern, (match) => {
      // Only replace \\n with \n in string literals, not escaped quotes
      return match.replace(/\\\\n/g, '\n');
    });

    return content;
  }

  /**
   * Fix unicode escape sequences
   * Handles unicode characters properly in test files
   */
  static fixUnicodeEscapes(content: string): string {
    // Handle Bitcoin symbol and other unicode characters
    const unicodePattern = /\\u([0-9a-fA-F]{4})/g;
    return content.replace(unicodePattern, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16));
      } catch (error) {
        console.warn(`Failed to convert unicode escape ${match}:`, error);
        return match; // Return original if conversion fails
      }
    });
  }

  /**
   * Normalize malformed string literals in comment blocks
   * Specifically handles the pattern found in test files where comment blocks
   * have been serialized with escaped newlines
   */
  static normalizeCommentBlocks(content: string): string {
    // Pattern to match malformed comment blocks like:
    // /**\n * comment content\n * more content\n */
    const malformedCommentPattern = /\/\*\*\\n([^*]|\*(?!\/))*\\n\s*\*\//g;
    
    return content.replace(malformedCommentPattern, (match) => {
      // Extract the content between /** and */
      let commentContent = match.slice(3, -2); // Remove /** and */
      
      // Replace \\n with actual newlines
      commentContent = commentContent.replace(/\\n/g, '\n');
      
      // Ensure proper comment formatting
      const lines = commentContent.split('\n');
      const formattedLines = lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (index === 0) {
          return trimmedLine.startsWith('*') ? ` ${trimmedLine}` : ` * ${trimmedLine}`;
        }
        return trimmedLine.startsWith('*') ? ` ${trimmedLine}` : ` * ${trimmedLine}`;
      });
      
      return `/**\n${formattedLines.join('\n')}\n */`;
    });
  }

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
   * Process a single test file
   * Applies all normalization and validation steps
   */
  static processTestFile(filePath: string): ProcessingResult {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let normalizedContent = originalContent;

      // Apply normalizations
      normalizedContent = this.normalizeCommentBlocks(normalizedContent);
      normalizedContent = this.normalizeEscapedNewlines(normalizedContent);
      normalizedContent = this.fixUnicodeEscapes(normalizedContent);

      // Validate the result
      const validationIssues = this.validateStringLiterals(normalizedContent);

      const hasChanges = originalContent !== normalizedContent;
      
      if (hasChanges) {
        // Create backup
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, originalContent);
        
        // Write normalized content
        fs.writeFileSync(filePath, normalizedContent);
      }

      return {
        filePath,
        hasChanges,
        validationIssues,
        success: true,
        backupCreated: hasChanges
      };
    } catch (error) {
      return {
        filePath,
        hasChanges: false,
        validationIssues: [],
        success: false,
        error: error instanceof Error ? error.message : String(error),
        backupCreated: false
      };
    }
  }

  /**
   * Process all test files in the project
   * Finds and processes all .test.ts and .test.tsx files
   */
  static async processAllTestFiles(projectRoot: string = process.cwd()): Promise<ProcessingResult[]> {
    const testFilePatterns = [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx'
    ];

    const results: ProcessingResult[] = [];

    for (const pattern of testFilePatterns) {
      try {
        const files = await glob(pattern, { cwd: projectRoot });
        
        for (const file of files) {
          const fullPath = path.join(projectRoot, file);
          const result = this.processTestFile(fullPath);
          results.push(result);
        }
      } catch (error) {
        console.error(`Error processing pattern ${pattern}:`, error);
      }
    }

    return results;
  }

  /**
   * Generate a report of all processing results
   */
  static generateReport(results: ProcessingResult[]): ProcessingReport {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const modified = results.filter(r => r.hasChanges);
    const withIssues = results.filter(r => r.validationIssues.length > 0);

    const allIssues = results.flatMap(r => 
      r.validationIssues.map(issue => ({
        ...issue,
        file: r.filePath
      }))
    );

    return {
      totalFiles: results.length,
      successfulFiles: successful.length,
      failedFiles: failed.length,
      modifiedFiles: modified.length,
      filesWithIssues: withIssues.length,
      totalIssues: allIssues.length,
      issuesByType: this.groupIssuesByType(allIssues),
      results
    };
  }

  private static groupIssuesByType(issues: (ValidationResult & { file: string })[]): Record<string, number> {
    return issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Type definitions
export interface ValidationResult {
  type: 'malformed_comment' | 'unicode_character' | 'malformed_string' | 'template_literal_syntax';
  line: number;
  message: string;
  suggestion: string;
}

export interface ProcessingResult {
  filePath: string;
  hasChanges: boolean;
  validationIssues: ValidationResult[];
  success: boolean;
  error?: string;
  backupCreated: boolean;
}

export interface ProcessingReport {
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  modifiedFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  results: ProcessingResult[];
}

// CLI functionality
async function main() {
  console.log('🔧 Test String Normalizer - Starting processing...\n');
  
  const results = await TestStringNormalizer.processAllTestFiles();
  const report = TestStringNormalizer.generateReport(results);
  
  console.log('📊 Processing Report:');
  console.log('===================');
  console.log(`Total files processed: ${report.totalFiles}`);
  console.log(`Successfully processed: ${report.successfulFiles}`);
  console.log(`Failed to process: ${report.failedFiles}`);
  console.log(`Files modified: ${report.modifiedFiles}`);
  console.log(`Files with validation issues: ${report.filesWithIssues}`);
  console.log(`Total validation issues: ${report.totalIssues}\n`);
  
  if (Object.keys(report.issuesByType).length > 0) {
    console.log('Issues by type:');
    Object.entries(report.issuesByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log();
  }
  
  // Show detailed results for modified files
  const modifiedFiles = report.results.filter(r => r.hasChanges);
  if (modifiedFiles.length > 0) {
    console.log('📝 Modified files:');
    modifiedFiles.forEach(result => {
      console.log(`  ✅ ${result.filePath} (backup created)`);
    });
    console.log();
  }
  
  // Show validation issues
  const filesWithIssues = report.results.filter(r => r.validationIssues.length > 0);
  if (filesWithIssues.length > 0) {
    console.log('⚠️  Validation issues found:');
    filesWithIssues.forEach(result => {
      console.log(`\n📁 ${result.filePath}:`);
      result.validationIssues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.message}`);
        console.log(`    💡 ${issue.suggestion}`);
      });
    });
    console.log();
  }
  
  // Show failed files
  const failedFiles = report.results.filter(r => !r.success);
  if (failedFiles.length > 0) {
    console.log('❌ Failed to process:');
    failedFiles.forEach(result => {
      console.log(`  ${result.filePath}: ${result.error}`);
    });
    console.log();
  }
  
  console.log('✨ Processing complete!');
  
  if (report.modifiedFiles > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Review the changes made to your test files');
    console.log('2. Run your tests to ensure they still pass');
    console.log('3. If issues occur, restore from .backup files');
    console.log('4. Commit the normalized files once verified');
  }
}

// Check if this is the main module (works for both CommonJS and ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}