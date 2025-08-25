# Agent Coordination Protocol for Code Duplication Elimination

## Overview
This document defines the coordination protocol between sub-agents for the systematic elimination of code duplications in the Bitcoin Benefit project.

## Agent Communication Protocol

### Message Format
All agents should communicate using this standardized format:

```json
{
  "agent": "agent-name",
  "phase": "current-phase",
  "status": "in-progress|completed|blocked",
  "findings": {
    "duplications_found": 0,
    "files_analyzed": 0,
    "patterns_identified": []
  },
  "recommendations": [],
  "next_agent": "agent-name",
  "handoff_data": {}
}
```

## Phase 1: Discovery & Analysis Chain

### 1. code-reviewer → performance-engineer
**Handoff Data:**
```json
{
  "duplication_inventory": [
    {
      "file": "path/to/file",
      "lines": [start, end],
      "type": "exact|parameterized|structural",
      "duplicates": ["path/to/duplicate1", "path/to/duplicate2"],
      "priority": "P0|P1|P2|P3"
    }
  ],
  "total_duplicated_lines": 0,
  "affected_files": []
}
```

### 2. performance-engineer → typescript-pro
**Handoff Data:**
```json
{
  "performance_impact": {
    "bundle_size_impact": "XX KB",
    "runtime_impact": "low|medium|high",
    "memory_impact": "XX MB",
    "priority_duplications": []
  }
}
```

### 3. typescript-pro → refactoring-specialist
**Handoff Data:**
```json
{
  "type_duplications": {
    "interfaces": [],
    "types": [],
    "generics_opportunities": [],
    "type_safety_concerns": []
  }
}
```

## Phase 2: Planning Chain

### 4. refactoring-specialist → workflow-orchestrator
**Handoff Data:**
```json
{
  "refactoring_plan": {
    "categories": {
      "business_logic": [],
      "ui_components": [],
      "api_handlers": [],
      "utilities": [],
      "types": [],
      "stores": [],
      "tests": []
    },
    "patterns": [],
    "dependencies": [],
    "risk_assessment": {}
  }
}
```

### 5. workflow-orchestrator → implementation agents
**Handoff Data:**
```json
{
  "execution_workflow": {
    "parallel_streams": [],
    "sequential_tasks": [],
    "checkpoints": [],
    "rollback_points": [],
    "success_criteria": {}
  }
}
```

## Phase 3: Parallel Implementation Streams

### Stream A: Business Logic
**Chain:** fintech-engineer → typescript-pro → code-reviewer

### Stream B: UI Components  
**Chain:** react-specialist → frontend-developer → nextjs-developer

### Stream C: API Layer
**Chain:** nextjs-developer → backend-developer → security-auditor

### Stream D: State Management
**Chain:** typescript-pro → react-specialist → performance-engineer

## Phase 4: Validation Chain

### qa-expert → performance-engineer → code-reviewer
**Final Validation Data:**
```json
{
  "test_results": {
    "unit_tests": "pass|fail",
    "integration_tests": "pass|fail",
    "regression_tests": "pass|fail",
    "performance_benchmarks": {},
    "coverage": "XX%"
  },
  "metrics": {
    "duplication_before": "XX%",
    "duplication_after": "XX%",
    "bundle_size_change": "XX%",
    "performance_change": "XX%"
  }
}
```

## Coordination Rules

### 1. Dependency Management
- No agent starts until they receive handoff data
- Agents must validate incoming data before proceeding
- Blocked agents must report blockers immediately

### 2. Parallel Execution
- Streams A, B, C, D can run simultaneously
- Each stream maintains internal sequential order
- Cross-stream dependencies must be explicitly declared

### 3. Checkpoint Protocol
- Every 2 days: Progress review
- After each phase: Go/No-go decision
- Before major refactoring: Backup creation

### 4. Conflict Resolution
- If two agents modify same file: Last one must merge
- If conflicting patterns: refactoring-specialist decides
- If performance regression: performance-engineer has veto

## Agent-Specific Instructions

