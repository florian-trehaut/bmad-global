# Story Spec Completeness Rule (v3)

**This document is loaded by all bmad-* workflow skills that produce or consume story specs.** It defines the mandatory sections of a story spec and the consumers that depend on each.

**Schema versions tracked here:**
- **v3** (current) — adds **Bifurcation Mode**: business sections live in the collaborative tracker, technical sections live in a local file with a condensed mirror of business sections.
- **v2** — single-file monolithic spec with all sections in one place.
- **v1** — pre-NFR/Security-Gate (legacy).

A story spec declares its mode via `mode: bifurcation | monolithic` in YAML frontmatter. **`mode` absent → monolithic** (backward compat for legacy v2 specs).

---

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

---

## Bifurcation Mode (v3)

When `spec_split_enabled: true` in `workflow-context.md` AND `tracker ∈ {linear, github, gitlab, jira}`, story specs are produced in **bifurcation mode** (`mode: bifurcation` in frontmatter). Sections are physically split between the collaborative tracker and a local file according to their primary audience.

### Why bifurcation

- **Business sections** (DoD, Problem, Solution, Scope, OOS, Business Context with BACs G/W/T, Validation Metier) are read and edited by Product Owners, stakeholders, and PMs. They live where collaboration happens naturally — in the tracker.
- **Technical sections** (NFR, Security Gate, EARS TACs, INVEST, Test Strategy, File List, Boundaries, Risks, Real-Data Findings, External Research, Data Model, API, Infrastructure, External Interfaces, Data Mapping, Guardrails, Observability) are read by developers and Claude. They live versioned with the code in a local `.md` file.
- **Mirror** of business sections (heading + 1-line synopsis + link to tracker) lives in the local file, giving Claude rapid context without fetching the tracker on every operation.

### Section → Location mapping

| # | Section | bifurcation canonical | local mirror |
|---|---------|----------------------|--------------|
| 1 | Definition of Done (product) | tracker | yes |
| 2 | Problem | tracker | yes |
| 3 | Proposed Solution | tracker | yes |
| 4 | Scope (Included/Excluded) | tracker | yes |
| 5 | Out of Scope | tracker | yes |
| 6 | Business Context | tracker | yes |
| 20 | Validation Metier (VM-N) | tracker | yes |
| 7 | Technical Context | local | n/a |
| 8 | Real-Data Findings | local | n/a |
| 9 | External Research | local | n/a |
| 10-14 | Data Model / API / Infra / External Interfaces / Data Mapping | local | n/a |
| 15 | NFR Registry | local | n/a |
| 16 | Security Gate | local | n/a |
| 17 | Observability Requirements | local | n/a |
| 18 | Implementation Plan (Tasks + TACs EARS) | local | n/a |
| 19 | Guardrails | local | n/a |
| 21 | Boundaries Triple | local | n/a |
| 22 | Risks & Assumptions Register | local | n/a |
| 23 | INVEST Self-Check | local | n/a |
| 24 | Test Strategy | local | n/a |
| 25 | File List | local | n/a |

The full canonical mapping with read/write contracts is documented in `~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md`.

### Frontmatter (v3 bifurcation)

```yaml
---
schema_version: "3.0"
mode: bifurcation                # required when bifurcation is active
tracker_issue_id: <id>           # links local ↔ tracker (Linear UUID, GitHub issue number, GitLab IID, Jira key)
tracker_url: <url>               # human-readable link to the tracker issue
business_content_hash: <hex8>    # MD5(8) of canonical business sections at last sync — drift detection
business_synced_at: <ISO 8601>   # timestamp of last sync from tracker
---
```

### Frontmatter (v2 monolithic — unchanged)

```yaml
---
schema_version: "2.0"            # or absent for legacy v1 specs
# (no mode field) → mode defaults to monolithic
---
```

### Mirror marker

Every business section copied into the local file as a mirror MUST include this marker as its first line, where `{tracker_url}` is the canonical tracker issue URL:

```
> Mirror — see tracker for canonical: {tracker_url}
```

Workflows reading the local file MUST recognize the marker and treat the mirrored content as **non-canonical**. The mirror is regenerated from the tracker on each sync; manual edits to mirror sections are discarded.

### Backward compatibility

- **Legacy v2 specs** (`mode` field absent) are read as monolithic — every workflow reads sections from the local file only, no tracker fetch attempt.
- **Projects with `tracker == file`** (file-based tracker, no collaborative tracker available) ALWAYS produce monolithic specs — bifurcation requires a collaborative tracker. The `spec_split_enabled` flag is ignored when `tracker == file`.
- **`spec_split_enabled` field absent** in `workflow-context.md` defaults to `false` (monolithic) — no behavior change for projects that never opted in.

### Drift detection

Bifurcation mode introduces drift detection because the tracker can be edited externally (PO updates the description) while the local file remains static. The drift contract is documented in `spec-bifurcation.md`. Summary:

