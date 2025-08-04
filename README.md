# Bitcoin Benefit

A comprehensive Bitcoin vesting calculator and benefits platform designed to help companies implement Bitcoin-based employee compensation packages.

## Overview

Bitcoin Benefit provides employers with tools to design, visualize, and implement Bitcoin vesting schemes for employee retention and compensation. The platform offers four distinct vesting strategies, each tailored to different company needs and risk profiles.

## Features

### 🚀 Vesting Schemes
- **Bitcoin Pioneer**: Immediate grants for early Bitcoin adopters
- **Dollar Cost Advantage**: Strategic yearly distributions to minimize market timing risk
- **Wealth Builder**: Long-term retention incentive with 10-year distribution
- **Executive Benefit**: Premium customizable grants for key talent

### 📊 Interactive Tools
- Real-time Bitcoin price integration
- 20-year projection timeline charts
- Customizable grant parameters
- USD value calculations with projected growth
- Annual breakdown tables

### 🎯 Key Benefits
- Transparent on-chain vesting tracking
- Employee empowerment through direct contributions
- Competitive advantage in talent retention
- Financial wellness education for teams

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Custom SVG-based visualizations
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
│   ├── calculator/         # Vesting calculator page
│   ├── learn-more/         # Information page
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── VestingTimelineChart.tsx
├── lib/                   # Business logic
│   ├── vesting-schemes.ts # Scheme configurations
│   ├── vesting-calculations.ts # Calculation engine
│   └── bitcoin-api.ts     # Price data integration
├── stores/                # State management
│   └── calculatorStore.ts
└── types/                 # TypeScript definitions
    └── vesting.ts
```

## Vesting Schemes

### Bitcoin Pioneer
- **Structure**: 0.02 BTC upfront grant
- **Philosophy**: Jump-start Bitcoin adoption with immediate commitment
- **Best for**: Companies ready to lead in digital asset compensation

### Dollar Cost Advantage  
- **Structure**: 0.015 BTC initial + 0.001 BTC yearly (5 years)
- **Philosophy**: Minimize market timing risk with strategic distributions
- **Best for**: Conservative approaches to Bitcoin adoption

### Wealth Builder
- **Structure**: 0.002 BTC yearly for 10 years
- **Philosophy**: Maximum retention through long-term wealth building
- **Best for**: Companies prioritizing employee loyalty

### Executive Benefit
- **Structure**: Fully customizable (up to 1 BTC total)
- **Philosophy**: Premium packages for key talent retention
- **Best for**: Executive compensation and top performer incentives

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

**Disclaimer**: This tool is for educational and planning purposes only. Consult with legal and financial professionals before implementing any Bitcoin compensation programs.