### code-reviewer
```yaml
priority: duplication_detection
tools: [ripgrep, ast-grep, jscpd]
output: duplication_inventory.md
success_criteria:
  - all_files_scanned: true
  - patterns_categorized: true
  - priority_assigned: true
```

### refactoring-specialist
```yaml
priority: pattern_design
tools: [ast-grep, semgrep]
output: refactoring_strategy.md
success_criteria:
  - patterns_defined: true
  - risk_assessed: true
  - test_plan_created: true
```

### fintech-engineer
```yaml
priority: calculation_accuracy
tools: [testing_frameworks, golden_master]
output: consolidated_calculations.ts
success_criteria:
  - zero_calculation_changes: true
  - all_tests_passing: true
  - performance_maintained: true
```

### react-specialist
```yaml
priority: component_consolidation
tools: [react-devtools, component_analyzer]
output: component_library/
success_criteria:
  - components_extracted: true
  - hooks_consolidated: true
  - props_standardized: true
```

### typescript-pro
```yaml
priority: type_safety
tools: [tsc, type_analyzer]
output: types/consolidated/
success_criteria:
  - no_type_errors: true
  - generics_applied: true
  - interfaces_unified: true
```

### qa-expert
```yaml
priority: comprehensive_testing
tools: [jest, cypress, performance_tests]
output: test_report.md
success_criteria:
  - coverage_above_90: true
  - no_regressions: true
  - performance_stable: true
```

## Escalation Protocol

### Level 1: Agent Blocked
- Attempt self-resolution (30 min)
- Request help from support agents
- Document blocker in BLOCKERS.md

### Level 2: Cross-Stream Conflict
- Escalate to workflow-orchestrator
- Coordinate resolution meeting
- Update execution plan

### Level 3: Critical Failure
- Stop all work
- Rollback to last checkpoint
- Review and revise approach

## Daily Sync Format

```markdown
## Daily Sync - [Date]

### Completed
- Agent: [work completed]

### In Progress
- Agent: [current work]

### Blocked
- Agent: [blocker description]

### Next 24 Hours
- Agent: [planned work]

### Metrics Update
- Duplication: XX%
- Tests: XX% passing
- Coverage: XX%
```

## Success Metrics Dashboard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Duplication % | < 3% | TBD | 🔄 |
| Bundle Size | -15% | TBD | 🔄 |
| Test Coverage | > 90% | TBD | 🔄 |
| Performance | No regression | TBD | 🔄 |
| Type Safety | 100% | TBD | 🔄 |

## Phase Completion Criteria

### Phase 1 Complete When:
- [x] All files scanned
- [x] Duplications inventoried
- [x] Impact analyzed
- [x] Types reviewed

### Phase 2 Complete When:
- [x] Categories defined
- [x] Patterns established
- [x] Workflow created
- [x] Risks assessed

### Phase 3 Complete When:
- [x] Business logic consolidated
- [x] Components refactored
- [x] APIs unified
- [x] Stores optimized

### Phase 4 Complete When:
- [x] All tests passing
- [x] Performance validated
- [x] Documentation complete
- [x] Prevention active

## Final Handoff

Upon completion, the final agent (code-reviewer) should produce:

```markdown
# Duplication Elimination - Final Report

## Executive Summary
- Initial State: XX% duplication
- Final State: XX% duplication
- Improvement: XX%

## Changes Made
- Files Modified: XX
- Lines Removed: XX
- Components Created: XX
- Patterns Established: XX

## Quality Metrics
- Test Coverage: XX%
- Type Safety: XX%
- Bundle Size: -XX%
- Performance: XX% change

## Recommendations
1. [Future improvements]
2. [Maintenance strategy]
3. [Prevention measures]

## Lessons Learned
- [Key insights]

## Sign-off
- [ ] All agents confirm completion
- [ ] Metrics goals achieved
- [ ] No regressions detected
- [ ] Documentation complete
```

---

This coordination protocol ensures smooth collaboration between all agents throughout the duplication elimination process. Each agent knows their role, responsibilities, and how to communicate effectively with others in the chain.