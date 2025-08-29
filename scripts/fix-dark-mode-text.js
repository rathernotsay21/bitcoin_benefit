#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mapping for dark mode fixes
const colorMappings = {
  // Gray colors
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-800': 'text-gray-800 dark:text-gray-100',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  
  // Slate colors
  'text-slate-900': 'text-slate-900 dark:text-slate-100',
  'text-slate-800': 'text-slate-800 dark:text-slate-200',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  
  // Zinc colors
  'text-zinc-900': 'text-zinc-900 dark:text-zinc-100',
  'text-zinc-800': 'text-zinc-800 dark:text-zinc-200',
  'text-zinc-700': 'text-zinc-700 dark:text-zinc-300',
  'text-zinc-600': 'text-zinc-600 dark:text-zinc-400',
  
  // Neutral colors
  'text-neutral-900': 'text-neutral-900 dark:text-neutral-100',
  'text-neutral-800': 'text-neutral-800 dark:text-neutral-200',
  'text-neutral-700': 'text-neutral-700 dark:text-neutral-300',
  'text-neutral-600': 'text-neutral-600 dark:text-neutral-400',
};

// Files to skip
const skipFiles = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.tsx',
  '**/*.test.ts',
  '**/test/**',
  '**/__tests__/**'
];

function shouldSkipLine(line) {
  // Skip if already has dark mode modifier
  if (line.includes('dark:text-')) return true;
  
  // Skip if it's in a comment
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return true;
  
  // Skip if it's a variable or template literal
  if (line.includes('${') || line.includes('`')) return false; // Don't skip template literals, we'll handle them specially
  
  return false;
}

function fixDarkModeText(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  let changeCount = 0;
  
  // Process each color mapping
  for (const [oldClass, newClass] of Object.entries(colorMappings)) {
    // Skip if this replacement is already done
    if (!content.includes(oldClass) || content.includes(newClass)) continue;
    
    // Create regex patterns for different scenarios
    const patterns = [
      // Simple className with quotes
      new RegExp(`className="([^"]*\\b)${oldClass}(\\b[^"]*)"`, 'g'),
      new RegExp(`className='([^']*\\b)${oldClass}(\\b[^']*)'`, 'g'),
      
      // className with template literals (but not inside ${})
      new RegExp(`className={\`([^\`]*\\b)${oldClass}(\\b[^\`]*)\`}`, 'g'),
      
      // cn() function calls
      new RegExp(`cn\\(([^)]*["'\`][^"'\`]*\\b)${oldClass}(\\b[^"'\`]*["'\`][^)]*)\\)`, 'g'),
      
      // clsx() function calls
      new RegExp(`clsx\\(([^)]*["'\`][^"'\`]*\\b)${oldClass}(\\b[^"'\`]*["'\`][^)]*)\\)`, 'g'),
    ];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Special handling for template literals with variables
        if (pattern.source.includes('\\`')) {
          // Check if it's inside a conditional
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(pattern) && !shouldSkipLine(line)) {
              // If it's a conditional class, we need to be more careful
              if (line.includes('?') && line.includes(':')) {
                // Skip complex conditionals for manual review
                console.log(`  ⚠️  Complex conditional in ${filePath}:${i+1} - needs manual review`);
                continue;
              }
              
              // Simple replacement
              lines[i] = line.replace(pattern, (match, before, after) => {
                return match.replace(oldClass, newClass);
              });
              
              if (lines[i] !== line) {
                hasChanges = true;
                changeCount++;
              }
            }
          }
          content = lines.join('\n');
        } else {
          // Simple replacement for non-template literals
          const newContent = content.replace(pattern, (match, before, after) => {
            return match.replace(oldClass, newClass);
          });
          
          if (newContent !== content) {
            content = newContent;
            hasChanges = true;
            changeCount += matches.length;
          }
        }
      }
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changeCount} dark mode text issues in ${path.relative(process.cwd(), filePath)}`);
    return changeCount;
  }
  
  return 0;
}

function findAndFixAllFiles() {
  console.log('🔍 Searching for dark mode text issues...\n');
  
  const files = glob.sync('src/**/*.{tsx,jsx}', {
    ignore: skipFiles
  });
  
  let totalFiles = 0;
  let totalFixes = 0;
  
  for (const file of files) {
    const fixes = fixDarkModeText(file);
    if (fixes > 0) {
      totalFiles++;
      totalFixes += fixes;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✨ Dark mode text fix complete!`);
  console.log(`📊 Fixed ${totalFixes} issues across ${totalFiles} files`);
  console.log('='.repeat(60));
  
  // List files that might need manual review
  console.log('\n📝 Files that may need manual review for complex conditionals:');
  const complexFiles = [
    'src/app/calculator/[plan]/CalculatorPlanClient.tsx',
    'src/app/historical/page.tsx',
    'src/components/ui/CollapsibleBox.tsx',
    'src/components/bitcoin-tools/NetworkStatus.tsx'
  ];
  
  complexFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  - ${file}`);
    }
  });
}

// Run the script
findAndFixAllFiles();