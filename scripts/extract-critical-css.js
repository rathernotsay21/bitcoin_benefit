#!/usr/bin/env node

/**
 * Critical CSS Extraction Script
 * Phase 3.1 Performance Optimization - Bitcoin Benefit Platform
 * 
 * Extracts and inlines critical above-the-fold CSS to improve FCP by ~400ms
 * Target: 5-10KB of critical CSS for immediate rendering
 */

const fs = require('fs');
const path = require('path');

// Critical CSS selectors for above-the-fold content
const CRITICAL_SELECTORS = [
  // CSS Variables (Essential for theme system)
  ':root',
  '.dark',
  
  // Base HTML elements
  'html',
  'body',
  
  // Layout containers
  '.min-h-screen',
  '.max-w-7xl',
  '.mx-auto',
  '.px-4',
  '.sm\\:px-6',
  '.lg\\:px-8',
  '.relative',
  '.z-50',
  '.z-20',
  '.z-10',
  
  // Navigation critical styles
  '.navbar',
  '.sticky',
  '.top-0',
  '.flex',
  '.justify-between',
  '.items-center',
  '.py-1',
  '.sm\\:py-1\\.5',
  '.space-x-2',
  '.sm\\:space-x-3',
  '.group',
  '.flex-shrink',
  '.flex-shrink-0',
  '.transition-transform',
  '.duration-300',
  '.min-w-0',
  '.flex-col',
  '.group-hover\\:rotate-12',
  '.group-hover\\:text-bitcoin',
  '.dark\\:group-hover\\:text-bitcoin',
  '.transition-colors',
  '.hidden',
  '.sm\\:inline',
  '.sm\\:hidden',
  '.sm\\:block',
  '.sm\\:text-sm',
  '.sm\\:text-xl',
  '.md\\:text-2xl',
  
  // Typography critical classes
  '.text-lg',
  '.text-xl',
  '.text-2xl',
  '.text-3xl',
  '.text-4xl',
  '.text-5xl',
  '.text-6xl',
  '.text-7xl',
  '.font-bold',
  '.leading-tight',
  '.leading-relaxed',
  '.leading-tight',
  '.text-xs',
  '.text-sm',
  
  // Colors critical classes
  '.text-deepSlate',
  '.dark\\:text-slate-100',
  '.text-slate-500',
  '.dark\\:text-slate-400',
  '.text-slate-300',
  '.text-bitcoin',
  '.text-bitcoin-600',
  '.dark\\:text-bitcoin',
  '.bg-slate-950',
  '.dark\\:bg-slate-950',
  '.bg-gradient-to-r',
  '.bg-gradient-to-br',
  '.bg-clip-text',
  '.text-transparent',
  '.from-slate-200',
  '.via-white',
  '.to-slate-300',
  '.from-bitcoin',
  '.via-orange-400',
  '.to-bitcoin',
  '.from-slate-900\\/60',
  '.via-slate-950\\/40',
  '.to-slate-900\\/60',
  
  // Hero section critical styles
  '.hero-section',
  '.min-h-\\[400px\\]',
  '.absolute',
  '.inset-0',
  '.overflow-hidden',
  '.py-24',
  '.text-center',
  '.justify-center',
  '.mb-8',
  '.inline-flex',
  '.w-20',
  '.h-20',
  '.w-10',
  '.h-10',
  '.w-12',
  '.h-12',
  '.sm\\:w-14',
  '.sm\\:h-14',
  '.rounded-full',
  '.animate-float',
  '.shadow-sm',
  '.pointer-events-none',
  '.max-w-2xl',
  '.mt-8',
  
  // Button critical styles (for HeroButtons)
  '.btn-primary',
  '.btn-secondary',
  '.hero-btn-primary',
  '.hero-btn-secondary',
  
  // Animation classes
  '.transition-colors',
  '.transition-transform',
  '.duration-300',
  '.animate-float',
  
  // Responsive utilities
  '.sm\\:text-4xl',
  '.md\\:text-5xl',
  '.lg\\:text-6xl',
  '.xl\\:text-7xl'
];

