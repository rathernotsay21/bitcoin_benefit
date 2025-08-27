/**
 * Color Contrast Utilities for WCAG Compliance
 * Implements functions for calculating contrast ratios and validating WCAG compliance
 */

/**
 * Convert a hex color to RGB values
 * @param hex - Hex color string (e.g., "#f2a900")
 * @returns RGB values as an object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.1 specification
 * @param rgb - RGB color values
 * @returns Relative luminance value
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  // Convert RGB to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate the contrast ratio between two colors
 * @param color1 - First color (hex string)
 * @param color2 - Second color (hex string)
 * @returns Contrast ratio (1 to 21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA standards
 * @param foreground - Foreground color (hex string)
 * @param background - Background color (hex string)
 * @param largeText - Whether the text is large (14pt bold or 18pt regular)
 * @returns Boolean indicating WCAG AA compliance
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const requiredRatio = largeText ? 3.0 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if a color combination meets WCAG AAA standards
 * @param foreground - Foreground color (hex string)
 * @param background - Background color (hex string)
 * @param largeText - Whether the text is large (14pt bold or 18pt regular)
 * @returns Boolean indicating WCAG AAA compliance
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const requiredRatio = largeText ? 4.5 : 7.0;
  return ratio >= requiredRatio;
}

/**
 * Get WCAG compliance level for a color combination
 * @param foreground - Foreground color (hex string)
 * @param background - Background color (hex string)
 * @param largeText - Whether the text is large
 * @returns Compliance level string
 */
export function getWCAGLevel(
  foreground: string,
  background: string,
  largeText: boolean = false
): 'AAA' | 'AA' | 'FAIL' {
  if (meetsWCAGAAA(foreground, background, largeText)) {
    return 'AAA';
  }
  if (meetsWCAGAA(foreground, background, largeText)) {
    return 'AA';
  }
  return 'FAIL';
}

/**
 * Suggest a minimum contrast color for a given background
 * @param background - Background color (hex string)
 * @param preferDark - Whether to prefer dark colors over light
 * @returns Suggested foreground color (hex string)
 */
export function suggestContrastColor(
  background: string,
  preferDark: boolean = true
): string {
  const bgLuminance = getRelativeLuminance(hexToRgb(background));
  
  // If background is dark, suggest light color
  if (bgLuminance < 0.5) {
    return '#FFFFFF';
  }
  
  // If background is light, suggest dark color
  return preferDark ? '#1F2937' : '#6B7280';
}

/**
 * Validate all color combinations in a theme
 * @param theme - Object containing color pairs to validate
 * @returns Validation results
 */
export function validateThemeContrast(theme: {
  [key: string]: { foreground: string; background: string; largeText?: boolean };
}): { [key: string]: { ratio: number; level: 'AAA' | 'AA' | 'FAIL'; passes: boolean } } {
  const results: { [key: string]: { ratio: number; level: 'AAA' | 'AA' | 'FAIL'; passes: boolean } } = {};
  
  for (const [key, colors] of Object.entries(theme)) {
    const ratio = calculateContrastRatio(colors.foreground, colors.background);
    const level = getWCAGLevel(colors.foreground, colors.background, colors.largeText);
    const passes = level !== 'FAIL';
    
    results[key] = { ratio, level, passes };
  }
  
  return results;
}

/**
 * Common color combinations used in the application
 */
export const bitcoinColorPairs = {
  primaryButton: {
    foreground: '#FFFFFF',
    background: '#f2a900',
    largeText: false,
  },
  secondaryButton: {
    foreground: '#FFFFFF',
    background: '#3b82f6',
    largeText: false,
  },
  mutedText: {
    foreground: '#6b7280',
    background: '#FFFFFF',
    largeText: false,
  },
  darkMutedText: {
    foreground: '#9ca3af',
    background: '#0F172A',
    largeText: false,
  },
  bitcoinOnWhite: {
    foreground: '#f2a900',
    background: '#FFFFFF',
    largeText: false,
  },
  bitcoinOnDark: {
    foreground: '#f2a900',
    background: '#0F172A',
    largeText: false,
  },
};

/**
 * Run a full contrast audit on the application's color theme
 */
export function auditColorContrast(): void {
  console.log('🎨 Running Color Contrast Audit...\n');
  
  const results = validateThemeContrast(bitcoinColorPairs);
  
  for (const [name, result] of Object.entries(results)) {
    const emoji = result.passes ? '✅' : '❌';
    console.log(
      `${emoji} ${name}: Ratio ${result.ratio.toFixed(2)} - ${result.level}`
    );
  }
  
  const failures = Object.entries(results).filter(([, r]) => !r.passes);
  if (failures.length > 0) {
    console.warn(`\n⚠️  ${failures.length} color combination(s) failed WCAG AA standards`);
  } else {
    console.log('\n✨ All color combinations meet WCAG AA standards!');
  }
}