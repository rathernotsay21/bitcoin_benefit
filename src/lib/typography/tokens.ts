/**
 * Typography Token System - Token Definitions and Mappings
 * Bitcoin Benefit Platform
 * 
 * Complete token definitions that map directly to CSS custom properties.
 * Provides the single source of truth for all typography values.
 */

import type {
  TypographySystem,
  TypographyScale,
  FontSizeToken,
  LineHeightToken,
  FontWeightToken,
  LetterSpacingToken,
  FontFamilyToken,
  ColorToken,
  TextShadowToken,
  SemanticTypography,
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
  ContainerQueryBreakpoints,
  CSSCustomProperty,
  CSSValue
} from '@/types/typography';

// =============================================================================
// BASE SCALE CONFIGURATION
// =============================================================================

/**
 * Modular scale configuration matching CSS implementation
 */
export const TYPOGRAPHY_SCALE: TypographyScale = {
  ratio: 1.333, // Perfect fourth ratio for mathematical harmony
  base: 16,     // Base font size in pixels
  viewportMin: 320,  // Minimum viewport width
  viewportMax: 1440, // Maximum viewport width
} as const;

// =============================================================================
// FONT SIZE TOKENS
// =============================================================================

/**
 * Font size tokens with fluid calculations matching CSS custom properties
 */
export const FONT_SIZE_TOKENS: Record<FontSizeScale, FontSizeToken> = {
  caption: {
    scale: 'caption',
    cssVar: '--font-size-caption',
    min: '0.75rem',
    max: '0.875rem',
    fluid: 'clamp(0.75rem, 0.6875rem + 0.3125vw, 0.875rem)',
    pixels: { min: 12, max: 14 }
  },
  body: {
    scale: 'body',
    cssVar: '--font-size-body',
    min: '0.875rem',
    max: '1rem',
    fluid: 'clamp(0.875rem, 0.8125rem + 0.3125vw, 1rem)',
    pixels: { min: 14, max: 16 }
  },
  base: {
    scale: 'base',
    cssVar: '--font-size-base',
    min: '1rem',
    max: '1.125rem',
    fluid: 'clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)',
    pixels: { min: 16, max: 18 }
  },
  lead: {
    scale: 'lead',
    cssVar: '--font-size-lead',
    min: '1.125rem',
    max: '1.25rem',
    fluid: 'clamp(1.125rem, 1.0625rem + 0.3125vw, 1.25rem)',
    pixels: { min: 18, max: 20 }
  },
  lg: {
    scale: 'lg',
    cssVar: '--font-size-lg',
    min: '1.25rem',
    max: '1.375rem',
    fluid: 'clamp(1.25rem, 1.1875rem + 0.3125vw, 1.375rem)',
    pixels: { min: 20, max: 22 }
  },
  xl: {
    scale: 'xl',
    cssVar: '--font-size-xl',
    min: '1.375rem',
    max: '1.625rem',
    fluid: 'clamp(1.375rem, 1.25rem + 0.625vw, 1.625rem)',
    pixels: { min: 22, max: 26 }
  },
  '2xl': {
    scale: '2xl',
    cssVar: '--font-size-2xl',
    min: '1.5rem',
    max: '1.875rem',
    fluid: 'clamp(1.5rem, 1.3125rem + 0.9375vw, 1.875rem)',
    pixels: { min: 24, max: 30 }
  },
  '3xl': {
    scale: '3xl',
    cssVar: '--font-size-3xl',
    min: '1.875rem',
    max: '2.5rem',
    fluid: 'clamp(1.875rem, 1.625rem + 1.25vw, 2.5rem)',
    pixels: { min: 30, max: 40 }
  },
  '4xl': {
    scale: '4xl',
    cssVar: '--font-size-4xl',
    min: '2.25rem',
    max: '3.375rem',
    fluid: 'clamp(2.25rem, 1.875rem + 1.875vw, 3.375rem)',
    pixels: { min: 36, max: 54 }
  },
  '5xl': {
    scale: '5xl',
    cssVar: '--font-size-5xl',
    min: '2.75rem',
    max: '4.5rem',
    fluid: 'clamp(2.75rem, 2.25rem + 2.5vw, 4.5rem)',
    pixels: { min: 44, max: 72 }
  },
  '6xl': {
    scale: '6xl',
    cssVar: '--font-size-6xl',
    min: '3.5rem',
    max: '6rem',
    fluid: 'clamp(3.5rem, 2.75rem + 3.75vw, 6rem)',
    pixels: { min: 56, max: 96 }
  },
  display: {
    scale: 'display',
    cssVar: '--font-size-display',
    min: '4rem',
    max: '8rem',
    fluid: 'clamp(4rem, 3rem + 5vw, 8rem)',
    pixels: { min: 64, max: 128 }
  }
} as const;

