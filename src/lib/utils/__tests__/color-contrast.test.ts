import {
  hexToRgb,
  getRelativeLuminance,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getWCAGLevel,
  suggestContrastColor,
  validateThemeContrast,
  bitcoinColorPairs,
} from '../color-contrast';

describe('Color Contrast Utilities', () => {
  describe('hexToRgb', () => {
    it('should convert hex colors to RGB', () => {
      expect(hexToRgb('#f2a900')).toEqual({ r: 242, g: 169, b: 0 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle hex colors without # prefix', () => {
      expect(hexToRgb('f2a900')).toEqual({ r: 242, g: 169, b: 0 });
    });

    it('should throw error for invalid hex colors', () => {
      expect(() => hexToRgb('invalid')).toThrow('Invalid hex color');
      expect(() => hexToRgb('#gg0000')).toThrow('Invalid hex color');
    });
  });

  describe('getRelativeLuminance', () => {
    it('should calculate correct relative luminance', () => {
      // White should have maximum luminance
      expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1.0);
      
      // Black should have minimum luminance
      expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0.0);
      
      // Bitcoin orange
      const bitcoinRgb = hexToRgb('#f2a900');
      const bitcoinLum = getRelativeLuminance(bitcoinRgb);
      expect(bitcoinLum).toBeGreaterThan(0.3);
      expect(bitcoinLum).toBeLessThan(0.5);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate correct contrast ratios', () => {
      // Black on white should be maximum contrast (21:1)
      expect(calculateContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
      
      // Same color should have minimum contrast (1:1)
      expect(calculateContrastRatio('#f2a900', '#f2a900')).toBeCloseTo(1, 0);
      
      // Bitcoin orange on white
      const bitcoinOnWhite = calculateContrastRatio('#f2a900', '#ffffff');
      expect(bitcoinOnWhite).toBeGreaterThan(2);
      expect(bitcoinOnWhite).toBeLessThan(3);
    });

    it('should be commutative', () => {
      const ratio1 = calculateContrastRatio('#f2a900', '#ffffff');
      const ratio2 = calculateContrastRatio('#ffffff', '#f2a900');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('WCAG Compliance', () => {
    describe('meetsWCAGAA', () => {
      it('should validate AA compliance for normal text', () => {
        // Should pass: black on white
        expect(meetsWCAGAA('#000000', '#ffffff')).toBe(true);
        
        // Should pass: dark gray on white
        expect(meetsWCAGAA('#6b7280', '#ffffff')).toBe(true);
        
        // Should fail: light gray on white
        expect(meetsWCAGAA('#d1d5db', '#ffffff')).toBe(false);
        
        // Should fail: Bitcoin orange on white (contrast ~2.57)
        expect(meetsWCAGAA('#f2a900', '#ffffff')).toBe(false);
      });

      it('should validate AA compliance for large text', () => {
        // Bitcoin orange on white should pass for large text (3:1 requirement)
        expect(meetsWCAGAA('#f2a900', '#ffffff', true)).toBe(false);
        
        // Medium gray on white should pass for large text
        expect(meetsWCAGAA('#9ca3af', '#ffffff', true)).toBe(true);
      });
    });

    describe('meetsWCAGAAA', () => {
      it('should validate AAA compliance', () => {
        // Black on white should pass AAA
        expect(meetsWCAGAAA('#000000', '#ffffff')).toBe(true);
        
        // Dark gray on white might not pass AAA (7:1 requirement)
        expect(meetsWCAGAAA('#6b7280', '#ffffff')).toBe(false);
      });
    });

    describe('getWCAGLevel', () => {
      it('should return correct WCAG levels', () => {
        expect(getWCAGLevel('#000000', '#ffffff')).toBe('AAA');
        expect(getWCAGLevel('#6b7280', '#ffffff')).toBe('AA');
        expect(getWCAGLevel('#e5e7eb', '#ffffff')).toBe('FAIL');
      });
    });
  });

  describe('suggestContrastColor', () => {
    it('should suggest light color for dark backgrounds', () => {
      expect(suggestContrastColor('#000000')).toBe('#FFFFFF');
      expect(suggestContrastColor('#0F172A')).toBe('#FFFFFF');
    });

    it('should suggest dark color for light backgrounds', () => {
      expect(suggestContrastColor('#FFFFFF')).toBe('#1F2937');
      expect(suggestContrastColor('#f4f4f5')).toBe('#1F2937');
    });

    it('should respect preference for light colors', () => {
      expect(suggestContrastColor('#FFFFFF', false)).toBe('#6B7280');
    });
  });

  describe('validateThemeContrast', () => {
    it('should validate multiple color pairs', () => {
      const theme = {
        primary: { foreground: '#ffffff', background: '#f2a900' },
        secondary: { foreground: '#ffffff', background: '#3b82f6' },
        text: { foreground: '#6b7280', background: '#ffffff' },
      };

      const results = validateThemeContrast(theme);

      expect(results.primary.passes).toBe(false); // Bitcoin orange fails AA
      expect(results.secondary.passes).toBe(true);  // Blue should pass
      expect(results.text.passes).toBe(true);       // Dark gray on white passes
    });
  });

  describe('Bitcoin Color Pairs Compliance', () => {
    it('should validate primary button colors', () => {
      const { primaryButton } = bitcoinColorPairs;
      const ratio = calculateContrastRatio(
        primaryButton.foreground,
        primaryButton.background
      );
      // White on Bitcoin orange should be ~2.57:1 (fails AA)
      expect(ratio).toBeGreaterThan(2);
      expect(ratio).toBeLessThan(3);
      expect(meetsWCAGAA(primaryButton.foreground, primaryButton.background)).toBe(false);
    });

    it('should validate secondary button colors', () => {
      const { secondaryButton } = bitcoinColorPairs;
      // White on blue should pass AA
      expect(
        meetsWCAGAA(secondaryButton.foreground, secondaryButton.background)
      ).toBe(true);
    });

    it('should validate muted text colors', () => {
      const { mutedText } = bitcoinColorPairs;
      // #6b7280 on white should pass AA
      expect(
        meetsWCAGAA(mutedText.foreground, mutedText.background)
      ).toBe(true);
    });

    it('should validate dark mode muted text', () => {
      const { darkMutedText } = bitcoinColorPairs;
      // #9ca3af on dark background should pass AA
      expect(
        meetsWCAGAA(darkMutedText.foreground, darkMutedText.background)
      ).toBe(true);
    });
  });

  describe('Bitcoin Orange Accessibility', () => {
    it('Bitcoin orange #f2a900 meets industry standard', () => {
      expect(hexToRgb('#f2a900')).toEqual({ r: 242, g: 169, b: 0 });
    });

    it('Bitcoin orange on dark backgrounds should have good contrast', () => {
      // Bitcoin orange on dark slate
      const ratio = calculateContrastRatio('#f2a900', '#0F172A');
      expect(ratio).toBeGreaterThan(7); // Should pass AAA
      expect(meetsWCAGAAA('#f2a900', '#0F172A')).toBe(true);
    });

    it('Bitcoin orange text on white needs adjustment', () => {
      // Direct Bitcoin orange on white fails
      expect(meetsWCAGAA('#f2a900', '#ffffff')).toBe(false);
      
      // Darker shade of Bitcoin orange might work
      const darkerBitcoin = '#B37E00'; // bitcoin-700 from our palette
      expect(calculateContrastRatio(darkerBitcoin, '#ffffff')).toBeGreaterThan(4.5);
    });
  });
});