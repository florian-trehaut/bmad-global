---
title: '{title}'
type: 'feature' # feature | bugfix | refactor | chore
created: '{date}'
status: 'draft' # draft | ready-for-dev | in-progress | in-review | done
profile: 'quick' # quick (this template) | full (use bmad-create-story for the full v2 schema)
context: [] # optional: `{project-root}/`-prefixed paths to project-wide standards/docs the implementation agent should load.
---

<!--
  This is the QUICK profile of the story-spec v2 (monolithic) or v3 (bifurcation) schema (`bmad-shared/spec-completeness-rule.md`).
  All mandatory sections from v2 are present here, with terse N/A justifications allowed for
  Real-Data Findings and External Research when the scope is purely internal.

  For complex stories that warrant full investigation (provider data, DB queries, NFR rigor,
  multi-validator review, Business Comprehension Gate), use `/bmad-create-story` (full profile).

  Target: 1500-2500 tokens for the quick profile. Anything richer = use full profile.

  IMPORTANT: Remove all HTML comments when filling this template.
-->

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Definition of Done (product)

**Feature:** {1-line outcome — what the user can observe when this is done}
**Non-regression:** {1-line — what existing flows must still work}

## Problem

{1-2 sentences — what is broken or missing, and why it matters}

## Proposed Solution

{1-2 sentences — the high-level approach (the "what", not the "how")}

## Scope

**Included:** {bullet list — what's in}
**Excluded:** {bullet list — what's NOT in}

## Out of Scope (explicit non-goals)

| # | Non-goal | Why excluded | Where it might land |
| - | -------- | ------------ | -------------------- |
| OOS-1 | {item that a thoughtful reader might EXPECT to be included} | {1-line reason} | {next story / future epic / never} |
| OOS-2 | {item} | {reason} | {target} |

## Business Context

### User Journey

**Primary actor:** {persona}

1. {step}
2. {step}
N. {expected outcome}

### Business Acceptance Criteria (BACs — Given/When/Then)

- [ ] BAC-1: Given {context}, when {action}, then {observable result}.
- [ ] BAC-2: Given {context}, when {action}, then {result}.

### External Dependencies & Validation Gates

| Dependency | Owner | Required Action | Gate (blocking?) | Status |
| ---------- | ----- | --------------- | ---------------- | ------ |

## Real-Data Findings

<!-- Quick mode: terse N/A justification allowed if scope is purely internal (no provider, no DB drift, no cloud logs). Full mode requires full investigation per real-data-findings-template.md. -->

{either: investigation findings (provider samples, DB queries, cloud logs); or: "N/A — {1-line: scope is internal-only, no external data flow"}}

## External Research

<!-- Quick mode: terse N/A justification allowed if no external libs / APIs / protocols are touched. Full mode requires research per external-research-template.md. -->

{either: source citations + key findings; or: "N/A — {1-line: uses only internal utilities, no new external dep"}}

## Technical Context

### Code Map

- `FILE` — ROLE_OR_RELEVANCE
- `FILE` — ROLE_OR_RELEVANCE

### Technical Decisions

{1-3 bullets — non-obvious technical choices (algorithm, library, pattern)}

</frozen-after-approval>

## NFR Registry

| Category | Requirement | Target | Measurement | Status |
| -------- | ----------- | ------ | ----------- | ------ |
| Performance     | {target} | {e.g. < 500ms p95} | {test} | PRESENT / MISSING / PARTIAL / N/A |
| Scalability     | {target} | {volume / growth} | {test}    | PRESENT / MISSING / PARTIAL / N/A |
| Availability    | {target} | {SLO}             | {SLI}     | PRESENT / MISSING / PARTIAL / N/A |
| Reliability     | {target} | {error budget}    | {metric}  | PRESENT / MISSING / PARTIAL / N/A |
| Security        | see Security Gate below | — | — | (cross-ref) |
| Observability   | see Observability below | — | — | (cross-ref) |
| Maintainability | {target} | {coverage / complexity} | {tooling} | PRESENT / MISSING / PARTIAL / N/A |
| Usability       | {target} | {WCAG / i18n}     | {audit}   | PRESENT / MISSING / PARTIAL / N/A |

> All 7 categories must have a status. N/A allowed only with 1-line justification.

## Security Gate

**Verdict:** PASS | FAIL | N/A *(N/A requires per-item justification)*

