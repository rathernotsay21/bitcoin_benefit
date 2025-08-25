# Code Duplication Elimination - Quick Reference Guide

## 🎯 Mission
Systematically identify and eliminate code duplications to improve reliability, maintainability, and performance of the Bitcoin Benefit platform.

## 📋 Quick Links
- [Full Plan](./CODE_DUPLICATION_ELIMINATION_PLAN.md)
- [Implementation Guide](./DUPLICATION_DETECTION_IMPLEMENTATION_GUIDE.md)
- [Orchestration Prompt](./DUPLICATION_ELIMINATION_ORCHESTRATION_PROMPT.md)
- [Metrics Tracking](./DUPLICATION_METRICS_TRACKING.md)
- [Detection Patterns](./DUPLICATION_DETECTION_PATTERNS.md)

## 🚀 Quick Start

### Step 1: Check Current Duplication
```bash
npx jscpd src/ --min-lines 5 --min-tokens 50 --format "typescript,tsx"
```

### Step 2: Generate Detailed Report
```bash
npx jscpd src/ --reporters "html,json" --output reports/duplication/
```

### Step 3: Start Orchestration
Use the [Orchestration Prompt](./DUPLICATION_ELIMINATION_ORCHESTRATION_PROMPT.md) with the Task tool to begin systematic elimination.

## 👥 Agent Assignments

| Phase | Lead Agent | Support Agents | Duration |
|-------|------------|----------------|----------|
| Discovery | `code-reviewer` | `typescript-pro`, `performance-engineer` | 2 days |
| Planning | `refactoring-specialist` | `workflow-orchestrator` | 1 day |
| Business Logic | `fintech-engineer` | `typescript-pro` | 2 days |
| Components | `react-specialist` | `nextjs-developer` | 2 days |
| API Layer | `nextjs-developer` | `security-auditor` | 1 day |
| Stores | `typescript-pro` | `react-specialist` | 1 day |
| Testing | `qa-expert` | `performance-engineer` | 2 days |
| Documentation | `code-reviewer` | `refactoring-specialist` | 1 day |

## 🎯 Priority Focus Areas

### P0 - Critical (Day 1-5)
- [ ] Vesting calculations (`/src/lib/vesting-*.ts`)
- [ ] Historical analysis (`/src/lib/historical-*.ts`)
- [ ] API security and validation

### P1 - High (Day 6-8)
- [ ] Chart components (`/src/components/charts/`)
- [ ] Zustand stores (`/src/stores/`)
- [ ] Form validation logic

### P2 - Medium (Day 9-10)
- [ ] UI components and utilities
- [ ] Configuration and constants
- [ ] Type definitions

### P3 - Low (Day 11-12)
- [ ] Test helpers and utilities
- [ ] Documentation
- [ ] Code comments

## 🔍 Quick Detection Patterns

### Find Exact Duplicates
```bash
rg "exact_string_or_pattern" src/ --type ts --type tsx -A 5 -B 5
```

### Find Similar Functions
```bash
ast-grep --pattern 'function $NAME($$$) { $$$ }' --lang typescript
```

### Find Repeated Calculations
```bash
rg "Math\.|calculate|compute" src/lib/ --type ts -A 10
```

### Find Component Patterns
```bash
rg "useState.*useEffect" src/components/ --type tsx -A 10
```

## ✅ Success Criteria Checklist

- [ ] Duplication < 3%
- [ ] Bundle size reduced by 15%+
- [ ] All tests passing (>90% coverage)
- [ ] No performance regression
- [ ] Zero calculation changes
- [ ] Documentation complete
- [ ] Prevention mechanisms in place

## 🛠️ Refactoring Patterns

### Pattern 1: Extract Common Function
```typescript
// Before: Duplicated in multiple files
const format = (val) => { /* logic */ };

// After: Single source of truth
import { format } from '@/lib/utils/formatters';
```

### Pattern 2: Strategy Pattern
```typescript
// Before: If-else chains
if (type === 'A') { /* logic A */ }
else if (type === 'B') { /* logic B */ }

// After: Strategy map
const strategies = { A: strategyA, B: strategyB };
strategies[type].execute();
```

### Pattern 3: Custom Hook
```typescript
// Before: Repeated in components
const [data, setData] = useState();
useEffect(() => { /* fetch */ }, []);

// After: Reusable hook
const { data, loading, error } = useAsyncData(fetcher);
```

## 📊 Daily Monitoring

### Morning Check
```bash
# Check overnight changes
git diff --stat HEAD~1
npx jscpd src/ --silent | grep "Duplicates"
```

### Evening Report
```bash
# Generate progress report
npm run duplication:report
git add -A && git commit -m "duplication: [description]"
```

## 🚨 Emergency Rollback

If issues arise:
```bash
# Immediate rollback
git reset --hard HEAD~1

# Or revert specific commit
git revert <commit-hash>

# Re-run tests
npm test && npm run build
```

## 📝 Commit Message Convention

```
duplication(<scope>): <description>

- Reduced duplication in <area> by X%
- Extracted <pattern> to <location>
- Consolidated <number> instances

Affects: <files>
Testing: <test-status>
```

## 🔄 Continuous Prevention

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run check-duplication"
    }
  }
}
```

### CI/CD Check
```yaml
- name: Check Duplication
  run: npx jscpd src/ --threshold 3 --exitCode 1
```

## 📈 Progress Tracking

### Quick Status Check
```bash
# Current duplication percentage
npx jscpd src/ --silent | grep percentage

# Compare with baseline
diff reports/baseline.json reports/current.json
```

### Update Metrics
```bash
# Run tracking script
node scripts/track-duplication.js

# View trends
cat metrics/duplication-tracking.jsonl | tail -5
```

## 🎓 Key Principles

1. **Safety First**: Never break existing functionality
2. **Test Coverage**: Write tests before refactoring
3. **Incremental**: Small, atomic changes
4. **Document**: Update docs with patterns
5. **Measure**: Track metrics continuously
6. **Communicate**: Daily progress updates
7. **Review**: Peer review all changes

## 🆘 Need Help?

- Review [Full Plan](./CODE_DUPLICATION_ELIMINATION_PLAN.md) for detailed strategy
- Check [Implementation Guide](./DUPLICATION_DETECTION_IMPLEMENTATION_GUIDE.md) for technical details
- Use [Detection Patterns](./DUPLICATION_DETECTION_PATTERNS.md) for finding duplications
- Track progress in [Metrics Document](./DUPLICATION_METRICS_TRACKING.md)

## 🏁 Final Checklist

Before marking complete:
- [ ] All phases executed
- [ ] Metrics goals achieved
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Prevention mechanisms active
- [ ] Team trained on new patterns
- [ ] Retrospective completed

---

**Remember**: The goal is not just to eliminate current duplications but to prevent future ones through better patterns, tools, and practices.