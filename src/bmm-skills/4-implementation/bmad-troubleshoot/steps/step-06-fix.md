# Step 6: Fix (TDD)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Fix (TDD) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Implement the fix using strict TDD — write failing test first (RED), then implement the fix (GREEN), then clean up (REFACTOR). All work inside the worktree.

## RULES

- **Strict TDD** — RED → GREEN → REFACTOR, no exceptions
- **All work in `{WORKTREE_PATH}`** — never modify files outside
- **Minimum change** — fix the bug, nothing more. No refactoring of unrelated code.
- **HALT on 3 consecutive failures** on the same test
- Follow project dev standards from the tech-stack-lookup protocol (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`) if loaded
- **Reproduction proof requirement** — per `~/.claude/skills/bmad-shared/spec/evidence-based-debugging.md`, the RED test in §2 below MUST be a rung-1 reproduction. If `EVIDENCE_RUNG` from step-03 is < 1 AND no exception class is documented, this step HALTs at §2 — the bug must be promoted to rung 1 before fix code is written. Mocked tests are NOT acceptable as RED proof — the test must run against real dependencies (real DB, real file system, real APIs in the test environment)

## SEQUENCE

### 1. Install and build

Ensure the worktree is ready:

```bash
cd {WORKTREE_PATH}
{INSTALL_COMMAND}
{BUILD_COMMAND}
```

### 2. RED — Write failing test (rung-1 reproduction proof)

For each TAC from the fix plan, write a test that:
- Reproduces the bug (the test MUST fail without the fix)
- Verifies the expected behavior after the fix
- Runs against **real** dependencies (real DB, real file system, real APIs in the test environment) — no mocks of the suspected failing component

If `EVIDENCE_RUNG` from step-03 is < 1 AND no exception class (E-1 to E-8) is documented in the diagnosis: **HALT** with message "Cannot proceed to fix without rung-1 reproduction. Either promote evidence to rung 1 (write the failing test now), or document the applicable exception class (E-1 to E-8) in the issue and acknowledge that the regression test will be a fixture-driven test exercising the documented production artifact."

Run the test:
```bash
cd {WORKTREE_PATH} && {TEST_COMMAND}
```

**Verify the test FAILS for the right reason** — the failure must demonstrate the bug, not a setup issue. Capture the failure output for the diagnosis report:

```
Pre-fix run (at baseline_commit {SHA}):
  $ {TEST_COMMAND} -- {test_path}
  ...
  FAILED — {1-line summary}
  exit_code: {N}
```

If the test PASSES at baseline (against expectation), the test does not reproduce the bug — rewrite it before proceeding to GREEN.

### 3. GREEN — Implement the fix

Follow the fix plan from step 4. For each task:
- Make the specific change described
- Keep changes minimal — fix the bug, nothing more

Run tests after each change:
```bash
cd {WORKTREE_PATH} && {TEST_COMMAND}
```

**Verify ALL tests PASS** — both the new test and existing tests.

### 4. REFACTOR — Clean up

If the fix introduced any code that could be cleaner:
- Refactor without changing behavior
- Run tests again to verify no regression

### 5. Check for similar patterns

If the bug was a pattern (e.g., missing null check, wrong enum mapping):
- Grep the codebase for the same pattern
- If found elsewhere, add a comment in the tracker issue noting the locations (do NOT fix them — out of scope)

### 6. Format and lint

```bash
cd {WORKTREE_PATH} && {FORMAT_FIX_COMMAND}
```

### 7. Commit

```bash
cd {WORKTREE_PATH}
git add -A
git commit -m "fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}

{ISSUE_IDENTIFIER}"
```

### 8. Auto-proceed

Fix implemented and committed. Proceed to ship.

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Fix (TDD)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-07-ship.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
