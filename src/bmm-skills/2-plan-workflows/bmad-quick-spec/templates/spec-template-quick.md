---
schema_version: "2.0"
mode: monolithic
generated: {today}
generator: bmad-quick-spec
slug: {slug}
title: "{title}"
type: {feature | fix | refactor | chore}
priority: {1-5}
profile: quick
story_points: {3 | 5 | 8}
status: backlog
labels:
  - {label}
---

# {title}

## Definition of Done (product)

This story is "Done" when:

**Feature:**

1. {feature_dod_item_1}
2. {feature_dod_item_2}

**Non-regression:**

3. {non_regression_dod_item}
4. `{quality_gate}` passes.

---

## Problem

{problem_statement_2_3_sentences}

## Proposed Solution

{solution_2_3_sentences}

## Scope

### Included

- **IS-1**: {item}
- **IS-2**: {item}

### Excluded

(See Out of Scope register below)

## Out of Scope

| # | Non-goal | Why excluded | Where it might land |
| - | -------- | ------------ | -------------------- |
| OOS-1 | {item} | {reason} | {next story / future epic / never} |
| OOS-2 | {item} | {reason} | {target} |

> Scope-creep policy: any modification outside the File List AND delivering an OOS-N item → BLOCKER in code-review.

## Business Context

### User Journey E2E

**Primary actor:** {actor}

1. {step}
2. {step}

### Business Acceptance Criteria

- [ ] BAC-1: Given {context}, when {trigger}, then {observable outcome}.
- [ ] BAC-2: Given {context}, when {trigger}, then {observable outcome}.

> BACs MUST use `Given … When … Then …` per `ac-format-rule.md`.

### External Dependencies & Validation Gates

| Dependency | Owner | Required Action | Gate (blocking?) | Status |
| ---------- | ----- | --------------- | ---------------- | ------ |

(Or `None — internal-only feature`.)

## Technical Context

<details>
<summary>Patterns du codebase, fichiers de référence, décisions techniques (cliquer pour développer)</summary>

### Tech Stack

{tech_stack_relevant_to_this_story}

### Code Patterns à respecter

- {pattern_1}
- {pattern_2}

### Reference patterns à mimiquer

- {existing_skill_or_module} → s'inspirer de pour {what}

### Architectural decisions surfaced

(List any decisions surfaced during investigation. If no ADR is configured for the project, document them inline here.)

</details>

## Real-Data Findings

{either_full_findings_OR}

`N/A — {1-line justification, e.g. "internal config refactor, no real data exchange involved"}`

## External Research

{either_full_research_OR}

`N/A — {1-line justification, e.g. "well-known pattern, no version constraints"}`

## Data Model

{data_model_or_N_A}

## API Contracts

{api_contracts_or_N_A}

## Infrastructure

```yaml
infrastructure_changes:
  cloud: {NONE | description}
  compute: {NONE | description}
  storage: {NONE | description}
  secrets: {NONE | description}
  env_vars: {NONE | description}
  ci_cd: {NONE | MINIMAL | description}
```

## NFR Registry

| # | Category | Verdict | Target / Justification |
|---|----------|---------|------------------------|
| 1 | Performance | {PRESENT/PARTIAL/MISSING/N/A} | {target_or_justification} |
| 2 | Scalability | {…} | {…} |
| 3 | Availability | {…} | {…} |
| 4 | Reliability | {…} | {…} |
| 5 | Security | {…} | {…} |
| 6 | Observability | {…} | {…} |
| 7 | Maintainability | {…} | {…} |

(Each MUST be PRESENT / PARTIAL / MISSING / N/A justified.)

## Security Gate

| # | Item | Verdict | Evidence / Justification |
|---|------|---------|--------------------------|
| 1 | Authentication | {PASS/FAIL/N/A} | {…} |
| 2 | Authorization | {…} | {…} |
| 3 | Data Exposure | {…} | {…} |
| 4 | Input Sanitization | {…} | {…} |
| 5 | Secrets Handling | {…} | {…} |
| 6 | Audit Trail | {…} | {…} |

**Verdict: {PASS | FAIL | N/A}** (binary — 0 FAIL items required for PASS).

## Observability Requirements

### Structured Logs

| Event | Severity | Required Fields | Purpose |
|-------|----------|-----------------|---------|

### Metrics / Traces / Alerts / Dashboards / SLOs

(Or `All N/A — {justification, e.g. "internal CLI tool, no metrics infrastructure"}`.)

## Implementation Plan

### Tasks

- [ ] Task 1: {brief description}
  - Files: {paths}
  - Action: {what_to_do}

### Technical Acceptance Criteria

- [ ] TAC-1 *(Ubiquitous, refs BAC-1)*: The {system} shall {behavior}.
- [ ] TAC-2 *(Event-driven, refs BAC-2)*: When {trigger}, the {system} shall {behavior}.
- [ ] TAC-3 *(State-driven)*: While {state}, the {system} shall {behavior}.
- [ ] TAC-4 *(Optional)*: Where {feature_is_enabled}, the {system} shall {behavior}.
- [ ] TAC-5 *(Unwanted)*: If {undesired_condition}, then the {system} shall {prevent | handle}.

> TACs MUST use one of the 5 EARS patterns per `ac-format-rule.md`.

## Validation Metier

- [ ] VM-1 [{api|e2e|db|code}] *(BAC-N)*: {how to verify}.

## Guardrails

**Mandatory (project baseline):**

1. {guardrail_1}

**Story-specific:**

2. {guardrail_2}

## Boundaries

### ✅ Always Do (no approval needed)

- {item_1}
- {item_2}
- {item_3}

### ⚠️ Ask First (high-impact, require explicit user approval)

- {item_1}
- {item_2}
- {item_3}

### 🚫 Never Do (hard stops, no exceptions)

- {item_1}
- {item_2}
- {item_3}

## Risks & Assumptions

### Risks

| ID | Description | Probability | Impact | Mitigation | Validation Method | Owner |
|----|-------------|:----:|:----:|------------|-------------------|-------|
| Risk-1 | {desc} | {LOW/MED/HIGH} | {LOW/MED/HIGH} | {mitigation} | {method} | {owner} |

### Assumptions

| ID | Assumption | Source | Status | Validation Method |
|----|-----------|--------|--------|-------------------|
| Assumption-1 | {assumption} | {source} | {VERIFIED/UNVERIFIED} | {method} |

## INVEST Self-Check

| Criterion | Answer | Evidence |
| --------- | ------ | -------- |
| Independent | {YES/NO} | {evidence} |
| Negotiable | {YES/NO} | {evidence} |
| Valuable | {YES/NO} | {evidence} |
| Estimable | {YES/NO} | {evidence} |
| Small | {YES/NO} | {evidence — should be YES for quick profile} |
| Testable | {YES/NO} | {evidence} |

## Test Strategy

| TAC | Pattern | Priority | Unit | Integration | Journey/E2E | Key Scenarios |
|-----|---------|----------|------|-------------|-------------|---------------|

## File List

### NEW files

- {path}

### MODIFIED files

- {path}
