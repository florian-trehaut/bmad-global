# Step 2: Preflight


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Preflight with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Verify that the build environment and toolchain are operational before starting validation. Each check is a hard gate — HALT at the first failure.

## RULES

- Each check that fails — HALT with a clear message and corrective action
- NEVER bypass a failed check
- NEVER assume the build is working without verifying it
- Adapt checks to the project's build system as described in `workflow-context.md` and the tech-stack-lookup protocol (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`)

## SEQUENCE

### 1. Load environment configuration

Extract from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION): relevant test and build conventions.

Extract from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION): desktop-specific parameters (binary path overrides, log directory, test fixture paths).

### 2. Check build system availability

Verify that the project's build toolchain is available by checking the commands from `workflow-context.md`:

- Run `{BUILD_COMMAND} --version` or equivalent to verify the build tool exists
- If the project has a toolchain version file (e.g., `rust-toolchain.toml`, `.nvmrc`, `.tool-versions`), verify the active version matches

**If failed:**
HALT: "Build toolchain not available or wrong version. Action: install or activate the correct toolchain."

### 3. Check build state

**If `ENVIRONMENT = test`:**
- Verify the project compiles for tests (e.g., compile test binaries without running them)
- This catches compile errors before attempting to run individual tests during validation

**If `ENVIRONMENT = local`:**
- Verify the application binary exists at `{APP_BINARY_PATH}`
- If not found, HALT: "Application binary not found at {APP_BINARY_PATH}. Build it with `{BUILD_COMMAND}` first."

**If failed:**
HALT: "Build failed. Fix compilation errors before running validation."

### 4. Check log directory access

If any VM item might require log verification (type `log` anticipated):

- Check that `{APP_LOG_DIR}` is accessible
- If the directory does not exist, warn (not HALT — logs may be created when the app launches)

### 5. Check test fixtures (if needed)

If any VM item references specific test data or fixtures:
- Verify those files exist in the project
- If missing, HALT: "Test fixture {name} not found. Ensure test data is available."

### 6. Preflight Summary

Display a summary table:

```
Preflight — {ENVIRONMENT}
+------------------------------+--------+--------------------------------------+
| Check                        | Status | Details                              |
+------------------------------+--------+--------------------------------------+
| Build toolchain              | ok/err | {tool} {version}                     |
| Build/compile                | ok/err | {compile status}                     |
| App binary (local only)      | ok/n/a | {APP_BINARY_PATH}                    |
| Log directory                | ok/warn| {APP_LOG_DIR}                        |
| Test fixtures                | ok/n/a | {fixture status}                     |
+------------------------------+--------+--------------------------------------+
```

"All checks passed. Launching validation."

### 7. Proceed

Load and execute `./steps/step-03-setup-worktree.md`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Preflight
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
