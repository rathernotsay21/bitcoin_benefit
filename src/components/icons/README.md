# Bitcoin Icons

A collection of Bitcoin-themed icons converted to React components for easy use in your Next.js application.

## Available Icons

### Filled Icons
- `BitcoinIcon` - Standard Bitcoin symbol
- `BitcoinCircleIcon` - Bitcoin symbol in a circle
- `SatoshiIcon` - Satoshi symbol
- `MiningIcon` - Mining pickaxe
- `BTCIcon` - Official BTC logo with orange background

### Outline Icons
- `BitcoinOutlineIcon` - Outlined Bitcoin symbol
- `BitcoinCircleOutlineIcon` - Outlined Bitcoin in circle
- `SatoshiOutlineIcon` - Outlined Satoshi symbol
- `MinerOutlineIcon` - Outlined miner figure
- `MiningOutlineIcon` - Outlined mining equipment

### Special Icons
- `BitcoinPresentationIcon` - Bitcoin presentation/chart icon
- `BitcoinStyledIcon` - Stylized Bitcoin logo with gradients
- `SatoshiManIcon` - Portrait illustration of Satoshi figure

## Usage

### Basic Usage
```tsx
import { BitcoinIcon, SatoshiIcon } from '@/components/icons';

function MyComponent() {
  return (
    <div>
      <BitcoinIcon />
      <SatoshiIcon size={32} color="#f7931a" />
    </div>
  );
}
```

### With Tailwind Classes
```tsx
import { BitcoinCircleIcon } from '@/components/icons';

function MyComponent() {
  return (
    <BitcoinCircleIcon 
      size={48} 
      className="text-orange-500 hover:text-orange-600 transition-colors" 
    />
  );
}
```

### Using IconWrapper for Consistent Sizing
```tsx
import { IconWrapper, BitcoinIcon } from '@/components/icons';

function MyComponent() {
  return (
    <IconWrapper size="lg" className="text-orange-500">
      <BitcoinIcon />
    </IconWrapper>
  );
}
```

## Props

### Standard Icon Props
- `className?: string` - CSS classes to apply
- `size?: number` - Icon size in pixels (default: 24)
- `color?: string` - Icon color (default: 'currentColor')

### BTCIcon Props
- `className?: string` - CSS classes to apply
- `size?: number` - Icon size in pixels (default: 32)

Note: BTCIcon has fixed colors and doesn't accept a color prop.

## Size Presets

When using `IconWrapper`, you can use these size presets:
- `xs`: 16px
- `sm`: 20px
- `md`: 24px (default)
- `lg`: 32px
- `xl`: 48px

## Showcase

To see all available icons, import and use the `IconShowcase` component:

```tsx
import { IconShowcase } from '@/components/icons';

function ShowcasePage() {
  return <IconShowcase />;
}
```