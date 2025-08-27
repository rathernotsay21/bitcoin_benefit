/**
 * Typography Token System - Type Definitions
 * Bitcoin Benefit Platform
 * 
 * Complete TypeScript interfaces for typography tokens that map to CSS custom properties.
 * Provides full type safety for all typography values with theme variations support.
 */

// =============================================================================
// BASE TYPOGRAPHY SYSTEM TYPES
// =============================================================================

/**
 * Modular scale configuration for mathematical harmony
 */
export interface TypographyScale {
  /** Scale ratio for mathematical progression (default: 1.333 - Perfect Fourth) */
  ratio: number;
  /** Base font size in pixels */
  base: number;
  /** Minimum viewport width for fluid calculations */
  viewportMin: number;
  /** Maximum viewport width for fluid calculations */
  viewportMax: number;
}

/**
 * Font size scale with fluid calculations
 */
export type FontSizeScale = 
  | 'caption'   // 12-14px
  | 'body'      // 14-16px
  | 'base'      // 16-18px
  | 'lead'      // 18-20px
  | 'lg'        // 20-22px
  | 'xl'        // 22-26px
  | '2xl'       // 24-30px
  | '3xl'       // 30-40px
  | '4xl'       // 36-54px
  | '5xl'       // 44-72px
  | '6xl'       // 56-96px
  | 'display';  // 64-128px

/**
 * Line height scale for different text contexts
 */
export type LineHeightScale = 
  | 'tight'     // 1.1 - Headlines
  | 'snug'      // 1.2 - Sub-headlines
  | 'normal'    // 1.4 - UI text
  | 'relaxed'   // 1.6 - Body text
  | 'loose';    // 1.8 - Reading text

/**
 * Font weight scale from thin to black
 */
export type FontWeightScale = 
  | 'thin'        // 100
  | 'extralight'  // 200
  | 'light'       // 300
  | 'normal'      // 400
  | 'medium'      // 500
  | 'semibold'    // 600
  | 'bold'        // 700
  | 'extrabold'   // 800
  | 'black';      // 900

/**
 * Letter spacing scale for different text styles
 */
export type LetterSpacingScale = 
  | 'tighter'   // -0.05em
  | 'tight'     // -0.025em
  | 'normal'    // 0
  | 'wide'      // 0.025em
  | 'wider'     // 0.05em
  | 'widest';   // 0.1em

/**
 * Font family definitions with fallbacks
 */
export type FontFamily = 
  | 'sans'      // Inter Variable with system fallbacks
  | 'mono'      // SF Mono with monospace fallbacks
  | 'display';  // Display font (currently same as sans)

// =============================================================================
// COLOR SYSTEM TYPES
// =============================================================================

/**
 * Semantic text colors that adapt to themes
 */
export type TextColor = 
  | 'primary'     // Primary text color
  | 'secondary'   // Secondary text color
  | 'muted'       // Muted text color
  | 'subtle'      // Subtle text color
  | 'inverse';    // Inverse text color (for dark backgrounds)

/**
 * Brand-specific colors for Bitcoin platform
 */
export type BrandColor = 
  | 'bitcoin'      // Bitcoin orange (#f2a900)
  | 'bitcoin-dark' // Darker Bitcoin orange
  | 'accent'       // Blue accent (#3b82f6)
  | 'success'      // Success green
  | 'warning'      // Warning yellow
  | 'error';       // Error red

/**
 * Text shadow scales for depth and emphasis
 */
export type TextShadow = 
  | 'sm'  // Subtle shadow
  | 'md'  // Medium shadow
  | 'lg'; // Large shadow

/**
 * Theme variations supported by the system
 */
export type ThemeMode = 
  | 'light'          // Standard light mode
  | 'dark'           // Dark mode
  | 'high-contrast'; // High contrast mode

// =============================================================================
// TYPOGRAPHY TOKEN INTERFACES
// =============================================================================

/**
 * Complete font size token definition with CSS custom property mapping
 */