// Additional critical CSS content that needs to be included
const CRITICAL_CSS_CONTENT = `
/* Critical CSS Variables - Essential for theme system */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 42 100% 49%;
  --primary-foreground: 0 0% 100%;
  --secondary: 217 91% 60%;
  --secondary-foreground: 0 0% 100%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 42 100% 49%;
  --radius: 0.125rem;
  --chart-1: 142 71% 45%;
  --chart-2: 42 100% 49%;
  --chart-3: 47 84% 63%;
  --chart-4: 200 85% 55%;
  --chart-5: 280 65% 60%;
  --primary-bitcoin: #f2a900;
  --text-dark: #1E2A3A;
  --bg-light-grey: #F4F6F8;
  --bg-off-white: #FAFAFA;
  --accent-blue: #3b82f6;
  --neutral-text: #1E2A3A;
  --border-light: #E2E8F0;
  --text-muted: #6b7280;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 42 100% 49%;
  --primary-foreground: 0 0% 100%;
  --secondary: 217 91% 60%;
  --secondary-foreground: 0 0% 100%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 215 20% 65%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 42 100% 49%;
  --chart-1: 142 71% 55%;
  --chart-2: 42 100% 55%;
  --chart-3: 47 84% 70%;
  --chart-4: 200 85% 65%;
  --chart-5: 280 65% 70%;
  --bg-primary: #0F172A;
  --bg-card: #1E293B;
  --text-primary: #F8FAFC;
  --button-bg: #f2a900;
  --border-dark: #334155;
  --text-muted: #9ca3af;
}

/* Critical Layout Styles */
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  overflow-x: hidden;
  text-rendering: optimizeSpeed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #F4F6F8;
  color: #1E2A3A;
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.dark body {
  background-color: #0F172A !important;
  color: #F8FAFC !important;
}

html.dark {
  background-color: #0F172A;
}

/* Critical Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1E2A3A;
  transition: color 0.3s ease;
}

.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
  color: #F8FAFC;
}

p {
  color: #1E2A3A;
  line-height: 1.7;
  letter-spacing: 0.01em;
}

.dark p {
  color: #cbd5e1;
}

/* Critical Navigation Styles */
.navbar {
  background: linear-gradient(
    to right,
    rgba(247, 147, 26, 0.1) 0%,
    rgba(59, 130, 246, 0.1) 100%
  ),
  linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.85) 0%,
    rgba(239, 246, 255, 0.8) 30%,
    rgba(224, 231, 255, 0.82) 70%,
    rgba(248, 250, 252, 0.88) 100%
  );
  backdrop-filter: blur(8px) saturate(180%) brightness(110%);
  -webkit-backdrop-filter: blur(8px) saturate(180%) brightness(110%);
  border-bottom: 1px solid rgba(224, 231, 255, 0.4);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 15px rgba(59, 130, 246, 0.06),
    0 8px 25px rgba(247, 147, 26, 0.03),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 1px rgba(224, 231, 255, 0.3);
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .navbar {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.85) 0%,
    rgba(30, 41, 59, 0.8) 50%,
    rgba(15, 23, 42, 0.9) 100%
  );
  backdrop-filter: blur(8px) saturate(200%) brightness(120%);
  -webkit-backdrop-filter: blur(8px) saturate(200%) brightness(120%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.1);
}

/* Critical Button Styles */
.btn-primary {
  position: relative;
  font-weight: 700;
  padding: 0.875rem 1.75rem;
  transition: all 0.5s ease;
  overflow: hidden;
  border-radius: 0.125rem;
  transform: translateZ(0) perspective(1000px) rotateX(0deg);
  background: linear-gradient(135deg, #f2a900 0%, #f2a900 60%, #FFB347 100%);
  box-shadow: 0 4px 15px -3px rgba(247, 147, 26, 0.3),
              0 8px 25px -5px rgba(247, 147, 26, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.2);
  color: white;
}

.dark .btn-primary {
  color: white;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: inherit;
}

.btn-primary:hover {
  transform: translateY(-3px) translateZ(0) perspective(1000px) rotateX(2deg) scale(1.02);
  box-shadow: 0 6px 20px -3px rgba(247, 147, 26, 0.4),
              0 12px 35px -5px rgba(247, 147, 26, 0.2),
              inset 0 1px 3px rgba(255, 255, 255, 0.3);
}

.btn-primary:hover::before {
  opacity: 1;
}

/* Critical Animation */
@keyframes float {
  0%, 100% { transform: translateY(0px) translateZ(0); }
  50% { transform: translateY(-10px) translateZ(0); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
  transform: translateZ(0);
}

/* Critical Text Colors */
.text-bitcoin {
  color: #f2a900;
}

.text-deepSlate {
  color: #1E2A3A;
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(8px)) {
  .navbar {
    background: linear-gradient(
      to right,
      rgba(247, 147, 26, 0.08) 0%,
      rgba(59, 130, 246, 0.08) 100%
    ),
    linear-gradient(
      135deg,
      rgba(248, 250, 252, 0.95) 0%,
      rgba(239, 246, 255, 0.93) 30%,
      rgba(224, 231, 255, 0.94) 70%,
      rgba(248, 250, 252, 0.96) 100%
    );
    border-bottom: 1px solid rgba(224, 231, 255, 0.6);
  }
  
  .dark .navbar {
    background: rgba(15, 23, 42, 0.95);
    border-bottom: 1px solid rgba(51, 65, 85, 0.8);
  }
}
`;

