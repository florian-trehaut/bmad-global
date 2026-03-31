---
nextStepFile: './step-12-traceability.md'
reviewReportFormat: '../data/review-report-format.md'
selfReviewSubagent: '../subagent-workflows/self-review.md'
---

# Step 11: Self-Review (6 Perspectives)

## STEP GOAL:

Review changes adversarially before pushing. Every line is guilty until reviewed. Apply iterative fix cycles if needed (max 3, degressive thresholds).

## MANDATORY SEQUENCE

### 1. Record Baseline

```bash
cd {WORKTREE_PATH}
BASELINE_COMMIT=$(git merge-base HEAD origin/main)
git diff --stat ${BASELINE_COMMIT}..HEAD
git diff --name-only ${BASELINE_COMMIT}..HEAD
```

Count changed files for routing decision.

### 2. Route by Scope

<check if="changed_files <= 15">
  **Inline review** — execute 6 perspectives directly:

  1. **Specs Compliance** — For each AC: implemented? tested? works in production (not just in tests)? scope creep?
  2. **Zero Fallback** — Apply zero-fallback rules from initialization. Grep for silent fallbacks on business-critical fields. Check for computed substitutions.
  3. **Security** — Injection, auth, validation, secrets, crypto, race conditions, framework config
  4. **QA & Testing** — Test coverage per AC, test quality, forbidden patterns (mocks in unit tests), edge cases, deterministic tests
  5. **Code Quality** — Hexagonal architecture, DDD, naming, duplication, TypeScript strict, no dead code
  6. **Tech Lead** — SOLID, N+1, scalability, DI patterns, monorepo impact, migration risks
  7. **ADR Conformity** (conditional) — If `PROJECT_ADRS` is loaded: verify the implementation follows all active ADRs. Check new patterns, services, or architectural choices against decided approaches. If a violation is found → BLOCKER. If a new ADR should exist but doesn't → QUESTION with suggestion to invoke `skill:bmad-create-adr` before or after merge.
  8. **Performance Verification** (conditional) — If the feature touches latency-sensitive paths, batch processing, large data, startup time, or binary size: add temporary timing instrumentation, run the code path, capture real measurements. Include results in MR description if meaningful. Remove instrumentation after measurement. Skip if no performance implications.

  If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` exists at project root, load and apply project-specific checklists.

  **Design Decisions Audit (MANDATORY — after all perspectives):**

  List all design decisions made during implementation that were NOT specified in the story or architecture docs. For each:
  - **What was decided** — the choice made
  - **Why** — the reasoning
  - **Alternatives considered** — what else could have been done
  - **Risk** — what could go wrong with this choice

  Present as a "Design decisions open for discussion" section to include in the MR description. This gives reviewers explicit visibility into unilateral choices and invites targeted feedback instead of discovery-by-accident.

  Fix trivial issues:
  ```bash
  {FORMAT_FIX_COMMAND}
  ```
  If fixes applied, commit: `git commit -m "style: auto-fix formatting and lint"`

  See {reviewReportFormat} for scoring rules and output format.
</check>

<check if="changed_files > 15">
  **Subagent review** — spawn for deeper analysis:

  Read {selfReviewSubagent} and spawn a subagent with the review contract:
  - worktree_path, baseline_commit, issue_identifier, ACs
  - Dev standards from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md`
  - Review perspectives from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md`

  Wait for report. The subagent returns a structured YAML report per {reviewReportFormat}.
</check>

### 3. Fix Cycles (if verdict != APPROVED)

Iterative fix cycles with degressive thresholds:

| Cycle | Target Overall | Max Blockers | Focus |
| --- | --- | --- | --- |
| 1 | 0.85 | 0 | Fix ALL blockers and majors |
| 2 | 0.75 | 1 | Fix remaining blockers |
| 3 | 0.65 | 2 | Fix critical security blockers only |

For each cycle:
1. Address findings with severity >= threshold
2. Run validations: `{TEST_COMMAND} && {BUILD_COMMAND} && {LINT_COMMAND}`
3. Re-run self-review
4. Check scores against cycle threshold

<check if="still failing after cycle 3">
  HALT — report to user with remaining findings, scores, options:
  1. Fix manually and resume
  2. Accept current state (requires explicit approval)
  3. Abandon and revert
  WAIT for user guidance.
</check>

### 4. Proceed

Commit fixes if any: `git commit -m "fix: address self-review findings (cycle {n})"`
Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All 6 perspectives reviewed, score meets threshold, fixes committed
### FAILURE: Skipping perspectives, downgrading blockers, not fixing trivials
