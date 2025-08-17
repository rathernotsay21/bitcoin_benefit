#!/usr/bin/env node

// Simple script to verify that @types/react-dom is available
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying TypeScript types availability...');

// Check if @types/react-dom exists in node_modules
const typesPath = path.join(process.cwd(), 'node_modules', '@types', 'react-dom');
const packageJsonPath = path.join(typesPath, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('✅ @types/react-dom found:', packageJson.version);
} else {
  console.log('❌ @types/react-dom NOT found in node_modules');
  process.exit(1);
}

// Check if react-dom types are accessible
try {
  const reactDomIndexPath = path.join(typesPath, 'index.d.ts');
  if (fs.existsSync(reactDomIndexPath)) {
    console.log('✅ react-dom type definitions found');
  } else {
    console.log('❌ react-dom type definitions NOT found');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error checking react-dom types:', error.message);
  process.exit(1);
}

console.log('✅ All TypeScript types verified successfully!');