function extractCriticalCSS() {
  try {
    const globalsCssPath = path.join(__dirname, '../src/app/globals.css');
    const fontsCssPath = path.join(__dirname, '../src/styles/fonts.css');
    
    // Read the full CSS files
    const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
    const fontsCss = fs.readFileSync(fontsCssPath, 'utf8');
    
    // Extract critical font CSS
    const criticalFontCSS = extractFontCSS(fontsCss);
    
    // Extract critical global CSS based on selectors
    const criticalGlobalCSS = extractGlobalCSS(globalsCss);
    
    // Combine all critical CSS
    const criticalCSS = `
/* Critical CSS for Above-the-Fold Content - Bitcoin Benefit Platform */
/* Auto-generated - DO NOT EDIT MANUALLY */

${criticalFontCSS}

${CRITICAL_CSS_CONTENT}

${criticalGlobalCSS}
`.trim();

    // Minify the critical CSS (basic minification)
    const minifiedCSS = minifyCSS(criticalCSS);
    
    console.log(`✅ Critical CSS extracted successfully`);
    console.log(`📏 Size: ${(minifiedCSS.length / 1024).toFixed(2)}KB`);
    
    // Ensure size is within target (5-10KB)
    if (minifiedCSS.length > 10 * 1024) {
      console.warn(`⚠️  Warning: Critical CSS exceeds 10KB target (${(minifiedCSS.length / 1024).toFixed(2)}KB)`);
    }
    
    return minifiedCSS;
    
  } catch (error) {
    console.error('❌ Error extracting critical CSS:', error);
    throw error;
  }
}

