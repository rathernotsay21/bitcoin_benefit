# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bitcoin Benefit is a comprehensive Bitcoin vesting calculator and benefits platform that helps companies implement Bitcoin-based employee compensation packages. The platform provides both future projections (20-year forecasts) and historical analysis (2015-present) for three distinct vesting schemes: Pioneer (accelerator), Stacker (steady-builder), and Builder (slow-burn).

## Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production (includes prebuild step)
npm start                      # Start production server

# Quality Assurance
npm run lint                   # Lint code
npm run type-check            # TypeScript type checking without emitting

# Testing
npm test                      # Run all tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage
npm run test:performance     # Run performance tests only
npm run benchmark            # Run performance benchmarks

# Data Management
npm run update-bitcoin-data   # Update historical Bitcoin price data from CoinGecko API
npm run clear-bitcoin-cache   # Clear Bitcoin price cache
```

## Architecture

### Core Calculation System
The platform is built around three main calculation engines:

1. **Future Projections** (`src/lib/vesting-calculations.ts`): Projects potential outcomes over 20 years with customizable Bitcoin growth assumptions
2. **Historical Analysis** (`src/lib/historical-calculations.ts`): Analyzes actual performance from 2015 to present with multiple cost basis methods (Average, High, Low)
3. **Vesting Schemes** (`src/lib/vesting-schemes.ts`): Defines the three core vesting strategies with configurable parameters

### State Management Architecture
- **Zustand stores** for global state management:
  - `calculatorStore.ts`: Future calculator state and UI controls
  - `historicalCalculatorStore.ts`: Historical calculator state and settings
- **React Hook Form + Zod** for form validation and user inputs

### Component Architecture
- **Chart Components**: Built with Recharts for interactive visualizations
  - `VestingTimelineChartRecharts.tsx`: Main future projections chart
  - `HistoricalTimelineVisualizationOptimized.tsx`: Performance-optimized historical chart
- **Performance Optimization**: Components with `*Optimized.tsx` suffix use memoization and virtualization for large datasets

### Data Flow
1. **Static Data Generation**: `scripts/generate-static-data.js` runs during prebuild to create optimized JSON files
2. **Real-time Data**: CoinGecko API integration with caching and fallbacks for live Bitcoin prices
3. **Historical Data**: Static JSON files in `public/data/` for historical Bitcoin prices (2015-present)

### Tech Stack Integration
- **Next.js 14 App Router**: File-based routing with API routes for data fetching
- **TypeScript**: Strict mode with comprehensive type checking
- **Tailwind CSS + Headless UI**: Responsive design with accessible components
- **Vitest**: Testing with React Testing Library for component tests and performance validation

## Code Conventions

- **File Organization**: Features organized by domain (calculators, historical, on-chain tracking)
- **Component Naming**: PascalCase for components, `*Optimized.tsx` suffix for performance-critical components
- **Import Strategy**: Absolute imports using `@/` prefix, named exports preferred
- **Performance**: Use memoization (`useMemo`, `useCallback`) for expensive calculations, code splitting for large components

## Testing Strategy

- **Unit Tests**: Component and function testing with Vitest
- **Performance Tests**: `*.performance.test.ts` files for benchmark validation
- **Integration Tests**: Full calculator workflow testing
- **Pre-commit Hooks**: Available via `npm run test:hooks:install` for automated quality checks

## Data Sources

- **CoinGecko API**: Live Bitcoin price data with rate limiting and error handling
- **Static Historical Data**: Pre-generated JSON files for 2015-present price history
- **Vesting Configuration**: Three predefined schemes with customizable grant amounts

## Deployment

- **Platform**: Netlify with automatic deployments
- **Build Optimization**: Webpack optimizations, code splitting, and static asset optimization
- **Performance**: Advanced caching strategies and bundle analysis available via `npm run build:analyze`