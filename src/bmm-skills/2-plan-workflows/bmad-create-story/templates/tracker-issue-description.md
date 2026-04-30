# Tracker Issue Description Template (v2)

Template for composing the tracker issue description in Step 11/13.

This template implements the **story-spec v2 (monolithic) or v3 (bifurcation) schema** defined by `bmad-shared/spec/spec-completeness-rule.md`. All sections marked ALWAYS are mandatory for both `bmad-create-story` (full mode) and `bmad-quick-dev` (quick mode, with N/A allowances on Real-Data Findings + External Research).

## Structure

```markdown
## Definition of Done (product)

**Feature:**
{feature_dod — BACs satisfied, user journey validated}

**Non-regression:**
{non_regression_dod — impacted flows verified, non-regression VMs pass}

---

## Problem

{problem_statement}

## Proposed Solution

{solution}

## Scope

**Included:** {in_scope}
**Excluded:** {out_of_scope_summary}

## Out of Scope

{out_of_scope_register — see out-of-scope-template.md}

| # | Non-goal | Why excluded | Where it might land |
| - | -------- | ------------ | -------------------- |
| OOS-1 | {item} | {reason} | {next story / future epic / never} |

> Scope-creep policy: any modification outside `Files to Create / Modify` AND delivering an OOS-N item → BLOCKER in code-review.

## Business Context

### User Journey E2E

{user_journey — primary actor, numbered steps, from conversation or PRD}

### Business Acceptance Criteria

{BACs — Given/When/Then, observable outcomes}

> BACs MUST use `Given … When … Then …` per `ac-format-rule.md`.

### External Dependencies & Validation Gates

{external_dependencies_table — Dependency, Owner, Gate, Status}

<details>
<summary>Technical Context</summary>

### Codebase Patterns

{patterns_from_investigation}

### Relevant Files

| File | Role |
| ---- | ---- |

{files_table}

### Technical Decisions

{technical_decisions}

</details>

## Real-Data Findings

{real_data_findings — see real-data-findings-template.md}

> Sources investigated: provider files, DB queries (staging/prod), cloud logs.
> Real samples (anonymised), schema-vs-reality drift, edge cases observed.
> Spec assumptions table comparing CODE EXPECTS vs REALITY SENDS.
> If not applicable: `N/A — {1-line justification}` (allowed only in quick mode).

## External Research

{external_research — see external-research-template.md}

> Official docs / RFC / changelog / known issues / version constraints.
> Each finding linked to the AC, TAC, or Risk it informs.
> If not applicable: `N/A — {1-line justification}` (allowed only in quick mode).

## Data Model

{data_model — schema delta, migration plan, indexes, DTO/Domain/DB mapping}

## API Contracts

{api_contracts}

## Infrastructure

{infra_assessment — deployment chain status, IaC changes}

## External Data Interface Contracts

{interface_contracts}

## Data Mapping

{data_mapping — DTO -> Domain -> DB with transformations}

## NFR Registry

{nfr_registry — see nfr-registry-template.md}

> 7 categories: Performance / Scalability / Availability / Reliability / Security / Observability / Maintainability / Usability.
> Each category status: PRESENT / MISSING / PARTIAL / N/A (with 1-line justification).
> Cross-reference with `project.md#nfr-defaults` if defined.

## Security Gate

{security_gate — see security-gate-template.md}

**Verdict:** PASS | FAIL | N/A *(N/A requires per-item justification)*

> Binary checklist: auth / authz / data exposure / input sanitization / secrets / audit trail / compliance (GDPR / HIPAA / SOC2 / PCI-DSS).
> ANY item FAIL → gate FAILS → BLOCKING for production. Add remediation tasks below.

## Observability Requirements

{observability_requirements — see observability-requirements-template.md}

> Structured logs (mandatory events + required fields) / metrics / traces / alerts (with runbook) / dashboards / SLO/SLI.
> Cross-reference with `project.md#observability-standards` if defined.

## Implementation Plan

### Tasks

{tasks_with_checkboxes — grouped by area, [CI/CD] and [INFRA] prefixed}

### Technical Acceptance Criteria

{TACs — EARS notation, each tracing to a BAC}

> TACs MUST use one of the 5 EARS patterns per `ac-format-rule.md` and `ears-acceptance-criteria-template.md`:
> 1. Ubiquitous — `The {system} shall {action}.`
> 2. Event-driven — `When {trigger}, the {system} shall {action}.`
> 3. State-driven — `While {state}, the {system} shall {action}.`
> 4. Optional — `Where {feature is enabled}, the {system} shall {action}.`
> 5. Unwanted — `If {undesired}, then the {system} shall {action to prevent / handle}.`

## Guardrails

{story_specific_guardrails + mandatory guardrails}

