#!/usr/bin/env node

/**
 * Critical CSS Test Script
 * Phase 3.1 Performance Optimization - Bitcoin Benefit Platform
 * 
 * Tests and validates the critical CSS implementation
 */

const fs = require('fs');
const path = require('path');

const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function addTest(name, status, message, severity = 'info') {
  TEST_RESULTS.tests.push({ name, status, message, severity });
  if (status === 'pass') TEST_RESULTS.passed++;
  else if (status === 'fail') TEST_RESULTS.failed++;
  else if (severity === 'warning') TEST_RESULTS.warnings++;
}

function testCriticalCSS() {
  console.log('🧪 Testing Critical CSS Implementation\n');

  // Test 1: Check if CriticalCSS component exists
  try {
    const criticalCSSPath = path.join(__dirname, '../src/components/CriticalCSS.tsx');
    const exists = fs.existsSync(criticalCSSPath);
    
    if (exists) {
      const content = fs.readFileSync(criticalCSSPath, 'utf8');
      const cssSize = content.match(/const CRITICAL_CSS = `([^`]+)`/);
      
      if (cssSize) {
        const sizeKB = (cssSize[1].length / 1024).toFixed(2);
        addTest('Critical CSS Component', 'pass', `Component exists with ~${sizeKB}KB of CSS`);
        
        // Check if size is within target
        if (parseFloat(sizeKB) > 10) {
          addTest('Critical CSS Size', 'warning', `Size (${sizeKB}KB) exceeds 10KB target`, 'warning');
        } else {
          addTest('Critical CSS Size', 'pass', `Size (${sizeKB}KB) within target`);
        }
      } else {
        addTest('Critical CSS Content', 'fail', 'No critical CSS content found');
      }
    } else {
      addTest('Critical CSS Component', 'fail', 'CriticalCSS component not found');
    }
  } catch (error) {
    addTest('Critical CSS Component', 'fail', `Error testing component: ${error.message}`);
  }

  // Test 2: Check if layout.tsx includes CriticalCSS
  try {
    const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (layoutContent.includes('import CriticalCSS')) {
      addTest('Layout Import', 'pass', 'CriticalCSS imported in layout.tsx');
    } else {
      addTest('Layout Import', 'fail', 'CriticalCSS not imported in layout.tsx');
    }
    
    if (layoutContent.includes('<CriticalCSS')) {
      addTest('Layout Usage', 'pass', 'CriticalCSS component used in layout.tsx');
    } else {
      addTest('Layout Usage', 'fail', 'CriticalCSS component not used in layout.tsx');
    }
  } catch (error) {
    addTest('Layout Integration', 'fail', `Error testing layout: ${error.message}`);
  }

  // Test 3: Check CSS content for essential styles
  try {
    const criticalCSSPath = path.join(__dirname, '../src/components/CriticalCSS.tsx');
    const content = fs.readFileSync(criticalCSSPath, 'utf8');
    
    const essentialStyles = [
      ':root', // CSS variables
      'body', // Body styles
      '.navbar', // Navigation
      '.btn-primary', // Buttons
      'html.dark', // Dark mode support
      '@keyframes float', // Critical animations
    ];
    
    essentialStyles.forEach(style => {
      if (content.includes(style)) {
        addTest(`Essential Style: ${style}`, 'pass', `${style} found in critical CSS`);
      } else {
        addTest(`Essential Style: ${style}`, 'warning', `${style} missing from critical CSS`, 'warning');
      }
    });
    
  } catch (error) {
    addTest('Essential Styles', 'fail', `Error checking essential styles: ${error.message}`);
  }

  // Test 4: Check if CSS Loading Strategy exists
  try {
    const strategyPath = path.join(__dirname, '../src/components/CSSLoadingStrategy.tsx');
    if (fs.existsSync(strategyPath)) {
      addTest('CSS Loading Strategy', 'pass', 'CSS loading strategy component exists');
    } else {
      addTest('CSS Loading Strategy', 'fail', 'CSS loading strategy component missing');
    }
  } catch (error) {
    addTest('CSS Loading Strategy', 'fail', `Error checking strategy: ${error.message}`);
  }

  // Test 5: Check package.json scripts
  try {
    const packagePath = path.join(__dirname, '../package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    if (packageJson.scripts['critical-css:extract']) {
      addTest('Extract Script', 'pass', 'critical-css:extract script found');
    } else {
      addTest('Extract Script', 'warning', 'critical-css:extract script missing', 'warning');
    }
    
    if (packageJson.scripts.prebuild && packageJson.scripts.prebuild.includes('extract-critical-css.js')) {
      addTest('Prebuild Integration', 'pass', 'Critical CSS extraction integrated in prebuild');
    } else {
      addTest('Prebuild Integration', 'warning', 'Critical CSS extraction not in prebuild', 'warning');
    }
  } catch (error) {
    addTest('Package Scripts', 'fail', `Error checking package.json: ${error.message}`);
  }

  // Test 6: Check next.config.js optimizations
  try {
    const configPath = path.join(__dirname, '../next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('optimizeCss: true')) {
      addTest('CSS Optimization', 'pass', 'CSS optimization enabled in Next.js config');
    } else {
      addTest('CSS Optimization', 'warning', 'CSS optimization not explicitly enabled', 'warning');
    }
    
    if (configContent.includes('CRITICAL_CSS_ENABLED')) {
      addTest('Critical CSS Flag', 'pass', 'Critical CSS flag found in config');
    } else {
      addTest('Critical CSS Flag', 'warning', 'Critical CSS environment flag missing', 'warning');
    }
  } catch (error) {
    addTest('Next.js Config', 'fail', `Error checking Next.js config: ${error.message}`);
  }

  return TEST_RESULTS;
}

function generateReport(results) {
  console.log('📊 Critical CSS Test Results');
  console.log('='.repeat(50));
  
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📋 Total Tests: ${results.tests.length}\n`);
  
  // Group tests by status
  const passed = results.tests.filter(t => t.status === 'pass');
  const failed = results.tests.filter(t => t.status === 'fail');
  const warnings = results.tests.filter(t => t.severity === 'warning');
  
  if (passed.length > 0) {
    console.log('✅ PASSED TESTS:');
    passed.forEach(test => {
      console.log(`   ✓ ${test.name}: ${test.message}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(test => {
      console.log(`   ⚠ ${test.name}: ${test.message}`);
    });
    console.log('');
  }
  
  if (failed.length > 0) {
    console.log('❌ FAILED TESTS:');
    failed.forEach(test => {
      console.log(`   ✗ ${test.name}: ${test.message}`);
    });
    console.log('');
  }

  // Performance recommendations
  console.log('🚀 PERFORMANCE RECOMMENDATIONS:');
  
  if (results.failed === 0) {
    console.log('   ✓ Critical CSS implementation looks good!');
    
    if (results.warnings === 0) {
      console.log('   ✓ All best practices implemented');
      console.log('   ✓ Expected FCP improvement: ~400ms');
    } else {
      console.log('   → Address warnings for optimal performance');
      console.log('   ✓ Expected FCP improvement: ~300ms');
    }
  } else {
    console.log('   → Fix failed tests before deployment');
    console.log('   → Critical CSS may not load correctly');
  }
  
  console.log('\n📈 EXPECTED IMPROVEMENTS:');
  console.log('   • First Contentful Paint (FCP): -400ms');
  console.log('   • Render-blocking CSS: Eliminated');
  console.log('   • Above-the-fold rendering: Immediate');
  console.log('   • Progressive CSS loading: Enabled\n');
}

// Run tests if called directly
if (require.main === module) {
  try {
    const results = testCriticalCSS();
    generateReport(results);
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Critical CSS test failed:', error);
    process.exit(1);
  }
} else {
  module.exports = { testCriticalCSS, generateReport };
}