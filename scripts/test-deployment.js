#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test Deployment Configuration
 * Ensures the build is ready for deployment with proper CSS handling
 */

function testDeployment() {
  console.log('🚀 Testing deployment configuration...\n');
  
  const errors = [];
  const warnings = [];
  
  // Check Netlify configuration
  const netlifyConfig = path.join(process.cwd(), 'netlify.toml');
  if (fs.existsSync(netlifyConfig)) {
    const content = fs.readFileSync(netlifyConfig, 'utf8');
    
    // Check for critical settings
    if (!content.includes('skip_processing = true')) {
      errors.push('Netlify CSS/JS processing not disabled - will cause conflicts');
    }
    
    if (!content.includes('bundle = false')) {
      warnings.push('Netlify bundling not disabled - may cause double processing');
    }
    
    console.log('✓ Netlify configuration found');
  } else {
    warnings.push('No netlify.toml found - using default settings');
  }
  
  // Check Next.js configuration
  const nextConfig = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfig)) {
    const content = fs.readFileSync(nextConfig, 'utf8');
    
    // Check for CSS optimization
    if (!content.includes('styles')) {
      warnings.push('CSS cache group not configured in Next.js config');
    }
    
    if (!content.includes('priority')) {
      warnings.push('CSS priority not set in webpack config');
    }
    
    console.log('✓ Next.js configuration found');
  } else {
    errors.push('No next.config.js found');
  }
  
  // Check build output exists
  const buildDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(buildDir)) {
    errors.push('No build output found - run `npm run build` first');
  } else {
    console.log('✓ Build output exists');
    
    // Check CSS files
    const cssDir = path.join(buildDir, 'static', 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
      console.log(`✓ Found ${cssFiles.length} CSS file(s)`);
      
      if (cssFiles.length === 0) {
        errors.push('No CSS files in build output');
      }
    } else {
      errors.push('No CSS directory in build output');
    }
  }
  
  // Check critical components exist
  const criticalFiles = [
    'src/components/CSSLoadingGuard.tsx',
    'src/app/layout.tsx',
    'src/app/globals.css'
  ];
  
  criticalFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Critical file missing: ${file}`);
    }
  });
  
  // Report results
  console.log('\n📊 Deployment Test Results:\n');
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (must fix before deployment):');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (recommended fixes):');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log();
  }
  
  if (errors.length === 0) {
    console.log('✅ Deployment configuration test passed!\n');
    console.log('🎉 Ready to deploy with reliable CSS loading!\n');
    process.exit(0);
  } else {
    console.log('❌ Deployment test failed! Fix errors before deploying.\n');
    process.exit(1);
  }
}

// Run test
try {
  testDeployment();
} catch (error) {
  console.error('Test failed:', error);
  process.exit(1);
}