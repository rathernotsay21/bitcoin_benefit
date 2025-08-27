/**
 * Typography Token System - Usage Examples
 * Bitcoin Benefit Platform
 * 
 * Example components demonstrating how to use the typography token system.
 * These examples show proper integration with React and CSS-in-JS.
 */

import React from 'react';
import {
  getFontSizeVar,
  getLineHeightVar,
  getFontWeightVar,
  getTextColorVar,
  getBrandColorVar,
  semanticToCSSProperties,
  createBitcoinAmountStyles,
  HEADING_TYPOGRAPHY,
  BODY_TYPOGRAPHY,
  SPECIAL_TYPOGRAPHY,
  type FontSizeScale,
  type LineHeightScale,
  type FontWeightScale,
  type TextColor,
  type BrandColor
} from './index';

// =============================================================================
// EXAMPLE 1: USING CSS CUSTOM PROPERTIES DIRECTLY
// =============================================================================

/**
 * Example component using CSS custom properties directly in styles
 */
export const DirectCSSPropertyExample: React.FC = () => {
  return (
    <div style={{
      fontSize: `var(${getFontSizeVar('base')})`,
      lineHeight: `var(${getLineHeightVar('relaxed')})`,
      fontWeight: `var(${getFontWeightVar('normal')})`,
      color: `var(${getTextColorVar('primary')})`
    }}>
      This text uses typography tokens directly via CSS custom properties.
    </div>
  );
};

// =============================================================================
// EXAMPLE 2: USING SEMANTIC TYPOGRAPHY
// =============================================================================

/**
 * Example component using semantic typography definitions
 */
export const SemanticTypographyExample: React.FC = () => {
  const h1Styles = semanticToCSSProperties(HEADING_TYPOGRAPHY.h1);
  const bodyStyles = semanticToCSSProperties(BODY_TYPOGRAPHY.normal);

  return (
    <div>
      <h1 style={h1Styles}>
        Semantic H1 Heading
      </h1>
      <p style={bodyStyles}>
        This paragraph uses semantic body typography that automatically applies
        the correct font size, line height, weight, and color.
      </p>
    </div>
  );
};

// =============================================================================
// EXAMPLE 3: BITCOIN-SPECIFIC TYPOGRAPHY
// =============================================================================

/**
 * Example component for displaying Bitcoin amounts with proper formatting
 */
export const BitcoinAmountExample: React.FC<{ amount: number }> = ({ amount }) => {
  const bitcoinAmountStyles = createBitcoinAmountStyles({
    fontWeight: 'bold',
    color: 'bitcoin'
  });

  return (
    <div>
      <span style={bitcoinAmountStyles}>
        ₿{amount.toFixed(8)}
      </span>
    </div>
  );
};

// =============================================================================
// EXAMPLE 4: DYNAMIC TYPOGRAPHY COMPONENT
// =============================================================================

interface TypographyProps {
  fontSize?: FontSizeScale;
  lineHeight?: LineHeightScale;
  fontWeight?: FontWeightScale;
  color?: TextColor | BrandColor;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Typography component that accepts token props
 */
export const Typography: React.FC<TypographyProps> = ({
  fontSize = 'base',
  lineHeight = 'normal',
  fontWeight = 'normal',
  color = 'primary',
  children,
  className
}) => {
  const style: React.CSSProperties = {
    fontSize: `var(${getFontSizeVar(fontSize)})`,
    lineHeight: `var(${getLineHeightVar(lineHeight)})`,
    fontWeight: `var(${getFontWeightVar(fontWeight)})`
  };

  // Handle color based on whether it's a text color or brand color
  try {
    style.color = `var(${getTextColorVar(color as TextColor)})`;
  } catch {
    style.color = `var(${getBrandColorVar(color as BrandColor)})`;
  }

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};

// =============================================================================
// EXAMPLE 5: STYLED COMPONENTS INTEGRATION (if using styled-components)
// =============================================================================

/**
 * Example showing how to use tokens with CSS-in-JS libraries
 * (This would work with styled-components, emotion, etc.)
 */
export const cssInJsExample = `
import styled from 'styled-components';
import { getFontSizeVar, getTextColorVar } from '@/lib/typography';

const StyledHeading = styled.h1\`
  font-size: var(\${getFontSizeVar('4xl')});
  color: var(\${getTextColorVar('primary')});
  margin: 0;
\`;

const StyledBitcoinPrice = styled.span\`
  font-size: var(\${getFontSizeVar('2xl')});
  font-weight: var(\${getFontWeightVar('bold')});
  color: var(\${getBrandColorVar('bitcoin')});
  font-variant-numeric: tabular-nums;
\`;
`;

// =============================================================================
// EXAMPLE 6: TAILWIND-LIKE UTILITY CLASS APPROACH
// =============================================================================

/**
 * Example showing how to create utility classes from tokens
 */
export const createUtilityClasses = () => {
  const classes = {
    // Text sizes
    'text-caption': `font-size: var(${getFontSizeVar('caption')});`,
    'text-body': `font-size: var(${getFontSizeVar('body')});`,
    'text-base': `font-size: var(${getFontSizeVar('base')});`,
    'text-lg': `font-size: var(${getFontSizeVar('lg')});`,
    'text-xl': `font-size: var(${getFontSizeVar('xl')});`,
    
    // Font weights
    'font-light': `font-weight: var(${getFontWeightVar('light')});`,
    'font-normal': `font-weight: var(${getFontWeightVar('normal')});`,
    'font-medium': `font-weight: var(${getFontWeightVar('medium')});`,
    'font-semibold': `font-weight: var(${getFontWeightVar('semibold')});`,
    'font-bold': `font-weight: var(${getFontWeightVar('bold')});`,
    
    // Text colors
    'text-primary': `color: var(${getTextColorVar('primary')});`,
    'text-secondary': `color: var(${getTextColorVar('secondary')});`,
    'text-muted': `color: var(${getTextColorVar('muted')});`,
    'text-bitcoin': `color: var(${getBrandColorVar('bitcoin')});`,
    'text-accent': `color: var(${getBrandColorVar('accent')});`,
  };
  
  return classes;
};

// =============================================================================
// EXAMPLE 7: THEME-AWARE COMPONENT
// =============================================================================

/**
 * Example component that responds to theme changes
 */
export const ThemeAwareExample: React.FC = () => {
  // In a real app, you'd get the theme from context or a hook
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const containerStyle: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: theme === 'dark' ? 'hsl(210, 15%, 15%)' : 'hsl(0, 0%, 100%)',
    color: `var(${getTextColorVar('primary')})`, // This will automatically adapt
    fontSize: `var(${getFontSizeVar('base')})`,
    lineHeight: `var(${getLineHeightVar('relaxed')})`
  };

