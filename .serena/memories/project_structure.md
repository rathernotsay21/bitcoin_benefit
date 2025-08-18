# Bitcoin Benefit - Project Structure

## Root Directory
```
/
├── public/                 # Static assets and data
│   └── data/               # Static JSON data for prices
├── scripts/                # Node.js scripts for maintenance
├── src/                    # Main source code
├── docs/                   # Documentation
├── reports/                # Performance and audit reports
├── logs/                   # Application logs
└── config files            # Various configuration files
```

## Source Code Structure (`src/`)
```
src/
├── app/                    # Next.js App Router pages
│   ├── calculator/         # Future vesting calculator
│   ├── historical/         # Historical analysis calculator
│   ├── track/              # On-chain vesting tracker
│   ├── learn/              # Educational content
│   ├── api/                # API routes
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── charts/             # Chart components
│   ├── on-chain/           # On-chain tracking components
│   ├── icons/              # Custom icon components
│   ├── loading/            # Loading state components
│   └── calculators/        # Calculator-specific components
├── lib/                    # Core business logic
│   ├── calculators/        # Calculation engines
│   ├── on-chain/           # On-chain data processing
│   ├── utils/              # Utility functions
│   └── schemas/            # Zod validation schemas
├── stores/                 # Zustand state management
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── data/                   # Static data files
```

## Key Files
- `src/lib/vesting-schemes.ts` - Vesting scheme configurations
- `src/lib/vesting-calculations.ts` - Future calculation engine
- `src/lib/historical-calculations.ts` - Historical calculation engine
- `src/stores/calculatorStore.ts` - Future calculator state
- `src/stores/historicalCalculatorStore.ts` - Historical calculator state
- `src/components/VestingTimelineChartRecharts.tsx` - Main chart component

## Configuration Files
- `next.config.js` - Next.js configuration with performance optimizations
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration
- `.eslintrc.json` - ESLint rules
- `package.json` - Dependencies and scripts