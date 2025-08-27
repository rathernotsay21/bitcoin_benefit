/**
 * Typography Token System - Utility Functions
 * Bitcoin Benefit Platform
 * 
 * Utility functions for token validation, conversion, and runtime manipulation.
 * Provides type-safe helpers for working with typography tokens.
 */

import type {
  FontSizeScale,
  LineHeightScale,
  FontWeightScale,
  LetterSpacingScale,
  FontFamily,
  TextColor,
  BrandColor,
  TextShadow,
  HeadingLevel,
  BodyTextVariant,
  SpecialTextStyle,
  ThemeMode,
  TokenValidationResult,
  TypographyRuntimeConfig,
  TypographyMetrics,
  SemanticTypography,
  BitcoinAmountFormatting,
  BitcoinSymbolFormatting,
  FinancialDataFormatting,
  CSSCustomProperty,
  CSSValue
} from '@/types/typography';

import {
  FONT_SIZE_TOKENS,
  LINE_HEIGHT_TOKENS,
  FONT_WEIGHT_TOKENS,
  LETTER_SPACING_TOKENS,
  FONT_FAMILY_TOKENS,
  TEXT_COLOR_TOKENS,
  BRAND_COLOR_TOKENS,
  TEXT_SHADOW_TOKENS,
  HEADING_TYPOGRAPHY,
  BODY_TYPOGRAPHY,
  SPECIAL_TYPOGRAPHY,
  getFontSizeVar,
  getLineHeightVar,
  getFontWeightVar,
  getLetterSpacingVar,
  getFontFamilyVar,
  getTextColorVar,
  getBrandColorVar,
  getTextShadowVar,
  semanticToCSSProperties,
  getAllCSSCustomProperties
} from './tokens';

// =============================================================================
// TOKEN VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate if a font size scale value is valid
 */
export function isValidFontSizeScale(scale: string): scale is FontSizeScale {
  return scale in FONT_SIZE_TOKENS;
}

/**
 * Validate if a line height scale value is valid
 */
export function isValidLineHeightScale(scale: string): scale is LineHeightScale {
  return scale in LINE_HEIGHT_TOKENS;
}

/**
 * Validate if a font weight scale value is valid
 */
export function isValidFontWeightScale(scale: string): scale is FontWeightScale {
  return scale in FONT_WEIGHT_TOKENS;
}

/**
 * Validate if a letter spacing scale value is valid
 */
export function isValidLetterSpacingScale(scale: string): scale is LetterSpacingScale {
  return scale in LETTER_SPACING_TOKENS;
}

/**
 * Validate if a font family value is valid
 */
export function isValidFontFamily(family: string): family is FontFamily {
  return family in FONT_FAMILY_TOKENS;
}

/**
 * Validate if a text color value is valid
 */
export function isValidTextColor(color: string): color is TextColor {
  return color in TEXT_COLOR_TOKENS;
}

/**
 * Validate if a brand color value is valid
 */
export function isValidBrandColor(color: string): color is BrandColor {
  return color in BRAND_COLOR_TOKENS;
}

/**
 * Validate if a text shadow value is valid
 */
export function isValidTextShadow(shadow: string): shadow is TextShadow {
  return shadow in TEXT_SHADOW_TOKENS;
}

/**
 * Validate if a heading level is valid
 */
export function isValidHeadingLevel(level: string): level is HeadingLevel {
  return level in HEADING_TYPOGRAPHY;
}

/**
 * Validate if a body text variant is valid
 */
export function isValidBodyTextVariant(variant: string): variant is BodyTextVariant {
  return variant in BODY_TYPOGRAPHY;
}

/**
 * Validate if a special text style is valid
 */
export function isValidSpecialTextStyle(style: string): style is SpecialTextStyle {
  return style in SPECIAL_TYPOGRAPHY;
}

/**
 * Comprehensive token validation with detailed feedback
 */
