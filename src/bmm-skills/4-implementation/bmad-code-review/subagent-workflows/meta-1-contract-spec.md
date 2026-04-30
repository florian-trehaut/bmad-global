---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 1
meta_weight: 0.20
---

# Meta-1 Subagent Workflow: Contract & Spec Integrity

**Goal:** Verify the MR delivers what was specified and keeps public contracts stable.

**Sub-axes (4):**

| Sub-axis | Name | Always-on |
|----------|------|-----------|
| 1a | Specs Compliance | ✓ |
| 1b | API Contract & Backward Compat | ✓ |
| 1c | Decision Documentation (ADR + Design merged) | ✓ |
| 1d | Documentation Coherence | ✓ |

---

## ANTI-DEVIATION CONTRACT

You received a `review_contract` embedded in the `Agent()` prompt from the orchestrator. This is your SOLE source of truth.

**Rules:**

- Execute ONLY the sub-axes listed in `contract.active_sub_axes` (may subset of 1a/1b/1c/1d)
- Review ONLY files listed in `contract.changed_files`
- Load and apply `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md` (always)
- Report findings with exact `file:line` references
- You are **READ-ONLY** — do NOT edit, fix, commit, or modify anything
- Do NOT run format, lint --fix, or any write operation
- NEVER skip an active sub-axis, NEVER downgrade a BLOCKER to WARNING, NEVER mark PASS without evidence

---

## INPUT FORMAT (provided in prompt)

```yaml
review_contract:
  worktree_path: '/path/to/worktree'
  mr_target_branch: 'main'
  mr_iid: 123
  meta: 1
  active_sub_axes: ['1a', '1b', '1c', '1d']

  linear_issue:                      # null if no tracker issue linked
    identifier: 'PRJ-48'
    description: |
      ... (full issue description)
    acceptance_criteria: [...]

  changed_files: [...]
  diff_stats: '+142/-38 across 8 files'
  phase2_suspicious_removals: [...]  # Only if regression-risk produced findings
  project_adrs: [...]                # Loaded ADRs (may be empty)
```

---

## SUB-AXIS 1a: Specs Compliance

**Condition:** 1a is always active when Meta-1 runs.

"Does the code do what was asked — in production, not just in tests?"

### AC Coverage (story-spec v2 — separated BAC + TAC)

For EACH BAC (Given/When/Then) AND each TAC (EARS) in `contract.linear_issue.spec_v2`:

```yaml
ac_coverage:
  bacs:
    - ac_id: 'BAC-1'
      ac_format: 'given-when-then'
      ac_text: 'Given …, when …, then …'
      implemented: true | false
      implementation_location: 'file.ts:line'
      tested: true | false        # integration / journey test that exercises the BAC
      test_location: 'file.spec.ts:line'
      vm_planned: true | false    # Validation Metier scheduled for production verification
      vm_id: 'VM-N'
      status: 'COMPLIANT' | 'PARTIAL' | 'NOT_IMPLEMENTED'

  tacs:
    - ac_id: 'TAC-1'
      ac_format: 'ears'
      ac_pattern: 'ubiquitous' | 'event-driven' | 'state-driven' | 'optional' | 'unwanted'
      ac_text: 'When …, the … shall …' (or other EARS pattern)
      refs_bacs: ['BAC-1', 'BAC-2']
      implemented: true | false
      implementation_location: 'file.ts:line'
      tested: true | false
      test_location: 'file.spec.ts:line'
      pattern_scaffold_match: true | false  # does the test scaffold match the EARS pattern?
      status: 'COMPLIANT' | 'PARTIAL' | 'NOT_IMPLEMENTED'
```

**EARS pattern → expected test scaffold (verify match):**
- Ubiquitous → "always" assertion across multiple fixtures
- Event-driven → setup + trigger + assert
- State-driven → state-machine test (pre-state + transition + post-state)
- Optional → feature-flag conditional test
- Unwanted → negative test + alert assertion (verify the system DID NOT do the forbidden thing AND emitted the proper alert)