function extractFontCSS(fontsCss) {
  // Extract critical font-related CSS
  const fontSelectors = [
    ':root',
    '.fonts-loading',
    '.fonts-loaded', 
    '.fonts-fallback',
    '.font-critical',
    '.font-primary',
    '.font-loading-fallback',
    '.font-next-optimized',
    '.font-critical-text',
    '.font-performance-optimized',
    '.font-critical-performance'
  ];
  
  let criticalFontCSS = '';
  
  // Extract font-face declarations
  const fontFaceRegex = /@font-face\s*{[^}]*}/g;
  const fontFaceMatches = fontsCss.match(fontFaceRegex) || [];
  
  fontFaceMatches.forEach(fontFace => {
    if (fontFace.includes('Bitcoin Symbols')) {
      criticalFontCSS += fontFace + '\n\n';
    }
  });
  
  // Extract root variables for fonts
  const rootVarRegex = /:root\s*{[^}]*--font[^}]*}/g;
  const rootVarMatches = fontsCss.match(rootVarRegex) || [];
  rootVarMatches.forEach(rootVar => {
    criticalFontCSS += rootVar + '\n\n';
  });
  
  // Extract critical font classes
  fontSelectors.forEach(selector => {
    const regex = new RegExp(`\\${selector}\\s*{[^}]*}`, 'g');
    const matches = fontsCss.match(regex) || [];
    matches.forEach(match => {
      criticalFontCSS += match + '\n\n';
    });
  });
  
  return criticalFontCSS;
}

function extractGlobalCSS(globalsCss) {
  let criticalCSS = '';
  
  // Extract CSS custom properties from :root and .dark
  const rootRegex = /:root\s*{[^}]*}/g;
  const darkRegex = /\.dark\s*{[^}]*}/g;
  
  const rootMatches = globalsCss.match(rootRegex) || [];
  const darkMatches = globalsCss.match(darkRegex) || [];
  
  rootMatches.forEach(match => {
    criticalCSS += match + '\n\n';
  });
  
  darkMatches.forEach(match => {
    criticalCSS += match + '\n\n';
  });
  
  // Extract @layer base rules
  const layerBaseRegex = /@layer base\s*{([^{}]*({[^{}]*}[^{}]*)*)}/g;
  const layerBaseMatch = globalsCss.match(layerBaseRegex);
  
  if (layerBaseMatch) {
    layerBaseMatch.forEach(match => {
      // Extract only the critical parts from @layer base
      if (match.includes('html') || match.includes('body') || match.includes('h1, h2')) {
        criticalCSS += match + '\n\n';
      }
    });
  }
  
  // Extract specific component CSS for navbar and buttons
  const componentRegex = /\.(navbar|btn-primary|btn-secondary|hero-btn-primary|hero-btn-secondary)\s*{[^}]*}/g;
  const componentMatches = globalsCss.match(componentRegex) || [];
  
  componentMatches.forEach(match => {
    criticalCSS += match + '\n\n';
  });
  
  // Extract keyframes for critical animations
  const keyframesRegex = /@keyframes (float|electricPulse)\s*{[^}]*({[^}]*}[^}]*)*}/g;
  const keyframesMatches = globalsCss.match(keyframesRegex) || [];
  
  keyframesMatches.forEach(match => {
    criticalCSS += match + '\n\n';
  });
  
  return criticalCSS;
}

function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove unnecessary whitespace
    .replace(/\s+/g, ' ')
    // Remove space around certain characters
    .replace(/\s*{\s*/g, '{')
    .replace(/;\s*/g, ';')
    .replace(/\s*}\s*/g, '}')
    .replace(/:\s*/g, ':')
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    .trim();
}

// Generate and export the critical CSS
if (require.main === module) {
  try {
    const criticalCSS = extractCriticalCSS();
    
    // Write to a temporary file for debugging if needed
    const outputPath = path.join(__dirname, '../public/critical.css');
    fs.writeFileSync(outputPath, criticalCSS);
    
    console.log(`💾 Critical CSS written to: ${outputPath}`);
    console.log(`🚀 Ready to inline in layout.tsx`);
    
  } catch (error) {
    console.error('❌ Failed to extract critical CSS:', error);
    process.exit(1);
  }
} else {
  // Export for use in other modules
  module.exports = { extractCriticalCSS, CRITICAL_CSS_CONTENT };
}