export function validateTypographyToken(
  tokenType: string,
  tokenValue: string
): TokenValidationResult {
  const suggestions: Record<string, string[]> = {
    fontSize: Object.keys(FONT_SIZE_TOKENS),
    lineHeight: Object.keys(LINE_HEIGHT_TOKENS),
    fontWeight: Object.keys(FONT_WEIGHT_TOKENS),
    letterSpacing: Object.keys(LETTER_SPACING_TOKENS),
    fontFamily: Object.keys(FONT_FAMILY_TOKENS),
    textColor: Object.keys(TEXT_COLOR_TOKENS),
    brandColor: Object.keys(BRAND_COLOR_TOKENS),
    textShadow: Object.keys(TEXT_SHADOW_TOKENS)
  };

  switch (tokenType) {
    case 'fontSize':
      if (isValidFontSizeScale(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'lineHeight':
      if (isValidLineHeightScale(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'fontWeight':
      if (isValidFontWeightScale(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'letterSpacing':
      if (isValidLetterSpacingScale(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'fontFamily':
      if (isValidFontFamily(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'textColor':
      if (isValidTextColor(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'brandColor':
      if (isValidBrandColor(tokenValue)) {
        return { valid: true };
      }
      break;
    case 'textShadow':
      if (isValidTextShadow(tokenValue)) {
        return { valid: true };
      }
      break;
    default:
      return {
        valid: false,
        error: `Unknown token type: ${tokenType}`,
        suggestion: 'Use one of: fontSize, lineHeight, fontWeight, letterSpacing, fontFamily, textColor, brandColor, textShadow'
      };
  }

  const availableValues = suggestions[tokenType] || [];
  const closestMatch = findClosestMatch(tokenValue, availableValues);

  return {
    valid: false,
    error: `Invalid ${tokenType} token: ${tokenValue}`,
    suggestion: closestMatch ? `Did you mean "${closestMatch}"?` : `Available values: ${availableValues.join(', ')}`
  };
}

/**
 * Find the closest matching token value using Levenshtein distance
 */
function findClosestMatch(input: string, candidates: string[]): string | null {
  if (candidates.length === 0) return null;

  let closestMatch = candidates[0];
  let minDistance = levenshteinDistance(input, closestMatch);

  for (let i = 1; i < candidates.length; i++) {
    const distance = levenshteinDistance(input, candidates[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = candidates[i];
    }
  }

  // Only suggest if the distance is reasonable (less than half the string length)
  return minDistance <= Math.ceil(input.length / 2) ? closestMatch : null;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// =============================================================================
// TOKEN CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert rem values to pixels based on base font size
 */
export function remToPixels(remValue: string, baseFontSize: number = 16): number {
  const numericValue = parseFloat(remValue.replace('rem', ''));
  return numericValue * baseFontSize;
}

/**
 * Convert pixels to rem values based on base font size
 */
export function pixelsToRem(pixelValue: number, baseFontSize: number = 16): string {
  return `${pixelValue / baseFontSize}rem`;
}

/**
 * Parse clamp() function to extract min, preferred, and max values
 */
export function parseClampValue(clampValue: string): {
  min: string;
  preferred: string;
  max: string;
} | null {
  const clampRegex = /clamp\(([^,]+),([^,]+),([^)]+)\)/;
  const match = clampValue.match(clampRegex);
  
  if (!match) return null;
  
  return {
    min: match[1].trim(),
    preferred: match[2].trim(),
    max: match[3].trim()
  };
}

/**
 * Get the computed pixel value range for a font size token
 */
export function getFontSizePixelRange(scale: FontSizeScale): { min: number; max: number } {
  const token = FONT_SIZE_TOKENS[scale];
  return {
    min: remToPixels(token.min),
    max: remToPixels(token.max)
  };
}

/**
 * Calculate modular scale value for a given step
 */
export function calculateModularScaleValue(
  baseSize: number,
  ratio: number,
  step: number
): number {
  return baseSize * Math.pow(ratio, step);
}

/**
 * Generate fluid typography clamp value
 */
export function generateFluidClamp(
  minSize: number,
  maxSize: number,
  minViewport: number = 320,
  maxViewport: number = 1440,
  unit: 'px' | 'rem' = 'rem'
): string {
  const minSizeRem = unit === 'px' ? minSize / 16 : minSize;
  const maxSizeRem = unit === 'px' ? maxSize / 16 : maxSize;
  
  const slope = (maxSizeRem - minSizeRem) / (maxViewport - minViewport);
  const yInterceptRem = -minViewport * slope + minSizeRem;
  
  const preferredValue = `${yInterceptRem.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw`;
  
  return `clamp(${minSizeRem}rem, ${preferredValue}, ${maxSizeRem}rem)`;
}

// =============================================================================
// THEME UTILITIES
// =============================================================================

/**
 * Get color value for specific theme mode
 */
export function getColorForTheme(
  colorType: 'text' | 'brand',
  colorName: string,
  theme: ThemeMode
): string | null {
  if (colorType === 'text') {
    const colorToken = TEXT_COLOR_TOKENS[colorName as TextColor];
    if (!colorToken) return null;
    
    switch (theme) {
      case 'light':
        return colorToken.values.light;
      case 'dark':
        return colorToken.values.dark;
      case 'high-contrast':
        // Use light high contrast by default, could be enhanced to detect system preference
        return colorToken.values.highContrast.light;
      default:
        return colorToken.values.light;
    }
  } else {
    const colorToken = BRAND_COLOR_TOKENS[colorName as BrandColor];
    if (!colorToken) return null;
    
    switch (theme) {
      case 'light':
        return colorToken.values.light;
      case 'dark':
        return colorToken.values.dark;
      case 'high-contrast':
        // Use light high contrast by default, could be enhanced to detect system preference
        return colorToken.values.highContrast.light;
      default:
        return colorToken.values.light;
    }
  }
}

/**
 * Generate CSS custom properties for a specific theme
 */
export function generateThemeColorProperties(theme: ThemeMode): Record<string, string> {
  const properties: Record<string, string> = {};
  
  // Text colors
  Object.entries(TEXT_COLOR_TOKENS).forEach(([name, token]) => {
    const value = getColorForTheme('text', name, theme);
    if (value) {
      properties[token.cssVar] = value;
    }
  });
  
  // Brand colors
  Object.entries(BRAND_COLOR_TOKENS).forEach(([name, token]) => {
    const value = getColorForTheme('brand', name, theme);
    if (value) {
      properties[token.cssVar] = value;
    }
  });
  
  return properties;
}

// =============================================================================
// SEMANTIC TYPOGRAPHY UTILITIES
// =============================================================================

/**
 * Get semantic typography definition by type and variant
 */
export function getSemanticTypography(
  type: 'heading' | 'body' | 'special',
  variant: string
): SemanticTypography | null {
  switch (type) {
    case 'heading':
      return HEADING_TYPOGRAPHY[variant as HeadingLevel] || null;
    case 'body':
      return BODY_TYPOGRAPHY[variant as BodyTextVariant] || null;
    case 'special':
      return SPECIAL_TYPOGRAPHY[variant as SpecialTextStyle] || null;
    default:
      return null;
  }
}

/**
 * Create CSS class name from semantic typography
 */
export function createSemanticCSSClassName(
  type: 'heading' | 'body' | 'special',
  variant: string
): string {
  const prefixes = {
    heading: variant === 'display' ? 'heading-display' : `heading-${variant.replace('h', '')}`,
    body: `body-${variant}`,
    special: variant.replace(/([A-Z])/g, '-$1').toLowerCase()
  };
  
  return prefixes[type] || `${type}-${variant}`;
}

// =============================================================================
// BITCOIN-SPECIFIC UTILITIES
// =============================================================================

/**
 * Generate Bitcoin amount formatting styles
 */
export function createBitcoinAmountStyles(options: Partial<BitcoinAmountFormatting> = {}): Record<string, CSSValue> {
  const defaults: BitcoinAmountFormatting = {
    tabularNums: true,
    letterSpacing: 'wide',
    fontWeight: 'medium',
    color: 'bitcoin'
  };
  
  const config = { ...defaults, ...options };
  
  const styles: Record<string, CSSValue> = {
    fontWeight: `var(${getFontWeightVar(config.fontWeight)})`,
    letterSpacing: `var(${getLetterSpacingVar(config.letterSpacing)})`,
    color: `var(${getBrandColorVar(config.color)})`,
    fontFamily: `var(${getFontFamilyVar('mono')})`
  };
  
  if (config.tabularNums) {
    styles.fontVariantNumeric = 'tabular-nums';
    styles.fontFeatureSettings = '"tnum" on';
  }
  
  return styles;
}

/**
 * Generate Bitcoin symbol formatting styles
 */
export function createBitcoinSymbolStyles(options: Partial<BitcoinSymbolFormatting> = {}): Record<string, CSSValue> {
  const defaults: BitcoinSymbolFormatting = {
    enableLigatures: true,
    enableKerning: true,
    fontVariant: 'common-ligatures'
  };
  
  const config = { ...defaults, ...options };
  
  const styles: Record<string, CSSValue> = {
    color: `var(${getBrandColorVar('bitcoin')})`
  };
  
  if (config.enableLigatures && config.enableKerning) {
    styles.fontFeatureSettings = '"liga" on, "kern" on';
  } else if (config.enableLigatures) {
    styles.fontFeatureSettings = '"liga" on';
  } else if (config.enableKerning) {
    styles.fontFeatureSettings = '"kern" on';
  }
  
  if (config.fontVariant) {
    styles.fontVariantLigatures = config.fontVariant;
  }
  
  return styles;
}

/**
 * Generate comprehensive financial data styles
 */
export function createFinancialDataStyles(options: Partial<FinancialDataFormatting> = {}): Record<string, CSSValue> {
  const defaults: FinancialDataFormatting = {
    tabularNums: true,
    letterSpacing: 'wide',
    fontWeight: 'medium',
    color: 'bitcoin',
    precision: 8,
    useScientificNotation: false,
    highlightSignificance: true
  };
  
  const config = { ...defaults, ...options };
  const baseStyles = createBitcoinAmountStyles(config);
  
  // Additional styles for financial data
  const additionalStyles: Record<string, CSSValue> = {};
  
  if (config.highlightSignificance) {
    additionalStyles.transition = 'color 0.2s ease';
  }
  
  return { ...baseStyles, ...additionalStyles };
}

// =============================================================================
// RUNTIME CONFIGURATION UTILITIES
// =============================================================================

/**
 * Create runtime configuration with defaults
 */
export function createTypographyRuntimeConfig(
  overrides: Partial<TypographyRuntimeConfig> = {}
): TypographyRuntimeConfig {
  const defaults: TypographyRuntimeConfig = {
    enableFluidTypography: true,
    enableHighContrastMode: true,
    enableReducedMotionSupport: true,
    enableContainerQueries: true,
    enablePrintOptimization: true
  };
  
  return { ...defaults, ...overrides };
}

/**
 * Apply runtime configuration to CSS properties
 */
export function applyRuntimeConfiguration(
  config: TypographyRuntimeConfig
): Record<string, string> {
  const properties: Record<string, string> = {};
  
  if (!config.enableFluidTypography) {
    // Convert all clamp values to static values (use max values)
    Object.values(FONT_SIZE_TOKENS).forEach(token => {
      properties[token.cssVar] = token.max;
    });
  }
  
  if (config.enableReducedMotionSupport) {
    properties['--text-shadow-transition'] = 'none';
  }
  
  return properties;
}

// =============================================================================
// PERFORMANCE MONITORING UTILITIES
// =============================================================================

/**
 * Initialize typography metrics collection
 */
export function initializeTypographyMetrics(): TypographyMetrics {
  return {
    fontLoadTime: 0,
    cumulativeLayoutShift: 0,
    bundleSize: 0,
    customPropertiesCount: getAllCSSCustomProperties().length
  };
}

/**
 * Measure font loading performance
 */
export async function measureFontLoadTime(fontFamily: string): Promise<number> {
  if (!('fonts' in document)) {
    return 0;
  }
  
  const startTime = performance.now();
  
  try {
    await document.fonts.load(`16px ${fontFamily}`);
    return performance.now() - startTime;
  } catch (error) {
    console.warn(`Failed to measure font load time for ${fontFamily}:`, error);
    return 0;
  }
}

/**
 * Calculate typography-related bundle size
 */
export function calculateTypographyBundleSize(): number {
  // This would typically be calculated during build time
  // For runtime, we can estimate based on CSS custom properties count
  const customPropsCount = getAllCSSCustomProperties().length;
  const averageBytesPerProperty = 50; // Rough estimate
  
  return customPropsCount * averageBytesPerProperty;
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Check if text size meets WCAG accessibility standards
 */
export function checkTextSizeAccessibility(
  fontSize: FontSizeScale,
  fontWeight: FontWeightScale
): {
  meetsAA: boolean;
  meetsAAA: boolean;
  recommendations: string[];
} {
  const sizeToken = FONT_SIZE_TOKENS[fontSize];
  const weightToken = FONT_WEIGHT_TOKENS[fontWeight];
  const minPixels = remToPixels(sizeToken.min);
  const maxPixels = remToPixels(sizeToken.max);
  
  const recommendations: string[] = [];
  let meetsAA = false;
  let meetsAAA = false;
  
  // WCAG 2.1 AA requires at least 14px for normal text, 18px for large text
  if (weightToken.value >= 700) {
    // Bold text
    meetsAA = minPixels >= 14;
    meetsAAA = minPixels >= 18;
  } else {
    // Normal weight text
    meetsAA = minPixels >= 16;
    meetsAAA = minPixels >= 22;
  }
  
  if (!meetsAA) {
    recommendations.push('Consider using a larger font size for better accessibility');
  }
  
  if (!meetsAAA) {
    recommendations.push('For AAA compliance, consider using an even larger font size');
  }
  
  if (weightToken.value < 400) {
    recommendations.push('Very light font weights may be difficult to read');
  }
  
  return { meetsAA, meetsAAA, recommendations };
}

/**
 * Generate high contrast color alternatives
 */
export function generateHighContrastColors(): Record<string, string> {
  const highContrastColors: Record<string, string> = {};
  
  Object.entries(TEXT_COLOR_TOKENS).forEach(([name, token]) => {
    highContrastColors[`${token.cssVar}-hc`] = token.values.highContrast.light;
  });
  
  Object.entries(BRAND_COLOR_TOKENS).forEach(([name, token]) => {
    highContrastColors[`${token.cssVar}-hc`] = token.values.highContrast.light;
  });
  
  return highContrastColors;
}

// =============================================================================
// DEBUG UTILITIES
// =============================================================================

/**
 * Log all available typography tokens to console (development only)
 */
export function logTypographyTokens(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.group('Typography Tokens');
  console.log('Font Sizes:', Object.keys(FONT_SIZE_TOKENS));
  console.log('Line Heights:', Object.keys(LINE_HEIGHT_TOKENS));
  console.log('Font Weights:', Object.keys(FONT_WEIGHT_TOKENS));
  console.log('Letter Spacings:', Object.keys(LETTER_SPACING_TOKENS));
  console.log('Font Families:', Object.keys(FONT_FAMILY_TOKENS));
  console.log('Text Colors:', Object.keys(TEXT_COLOR_TOKENS));
  console.log('Brand Colors:', Object.keys(BRAND_COLOR_TOKENS));
  console.log('Text Shadows:', Object.keys(TEXT_SHADOW_TOKENS));
  console.groupEnd();
}

/**
 * Validate all typography tokens for consistency
 */
export function validateAllTokens(): TokenValidationResult[] {
  const results: TokenValidationResult[] = [];
  
  // Validate font size tokens
  Object.keys(FONT_SIZE_TOKENS).forEach(scale => {
    const result = validateTypographyToken('fontSize', scale);
    if (!result.valid) {
      results.push({ ...result, error: `Font size token error: ${result.error}` });
    }
  });
  
  // Add more validations as needed...
  
  return results;
}