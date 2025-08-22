#!/usr/bin/env node

/**
 * Performance Budget Checker
 * Validates current performance metrics against defined budget
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Load performance budget
const budgetPath = path.join(__dirname, '..', 'performance-budget.json');
let budget;

try {
  budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
} catch (error) {
  console.error(`${colors.red}Error loading performance budget:${colors.reset}`, error.message);
  process.exit(1);
}

// Check if Next.js build stats exist
const buildManifestPath = path.join(__dirname, '..', '.next', 'build-manifest.json');
const appBuildManifestPath = path.join(__dirname, '..', '.next', 'app-build-manifest.json');

let hasErrors = false;
let hasWarnings = false;

console.log(`\n${colors.cyan}${colors.bright}📊 Performance Budget Check${colors.reset}\n`);
console.log(`Budget Version: ${budget.version}`);
console.log(`Last Updated: ${budget.updated}\n`);

// Check bundle sizes if build exists
if (fs.existsSync(buildManifestPath)) {
  console.log(`${colors.blue}Bundle Size Analysis:${colors.reset}`);
  
  try {
    // Get all JS files in .next/static
    const staticDir = path.join(__dirname, '..', '.next', 'static');
    let totalBundleSize = 0;
    let chartsVendorSize = 0;
    let mainBundleSize = 0;
    
    function getDirectorySize(dirPath, pattern = null) {
      let size = 0;
      
      if (!fs.existsSync(dirPath)) return 0;
      
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          size += getDirectorySize(filePath, pattern);
        } else if (stat.isFile()) {
          if (!pattern || file.match(pattern)) {
            size += stat.size;
            
            // Track specific bundles
            if (file.includes('charts-vendor')) {
              chartsVendorSize += stat.size;
            } else if (file.includes('main') || file.includes('app')) {
              mainBundleSize += stat.size;
            }
          }
        }
      }
      
      return size;
    }
    
    // Calculate JS bundle sizes
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      totalBundleSize = getDirectorySize(chunksDir, /\.js$/);
      
      // Check against budget
      const mainBudget = budget.metrics['bundle-sizes']['main-bundle'];
      const chartsBudget = budget.metrics['bundle-sizes']['charts-vendor'];
      
      // Main bundle check
      if (mainBundleSize > 0) {
        const mainStatus = getStatus(mainBundleSize, mainBudget);
        console.log(`  Main Bundle: ${formatSize(mainBundleSize)} ${mainStatus.icon} ${mainStatus.message}`);
        
        if (mainStatus.level === 'critical') hasErrors = true;
        if (mainStatus.level === 'warning') hasWarnings = true;
      }
      
      // Charts bundle check
      if (chartsVendorSize > 0) {
        const chartsStatus = getStatus(chartsVendorSize, chartsBudget);
        console.log(`  Charts Bundle: ${formatSize(chartsVendorSize)} ${chartsStatus.icon} ${chartsStatus.message}`);
        
        if (chartsStatus.level === 'critical') hasErrors = true;
        if (chartsStatus.level === 'warning') hasWarnings = true;
      }
      
      console.log(`  Total JS: ${formatSize(totalBundleSize)}`);
    }
    
    // Check CSS size
    const cssDir = path.join(staticDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssSize = getDirectorySize(cssDir, /\.css$/);
      const cssBudget = budget.metrics['bundle-sizes']['css-total'];
      const cssStatus = getStatus(cssSize, cssBudget);
      
      console.log(`  Total CSS: ${formatSize(cssSize)} ${cssStatus.icon} ${cssStatus.message}`);
      
      if (cssStatus.level === 'critical') hasErrors = true;
      if (cssStatus.level === 'warning') hasWarnings = true;
    }
    
  } catch (error) {
    console.log(`  ${colors.yellow}Could not analyze bundle sizes: ${error.message}${colors.reset}`);
  }
  
} else {
  console.log(`${colors.yellow}Build not found. Run 'npm run build' first to check bundle sizes.${colors.reset}`);
}

// Check Lighthouse report if it exists
const lighthouseReportPath = path.join(__dirname, '..', 'lighthouse-report.json');
if (fs.existsSync(lighthouseReportPath)) {
  console.log(`\n${colors.blue}Lighthouse Metrics:${colors.reset}`);
  
  try {
    const report = JSON.parse(fs.readFileSync(lighthouseReportPath, 'utf8'));
    const audits = report.audits;
    
    // Check Core Web Vitals
    const metrics = [
      { key: 'largest-contentful-paint', budgetKey: 'lcp', name: 'LCP' },
      { key: 'first-contentful-paint', budgetKey: 'fcp', name: 'FCP' },
      { key: 'cumulative-layout-shift', budgetKey: 'cls', name: 'CLS' },
      { key: 'total-blocking-time', budgetKey: 'tbt', name: 'TBT' },
      { key: 'server-response-time', budgetKey: 'ttfb', name: 'TTFB' }
    ];
    
    metrics.forEach(metric => {
      if (audits[metric.key]) {
        const value = audits[metric.key].numericValue;
        const budgetMetric = budget.metrics['core-web-vitals'][metric.budgetKey];
        const status = getStatus(value, budgetMetric);
        
        const formattedValue = metric.budgetKey === 'cls' 
          ? value.toFixed(3)
          : `${value.toFixed(0)}ms`;
        
        console.log(`  ${metric.name}: ${formattedValue} ${status.icon} ${status.message}`);
        
        if (status.level === 'critical') hasErrors = true;
        if (status.level === 'warning') hasWarnings = true;
      }
    });
    
    // Check Lighthouse scores
    const categories = report.categories;
    console.log(`\n${colors.blue}Lighthouse Scores:${colors.reset}`);
    
    ['performance', 'accessibility', 'best-practices', 'seo'].forEach(category => {
      if (categories[category]) {
        const score = Math.round(categories[category].score * 100);
        const budgetScore = budget.metrics['lighthouse-scores'][category];
        const status = getStatus(100 - score, {
          target: 100 - budgetScore.target,
          warning: 100 - budgetScore.warning,
          critical: 100 - budgetScore.critical
        });
        
        console.log(`  ${capitalize(category)}: ${score}/100 ${status.icon} ${status.message}`);
        
        if (status.level === 'critical') hasErrors = true;
        if (status.level === 'warning') hasWarnings = true;
      }
    });
    
  } catch (error) {
    console.log(`  ${colors.yellow}Could not parse Lighthouse report: ${error.message}${colors.reset}`);
  }
} else {
  console.log(`\n${colors.yellow}Lighthouse report not found. Run 'npm run perf:lighthouse' to generate.${colors.reset}`);
}

// Helper functions
function getStatus(value, budget) {
  if (!budget) return { level: 'unknown', icon: '❓', message: '' };
  
  if (value <= budget.target) {
    return { 
      level: 'good', 
      icon: '✅', 
      message: `${colors.green}(within target)${colors.reset}` 
    };
  } else if (value <= budget.warning) {
    return { 
      level: 'warning', 
      icon: '⚠️', 
      message: `${colors.yellow}(warning)${colors.reset}` 
    };
  } else if (value <= budget.critical) {
    return { 
      level: 'critical', 
      icon: '❌', 
      message: `${colors.red}(critical)${colors.reset}` 
    };
  } else {
    return { 
      level: 'critical', 
      icon: '🚨', 
      message: `${colors.red}(exceeds critical)${colors.reset}` 
    };
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// Summary
console.log(`\n${colors.cyan}${colors.bright}Summary:${colors.reset}`);

if (hasErrors) {
  console.log(`${colors.red}❌ Performance budget check failed with critical issues.${colors.reset}`);
  console.log(`${colors.red}   Fix critical performance issues before deployment.${colors.reset}`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${colors.yellow}⚠️  Performance budget check passed with warnings.${colors.reset}`);
  console.log(`${colors.yellow}   Consider addressing warnings to improve performance.${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.green}✅ All performance metrics within budget!${colors.reset}`);
  process.exit(0);
}

// Recommendations
console.log(`\n${colors.cyan}Recommendations:${colors.reset}`);
console.log('1. Run "npm run build:analyze" to see detailed bundle analysis');
console.log('2. Run "npm run perf:lighthouse" to get current Lighthouse scores');
console.log('3. Check performance-budget.json for target values');
console.log('4. Use "npm run dev" and Chrome DevTools for real-time performance profiling\n');