# Typography Standardization Design Document

## Overview

This design establishes a comprehensive typography system that replaces the current inconsistent font sizing with a clear hierarchy, improves mobile readability, and provides a centralized system for developers to use. The solution leverages Tailwind CSS's utility classes while creating custom typography scales that integrate seamlessly with the existing design system.

## Architecture

### Typography Scale System
The typography system will be built on a modular scale (1.333 ratio) that ensures mathematical harmony:

- **Display**: 64px (4rem) - Used for hero sections and maximum visual impact
- **H1 (Primary Heading)**: 48px (3rem) - Used for page titles and primary CTAs
- **H2 (Section Heading)**: 36px (2.25rem) - Used for major section headers
- **H3 (Subsection Heading)**: 24px (1.5rem) - Used for subsections and card titles
- **Lead Text**: 20px (1.25rem) - Used for intro paragraphs and emphasized body content
- **Body Text**: 18px (1.125rem) desktop / 16px (1rem) mobile - Used for all body content
- **Small Text**: 14px (0.875rem) - Used for secondary information
- **Caption Text**: 12px (0.75rem) - Used for micro-copy and annotations

### Advanced Responsive Strategy
The system will use fluid typography with CSS clamp() functions and viewport units for smooth scaling:

```css
/* Fluid Typography with Clamp */
--text-display: clamp(3rem, 5vw + 1rem, 4rem);
--text-h1: clamp(2.25rem, 4vw + 0.5rem, 3rem);
--text-h2: clamp(1.75rem, 3vw + 0.5rem, 2.25rem);
--text-h3: clamp(1.25rem, 2vw + 0.25rem, 1.5rem);
--text-lead: clamp(1.125rem, 1.5vw + 0.25rem, 1.25rem);
--text-body: clamp(1rem, 1.5vw, 1.125rem);
--text-small: clamp(0.813rem, 1vw, 0.875rem);
--text-caption: clamp(0.688rem, 0.75vw, 0.75rem);

/* Container Queries for Component-Level Responsiveness */
@container (min-width: 400px) {
  .card-title { font-size: var(--text-h3); }
}

/* Motion Preferences */
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

## Components and Interfaces

### Tailwind Configuration Extension with CSS Custom Properties
Extend the existing `tailwind.config.js` with custom typography utilities and CSS variables for runtime theming:

```javascript
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'display': ['var(--text-display)', { lineHeight: '1.1', fontWeight: '800' }],
        'heading-1': ['var(--text-h1)', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['var(--text-h2)', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-3': ['var(--text-h3)', { lineHeight: '1.4', fontWeight: '600' }],
        'lead': ['var(--text-lead)', { lineHeight: '1.6', fontWeight: '500' }],
        'body': ['var(--text-body)', { lineHeight: 'calc(1.5 + 0.2 / var(--text-body))', fontWeight: '400' }],
        'small': ['var(--text-small)', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['var(--text-caption)', { lineHeight: '1.4', fontWeight: '400' }]
      },
      fontFamily: {
        'variable': ['Inter var', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ]
}
```

### Typography Component Classes
Create utility classes that can be applied consistently:

```css
.text-heading-1 { @apply text-heading-1 font-bold leading-tight; }
.text-heading-2 { @apply text-heading-2 font-bold leading-snug; }
.text-heading-3 { @apply text-heading-3 font-bold leading-normal; }
.text-body { @apply text-body font-normal leading-relaxed; }
.text-small { @apply text-small font-normal leading-normal; }
```

### React Typography Components with Enhanced Features
Create reusable React components with hooks and dynamic styling:

```typescript
import { useTypography } from '@/hooks/useTypography';
import { TypographyVariant, TypographyProps } from '@/types/typography';

interface EnhancedTypographyProps extends TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  variant?: TypographyVariant;
  responsive?: boolean;
  animate?: boolean;
}

export const Typography: React.FC<EnhancedTypographyProps> = ({ 
  children, 
  className, 
  as = 'div',
  variant = 'body',
  responsive = true,
  animate = false 
}) => {
  const { getTypographyClasses, getFocusStyles } = useTypography();
  const Component = as;
  
  return (
    <Component 
      className={`
        ${getTypographyClasses(variant, responsive)}
        ${getFocusStyles()}
        ${animate ? 'transition-all duration-200' : ''}
        ${className || ''}
      `.trim()}
    >
      {children}
    </Component>
  );
};

// useTypography Hook
export const useTypography = () => {
  const getTypographyClasses = (variant: TypographyVariant, responsive: boolean) => {
    const baseClasses = {
      display: 'text-display font-variable font-extrabold',
      h1: 'text-heading-1 font-variable font-bold',
      h2: 'text-heading-2 font-variable font-bold',
      h3: 'text-heading-3 font-variable font-semibold',
      lead: 'text-lead font-variable font-medium',
      body: 'text-body font-variable font-normal',
      small: 'text-small font-variable font-normal',
      caption: 'text-caption font-variable font-normal'
    };
    
    return responsive ? `${baseClasses[variant]} @container-sm:scale-105` : baseClasses[variant];
  };
  
  const getFocusStyles = () => 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bitcoin-primary';
  
  return { getTypographyClasses, getFocusStyles };
};
```

## Data Models

### Typography Token System and Configuration
```typescript
// Typography Tokens
interface TypographyTokens {
  sizes: {
    display: { value: string; fluid: string; };
    h1: { value: string; fluid: string; };
    h2: { value: string; fluid: string; };
    h3: { value: string; fluid: string; };
    lead: { value: string; fluid: string; };
    body: { value: string; fluid: string; };
    small: { value: string; fluid: string; };
    caption: { value: string; fluid: string; };
  };
  weights: {
    thin: 100;
    light: 300;
    regular: 400;
    medium: 500;
    semibold: 600;
    bold: 700;
    extrabold: 800;
  };
  lineHeights: {
    tight: 1.1;
    snug: 1.3;
    normal: 1.5;
    relaxed: 1.6;
    loose: 1.8;
    dynamic: (fontSize: number) => number;
  };
  fontFamilies: {
    primary: string[];
    mono: string[];
    bitcoin: string[];
  };
}

// Typography Context
interface TypographyContextValue {
  tokens: TypographyTokens;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: string) => void;
  getComputedStyles: (variant: TypographyVariant) => CSSProperties;
  generateDocumentation: () => DocumentationOutput;
}