| Item | Verdict | Evidence / Mitigation |
| ---- | ------- | --------------------- |
| Authentication       | PASS / FAIL / N/A | {evidence or "no user input / no auth surface"} |
| Authorization        | PASS / FAIL / N/A | {evidence} |
| Data Exposure        | PASS / FAIL / N/A | {evidence} |
| Input Sanitization   | PASS / FAIL / N/A | {evidence} |
| Secrets Handling     | PASS / FAIL / N/A | {evidence} |
| Audit Trail          | PASS / FAIL / N/A | {evidence} |
| Compliance — applicable | PASS / FAIL / N/A | {GDPR / HIPAA / SOC2 / PCI-DSS / Other / "no regulated data"} |

> ANY item FAIL → gate FAILS → BLOCKING for production. Add remediation tasks in Implementation Plan.

## Observability Requirements

**Mandatory log events:**

| Event | Severity | Required Fields |
| ----- | -------- | --------------- |
| {EventName} | INFO | trace_id, ... |

**Metrics:** {list with name + type + labels, OR "N/A — {1-line}"}
**Traces:** {span propagation + critical spans, OR "N/A"}
**Alerts:** {alert + trigger + routing + runbook, OR "N/A"}
**Dashboard:** {URL or "task added to create one" or "N/A"}
**SLO:** {SLI / target / window, OR "N/A"}

## Implementation Plan

### Tasks

- [ ] Task 1: `FILE` — ACTION — RATIONALE
- [ ] Task 2: `FILE` — ACTION — RATIONALE
- [ ] [CI/CD] Task N: {if pipeline changes}
- [ ] [INFRA] Task M: {if infra changes}
- [ ] [OBS] Task O: {observability remediation if applicable}
- [ ] [SEC] Task S: {security remediation if Security Gate FAIL}

### Technical Acceptance Criteria (TACs — EARS)

- [ ] TAC-1 *(Ubiquitous, refs BAC-X)*: The {system} shall {action}.
- [ ] TAC-2 *(Event-driven, refs BAC-X)*: When {trigger}, the {system} shall {action}.
- [ ] TAC-3 *(State-driven, refs BAC-X)*: While {state}, the {system} shall {action}.
- [ ] TAC-4 *(Optional, refs BAC-X)*: Where {feature is enabled}, the {system} shall {action}.
- [ ] TAC-5 *(Unwanted, refs BAC-X)*: If {undesired condition}, then the {system} shall {action to prevent / handle}.

> Every TAC matches one of the 5 EARS patterns AND references at least one BAC. See `bmad-shared/data/ears-acceptance-criteria-template.md`.

## Guardrails

- {story-specific guardrail}
- "Do not consider the story complete if schema changes exist without generated migrations"
- "Do not consider the story complete if a service is not deployable end-to-end via CI/CD"
- (other mandatory guardrails per `bmad-create-story` step-11 §4 — apply project-wide)

## Validation Metier

- [ ] VM-1 [type] *(BAC-X)*: {concrete production test, expected result}
- [ ] VM-2 [type] *(BAC-Y)*: {test, result}

> Types: `[api]`, `[db]`, `[e2e]`, `[component]`, `[visual]`, `[responsive]`, `[accessibility]`, `[error-handling]`, `[performance]`, `[cloud_log]`, `[state]`

## Boundaries (Agent Execution Constraints)

### ✅ Always Do

- Run `{project quality command}` before declaring a task complete
- Follow `project.md#conventions`
- Use the project's logger (no `console.log`)

### ⚠️ Ask First

- Add a new dependency to package.json
- Modify CI/CD pipeline files
- Touch files outside the Code Map

### 🚫 Never Do

- Commit secrets or credentials
- Use `--no-verify` to skip hooks
- Remove a failing test to make CI pass

## Risks & Assumptions

### Risks

| ID | Description | Probability | Impact | Mitigation | Validation Method |
| -- | ----------- | ----------- | ------ | ---------- | ----------------- |

### Assumptions

| ID | Assumption | Source | Validation Status | Validation Method |
| -- | ---------- | ------ | ----------------- | ----------------- |

## INVEST Self-Check

| Criterion | Answer | Evidence |
| --------- | ------ | -------- |
| Independent | YES / NO | {evidence} |
| Negotiable  | YES / NO | {evidence} |
| Valuable    | YES / NO | {evidence} |
| Estimable   | YES / NO | {evidence} |
| Small       | YES / NO | {evidence} |
| Testable    | YES / NO | {evidence} |

> ANY NO → fix or split.

## Spec Change Log

<!-- Append-only. Populated by step-04 during review loops. -->

## Verification

**Commands:**
- `COMMAND` — expected: SUCCESS_CRITERIA

**Manual checks (if no CLI applies):**
- WHAT_TO_INSPECT_AND_EXPECTED_STATE
