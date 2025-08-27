/**
 * Typography Accessibility Utilities - Bitcoin Benefit Platform
 * 
 * Provides utilities for validating and ensuring WCAG 2.1 AA compliance
 * in typography implementation.
 */

import type {
  FontSizeScale,
  LineHeightScale,
  TextColor,
  BrandColor,
  TokenValidationResult
} from '@/types/typography';

// =============================================================================
// ACCESSIBILITY CONSTANTS
// =============================================================================

/**
 * WCAG 2.1 AA compliance requirements
 */
export const ACCESSIBILITY_STANDARDS = {
  // Minimum font sizes (in pixels)
  MIN_FONT_SIZE: 12,
  MIN_BODY_FONT_SIZE: 14,
  MIN_INTERACTIVE_FONT_SIZE: 16,
  
  // Minimum line heights
  MIN_LINE_HEIGHT_RATIO: 1.2,
  MIN_BODY_LINE_HEIGHT_RATIO: 1.4,
  MIN_READING_LINE_HEIGHT_RATIO: 1.5,
  
  // Minimum color contrast ratios
  MIN_CONTRAST_NORMAL: 4.5,
  MIN_CONTRAST_LARGE: 3.0,
  MIN_CONTRAST_AA: 4.5,
  MIN_CONTRAST_AAA: 7.0,
  
  // Large text threshold (18pt = 24px or 14pt bold = 18.67px)
  LARGE_TEXT_THRESHOLD: 24,
  LARGE_TEXT_BOLD_THRESHOLD: 18.67,
  
  // Touch target minimum size
  MIN_TOUCH_TARGET: 44
} as const;

/**
 * Font size to pixel conversion at base 16px
 */
const FONT_SIZE_PX_MAP: Record<FontSizeScale, { min: number; max: number }> = {
  caption: { min: 12, max: 14 },
  body: { min: 14, max: 16 },
  base: { min: 16, max: 18 },
  lead: { min: 18, max: 20 },
  lg: { min: 20, max: 22 },
  xl: { min: 22, max: 26 },
  '2xl': { min: 24, max: 30 },
  '3xl': { min: 30, max: 40 },
  '4xl': { min: 36, max: 54 },
  '5xl': { min: 44, max: 72 },
  '6xl': { min: 56, max: 96 },
  display: { min: 64, max: 128 }
};

/**
 * Line height numeric values
 */
const LINE_HEIGHT_VALUES: Record<LineHeightScale, number> = {
  tight: 1.1,
  snug: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8
};

// =============================================================================
// VALIDATION INTERFACES
// =============================================================================

