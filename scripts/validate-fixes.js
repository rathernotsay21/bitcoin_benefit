#!/usr/bin/env node

/**
 * Validation script to verify that test files have been properly fixed
 */

const fs = require('fs');
const glob = require('glob');

class TestFileValidator {
  static validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check for malformed comment blocks
    if (content.includes('/**\\n') || content.includes('\\n */')) {
      issues.push({
        type: 'malformed_comment',
        message: 'File contains escaped newlines in comment blocks'
      });
    }

    // Check for other escaped newline patterns that might be problematic
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('\\\\n') && !line.includes('console.log') && !line.includes('expect')) {
        issues.push({
          type: 'escaped_newline',
          line: index + 1,
          message: 'Line contains potentially problematic escaped newlines'
        });
      }
    });

    return issues;
  }

  static validateAllFiles() {
    const patterns = [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx'
    ];

    let totalFiles = 0;
    let filesWithIssues = 0;
    let totalIssues = 0;

    console.log('🔍 Validating test file fixes...\n');

    patterns.forEach(pattern => {
      const files = glob.sync(pattern);
      
      files.forEach(file => {
        totalFiles++;
        const issues = this.validateFile(file);
        
        if (issues.length > 0) {
          filesWithIssues++;
          totalIssues += issues.length;
          
          console.log(`❌ ${file}:`);
          issues.forEach(issue => {
            if (issue.line) {
              console.log(`   Line ${issue.line}: ${issue.message}`);
            } else {
              console.log(`   ${issue.message}`);
            }
          });
          console.log();
        }
      });
    });

    console.log('📊 Validation Summary:');
    console.log('=====================');
    console.log(`Total files checked: ${totalFiles}`);
    console.log(`Files with issues: ${filesWithIssues}`);
    console.log(`Total issues found: ${totalIssues}`);

    if (totalIssues === 0) {
      console.log('\n✅ All test files have been successfully normalized!');
      console.log('   No string formatting issues detected.');
    } else {
      console.log('\n⚠️  Some issues remain. Consider running the fixer again.');
    }

    return totalIssues === 0;
  }
}

// Run validation
if (require.main === module) {
  const success = TestFileValidator.validateAllFiles();
  process.exit(success ? 0 : 1);
}