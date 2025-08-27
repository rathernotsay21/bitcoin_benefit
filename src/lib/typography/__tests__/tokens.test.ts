/**
 * Typography Token System Tests
 * Tests for token definitions and mapping functions
 */

import {
  TYPOGRAPHY_SYSTEM,
  FONT_SIZE_TOKENS,
  LINE_HEIGHT_TOKENS,
  FONT_WEIGHT_TOKENS,
  getFontSizeVar,
  getLineHeightVar,
  getFontWeightVar,
  semanticToCSSProperties,
  getAllCSSCustomProperties,
  createCSSCustomPropertiesObject
} from '../tokens';

import {
  isValidFontSizeScale,
  isValidLineHeightScale,
  isValidFontWeightScale,
  validateTypographyToken,
  remToPixels,
  pixelsToRem,
  parseClampValue,
  getColorForTheme,
  createBitcoinAmountStyles
} from '../utils';

describe('Typography Token System', () => {
  describe('Token Definitions', () => {
    test('should have all font size tokens', () => {
      const expectedSizes = [
        'caption', 'body', 'base', 'lead', 'lg', 'xl', 
        '2xl', '3xl', '4xl', '5xl', '6xl', 'display'
      ];
      
      expectedSizes.forEach(size => {
        expect(FONT_SIZE_TOKENS[size as keyof typeof FONT_SIZE_TOKENS]).toBeDefined();
      });
    });

    test('should have consistent CSS custom property naming', () => {
      Object.values(FONT_SIZE_TOKENS).forEach(token => {
        expect(token.cssVar).toMatch(/^--font-size-/);
        expect(token.cssVar).toBe(`--font-size-${token.scale}`);
      });
    });

    test('should have valid clamp values', () => {
      Object.values(FONT_SIZE_TOKENS).forEach(token => {
        expect(token.fluid).toMatch(/^clamp\(/);
        const parsed = parseClampValue(token.fluid);
        expect(parsed).not.toBeNull();
        expect(parsed!.min).toBe(token.min);
        expect(parsed!.max).toBe(token.max);
      });
    });
  });

  describe('Token Mapping Functions', () => {
    test('getFontSizeVar should return correct CSS variable', () => {
      expect(getFontSizeVar('base')).toBe('--font-size-base');
      expect(getFontSizeVar('display')).toBe('--font-size-display');
    });

    test('getLineHeightVar should return correct CSS variable', () => {
      expect(getLineHeightVar('normal')).toBe('--line-height-normal');
      expect(getLineHeightVar('tight')).toBe('--line-height-tight');
    });

    test('getFontWeightVar should return correct CSS variable', () => {
      expect(getFontWeightVar('bold')).toBe('--font-weight-bold');
      expect(getFontWeightVar('normal')).toBe('--font-weight-normal');
    });
  });

  describe('Semantic Typography', () => {
    test('semanticToCSSProperties should convert semantic typography correctly', () => {
      const h1Typography = TYPOGRAPHY_SYSTEM.semantic.headings.h1;
      const cssProps = semanticToCSSProperties(h1Typography);
      
      expect(cssProps.fontSize).toBe('var(--font-size-6xl)');
      expect(cssProps.fontWeight).toBe('var(--font-weight-bold)');
      expect(cssProps.lineHeight).toBe('var(--line-height-tight)');
      expect(cssProps.color).toBe('var(--text-primary)');
    });

    test('should handle additional styles', () => {
      const bitcoinAmountTypography = TYPOGRAPHY_SYSTEM.semantic.special['bitcoin-amount'];
      const cssProps = semanticToCSSProperties(bitcoinAmountTypography);
      
      expect(cssProps.fontVariantNumeric).toBe('tabular-nums');
      expect(cssProps.fontFeatureSettings).toBe('"tnum" on');
    });
  });

  describe('Validation Functions', () => {
    test('isValidFontSizeScale should validate font size scales', () => {
      expect(isValidFontSizeScale('base')).toBe(true);
      expect(isValidFontSizeScale('display')).toBe(true);
      expect(isValidFontSizeScale('invalid')).toBe(false);
    });

    test('validateTypographyToken should provide detailed feedback', () => {
      const validResult = validateTypographyToken('fontSize', 'base');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validateTypographyToken('fontSize', 'invalid');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('Invalid fontSize token');
    });
  });

  describe('Conversion Functions', () => {
    test('remToPixels should convert rem to pixels correctly', () => {
      expect(remToPixels('1rem')).toBe(16);
      expect(remToPixels('1.5rem')).toBe(24);
      expect(remToPixels('2rem', 20)).toBe(40);
    });

    test('pixelsToRem should convert pixels to rem correctly', () => {
      expect(pixelsToRem(16)).toBe('1rem');
      expect(pixelsToRem(24)).toBe('1.5rem');
      expect(pixelsToRem(40, 20)).toBe('2rem');
    });

    test('parseClampValue should parse clamp functions correctly', () => {
      const clamp = 'clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)';
      const parsed = parseClampValue(clamp);
      
      expect(parsed).not.toBeNull();
      expect(parsed!.min).toBe('1rem');
      expect(parsed!.preferred).toBe('0.9375rem + 0.3125vw');
      expect(parsed!.max).toBe('1.125rem');
    });
  });

  describe('Theme Utilities', () => {
    test('getColorForTheme should return correct color for theme', () => {
      const lightPrimary = getColorForTheme('text', 'primary', 'light');
      const darkPrimary = getColorForTheme('text', 'primary', 'dark');
      
      expect(lightPrimary).toBe('hsl(210, 15%, 15%)');
      expect(darkPrimary).toBe('hsl(210, 15%, 95%)');
    });

    test('should handle brand colors', () => {
      const bitcoinLight = getColorForTheme('brand', 'bitcoin', 'light');
      const bitcoinDark = getColorForTheme('brand', 'bitcoin', 'dark');
      
      expect(bitcoinLight).toBe('hsl(42, 100%, 49%)');
      expect(bitcoinDark).toBe('hsl(42, 100%, 55%)');
    });
  });

  describe('Bitcoin-Specific Utilities', () => {
    test('createBitcoinAmountStyles should generate correct styles', () => {
      const styles = createBitcoinAmountStyles({
        fontWeight: 'bold',
        color: 'bitcoin'
      });
      
      expect(styles.fontWeight).toBe('var(--font-weight-bold)');
      expect(styles.color).toBe('var(--text-bitcoin)');
      expect(styles.fontVariantNumeric).toBe('tabular-nums');
      expect(styles.fontFeatureSettings).toBe('"tnum" on');
    });
  });

  describe('CSS Custom Properties', () => {
    test('getAllCSSCustomProperties should return all property names', () => {
      const properties = getAllCSSCustomProperties();
      
      expect(properties).toContain('--font-size-base');
      expect(properties).toContain('--line-height-normal');
      expect(properties).toContain('--font-weight-bold');
      expect(properties).toContain('--text-primary');
      expect(properties.length).toBeGreaterThan(45); // Should have many properties
    });

    test('createCSSCustomPropertiesObject should create valid CSS object', () => {
      const cssObject = createCSSCustomPropertiesObject();
      
      expect(cssObject['--font-size-base']).toBe('clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)');
      expect(cssObject['--line-height-normal']).toBe('1.4');
      expect(cssObject['--font-weight-normal']).toBe('400');
    });
  });

  describe('Typography System Integration', () => {
    test('should have complete typography system structure', () => {
      expect(TYPOGRAPHY_SYSTEM.scale).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.fontSizes).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.lineHeights).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.fontWeights).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.letterSpacings).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.fontFamilies).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.colors).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.textShadows).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.semantic).toBeDefined();
    });

    test('should have consistent modular scale', () => {
      expect(TYPOGRAPHY_SYSTEM.scale.ratio).toBe(1.333);
      expect(TYPOGRAPHY_SYSTEM.scale.base).toBe(16);
    });

    test('should have all semantic typography definitions', () => {
      expect(TYPOGRAPHY_SYSTEM.semantic.headings.display).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.semantic.headings.h1).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.semantic.body.normal).toBeDefined();
      expect(TYPOGRAPHY_SYSTEM.semantic.special['bitcoin-amount']).toBeDefined();
    });
  });
});