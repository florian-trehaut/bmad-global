---
nextStepFile: './step-12-traceability.md'
reviewReportFormat: '../data/review-report-format.md'
selfReviewSubagent: '../subagent-workflows/self-review.md'
---

# Step 11: Self-Review (6 Perspectives)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-11-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-11-ENTRY PASSED — entering Step 11: Self-Review (6 Perspectives) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

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
  2. **Runtime Robustness** *(formerly Zero Fallback — now covers Zero Fallback + Null Safety + Concurrency)* — Three sub-axes:
     - **2a. Zero Fallback** — Apply `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md`. Grep for silent fallbacks on business-critical fields. Check for computed substitutions.
     - **2b. Null Safety** — Apply `~/.claude/skills/bmad-shared/protocols/null-safety-review.md` (loads stack-specific rules per detected language). Verify boundary validation, type-system enforcement (`strictNullChecks`, `mypy --strict`, `clippy::unwrap_used`, `go vet`/`staticcheck`), absent-path tests.
     - **2c. Concurrency** — Apply `~/.claude/skills/bmad-shared/protocols/concurrency-review.md` (loads stack-specific rules per detected language). Verify race-detector / stress-test evidence, lock ordering, bounded parallelism, cancellation propagation, no-blocking-across-await.
  3. **Security** — Injection, auth, validation, secrets, crypto, framework config, TOCTOU and authorization races (data-race concurrency moved to perspective #2)
  4. **QA & Testing** — Test coverage per AC, test quality, forbidden patterns (mocks in unit tests), edge cases, deterministic tests
  5. **Code Quality** — Hexagonal architecture, DDD, naming, duplication, TypeScript strict, no dead code
  6. **Tech Lead** — SOLID, N+1, scalability, DI patterns, monorepo impact, migration risks
  7. **ADR Conformity** (conditional) — If `PROJECT_ADRS` is loaded: verify the implementation follows all active ADRs. Check new patterns, services, or architectural choices against decided approaches. If a violation is found → BLOCKER. If a new ADR should exist but doesn't → QUESTION with suggestion to invoke `skill:bmad-create-adr` before or after merge.
  8. **Performance Verification** (conditional) — If the feature touches latency-sensitive paths, batch processing, large data, startup time, or binary size: add temporary timing instrumentation, run the code path, capture real measurements. Include results in MR description if meaningful. Remove instrumentation after measurement. Skip if no performance implications.

  Apply project-specific checklists from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION).

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
  - Dev standards from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`
  - Review perspectives from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`

  Wait for report. The subagent returns a structured YAML report per {reviewReportFormat}.
</check>

### 3. Fix Cycles (if verdict != APPROVED)

Iterative fix cycles with degressive thresholds:

| Cycle | Target Overall | Max Blockers | Focus |
| --- | --- | --- | --- |
| 1 | 0.85 | 0 | Fix ALL blockers and majors |
| 2 | 0.75 | 1 | Fix remaining blockers |
| 3 | 0.65 | 2 | Fix critical security blockers only |

Per `~/.claude/skills/bmad-shared/core/workflow-adherence.md` Rule 8 (Findings Handling Policy) — **all findings are fixed by default regardless of severity** (BLOCKER, MAJOR, MINOR, INFO), unless a documented skip reason applies (deferred-by-phase, OOS confirmed, user-approved design decision, duplicate of converging finding, honest non-reproduction). Severity is NOT the criterion for fix decision ; severity informs **priority of attention** (BLOCKER first, INFO last).

For each cycle:
1. Address findings — fix all by default ; only skip with documented reason
2. Run validations: `{TEST_COMMAND} && {BUILD_COMMAND} && {LINT_COMMAND}`
3. Re-run self-review
4. Check scores against cycle threshold

#### TEAMMATE_MODE branch (autonomy_policy=spec-driven)

**If `TEAMMATE_MODE=true AND autonomy_policy=spec-driven`** :

After fix cycles, classify any remaining findings :

- **TACTICAL** (MINOR / INFO findings that don't suggest structural rework, fixed per Rule 8 fix-by-default) : auto-include in MR description as "Design decisions open for discussion" + push despite remaining findings. Capture in workflow's `AUTONOMY_DECISIONS[]` accumulator : `{decision: 'self-review-tactical', classification: 'tactical', default_applied: 'fix-by-default per Rule 8 ; remainder pushed with disclosure', rationale: 'TAC-5b — MINOR findings covered by spec Rule 8'}`.
- **STRUCTURAL** (MAJOR finding suggests structural rework — refactor scope, arch deviation, contract violation, integration boundary issue) : emit `SendMessage(question, critical_ambiguity: true)` to `LEAD_NAME` and HALT. Do NOT push with structural rework hidden in disclosure (TAC-6).

**Else (TEAMMATE_MODE=false standalone, or TEAMMATE_MODE=true strict)** :

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

---

## STEP EXIT (CHK-STEP-11-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-11-EXIT PASSED — completed Step 11: Self-Review (6 Perspectives)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
