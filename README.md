# Bitcoin Benefit 🚀

<div align="center">
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yourusername/bitcoin_benefit)
  [![Test Coverage](https://img.shields.io/badge/coverage-85%25-green.svg)](https://github.com/yourusername/bitcoin_benefit)
  [![Performance](https://img.shields.io/badge/lighthouse-95%2B-brightgreen.svg)](https://github.com/yourusername/bitcoin_benefit)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
  
  **The most comprehensive Bitcoin vesting calculator and benefits platform for modern companies**
  
  [Live Demo](https://bitcoin-benefit.netlify.app) | [Documentation](docs/) | [API Reference](docs/api/) | [Contributing](CONTRIBUTING.md)
  
</div>

---

## 🎯 Quick Start

Get up and running in 3 commands:

```bash
git clone https://github.com/yourusername/bitcoin_benefit.git
cd bitcoin_benefit
npm install && npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#-core-features)
- [Bitcoin Tools Suite](#-bitcoin-tools-suite)
- [Advanced Analytics](#-advanced-analytics)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Performance](#-performance)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Support](#-support)

## Overview

Bitcoin Benefit is a production-ready platform that enables companies to design, implement, and manage Bitcoin-based employee compensation packages. With comprehensive calculators, real-time blockchain integration, and advanced analytics, it's the complete solution for Bitcoin vesting programs.

### Why Bitcoin Benefit?

- 📊 **Data-Driven Decisions**: Historical analysis from 2015 to present
- 🔮 **Future Projections**: 20-year forecasting with customizable growth models
- 🔒 **Enterprise Security**: Rate limiting, circuit breakers, and secure API design
- ⚡ **Lightning Fast**: Sub-second load times with optimized performance
- 🎨 **Beautiful UI**: Professional, accessible interface with dark mode support
- 📱 **Mobile Responsive**: Works perfectly on all devices

## 🚀 Core Features

### 1. Vesting Calculators

#### Future Vesting Calculator
- **20-year projections** with adjustable Bitcoin growth rates
- **Real-time Bitcoin pricing** via CoinGecko API
- **Interactive timeline charts** with Recharts
- **Customizable grant amounts** for all schemes
- **Export capabilities** for reports and presentations

#### Historical Analysis Calculator
- **Performance tracking** from 2015 to present
- **Multiple cost basis methods** (Average, High, Low)
- **Actual ROI calculations** based on real data
- **Annual breakdown** with detailed metrics
- **Tax year reporting** support

### 2. Three Strategic Vesting Schemes

#### 🚀 Pioneer (`accelerator`)
- **Strategy**: Aggressive with large upfront grant
- **Initial Grant**: 0.02 BTC
- **Best For**: Bold companies ready to lead
- **Risk Level**: High
- **Vesting**: 50% at 5 years, 100% at 10 years

#### 📈 Stacker (`steady-builder`)
- **Strategy**: Balanced with initial grant + annual bonuses
- **Initial Grant**: 0.015 BTC + 0.001 BTC annually
- **Best For**: Growing businesses
- **Risk Level**: Medium
- **Vesting**: Progressive unlocking over time

#### 🏗️ Builder (`slow-burn`)
- **Strategy**: Conservative with annual grants
- **Initial Grant**: 0.002 BTC + 0.002 BTC annually (9 years)
- **Best For**: Budget-conscious companies
- **Risk Level**: Low
- **Vesting**: Gradual accumulation

## 🛠️ Bitcoin Tools Suite

### 1. Transaction Lookup Tool
- **Real-time transaction status** via Mempool API
- **Confirmation tracking** with time estimates
- **Fee analysis** and optimization suggestions
- **Transaction details** visualization
- **Educational tooltips** for Bitcoin concepts

### 2. Address Explorer
- **Balance checking** for any Bitcoin address
- **Transaction history** with pagination
- **UTXO analysis** for advanced users
- **QR code generation** for addresses
- **Privacy warnings** and best practices

### 3. Fee Calculator
- **Dynamic fee recommendations** based on network conditions
- **Transaction size estimation** for different types
- **Cost comparisons** (Economy vs Priority)
- **Network congestion** indicators
- **Auto-refresh** with 60-second intervals

### 4. Document Timestamping
- **Blockchain proof** of document existence
- **SHA-256 hashing** for data integrity
- **OP_RETURN** transaction creation
- **Verification tools** for existing timestamps
- **Legal compliance** documentation

## 📊 Advanced Analytics

### Tax Implications Calculator
- **Capital gains** calculations
- **Tax bracket** optimization
- **Holding period** analysis
- **Jurisdiction-specific** rules
- **Export to TurboTax/CPA** formats

### Risk Analysis Engine
- **Monte Carlo simulations** (10,000+ scenarios)
- **Value at Risk (VaR)** calculations
- **Sharpe ratio** analysis
- **Volatility metrics** and projections
- **Stress testing** capabilities

### Employee Retention Modeler
- **Cost-effectiveness** analysis
- **Retention probability** modeling
- **Competitive analysis** tools
- **ROI projections** for HR teams
- **Benchmark comparisons** with industry

### Bitcoin Growth Projector
- **Multiple scenario** modeling
- **Historical pattern** analysis
- **Halving cycle** considerations
- **Macro factor** integration
- **Confidence intervals** display

### Vesting Schedule Calculator
- **Custom milestone** creation
- **Cliff period** configuration
- **Acceleration** triggers
- **Forfeiture** scenarios
- **Tax optimization** timing

## 🏗️ Architecture

### System Design
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  API Routes  │────▶│  External   │
│   (App Router)  │     │  (Serverless)│     │    APIs     │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      │                     │
         ▼                      ▼                     ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Zustand Store  │     │ Rate Limiter │     │  CoinGecko  │
│  (State Mgmt)   │     │   & Cache    │     │  Mempool    │
└─────────────────┘     └──────────────┘     └─────────────┘
```

### Key Components
- **Frontend**: React 18 with Next.js 14 App Router
- **State Management**: Zustand with persistence
- **API Layer**: Next.js API routes with middleware
- **Caching**: In-memory and Redis-compatible
- **Security**: Rate limiting, input validation, CORS
- **Performance**: Code splitting, lazy loading, SSG

## 🛡️ Tech Stack

### Core Technologies
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) with strict mode
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom design system
- **State**: [Zustand 4](https://github.com/pmndrs/zustand) for global state
- **Charts**: [Recharts](https://recharts.org/) for visualizations

### Development Tools
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with auto-fix
- **Git Hooks**: Husky for pre-commit checks
- **CI/CD**: GitHub Actions + Netlify

### Infrastructure
- **Hosting**: [Netlify](https://www.netlify.com/) with edge functions
- **CDN**: Cloudflare for static assets
- **Monitoring**: Performance tracking built-in
- **Analytics**: Privacy-focused analytics ready
- **Error Tracking**: Structured error handling

## 💻 Installation

### Prerequisites
- Node.js 20.18.0+ (use `nvm` for version management)
- npm 10.0.0+ or yarn 1.22+
- Git 2.0+

### Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/bitcoin_benefit.git
cd bitcoin_benefit
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Generate static data**:
```bash
npm run prebuild
```

5. **Start development server**:
```bash
npm run dev
```

6. **Open the application**:
Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🔌 API Documentation

### Available Endpoints

#### Bitcoin Price API
```http
GET /api/bitcoin-price
```
Returns current Bitcoin price with 5-minute cache.

#### Historical Data API
```http
GET /api/historical-data?year=2024
```
Returns historical Bitcoin prices for specified year.

#### Mempool Fees API
```http
GET /api/mempool/fees/recommended?txSize=250
```
Returns fee recommendations based on transaction size.

#### Network Status API
```http
GET /api/mempool/network
```
Returns current network congestion and statistics.

#### Timestamp API
```http
POST /api/timestamps
{
  "hash": "sha256_hash",
  "filename": "document.pdf"
}
```
Creates timestamp record for document.

#### Health Check API
```http
GET /api/health
```
Returns system health and status information.

### Rate Limiting
- **Default**: 50 requests per minute
- **Authenticated**: 100 requests per minute
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## 🔒 Security

### Security Features
- ✅ **Input Validation**: Zod schemas for all inputs
- ✅ **Rate Limiting**: Per-endpoint configuration
- ✅ **Circuit Breakers**: Automatic failure recovery
- ✅ **CORS Protection**: Configured origins only
- ✅ **XSS Prevention**: Content Security Policy
- ✅ **CSRF Protection**: Token validation
- ✅ **API Key Management**: Secure environment variables
- ✅ **SSL/TLS**: Enforced HTTPS in production
- ✅ **Dependency Scanning**: Regular vulnerability checks
- ✅ **Error Sanitization**: No sensitive data in logs

### Security Best Practices
- Never expose API keys in client code
- Use environment variables for secrets
- Regular security audits with `npm audit`
- Keep dependencies updated
- Follow OWASP guidelines

## ⚡ Performance

### Performance Metrics
- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 500KB (gzipped)

### Optimization Techniques
- **Code Splitting**: Route-based and component-level
- **Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image with WebP
- **Static Generation**: Pre-rendered pages where possible
- **Caching Strategy**: Multi-layer caching system
- **Virtualization**: For large lists (react-window)
- **Memoization**: React.memo and useMemo usage
- **Web Workers**: For heavy calculations

## 🧪 Testing

### Test Coverage
- **Unit Tests**: 85%+ coverage
- **Integration Tests**: API endpoints
- **Performance Tests**: Sub-10s benchmarks
- **E2E Tests**: Critical user paths

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance

# Watch mode for development
npm run test:watch

# Run specific test file
npm test -- calculator.test.ts
```

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run dev:clean` - Clean start with cache clear

### Building
- `npm run build` - Production build
- `npm run build:analyze` - Bundle analysis
- `npm run build:safe` - Build with validation

### Testing
- `npm test` - Run all tests
- `npm run test:coverage` - Coverage report
- `npm run test:performance` - Performance benchmarks

### Data Management
- `npm run update-bitcoin-data` - Update historical data
- `npm run clear-bitcoin-cache` - Clear cache
- `npm run prebuild` - Generate static data

### Deployment
- `npm run deploy` - Deploy to Netlify
- `npm run deploy:test` - Test deployment

### Security
- `npm run security:audit` - Security audit
- `npm run security:fix` - Auto-fix vulnerabilities
- `npm run security:full-scan` - Complete scan

### Performance
- `npm run perf:lighthouse` - Lighthouse audit
- `npm run perf:budget` - Check performance budget
- `npm run benchmark` - Run benchmarks

See [package.json](package.json) for all 80+ available scripts.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests (`npm test`)
5. Check linting (`npm run lint`)
6. Commit changes (`git commit -m 'Add AmazingFeature'`)
7. Push to branch (`git push origin feature/AmazingFeature`)
8. Open Pull Request

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain 80%+ test coverage
- Document complex logic
- Keep components under 200 lines

## 📚 Documentation

- [Architecture Overview](docs/architecture/)
- [API Reference](docs/api/)
- [Development Guide](docs/development/)
- [Security Documentation](docs/security/)
- [Performance Guide](docs/performance/)
- [Testing Strategy](docs/testing/)
- [Deployment Guide](docs/deployment/)

## 🌟 Support

### Getting Help
- 📖 [Documentation](docs/)
- 💬 [GitHub Discussions](https://github.com/yourusername/bitcoin_benefit/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/bitcoin_benefit/issues)
- 📧 Email: support@bitcoinbenefit.com

### Reporting Issues
Please use our [issue template](.github/ISSUE_TEMPLATE.md) when reporting bugs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bitcoin community for the inspiration
- CoinGecko for price data API
- Mempool.space for blockchain data
- All our contributors and users

## ⚠️ Disclaimer

**Important**: This tool is for educational and planning purposes only. Bitcoin investments carry significant risk. Always:
- Consult with qualified financial advisors
- Understand tax implications in your jurisdiction
- Consider regulatory compliance requirements
- Never invest more than you can afford to lose
- Remember: Past performance does not guarantee future results

---

<div align="center">
  
  Made with ❤️ by the Bitcoin Benefit Team
  
  [Website](https://bitcoin-benefit.netlify.app) | [Twitter](https://twitter.com/bitcoinbenefit) | [LinkedIn](https://linkedin.com/company/bitcoinbenefit)
  
</div>