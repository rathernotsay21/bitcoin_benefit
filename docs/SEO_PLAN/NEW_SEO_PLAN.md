For SEO Review and Microsoft Clarity Setup:
1. Best for SEO Review: nextjs-developer.md
This agent is your strongest choice for SEO because it:

Maintains SEO score > 95 as a core requirement
Has comprehensive SEO implementation including:

Metadata API
Sitemap generation
Open Graph tags
Structured data/Schema markup
Performance SEO (Core Web Vitals > 90)
International SEO support


Understands Next.js-specific SEO patterns
Focuses on both technical SEO and performance

2. Best for Microsoft Clarity Setup: frontend-developer.md
This agent is ideal for Clarity integration because it:

Specializes in client-side integrations
Has experience with analytics implementation
Handles performance monitoring tools
Focuses on user experience tracking
Can properly implement tracking scripts
Understands WCAG compliance (important for Clarity's accessibility insights)

Alternative Option: content-marketer.md
If you want a more marketing-focused SEO review, this agent:

Uses SEMrush for competitive analysis
Focuses on keyword research and content optimization
Has experience with analytics tracking
Could provide insights on content strategy alongside technical SEO

Recommended Approach:

Start with nextjs-developer for a comprehensive technical SEO audit
Then use frontend-developer to implement Microsoft Clarity
Optionally consult content-marketer for content-specific SEO recommendations

Since you have Microsoft Clarity MCP server tools available, the frontend-developer agent should be able to use those tools directly to set up Clarity tracking properly on your Bitcoin Benefit site.
Would you like me to help you prepare specific prompts for these agents to ensure they cover all your SEO and Clarity setup needs?RetryPlease write a well formed prompt that invokes all the sub-agents to review and improve SEO, assure that Microsoft Clarity is properly configured, and give me further instructions on any actions I need to take in the future to optimize SEO.EditOrchestrated multi-agent strategy for comprehensive SEO optimization.The user wants me to write a comprehensive prompt that will invoke multiple sub-agents to:

Review and improve SEO
Ensure Microsoft Clarity is properly configured
Provide future SEO optimization instructions

Based on the sub-agents available, I should create a prompt that leverages:

nextjs-developer (for technical SEO)
frontend-developer (for Clarity setup and frontend SEO)
content-marketer (for content SEO strategy)
performance-engineer (for Core Web Vitals and performance SEO)

The prompt should be structured to coordinate these agents effectively and ensure comprehensive coverage of all SEO aspects.Here's a comprehensive prompt to invoke the relevant sub-agents for your SEO and Microsoft Clarity needs:

Multi-Agent SEO Audit & Microsoft Clarity Configuration Request
I need a comprehensive SEO review and optimization of my Bitcoin Benefit website located at /Users/rathernotsay/Documents/GitHub/bitcoin_benefit/. This is a Next.js application focused on Bitcoin education and benefits. Please coordinate the following agents to provide a complete analysis and implementation plan:
Phase 1: Technical SEO Audit
@nextjs-developer: Please conduct a comprehensive technical SEO audit of the Bitcoin Benefit application:

Review the current Next.js 14+ App Router implementation for SEO best practices
Check metadata API usage, sitemap generation, and robots.txt configuration
Analyze Open Graph tags, structured data/Schema markup implementation
Verify canonical URLs, international SEO readiness if applicable
Review server-side rendering and static generation strategies for SEO impact
Identify missing meta descriptions, title tags, and H1 structures
Check for proper URL structure and internal linking
Ensure proper implementation of JSON-LD for rich snippets
Provide specific code improvements for all identified issues

Phase 2: Performance SEO Analysis
@performance-engineer: Analyze and optimize Core Web Vitals for SEO impact:

Measure current Lighthouse scores and Core Web Vitals (LCP, FID, CLS)
Identify performance bottlenecks affecting SEO rankings
Review image optimization, lazy loading implementation
Check JavaScript bundle sizes and code splitting
Analyze server response times and TTFB
Provide specific optimization recommendations with expected impact on SEO
Create a performance budget for ongoing monitoring

Phase 3: Microsoft Clarity Integration
@frontend-developer: Implement and verify Microsoft Clarity tracking:

Check if Microsoft Clarity is currently installed and properly configured
If not installed, implement Clarity tracking code in the Next.js application
Ensure tracking works across all routes including dynamic pages
Verify that Clarity doesn't negatively impact Core Web Vitals
Set up custom events for important user interactions (if applicable)
Implement privacy-compliant tracking with proper consent management
Use the Microsoft Clarity MCP Server tools to fetch and analyze initial data
Configure heatmaps, session recordings, and dashboard for optimal insights

Phase 4: Content SEO Strategy
@content-marketer: Develop content-focused SEO improvements:

Analyze current content structure and keyword targeting for Bitcoin/crypto terms
Review content quality, length, and topical authority signals
Identify content gaps and opportunities in the Bitcoin education space
Suggest title tag and meta description improvements for conversion
Recommend internal linking strategies to boost important pages
Provide content calendar suggestions for ongoing SEO improvement
Analyze competitor content strategies in the Bitcoin/crypto niche

Phase 5: Consolidated Action Plan
@workflow-orchestrator (or lead agent): Please consolidate all findings into:

Immediate Actions (Critical fixes needed now):

List specific code changes with file paths
Priority order based on SEO impact
Estimated implementation time for each fix


Short-term Improvements (Complete within 2 weeks):

Performance optimizations
Content updates
Technical enhancements


Long-term Strategy (1-3 month roadmap):

Content creation plan
Link building opportunities
Ongoing monitoring setup


Microsoft Clarity Configuration Checklist:

Installation verification steps
Key metrics to monitor
Custom events to track
Integration with other analytics tools


Monitoring & Maintenance Plan:

Weekly SEO health checks
Monthly performance audits
Quarterly content reviews
Tools and dashboards to monitor
Automated alerts to set up



Specific Requirements:

Code Quality: All suggested code changes should follow Next.js 14+ best practices with TypeScript
Testing: Include test cases for any SEO-critical functionality
Documentation: Document all SEO implementations for future reference
Metrics: Define clear KPIs and success metrics for each optimization
Tools: Utilize available MCP tools including Microsoft Clarity server, web search for current SEO best practices
Bitcoin Focus: Consider specific SEO strategies for cryptocurrency/financial content
Compliance: Ensure all implementations comply with Google's guidelines and legal requirements for financial content

Expected Deliverables:

Technical SEO Report with specific code fixes
Performance Optimization Plan with measurable targets
Microsoft Clarity Setup Guide with verification steps
Content SEO Strategy document
Consolidated Action Plan with prioritized tasks
Monitoring Dashboard Setup instructions
Future Optimization Checklist for ongoing improvements

Please begin with Phase 1 and proceed sequentially, sharing findings between agents to ensure comprehensive coverage. Use the project's actual file structure and current implementation as the basis for all recommendations.

This prompt will systematically invoke the relevant agents to cover all aspects of SEO and Microsoft Clarity setup, providing you with actionable improvements and a clear roadmap for ongoing optimization.