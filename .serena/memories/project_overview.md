# Bitcoin Benefit - Project Overview

## Project Purpose
Bitcoin Benefit is a comprehensive Bitcoin vesting calculator and benefits platform designed to help companies implement Bitcoin-based employee compensation packages. The platform provides employers with tools to design, visualize, and implement Bitcoin vesting schemes for employee retention and compensation.

## Key Features
- **Future Calculator**: Projects potential vesting outcomes over 20 years with customizable Bitcoin growth assumptions
- **Historical Calculator**: Analyzes actual performance of vesting schemes from 2015 to present
- **Real-time Data**: Integrates with CoinGecko API for live Bitcoin prices with caching and fallbacks
- **Interactive Visualizations**: Uses Recharts for dynamic and responsive timeline charts
- **Three Vesting Schemes**:
  - **Pioneer (accelerator)**: Aggressive strategy with large immediate grant (0.02 BTC)
  - **Stacker (steady-builder)**: Balanced approach with initial grant + annual additions (0.015 BTC + 0.001 BTC annually)
  - **Builder (slow-burn)**: Long-term plan with smaller annual grants over a decade (0.002 BTC + 0.002 BTC annually for 9 years)

## Target Users
- Companies looking to implement Bitcoin-based employee compensation
- HR departments designing retention strategies
- Financial planners analyzing Bitcoin compensation packages
- Employees understanding their Bitcoin vesting schedules

## Current Status
- Deployed on Netlify
- Fully functional with both future projections and historical analysis
- Performance optimized with code splitting and caching
- Comprehensive test suite with Vitest