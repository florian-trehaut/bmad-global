---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
---

# Subagent Workflow: Judge-Triage

**Goal:** Consolidate 5-7 meta-agent reports into a single `consolidated_report` with deduplicated findings, consensus-validated security findings, per-finding `action` classification, per-meta scores, and overall verdict.

**Scope:** Judge operates solely on the structured reports provided in its input. It does NOT re-read source files, edit code, post to forge/tracker, or invoke further subagents.

---

## ANTI-DEVIATION CONTRACT

You received `input_reports`, `linear_issue` (or null), and `regression_risk` in the prompt. These are your SOLE source of truth.

**Rules:**

- Operate ONLY on provided reports — do NOT re-read source files or invoke `git diff`
- Apply deduplication, voting consensus, action classification, and scoring in the order defined below
- Return ONE structured `consolidated_report` — no side effects
- You are **READ-ONLY**: no file edits, no commits, no forge/tracker posting

**HALT conditions:**

- If `input_reports` is empty or all reports are empty/timeout-only → emit `consolidated_report` with empty findings + `failed_layers` listing all failed metas + verdict = `REJECTED` and alert the orchestrator
- If `input_reports` contains malformed YAML that cannot be parsed → emit verdict = `REJECTED` with a `parse_error` in the report
- NEVER downgrade severity to avoid rejection
- NEVER dismiss findings to reduce count

**Model parity constraint (upstream rule from commit `f5030c70`):** Judge-triage MUST execute at the same model tier as the orchestrator. The orchestrator passes its model tier in the contract; judge MUST NOT be spawned on a cheaper model than the one producing the reports it consolidates.

---

## INPUT FORMAT (provided in prompt)

```yaml
input_reports:
  - meta: 1
    sub_axes_executed: ['1a', '1b', '1c', '1d']
    findings:
      - id: 'F001'
        severity: BLOCKER | WARNING | RECOMMENDATION | QUESTION
        meta: 1
        sub_axis: '1a'
        perspectives: ['specs_compliance']
        file: 'apps/api/src/auth.controller.ts'
        line: 42
        title: 'Missing AC coverage for AC-3'
        detail: '...'
        pattern_ref: 'apps/ref/auth.ts:15'
        fix: '...'
        grep_based: false
    scores:
      '1a': 0.95
      '1b': 1.0
      '1c': 0.9
      '1d': 1.0
    ac_coverage: { ... }   # Only meta-1
  - meta: 2
    ...
  - meta: 3
    s1_findings: [...]     # From security-agent-S1
    s2_findings: [...]     # From security-agent-S2
    sub_axes_executed: ['3a', '3b', '3c', '3d']
  - meta: 4
    ...
  - meta: 5
    ...
  - meta: 6
    ...

linear_issue:              # null if no tracker issue linked
  identifier: 'PRJ-48'
  description: |
    ...
  acceptance_criteria: [...]

regression_risk:           # From step-01-gather-context
  level: HIGH | MEDIUM | LOW
  overlapping_files: [...]
  phase2_suspicious_removals: [...]

model_tier: 'opus' | 'sonnet' | 'haiku'   # parity constraint
```

---

## EXECUTION SEQUENCE

### 1. Deduplicate findings

For each pair of findings with matching `(file, line, issue_tokens)` across reports:
- Keep the HIGHEST severity (BLOCKER > WARNING > RECOMMENDATION > QUESTION)
- MERGE `perspectives` labels (union)
- MERGE `sub_axis` labels (union, comma-separated)
- COMBINE fix suggestions (keep the most specific one, reference the others)
- PRESERVE the original `meta` field of the highest-severity finding

`issue_tokens` = lowercase alphanumeric tokens from the `title` field. Two findings are considered the same issue if ≥70% of tokens overlap AND they target the same `file:line`.

### 2. Apply security voting consensus (Meta 3a/3b only)

Separate Meta-3 findings into S1 and S2 sets. For each finding:

| S1 present | S2 present | grep-based | consensus | severity action |
|:--:|:--:|:--:|---|---|
| ✓ | ✓ | any | `CONFIRMED` | retain or upgrade |
| ✓ | ✗ | ✓ | `CONFIRMED` | retain |
| ✗ | ✓ | ✓ | `CONFIRMED` | retain |
| ✓ | ✗ | ✗ | `SINGLE_REVIEWER` | downgrade BLOCKER → WARNING |
| ✗ | ✓ | ✗ | `SINGLE_REVIEWER` | downgrade BLOCKER → WARNING |

**Match rule:** S1 and S2 findings are "the same" if they share `(file, line)` OR share `(file, issue_tokens overlap ≥70%)`.

Grep-based findings (those with `grep_based: true`) are deterministic and always `CONFIRMED` regardless of coverage by the other reviewer.

Add a `consensus` field to every Meta-3a/3b finding. Log each downgrade in `consensus_log`:

```yaml
consensus_log:
  - finding_id: 'F007'
    action: 'downgrade_to_warning'
    reason: 'flagged by S1 only (attacker POV), non-grep-based'
```

### 3. Classify each finding with `action`

Apply the matrix from `data/severity-action-matrix.md`:

| Severity × situation | Resulting action |
|---|---|
| BLOCKER AND trivial fix available | `patch` |
| BLOCKER AND ambiguous or architectural | `decision_needed` |
| BLOCKER AND judge determines false-positive | `dismiss` |
| WARNING AND fix is one-liner / formatter | `patch` |
| WARNING AND fix requires judgement | `decision_needed` |
| WARNING AND out-of-scope | `defer` |
| RECOMMENDATION | `patch` if automated, else `defer` |
| QUESTION | `decision_needed` if mid-impact, else `defer` |

Default rule if uncertain: `decision_needed`. NEVER emit `dismiss` without a documented reason in `dismiss_reason`.

### 4. Flag failed layers

If any meta agent returned an empty report OR marked `timeout`:
- Record in `failed_layers: [meta_name]`
- DO NOT skip the final report
- Warn the user in the verdict message that coverage is degraded for those metas

### 5. Compute scores

**Per-finding deductions** (applied to the meta that OWNS the finding):

- BLOCKER: `-0.25`
- MAJOR / WARNING: `-0.10` / `-0.05` (depending on whether the finding is labelled MAJOR in the meta report — default WARNING)
- RECOMMENDATION: `-0.02`
- QUESTION: `0.0`

Minimum per-meta score: `0.0`.

**Per-meta score:** `1.0 - sum(deductions_in_meta)`, clipped to [0.0, 1.0].

**Zero-fallback sub-axis (2a) weighted contribution:**
Within Meta 2, sub-axis 2a carries weight 0.15 (raised from 0.10 in v1); 2b and 2c split the remaining 0.85 equally (0.425 each).

**Per-meta weights:**

| Meta | Weight |
|------|--------|
| M1 | 0.20 |
| M2 | 0.20 |
| M3 | 0.25 |
| M4 | 0.20 |
| M5 | 0.10 |
| M6 | 0.05 |

Conditional metas (M5, M6) that did NOT activate for this review contribute their weight proportionally to activated metas (renormalize).

**Overall score:** `sum(meta_weight × meta_score)` across activated metas.

### 6. Determine verdict

| Condition | Verdict |
|---|---|
| `overall ≥ 0.85` AND `min(meta_score) ≥ 0.70` AND `blockers == 0` | `APPROVED` |
| `overall ≥ 0.65` AND `blockers ≤ 2` | `NEEDS_WORK` |
| `overall < 0.65` OR `blockers > 2` | `REJECTED` |

### 7. Build the consolidated report

Return a single YAML document:

```yaml
consolidated_report:
  verdict: APPROVED | NEEDS_WORK | REJECTED
  score_overall: 0.87
  scores_per_meta:
    M1: 0.95
    M2: 0.90
    M3: 0.85
    M4: 0.88
    M5: null   # if not activated
    M6: null

  findings:
    - id: 'F001'
      severity: BLOCKER
      action: decision_needed
      meta: 3
      sub_axis: '3a'
      perspectives: ['security', 'zero_fallback']
      file: 'apps/api/src/auth.controller.ts'
      line: 42
      title: 'JWT accepts alg=none'
      detail: '...'
      pattern_ref: 'apps/ref/auth.ts:15'
      fix: '...'
      owasp: 'A02'
      consensus: CONFIRMED   # only for Meta 3a/3b
      grep_based: false
      dismiss_reason: null

  consensus_log:
    - finding_id: 'F007'
      action: 'downgrade_to_warning'
      reason: '...'

  failed_layers: []

  ac_coverage:    # copied from Meta-1 report if present
    - ac_id: 'AC1'
      status: COMPLIANT | PARTIAL | NOT_IMPLEMENTED
      implementation_location: 'file.ts:23'
      test_location: 'file.spec.ts:45'

  regression_risk_summary:
    level: HIGH | MEDIUM | LOW
    phase2_suspicious_removals_count: 0

  summary:
    total_findings: 12
    by_severity:
      BLOCKER: 1
      WARNING: 5
      RECOMMENDATION: 4
      QUESTION: 2
    by_action:
      decision_needed: 2
      patch: 6
      defer: 3
      dismiss: 1
```

---

## OUTPUT CONTRACT

The judge returns the `consolidated_report` YAML as its final response to the orchestrator. No inter-agent messaging is used — a single response containing the YAML document is the sole deliverable.

If the judge cannot produce a valid report (all inputs empty, parse errors, OR context overflow), it returns:

```yaml
consolidated_report:
  verdict: REJECTED
  error: 'judge_unable_to_consolidate'
  reason: '{explanation}'
  failed_layers: [all_meta_names]
```

The orchestrator treats this as a HALT condition per `bmad-shared/core/no-fallback-no-false-data.md` — it does NOT fall back to presenting raw reports.

---

## CONSTRAINTS

### DO

- Operate on `input_reports` only
- Apply dedup, voting, action classification, scoring in order
- Enforce model parity constraint
- Emit ONE `consolidated_report`
- Preserve `grep_based` field on findings (for CONFIRMED consensus on deterministic findings)

### DO NOT

- Re-read source files or run `git diff`
- Edit, fix, or modify any file
- Post to forge or tracker
- Spawn further subagents
- Silently drop findings — every input finding must appear in output (either as-is, merged, or explicitly dismissed with `dismiss_reason`)
- Substitute missing data with defaults (if a meta is missing → `failed_layers`, not a fabricated empty report)