export interface AccessibilityValidationResult {
  /** Whether the typography meets WCAG AA standards */
  meetsWCAG: boolean;
  /** Specific compliance level achieved */
  complianceLevel: 'AA' | 'AAA' | 'FAIL';
  /** List of accessibility issues found */
  issues: AccessibilityIssue[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** Overall score (0-100) */
  score: number;
}

export interface AccessibilityIssue {
  /** Type of accessibility issue */
  type: 'font-size' | 'line-height' | 'contrast' | 'touch-target' | 'semantic';
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
  /** Issue description */
  message: string;
  /** Current value that caused the issue */
  currentValue: string | number;
  /** Recommended value for compliance */
  recommendedValue: string | number;
  /** WCAG guideline reference */
  wcagReference: string;
}

export interface TypographyAccessibilityConfig {
  /** Font size in pixels */
  fontSize: number;
  /** Line height ratio */
  lineHeight: number;
  /** Is this interactive text? */
  interactive?: boolean;
  /** Is this body text for reading? */
  bodyText?: boolean;
  /** Font weight (affects large text threshold) */
  fontWeight?: number;
  /** Color contrast ratio */
  contrastRatio?: number;
}

// =============================================================================
// FONT SIZE VALIDATION
// =============================================================================

/**
 * Validates font size accessibility
 */
export function validateFontSizeAccessibility(
  fontSize: number,
  options: {
    interactive?: boolean;
    bodyText?: boolean;
    context?: string;
  } = {}
): AccessibilityValidationResult {
  const issues: AccessibilityIssue[] = [];
  const recommendations: string[] = [];
  
  // Check minimum font size
  if (fontSize < ACCESSIBILITY_STANDARDS.MIN_FONT_SIZE) {
    issues.push({
      type: 'font-size',
      severity: 'error',
      message: `Font size ${fontSize}px is below minimum readable size`,
      currentValue: fontSize,
      recommendedValue: ACCESSIBILITY_STANDARDS.MIN_FONT_SIZE,
      wcagReference: 'WCAG 2.1 Success Criterion 1.4.4 (Resize text)'
    });
    
    recommendations.push(
      `Increase font size to at least ${ACCESSIBILITY_STANDARDS.MIN_FONT_SIZE}px for readability`
    );
  }
  
  // Check body text minimum
  if (options.bodyText && fontSize < ACCESSIBILITY_STANDARDS.MIN_BODY_FONT_SIZE) {
    issues.push({
      type: 'font-size',
      severity: 'warning',
      message: `Body text font size ${fontSize}px is below recommended minimum`,
      currentValue: fontSize,
      recommendedValue: ACCESSIBILITY_STANDARDS.MIN_BODY_FONT_SIZE,
      wcagReference: 'WCAG 2.1 Success Criterion 1.4.8 (Visual Presentation)'
    });
    
    recommendations.push(
      `Use at least ${ACCESSIBILITY_STANDARDS.MIN_BODY_FONT_SIZE}px for body text for better readability`
    );
  }
  
  // Check interactive text minimum
  if (options.interactive && fontSize < ACCESSIBILITY_STANDARDS.MIN_INTERACTIVE_FONT_SIZE) {
    issues.push({
      type: 'touch-target',
      severity: 'warning',
      message: `Interactive text font size ${fontSize}px may be too small for touch targets`,
      currentValue: fontSize,
      recommendedValue: ACCESSIBILITY_STANDARDS.MIN_INTERACTIVE_FONT_SIZE,
      wcagReference: 'WCAG 2.1 Success Criterion 2.5.5 (Target Size)'
    });
    
    recommendations.push(
      `Use at least ${ACCESSIBILITY_STANDARDS.MIN_INTERACTIVE_FONT_SIZE}px for interactive elements`
    );
  }
  
  // Calculate score
  const score = calculateAccessibilityScore(issues);
  const complianceLevel = determineComplianceLevel(issues);
  
  return {
    meetsWCAG: issues.filter(i => i.severity === 'error').length === 0,
    complianceLevel,
    issues,
    recommendations,
    score
  };
}

/**
 * Validates typography scale accessibility
 */
export function validateFontScaleAccessibility(
  scale: FontSizeScale
): AccessibilityValidationResult {
  const sizeInfo = FONT_SIZE_PX_MAP[scale];
  const minSize = sizeInfo.min;
  const maxSize = sizeInfo.max;
  
  const issues: AccessibilityIssue[] = [];
  const recommendations: string[] = [];
  
  // Check if minimum size meets standards
  if (minSize < ACCESSIBILITY_STANDARDS.MIN_FONT_SIZE) {
    issues.push({
      type: 'font-size',
      severity: 'error',
      message: `Font scale "${scale}" minimum size ${minSize}px is below accessibility standards`,
      currentValue: minSize,
      recommendedValue: ACCESSIBILITY_STANDARDS.MIN_FONT_SIZE,
      wcagReference: 'WCAG 2.1 Success Criterion 1.4.4 (Resize text)'
    });
    
    recommendations.push(
      `Consider using "body" scale or larger for readable text`
    );
  }
  
  const score = calculateAccessibilityScore(issues);
  const complianceLevel = determineComplianceLevel(issues);
  
  return {
    meetsWCAG: issues.length === 0,
    complianceLevel,
    issues,
    recommendations,
    score
  };
}

// =============================================================================
// LINE HEIGHT VALIDATION
// =============================================================================

/**
 * Validates line height accessibility
 */
export function validateLineHeightAccessibility(
  lineHeight: number,
  fontSize: number,
  context: 'heading' | 'body' | 'ui' | 'reading' = 'body'
): AccessibilityValidationResult {
  const issues: AccessibilityIssue[] = [];
  const recommendations: string[] = [];
  
  const ratio = lineHeight / fontSize;
  
  // Determine minimum ratio based on context
  let minRatio: number;
  let contextName: string;
  
  switch (context) {
    case 'heading':
      minRatio = ACCESSIBILITY_STANDARDS.MIN_LINE_HEIGHT_RATIO;
      contextName = 'headings';
      break;
    case 'body':
    case 'ui':
      minRatio = ACCESSIBILITY_STANDARDS.MIN_BODY_LINE_HEIGHT_RATIO;
      contextName = 'body text';
      break;
    case 'reading':
      minRatio = ACCESSIBILITY_STANDARDS.MIN_READING_LINE_HEIGHT_RATIO;
      contextName = 'reading text';
      break;
  }
  
  if (ratio < minRatio) {
    issues.push({
      type: 'line-height',
      severity: ratio < 1.2 ? 'error' : 'warning',
      message: `Line height ratio ${ratio.toFixed(2)} is too tight for ${contextName}`,
      currentValue: ratio.toFixed(2),
      recommendedValue: minRatio,
      wcagReference: 'WCAG 2.1 Success Criterion 1.4.8 (Visual Presentation)'
    });
    
    recommendations.push(
      `Use line height ratio of at least ${minRatio} for ${contextName}`
    );
  }
  
  const score = calculateAccessibilityScore(issues);
  const complianceLevel = determineComplianceLevel(issues);
  
  return {
    meetsWCAG: issues.filter(i => i.severity === 'error').length === 0,
    complianceLevel,
    issues,
    recommendations,
    score
  };
}

/**
 * Validates line height scale accessibility
 */
export function validateLineHeightScaleAccessibility(
  scale: LineHeightScale,
  context: 'heading' | 'body' | 'ui' | 'reading' = 'body'
): AccessibilityValidationResult {
  const value = LINE_HEIGHT_VALUES[scale];
  
  // Use average font size for validation (16px)
  const averageFontSize = 16;
  const lineHeight = value * averageFontSize;
  
  return validateLineHeightAccessibility(lineHeight, averageFontSize, context);
}

// =============================================================================
// COLOR CONTRAST VALIDATION
// =============================================================================

/**
 * Validates color contrast accessibility
 */
export function validateColorContrastAccessibility(
  contrastRatio: number,
  fontSize: number,
  fontWeight: number = 400,
  level: 'AA' | 'AAA' = 'AA'
): AccessibilityValidationResult {
  const issues: AccessibilityIssue[] = [];
  const recommendations: string[] = [];
  
  // Determine if this is "large text"
  const isLargeText = (
    fontSize >= ACCESSIBILITY_STANDARDS.LARGE_TEXT_THRESHOLD ||
    (fontSize >= ACCESSIBILITY_STANDARDS.LARGE_TEXT_BOLD_THRESHOLD && fontWeight >= 700)
  );
  
  // Determine required contrast ratio
  let requiredRatio: number;
  if (level === 'AAA') {
    requiredRatio = isLargeText ? 4.5 : ACCESSIBILITY_STANDARDS.MIN_CONTRAST_AAA;
  } else {
    requiredRatio = isLargeText ? 
      ACCESSIBILITY_STANDARDS.MIN_CONTRAST_LARGE : 
      ACCESSIBILITY_STANDARDS.MIN_CONTRAST_AA;
  }
  
  if (contrastRatio < requiredRatio) {
    issues.push({
      type: 'contrast',
      severity: 'error',
      message: `Color contrast ratio ${contrastRatio.toFixed(1)}:1 is below ${level} standards`,
      currentValue: `${contrastRatio.toFixed(1)}:1`,
      recommendedValue: `${requiredRatio}:1`,
      wcagReference: `WCAG 2.1 Success Criterion 1.4.${level === 'AAA' ? '6' : '3'} (Contrast)`
    });
    
    recommendations.push(
      `Increase color contrast to at least ${requiredRatio}:1 for WCAG ${level} compliance`
    );
  }
  
  const score = calculateAccessibilityScore(issues);
  const complianceLevel = determineComplianceLevel(issues);
  
  return {
    meetsWCAG: issues.length === 0,
    complianceLevel,
    issues,
    recommendations,
    score
  };
}

// =============================================================================
// COMPREHENSIVE VALIDATION
// =============================================================================

/**
 * Comprehensive typography accessibility validation
 */
export function validateTypographyAccessibility(
  config: TypographyAccessibilityConfig
): AccessibilityValidationResult {
  const allIssues: AccessibilityIssue[] = [];
  const allRecommendations: string[] = [];
  
  // Validate font size
  const fontSizeResult = validateFontSizeAccessibility(config.fontSize, {
    interactive: config.interactive,
    bodyText: config.bodyText
  });
  allIssues.push(...fontSizeResult.issues);
  allRecommendations.push(...fontSizeResult.recommendations);
  
  // Validate line height
  const context = config.bodyText ? 'reading' : 
                  config.interactive ? 'ui' : 'body';
  const lineHeightResult = validateLineHeightAccessibility(
    config.lineHeight * config.fontSize,
    config.fontSize,
    context
  );
  allIssues.push(...lineHeightResult.issues);
  allRecommendations.push(...lineHeightResult.recommendations);
  
  // Validate color contrast if provided
  if (config.contrastRatio) {
    const contrastResult = validateColorContrastAccessibility(
      config.contrastRatio,
      config.fontSize,
      config.fontWeight || 400
    );
    allIssues.push(...contrastResult.issues);
    allRecommendations.push(...contrastResult.recommendations);
  }
  
  const score = calculateAccessibilityScore(allIssues);
  const complianceLevel = determineComplianceLevel(allIssues);
  
  return {
    meetsWCAG: allIssues.filter(i => i.severity === 'error').length === 0,
    complianceLevel,
    issues: allIssues,
    recommendations: [...new Set(allRecommendations)], // Remove duplicates
    score
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculates accessibility score based on issues
 */
function calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
  if (issues.length === 0) return 100;
  
  const errorPenalty = issues.filter(i => i.severity === 'error').length * 30;
  const warningPenalty = issues.filter(i => i.severity === 'warning').length * 15;
  const infoPenalty = issues.filter(i => i.severity === 'info').length * 5;
  
  const totalPenalty = errorPenalty + warningPenalty + infoPenalty;
  
  return Math.max(0, 100 - totalPenalty);
}

/**
 * Determines WCAG compliance level
 */
function determineComplianceLevel(issues: AccessibilityIssue[]): 'AA' | 'AAA' | 'FAIL' {
  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');
  
  if (hasErrors) return 'FAIL';
  if (hasWarnings) return 'AA';
  return 'AAA';
}

/**
 * Gets accessibility recommendations for a font size scale
 */
export function getAccessibilityRecommendation(
  scale: FontSizeScale
): string {
  const sizeInfo = FONT_SIZE_PX_MAP[scale];
  
  if (scale === 'caption') {
    return 'Use sparingly for supplementary information. Consider "body" scale for important content.';
  }
  
  if (sizeInfo.min >= ACCESSIBILITY_STANDARDS.MIN_BODY_FONT_SIZE) {
    return 'Excellent for readability and accessibility compliance.';
  }
  
  if (sizeInfo.min >= ACCESSIBILITY_STANDARDS.MIN_FONT_SIZE) {
    return 'Meets minimum accessibility standards. Consider larger for body text.';
  }
  
  return 'Below accessibility standards. Use larger scale for readable text.';
}

/**
 * Checks if a color combination meets contrast requirements
 */
export function checkColorAccessibility(
  foreground: string,
  background: string,
  fontSize: number = 16,
  fontWeight: number = 400
): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  recommendation: string;
} {
  // This would integrate with a color contrast calculation library
  // For now, return a mock implementation
  const mockRatio = 4.5; // This should be calculated from actual colors
  
  const isLargeText = (
    fontSize >= ACCESSIBILITY_STANDARDS.LARGE_TEXT_THRESHOLD ||
    (fontSize >= ACCESSIBILITY_STANDARDS.LARGE_TEXT_BOLD_THRESHOLD && fontWeight >= 700)
  );
  
  const aaThreshold = isLargeText ? 
    ACCESSIBILITY_STANDARDS.MIN_CONTRAST_LARGE : 
    ACCESSIBILITY_STANDARDS.MIN_CONTRAST_AA;
    
  const aaaThreshold = isLargeText ? 4.5 : ACCESSIBILITY_STANDARDS.MIN_CONTRAST_AAA;
  
  return {
    ratio: mockRatio,
    meetsAA: mockRatio >= aaThreshold,
    meetsAAA: mockRatio >= aaaThreshold,
    recommendation: mockRatio < aaThreshold ? 
      `Increase contrast to at least ${aaThreshold}:1` : 
      'Contrast meets accessibility standards'
  };
}

/**
 * Validates semantic HTML usage with typography
 */
export function validateSemanticUsage(
  element: string,
  typographyClass: string
): TokenValidationResult {
  const semanticRules: Record<string, string[]> = {
    h1: ['text-h1', 'text-display'],
    h2: ['text-h2'],
    h3: ['text-h3'],
    h4: ['text-h4'],
    h5: ['text-h5'],
    h6: ['text-h6'],
    p: ['text-body-normal', 'text-body-large', 'text-body-small'],
    label: ['text-label'],
    caption: ['text-caption']
  };
  
  const allowedClasses = semanticRules[element.toLowerCase()];
  
  if (!allowedClasses) {
    return {
      valid: true,
      error: undefined
    };
  }
  
  const isValid = allowedClasses.includes(typographyClass);
  
  return {
    valid: isValid,
    error: isValid ? undefined : 
      `Element <${element}> should use semantic typography class: ${allowedClasses.join(', ')}`,
    suggestion: isValid ? undefined : allowedClasses[0]
  };
}

// =============================================================================
// ACCESSIBILITY TESTING UTILITIES
// =============================================================================

/**
 * Tests all typography scales for accessibility
 */
export function testAllScalesAccessibility(): Record<FontSizeScale, AccessibilityValidationResult> {
  const results: Record<FontSizeScale, AccessibilityValidationResult> = {} as any;
  
  Object.keys(FONT_SIZE_PX_MAP).forEach((scale) => {
    results[scale as FontSizeScale] = validateFontScaleAccessibility(scale as FontSizeScale);
  });
  
  return results;
}

/**
 * Tests all line height scales for accessibility
 */
export function testAllLineHeightsAccessibility(): Record<LineHeightScale, AccessibilityValidationResult> {
  const results: Record<LineHeightScale, AccessibilityValidationResult> = {} as any;
  
  Object.keys(LINE_HEIGHT_VALUES).forEach((scale) => {
    results[scale as LineHeightScale] = validateLineHeightScaleAccessibility(
      scale as LineHeightScale
    );
  });
  
  return results;
}

/**
 * Generates an accessibility report for the entire typography system
 */
export function generateAccessibilityReport(): {
  overall: {
    score: number;
    complianceLevel: 'AA' | 'AAA' | 'FAIL';
    summary: string;
  };
  fontSizes: Record<FontSizeScale, AccessibilityValidationResult>;
  lineHeights: Record<LineHeightScale, AccessibilityValidationResult>;
  recommendations: string[];
} {
  const fontSizeResults = testAllScalesAccessibility();
  const lineHeightResults = testAllLineHeightsAccessibility();
  
  // Calculate overall metrics
  const allResults = [...Object.values(fontSizeResults), ...Object.values(lineHeightResults)];
  const overallScore = allResults.reduce((sum, result) => sum + result.score, 0) / allResults.length;
  
  const hasErrors = allResults.some(result => 
    result.issues.some(issue => issue.severity === 'error')
  );
  const hasWarnings = allResults.some(result => 
    result.issues.some(issue => issue.severity === 'warning')
  );
  
  const complianceLevel = hasErrors ? 'FAIL' : hasWarnings ? 'AA' : 'AAA';
  
  // Collect all recommendations
  const allRecommendations = allResults.flatMap(result => result.recommendations);
  const uniqueRecommendations = [...new Set(allRecommendations)];
  
  return {
    overall: {
      score: Math.round(overallScore),
      complianceLevel,
      summary: `Typography system ${complianceLevel === 'FAIL' ? 'fails' : 'meets'} WCAG ${complianceLevel} standards with ${Math.round(overallScore)}% compliance score`
    },
    fontSizes: fontSizeResults,
    lineHeights: lineHeightResults,
    recommendations: uniqueRecommendations
  };
}