  return (
    <div style={containerStyle}>
      <h3 style={{
        fontSize: `var(${getFontSizeVar('xl')})`,
        color: `var(${getBrandColorVar('bitcoin')})`,
        marginBottom: '0.5rem'
      }}>
        Theme-Aware Typography
      </h3>
      <p>
        This text automatically adapts to the current theme. The Bitcoin orange
        color will be brighter in dark mode and darker in light mode.
      </p>
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        style={{
          padding: '0.5rem 1rem',
          marginTop: '1rem',
          backgroundColor: `var(${getBrandColorVar('accent')})`,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
};

// =============================================================================
// EXAMPLE 8: RESPONSIVE TYPOGRAPHY COMPONENT
// =============================================================================

/**
 * Example showing responsive typography using container queries
 */
export const ResponsiveTypographyExample: React.FC = () => {
  return (
    <div style={{
      containerType: 'inline-size',
      padding: '1rem',
      border: '1px solid #ccc',
      resize: 'horizontal',
      overflow: 'auto',
      minWidth: '200px',
      maxWidth: '100%'
    }}>
      <style>{`
        @container (min-width: 300px) {
          .responsive-heading {
            font-size: var(${getFontSizeVar('lg')}) !important;
          }
        }
        @container (min-width: 500px) {
          .responsive-heading {
            font-size: var(${getFontSizeVar('xl')}) !important;
          }
        }
        @container (min-width: 700px) {
          .responsive-heading {
            font-size: var(${getFontSizeVar('2xl')}) !important;
          }
        }
      `}</style>
      <h3 
        className="responsive-heading"
        style={{
          fontSize: `var(${getFontSizeVar('base')})`,
          color: `var(${getTextColorVar('primary')})`,
          margin: '0 0 1rem 0'
        }}
      >
        Resize this container →
      </h3>
      <p style={{
        fontSize: `var(${getFontSizeVar('body')})`,
        color: `var(${getTextColorVar('secondary')})`,
        lineHeight: `var(${getLineHeightVar('relaxed')})`
      }}>
        This heading uses container queries to scale its typography based on 
        the container width, not the viewport width.
      </p>
    </div>
  );
};

// =============================================================================
// USAGE DOCUMENTATION
// =============================================================================

/**
 * Usage examples and best practices
 */
export const USAGE_EXAMPLES = {
  basicUsage: `
// Import the tokens and utilities
import { 
  getFontSizeVar, 
  getTextColorVar, 
  semanticToCSSProperties,
  HEADING_TYPOGRAPHY 
} from '@/lib/typography';

// Use CSS custom properties directly
const style = {
  fontSize: \`var(\${getFontSizeVar('base')})\`,
  color: \`var(\${getTextColorVar('primary')})\`
};

// Use semantic typography
const headingStyle = semanticToCSSProperties(HEADING_TYPOGRAPHY.h1);
  `,
  
  bitcoinFormatting: `
// Format Bitcoin amounts properly
import { createBitcoinAmountStyles } from '@/lib/typography';

const bitcoinStyle = createBitcoinAmountStyles({
  fontWeight: 'bold',
  color: 'bitcoin'
});

// Results in tabular numbers, proper spacing, and brand color
<span style={bitcoinStyle}>₿0.00123456</span>
  `,
  
  validation: `
// Validate typography tokens
import { validateTypographyToken, isValidFontSizeScale } from '@/lib/typography';

const result = validateTypographyToken('fontSize', 'invalid');
if (!result.valid) {
  console.log(result.error); // "Invalid fontSize token: invalid"
  console.log(result.suggestion); // "Did you mean 'base'?"
}

if (isValidFontSizeScale(userInput)) {
  // Safe to use the token
}
  `,
  
  themeAware: `
// Create theme-aware components
import { getColorForTheme } from '@/lib/typography';

const textColor = getColorForTheme('text', 'primary', currentTheme);
// Returns appropriate color for light/dark/high-contrast themes
  `
};

const TypographyExamples = {
  DirectCSSPropertyExample,
  SemanticTypographyExample,
  BitcoinAmountExample,
  Typography,
  ThemeAwareExample,
  ResponsiveTypographyExample,
  createUtilityClasses,
  USAGE_EXAMPLES
};

export default TypographyExamples;