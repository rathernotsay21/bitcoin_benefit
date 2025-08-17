# Bitcoin Benefit

A comprehensive Bitcoin vesting calculator and benefits platform designed to help companies implement Bitcoin-based employee compensation packages.

## Overview

Bitcoin Benefit provides employers with tools to design, visualize, and implement Bitcoin vesting schemes for employee retention and compensation. The platform offers both future projections and historical analysis capabilities, with three distinct vesting strategies tailored to different company needs and risk profiles.

## 🚀 Features

### Vesting Schemes

The platform includes three pre-configured vesting schemes, each with a unique ID and display name:

- **Pioneer (`accelerator`)**: An aggressive strategy with a large, immediate grant (e.g., 0.02 BTC) to attract top talent.
- **Stacker (`steady-builder`)**: A balanced approach combining an initial grant with annual additions to minimize market timing risk.
- **Builder (`slow-burn`)**: A long-term incentive plan with smaller annual grants over a decade, designed for maximum employee retention.

### 📊 Interactive Tools

- **Future Calculator**: Projects potential vesting outcomes over 20 years with customizable Bitcoin growth assumptions.
- **Historical Calculator**: Analyzes the actual performance of vesting schemes from 2015 to the present.
- **Real-time Data**: Integrates with the CoinGecko API for live Bitcoin prices, with caching and fallbacks.
- **Interactive Visualizations**: Utilizes Recharts to create dynamic and responsive timeline charts.
- **Customizable Parameters**: Allows for customization of grant amounts for all schemes.
- **Multiple Cost Basis Methods**: Supports Average, High, and Low cost basis calculations for historical analysis.
- **Performance Optimized**: Features include code splitting, static data generation, and optimized components for a fast user experience.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Testing**: Vitest, React Testing Library
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 20.18.0+
- npm 10.0.0+

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/bitcoin_benefit.git
    cd bitcoin_benefit
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── public/                 # Static assets and data
│   └── data/               # Static JSON data for prices
├── scripts/                # Node.js scripts for maintenance
│   ├── update-bitcoin-data.js # Updates historical data
│   └── generate-static-data.js # Pre-build script
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── calculator/     # Future vesting calculator
│   │   ├── historical/     # Historical analysis calculator
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   │   ├── VestingTimelineChartRecharts.tsx # Future projections chart
│   │   └── HistoricalTimelineVisualizationOptimized.tsx # Optimized historical chart
│   ├── lib/                # Core business logic
│   │   ├── vesting-schemes.ts      # Scheme configurations
│   │   ├── vesting-calculations.ts # Future calculation engine
│   │   └── historical-calculations.ts # Historical calculation engine
│   ├── stores/             # Zustand state management stores
│   │   ├── calculatorStore.ts      # Future calculator state
│   │   └── historicalCalculatorStore.ts # Historical calculator state
│   └── types/              # TypeScript definitions
└── package.json            # Project dependencies and scripts
```

## Available Scripts

This project includes a variety of scripts to help with development and maintenance:

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run test`: Runs all tests using Vitest.
-   `npm run lint`: Lints the codebase.
-   `npm run update-bitcoin-data`: Updates the static historical Bitcoin price data from the CoinGecko API.
-   `npm run deploy`: Builds and deploys the application to Netlify.

For a full list of scripts, see the `scripts` section in `package.json`.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Disclaimer**: This tool is for educational and planning purposes only. Consult with legal and financial professionals before implementing any Bitcoin compensation programs. Past performance does not guarantee future results.