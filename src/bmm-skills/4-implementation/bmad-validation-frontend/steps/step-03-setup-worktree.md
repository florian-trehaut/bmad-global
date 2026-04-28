# Step 3: Setup Worktree


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Setup Worktree with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Create a read-only worktree on `origin/main` to read source code for test identification and UI analysis. This worktree is used to understand the codebase — NOT to run tests (tests run in the main project directory).

## RULES

- The worktree is for CODE READING ONLY — understanding components, routes, test files
- Tests and dev server run in the MAIN project directory, not the worktree
- NEVER modify files in the worktree

## SEQUENCE

### 1. Derive worktree path

Derive path from `WORKTREE_TEMPLATE_VALIDATION` with `{issue_number}` replaced from `ISSUE_IDENTIFIER`.

### 2. Check for existing worktree

```bash
git worktree list | grep "{WORKTREE_PATH base name}"
```

**If the worktree exists:**
```bash
cd {WORKTREE_PATH}
git fetch origin
git checkout origin/main --detach
```

**If the worktree does not exist:**
```bash
git fetch origin
git worktree add --detach {WORKTREE_PATH} origin/main
```

### 3. Verify

```bash
cd {WORKTREE_PATH} && git log --oneline -1
```

Display: "Worktree created on `origin/main` ({commit_short}) — read-only, for code analysis."

Store `WORKTREE_PATH` for all subsequent steps.

### 4. Proceed

Load and execute `./steps/step-04-validate.md`.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Setup Worktree
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
