#!/usr/bin/env node

/**
 * Fix Test Issues Script
 * 
 * Automated script to fix common test infrastructure issues
 */

const { execSync } = require('child_process');
const { join } = require('path');

async function fixTestIssues() {
  console.log('🔧 Running automated test fixes...');
  
  let fixesApplied = 0;
  
  try {
    console.log('\n1️⃣ Fixing string formatting issues...');
    execSync('node scripts/test-string-normalizer.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    fixesApplied++;
    console.log('✅ String fixes completed');
  } catch (error) {
    console.warn('⚠️ String fixing failed:', error.message);
  }

  try {
    console.log('\n2️⃣ Validating all test files...');
    execSync('node scripts/validate-all-test-files.js', { 
      stdio: 'inherit',
      cwd: process.cwd() 
    });
    console.log('✅ Validation completed');
  } catch (error) {
    console.warn('⚠️ Validation found issues:', error.message);
  }

  try {
    console.log('\n3️⃣ Running TypeScript type check...');
    execSync('npm run type-check', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    fixesApplied++;
    console.log('✅ Type check passed');
  } catch (error) {
    console.warn('⚠️ Type check found issues:', error.message);
  }

  console.log(`\n✨ Applied ${fixesApplied} automated fixes`);
  console.log('\n💡 Next steps:');
  console.log('  • Run "npm run test:validate" to check remaining issues');
  console.log('  • Run "npm run test:dashboard" for full health report');
  console.log('  • Run "npm run test:hooks:install" to install pre-commit validation');
}

fixTestIssues().catch(error => {
  console.error('❌ Fix process failed:', error);
  process.exit(1);
});
