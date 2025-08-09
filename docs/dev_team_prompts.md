## Dev Team Prompts for Bitcoin Benefits Platform

### Phase 1: Foundation & Architecture Review

#### typescript-pro_agent_promt.md
Invoke the typescript-pro agent to conduct a comprehensive TypeScript architecture review:

**Type System Design**: Analyze src/types/vesting.ts and src/types/on-chain.ts for type safety, extensibility, and maintainability. Review the interface hierarchy for VestingScheme, CalculationInputs, and historical calculation types.

**Calculation Engine Types**: Examine type usage in src/lib/vesting-calculations.ts, src/lib/historical-calculations.ts, and the new on-chain annotation system. Suggest improvements for stricter type safety in financial calculations and API response handling.

**Store Type Safety**: Review Zustand store implementations for proper typing of async actions, state mutations, and computed properties. Analyze the type safety of the static data loading and caching mechanisms.

**API Integration Types**: Evaluate type definitions for CoinGecko API responses, Mempool.space integration, and error handling patterns. Suggest improvements for runtime type validation and API contract enforcement.

**Build Configuration**: Review tsconfig.json settings, path aliases, and build optimization for the financial application context. Recommend TypeScript compiler optimizations for the calculation-heavy codebase.

#### code-reviewer_agent_promt.md
Invoke the code-reviewer agent to conduct a comprehensive code quality assessment:

**Code Quality Standards**: Review the entire codebase for consistency, maintainability, and adherence to best practices. Focus on the calculation engines, state management, and API integration patterns.

**Security Review**: Analyze API key handling, data validation, input sanitization, and potential security vulnerabilities in the financial calculation platform.

**Error Handling**: Evaluate error handling patterns across the application, especially in calculation engines, API integrations, and user input validation.

**Performance Patterns**: Review code for potential performance bottlenecks, memory leaks, and optimization opportunities in the calculation-heavy components.

**Documentation Quality**: Assess code documentation, type annotations, and inline comments for clarity and completeness.

### Phase 2: Domain Expertise & Business Logic

#### fintech-engineer_agent_promt.md
Invoke the fintech-engineer agent to validate the financial calculation accuracy and compliance aspects:

**Vesting Mathematics**: Review the calculation engines in src/lib/vesting-calculations.ts and src/lib/historical-calculations.ts for mathematical accuracy, edge case handling, and financial modeling best practices. Validate the compound growth calculations and vesting milestone logic.

**Historical Analysis**: Examine the cost basis calculation methods (high, low, average) in src/lib/cost-basis-calculator.ts and the historical price integration. Ensure accuracy of annualized return calculations and performance metrics.

**Risk Modeling**: Analyze the risk analysis components and suggest improvements for volatility calculations, scenario modeling, and financial risk disclosure for Bitcoin-based compensation plans.

**Compliance Considerations**: Review the financial calculations for potential regulatory compliance issues, tax implication accuracy, and recommend improvements for enterprise-grade financial reporting.

**Data Integrity**: Evaluate the Bitcoin price data handling, cache invalidation strategies, and data consistency across multiple calculation engines.

#### blockchain-developer_agent_promt.md
Invoke the blockchain-developer agent to review the on-chain integration and Bitcoin-specific implementations:

**Bitcoin Integration**: Analyze the Mempool.space API integration in src/lib/on-chain/mempool-api.ts for best practices in Bitcoin transaction fetching, address validation, and error handling.

**Transaction Analysis**: Review the annotation algorithm in src/lib/on-chain/annotateTransactions.ts for accuracy in matching expected grants with actual Bitcoin transactions. Evaluate the scoring system and edge case handling.

**Address Validation**: Examine Bitcoin address validation patterns and suggest improvements for supporting different address formats (Legacy, SegWit, Taproot) and network compatibility.

**Security Practices**: Review the handling of Bitcoin addresses, transaction data, and privacy considerations in the on-chain tracking implementation.

**Performance Optimization**: Analyze the batch processing of historical price data and transaction fetching for scalability with large transaction histories.

### Phase 3: Technical Implementation & Architecture

#### nextjs-developer_agent_promt.md
Invoke the nextjs-developer agent to conduct a comprehensive review of my Next.js 14 application architecture. Focus on:

**App Router Implementation**: Analyze the src/app directory structure including calculator/, historical/, and on-chain/ routes. Review layout.tsx, page.tsx files, and nested routing patterns for optimal organization and performance.

**Static Site Generation**: Evaluate the current export configuration in next.config.js for Netlify deployment. Assess the static data generation strategy in scripts/generate-static-data.js and recommend optimizations for the pre-calculated vesting scenarios.

**API Integration Patterns**: Review the CoinGecko API integration in src/lib/bitcoin-api-optimized.ts and src/lib/historical-bitcoin-api.ts. Analyze caching strategies, error handling, and the balance between static pre-generation and dynamic fetching.

**Performance Optimization**: Examine bundle splitting configuration, the experimental optimizePackageImports for Recharts and Heroicons, and suggest improvements for Core Web Vitals, especially for the chart-heavy calculator pages.

**Build Pipeline**: Review the prebuild script integration, webpack customizations for vendor chunking, and deployment optimization for the financial calculation platform.

