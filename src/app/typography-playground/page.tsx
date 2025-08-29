'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  TYPOGRAPHY_SYSTEM,
  getFontSizeVar,
  getLineHeightVar,
  getFontWeightVar,
  semanticToCSSProperties,
  checkTextSizeAccessibility
} from '@/lib/typography';
import type {
  FontSizeScale,
  LineHeightScale,
  FontWeightScale,
  LetterSpacingScale,
  FontFamily,
  TextColor,
  BrandColor,
  HeadingLevel,
  BodyTextVariant,
  SpecialTextStyle,
  ThemeMode,
  SemanticTypography
} from '@/types/typography';

interface PlaygroundState {
  // Current selection
  fontSize: FontSizeScale;
  lineHeight: LineHeightScale;
  fontWeight: FontWeightScale;
  letterSpacing: LetterSpacingScale;
  fontFamily: FontFamily;
  color: TextColor | BrandColor;
  theme: ThemeMode;
  
  // Content
  sampleText: string;
  showAllVariants: boolean;
  showAccessibilityInfo: boolean;
  showCSSOutput: boolean;
  enableRealTimeEdit: boolean;
  
  // Export options
  exportFormat: 'css' | 'scss' | 'js' | 'json';
}

const SAMPLE_TEXTS = {
  heading: 'Bitcoin Vesting Calculator',
  body: 'Calculate your Bitcoin vesting schedule and see future projections based on various growth scenarios. This tool helps you understand the potential value of your Bitcoin compensation package.',
  bitcoin: '₿ 0.05842751',
  financial: '$1,234,567.89',
  technical: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  label: 'Employee Vesting Period',
  caption: 'Historical data from 2015-2024'
};