// Performance Configuration
interface PerformanceConfig {
  fontSubsetting: {
    ranges: string[];
    bitcoinSymbols: string[];
  };
  criticalCSS: {
    extract: boolean;
    inline: boolean;
  };
  variableFonts: {
    enabled: boolean;
    axes: string[];
  };
}
```

## Error Handling and Performance

### Enhanced Fallback Typography
- Variable font loading with automatic weight interpolation fallback
- CSS `font-display: swap` with font-size-adjust for x-height consistency
- Fallback font stack with metric-compatible alternatives
- Font subsetting for Bitcoin symbols (₿, ₑ, ⚡) and special characters

### Performance Optimizations
```css
/* Font Subsetting */
@font-face {
  font-family: 'Inter var';
  src: url('/fonts/inter-var-subset.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  font-size-adjust: 0.545; /* Maintains x-height consistency */
  unicode-range: U+0020-007E, U+20BF, U+20B1, U+26A1; /* Basic Latin + Bitcoin symbols */
}

/* Critical CSS Extraction */
/* Typography critical styles are inlined in <head> */
:root {
  /* CSS Custom Properties for Runtime Theming */
  --typography-scale: 1.333;
  --typography-base: 16;
  --typography-line-height-multiplier: 0.2;
}
```

### Validation
- TypeScript interfaces ensure proper usage of typography components
- ESLint rules can be added to prevent hardcoded font sizes
- Build-time validation to ensure all typography classes are properly defined

## Testing Strategy

### Visual Regression Testing
- Screenshot comparisons across different screen sizes
- Automated testing of typography hierarchy on key pages
- Cross-browser compatibility testing for font rendering

### Accessibility Testing
- Automated WCAG compliance checks for contrast ratios
- Screen reader testing for proper heading hierarchy
- Keyboard navigation testing with focus indicators

### Performance Testing
- Font loading performance optimization
- CSS bundle size impact measurement
- Runtime performance of responsive typography calculations

### Unit Testing
- Test typography utility functions
- Validate responsive breakpoint calculations
- Test React component prop handling and className merging

### Integration Testing
- Test typography system integration with existing components
- Validate consistent application across different page types
- Test interaction with existing color system and spacing

### Manual Testing Checklist
- Visual hierarchy verification on all major pages
- Mobile readability testing on actual devices
- Cross-browser font rendering consistency
- Accessibility testing with screen readers and keyboard navigation

## Architecture Components

### Typography Context Provider
```typescript
export const TypographyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  
  const value = useMemo(() => ({
    tokens: typographyTokens,
    theme,
    setTheme,
    getComputedStyles,
    generateDocumentation
  }), [theme]);
  
  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
};
```

### Developer Experience Tools

#### VSCode Snippets
```json
{
  "Typography Component": {
    "prefix": "typo",
    "body": [
      "<Typography variant='$1' as='$2'>$3</Typography>"
    ]
  }
}
```

#### Interactive Typography Playground
- Live preview of all typography variants
- Real-time editing of CSS variables
- Accessibility testing integration
- Export functionality for design tokens

#### Automated Migration Codemods
```javascript
// Example codemod for migrating legacy font sizes
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  return j(fileInfo.source)
    .find(j.JSXAttribute, { name: { name: 'className' } })
    .forEach(path => {
      // Replace hardcoded text-[size] with typography variants
      path.value.value.value = path.value.value.value
        .replace(/text-4xl/g, 'text-heading-1')
        .replace(/text-3xl/g, 'text-heading-2')
        .replace(/text-2xl/g, 'text-heading-3');
    })
    .toSource();
};
```

## Implementation Phases

### Phase 1: Core System & CSS Variables
- Implement CSS custom properties for runtime theming
- Set up variable font loading with subsetting
- Create typography token system
- Configure modular scale calculations

### Phase 2: Components & Hooks
- Build Typography component with all variants
- Implement useTypography() hook
- Create Typography Context Provider
- Add container query support

### Phase 3: Performance & Optimization
- Implement font subsetting for Bitcoin symbols
- Set up critical CSS extraction
- Configure variable fonts
- Add font-size-adjust for consistency

### Phase 4: Migration & Automation
- Create automated codemods
- Build migration utilities
- Generate documentation from tokens
- Set up VSCode snippets

### Phase 5: Documentation & Playground
- Build interactive typography playground
- Generate automated documentation
- Create accessibility testing suite
- Implement visual regression tests