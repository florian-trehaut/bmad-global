# Code Review Perspective — Shared Output Schema

**Loaded by:** All 6 `bmad-code-review-perspective-{specs,correctness,security,operations,user-facing,engineering-quality}/workflow.md` skills (M15 of `standalone-auto-flow-unification.md`).

**Purpose:** Define the **single canonical output format** for every perspective subskill — eliminates the DRY violation where each of the 6 skills duplicated the same YAML schema in their workflow.md.

---

## phase_complete payload schema (TEAMMATE_MODE=true — the only mode per M14)

Every perspective subskill MUST emit a `phase_complete` SendMessage per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §D` with this exact shape :

```yaml
type: phase_complete
task_id: '{TASK_ID}'
parent_phase: 'code-review'
deliverable:
  format: 'yaml_report'
  artifacts: []
  summary: |
    Meta-{N} ({perspective-name}) review complete.
    {N} findings: {n_blocker} BLOCKER, {n_major} MAJOR, {n_minor} MINOR, {n_info} INFO.
verdict: '{APPROVE | FINDINGS}'
findings:
  - severity: '{BLOCKER | MAJOR | MINOR | INFO}'
    sub_axis: '{perspective-specific axis identifier — e.g., 1a/1b/1c/1d for specs ; 2a/2b/2c for correctness ; etc.}'
    file_line: '{path:lineno}'
    description: '{finding text}'
    proposed_action: '{concrete action — never "decide X"}'
  # ... (one entry per finding)

# Closed-protocol-set extension (per teammate-mode-routing.md §D)
trace_files:
  - '{absolute path to teammate trace file written before phase_complete}'

autonomy_decisions: []   # Code-review perspectives use autonomy_policy=strict — typically empty
```

### Field semantics

| Field | Required | Notes |
|-------|----------|-------|
| `type` | YES | Must be literal `phase_complete` |
| `task_id` | YES | From `task_contract.task_id` (e.g., `code-reviewer-specs-1`) |
| `parent_phase` | YES | Must be literal `code-review` for all 6 perspective skills |
| `deliverable.format` | YES | Must be literal `yaml_report` |
| `deliverable.artifacts` | YES | Empty array — perspective subskills do not produce file artifacts (findings are inline) |
| `deliverable.summary` | YES | 2-line summary with severity counts |
| `verdict` | YES | `APPROVE` (zero BLOCKER) or `FINDINGS` (one or more BLOCKER) |
| `findings` | conditional | Required when `verdict == FINDINGS` ; empty array when `APPROVE` |
| `findings[].severity` | YES | Enum: BLOCKER \| MAJOR \| MINOR \| INFO |
| `findings[].sub_axis` | YES | Perspective-specific axis ID (see Sub-axis identifiers per perspective below) |
| `findings[].file_line` | YES | Format: `path:lineno` |
| `findings[].description` | YES | Free-form text, 1-3 sentences |
| `findings[].proposed_action` | YES | Concrete action — NOT "decide X" or "consider Y" (per spec-completeness-rule.md `proposed_action` semantics) |
| `trace_files` | YES (per teammate-mode-routing.md §D) | List of absolute paths to teammate trace files |
| `autonomy_decisions` | NO | Empty for strict-policy perspectives ; populated only if autonomy_policy=spec-driven (rare for code-review) |

### Sub-axis identifiers per perspective

| Perspective | sub_axis values |
|-------------|-----------------|
| specs (Meta-1) | `1a` (Specs Compliance), `1b` (API Contract & Backward Compat), `1c` (Decision Documentation), `1d` (Documentation Coherence) |
| correctness (Meta-2) | `2a` (Logic Correctness), `2b` (Edge Cases), `2c` (Concurrency / Race Conditions), `2d` (Error Handling) |
| security (Meta-3) | `3a` (Authentication / Authorization), `3b` (Input Validation), `3c` (Secret Management), `3d` (Vulnerability Surface) |
| operations (Meta-5) | `5a` (CI / CD), `5b` (Infrastructure as Code), `5c` (Deployment / Rollback), `5d` (Monitoring / Alerts) |
| user-facing (Meta-6) | `6a` (UI / UX), `6b` (Accessibility), `6c` (Performance — perceived), `6d` (Cross-browser / Cross-device) |
| engineering-quality (Meta-4) | `4a` (Architecture Hygiene), `4b` (Refactoring Opportunity), `4c` (Test Coverage / Quality), `4d` (Tech Debt) |

---

## Verdict computation rule

```
verdict = 'APPROVE'  if count(severity == 'BLOCKER' for f in findings) == 0
        = 'FINDINGS' otherwise
```

Per `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rule 8 (Findings Handling Policy), MAJOR / MINOR / INFO findings do NOT block APPROVE — but ALL findings are fixed by default before merge unless an explicit documented skip reason applies.

---

## Cross-references

- `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §D` — `phase_complete` payload schema (this file extends it for the code-review-perspective family)
- `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rule 8 — Findings Handling Policy
- `~/.claude/skills/bmad-shared/spec/spec-completeness-rule.md` — `proposed_action` semantics
- `~/.claude/skills/bmad-code-review/subagent-workflows/meta-{1..6}-*.md` — perspective-specific logic files (referenced by each perspective subskill)
- `_bmad-output/implementation-artifacts/standalone-auto-flow-unification.md` §M15 + §VM-9 — design rationale + verification gate
