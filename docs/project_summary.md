# Bitcoin Vesting Calculator - Project Summary

## 1. Project Overview
A comprehensive web application for employers to plan and visualize Bitcoin vesting schemes for their employees. The calculator offers multiple vesting strategies designed to incentivize employee retention while introducing them to Bitcoin as a store of value. The application features two main calculators: a "Future Calculator" for projecting potential outcomes and a "Historical Calculator" for analyzing past performance.

## 2. 🎯 Current Implementation Status

#### **Core Application Infrastructure**
- **Framework**: Next.js 14 with App Router, deployed on Netlify.
- **Language**: TypeScript, with strict type checking.
- **Styling**: Tailwind CSS for a professional and responsive design.
- **State Management**: Zustand for efficient, centralized state management.
- **Data Fetching**: Integration with CoinGecko API for live and historical Bitcoin prices, with caching and fallback mechanisms.
- **Performance**: Heavily optimized with code splitting, static data generation, and optimized components.

#### **Calculators & Features**
- **Future Calculator**:
  - Three pre-configured vesting schemes with customizable grant amounts.
  - Real-time calculations and interactive charts (Recharts).
  - URL deep linking for sharing specific plan configurations.
- **Historical Calculator**:
  - Analyzes scheme performance using historical data from 2015.
  - Supports multiple cost basis methods (Average, High, Low).
  - Detailed annual breakdown and performance metrics (Total Return, Annualized Return).
- **Vesting Schemes**:
  - **Pioneer (`accelerator`)**: Aggressive plan with a large upfront grant.
  - **Stacker (`steady-builder`)**: Balanced approach with an initial grant and annual bonuses.
  - **Builder (`slow-burn`)**: Conservative, long-term plan with annual grants over a decade.

## 3. 🔧 Technical Implementation

#### **Architecture**
The project follows a modern frontend architecture, leveraging the Next.js App Router for server-side rendering and static site generation where appropriate.

```
/
├── public/                 # Static assets, including pre-generated JSON data
├── scripts/                # Node.js scripts for data management and other tasks
├── src/
│   ├── app/                # Next.js pages and layouts
│   ├── components/         # Reusable React components
│   ├── lib/                # Core business logic and API clients
│   │   ├── calculators/    # Specialized calculation modules (tax, risk, etc.)
│   │   └── ...
│   ├── stores/             # Zustand state management stores
│   └── types/              # TypeScript definitions
└── next.config.js          # Next.js configuration with webpack optimizations
```

#### **State Management & Data Flow**
- **Zustand Stores**: `calculatorStore.ts` and `historicalCalculatorStore.ts` manage the state for their respective calculators. They handle user inputs, API data, and calculation results.
- **Data Fetching**: The `BitcoinAPI` and `HistoricalBitcoinAPI` classes in `src/lib/` are responsible for fetching data from CoinGecko. They include caching to minimize API calls.
- **Component Interaction**: Components dispatch actions to the Zustand stores. The stores then update their state, and the components re-render with the new data. Calculations are often debounced to prevent excessive processing while the user is typing.

#### **Performance & Optimization**
The application is designed for high performance:
- **Static Data**: `scripts/generate-static-data.js` and `scripts/update-bitcoin-data.js` are used to create static JSON files for historical prices and pre-calculated results. This reduces client-side processing and API calls.
- **Code Splitting**: The `next.config.js` file contains extensive webpack optimizations to split code into logical chunks (e.g., for Recharts, UI libraries), which are loaded on demand.
- **Optimized Components**: Components like `HistoricalTimelineVisualizationOptimized` are used to ensure smooth rendering of charts and data.
- **Lazy Loading**: `next/dynamic` is used to lazy-load components that are not needed for the initial render.

## 4. 🚀 Getting Started & Useful Commands

### **Setup**
```bash
# Clone the repository and navigate into it
git clone https://github.com/yourusername/bitcoin_benefit.git
cd bitcoin_benefit

# Install dependencies
npm install

# Run the development server
npm run dev
```

### **Key Scripts**
This project comes with a rich set of scripts defined in `package.json`:

| Command                       | Description                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`                 | Starts the development server with hot-reloading.                            |
| `npm run build`               | Creates a production-ready build of the application.                         |
| `npm run lint`                | Lints the codebase using ESLint.                                             |
| `npm run test`                | Runs the full test suite using Vitest.                                       |
| `npm run test:watch`          | Runs tests in watch mode.                                                    |
| `npm run test:coverage`       | Runs tests and generates a coverage report.                                  |
| `npm run update-bitcoin-data` | Fetches the latest historical Bitcoin data from CoinGecko and updates static files. |
| `npm run deploy`              | Builds and deploys the application to Netlify.                               |

### **Key Files to Understand**
-   `src/stores/calculatorStore.ts`: Global state for the Future Calculator.
-   `src/stores/historicalCalculatorStore.ts`: Global state for the Historical Calculator.
-   `src/lib/vesting-calculations.ts`: Core calculation engine for the Future Calculator.
-   `src/lib/historical-calculations.ts`: Core calculation engine for the Historical Calculator.
-   `src/lib/vesting-schemes.ts`: Definitions for the pre-configured vesting plans.
-   `next.config.js`: Webpack and Next.js configurations, crucial for understanding performance optimizations.
-   `scripts/update-bitcoin-data.js`: The script for managing historical data.
