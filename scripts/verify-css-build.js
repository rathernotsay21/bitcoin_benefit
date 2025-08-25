#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Verify CSS Build Integrity
 * Ensures CSS files are properly bundled and not fragmented
 */

async function verifyCSSBuild() {
  console.log('🔍 Verifying CSS build integrity...\n');
  
  const buildDir = path.join(process.cwd(), '.next', 'static', 'css');
  const errors = [];
  const warnings = [];

  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Get all CSS files
  const cssFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.css'));
  
  console.log(`Found ${cssFiles.length} CSS file(s):\n`);
  
  // Analyze each CSS file
  let totalSize = 0;
  let hasMainStyles = false;
  
  cssFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    totalSize += stats.size;
    
    console.log(`  📄 ${file} (${sizeKB} KB)`);
    
    // Check for critical styles
    if (content.includes('btn-primary') || content.includes('tailwind')) {
      hasMainStyles = true;
      console.log('     ✓ Contains main styles');
    }
    
    // Check for proper Tailwind compilation
    if (content.includes('@tailwind') || content.includes('@apply')) {
      warnings.push(`${file} contains unprocessed Tailwind directives`);
    }
    
    // Check for CSS variables (skip font-only files and texture pattern files)
    const isFontOnlyFile = content.includes('@font-face') && 
                          !content.includes('btn-') && 
                          !content.includes('tailwind') &&
                          content.length < 5000; // Font files are typically small
    
    const isTexturePatternFile = content.includes('textured-bg') || 
                                 content.includes('textured-preset');
    
    if (!content.includes('--') && !isFontOnlyFile && !isTexturePatternFile) {
      warnings.push(`${file} missing CSS variables`);
    }
  });
  
  console.log(`\nTotal CSS size: ${(totalSize / 1024).toFixed(2)} KB\n`);
  
  // Validation checks
  if (cssFiles.length === 0) {
    errors.push('No CSS files found in build');
  }
  
  if (cssFiles.length > 3) {
    warnings.push(`Too many CSS files (${cssFiles.length}). Consider consolidation.`);
  }
  
  if (!hasMainStyles) {
    errors.push('Main styles (Tailwind/components) not found in any CSS file');
  }
  
  if (totalSize > 200 * 1024) {
    warnings.push(`CSS bundle too large (${(totalSize / 1024).toFixed(2)} KB > 200 KB)`);
  }
  
  // Check HTML files for CSS references
  const htmlDir = path.join(process.cwd(), '.next', 'server', 'app');
  if (fs.existsSync(htmlDir)) {
    const htmlFiles = [];
    
    function findHtmlFiles(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          findHtmlFiles(fullPath);
        } else if (file.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      });
    }
    
    findHtmlFiles(htmlDir);
    
    // Check if CSS is referenced in HTML
    let cssReferences = 0;
    htmlFiles.forEach(htmlFile => {
      const content = fs.readFileSync(htmlFile, 'utf8');
      cssFiles.forEach(cssFile => {
        if (content.includes(cssFile)) {
          cssReferences++;
        }
      });
    });
    
    if (cssReferences === 0 && htmlFiles.length > 0) {
      warnings.push('CSS files not referenced in HTML output');
    }
  }
  
  // Report results
  console.log('📊 Verification Results:\n');
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log();
  }
  
  if (errors.length === 0) {
    console.log('✅ CSS build verification passed!\n');
    process.exit(0);
  } else {
    console.log('❌ CSS build verification failed!\n');
    process.exit(1);
  }
}

// Run verification
verifyCSSBuild().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});