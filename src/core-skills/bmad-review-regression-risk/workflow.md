# Regression Risk Detection — Workflow

**Purpose:** Detect the #1 cause of silent regression in rebased branches — stale rebases that overwrite recent target-branch changes during conflict resolution. The rebase also overwrites the regression tests, so CI passes despite the regression.

**Invocation pattern:** This skill is invoked as a persona-skill from review workflows. The caller (typically `bmad-code-review/steps/step-01-gather-context.md`) reads this workflow and its steps into an `Agent()` prompt along with the required inputs, and consumes the structured output.

---

## INPUTS (contract)

| Variable | Required | Example |
|----------|----------|---------|
| `{REVIEW_WORKTREE_PATH}` | YES | `/path/to/worktree-checkout-of-MR` |
| `{MR_TARGET_BRANCH}` | YES | `main` |
| `{LINKED_TRACKER_ISSUE}` | optional | `{identifier, description, title}` for scope cross-reference |
| `{ISSUE_IDENTIFIER}` | optional | `PRJ-48` |

The caller MUST provide `{REVIEW_WORKTREE_PATH}` and `{MR_TARGET_BRANCH}`. If `{LINKED_TRACKER_ISSUE}` is null, Phase 2 scope cross-reference is skipped (suspicious removals still reported, just without out-of-scope classification).

---

## OUTPUTS (contract)

```yaml
regression_risk_report:
  level: HIGH | MEDIUM | LOW | NONE
  overlapping_files: [...]            # from Phase 1
  phase2_suspicious_removals:
    - file: 'path/to/foo.ts'
      removed_lines: 42
      out_of_scope: true | false | null   # null if tracker issue missing
      recent_target_commits: [...]
  findings:
    - severity: BLOCKER | WARNING
      file: 'path/to/foo.ts'
      line: null
      title: 'Regression risk: stale rebase suspected'
      detail: |
        File was modified in target branch by commit {hash} ({message}).
        The rebase may have silently discarded these changes.
        Reviewer MUST verify line-by-line.
      evidence: |
        <git diff output>
```

These outputs are consumed by the review orchestrator (specifically by the Specs Compliance perspective in `subagent-workflows/meta-1-contract-spec.md`).

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-phase-1-overlap.md` | Pre-rebase overlap detection and HIGH/MEDIUM/LOW classification |
| 2 | `step-02-phase-2-removals.md` | Post-rebase suspicious-removal detection with tracker scope cross-reference |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

## ENTRY POINT

Load and execute `./steps/step-01-phase-1-overlap.md`.

## CRITICAL RULES

- **READ-ONLY.** This skill NEVER edits files, commits, or modifies state.
- Both phases are MANDATORY. Phase 2 catches the common case (branch already rebased) that Phase 1 cannot see.
- HIGH RISK findings are ALWAYS classified as BLOCKER — never downgrade.
- If the caller does not provide `{LINKED_TRACKER_ISSUE}`, Phase 2 still runs but classification degrades: "suspicious removal detected, scope cross-reference not available" — reviewer makes the final call.
- NEVER fabricate commit hashes or file paths when evidence is missing. If the git command fails → HALT and report the error, do NOT substitute.
