# Story Spec Completeness Rule

**This document is loaded by all bmad-* workflow skills that produce or consume story specs.** It defines the mandatory sections of a story spec (v2 schema) and the consumers that depend on each.

## Mandatory sections

Every story spec produced by `bmad-create-story` (full mode) and `bmad-quick-dev` (quick mode, with N/A allowances) MUST contain the following sections:

| # | Section | Required in Full | Required in Quick | Consumed by |
|---|---------|------------------|-------------------|-------------|
| 1 | Definition of Done (product) | YES | YES | validation-frontend / desktop / metier (intake), dev-story, code-review |
| 2 | Problem | YES | YES | dev-story (context), review-story |
| 3 | Proposed Solution | YES | YES | dev-story, review-story |
| 4 | Scope (Included / Excluded) | YES | YES | dev-story scope-completeness, code-review meta-1 |
| 5 | Out of Scope (explicit non-goals) | YES | YES | code-review (scope-creep detection), dev-story scope-completeness |
| 6 | Business Context (User Journey + BACs G/W/T + External Dependencies) | YES | YES | review-story step-05, validation-metier (VM derivation), dev-story |
| 7 | Technical Context (Codebase Patterns + Files + Decisions) | YES | YES | dev-story step-05, code-review |
| 8 | Real-Data Findings | YES | YES (terse N/A allowed with justification) | review-story step-05 (verifies the work was done), code-review (audit) |
| 9 | External Research (docs, best practices, gotchas) | YES | YES (terse N/A allowed with justification) | review-story step-05, code-review |
| 10 | Data Model | conditional (story touches schema) | conditional | dev-story, code-review |
| 11 | API Contracts | conditional (story touches API) | conditional | dev-story, code-review meta-1 |
| 12 | Infrastructure | conditional | conditional | dev-story, code-review |
| 13 | External Data Interface Contracts | conditional | conditional | dev-story, code-review |
| 14 | Data Mapping | conditional (end-to-end flow) | conditional | dev-story, code-review |
| 15 | NFR Registry (7 categories) | YES | YES (each cat may be N/A with justification) | code-review meta-1, review-story |
| 16 | Security Gate (binary) | YES | YES | code-review meta-3 (if exists), review-story, dev-story |
| 17 | Observability Requirements | YES | YES | code-review meta-2, dev-story |
| 18 | Implementation Plan (Tasks + TACs in EARS) | YES | YES | dev-story (primary consumer), code-review meta-1 |
| 19 | Guardrails | YES | YES | dev-story step-08, code-review |
| 20 | Validation Metier (VM-N) | YES | YES | validation-frontend / desktop / metier (mandatory intake), troubleshoot |
| 21 | Boundaries Triple (Always-do / Ask-first / Never-do) | YES | YES | dev-story step-08, code-review |
| 22 | Risks & Assumptions Register | YES | YES | review-story, code-review meta-1c |
| 23 | INVEST Self-Check | YES | YES | review-story step-05 (gate), step-12 multi-validator |
| 24 | Test Strategy | YES | YES | dev-story step-08 (TDD), tea-atdd, tea-trace |
| 25 | File List (grouped by service/area) | YES | YES | dev-story scope-completeness, code-review |
| 26 | Previous Story Learnings | conditional (Enrichment mode w/ COMPLETED_STORIES) | n/a | review-story, dev-story |

**Total mandatory sections in Full mode:** 22 (1-9, 15-25) + at least 1 conditional based on scope = 23+
**Total mandatory sections in Quick mode:** 22 with terse N/A allowed for sections 8 and 9

## Validation enforcement

`tools/validate-story-spec.js` must enforce:
- Every mandatory section present (heading match)
- BACs format = Given / When / Then
- TACs format = one of the 5 EARS patterns (per `ac-format-rule.md`)
- VM-N sequential numbering
- Risk-N + Assumption-N sequential numbering
- Security Gate binary verdict (PASS / FAIL / N/A justified)
- INVEST self-check has 6 answered questions (not blanks)
- N/A status with 1-line justification (not just "N/A")

Mode: `--profile=full` (create-story) or `--profile=quick` (quick-dev).

## Why these sections

Each section maps to a documented industry standard or a known consumer dependency:
- DoD, BAC, VM are BMAD-native (validation-* hard-depend on them since v1)
- Real-Data Findings, External Research come from review-story discipline (now lifted to spec time)
- NFR Registry follows the 7-category standard (perf / scalability / availability / reliability / security / observability / maintainability / usability)
- Security Gate follows OWASP + compliance baseline (GDPR / HIPAA / SOC2 / PCI-DSS as applicable)
- Boundaries Triple comes from Addy Osmani's "good spec for AI agents" framework
- INVEST is the canonical agile story quality check
- Out-of-Scope is the Kiro `requirements.md` standard (explicit non-goals)
- Risks/Assumptions is industry-standard project management

## Application by Workflow Phase

| Workflow | How to apply |
|----------|-------------|
| **create-story** | Step-11-plan emits all sections; step-12-review (multi-validator) checks completeness; step-13-output passes through validate-story-spec.js before publishing to tracker. |
| **quick-dev** | Single composite step emits all sections; allows N/A on Real-Data + External Research with terse justification. |
| **review-story** | Step-05-analyze flags MISSING mandatory sections as MAJOR; flags SUPERFICIAL Real-Data / External Research as MINOR-to-MAJOR. |
| **dev-story** | Step-02-load-issue extracts every section, surfaces missing-but-mandatory sections as HALT (with offer to bootstrap). |
| **code-review** | Meta-1 expects all sections; missing → BLOCKER. |
| **validation-** | Mandatory sections used: DoD + VM. Other sections optional context. |
| **tea-** | Mandatory sections used: BACs + TACs. Other sections optional context. |
| **troubleshoot** | scope-completeness extracts: DoD, BAC, TAC, VM, Tasks, Files, Out-of-Scope, Boundaries, Risks. |

## Exemption rule

The only valid exemption is an explicit user instruction in the conversation citing this rule by name. Generic excuses ("simple story", ".md only", "auto mode", "no time") are forbidden rationalizations per `workflow-adherence.md`.
