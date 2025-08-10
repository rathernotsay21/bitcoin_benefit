#!/usr/bin/env node

/**
 * Script to fix malformed test files with string formatting issues
 * Applies string normalization to specific files with unicode escape errors
 */

const fs = require('fs');
const path = require('path');

class TestStringNormalizer {
  /**
   * Convert escaped newlines (\n) to actual newlines
   */
  static normalizeEscapedNewlines(content) {
    // Replace \\n with actual newlines
    return content.replace(/\\n/g, '\n');
  }

  /**
   * Fix unicode escape sequences
   */
  static fixUnicodeEscapes(content) {
    // Handle common unicode escape issues
    return content.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 16));
      } catch {
        return match; // Keep original if parsing fails
      }
    });
  }

  /**
   * Fix malformed import statements with escaped newlines
   */
  static fixImportStatements(content) {
    // Fix import statements that have been broken by escaped newlines
    return content.replace(/import\s*{\s*\\n\s*/g, 'import { ')
                  .replace(/\\n\s*}/g, ' }')
                  .replace(/,\s*\\n\s*/g, ', ');
  }

  /**
   * Normalize comment blocks that have been corrupted
   */
  static normalizeCommentBlocks(content) {
    // Fix comment blocks that start with /** and have escaped content
    return content.replace(/\/\*\*\s*\\n\s*\*/g, '/**\n */')
                  .replace(/\*\s*\\n\s*\*/g, '*\n *');
  }

  /**
   * Remove duplicate newlines and normalize spacing
   */
  static normalizeSpacing(content) {
    // Remove excessive newlines but preserve intentional spacing
    return content.replace(/\n{3,}/g, '\n\n')
                  .replace(/^\s+$/gm, '') // Remove lines with only whitespace
                  .trim();
  }

  /**
   * Fix escaped quotes in JSX attributes
   */
  static fixEscapedQuotes(content) {
    // Fix malformed quotes in JSX attributes and SVG paths
    // Pattern: d=\"value" should be d="value"
    // Pattern: data-testid="value\" should be data-testid="value"
    return content.replace(/d=\\"([^"]*)" \/>/g, 'd="$1" />')
                  .replace(/data-testid="([^"]*)\\"([^>]*>)/g, 'data-testid="$1"$2')
                  .replace(/="([^"]*)\\"([^>]*>)/g, '="$1"$2')
                  .replace(/\\"([^"]*)" \/>/g, '"$1" />')
                  .replace(/\\"([^"]*)">/g, '"$1">');
  }

  /**
   * Process a complete test file with all normalizations
   */
  static processTestFile(content) {
    let normalized = content;
    
    // Apply all normalizations in order
    normalized = this.normalizeEscapedNewlines(normalized);
    normalized = this.fixUnicodeEscapes(normalized);
    normalized = this.fixImportStatements(normalized);
    normalized = this.normalizeCommentBlocks(normalized);
    normalized = this.fixEscapedQuotes(normalized);
    normalized = this.normalizeSpacing(normalized);
    
    return normalized;
  }

  /**
   * Validate that a test file has proper syntax
   */
  static validateTestFile(content) {
    const errors = [];
    
    // Check for common syntax issues
    if (content.includes('\\n')) {
      errors.push('Contains escaped newlines that should be actual newlines');
    }
    
    if (content.includes('\\u') && !content.match(/\\u[0-9a-fA-F]{4}/)) {
      errors.push('Contains malformed unicode escape sequences');
    }
    
    // Check for broken import statements
    if (content.match(/import\s*{\s*\\n/)) {
      errors.push('Contains broken import statements with escaped newlines');
    }
    
    // Check for broken comment blocks
    if (content.match(/\/\*\*\s*\\n/)) {
      errors.push('Contains broken comment blocks with escaped content');
    }
    
    // Check for escaped quotes in JSX
    if (content.includes('\\"')) {
      errors.push('Contains escaped quotes that should be regular quotes');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const TARGET_FILES = [
  'src/lib/on-chain/__tests__/error-handling-integration.test.tsx',
  'src/lib/on-chain/__tests__/error-handler.test.ts'
];

function fixMalformedTestFile(filePath) {
  console.log(`\n🔧 Processing: ${filePath}`);
  
  try {
    // Read the original file
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    
    // Validate the original file
    const validation = TestStringNormalizer.validateTestFile(originalContent);
    if (validation.isValid) {
      console.log(`✅ File is already properly formatted`);
      return;
    }
    
    console.log(`❌ Found issues:`);
    validation.errors.forEach(error => console.log(`   - ${error}`));
    
    // Apply string normalization
    const normalizedContent = TestStringNormalizer.processTestFile(originalContent);
    
    // Validate the normalized content
    const postValidation = TestStringNormalizer.validateTestFile(normalizedContent);
    
    if (postValidation.isValid) {
      // Write the fixed content back to the file
      fs.writeFileSync(filePath, normalizedContent, 'utf-8');
      console.log(`✅ Successfully fixed and saved`);
    } else {
      console.log(`⚠️  Some issues remain after normalization:`);
      postValidation.errors.forEach(error => console.log(`   - ${error}`));
      
      // Still save the improved version
      fs.writeFileSync(filePath, normalizedContent, 'utf-8');
      console.log(`📝 Saved improved version (manual review may be needed)`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function main() {
  console.log('🚀 Starting malformed test file repair...');
  
  TARGET_FILES.forEach(filePath => {
    fixMalformedTestFile(filePath);
  });
  
  console.log('\n✨ Malformed test file repair completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review the fixed files for any remaining issues');
  console.log('   2. Run tests to verify the fixes work correctly');
  console.log('   3. Check for any remaining string literal syntax errors');
}

if (require.main === module) {
  main();
}