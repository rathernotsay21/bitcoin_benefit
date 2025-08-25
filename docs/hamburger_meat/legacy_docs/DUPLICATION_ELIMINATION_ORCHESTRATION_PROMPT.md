# Code Duplication Elimination - Master Orchestration Prompt

> **STATUS: ARCHIVED - December 2024**
> 
> **IMPORTANT UPDATE**: Analysis shows the codebase already meets duplication targets:
> - Production code duplication: 2.74% (below 3% target)
> - No major refactoring needed
> - See `DUPLICATION_ANALYSIS_REPORT.md` for details

## Original Execution Instructions (ARCHIVED)

This prompt was created when the codebase had higher duplication levels. It is preserved for historical reference but should NOT be executed as the refactoring is no longer needed.

---

## ORIGINAL PROMPT (DO NOT EXECUTE):

I need to execute the Code Duplication Elimination Plan for the Bitcoin Benefit project. The plan is documented in `/docs/CODE_DUPLICATION_ELIMINATION_PLAN.md` and the technical implementation details are in `/docs/DUPLICATION_DETECTION_IMPLEMENTATION_GUIDE.md`.

Please orchestrate the following phases using the specified sub-agents:

### PHASE 1: Discovery & Analysis

1. **First, invoke the `code-reviewer` agent** with this task:
   ```
   Analyze the Bitcoin Benefit codebase for code duplications. Focus on:
   - Scanning all TypeScript/TSX files in /src/
   - Identifying exact duplicates, parameterized duplicates, and structural duplicates
   - Paying special attention to:
     * Vesting calculation logic in /src/lib/vesting-*.ts
     * Historical analysis in /src/lib/historical-*.ts
     * API handlers in /src/app/api/*/route.ts
     * React components in /src/components/
     * Zustand stores in /src/stores/
   - Generate a comprehensive duplication inventory with:
     * File paths and line numbers
     * Duplication type classification
     * Estimated lines of duplicated code
     * Initial priority assessment
   
   Use tools like grep, ast-grep, and pattern matching to identify duplications.
   Create a detailed report in markdown format.
   ```

2. **Then, invoke the `performance-engineer` agent** with this task:
   ```
   Analyze the performance impact of the code duplications identified by code-reviewer. Focus on:
   - Bundle size impact of duplicated code
   - Runtime performance implications
   - Memory usage from redundant code
   - Network payload increases
   - Build time impacts
   
   Prioritize duplications that have the highest performance impact.
   Provide metrics and recommendations for optimization priority.
   ```

3. **Next, invoke the `typescript-pro` agent** with this task:
   ```
   Review the code duplications from a TypeScript perspective. Identify:
   - Type definition duplications
   - Interface redundancies
   - Generic type opportunities
   - Type safety improvements possible through consolidation
   - Opportunities for discriminated unions or type narrowing
   
   Suggest TypeScript-specific refactoring patterns that would eliminate duplications while improving type safety.
   ```

### PHASE 2: Categorization & Planning

4. **Invoke the `refactoring-specialist` agent** with this task:
   ```
   Based on the duplication analysis from previous agents, create a detailed refactoring plan:
   
   Categorize duplications into:
   1. Critical Business Logic (vesting calculations, financial computations)
   2. UI Components (React components, chart configurations)
   3. API Handlers (route handlers, data fetching)
   4. Utility Functions (helpers, formatters, validators)
   5. Type Definitions (interfaces, types)
   6. Configuration (settings, constants)
   7. Test Code (test utilities, mocks)
   
   For each category:
   - Define specific refactoring patterns to apply
   - Identify common abstractions to create
   - Specify testing requirements
   - Estimate complexity and risk
   - Provide implementation order
   
   Create a prioritized refactoring backlog with clear success criteria.
   ```

5. **Invoke the `workflow-orchestrator` agent** with this task:
   ```
   Design the execution workflow for the refactoring plan. Create:
   - Detailed task breakdown with dependencies
   - Parallel work streams where possible
   - Checkpoint and rollback procedures
   - Integration points between different refactoring efforts
   - Risk mitigation strategies
   - Progress tracking mechanisms
   
   Ensure the workflow minimizes disruption and maintains system stability throughout the refactoring process.
   ```

### PHASE 3: Implementation

6. **For Business Logic Consolidation, invoke the `fintech-engineer` agent**:
   ```
   Refactor the duplicated financial calculation logic:
   - Consolidate vesting calculation functions in /src/lib/vesting-*.ts
   - Create a unified calculation engine with strategy pattern
   - Ensure all financial computations maintain exact precision
   - Implement comprehensive unit tests for all calculations
   - Validate against existing test cases and golden master data
   
   Critical: Ensure zero deviation in calculation results. All financial logic must be 100% accurate.
   ```

