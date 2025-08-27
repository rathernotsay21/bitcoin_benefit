#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to fix text contrast issues throughout the codebase
 * Replaces light gray text colors with minimum contrast colors for WCAG AA compliance
 */

// Color replacements for better contrast
const replacements = [
  // Fix light gray text on white backgrounds
  {
    pattern: /text-slate-300(?!\s+dark:)/g,
    replacement: 'text-slate-700',
    description: 'Replace light gray text with darker gray for white backgrounds'
  },
  // Fix slate-600 to ensure better contrast
  {
    pattern: /text-slate-600(?!\s+dark:)/g,
    replacement: 'text-gray-700',
    description: 'Replace slate-600 with gray-700 for better contrast'
  },
  // Fix combinations where both light and dark are specified
  {
    pattern: /text-slate-600\s+dark:text-slate-300/g,
    replacement: 'text-gray-700 dark:text-slate-300',
    description: 'Fix light/dark mode text combinations'
  },
  // Fix muted text colors that don't meet contrast
  {
    pattern: /text-gray-400(?!\s+dark:)/g,
    replacement: 'text-gray-600',
    description: 'Replace gray-400 with gray-600 for better contrast'
  },
  {
    pattern: /text-gray-500(?!\s+dark:)/g,
    replacement: 'text-gray-700',
    description: 'Replace gray-500 with gray-700 for better contrast'
  }
];

// Files to process
const filePatterns = [
  'src/**/*.tsx',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.js'
];

let totalReplacements = 0;
let filesModified = 0;

console.log('🎨 Fixing text contrast issues for WCAG AA compliance...\n');

filePatterns.forEach(pattern => {
  const files = glob.sync(pattern, { 
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/build/**', '**/.next/**']
  });

  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;

    replacements.forEach(replacement => {
      const matches = content.match(replacement.pattern);
      if (matches) {
        content = content.replace(replacement.pattern, replacement.replacement);
        fileReplacements += matches.length;
        console.log(`  ✅ ${file}: ${matches.length} instances of ${replacement.description}`);
      }
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      filesModified++;
      totalReplacements += fileReplacements;
    }
  });
});

console.log('\n📊 Summary:');
console.log(`  Files modified: ${filesModified}`);
console.log(`  Total replacements: ${totalReplacements}`);
console.log('\n✨ Text contrast fixes complete!');

// Special notice for manual review
if (filesModified > 0) {
  console.log('\n⚠️  Please review the following:');
  console.log('  1. Check that all text remains readable in both light and dark modes');
  console.log('  2. Run the contrast validation tests: npm test color-contrast');
  console.log('  3. Visually inspect key pages for any design issues');
}