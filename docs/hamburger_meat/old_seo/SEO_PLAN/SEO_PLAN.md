> # SEO Review

  # 1. Role and Primary Objective
  Please invoke the nextjs-developer agent to conduct a deep, multi-faceted
  audit of the provided Next.js project and produce a Comprehensive Strategic
  Plan to maximize its performance, SEO, user experience, and overall technical
  excellence. Write the plan directly to
  /Users/rathernotsay/Documents/GitHub/bitcoin_benefit/docs/SEO_PLAN/SEO_PLAN.md
   and create additional markdown files if necessary.

  # 2. Mandated Analysis Areas
  You must conduct a thorough analysis covering all the areas of excellence
  defined in your profile. For each area, you will assess the current
  implementation and identify opportunities for improvement.

  ## A. App Router Architecture & Core Web Vitals
  - **Review:** Analyze the current file structure, layout patterns, route
  groups, and usage of loading/error states.
  - **Assess:** Is the project correctly utilizing modern Next.js 14+ features
  like parallel and intercepting routes?
  - **Benchmark:** Measure the Core Web Vitals (LCP, FID, CLS) and overall
  Lighthouse scores for key user journeys. The goal is to exceed a score of 90
  consistently.

  ## B. Server Components & Data Fetching
  - **Review:** Examine the usage of Server Components, Client Components, and
  Server Actions.
  - **Assess:** Analyze data fetching strategies (fetch, SWR, React Query),
  caching policies (cache, revalidate), and the implementation of Streaming SSR
  with Suspense.
  - **Identify:** Pinpoint any inefficient data fetching patterns (e.g.,
  waterfalls) and opportunities for parallel fetching.

  ## C. Performance Optimization
  - **Review:** Conduct a deep performance audit.
  - **Assess:** Analyze image optimization (next/image), font loading
  (next/font), script handling (next/script), and bundle size.
  - **Recommend:** Propose specific strategies for code splitting, edge caching,
   and CDN optimization to achieve performance excellence targets (e.g., TTFB <
  200ms, LCP < 2.5s).

  ## D. SEO Implementation
  - **Review:** Audit the complete SEO setup.
  - **Assess:** Verify the implementation of the Metadata API, sitemap.xml,
  robots.txt, structured data (Schema markup), Open Graph tags, and canonical
  URLs.
  - **Goal:** The SEO score must be benchmarked and a plan created to exceed 95.

  ## E. Full-Stack & Database
  - **Review:** Analyze API routes, middleware, and database integration
  (Prisma, etc.).
  - **Assess:** Evaluate the security, efficiency, and scalability of server
  actions, authentication patterns, and any other backend features.

  ## F. Deployment & Testing
  - **Review:** Examine the current deployment process, environment variable
  management, and monitoring setup.
  - **Assess:** Evaluate the testing strategy, including component, integration,
   and E2E tests (Playwright). Is the coverage adequate?

  # 4. The Deliverable: A Strategic Maximization Plan
  Your final output must be a single, comprehensive document structured as
  follows:

  ## Bitcoin Benefits - Strategic Maximization Plan

  ### 1. Executive Summary:
  - A high-level overview of the project's current state.
  - A summary of the most critical areas for improvement and the potential
  impact of addressing them.

  ### 2. Detailed Audit Findings & Recommendations:
  For each of the six Analysis Areas (A-F) listed above, provide:
  - **Current State (Score: X/10):** A brief, objective assessment of what is
  currently implemented.
  - **Identified Gaps & Opportunities:** A clear, bulleted list of weaknesses,
  anti-patterns, or missed opportunities.
  - **Actionable Recommendations:** A numbered list of specific, concrete steps
  to take. Each recommendation should be clear enough for a developer to
  implement.

  ### 3. Prioritized Action Roadmap:
  - A table or list that organizes all recommendations into a clear roadmap.
  - Columns: Priority (P1-P3), Recommendation, Estimated Effort (S/M/L), and
  Expected Impact (High/Medium/Low).
  - This roadmap should be ordered by priority, starting with the
  highest-impact, lowest-effort tasks first.

  ### 4. Projected Future State:
  - A brief narrative describing the expected state of the application after
  implementing the recommendations, focusing on improvements in performance
  metrics, SEO rankings, and user experience.

  ### 5. Execution Constraints & Best Practices
  - Adhere to Checklists: Your analysis and recommendations must align with all
  checklists in your nextjs-developer.md profile (e.g., "Next.js developer
  checklist," "Performance excellence," "SEO excellence").
  - Code Examples: Where appropriate, provide brief code snippets to illustrate
  your recommendations.
  - Clarity and Actionability: The entire plan must be written in clear, concise
   language, focusing on actionable insights rather than vague suggestions.
  - Tool Integration: Frame your recommendations with the specified tool suite
  in mind (Vercel, Prisma, Playwright, etc.).