7. **For Component Refactoring, invoke the `react-specialist` agent**:
   ```
   Eliminate duplications in React components:
   - Extract common component patterns into reusable base components
   - Create custom hooks for shared component logic
   - Implement component composition patterns
   - Consolidate chart components using shared configurations
   - Optimize re-renders through proper memoization
   
   Focus on /src/components/charts/ and form components.
   Maintain all existing functionality and visual appearance.
   ```

8. **For API Layer, invoke the `nextjs-developer` agent**:
   ```
   Refactor API route handlers to eliminate duplications:
   - Create unified API middleware for common operations
   - Implement consistent error handling patterns
   - Consolidate validation logic using Zod schemas
   - Extract common data fetching utilities
   - Standardize response formatting
   
   Focus on /src/app/api/ routes.
   Ensure all security measures and rate limiting remain intact.
   ```

9. **For Store Management, invoke the `typescript-pro` agent** again:
   ```
   Refactor Zustand stores to eliminate duplications:
   - Create store factory functions for common patterns
   - Extract shared selectors and actions
   - Implement type-safe store composition
   - Optimize subscription patterns
   - Consolidate cross-store synchronization logic
   
   Focus on /src/stores/*.ts files.
   Maintain all existing store functionality and reactivity.
   ```

### PHASE 4: Testing & Validation

10. **Invoke the `qa-expert` agent**:
    ```
    Validate all refactoring changes:
    - Run comprehensive test suite
    - Perform regression testing on all user workflows
    - Validate calculation accuracy with golden master tests
    - Check performance benchmarks
    - Verify type safety across the codebase
    - Test all API endpoints
    - Validate UI component behavior
    
    Report any deviations or issues found.
    Ensure 100% backward compatibility.
    ```

### PHASE 5: Documentation & Prevention

11. **Invoke the `code-reviewer` agent** for final review:
    ```
    Perform final code review of all refactoring changes:
    - Verify all duplications have been addressed
    - Check code quality improvements
    - Validate adherence to patterns
    - Review test coverage
    - Assess maintainability improvements
    
    Generate final metrics showing:
    - Duplication percentage before and after
    - Lines of code reduced
    - Bundle size improvements
    - Test coverage metrics
    - Performance improvements
    ```

12. **Finally, invoke the `refactoring-specialist` agent** to create prevention mechanisms:
    ```
    Implement duplication prevention measures:
    - Configure ESLint rules for duplication detection
    - Set up pre-commit hooks
    - Create code review checklist
    - Document approved patterns in PATTERNS_LIBRARY.md
    - Update CLAUDE.md with new guidelines
    - Establish component library governance
    
    Ensure future development follows DRY principles.
    ```

## COORDINATION NOTES:

- **Sequential Dependencies**: Phases 1-2 must complete before Phase 3 begins
- **Parallel Execution**: Within Phase 3, items 6-9 can run in parallel
- **Checkpoint Reviews**: After each phase, review progress before proceeding
- **Rollback Ready**: Maintain ability to revert any changes if issues arise
- **Communication**: Each agent should clearly report completion and any blockers

## SUCCESS CRITERIA:

✅ Code duplication reduced to < 3%
✅ All tests passing with > 90% coverage
✅ No performance regression
✅ Bundle size reduced by minimum 15%
✅ Zero changes to business logic outcomes
✅ Documentation complete and up-to-date
✅ Prevention mechanisms in place

## IMPORTANT REMINDERS:

1. **DO NOT** modify any business logic behavior - only restructure code
2. **ALWAYS** run tests after each refactoring step
3. **MAINTAIN** git history with clear, atomic commits
4. **PRESERVE** all existing functionality
5. **DOCUMENT** all significant changes and patterns

## EXECUTION COMMAND:

Start by reading the plan documents, then begin with Phase 1 using the Task tool to invoke each agent with their specific prompts as outlined above. Track progress using the TodoWrite tool and report status after each phase completion.

---

## MONITORING PROGRESS:

Use the following command periodically to check duplication metrics:
```bash
npx jscpd src/ --min-lines 5 --min-tokens 50 --format "typescript,tsx" --reporters "console"
```

Generate HTML report for detailed analysis:
```bash
npx jscpd src/ --reporters "html" --output reports/duplication/
```

---

## ARCHIVE NOTE

This orchestration prompt was created when the codebase had different structure and higher duplication levels. As of December 2024:

- **Current duplication**: 2.74% in production code (already below 3% target)
- **Recommendation**: No refactoring needed
- **Risk**: Executing this plan would introduce unnecessary risk with no benefit

For current duplication metrics and analysis, see `DUPLICATION_ANALYSIS_REPORT.md`.

This document is preserved for historical reference only.