// =============================================================================
// LINE HEIGHT TOKENS
// =============================================================================

/**
 * Line height tokens with contextual information
 */
export const LINE_HEIGHT_TOKENS: Record<LineHeightScale, LineHeightToken> = {
  tight: {
    scale: 'tight',
    cssVar: '--line-height-tight',
    value: 1.1,
    context: 'Headlines and display text'
  },
  snug: {
    scale: 'snug',
    cssVar: '--line-height-snug',
    value: 1.2,
    context: 'Sub-headlines and large text'
  },
  normal: {
    scale: 'normal',
    cssVar: '--line-height-normal',
    value: 1.4,
    context: 'UI text and labels'
  },
  relaxed: {
    scale: 'relaxed',
    cssVar: '--line-height-relaxed',
    value: 1.6,
    context: 'Body text and readable content'
  },
  loose: {
    scale: 'loose',
    cssVar: '--line-height-loose',
    value: 1.8,
    context: 'Long-form reading text'
  }
} as const;

// =============================================================================
// FONT WEIGHT TOKENS
// =============================================================================

/**
 * Font weight tokens covering full spectrum
 */
export const FONT_WEIGHT_TOKENS: Record<FontWeightScale, FontWeightToken> = {
  thin: {
    scale: 'thin',
    cssVar: '--font-weight-thin',
    value: 100
  },
  extralight: {
    scale: 'extralight',
    cssVar: '--font-weight-extralight',
    value: 200
  },
  light: {
    scale: 'light',
    cssVar: '--font-weight-light',
    value: 300
  },
  normal: {
    scale: 'normal',
    cssVar: '--font-weight-normal',
    value: 400
  },
  medium: {
    scale: 'medium',
    cssVar: '--font-weight-medium',
    value: 500
  },
  semibold: {
    scale: 'semibold',
    cssVar: '--font-weight-semibold',
    value: 600
  },
  bold: {
    scale: 'bold',
    cssVar: '--font-weight-bold',
    value: 700
  },
  extrabold: {
    scale: 'extrabold',
    cssVar: '--font-weight-extrabold',
    value: 800
  },
  black: {
    scale: 'black',
    cssVar: '--font-weight-black',
    value: 900
  }
} as const;

// =============================================================================
// LETTER SPACING TOKENS
// =============================================================================

/**
 * Letter spacing tokens for fine typography control
 */
export const LETTER_SPACING_TOKENS: Record<LetterSpacingScale, LetterSpacingToken> = {
  tighter: {
    scale: 'tighter',
    cssVar: '--letter-spacing-tighter',
    value: '-0.05em'
  },
  tight: {
    scale: 'tight',
    cssVar: '--letter-spacing-tight',
    value: '-0.025em'
  },
  normal: {
    scale: 'normal',
    cssVar: '--letter-spacing-normal',
    value: '0'
  },
  wide: {
    scale: 'wide',
    cssVar: '--letter-spacing-wide',
    value: '0.025em'
  },
  wider: {
    scale: 'wider',
    cssVar: '--letter-spacing-wider',
    value: '0.05em'
  },
  widest: {
    scale: 'widest',
    cssVar: '--letter-spacing-widest',
    value: '0.1em'
  }
} as const;

// =============================================================================
// FONT FAMILY TOKENS
// =============================================================================

/**
 * Font family tokens with complete fallback stacks
 */
export const FONT_FAMILY_TOKENS: Record<FontFamily, FontFamilyToken> = {
  sans: {
    family: 'sans',
    cssVar: '--font-family-sans',
    stack: "'Inter Variable', 'Inter', system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    primary: 'Inter Variable'
  },
  mono: {
    family: 'mono',
    cssVar: '--font-family-mono',
    stack: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace",
    primary: 'SF Mono'
  },
  display: {
    family: 'display',
    cssVar: '--font-family-display',
    stack: 'var(--font-family-sans)',
    primary: 'Inter Variable'
  }
} as const;

// =============================================================================
// COLOR TOKENS
// =============================================================================

/**
 * Semantic text color tokens with theme variations
 */