#### react-specialist_agent_promt.md
Invoke the react-specialist agent to perform an in-depth analysis of my React architecture and state management patterns:

**Zustand State Management**: Thoroughly review src/stores/calculatorStore.ts, src/stores/historicalCalculatorStore.ts, and src/stores/onChainStore.ts. Analyze the state structure, action patterns, and async operations. Suggest optimizations for real-time calculation performance and state synchronization across multiple calculators.

**Component Architecture**: Evaluate the component hierarchy in src/components/, focusing on reusability patterns between VestingTimelineChart.tsx, HistoricalTimelineChart.tsx, and the new on-chain components. Review the ErrorBoundary.tsx implementation and suggest improvements for better error recovery.

**Performance Patterns**: Analyze the use of React.memo, useMemo, and useCallback in calculation-heavy components. Review the debounced calculation triggers and suggest optimizations for the real-time input responsiveness.

**Hook Patterns**: Examine src/hooks/useBitcoinPrice.ts and recommend additional custom hooks for better separation of concerns, especially for the complex calculation logic and API integrations.

**Chart Integration**: Review the Recharts implementation patterns across timeline visualizations and suggest optimizations for rendering performance with large datasets and responsive behavior.

### Phase 4: User Experience & Interface

#### frontend-developer_agent_promt.md
Invoke the frontend-developer agent to evaluate the UI/UX implementation and design system:

**Design System**: Review the Tailwind CSS configuration in tailwind.config.js, focusing on the Bitcoin-themed color palette, dark mode implementation, and responsive design patterns. Analyze the consistency of the design tokens across all calculator interfaces.

**Interactive Visualizations**: Examine the Recharts implementations in VestingTimelineChartRecharts.tsx and HistoricalTimelineChart.tsx. Evaluate accessibility, responsive behavior, and user interaction patterns for financial data visualization.

**Form Design**: Analyze the input patterns in YearSelector.tsx and the new on-chain form components. Review validation feedback, error states, and user guidance for complex financial inputs.

**Responsive Architecture**: Evaluate mobile-first design implementation across calculator/, historical/, and on-chain/ pages. Review touch interactions, viewport optimization, and performance on mobile devices.

**Accessibility Compliance**: Assess WCAG compliance for financial data tables, chart interactions, and form inputs. Review screen reader support for complex financial calculations and data visualizations.

### Phase 5: Performance & Optimization

#### performance-engineer_agent_promt.md
Invoke the performance-engineer agent to optimize the application performance:

**Calculation Performance**: Analyze the performance of real-time vesting calculations, historical analysis computations, and on-chain transaction processing. Identify bottlenecks and optimization opportunities.

**Bundle Optimization**: Review the webpack configuration, code splitting strategy, and bundle analysis for optimal loading performance. Focus on the chart libraries and calculation engines.

**Caching Strategy**: Evaluate the multi-level caching approach including static data pre-generation, API response caching, and browser caching strategies.

**Memory Management**: Analyze memory usage patterns in calculation-heavy operations and suggest optimizations for handling large datasets in historical analysis.

**Core Web Vitals**: Assess and optimize for LCP, FID, and CLS metrics, especially for the chart-heavy calculator interfaces.

#### refactoring-specialist_agent_promt.md
Invoke the refactoring-specialist agent to improve code structure and maintainability:

**Calculation Engine Refactoring**: Analyze the calculation engines for opportunities to reduce complexity, improve readability, and enhance maintainability while preserving mathematical accuracy.

**Component Refactoring**: Review component hierarchies for opportunities to extract reusable patterns, reduce duplication, and improve composition across the calculator interfaces.

**State Management Optimization**: Examine Zustand stores for opportunities to simplify state structure, improve action organization, and enhance performance.

**Type System Improvements**: Suggest refactoring opportunities for better type safety, reduced complexity, and improved developer experience.

**API Layer Refactoring**: Review API integration patterns for consistency, error handling improvements, and better separation of concerns.

### Phase 6: Quality Assurance & Security

#### qa-expert_agent_promt.md
Invoke the qa-expert agent to establish comprehensive testing strategies:

**Test Coverage Analysis**: Review existing test files in __tests__ directories and assess coverage for calculation engines, state management, and API integrations. Identify critical testing gaps.

**Financial Calculation Testing**: Develop test strategies for validating mathematical accuracy in vesting calculations, historical analysis, and on-chain transaction matching.

**Integration Testing**: Design test approaches for API integrations, state synchronization, and cross-component interactions in the multi-calculator platform.

**User Acceptance Testing**: Create test scenarios for typical user workflows including plan comparison, historical analysis, and on-chain verification.

**Performance Testing**: Establish benchmarks for calculation performance, chart rendering, and overall application responsiveness.

#### security-auditor_agent_promt.md
Invoke the security-auditor agent to ensure platform security:

**API Security**: Review CoinGecko and Mempool.space API integrations for security best practices, rate limiting, and error handling.

**Data Privacy**: Analyze Bitcoin address handling, transaction data processing, and user privacy protection in the on-chain features.

**Input Validation**: Examine all user inputs for proper validation, sanitization, and protection against injection attacks.

**Client-Side Security**: Review browser storage usage, sensitive data handling, and client-side security practices.

**Dependency Security**: Audit npm dependencies for known vulnerabilities and suggest security improvements.