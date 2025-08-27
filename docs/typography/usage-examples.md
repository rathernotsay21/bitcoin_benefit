# Typography Usage Examples
## Bitcoin Benefit Platform

*Practical examples and implementation patterns for the typography system*

---

## Table of Contents

1. [Basic Component Usage](#basic-component-usage)
2. [Advanced Patterns](#advanced-patterns)
3. [Bitcoin-Specific Examples](#bitcoin-specific-examples)
4. [Form Typography](#form-typography)
5. [Layout Combinations](#layout-combinations)
6. [Theme Integration](#theme-integration)
7. [Responsive Patterns](#responsive-patterns)
8. [Custom Implementations](#custom-implementations)

---

## Basic Component Usage

### Page Structure

```tsx
import {
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  BodyText,
  LeadText
} from '@/components/ui/typography';

function HomePage() {
  return (
    <main>
      {/* Hero section */}
      <section className="py-16">
        <PageHeading className="mb-4">
          Bitcoin Vesting Calculator
        </PageHeading>
        <LeadText className="max-w-2xl mx-auto text-center">
          Calculate the future value of your Bitcoin-based compensation 
          package with our comprehensive vesting calculator.
        </LeadText>
      </section>
      
      {/* Features section */}
      <section className="py-12">
        <SectionHeading className="mb-8">
          Key Features
        </SectionHeading>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <SubsectionHeading className="mb-3">
              Future Projections
            </SubsectionHeading>
            <BodyText>
              Model potential Bitcoin value growth over your vesting period
              with multiple scenario analyses.
            </BodyText>
          </div>
          
          <div>
            <SubsectionHeading className="mb-3">
              Historical Analysis
            </SubsectionHeading>
            <BodyText>
              Analyze past performance data to understand potential 
              compensation outcomes.
            </BodyText>
          </div>
          
          <div>
            <SubsectionHeading className="mb-3">
              Risk Assessment
            </SubsectionHeading>
            <BodyText>
              Comprehensive risk modeling including volatility analysis 
              and scenario planning.
            </BodyText>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Article Layout

```tsx
import { Article, BodyText, SmallText } from '@/components/ui/typography';

function BlogPost() {
  return (
    <Article 
      title="Understanding Bitcoin Vesting Schedules"
      subtitle="A comprehensive guide to Bitcoin-based compensation packages"
      className="max-w-4xl mx-auto"
    >
      <BodyText className="mb-6">
        Bitcoin vesting schedules have become increasingly popular as companies 
        look to attract and retain talent in the digital asset space.
      </BodyText>
      
      <BodyText className="mb-4">
        Unlike traditional equity vesting, Bitcoin vesting introduces unique 
        considerations around price volatility, tax implications, and 
        long-term value appreciation.
      </BodyText>
      
      <footer className="mt-8 pt-4 border-t">
        <SmallText color="muted">
          Published on August 27, 2025 • 5 min read
        </SmallText>
      </footer>
    </Article>
  );
}
```

## Advanced Patterns

### Card Components with Typography Hierarchy

```tsx
import {
  TypographyCard,
  SubsectionHeading,
  BodyText,
  SmallText,
  BitcoinAmount
} from '@/components/ui/typography';

function VestingCard({ schedule }) {
  return (
    <TypographyCard
      title="4-Year Vesting Schedule"
      description="Standard vesting with 1-year cliff"
      className="hover:shadow-md transition-shadow"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <BodyText color="muted">Total Allocation:</BodyText>
          <BitcoinAmount amount={schedule.totalAllocation} />
        </div>
        
        <div className="flex justify-between items-center">
          <BodyText color="muted">Monthly Vesting:</BodyText>
          <BitcoinAmount amount={schedule.monthlyAmount} />
        </div>
        
        <div className="bg-muted/20 p-3 rounded">
          <SmallText color="muted" className="mb-1">
            Next Vesting Date
          </SmallText>
          <BodyText className="font-semibold">
            {schedule.nextVestingDate}
          </BodyText>
        </div>
      </div>
    </TypographyCard>
  );
}
```

### Complex Dashboard Layout

```tsx
import {
  DisplayHeading,
  SectionHeading,
  BodyText,
  Label,
  Caption,
  BitcoinAmount,
  Overline
} from '@/components/ui/typography';

function Dashboard({ data }) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header>
        <DisplayHeading className="mb-2">
          Portfolio Overview
        </DisplayHeading>
        <BodyText variant="large" color="muted">
          Your Bitcoin compensation tracking dashboard
        </BodyText>
      </header>
      
      {/* Key Metrics */}
      <section>
        <SectionHeading className="mb-6">
          Key Metrics
        </SectionHeading>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card p-4 rounded-lg">
            <Overline className="mb-2">Total Vested</Overline>
            <BitcoinAmount 
              amount={data.totalVested} 
              className="text-2xl font-bold mb-1" 
            />
            <Caption color="success">
              +12.5% from last month
            </Caption>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <Overline className="mb-2">Current Value</Overline>
            <BodyText className="text-2xl font-bold mb-1">
              ${data.currentValue.toLocaleString()}
            </BodyText>
            <Caption color="bitcoin">
              ₿ {data.btcValue.toFixed(8)}
            </Caption>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <Overline className="mb-2">Next Vesting</Overline>
            <BodyText className="text-2xl font-bold mb-1">
              {data.nextVesting.days} days
            </BodyText>
            <Caption color="muted">
              {data.nextVesting.date}
            </Caption>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <Overline className="mb-2">Projected Value</Overline>
            <BodyText className="text-2xl font-bold mb-1">
              ${data.projectedValue.toLocaleString()}
            </BodyText>
            <Caption color="accent">
              4-year estimate
            </Caption>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## Bitcoin-Specific Examples

### Bitcoin Price Display

```tsx
import {
  BitcoinAmount,
  BitcoinSymbol,
  BodyText,
  SmallText
} from '@/components/ui/typography';

function BitcoinPriceCard({ price, change24h, volume }) {
  return (
    <div className="bg-card p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <BitcoinSymbol className="text-3xl mr-2" />
        <BodyText className="text-2xl font-bold">
          Bitcoin
        </BodyText>
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold">
          ${price.toLocaleString()}
        </div>
        
        <div className="flex items-center space-x-2">
          <SmallText 
            color={change24h >= 0 ? 'success' : 'error'}
            className="font-semibold"
          >
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </SmallText>
          <SmallText color="muted">
            24h change
          </SmallText>
        </div>
        
        <div className="pt-2 border-t">
          <SmallText color="muted">Volume (24h):</SmallText>
          <BitcoinAmount amount={volume} className="ml-2" />
        </div>
      </div>
    </div>
  );
}
```

### Transaction History

```tsx
import {
  SectionHeading,
  BodyText,
  SmallText,
  BitcoinAmount,
  Caption
} from '@/components/ui/typography';

function TransactionHistory({ transactions }) {
  return (
    <section>
      <SectionHeading className="mb-6">
        Transaction History
      </SectionHeading>
      
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-card p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <BodyText className="font-semibold mb-1">
                  {tx.type === 'vest' ? 'Vesting Payment' : 'Transfer'}
                </BodyText>
                <SmallText color="muted">
                  {tx.date}
                </SmallText>
              </div>
              
              <div className="text-right">
                <BitcoinAmount 
                  amount={tx.amount} 
                  className="font-semibold"
                />
                <SmallText color="muted" className="block">
                  ${tx.usdValue.toLocaleString()}
                </SmallText>
              </div>
            </div>
            
            <Caption color="muted">
              TX: {tx.transactionId.slice(0, 16)}...
            </Caption>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Form Typography

### Comprehensive Form Example

```tsx
import {
  SectionHeading,
  Label,
  BodyText,
  SmallText,
  Caption
} from '@/components/ui/typography';

function VestingCalculatorForm() {
  return (
    <form className="space-y-6">
      <SectionHeading className="mb-6">
        Vesting Calculator
      </SectionHeading>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="btc-amount" required className="mb-2 block">
            Bitcoin Amount
          </Label>
          <input
            id="btc-amount"
            type="number"
            step="0.00000001"
            className="w-full p-3 border rounded-lg"
            placeholder="0.00000000"
          />
          <SmallText color="muted" className="mt-1">
            Enter the total Bitcoin amount in your vesting schedule
          </SmallText>
        </div>
        
        <div>
          <Label htmlFor="vesting-period" className="mb-2 block">
            Vesting Period (months)
          </Label>
          <select 
            id="vesting-period"
            className="w-full p-3 border rounded-lg"
          >
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
            <option value="48">48 months</option>
          </select>
          <SmallText color="muted" className="mt-1">
            Standard vesting periods range from 1-4 years
          </SmallText>
        </div>
        
        <div>
          <Label htmlFor="cliff-period" className="mb-2 block">
            Cliff Period (months)
          </Label>
          <input
            id="cliff-period"
            type="number"
            min="0"
            max="12"
            className="w-full p-3 border rounded-lg"
            placeholder="12"
          />
          <SmallText color="muted" className="mt-1">
            Period before first vesting occurs (typically 12 months)
          </SmallText>
        </div>
      </div>
      
      <div className="bg-muted/20 p-4 rounded-lg">
        <Caption className="mb-2">
          <strong>Note:</strong> Calculations are estimates based on current 
          market conditions and historical data. Actual results may vary.
        </Caption>
      </div>
    </form>
  );
}
```

### Form Validation Messages

```tsx
import {
  Label,
  SmallText
} from '@/components/ui/typography';

function FormField({ label, error, success, children }) {
  return (
    <div className="space-y-2">
      <Label className={error ? 'text-error' : ''}>
        {label}
      </Label>
      
      {children}
      
      {error && (
        <SmallText color="error" className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          {error}
        </SmallText>
      )}
      
      {success && (
        <SmallText color="success" className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor">
            <path d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </SmallText>
      )}
    </div>
  );
}
```

## Layout Combinations

### Hero Section with Multiple Typography Elements

```tsx
import {
  DisplayHeading,
  LeadText,
  BodyText,
  BitcoinAmount,
  Overline
} from '@/components/ui/typography';

function HeroSection() {
  return (
    <section className="py-20 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <Overline className="text-bitcoin">
          Bitcoin Compensation Platform
        </Overline>
        
        <DisplayHeading className="max-w-3xl mx-auto">
          Calculate Your Bitcoin Vesting Value
        </DisplayHeading>
        
        <LeadText className="max-w-2xl mx-auto text-muted">
          The most comprehensive Bitcoin vesting calculator with real-time 
          pricing, historical analysis, and future projections.
        </LeadText>
        
        <div className="flex justify-center items-center space-x-8 pt-6">
          <div className="text-center">
            <BodyText color="muted" className="mb-1">
              Current Bitcoin Price
            </BodyText>
            <BodyText className="text-2xl font-bold">
              $67,234
            </BodyText>
          </div>
          
          <div className="text-center">
            <BodyText color="muted" className="mb-1">
              Example Vesting
            </BodyText>
            <BitcoinAmount 
              amount={0.5} 
              className="text-2xl font-bold text-bitcoin" 
            />
          </div>
        </div>
        
        <div className="pt-6">
          <button className="bg-bitcoin text-white px-8 py-3 rounded-lg font-semibold hover:bg-bitcoin-dark transition-colors">
            Start Calculating
          </button>
        </div>
      </div>
    </section>
  );
}
```

### Sidebar Navigation with Typography

```tsx
import {
  SectionHeading,
  BodyText,
  SmallText
} from '@/components/ui/typography';

function NavigationSidebar({ sections }) {
  return (
    <nav className="w-64 bg-card p-6 space-y-6">
      <SectionHeading className="mb-6">
        Navigation
      </SectionHeading>
      
      {sections.map((section) => (
        <div key={section.id} className="space-y-2">
          <BodyText className="font-semibold">
            {section.title}
          </BodyText>
          
          <ul className="space-y-1 ml-4">
            {section.items.map((item) => (
              <li key={item.id}>
                <a 
                  href={item.href}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <SmallText>{item.label}</SmallText>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

## Theme Integration

### Theme-Aware Components

```tsx
import {
  PageHeading,
  BodyText,
  BitcoinAmount
} from '@/components/ui/typography';

function ThemeAwareCard({ theme }) {
  return (
    <div className={`p-6 rounded-lg ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Text colors automatically adapt to theme */}
      <PageHeading className="mb-4">
        Portfolio Summary
      </PageHeading>
      
      <BodyText className="mb-6">
        Your Bitcoin holdings and vesting schedule overview.
      </BodyText>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <BodyText color="muted" className="mb-1">
            Total Vested
          </BodyText>
          <BitcoinAmount amount={1.25} className="text-xl font-bold" />
        </div>
        
        <div>
          <BodyText color="muted" className="mb-1">
            Pending
          </BodyText>
          <BitcoinAmount amount={2.75} className="text-xl font-bold" />
        </div>
      </div>
    </div>
  );
}
```

### High Contrast Mode Support

```tsx
import { BodyText, BitcoinAmount } from '@/components/ui/typography';

function AccessibleCard({ data }) {
  return (
    <div className="p-6 bg-card rounded-lg">
      {/* Typography automatically adjusts for high contrast */}
      <BodyText className="mb-4 font-semibold">
        Account Balance
      </BodyText>
      
      {/* Bitcoin colors adjust for accessibility */}
      <BitcoinAmount 
        amount={data.balance} 
        className="text-2xl font-bold"
      />
      
      {/* Status indicators with proper contrast */}
      <BodyText 
        color={data.status === 'active' ? 'success' : 'error'}
        className="mt-2 font-medium"
      >
        Status: {data.status}
      </BodyText>
    </div>
  );
}
```

## Responsive Patterns

### Mobile-First Typography

```tsx
import {
  DisplayHeading,
  SectionHeading,
  BodyText
} from '@/components/ui/typography';

function ResponsiveLanding() {
  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Fluid typography scales automatically */}
      <DisplayHeading className="mb-6 text-center lg:text-left">
        Bitcoin Vesting Made Simple
      </DisplayHeading>
      
      <BodyText variant="large" className="mb-8 text-center lg:text-left">
        Calculate, track, and optimize your Bitcoin compensation package 
        with our comprehensive suite of tools.
      </BodyText>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.id} className="text-center md:text-left">
            <SectionHeading className="mb-3">
              {feature.title}
            </SectionHeading>
            <BodyText>
              {feature.description}
            </BodyText>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Container Query Integration

```tsx
import { Typography } from '@/components/ui/typography';

function ContainerResponsiveCard({ title, content }) {
  return (
    <div className="@container p-6 bg-card rounded-lg">
      {/* Typography adjusts based on container size */}
      <Typography 
        as="h3"
        fontSize="lg"
        fontWeight="semibold"
        className="@md:text-xl @lg:text-2xl mb-4"
      >
        {title}
      </Typography>
      
      <Typography 
        as="p"
        fontSize="base"
        className="@md:text-lg"
        color="secondary"
      >
        {content}
      </Typography>
    </div>
  );
}
```

## Custom Implementations

### Custom Typography Hook

```tsx
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

function useTypography({
  fontSize = 'base',
  fontWeight = 'normal',
  lineHeight = 'normal',
  color = 'primary',
  className
}) {
  return useMemo(() => cn(
    `text-${fontSize}`,
    `font-${fontWeight}`,
    `leading-${lineHeight}`,
    `text-${color}`,
    className
  ), [fontSize, fontWeight, lineHeight, color, className]);
}

// Usage
function CustomComponent() {
  const headingClasses = useTypography({
    fontSize: '2xl',
    fontWeight: 'bold',
    color: 'bitcoin'
  });
  
  return (
    <h2 className={headingClasses}>
      Custom Styled Heading
    </h2>
  );
}
```

### Dynamic Typography Component

```tsx
import { Typography } from '@/components/ui/typography';

function DynamicText({ variant, children, ...props }) {
  const variants = {
    'hero': {
      fontSize: 'display',
      fontWeight: 'bold',
      lineHeight: 'tight',
      color: 'primary'
    },
    'subtitle': {
      fontSize: 'lead',
      fontWeight: 'normal',
      lineHeight: 'relaxed',
      color: 'secondary'
    },
    'bitcoin-price': {
      fontSize: '2xl',
      fontWeight: 'bold',
      color: 'bitcoin',
      className: 'font-mono tabular-nums'
    }
  };
  
  const config = variants[variant] || variants.subtitle;
  
  return (
    <Typography {...config} {...props}>
      {children}
    </Typography>
  );
}

// Usage
<DynamicText variant="hero">
  Welcome to Bitcoin Benefit
</DynamicText>

<DynamicText variant="bitcoin-price">
  $67,234.56
</DynamicText>
```

---

## Integration with State Management

### Zustand Store Integration

```tsx
import { create } from 'zustand';
import { BodyText, BitcoinAmount } from '@/components/ui/typography';

const useTypographyStore = create((set) => ({
  theme: 'light',
  fontSize: 'base',
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize })
}));

function ThemedComponent() {
  const { theme, fontSize } = useTypographyStore();
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <BodyText className={`text-${fontSize}`}>
        This text adapts to user preferences
      </BodyText>
      
      <BitcoinAmount amount={1.5} className={`text-${fontSize}`} />
    </div>
  );
}
```

---

*These examples demonstrate the full capabilities of the Bitcoin Benefit typography system. For more specific use cases or custom implementations, refer to the [API Reference](./api-reference.md) or [Integration Guide](./integration-guide.md).*