export interface FontSizeToken {
  /** Token identifier */
  scale: FontSizeScale;
  /** CSS custom property name */
  cssVar: string;
  /** Minimum size (mobile) in rem */
  min: string;
  /** Maximum size (desktop) in rem */
  max: string;
  /** Fluid CSS clamp() value */
  fluid: string;
  /** Pixel equivalents for reference */
  pixels: {
    min: number;
    max: number;
  };
}

/**
 * Line height token with contextual information
 */
export interface LineHeightToken {
  /** Token identifier */
  scale: LineHeightScale;
  /** CSS custom property name */
  cssVar: string;
  /** Numeric line height value */
  value: number;
  /** Usage context description */
  context: string;
}

/**
 * Font weight token definition
 */
export interface FontWeightToken {
  /** Token identifier */
  scale: FontWeightScale;
  /** CSS custom property name */
  cssVar: string;
  /** Numeric font weight value */
  value: number;
}

/**
 * Letter spacing token definition
 */
export interface LetterSpacingToken {
  /** Token identifier */
  scale: LetterSpacingScale;
  /** CSS custom property name */
  cssVar: string;
  /** Em-based spacing value */
  value: string;
}

/**
 * Font family token with complete fallback chain
 */
export interface FontFamilyToken {
  /** Token identifier */
  family: FontFamily;
  /** CSS custom property name */
  cssVar: string;
  /** Complete font stack with fallbacks */
  stack: string;
  /** Primary font name */
  primary: string;
}

/**
 * Color token that adapts to theme variations
 */
export interface ColorToken {
  /** Token identifier */
  color: TextColor | BrandColor;
  /** CSS custom property name */
  cssVar: string;
  /** HSL color values for each theme */
  values: {
    light: string;
    dark: string;
    highContrast: {
      light: string;
      dark: string;
    };
  };
}

/**
 * Text shadow token definition
 */
export interface TextShadowToken {
  /** Token identifier */
  shadow: TextShadow;
  /** CSS custom property name */
  cssVar: string;
  /** CSS box-shadow value */
  value: string;
}

// =============================================================================
// SEMANTIC TYPOGRAPHY TYPES
// =============================================================================

/**
 * Heading hierarchy levels
 */
export type HeadingLevel = 
  | 'display' // Hero/display headings
  | 'h1'      // Primary headings
  | 'h2'      // Secondary headings  
  | 'h3'      // Tertiary headings
  | 'h4'      // Quaternary headings
  | 'h5'      // Quinary headings
  | 'h6';     // Senary headings

/**
 * Body text variants
 */
export type BodyTextVariant = 
  | 'large'   // Large body text for emphasis
  | 'normal'  // Standard body text
  | 'small';  // Small body text for secondary info

/**
 * Specialized text styles
 */
export type SpecialTextStyle = 
  | 'label'    // Form labels and UI labels
  | 'caption'  // Image captions and metadata
  | 'overline' // Uppercase section labels
  | 'bitcoin-symbol' // Bitcoin symbol with ligatures
  | 'bitcoin-amount'; // Tabular numbers for amounts

/**
 * Complete semantic typography definition
 */
export interface SemanticTypography {
  /** Font size scale */
  fontSize: FontSizeScale;
  /** Font weight */
  fontWeight: FontWeightScale;
  /** Line height */
  lineHeight: LineHeightScale;
  /** Letter spacing (optional) */
  letterSpacing?: LetterSpacingScale;
  /** Text color */
  color: TextColor | BrandColor;
  /** Font family (defaults to sans) */
  fontFamily?: FontFamily;
  /** Additional CSS properties */
  additionalStyles?: Record<string, string>;
}

// =============================================================================
// TYPOGRAPHY SYSTEM CONFIGURATION
// =============================================================================

/**
 * Complete typography system configuration
 */
export interface TypographySystem {
  /** Scale configuration */
  scale: TypographyScale;
  
  /** Font size tokens */
  fontSizes: Record<FontSizeScale, FontSizeToken>;
  
