# Typography System Documentation
## Bitcoin Benefit Platform

*Generated automatically from typography tokens on 2025-08-27T17:11:59.125Z*

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Font Size Scale](#font-size-scale)
4. [Line Height System](#line-height-system)
5. [Font Weight Scale](#font-weight-scale)
6. [Semantic Typography](#semantic-typography)
7. [Usage Examples](#usage-examples)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Implementation Guide](#implementation-guide)
10. [Migration Guide](#migration-guide)

---

## Overview

The Bitcoin Benefit typography system provides a comprehensive, accessible, and scalable approach to text styling across the platform. Built on mathematical principles and semantic naming conventions, it ensures consistency and maintainability.

### Key Features

- **Fluid Typography**: Responsive scaling using CSS clamp()
- **Semantic Tokens**: Meaningful names that describe intent, not appearance
- **Accessibility First**: WCAG 2.1 AA compliant by default
- **Theme Support**: Light, dark, and high-contrast modes
- **Developer Experience**: VSCode snippets, TypeScript support, and validation

### Design System Metrics

- **Scale Ratio**: 1.333 (Perfect Fourth)
- **Base Font Size**: 16px
- **Viewport Range**: 320px - 1440px
- **Total Font Sizes**: 12 scales
- **Line Height Options**: 5 scales
- **Font Weights**: 9 weights

---

## Design Principles

### 1. Mathematical Harmony
Our typography uses a 1.333 ratio (Perfect Fourth) to create visual harmony and consistent scaling relationships.

### 2. Semantic Naming
Token names describe purpose and context rather than visual properties:
- ✅ `text-lead` (describes role)
- ❌ `text-18px` (describes appearance)

### 3. Accessibility First
All typography tokens meet WCAG 2.1 AA standards for:
- Minimum font sizes (12px+)
- Appropriate line heights (1.4+ for body text)
- Sufficient color contrast ratios

### 4. Responsive by Default
Every font size includes fluid scaling between mobile and desktop breakpoints.

---

## Font Size Scale

| Scale | Token | Mobile | Desktop | CSS Variable | Use Case |
|--------|--------|---------|----------|--------------|----------|
| caption | `text-caption` | 0.75rem (12px) | 0.875rem (14px) | `--font-size-caption` | Small annotations, metadata |
| body | `text-body` | 0.875rem (14px) | 1rem (16px) | `--font-size-body` | Secondary text, descriptions |
| base | `text-base` | 1rem (16px) | 1.125rem (18px) | `--font-size-base` | Standard body text, paragraphs |
| lead | `text-lead` | 1.125rem (18px) | 1.25rem (20px) | `--font-size-lead` | Introduction text, emphasized paragraphs |
| lg | `text-lg` | 1.25rem (20px) | 1.375rem (22px) | `--font-size-lg` | Subheadings, important text |
| xl | `text-xl` | 1.375rem (22px) | 1.625rem (26px) | `--font-size-xl` | Section headings, call-to-action |
| 2xl | `text-2xl` | 1.5rem (24px) | 1.875rem (30px) | `--font-size-2xl` | Page headings, article titles |
| 3xl | `text-3xl` | 1.875rem (30px) | 2.5rem (40px) | `--font-size-3xl` | Major headings, feature titles |
| 4xl | `text-4xl` | 2.25rem (36px) | 3.375rem (54px) | `--font-size-4xl` | Primary page headings |
| 5xl | `text-5xl` | 2.75rem (44px) | 4.5rem (72px) | `--font-size-5xl` | Hero headings, landing pages |
| 6xl | `text-6xl` | 3.5rem (56px) | 6rem (96px) | `--font-size-6xl` | Large hero text, marketing |
| display | `text-display` | 4rem (64px) | 8rem (128px) | `--font-size-display` | Massive display text, branding |


### Usage Examples

```tsx
// React components
<h1 className="text-display">Hero Heading</h1>
<p className="text-lead">Introduction paragraph</p>
<span className="text-caption">Supplementary information</span>

// CSS custom properties
.custom-element {
  font-size: var(--font-size-2xl);
}
```

---

## Line Height System

| Scale | Value | Context | CSS Variable |
|--------|--------|---------|--------------|
| tight | 1.1 | Headlines and display text | `--line-height-tight` |
| snug | 1.2 | Sub-headlines and short text | `--line-height-snug` |
| normal | 1.4 | UI text and labels | `--line-height-normal` |
| relaxed | 1.6 | Body text and paragraphs | `--line-height-relaxed` |
| loose | 1.8 | Long-form reading text | `--line-height-loose` |


### Best Practices

- **Headlines**: Use `tight` or `snug` for impactful display
- **Body Text**: Use `relaxed` for comfortable reading
- **UI Elements**: Use `normal` for consistent spacing
- **Long-form Content**: Use `loose` for extended reading

---

## Font Weight Scale

| Scale | Value | CSS Variable | Common Use |
|--------|--------|--------------|------------|
| thin | 100 | `--font-weight-thin` | Decorative text, light branding |
| extralight | 200 | `--font-weight-extralight` | Subtle headings, light emphasis |
| light | 300 | `--font-weight-light` | Body text alternatives, elegant styling |
| normal | 400 | `--font-weight-normal` | Standard body text, default weight |
| medium | 500 | `--font-weight-medium` | Labels, subtle emphasis, UI text |
| semibold | 600 | `--font-weight-semibold` | Headings, important text, navigation |
| bold | 700 | `--font-weight-bold` | Strong emphasis, primary headings |
| extrabold | 800 | `--font-weight-extrabold` | Display headings, hero text |
| black | 900 | `--font-weight-black` | Maximum emphasis, branding |


### Usage Guidelines

- **Display Text**: `bold` or `extrabold` for maximum impact
- **Headings**: `semibold` or `bold` for clear hierarchy
- **Body Text**: `normal` for comfortable reading
- **Labels**: `medium` for subtle emphasis

---

## Semantic Typography

Our semantic system provides pre-configured combinations for common use cases:

### Headings

| Level | Class | Font Size | Weight | Line Height | Use Case |
|--------|--------|-----------|---------|-------------|----------|
| display | `text-display` | display | bold | tight | Hero sections, landing page titles |
| h1 | `text-h1` | 4xl | bold | tight | Page titles, main headings |
| h2 | `text-h2` | 3xl | semibold | snug | Major section headings |
| h3 | `text-h3` | 2xl | semibold | snug | Subsection headings, article titles |
| h4 | `text-h4` | xl | medium | normal | Minor headings, component titles |
| h5 | `text-h5` | lg | medium | normal | Small section headings |
| h6 | `text-h6` | base | medium | normal | Minimal headings, inline titles |


### Body Text

| Variant | Class | Font Size | Weight | Line Height | Use Case |
|---------|--------|-----------|---------|-------------|----------|
| large | `text-body-large` | lead | normal | relaxed | Introduction paragraphs, lead text |
| normal | `text-body-normal` | base | normal | relaxed | Standard body text, descriptions |
| small | `text-body-small` | body | normal | normal | Secondary information, captions |


### Special Styles

| Style | Class | Font Size | Weight | Special Properties | Use Case |
|--------|--------|-----------|---------|-------------------|----------|
| label | `text-label` | body | medium | - | Form labels, UI element labels |
| caption | `text-caption` | caption | normal | - | Image captions, data descriptions |
| overline | `text-overline` | caption | medium | tracking-wider | Section labels, category tags |
| bitcoin-symbol | `text-bitcoin-symbol` | base | normal | font-sans | Bitcoin symbol display |
| bitcoin-amount | `text-bitcoin-amount` | base | medium | tracking-tight | Bitcoin amount formatting |


---

## Usage Examples

### Basic Implementation

```tsx
import { cn } from '@/lib/utils';

// Semantic heading
<h1 className="text-h1">
  Bitcoin Vesting Calculator
</h1>

// Semantic body text
<p className="text-body-normal">
  Calculate your Bitcoin compensation package value over time.
</p>

// Bitcoin-specific styling
<span className="text-bitcoin-amount">
  ₿ 0.05842751
</span>
```

### Advanced Usage with Custom Properties

```css
.custom-typography {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-relaxed);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color-primary);
}
```

### Responsive Typography

```tsx
// Container queries for responsive typography
<div className="@container">
  <h2 className="text-2xl @md:text-3xl @lg:text-4xl">
    Responsive Heading
  </h2>
</div>
```

### Theme Integration

```tsx
// Typography adapts to theme mode automatically
<div className={themeMode === 'dark' ? 'dark' : ''}>
  <p className="text-primary">
    This text color adapts to the current theme
  </p>
</div>
```

---

## Accessibility Guidelines

### Font Size Requirements

- **Minimum Size**: 12px (0.75rem) for any readable text
- **Body Text**: 16px (1rem) minimum for comfortable reading
- **Touch Targets**: 16px minimum for interactive elements

### Line Height Standards

- **Headlines**: 1.1-1.2 ratio for visual impact
- **Body Text**: 1.4-1.6 ratio for readability
- **UI Elements**: 1.4 ratio for consistent spacing

### Color Contrast

All text colors meet WCAG AA contrast ratios:
- **Normal Text**: 4.5:1 minimum contrast
- **Large Text**: 3:1 minimum contrast
- **UI Elements**: 4.5:1 minimum contrast

### Testing Tools

Use our built-in accessibility validation:

```tsx
import { checkTextSizeAccessibility } from '@/lib/typography';

const validation = checkTextSizeAccessibility(16, 1.4);
console.log(validation.meetsWCAG); // true
console.log(validation.recommendation); // "Excellent readability"
```

---

## Implementation Guide

### 1. Installation

The typography system is included by default in the Bitcoin Benefit platform. No additional installation required.

### 2. CSS Integration

Typography tokens are automatically available as CSS custom properties:

```css
/* Available in all components */
:root {
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --line-height-normal: 1.4;
  --font-weight-semibold: 600;
  /* ... all other tokens */
}
```

### 3. TypeScript Integration

Full type safety for all typography tokens:

```tsx
import type { FontSizeScale, SemanticTypography } from '@/types/typography';
import { TYPOGRAPHY_SYSTEM, getFontSizeVar } from '@/lib/typography';

const fontSize: FontSizeScale = 'xl'; // Type-safe
const cssVar = getFontSizeVar(fontSize); // Returns: var(--font-size-xl)
```

### 4. Component Usage

Use semantic classes for consistent styling:

```tsx
// Preferred: Semantic classes
<h1 className="text-h1">Main Heading</h1>

// Alternative: Direct token classes
<h1 className="text-4xl font-bold leading-tight text-primary">
  Main Heading
</h1>
```

### 5. VSCode Integration

Install the provided snippets for enhanced developer experience:

1. Copy `.vscode/typography.code-snippets` to your workspace
2. Use prefixes like `bt-heading`, `bt-body`, `bt-bitcoin-amount`
3. Get IntelliSense for all typography tokens

---

## Migration Guide

### From Custom CSS

```css
/* Before: Custom CSS */
.heading {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  color: #333;
}

/* After: Typography tokens */
.heading {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  color: var(--text-color-primary);
}
```

### From Tailwind Classes

```tsx
{/* Before: Generic Tailwind */}
<h1 className="text-2xl font-semibold leading-tight text-gray-900">
  Heading
</h1>

{/* After: Semantic typography */}
<h1 className="text-h3">
  Heading
</h1>
```

### Breaking Changes

When migrating existing code:

1. **Font Sizes**: Replace pixel values with scale tokens
2. **Colors**: Use semantic color tokens instead of hex values
3. **Line Heights**: Switch from numeric to named scales
4. **Responsive**: Migrate to fluid typography system

### Migration Checklist

- [ ] Audit existing typography usage
- [ ] Replace hardcoded values with tokens
- [ ] Update component classes to semantic variants
- [ ] Test responsive behavior across breakpoints
- [ ] Validate accessibility compliance
- [ ] Update documentation and style guides

---

## Performance Considerations

### Bundle Size Impact

- **CSS Variables**: ~2KB additional CSS
- **TypeScript Types**: 0KB runtime impact
- **Utility Classes**: Generated on-demand

### Runtime Performance

- **CSS Custom Properties**: Native browser support, no runtime cost
- **Fluid Typography**: Hardware-accelerated CSS calculations
- **Theme Switching**: CSS variables enable instant theme changes

### Optimization Tips

1. **Use Semantic Classes**: Pre-built combinations reduce CSS
2. **Container Queries**: More efficient than media queries
3. **Font Loading**: Typography system supports font-display: swap
4. **Purge Unused**: Remove unused typography classes in production

---

## Browser Support

### Minimum Requirements

- **Chrome**: 88+ (CSS clamp support)
- **Firefox**: 75+ (CSS clamp support)
- **Safari**: 13.1+ (CSS clamp support)
- **Edge**: 88+ (Chromium-based)

### Fallbacks

Automatic fallbacks for older browsers:
- **CSS clamp()**: Falls back to fixed font sizes
- **CSS custom properties**: Falls back to hardcoded values
- **Container queries**: Falls back to media queries

### Progressive Enhancement

The typography system uses progressive enhancement:

1. **Base Layer**: Semantic HTML with basic styling
2. **Enhancement Layer**: CSS custom properties and fluid typography
3. **Advanced Layer**: Container queries and advanced features

---

## Troubleshooting

### Common Issues

#### Typography Not Loading

1. Check CSS custom properties are defined
2. Verify import order in your CSS
3. Ensure theme class is applied to root element

#### Inconsistent Sizing

1. Verify consistent base font size (16px)
2. Check for CSS cascade conflicts
3. Use browser dev tools to inspect computed values

#### Accessibility Warnings

1. Test with our validation utilities
2. Check color contrast ratios
3. Verify minimum font sizes

### Debug Tools

```tsx
// Typography debugging
import { validateTypographyToken } from '@/lib/typography';

const result = validateTypographyToken('fontSize', 'xl');
console.log(result.valid, result.error, result.suggestion);
```

---

## Resources

### Related Documentation

- [Color System Guide](./color-system.md)
- [Component Library](./components/)
- [Accessibility Guidelines](./accessibility.md)
- [Performance Guide](./performance.md)

### External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Clamp Calculator](https://clamp.font-size.app/)
- [Typography Handbook](https://typographyhandbook.com/)

### Support

For questions or issues with the typography system:

1. Check this documentation first
2. Search existing GitHub issues
3. Create a new issue with reproduction steps
4. Join our Discord community for real-time help

---

*This documentation is automatically updated when typography tokens change. Last updated: 2025-08-27T17:11:59.126Z*
