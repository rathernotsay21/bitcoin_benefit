#!/usr/bin/env node

/**
 * Script to validate all test files for string literal syntax errors
 * Scans the entire test suite for potential issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestFileValidator {
  /**
   * Detect malformed string literals in test files
   */
  static detectMalformedStrings(content) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for escaped newlines in strings (but not in regex, comments, or console.log)
      if (line.includes('\\n') && !line.includes('\\\\n') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        // Skip if it's in a regex, intentional escape, or console.log
        if (!line.includes('/') && !line.includes('replace(') && !line.includes('match(') && !line.includes('console.log(')) {
          issues.push(`Line ${lineNumber}: Contains escaped newline that may be malformed: ${line.trim()}`);
        }
      }
      
      // Check for incomplete unicode escapes
      if (line.match(/\\u[0-9a-fA-F]{0,3}[^0-9a-fA-F]/)) {
        issues.push(`Line ${lineNumber}: Contains incomplete unicode escape sequence: ${line.trim()}`);
      }
      
      // Check for broken template literals
      const backtickCount = (line.match(/`/g) || []).length;
      if (backtickCount % 2 !== 0 && !line.includes('\\`')) {
        issues.push(`Line ${lineNumber}: May contain unmatched template literal backticks: ${line.trim()}`);
      }
    });
    
    return issues;
  }

  /**
   * Check if file has proper TypeScript/JavaScript syntax structure
   */
  static validateSyntaxStructure(content) {
    const issues = [];
    
    // Check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Unbalanced curly braces: ${openBraces} open, ${closeBraces} close`);
    }
    
    // Check for balanced parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
    }
    
    // Check for balanced square brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push(`Unbalanced square brackets: ${openBrackets} open, ${closeBrackets} close`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

function findTestFiles(dir) {
  const testFiles = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.test.ts') || item.endsWith('.test.tsx') || item.endsWith('.spec.ts') || item.endsWith('.spec.tsx'))) {
        testFiles.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return testFiles;
}

function validateTestFile(filePath) {
  console.log(`\n🔍 Validating: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for malformed strings
    const stringIssues = TestFileValidator.detectMalformedStrings(content);
    
    // Check syntax structure
    const syntaxValidation = TestFileValidator.validateSyntaxStructure(content);
    
    const allIssues = [...stringIssues, ...syntaxValidation.issues];
    
    if (allIssues.length === 0) {
      console.log(`✅ No issues found`);
      return { file: filePath, issues: [], isValid: true };
    } else {
      console.log(`❌ Found ${allIssues.length} issue(s):`);
      allIssues.forEach(issue => console.log(`   - ${issue}`));
      return { file: filePath, issues: allIssues, isValid: false };
    }
    
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return { file: filePath, issues: [`Error reading file: ${error.message}`], isValid: false };
  }
}

function main() {
  console.log('🚀 Starting comprehensive test file validation...');
  
  // Find all test files
  const testFiles = findTestFiles('src');
  console.log(`\n📁 Found ${testFiles.length} test files to validate`);
  
  const results = [];
  let totalIssues = 0;
  
  // Validate each test file
  testFiles.forEach(filePath => {
    const result = validateTestFile(filePath);
    results.push(result);
    totalIssues += result.issues.length;
  });
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`   Total files: ${testFiles.length}`);
  console.log(`   Files with issues: ${results.filter(r => !r.isValid).length}`);
  console.log(`   Total issues: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 All test files are properly formatted!');
  } else {
    console.log('\n⚠️  Files requiring attention:');
    results.filter(r => !r.isValid).forEach(result => {
      console.log(`   - ${result.file} (${result.issues.length} issues)`);
    });
  }
  
  console.log('\n✨ Validation completed!');
}

if (require.main === module) {
  main();
}