  /** Line height tokens */
  lineHeights: Record<LineHeightScale, LineHeightToken>;
  
  /** Font weight tokens */
  fontWeights: Record<FontWeightScale, FontWeightToken>;
  
  /** Letter spacing tokens */
  letterSpacings: Record<LetterSpacingScale, LetterSpacingToken>;
  
  /** Font family tokens */
  fontFamilies: Record<FontFamily, FontFamilyToken>;
  
  /** Color tokens */
  colors: {
    text: Record<TextColor, ColorToken>;
    brand: Record<BrandColor, ColorToken>;
  };
  
  /** Text shadow tokens */
  textShadows: Record<TextShadow, TextShadowToken>;
  
  /** Semantic typography definitions */
  semantic: {
    headings: Record<HeadingLevel, SemanticTypography>;
    body: Record<BodyTextVariant, SemanticTypography>;
    special: Record<SpecialTextStyle, SemanticTypography>;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * CSS custom property name type for type safety
 */
export type CSSCustomProperty = `--${string}`;

/**
 * CSS value type for typography properties
 */
export type CSSValue = string | number;

/**
 * Typography token validation result
 */
export interface TokenValidationResult {
  /** Whether the token is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Suggested correction if available */
  suggestion?: string;
}

/**
 * Runtime typography configuration options
 */
export interface TypographyRuntimeConfig {
  /** Enable responsive scaling */
  enableFluidTypography: boolean;
  /** Enable high contrast mode detection */
  enableHighContrastMode: boolean;
  /** Enable reduced motion support */
  enableReducedMotionSupport: boolean;
  /** Container query support */
  enableContainerQueries: boolean;
  /** Print optimization */
  enablePrintOptimization: boolean;
}

/**
 * Typography metrics for performance monitoring
 */
export interface TypographyMetrics {
  /** Font loading time */
  fontLoadTime: number;
  /** Layout shift caused by typography */
  cumulativeLayoutShift: number;
  /** Typography-related bundle size */
  bundleSize: number;
  /** CSS custom properties count */
  customPropertiesCount: number;
}

// =============================================================================
// BITCOIN-SPECIFIC TYPOGRAPHY TYPES
// =============================================================================

/**
 * Bitcoin amount formatting options
 */
export interface BitcoinAmountFormatting {
  /** Use tabular numbers */
  tabularNums: boolean;
  /** Letter spacing for better readability */
  letterSpacing: LetterSpacingScale;
  /** Font weight for emphasis */
  fontWeight: FontWeightScale;
  /** Color theme */
  color: BrandColor;
}

/**
 * Bitcoin symbol rendering options
 */
export interface BitcoinSymbolFormatting {
  /** Enable font ligatures */
  enableLigatures: boolean;
  /** Enable kerning */
  enableKerning: boolean;
  /** Font variant settings */
  fontVariant: string;
}

/**
 * Financial data display formatting
 */
export interface FinancialDataFormatting extends BitcoinAmountFormatting {
  /** Decimal precision */
  precision: number;
  /** Use scientific notation for large numbers */
  useScientificNotation: boolean;
  /** Highlight positive/negative values */
  highlightSignificance: boolean;
}

// =============================================================================
// RESPONSIVE TYPOGRAPHY TYPES
// =============================================================================

/**
 * Container query breakpoints for typography
 */
export interface ContainerQueryBreakpoints {
  xs: string;  // 20rem (320px)
  sm: string;  // 24rem (384px)
  md: string;  // 28rem (448px)
  lg: string;  // 32rem (512px)
  xl: string;  // 36rem (576px)
  '2xl': string; // 42rem (672px)
}

/**
 * Responsive typography configuration
 */
export interface ResponsiveTypographyConfig {
  /** Container query breakpoints */
  breakpoints: ContainerQueryBreakpoints;
  /** Enable container query support */
  enableContainerQueries: boolean;
  /** Fluid typography configuration */
  fluidConfig: {
    minViewport: number;
    maxViewport: number;
    scaleRatio: number;
  };
}