- Lightweight check: compare tracker `updatedAt` vs frontmatter `business_synced_at` (with 60s tolerance for clock skew).
- On drift detected: HALT, present menu **[R]efresh / [I]gnore / [V]iew diff**.
- Drift checks happen **on demand** at the start of review-story / validation-* / dev-story refresh steps. **Never proactively poll** the tracker.

### Worktree handoff

Specs created on the main repo (by `bmad-create-story`) are moved to the dev worktree at the start of `bmad-dev-story` (step-03-setup-worktree) via atomic `git mv` + commit `spec: handoff to worktree`. After handoff, the spec lives only in the worktree branch — no copy in the main repo. See `spec-bifurcation.md` and `bmad-dev-story/steps/step-03-setup-worktree.md` for the contract.

---

## Validation enforcement

`tools/validate-story-spec.js` enforces:
- Every mandatory section present (heading match)
- BACs format = Given / When / Then
- TACs format = one of the 5 EARS patterns (per `ac-format-rule.md`)
- VM-N sequential numbering
- Risk-N + Assumption-N sequential numbering
- Security Gate binary verdict (PASS / FAIL / N/A justified)
- INVEST self-check has 6 answered questions (not blanks)
- N/A status with 1-line justification (not just "N/A")

**Modes:**
- `--profile=full` (create-story output) or `--profile=quick` (quick-dev output)
- `--split` (bifurcation mode) — loads tracker description via `tracker-crud.md` recipes (`tracker_issue_id` from frontmatter or `--tracker-id` flag), validates business sections in tracker + technical sections in local file + mirror sections in local with marker. Without `--split`, behavior is unchanged (monolithic validation).

---

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

The bifurcation pattern (v3) is informed by:
- [GitHub Spec Kit](https://github.com/github/spec-kit) — "PMs and engineering co-owners ; revisions logged ; shared glossary"
- [Martin Fowler — Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [BDD Specifications by Example](https://www.tutorialspoint.com/behavior_driven_development/bdd_specifications_by_example.htm) — BACs in G/W/T as the collab vehicle PM/dev
- [AWS CloudFormation Drift Detection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html) — timestamp validation prevents stale data

---

## Application by Workflow Phase

| Workflow | How to apply |
|----------|-------------|
| **create-story** | Step-11-plan emits all sections; step-12-review (multi-validator) checks completeness; step-13-output branches on `spec_split_enabled` and `tracker`: bifurcation → write business sections to tracker + technical+mirror to file; monolithic → single .md file. |
| **quick-dev** | Single composite step emits all sections with the same branching as create-story; allows N/A on Real-Data + External Research with terse justification. |
| **review-story** | Step-05-analyze flags MISSING mandatory sections as MAJOR. In bifurcation mode, calls `compose unified view` (per spec-bifurcation.md) before analysis. |
| **dev-story** | Step-02-load-issue extracts every section. In bifurcation mode, step-03-setup-worktree performs the spec handoff (`git mv` main → worktree); subsequent review/validation steps perform drift detection on entry. |
| **code-review** | Meta-1 expects all sections; missing → BLOCKER. In bifurcation mode, reads via `compose unified view`. |
| **validation-** | Mandatory sections used: DoD + VM. In bifurcation mode, reads VMs from tracker (canonical) via `tracker-crud.md` get_issue. |
| **tea-** | Mandatory sections used: BACs + TACs. Reads from local file (TACs are technical, never in tracker). BACs from tracker if bifurcation. |
| **troubleshoot** | scope-completeness extracts: DoD, BAC, TAC, VM, Tasks, Files, Out-of-Scope, Boundaries, Risks. |
| **bmad-knowledge-bootstrap / bmad-knowledge-refresh** | Prompt user for `spec_split_enabled` if `tracker` is collaborative; write the resolved value to `workflow-context.md` (additive UPDATE). |
| **bmad-project-init** | At initial `workflow-context.md` generation, prompt for `spec_split_enabled` IF `tracker` is collaborative. |

---

## Findings handling — story spec scope

A story spec that produces reviewer findings (in any review pass : multi-validator gate, adversarial review, code-review per perspective, validation VMs) MUST include the fix of those findings within its scope, unless a documented skip reason applies (per `core/workflow-adherence.md` Rule 8 — Findings Handling Policy).

**Concretely** : if reviewer findings emerge during the story's lifecycle, the story is amended (new tasks added, scope extended) to fix them in the same PR / commit chain. Creating a "follow-up story" for findings is allowed ONLY when an explicit documented skip reason justifies the deferral — not as a default tactic to ship faster.

The criterion is not the finding's severity (BLOCKER / MAJOR / MINOR / INFO are all fixed by default) — it is the absence of a documented reason to skip.

---

## Exemption rule

The only valid exemption is an explicit user instruction in the conversation citing this rule by name. Generic excuses ("simple story", ".md only", "auto mode", "no time") are forbidden rationalizations per `workflow-adherence.md`.
