# Typography Components Guide
## Bitcoin Benefit Platform

*Generated automatically on 2025-08-27T17:11:59.127Z*

## React Components

### Heading Components

```tsx
import { cn } from '@/lib/utils';

// Semantic heading with automatic styling
export function SemanticHeading({ 
  level, 
  children, 
  className 
}: { 
  level: HeadingLevel; 
  children: React.ReactNode; 
  className?: string;
}) {
  const Tag = level === 'display' ? 'h1' : level;
  
  return (
    <Tag className={cn(`text-${level}`, className)}>
      {children}
    </Tag>
  );
}

// Usage
<SemanticHeading level="h1">Page Title</SemanticHeading>
<SemanticHeading level="h2">Section Heading</SemanticHeading>
```

### Body Text Components

```tsx
// Body text with variant support
export function BodyText({ 
  variant = 'normal', 
  children, 
  className 
}: { 
  variant?: BodyTextVariant; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <p className={cn(`text-body-${variant}`, className)}>
      {children}
    </p>
  );
}

// Usage
<BodyText variant="large">Introduction text</BodyText>
<BodyText>Standard paragraph</BodyText>
<BodyText variant="small">Secondary information</BodyText>
```

### Bitcoin-Specific Components

```tsx
// Bitcoin amount with proper formatting
export function BitcoinAmount({ 
  amount, 
  showSymbol = true,
  className 
}: { 
  amount: number; 
  showSymbol?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('text-bitcoin-amount', className)}>
      {showSymbol && <span className="text-bitcoin-symbol">₿ </span>}
      {amount.toFixed(8)}
    </span>
  );
}

// Usage
<BitcoinAmount amount={0.12345678} />
```

### Form Components

```tsx
// Form label with consistent styling
export function FormLabel({ 
  htmlFor, 
  required = false, 
  children, 
  className 
}: { 
  htmlFor: string; 
  required?: boolean; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={cn('text-label', className)}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}

// Usage
<FormLabel htmlFor="email" required>Email Address</FormLabel>
```

## CSS Utility Classes

### Font Size Classes

- `.text-caption` - 0.75rem to 0.875rem
- `.text-body` - 0.875rem to 1rem
- `.text-base` - 1rem to 1.125rem
- `.text-lead` - 1.125rem to 1.25rem
- `.text-lg` - 1.25rem to 1.375rem
- `.text-xl` - 1.375rem to 1.625rem
- `.text-2xl` - 1.5rem to 1.875rem
- `.text-3xl` - 1.875rem to 2.5rem
- `.text-4xl` - 2.25rem to 3.375rem
- `.text-5xl` - 2.75rem to 4.5rem
- `.text-6xl` - 3.5rem to 6rem
- `.text-display` - 4rem to 8rem

### Semantic Classes

- `.text-display` - display heading
- `.text-h1` - 4xl heading
- `.text-h2` - 3xl heading
- `.text-h3` - 2xl heading
- `.text-h4` - xl heading
- `.text-h5` - lg heading
- `.text-h6` - base heading

- `.text-body-large` - lead body text
- `.text-body-normal` - base body text
- `.text-body-small` - body body text

- `.text-label` - Special styling for label
- `.text-caption` - Special styling for caption
- `.text-overline` - Special styling for overline
- `.text-bitcoin-symbol` - Special styling for bitcoin symbol
- `.text-bitcoin-amount` - Special styling for bitcoin amount

## Best Practices

### 1. Use Semantic Classes First

```tsx
// ✅ Good: Semantic meaning is clear
<h1 className="text-h1">Page Title</h1>
<p className="text-body-normal">Description text</p>

// ❌ Avoid: Requires knowledge of scale
<h1 className="text-4xl font-bold">Page Title</h1>
<p className="text-base">Description text</p>
```

### 2. Combine Classes Thoughtfully

```tsx
// ✅ Good: Semantic base with contextual modifiers
<h2 className="text-h2 text-bitcoin">Bitcoin Price</h2>

// ❌ Avoid: Conflicting typography classes
<h2 className="text-h2 text-xl">Heading</h2> {/* font-size conflict */}
```

### 3. Maintain Hierarchy

```tsx
// ✅ Good: Clear visual hierarchy
<h1 className="text-h1">Main Title</h1>
<h2 className="text-h2">Section</h2>
<h3 className="text-h3">Subsection</h3>

// ❌ Avoid: Broken hierarchy
<h1 className="text-h3">Main Title</h1> {/* Too small for h1 */}
<h2 className="text-h1">Section</h2>   {/* Too large for h2 */}
```

### 4. Consider Context

```tsx
// ✅ Good: Appropriate for Bitcoin context
<span className="text-bitcoin-amount">₿ 1.23456789</span>

// ❌ Avoid: Generic styling for Bitcoin amounts
<span className="text-base font-mono">₿ 1.23456789</span>
```