export const TEXT_COLOR_TOKENS: Record<TextColor, ColorToken> = {
  primary: {
    color: 'primary',
    cssVar: '--text-primary',
    values: {
      light: 'hsl(210, 15%, 15%)',
      dark: 'hsl(210, 15%, 95%)',
      highContrast: {
        light: 'hsl(0, 0%, 0%)',
        dark: 'hsl(0, 0%, 100%)'
      }
    }
  },
  secondary: {
    color: 'secondary',
    cssVar: '--text-secondary',
    values: {
      light: 'hsl(210, 10%, 35%)',
      dark: 'hsl(210, 10%, 80%)',
      highContrast: {
        light: 'hsl(0, 0%, 20%)',
        dark: 'hsl(0, 0%, 90%)'
      }
    }
  },
  muted: {
    color: 'muted',
    cssVar: '--text-muted',
    values: {
      light: 'hsl(210, 8%, 55%)',
      dark: 'hsl(210, 8%, 65%)',
      highContrast: {
        light: 'hsl(0, 0%, 40%)',
        dark: 'hsl(0, 0%, 80%)'
      }
    }
  },
  subtle: {
    color: 'subtle',
    cssVar: '--text-subtle',
    values: {
      light: 'hsl(210, 6%, 70%)',
      dark: 'hsl(210, 6%, 50%)',
      highContrast: {
        light: 'hsl(0, 0%, 60%)',
        dark: 'hsl(0, 0%, 70%)'
      }
    }
  },
  inverse: {
    color: 'inverse',
    cssVar: '--text-inverse',
    values: {
      light: 'hsl(0, 0%, 100%)',
      dark: 'hsl(210, 15%, 15%)',
      highContrast: {
        light: 'hsl(0, 0%, 100%)',
        dark: 'hsl(0, 0%, 0%)'
      }
    }
  }
} as const;

/**
 * Brand color tokens with theme variations
 */
export const BRAND_COLOR_TOKENS: Record<BrandColor, ColorToken> = {
  bitcoin: {
    color: 'bitcoin',
    cssVar: '--text-bitcoin',
    values: {
      light: 'hsl(42, 100%, 49%)',
      dark: 'hsl(42, 100%, 55%)',
      highContrast: {
        light: 'hsl(42, 100%, 40%)',
        dark: 'hsl(42, 100%, 60%)'
      }
    }
  },
  'bitcoin-dark': {
    color: 'bitcoin-dark',
    cssVar: '--text-bitcoin-dark',
    values: {
      light: 'hsl(35, 85%, 45%)',
      dark: 'hsl(35, 85%, 50%)',
      highContrast: {
        light: 'hsl(35, 85%, 35%)',
        dark: 'hsl(35, 85%, 55%)'
      }
    }
  },
  accent: {
    color: 'accent',
    cssVar: '--text-accent',
    values: {
      light: 'hsl(217, 91%, 60%)',
      dark: 'hsl(217, 91%, 65%)',
      highContrast: {
        light: 'hsl(217, 91%, 45%)',
        dark: 'hsl(217, 91%, 70%)'
      }
    }
  },
  success: {
    color: 'success',
    cssVar: '--text-success',
    values: {
      light: 'hsl(142, 71%, 45%)',
      dark: 'hsl(142, 71%, 55%)',
      highContrast: {
        light: 'hsl(142, 71%, 35%)',
        dark: 'hsl(142, 71%, 65%)'
      }
    }
  },
  warning: {
    color: 'warning',
    cssVar: '--text-warning',
    values: {
      light: 'hsl(45, 93%, 47%)',
      dark: 'hsl(45, 93%, 57%)',
      highContrast: {
        light: 'hsl(45, 93%, 37%)',
        dark: 'hsl(45, 93%, 67%)'
      }
    }
  },
  error: {
    color: 'error',
    cssVar: '--text-error',
    values: {
      light: 'hsl(0, 84%, 60%)',
      dark: 'hsl(0, 84%, 70%)',
      highContrast: {
        light: 'hsl(0, 84%, 50%)',
        dark: 'hsl(0, 84%, 80%)'
      }
    }
  }
} as const;

// =============================================================================
// TEXT SHADOW TOKENS
// =============================================================================

/**
 * Text shadow tokens for depth and emphasis
 */
