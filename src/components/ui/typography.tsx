/**
 * Typography Component - Bitcoin Benefit Platform
 * 
 * Provides a comprehensive typography component with semantic variants,
 * accessibility features, and theme support.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type {
  HeadingLevel,
  BodyTextVariant,
  SpecialTextStyle,
  FontSizeScale,
  FontWeightScale,
  LineHeightScale,
  TextColor,
  BrandColor
} from '@/types/typography';

// =============================================================================
// TYPOGRAPHY COMPONENT INTERFACES
// =============================================================================

interface BaseTypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

interface HeadingProps extends BaseTypographyProps {
  level: HeadingLevel;
  color?: TextColor | BrandColor;
}

interface BodyTextProps extends BaseTypographyProps {
  variant?: BodyTextVariant;
  color?: TextColor | BrandColor;
}

interface SpecialTextProps extends BaseTypographyProps {
  style: SpecialTextStyle;
  color?: TextColor | BrandColor;
}

interface CustomTypographyProps extends BaseTypographyProps {
  fontSize?: FontSizeScale;
  fontWeight?: FontWeightScale;
  lineHeight?: LineHeightScale;
  color?: TextColor | BrandColor;
}

// =============================================================================
// CLASS MAPPINGS
// =============================================================================

// Static class mappings to avoid dynamic class generation issues with Tailwind
const HEADING_CLASS_MAP: Record<HeadingLevel, string> = {
  'display': 'heading-display',
  'h1': 'heading-1',
  'h2': 'heading-2',
  'h3': 'heading-3',
  'h4': 'heading-4',
  'h5': 'heading-5',
  'h6': 'heading-6'
} as const;

const BODY_CLASS_MAP: Record<BodyTextVariant, string> = {
  'large': 'body-large',
  'normal': 'body-normal',
  'small': 'body-small'
} as const;

const COLOR_CLASS_MAP: Record<TextColor | BrandColor, string> = {
  'primary': 'text-primary',
  'secondary': 'text-secondary',
  'muted': 'text-muted',
  'subtle': 'text-subtle',
  'inverse': 'text-inverse',
  'bitcoin': 'text-bitcoin',
  'bitcoin-dark': 'text-bitcoin-dark',
  'accent': 'text-accent',
  'success': 'text-success',
  'warning': 'text-warning',
  'error': 'text-error'
} as const;

// =============================================================================
// HEADING COMPONENTS
// =============================================================================

/**
 * Semantic heading component with automatic styling
 */
export function Heading({ 
  level, 
  children, 
  className, 
  color,
  as 
}: HeadingProps) {
  const Tag = as || (level === 'display' ? 'h1' : level);
  
  const headingClasses = cn(
    HEADING_CLASS_MAP[level],
    color && COLOR_CLASS_MAP[color],
    className
  );
  
  return (
    <Tag className={headingClasses}>
      {children}
    </Tag>
  );
}

/**
 * Display heading for hero sections
 */
export function DisplayHeading({ children, className, color, as }: Omit<HeadingProps, 'level'>) {
  return (
    <Heading level="display" className={className} color={color} as={as}>
      {children}
    </Heading>
  );
}

/**
 * Primary page heading (H1)
 */
export function PageHeading({ children, className, color, as }: Omit<HeadingProps, 'level'>) {
  return (
    <Heading level="h1" className={className} color={color} as={as}>
      {children}
    </Heading>
  );
}

/**
 * Section heading (H2)
 */
export function SectionHeading({ children, className, color, as }: Omit<HeadingProps, 'level'>) {
  return (
    <Heading level="h2" className={className} color={color} as={as}>
      {children}
    </Heading>
  );
}

/**
 * Subsection heading (H3)
 */
export function SubsectionHeading({ children, className, color, as }: Omit<HeadingProps, 'level'>) {
  return (
    <Heading level="h3" className={className} color={color} as={as}>
      {children}
    </Heading>
  );
}

// =============================================================================
// BODY TEXT COMPONENTS
// =============================================================================

/**
 * Body text component with variant support
 */
export function BodyText({ 
  variant = 'normal', 
  children, 
  className, 
  color,
  as = 'p'
}: BodyTextProps) {
  const Tag = as;
  
  const bodyClasses = cn(
    BODY_CLASS_MAP[variant],
    color && COLOR_CLASS_MAP[color],
    className
  );
  
  return (
    <Tag className={bodyClasses}>
      {children}
    </Tag>
  );
}

/**
 * Large body text for introductions
 */
export function LeadText({ children, className, color, as }: Omit<BodyTextProps, 'variant'>) {
  return (
    <BodyText variant="large" className={className} color={color} as={as}>
      {children}
    </BodyText>
  );
}

/**
 * Small body text for secondary information
 */
export function SmallText({ children, className, color, as }: Omit<BodyTextProps, 'variant'>) {
  return (
    <BodyText variant="small" className={className} color={color} as={as}>
      {children}
    </BodyText>
  );
}

// =============================================================================
// SPECIAL TEXT COMPONENTS
// =============================================================================

/**
 * Special text styles (labels, captions, overlines)
 */
