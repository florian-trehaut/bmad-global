---
schema_version: "3.0"
mode: bifurcation
tracker_issue_id: "ISS-fixture-001"
tracker_url: "https://example-tracker.test/issues/BMAD-FIXTURE-001"
business_content_hash: "abcd1234"
business_synced_at: "2026-04-28T15:00:00.000Z"
generated: 2026-04-28
generator: bmad-create-story
slug: spec-split-local-fixture
story_points: 3
profile: full
---

# Fixture: bifurcation valid local file

## Definition of Done (product)

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

Story Done when fixture demonstrates the bifurcated local file shape.

## Problem

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

The split validator must accept a local file that has business mirror headings + technical canonical sections.

## Proposed Solution

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

Stable fixture for tests.

## Scope

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

Included/excluded — see tracker.

## Out of Scope

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

- OOS-1: Tracker writes from this fixture — fixture is read-only.
- OOS-2: Real Linear API calls — offline test fixture.

## Business Context

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

User journey + BACs G/W/T in tracker.

## Validation Metier

> Mirror — see tracker for canonical: https://example-tracker.test/issues/BMAD-FIXTURE-001

VM-1 / VM-2 in tracker.

## Technical Context

<details>
<summary>Codebase Patterns + Files + Decisions</summary>

Patterns: fixture-based unit testing (no mocks per project rule). Files: this fixture + `test/test-validate-story-spec-split.js`. Decisions: keep fixture small, deterministic, offline.

</details>

## Real-Data Findings

N/A — fixture file, no real-data investigation needed for unit testing.

## External Research

N/A — fixture file.

## NFR Registry

| # | Category | Verdict | Target / Evidence |
|---|----------|---------|-------------------|
| 1 | Performance | N/A | Test fixture |
| 2 | Scalability | N/A | Test fixture |
| 3 | Availability | N/A | Test fixture |
| 4 | Reliability | PRESENT | Deterministic content |
| 5 | Security | N/A | No secrets |
| 6 | Observability | N/A | Test fixture |
| 7 | Maintainability | PRESENT | Stable structure |
| 8 | Usability | N/A | Test fixture |

## Security Gate

| # | Item | Verdict |
|---|------|---------|
| 1 | Authentication | N/A |
| 2 | Authorization | N/A |
| 3 | Data Exposure | PASS |

**Verdict:** PASS

## Observability Requirements

N/A — test fixture, no production observability.

## Implementation Plan

### Group A — Fixture maintenance

- [ ] Task 1: Maintain fixture stability across schema versions.

### Technical Acceptance Criteria

- [ ] **TAC-1** *(Ubiquitous, refs BAC-1)*: The fixture shall remain a valid story-spec v3 bifurcation example.
- [ ] **TAC-2** *(Event-driven, refs BAC-2)*: When the validator parses this fixture in --split mode, the validator shall report all sections as PRESENT.

## Guardrails

- Never change the fixture structure without updating tests.

## Boundaries Triple

### ✅ Always Do

- Keep fixture deterministic.
- Use realistic but synthetic IDs (no real Linear UUIDs).
- Document changes in test commentary.

### ⚠️ Ask First

- Add new sections to the fixture (would require updating tests).
- Change frontmatter schema version (cascading effect).
- Add real PII (forbidden).

### 🚫 Never Do

- Reference real production tracker IDs.
- Include secrets, tokens, or credentials.
- Use unstable timestamps (always pin).

## Risks & Assumptions Register

### Risks

| ID | Description | Probability | Impact | Mitigation | Owner |
|----|-------------|:-----------:|:------:|------------|-------|
| Risk-1 | Fixture diverges from validator schema | LOW | MED | Tests catch via assertions | Dev |

### Assumptions

| ID | Assumption | Source | Status |
|----|------------|--------|--------|
| A-1 | Validator parses business section markers correctly | spec-bifurcation.md | VERIFIED |

## INVEST Self-Check

| Criterion | Answer | Evidence |
|-----------|--------|----------|
| Independent | YES | Self-contained fixture |
| Negotiable | YES | Adjustable per test suite needs |
| Valuable | YES | Anchors the test surface |
| Estimable | YES | Static content |
| Small | YES | < 200 lines |
| Testable | YES | Asserted by 5 test cases |

## Test Strategy

| TAC | Pattern | Priority | Levels |
|-----|---------|----------|--------|
| TAC-1 | Ubiquitous | P0 | Unit |
| TAC-2 | Event-driven | P0 | Unit |

## File List

- `test/fixtures/spec-split-local.md` (this file)
- `test/fixtures/spec-split-tracker.json` (companion)
- `test/test-validate-story-spec-split.js` (consumer)