`pattern_scaffold_match: false` → MINOR finding (test exists but doesn't exercise the EARS pattern correctly).

### NOT_IMPLEMENTED triggers (BLOCKER)

An AC (BAC or TAC) is NOT_IMPLEMENTED if ANY of these is true:
- Code exists but a dependency is disabled in production
- Code exists but nothing triggers it in production
- Code exists but the downstream service/template it calls does not exist
- Code exists but a required config/secret is missing from deployment config
- Code exists but a migration must run first and there is no migration

### Scope analysis (extended for v2 Out-of-Scope)

- **Scope creep** (MORE than asked) → QUESTION (or BLOCKER if it matches an OOS-N item from the spec's Out-of-Scope register)
- **Missing** (LESS than asked) → BLOCKER
- **Deviation** (SOMETHING ELSE) → BLOCKER
- **Out-of-Scope violation** — diff delivers an item explicitly listed under `## Out of Scope` → **BLOCKER** (story spec contract violated; either re-scope the story or split the diff)

### Boundary violations (story-spec v2)

Scan the diff for actions that match items in the spec's `🚫 Never Do` section of the Boundaries Triple:
- Committed secrets / API keys / tokens / `.env` files
- Edits to `node_modules/`, `vendor/`, `dist/`, generated directories
- Removed failing tests
- `--no-verify` / `--no-gpg-sign` in commits
- Pushes to `main`/`master` without PR (project-dependent — verify per workflow-context.md)

Each match → **BLOCKER** finding.

### Risks register cross-check

For each HIGH-impact risk in `contract.linear_issue.spec_v2.risks_register`:
- Verify the declared mitigation is implemented in the diff (cite file:line)
- If mitigation is absent and the risk is still HIGH/HIGH → **BLOCKER**

### Regression-risk cross-reference

If `contract.phase2_suspicious_removals` is non-empty: verify each suspicious removal against the issue scope. Out-of-scope removals → BLOCKER.

---

## SUB-AXIS 1b: API Contract & Backward Compat

**Condition:** Always-on. In Phase 3 this sub-axis emits `not_implemented: true` and awaits Phase 4 population.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta1-1b-stub'
    severity: QUESTION
    action: defer
    meta: 1
    sub_axis: '1b'
    title: 'API Contract & Backward Compat sub-axis not yet populated (Phase 4)'
    detail: 'Public API surface detection and tool dispatch (api-extractor / oasdiff / graphql-inspector / buf breaking / cargo-semver-checks) land in Phase 4. Skipped for this review.'
    not_implemented: true
```

### Phase 4 target scope

- Public API surface detection primitive (exports, OpenAPI, `*.proto`, `*.graphql`, CLI argv, migrations)
- Tool dispatch per detected stack (see `data/api-surface-detection.md`)
- Expand/contract migration discipline for public schemas
- Deprecation 6-month rule on exported symbols

---

## SUB-AXIS 1c: Decision Documentation (ADR + Design merged)

**Condition:** Always-on. Merges v1 Perspectives 7 (ADR Conformity) + 8 (Design Decisions Audit) into one sub-axis with threshold-based routing.

### Phase A: ADR Conformity

<check if="contract.project_adrs is loaded and non-empty">

For each ADR:
- Check if the MR touches the domain or component covered by the ADR
- If it does, verify the implementation follows the decided approach
- New pattern / service / architectural choice contradicting an ADR → BLOCKER

**Conflict resolution:** when multiple ADRs exist on the same topic, the most recent takes precedence.

</check>

### Phase B: Design-Decision Detection + Threshold Routing

Detect candidate design decisions in the diff (new pattern, new lib, new module, new data model choice).

For each candidate, apply the threshold test:

```
threshold_test:
  - Reverses in < 1 sprint?          (time cost)
  - Affects system qualities?         (availability / perf / security / cost)
  - Cross-team / cross-service?
  - Hard to reverse?
```

If threshold met → **ADR-worthy path** → HALT menu `[A/S/N]`:

> This change introduces **{description}** which should be recorded as an Architecture Decision Record.
>
> **[A]** Create ADR now (invoke `bmad-create-adr`)
> **[S]** Skip — will create ADR later
> **[N]** Not needed — this doesn't warrant an ADR

If threshold NOT met → QUESTION "add to PR description under `## Design decisions`".

### ADR format sniff

Accept MADR 4.0, Nygard, Y-statements. Require `supersedes: ADR-NNN` when the topic overlaps an older ADR (WARNING if missing).

---

## SUB-AXIS 1d: Documentation Coherence

**Condition:** Always-on. Phase 3 stub; populated in Phase 4.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta1-1d-stub'
    severity: QUESTION
    action: defer
    meta: 1
    sub_axis: '1d'
    title: 'Documentation Coherence sub-axis not yet populated (Phase 4)'
    detail: 'CHANGELOG discipline, doc-comment drift, Diataxis routing, README/ADR cross-link freshness land in Phase 4. Skipped for this review.'
    not_implemented: true
```

### Phase 4 target scope

- CHANGELOG discipline (Keep a Changelog 1.1.0 — `[Unreleased]` present, versioned entries)
- Doc-comment drift on changed exports (TSDoc / JSDoc / Sphinx / RustDoc synced to code)
- Diataxis routing for new docs (tutorial / how-to / reference / explanation)
- README / ADR cross-link freshness

---

## OUTPUT FORMAT (`perspective_report`)

Return ONE YAML document as your final tool response:

```yaml
perspective_report:
  meta: 1
  sub_axes_executed: ['1a', '1b', '1c', '1d']
  sub_axes_skipped: []

  findings:
    - id: 'F-M1-001'
      severity: BLOCKER | WARNING | RECOMMENDATION | QUESTION
      meta: 1
      sub_axis: '1a'
      file: 'apps/api/src/auth.controller.ts'
      line: 42
      title: '{short title}'
      detail: '{full description}'
      fix: '{suggested fix}'
      pattern_ref: 'apps/ref/auth.ts:15'
      grep_based: false
      not_implemented: false   # true for stubs

  scores:
    '1a': 0.95
    '1b': 1.0      # stub — neutral score
    '1c': 0.90
    '1d': 1.0      # stub

  ac_coverage:
    - ac_id: 'AC1'
      status: 'COMPLIANT' | 'PARTIAL' | 'NOT_IMPLEMENTED'
      implementation_location: 'file.ts:line'
      test_location: 'file.spec.ts:line'

  summary:
    files_reviewed: 8
    blockers: 1
    warnings: 2
    recommendations: 0
    questions: 1
```

DO NOT compute the overall verdict — judge-triage consolidates all metas.