export function SpecialText({ 
  style, 
  children, 
  className, 
  color,
  as = 'span'
}: SpecialTextProps) {
  const Tag = as;
  
  const specialClasses = cn(
    style,
    color && COLOR_CLASS_MAP[color],
    className
  );
  
  return (
    <Tag className={specialClasses}>
      {children}
    </Tag>
  );
}

/**
 * Form label component
 */
export function Label({ 
  children, 
  className, 
  color, 
  htmlFor,
  required = false
}: Omit<SpecialTextProps, 'style' | 'as'> & { 
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn(
        'label',
        color && `text-${color}`,
        className
      )}
    >
      {children}
      {required && <span className="text-error ml-1" aria-label="required">*</span>}
    </label>
  );
}

/**
 * Caption text for images and descriptions
 */
export function Caption({ children, className, color, as }: Omit<SpecialTextProps, 'style'>) {
  return (
    <SpecialText style="caption" className={className} color={color} as={as}>
      {children}
    </SpecialText>
  );
}

/**
 * Overline text for section labels
 */
export function Overline({ children, className, color, as }: Omit<SpecialTextProps, 'style'>) {
  return (
    <SpecialText style="overline" className={className} color={color} as={as}>
      {children}
    </SpecialText>
  );
}

// =============================================================================
// BITCOIN-SPECIFIC COMPONENTS
// =============================================================================

/**
 * Bitcoin symbol component with proper typography
 */
export function BitcoinSymbol({ 
  children = '₿', 
  className, 
  color = 'bitcoin',
  as = 'span'
}: Omit<SpecialTextProps, 'style'> & { children?: React.ReactNode }) {
  return (
    <SpecialText 
      style="bitcoin-symbol" 
      className={className} 
      color={color} 
      as={as}
    >
      {children}
    </SpecialText>
  );
}

/**
 * Bitcoin amount component with proper formatting
 */
export function BitcoinAmount({ 
  amount, 
  showSymbol = true,
  precision = 8,
  className, 
  color = 'bitcoin',
  as = 'span'
}: Omit<SpecialTextProps, 'style' | 'children'> & {
  amount: number;
  showSymbol?: boolean;
  precision?: number;
}) {
  const formattedAmount = amount.toFixed(precision);
  
  return (
    <SpecialText 
      style="bitcoin-amount" 
      className={className} 
      color={color} 
      as={as}
    >
      {showSymbol && <BitcoinSymbol className="mr-1">₿</BitcoinSymbol>}
      {formattedAmount}
    </SpecialText>
  );
}

// =============================================================================
// CUSTOM TYPOGRAPHY COMPONENT
// =============================================================================

/**
 * Custom typography component for advanced use cases
 */
export function Typography({ 
  fontSize,
  fontWeight,
  lineHeight,
  color,
  children,
  className,
  as = 'span'
}: CustomTypographyProps) {
  const Tag = as;
  
  const customClasses = cn(
    fontSize && `text-${fontSize}`,
    fontWeight && `font-${fontWeight}`,
    lineHeight && `leading-${lineHeight}`,
    color && `text-${color}`,
    className
  );
  
  return (
    <Tag className={customClasses}>
      {children}
    </Tag>
  );
}

// =============================================================================
// ACCESSIBILITY HELPERS
// =============================================================================

/**
 * Screen reader only text
 */
export function ScreenReaderOnly({ 
  children, 
  className 
}: Pick<BaseTypographyProps, 'children' | 'className'>) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
}

/**
 * Visually hidden text that becomes visible on focus
 */
export function SkipLink({ 
  href,
  children, 
  className 
}: Pick<BaseTypographyProps, 'children' | 'className'> & { href: string }) {
  return (
    <a 
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50',
        'focus:p-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded focus:shadow-lg',
        className
      )}
    >
      {children}
    </a>
  );
}

// =============================================================================
// COMPOUND COMPONENTS
// =============================================================================

/**
 * Article component with proper typography hierarchy
 */
export function Article({ 
  title,
  subtitle,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn('space-y-4', className)}>
      <header className="space-y-2">
        <PageHeading>{title}</PageHeading>
        {subtitle && (
          <LeadText color="secondary">
            {subtitle}
          </LeadText>
        )}
      </header>
      <div className="prose prose-lg max-w-none">
        {children}
      </div>
    </article>
  );
}

/**
 * Card with typography hierarchy
 */
export function TypographyCard({ 
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 bg-card rounded-lg shadow-sm space-y-4', className)}>
      <header className="space-y-1">
        <SubsectionHeading className="mb-0">{title}</SubsectionHeading>
        {description && (
          <SmallText color="muted">
            {description}
          </SmallText>
        )}
      </header>
      {children}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  type HeadingProps,
  type BodyTextProps,
  type SpecialTextProps,
  type CustomTypographyProps
};

const TypographyComponents = {
  Heading,
  DisplayHeading,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  BodyText,
  LeadText,
  SmallText,
  SpecialText,
  Label,
  Caption,
  Overline,
  BitcoinSymbol,
  BitcoinAmount,
  Typography,
  ScreenReaderOnly,
  SkipLink,
  Article,
  TypographyCard
};

export default TypographyComponents;