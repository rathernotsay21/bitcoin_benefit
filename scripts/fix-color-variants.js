#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to replace hardcoded orange/amber/yellow color variants with Bitcoin colors
 */

// Color replacements for consistency
const replacements = [
  // Orange to Bitcoin replacements
  {
    pattern: /bg-orange-50(?!\s|\/)/g,
    replacement: 'bg-bitcoin-50',
    description: 'Replace orange-50 with bitcoin-50'
  },
  {
    pattern: /bg-orange-100(?!\s|\/)/g,
    replacement: 'bg-bitcoin-100',
    description: 'Replace orange-100 with bitcoin-100'
  },
  {
    pattern: /bg-orange-200(?!\s|\/)/g,
    replacement: 'bg-bitcoin-200',
    description: 'Replace orange-200 with bitcoin-200'
  },
  {
    pattern: /bg-orange-300(?!\s|\/)/g,
    replacement: 'bg-bitcoin-300',
    description: 'Replace orange-300 with bitcoin-300'
  },
  {
    pattern: /bg-orange-400(?!\s|\/)/g,
    replacement: 'bg-bitcoin-400',
    description: 'Replace orange-400 with bitcoin-400'
  },
  {
    pattern: /bg-orange-500(?!\s|\/)/g,
    replacement: 'bg-bitcoin-500',
    description: 'Replace orange-500 with bitcoin-500'
  },
  {
    pattern: /bg-orange-600(?!\s|\/)/g,
    replacement: 'bg-bitcoin-600',
    description: 'Replace orange-600 with bitcoin-600'
  },
  {
    pattern: /bg-orange-900\/20/g,
    replacement: 'bg-bitcoin-900/20',
    description: 'Replace orange-900/20 with bitcoin-900/20'
  },
  {
    pattern: /bg-orange-950\/20/g,
    replacement: 'bg-bitcoin-900/20',
    description: 'Replace orange-950/20 with bitcoin-900/20'
  },
  // Border orange replacements
  {
    pattern: /border-orange-200/g,
    replacement: 'border-bitcoin-200',
    description: 'Replace border-orange-200 with border-bitcoin-200'
  },
  {
    pattern: /border-orange-300/g,
    replacement: 'border-bitcoin-300',
    description: 'Replace border-orange-300 with border-bitcoin-300'
  },
  {
    pattern: /border-orange-400/g,
    replacement: 'border-bitcoin-400',
    description: 'Replace border-orange-400 with border-bitcoin-400'
  },
  {
    pattern: /border-orange-500/g,
    replacement: 'border-bitcoin-500',
    description: 'Replace border-orange-500 with border-bitcoin-500'
  },
  {
    pattern: /border-orange-600/g,
    replacement: 'border-bitcoin-600',
    description: 'Replace border-orange-600 with border-bitcoin-600'
  },
  {
    pattern: /border-orange-700/g,
    replacement: 'border-bitcoin-700',
    description: 'Replace border-orange-700 with border-bitcoin-700'
  },
  {
    pattern: /border-orange-800/g,
    replacement: 'border-bitcoin-800',
    description: 'Replace border-orange-800 with border-bitcoin-800'
  },
  // Text orange replacements
  {
    pattern: /text-orange-500/g,
    replacement: 'text-bitcoin-500',
    description: 'Replace text-orange-500 with text-bitcoin-500'
  },
  {
    pattern: /text-orange-600/g,
    replacement: 'text-bitcoin-600',
    description: 'Replace text-orange-600 with text-bitcoin-600'
  },
  {
    pattern: /text-orange-700/g,
    replacement: 'text-bitcoin-700',
    description: 'Replace text-orange-700 with text-bitcoin-700'
  },
  {
    pattern: /text-orange-800/g,
    replacement: 'text-bitcoin-800',
    description: 'Replace text-orange-800 with text-bitcoin-800'
  },
  // Amber to Bitcoin replacements
  {
    pattern: /bg-amber-50/g,
    replacement: 'bg-bitcoin-50',
    description: 'Replace amber-50 with bitcoin-50'
  },
  {
    pattern: /bg-amber-100/g,
    replacement: 'bg-bitcoin-100',
    description: 'Replace amber-100 with bitcoin-100'
  },
  {
    pattern: /bg-amber-900\/20/g,
    replacement: 'bg-bitcoin-900/20',
    description: 'Replace amber-900/20 with bitcoin-900/20'
  },
  // Yellow warning colors - keep for warnings but make consistent
  {
    pattern: /bg-yellow-50(?!\s+dark:)/g,
    replacement: 'bg-yellow-50',
    description: 'Keep yellow for warnings'
  },
  {
    pattern: /text-yellow-800(?!\s+dark:)/g,
    replacement: 'text-yellow-800',
    description: 'Keep yellow text for warnings'
  },
  // Hover state replacements
  {
    pattern: /hover:bg-orange-100/g,
    replacement: 'hover:bg-bitcoin-100',
    description: 'Replace hover orange with bitcoin'
  },
  {
    pattern: /hover:bg-orange-200/g,
    replacement: 'hover:bg-bitcoin-200',
    description: 'Replace hover orange-200 with bitcoin-200'
  }
];

// Files to process
const filePatterns = [
  'src/**/*.tsx',
  'src/**/*.jsx'
];

let totalReplacements = 0;
let filesModified = 0;

console.log('🎨 Replacing hardcoded color variants with Bitcoin colors...\n');

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
console.log('\n✨ Color variant replacements complete!');

if (filesModified > 0) {
  console.log('\n⚠️  Please review the following:');
  console.log('  1. Check that Bitcoin colors are applied consistently');
  console.log('  2. Verify that warning/error states still use appropriate colors');
  console.log('  3. Test both light and dark modes');
}