export const TEXT_SHADOW_TOKENS: Record<TextShadow, TextShadowToken> = {
  sm: {
    shadow: 'sm',
    cssVar: '--text-shadow-sm',
    value: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  md: {
    shadow: 'md',
    cssVar: '--text-shadow-md',
    value: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  lg: {
    shadow: 'lg',
    cssVar: '--text-shadow-lg',
    value: '0 4px 8px rgba(0, 0, 0, 0.15)'
  }
} as const;

// =============================================================================
// SEMANTIC TYPOGRAPHY DEFINITIONS
// =============================================================================

/**
 * Heading typography definitions matching CSS implementation
 */
export const HEADING_TYPOGRAPHY: Record<HeadingLevel, SemanticTypography> = {
  display: {
    fontSize: 'display',
    fontWeight: 'bold',
    lineHeight: 'tight',
    letterSpacing: 'tight',
    color: 'primary'
  },
  h1: {
    fontSize: '6xl',
    fontWeight: 'bold',
    lineHeight: 'tight',
    letterSpacing: 'tight',
    color: 'primary'
  },
  h2: {
    fontSize: '5xl',
    fontWeight: 'bold',
    lineHeight: 'tight',
    letterSpacing: 'tight',
    color: 'primary'
  },
  h3: {
    fontSize: '4xl',
    fontWeight: 'semibold',
    lineHeight: 'snug',
    letterSpacing: 'tight',
    color: 'primary'
  },
  h4: {
    fontSize: '3xl',
    fontWeight: 'semibold',
    lineHeight: 'snug',
    color: 'primary'
  },
  h5: {
    fontSize: '2xl',
    fontWeight: 'medium',
    lineHeight: 'snug',
    color: 'primary'
  },
  h6: {
    fontSize: 'xl',
    fontWeight: 'medium',
    lineHeight: 'normal',
    color: 'primary'
  }
} as const;

/**
 * Body text typography definitions
 */
export const BODY_TYPOGRAPHY: Record<BodyTextVariant, SemanticTypography> = {
  large: {
    fontSize: 'lead',
    fontWeight: 'normal',
    lineHeight: 'relaxed',
    color: 'secondary'
  },
  normal: {
    fontSize: 'base',
    fontWeight: 'normal',
    lineHeight: 'relaxed',
    color: 'secondary'
  },
  small: {
    fontSize: 'body',
    fontWeight: 'normal',
    lineHeight: 'normal',
    color: 'muted'
  }
} as const;

/**
 * Special text style typography definitions
 */
export const SPECIAL_TYPOGRAPHY: Record<SpecialTextStyle, SemanticTypography> = {
  label: {
    fontSize: 'body',
    fontWeight: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'wide',
    color: 'primary'
  },
  caption: {
    fontSize: 'caption',
    fontWeight: 'medium',
    lineHeight: 'normal',
    color: 'muted'
  },
  overline: {
    fontSize: 'caption',
    fontWeight: 'bold',
    lineHeight: 'normal',
    letterSpacing: 'widest',
    color: 'muted',
    additionalStyles: {
      textTransform: 'uppercase'
    }
  },
  'bitcoin-symbol': {
    fontSize: 'base',
    fontWeight: 'normal',
    lineHeight: 'normal',
    color: 'bitcoin',
    additionalStyles: {
      fontFeatureSettings: '"liga" on, "kern" on',
      fontVariantLigatures: 'common-ligatures'
    }
  },
  'bitcoin-amount': {
    fontSize: 'base',
    fontWeight: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'wide',
    color: 'bitcoin',
    fontFamily: 'mono',
    additionalStyles: {
      fontVariantNumeric: 'tabular-nums',
      fontFeatureSettings: '"tnum" on'
    }
  }
} as const;

// =============================================================================
// CONTAINER QUERY BREAKPOINTS
// =============================================================================

/**
 * Container query breakpoints for responsive typography
 */
export const CONTAINER_BREAKPOINTS: ContainerQueryBreakpoints = {
  xs: '20rem',   // 320px
  sm: '24rem',   // 384px
  md: '28rem',   // 448px
  lg: '32rem',   // 512px
  xl: '36rem',   // 576px
  '2xl': '42rem' // 672px
} as const;

// =============================================================================
// COMPLETE TYPOGRAPHY SYSTEM
// =============================================================================

/**
 * Complete typography system combining all tokens and definitions
 */
export const TYPOGRAPHY_SYSTEM: TypographySystem = {
  scale: TYPOGRAPHY_SCALE,
  fontSizes: FONT_SIZE_TOKENS,
  lineHeights: LINE_HEIGHT_TOKENS,
  fontWeights: FONT_WEIGHT_TOKENS,
  letterSpacings: LETTER_SPACING_TOKENS,
  fontFamilies: FONT_FAMILY_TOKENS,
  colors: {
    text: TEXT_COLOR_TOKENS,
    brand: BRAND_COLOR_TOKENS
  },
  textShadows: TEXT_SHADOW_TOKENS,
  semantic: {
    headings: HEADING_TYPOGRAPHY,
    body: BODY_TYPOGRAPHY,
    special: SPECIAL_TYPOGRAPHY
  }
} as const;

// =============================================================================
// TOKEN MAPPING FUNCTIONS
// =============================================================================

/**
 * Get CSS custom property value for a font size token
 */
export function getFontSizeVar(scale: FontSizeScale): CSSCustomProperty {
  return FONT_SIZE_TOKENS[scale].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a line height token
 */
export function getLineHeightVar(scale: LineHeightScale): CSSCustomProperty {
  return LINE_HEIGHT_TOKENS[scale].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a font weight token
 */
export function getFontWeightVar(scale: FontWeightScale): CSSCustomProperty {
  return FONT_WEIGHT_TOKENS[scale].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a letter spacing token
 */
export function getLetterSpacingVar(scale: LetterSpacingScale): CSSCustomProperty {
  return LETTER_SPACING_TOKENS[scale].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a font family token
 */
export function getFontFamilyVar(family: FontFamily): CSSCustomProperty {
  return FONT_FAMILY_TOKENS[family].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a text color token
 */
export function getTextColorVar(color: TextColor): CSSCustomProperty {
  return TEXT_COLOR_TOKENS[color].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a brand color token
 */
export function getBrandColorVar(color: BrandColor): CSSCustomProperty {
  return BRAND_COLOR_TOKENS[color].cssVar as CSSCustomProperty;
}

/**
 * Get CSS custom property value for a text shadow token
 */
export function getTextShadowVar(shadow: TextShadow): CSSCustomProperty {
  return TEXT_SHADOW_TOKENS[shadow].cssVar as CSSCustomProperty;
}

/**
 * Convert semantic typography to CSS properties object
 */
export function semanticToCSSProperties(semantic: SemanticTypography): Record<string, CSSValue> {
  const properties: Record<string, CSSValue> = {
    fontSize: `var(${getFontSizeVar(semantic.fontSize)})`,
    fontWeight: `var(${getFontWeightVar(semantic.fontWeight)})`,
    lineHeight: `var(${getLineHeightVar(semantic.lineHeight)})`
  };

  if (semantic.letterSpacing) {
    properties.letterSpacing = `var(${getLetterSpacingVar(semantic.letterSpacing)})`;
  }

  if (semantic.fontFamily) {
    properties.fontFamily = `var(${getFontFamilyVar(semantic.fontFamily)})`;
  }

  // Handle color based on type
  if (semantic.color in TEXT_COLOR_TOKENS) {
    properties.color = `var(${getTextColorVar(semantic.color as TextColor)})`;
  } else if (semantic.color in BRAND_COLOR_TOKENS) {
    properties.color = `var(${getBrandColorVar(semantic.color as BrandColor)})`;
  }

  // Add additional styles if present
  if (semantic.additionalStyles) {
    Object.assign(properties, semantic.additionalStyles);
  }

  return properties;
}

/**
 * Get all CSS custom property names as an array
 */
export function getAllCSSCustomProperties(): CSSCustomProperty[] {
  const properties: CSSCustomProperty[] = [];

  // Font size properties
  Object.values(FONT_SIZE_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Line height properties
  Object.values(LINE_HEIGHT_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Font weight properties
  Object.values(FONT_WEIGHT_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Letter spacing properties
  Object.values(LETTER_SPACING_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Font family properties
  Object.values(FONT_FAMILY_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Text color properties
  Object.values(TEXT_COLOR_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Brand color properties
  Object.values(BRAND_COLOR_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  // Text shadow properties
  Object.values(TEXT_SHADOW_TOKENS).forEach(token => {
    properties.push(token.cssVar as CSSCustomProperty);
  });

  return properties;
}

/**
 * Create a CSS custom properties object for runtime injection
 */
export function createCSSCustomPropertiesObject(): Record<string, string> {
  const properties: Record<string, string> = {};

  // Add font size properties
  Object.values(FONT_SIZE_TOKENS).forEach(token => {
    properties[token.cssVar] = token.fluid;
  });

  // Add line height properties
  Object.values(LINE_HEIGHT_TOKENS).forEach(token => {
    properties[token.cssVar] = token.value.toString();
  });

  // Add font weight properties
  Object.values(FONT_WEIGHT_TOKENS).forEach(token => {
    properties[token.cssVar] = token.value.toString();
  });

  // Add letter spacing properties
  Object.values(LETTER_SPACING_TOKENS).forEach(token => {
    properties[token.cssVar] = token.value;
  });

  // Add font family properties
  Object.values(FONT_FAMILY_TOKENS).forEach(token => {
    properties[token.cssVar] = token.stack;
  });

  // Add text shadow properties
  Object.values(TEXT_SHADOW_TOKENS).forEach(token => {
    properties[token.cssVar] = token.value;
  });

  return properties;
}