## Validation Metier

Tests to execute in production after deployment. The story moves to the testing state and only transitions to **Done** once these tests pass.

{validation_metier_checklist}

> Each VM item declares its type and traces to BACs. Format: `VM-N [type] *(BAC-X,Y)* : description`
> Non-regression VMs trace to impacts: `VM-NR-N [type] *(Impact IN)* : description`
> Types: `[api]`, `[db]`, `[e2e]`, `[component]`, `[visual]`, `[responsive]`, `[accessibility]`, `[error-handling]`, `[performance]`, `[cloud_log]`, `[state]`

## Boundaries (Agent Execution Constraints)

{boundaries_triple — see boundaries-triple-template.md}

#### ✅ Always Do

{always_do_items — project baseline + story-specific}

#### ⚠️ Ask First

{ask_first_items — project baseline + story-specific}

#### 🚫 Never Do

{never_do_items — project baseline + story-specific}

## Risks & Assumptions Register

{risks_and_assumptions — see risks-assumptions-register-template.md}

### Risks

| ID | Description | Probability | Impact | Mitigation | Validation Method | Owner |
| -- | ----------- | ----------- | ------ | ---------- | ----------------- | ----- |

### Assumptions

| ID | Assumption | Source | Validation Status | Validation Method |
| -- | ---------- | ------ | ----------------- | ----------------- |

## INVEST Self-Check

{invest_check — see invest-checklist-template.md}

| Criterion | Answer | Evidence |
| --------- | ------ | -------- |
| Independent | YES / NO | {evidence} |
| Negotiable  | YES / NO | {evidence} |
| Valuable    | YES / NO | {evidence} |
| Estimable   | YES / NO | {evidence} |
| Small       | YES / NO | {evidence} |
| Testable    | YES / NO | {evidence} |

> ANY answer = NO → story FAILS the gate; either fix the failing criterion or split.

## Previous Story Learnings

{patterns_from_completed_stories — what worked, mistakes to avoid, regressions to watch}

## Test Strategy

| TAC | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | -------- | ---- | ----------- | ------- | ------------- |

{test_strategy_table}

### Quality Criteria

- P0: >90% unit coverage, >80% integration coverage, all critical paths in journey tests
- P1: >80% unit coverage, >60% integration coverage

## File List

{expected_files — grouped by service/area}
```

## Conditional Sections

| Section | Discovery / Enrichment | Quick mode | Note |
|---------|-----------------------|------------|------|
| **Definition of Done (product)** | ALWAYS, FIRST | ALWAYS | |
| **Problem / Proposed Solution / Scope** | ALWAYS | ALWAYS | |
| **Out of Scope** | ALWAYS | ALWAYS | At least 2 items |
| **Business Context** | ALWAYS | ALWAYS | BACs in G/W/T |
| **Technical Context** | ALWAYS, collapsible `<details>` | ALWAYS | |
| **Real-Data Findings** | ALWAYS | ALWAYS (terse N/A allowed) | Producer for downstream review-story |
| **External Research** | ALWAYS | ALWAYS (terse N/A allowed) | |
| **Data Model** | conditional (story touches schema) | conditional | |
| **API Contracts** | conditional (story touches API) | conditional | |
| **Infrastructure** | conditional | conditional | |
| **External Data Interface Contracts** | conditional | conditional | |
| **Data Mapping** | conditional (E2E flow) | conditional | |
| **NFR Registry** | ALWAYS (each cat may be N/A) | ALWAYS | |
| **Security Gate** | ALWAYS (binary verdict) | ALWAYS | |
| **Observability Requirements** | ALWAYS | ALWAYS | |
| **Implementation Plan** | ALWAYS | ALWAYS | TACs in EARS |
| **Guardrails** | ALWAYS | ALWAYS | |
| **Validation Metier** | ALWAYS | ALWAYS | VMs trace to BACs |
| **Boundaries** | ALWAYS | ALWAYS | All 3 buckets |
| **Risks & Assumptions** | ALWAYS | ALWAYS | |
| **INVEST Self-Check** | ALWAYS | ALWAYS | |
| **Previous Story Learnings** | conditional (Enrichment w/ COMPLETED_STORIES) | n/a | |
| **Test Strategy** | ALWAYS | ALWAYS | |
| **File List** | ALWAYS | ALWAYS | |

## Cross-references

- `bmad-shared/spec/spec-completeness-rule.md` — canonical mandatory section list
- `bmad-shared/spec/ac-format-rule.md` — BAC vs TAC format rule
- `bmad-shared/spec/boundaries-rule.md` — boundaries triple rule
- `bmad-shared/data/*-template.md` — per-section templates
- `tools/validate-story-spec.js` — automated enforcement (heading match, format check, N/A justification)
