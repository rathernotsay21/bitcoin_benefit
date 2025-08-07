## Core Development Team
This group forms the foundation for day-to-day development, perfectly matching your current tech stack.

nextjs-developer: Top Priority. Your project is built on Next.js 14 with the App Router. This agent is specifically designed for that environment and will be invaluable for building new features and optimizing existing ones.

react-specialist: Since your components and UI are built with React, this specialist can help with component architecture, state management (especially with Zustand), and leveraging modern React 18+ patterns.

typescript-pro: Your project has full TypeScript coverage. This agent will be essential for maintaining type safety, especially within your complex calculation engines and API data structures in the types/vesting.ts file.

frontend-developer: A great generalist for UI/UX tasks, particularly for working with Tailwind CSS and ensuring the interactive charts powered by Recharts are responsive and intuitive.

## Specialized Experts
These agents bring domain-specific knowledge that is critical for the quality and accuracy of your application.

fintech-engineer: Highly Recommended. Your application is fundamentally a fintech tool. This agent can assist in validating the vesting mathematics, suggesting financial metrics, and ensuring the logic in your calculation engines is sound.

code-reviewer: Crucial for maintaining high code quality. This agent can review your business logic in /lib, check for potential bugs in the calculation engines, and ensure consistent patterns across the codebase.

refactoring-specialist: As your project grows, the logic in calculatorStore.ts and historicalCalculatorStore.ts might become complex. This agent can help simplify and optimize the code for better maintainability.

## Quality, Security, and Performance
As you move towards a production-ready application, this team will be vital.

qa-expert: To help you write unit tests for your calculation engines (vesting-calculations.ts, historical-calculations.ts) and end-to-end tests for your user flows.

performance-engineer: This agent can help optimize the real-time calculations, improve the rendering performance of the Recharts visualizations, and analyze the efficiency of your Zustand stores.

security-auditor: Even though you're not handling user funds, it's good practice to ensure your application is secure. This agent can check for vulnerabilities related to your API usage and frontend code.


## Dev Team Prompts

Using the nextjs-developer agent, please review the structure of my Next.js 14 application within the src/app directory. Focus on best practices for the App Router, data fetching patterns for the CoinGecko API, and any potential performance optimizations for static site generation, especially concerning the calculator/ and historical/ pages.

Invoke the react-specialist agent. I need a review of my state management approach using Zustand. Analyze src/stores/calculatorStore.ts and src/stores/historicalCalculatorStore.ts and suggest how to improve efficiency for real-time calculations. Also, please critique my component architecture in src/components/ for adherence to modern React best practices.

I need the typescript-pro agent to perform a deep review of my TypeScript implementation. Please focus on the src/types/vesting.ts file and how those types are used within the calculation engines (src/lib/vesting-calculations.ts and src/lib/historical-calculations.ts). Suggest improvements for stricter type safety, clarity, and maintainability.

Engage the frontend-developer agent. Please review the UI/UX of my application, focusing on the implementation of Tailwind CSS for responsive design. Specifically, analyze the interactive charts in the historical/ calculator that use Recharts and suggest improvements for better visual feedback, accessibility, and overall user experience.

