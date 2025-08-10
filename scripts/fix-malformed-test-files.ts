#!/usr/bin/env ts-node

/**
 * Script to fix malformed test files with string formatting issues
 * Applies string normalization to specific files with unicode escape errors
 */

import { readFileSync, writeFileSync } from 'fs';
import { TestStringNormalizer, TestFileValidator } from './string-normalizer.js';

const TARGET_FILES = [
  'src/lib/on-chain/__tests__/error-handling-integration.test.tsx',
  'src/lib/on-chain/__tests__/error-handler.test.ts'
];

function fixMalformedTestFile(filePath: string): void {
  console.log(`\n🔧 Processing: ${filePath}`);
  
  try {
    // Read the original file
    const originalContent = readFileSync(filePath, 'utf-8');
    
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
      writeFileSync(filePath, normalizedContent, 'utf-8');
      console.log(`✅ Successfully fixed and saved`);
    } else {
      console.log(`⚠️  Some issues remain after normalization:`);
      postValidation.errors.forEach(error => console.log(`   - ${error}`));
      
      // Still save the improved version
      writeFileSync(filePath, normalizedContent, 'utf-8');
      console.log(`📝 Saved improved version (manual review may be needed)`);
    }
    
    // Check for additional syntax issues
    const syntaxValidation = TestFileValidator.validateSyntaxStructure(normalizedContent);
    if (!syntaxValidation.isValid) {
      console.log(`⚠️  Syntax structure issues detected:`);
      syntaxValidation.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function main(): void {
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