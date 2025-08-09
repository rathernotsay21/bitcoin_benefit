# Bitcoin Benefit

A comprehensive Bitcoin vesting calculator and benefits platform designed to help companies implement Bitcoin-based employee compensation packages.

## Overview

Bitcoin Benefit provides employers with tools to design, visualize, and implement Bitcoin vesting schemes for employee retention and compensation. The platform offers both future projections and historical analysis capabilities, with three distinct vesting strategies tailored to different company needs and risk profiles.

## Features

### 🚀 Vesting Schemes
- **Pioneer**: Immediate grants for early Bitcoin adopters (0.02 BTC upfront)
- **Stacker**: Strategic yearly distributions to minimize market timing risk (0.015 BTC + 0.001 BTC/year)
- **Builder**: Long-term retention incentive with 10-year distribution (0.002 BTC/year)

### 📊 Interactive Tools
- **Future Calculator**: 20-year projections with customizable growth assumptions
- **Historical Calculator**: Analyze actual performance from 2015 onwards
- Real-time Bitcoin price integration via CoinGecko API
- Interactive Recharts-based timeline visualizations
- Customizable grant parameters for all schemes
- Multiple cost basis methods (Average, High, Low)
- Annual breakdown tables with vesting milestones

### 🎯 Key Benefits
- Transparent vesting tracking with standardized 5/10-year schedule
- Historical performance analysis to validate strategies
- Employee empowerment through Bitcoin-based compensation
- Competitive advantage in talent retention
- Financial wellness education for teams

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts for interactive visualizations
- **API**: CoinGecko for real-time Bitcoin prices

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bitcoin_benefit.git
cd bitcoin_benefit
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── calculator/         # Future vesting calculator
│   ├── historical/         # Historical analysis calculator
│   ├── learn/         # Information page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── VestingTimelineChart.tsx    # Future projections chart
│   ├── HistoricalTimelineChart.tsx # Historical analysis chart
│   ├── YearSelector.tsx           # Year picker component
│   ├── ErrorBoundary.tsx          # Error handling wrapper
│   └── AdvancedAnalyticsDashboard.tsx # Tax/Risk/Retention analysis
├── lib/                   # Business logic
│   ├── vesting-schemes.ts         # Scheme configurations
│   ├── vesting-calculations.ts    # Future calculation engine
│   ├── historical-calculations.ts # Historical calculation engine
│   ├── bitcoin-api.ts             # Current price integration
│   ├── historical-bitcoin-api.ts  # Historical price data
│   └── cost-basis-calculator.ts   # Cost basis methods
├── stores/                # State management
│   ├── calculatorStore.ts         # Future calculator state
│   └── historicalCalculatorStore.ts # Historical calculator state
└── types/                 # TypeScript definitions
    └── vesting.ts        # Comprehensive type definitions
```

## Vesting Schemes

All schemes follow a standardized vesting schedule: 50% at 5 years, 100% at 10 years.

### Pioneer
- **Structure**: 0.02 BTC upfront grant
- **Philosophy**: Jump-start Bitcoin adoption with immediate commitment
- **Best for**: Companies ready to lead in digital asset compensation
- **Customizable**: Initial grant amount and projected growth rate

### Stacker 
- **Structure**: 0.015 BTC initial + 0.001 BTC yearly (5 years)
- **Philosophy**: Minimize market timing risk with strategic distributions
- **Best for**: Conservative approaches to Bitcoin adoption
- **Customizable**: Initial grant, annual grant, and projected growth rate

### Builder
- **Structure**: 0.002 BTC yearly for 10 years
- **Philosophy**: Maximum retention through long-term wealth building
- **Best for**: Companies prioritizing employee loyalty
- **Customizable**: Annual grant amount and projected growth rate


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Bitcoin price data provided by [CoinGecko](https://www.coingecko.com/)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## Support

For support, please open an issue on GitHub or contact the maintainers.

---

**Disclaimer**: This tool is for educational and planning purposes only. Consult with legal and financial professionals before implementing any Bitcoin compensation programs. Past performance does not guarantee future results.
