# Diagnosis Report Template

Template for the tracker issue description created in step-05. Loaded by step-05-create-issue.

---

## Template

```markdown
## Definition of Done (product)

This bug is fixed when:

1. {ROOT_CAUSE_FIX_CRITERION}
2. All Validation Metier tests have passed in staging
3. No regression on impacted flows

## Symptom

**Reported by:** {USER_NAME}
**Environment:** {TARGET_ENV}
**Severity:** {SEVERITY}
**First observed:** {TIMESTAMP_OR_APPROXIMATE}

{SYMPTOM_DESCRIPTION}

## Diagnosis

### Root Cause

{ROOT_CAUSE_DESCRIPTION}

### Causal Chain

```
{FIVE_WHYS_OR_CAUSAL_CHAIN}
```

### Evidence

| # | Type | Source | Finding |
|---|------|--------|---------|
| E1 | {log/db/code/deploy} | {source_reference} | {what was found} |
| E2 | ... | ... | ... |

## Acceptance Criteria

### Business Acceptance Criteria

- [ ] BAC-1: Given {context}, when {action}, then {expected_result}

### Technical Acceptance Criteria

- [ ] TAC-1: Given {technical_precondition}, when {system_action}, then {expected_result}

## Fix Plan

- [ ] Task 1: {description}
  - File: `{path}`
  - Action: {specific_change}
- [ ] Task 2: ...

## Test Strategy

| TAC | Level | Key Scenarios |
|-----|-------|---------------|
| TAC-1 | Unit/Integration | {scenarios} |

## Validation Metier

Tests to execute in staging after deployment:

- [ ] VM-1 *(BAC-1)*: {concrete_test_in_staging}

<details>
<summary>Technical Context</summary>

### Affected Files

{LIST_OF_FILES}

### Related Commits

{GIT_LOG_EXCERPT}

### Investigation Queries

{DB_QUERIES_USED_DURING_INVESTIGATION}

</details>
```
