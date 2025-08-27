/**
 * Typography Token System - Main Export
 * Bitcoin Benefit Platform
 * 
 * Main entry point for the typography token system.
 * Exports all tokens, utilities, and type definitions.
 */

// Export all type definitions
export * from '@/types/typography';

// Export all token definitions and mapping functions
export * from './tokens';

// Export all utility functions
export * from './utils';

// Re-export commonly used items for convenience
export {
  TYPOGRAPHY_SYSTEM,
  FONT_SIZE_TOKENS,
  LINE_HEIGHT_TOKENS,
  FONT_WEIGHT_TOKENS,
  LETTER_SPACING_TOKENS,
  FONT_FAMILY_TOKENS,
  TEXT_COLOR_TOKENS,
  BRAND_COLOR_TOKENS,
  HEADING_TYPOGRAPHY,
  BODY_TYPOGRAPHY,
  SPECIAL_TYPOGRAPHY,
  getFontSizeVar,
  getLineHeightVar,
  getFontWeightVar,
  semanticToCSSProperties
} from './tokens';

export {
  isValidFontSizeScale,
  validateTypographyToken,
  remToPixels,
  pixelsToRem,
  getColorForTheme,
  createTypographyRuntimeConfig,
  checkTextSizeAccessibility
} from './utils';