export default function TypographyPlayground() {
  const [state, setState] = useState<PlaygroundState>({
    fontSize: 'base',
    lineHeight: 'normal',
    fontWeight: 'normal',
    letterSpacing: 'normal',
    fontFamily: 'sans',
    color: 'primary',
    theme: 'light',
    sampleText: SAMPLE_TEXTS.body,
    showAllVariants: false,
    showAccessibilityInfo: true,
    showCSSOutput: true,
    enableRealTimeEdit: true,
    exportFormat: 'css'
  });

  // Generate current styles
  const currentStyles = useMemo(() => {
    const styles: Record<string, string> = {};
    
    // Font properties
    styles.fontSize = getFontSizeVar(state.fontSize);
    styles.lineHeight = getLineHeightVar(state.lineHeight);
    styles.fontWeight = getFontWeightVar(state.fontWeight);
    styles.letterSpacing = `var(--letter-spacing-${state.letterSpacing})`;
    styles.fontFamily = `var(--font-family-${state.fontFamily})`;
    
    // Color - simplified approach
    styles.color = `var(--text-color-${state.color})`;
    
    return styles;
  }, [state]);

  // Generate CSS output
  const cssOutput = useMemo(() => {
    const properties = Object.entries(currentStyles)
      .map(([prop, value]) => `  ${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n');
    
    return `.typography-sample {\n${properties}\n}`;
  }, [currentStyles]);

  // Check accessibility
  const accessibilityInfo = useMemo(() => {
    return checkTextSizeAccessibility(
      state.fontSize,
      state.fontWeight
    );
  }, [state.fontSize, state.fontWeight]);

  // Export functionality
  const exportTokens = useCallback(() => {
    const data = {
      typography: {
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
        fontWeight: state.fontWeight,
        letterSpacing: state.letterSpacing,
        fontFamily: state.fontFamily,
        color: state.color
      },
      css: cssOutput,
      theme: state.theme
    };

    const exportContent = state.exportFormat === 'json' 
      ? JSON.stringify(data, null, 2)
      : cssOutput;

    const blob = new Blob([exportContent], { 
      type: state.exportFormat === 'json' ? 'application/json' : 'text/css' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typography-tokens.${state.exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state, cssOutput]);

  // Semantic typography examples
  const semanticExamples = useMemo(() => {
    const examples: Array<{
      type: string;
      level: string;
      semantic: SemanticTypography;
      text: string;
    }> = [];
    
    // Headings
    (['display', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as HeadingLevel[]).forEach(level => {
      const semantic = TYPOGRAPHY_SYSTEM.semantic.headings[level];
      examples.push({
        type: 'heading',
        level,
        semantic,
        text: `${level.toUpperCase()}: ${SAMPLE_TEXTS.heading}`
      });
    });

    // Body text
    (['large', 'normal', 'small'] as BodyTextVariant[]).forEach(variant => {
      const semantic = TYPOGRAPHY_SYSTEM.semantic.body[variant];
      examples.push({
        type: 'body',
        level: variant,
        semantic,
        text: SAMPLE_TEXTS.body
      });
    });

    // Special styles
    (['label', 'caption', 'overline', 'bitcoin-symbol', 'bitcoin-amount'] as SpecialTextStyle[]).forEach(style => {
      const semantic = TYPOGRAPHY_SYSTEM.semantic.special[style];
      let text = SAMPLE_TEXTS.label;
      
      if (style === 'caption') text = SAMPLE_TEXTS.caption;
      else if (style === 'bitcoin-symbol') text = '₿';
      else if (style === 'bitcoin-amount') text = SAMPLE_TEXTS.bitcoin;
      else if (style === 'overline') text = 'SECTION LABEL';
      
      examples.push({
        type: 'special',
        level: style,
        semantic,
        text
      });
    });

    return examples;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Typography Playground
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Interactive tool for exploring and testing the Bitcoin Benefit typography system. 
            Experiment with tokens, preview combinations, and export your configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Typography Controls
              </h2>
              
              {/* Theme Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Theme Mode
                </label>
                <select
                  value={state.theme}
                  onChange={(e) => setState(prev => ({ ...prev, theme: e.target.value as ThemeMode }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Font Size Scale
                </label>
                <select
                  value={state.fontSize}
                  onChange={(e) => setState(prev => ({ ...prev, fontSize: e.target.value as FontSizeScale }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(TYPOGRAPHY_SYSTEM.fontSizes).map(size => (
                    <option key={size} value={size}>
                      {size} ({TYPOGRAPHY_SYSTEM.fontSizes[size as FontSizeScale].pixels.min}px - {TYPOGRAPHY_SYSTEM.fontSizes[size as FontSizeScale].pixels.max}px)
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Height */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Line Height
                </label>
                <select
                  value={state.lineHeight}
                  onChange={(e) => setState(prev => ({ ...prev, lineHeight: e.target.value as LineHeightScale }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(TYPOGRAPHY_SYSTEM.lineHeights).map(height => (
                    <option key={height} value={height}>
                      {height} ({TYPOGRAPHY_SYSTEM.lineHeights[height as LineHeightScale].value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Weight */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Font Weight
                </label>
                <select
                  value={state.fontWeight}
                  onChange={(e) => setState(prev => ({ ...prev, fontWeight: e.target.value as FontWeightScale }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(TYPOGRAPHY_SYSTEM.fontWeights).map(weight => (
                    <option key={weight} value={weight}>
                      {weight} ({TYPOGRAPHY_SYSTEM.fontWeights[weight as FontWeightScale].value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Letter Spacing */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Letter Spacing
                </label>
                <select
                  value={state.letterSpacing}
                  onChange={(e) => setState(prev => ({ ...prev, letterSpacing: e.target.value as LetterSpacingScale }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(TYPOGRAPHY_SYSTEM.letterSpacings).map(spacing => (
                    <option key={spacing} value={spacing}>
                      {spacing} ({TYPOGRAPHY_SYSTEM.letterSpacings[spacing as LetterSpacingScale].value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Family */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Font Family
                </label>
                <select
                  value={state.fontFamily}
                  onChange={(e) => setState(prev => ({ ...prev, fontFamily: e.target.value as FontFamily }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.keys(TYPOGRAPHY_SYSTEM.fontFamilies).map(family => (
                    <option key={family} value={family}>
                      {family} - {TYPOGRAPHY_SYSTEM.fontFamilies[family as FontFamily].primary}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Text Color
                </label>
                <select
                  value={state.color}
                  onChange={(e) => setState(prev => ({ ...prev, color: e.target.value as TextColor | BrandColor }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <optgroup label="Text Colors">
                    {Object.keys(TYPOGRAPHY_SYSTEM.colors.text).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Brand Colors">
                    {Object.keys(TYPOGRAPHY_SYSTEM.colors.brand).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Sample Text Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Sample Text
                </label>
                <select
                  value={state.sampleText}
                  onChange={(e) => setState(prev => ({ ...prev, sampleText: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-2"
                >
                  {Object.entries(SAMPLE_TEXTS).map(([key, text]) => (
                    <option key={key} value={text}>
                      {key} - {text.substring(0, 30)}...
                    </option>
                  ))}
                </select>
                {state.enableRealTimeEdit && (
                  <textarea
                    value={state.sampleText}
                    onChange={(e) => setState(prev => ({ ...prev, sampleText: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Type your custom text here..."
                  />
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.showAllVariants}
                    onChange={(e) => setState(prev => ({ ...prev, showAllVariants: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show all semantic variants</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.showAccessibilityInfo}
                    onChange={(e) => setState(prev => ({ ...prev, showAccessibilityInfo: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show accessibility info</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.showCSSOutput}
                    onChange={(e) => setState(prev => ({ ...prev, showCSSOutput: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show CSS output</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.enableRealTimeEdit}
                    onChange={(e) => setState(prev => ({ ...prev, enableRealTimeEdit: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable real-time editing</span>
                </label>
              </div>
            </div>

            {/* Export Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Export Configuration
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Export Format
                </label>
                <select
                  value={state.exportFormat}
                  onChange={(e) => setState(prev => ({ ...prev, exportFormat: e.target.value as 'css' | 'scss' | 'js' | 'json' }))}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="css">CSS</option>
                  <option value="scss">SCSS</option>
                  <option value="js">JavaScript</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <button
                onClick={exportTokens}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Export Tokens
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Selection Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Typography Preview
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-6">
                <div
                  style={currentStyles}
                  className="transition-all duration-200"
                >
                  {state.sampleText}
                </div>
              </div>

              {/* Token Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Font Size:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{state.fontSize}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Line Height:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{state.lineHeight}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Font Weight:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{state.fontWeight}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Letter Spacing:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{state.letterSpacing}</span>
                </div>
              </div>
            </div>

            {/* Accessibility Information */}
            {state.showAccessibilityInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Accessibility Information
                </h3>
                
                <div className="space-y-3">
                  <div className={cn(
                    "p-3 rounded-lg",
                    accessibilityInfo.meetsAA ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                  )}>
                    <div className="flex items-center">
                      <span className={cn(
                        "text-sm font-medium",
                        accessibilityInfo.meetsAA ? "text-green-800 dark:text-green-200" : "text-yellow-800 dark:text-yellow-200"
                      )}>
                        WCAG AA: {accessibilityInfo.meetsAA ? "✓ Passes" : "⚠ Review Required"}
                      </span>
                    </div>
                    <div className={cn(
                      "text-sm mt-1",
                      accessibilityInfo.meetsAA ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"
                    )}>
                      {accessibilityInfo.recommendations.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {accessibilityInfo.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      ) : (
                        "Meets accessibility standards"
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Min Size:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{TYPOGRAPHY_SYSTEM.fontSizes[state.fontSize].pixels.min}px</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Max Size:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{TYPOGRAPHY_SYSTEM.fontSizes[state.fontSize].pixels.max}px</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Line Height Ratio:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{TYPOGRAPHY_SYSTEM.lineHeights[state.lineHeight].value}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">AAA Compliance:</span>
                      <span className={cn(
                        "ml-2",
                        accessibilityInfo.meetsAAA ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                      )}>
                        {accessibilityInfo.meetsAAA ? "✓ Passes" : "Review Required"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CSS Output */}
            {state.showCSSOutput && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Generated CSS
                </h3>
                
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-800 dark:text-gray-100 dark:text-gray-200">{cssOutput}</pre>
                </div>
                
                <button
                  onClick={() => navigator.clipboard.writeText(cssOutput)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Copy CSS
                </button>
              </div>
            )}

            {/* All Semantic Variants */}
            {state.showAllVariants && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  All Typography Variants
                </h3>
                
                <div className="space-y-8">
                  {semanticExamples.map((example, index) => {
                    const styles = semanticToCSSProperties(example.semantic);
                    
                    return (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            {example.type} - {example.level}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {example.semantic.fontSize} / {example.semantic.fontWeight} / {example.semantic.lineHeight}
                          </span>
                        </div>
                        <div style={styles} className="py-2">
                          {example.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}