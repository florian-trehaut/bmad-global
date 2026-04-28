---
nextStepFile: './step-04-check-mr.md'
---

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

## STEP GOAL:

Set up the working environment for this story by applying the unified worktree lifecycle protocol from `bmad-shared/worktree-lifecycle.md`. All implementation work MUST happen inside `WORKTREE_PATH`.

## MANDATORY SEQUENCE

### 1. Derive Paths

- `WORKTREE_PATH_EXPECTED`: substitute `{ISSUE_NUMBER}` and `{SHORT_DESCRIPTION}` into `{WORKTREE_TEMPLATE_DEV}` from `workflow-context.md`.
- `BRANCH_NAME`: substitute `{ISSUE_NUMBER}` and `{SHORT_DESCRIPTION}` into `{BRANCH_TEMPLATE}` from `workflow-context.md`.

### 2. Apply the Worktree Lifecycle Protocol

**Apply the full protocol from `bmad-shared/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `write` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `{BRANCH_NAME}` |
| `worktree_branch_strategy` | `feature-branch` (or `match-remote` if remote branch `origin/{BRANCH_NAME}` already exists) |
| `worktree_alignment_check` | `CURRENT_BRANCH == {BRANCH_NAME}` |

**Remote branch pre-check (write workflows only):** before invoking the protocol, check whether `origin/{BRANCH_NAME}` exists. If it does, switch `worktree_branch_strategy` to `match-remote` so the protocol reuses the remote branch. Otherwise keep `feature-branch`.

```bash
git fetch origin
if git branch -r | grep -q "origin/{BRANCH_NAME}$"; then
  BRANCH_STRATEGY=match-remote
else
  BRANCH_STRATEGY=feature-branch
fi
```

The protocol sets `WORKTREE_PATH` and may set `REUSED_CURRENT_WORKTREE=true`.

### 3. Initialize Progress Tracker

```bash
cat > {WORKTREE_PATH}/agent-progress.md << 'EOF'
# Agent Progress — {ISSUE_IDENTIFIER}

## Status
current_step: 3
last_completed: worktree_setup
timestamp: {date}

## Context
worktree_path: {WORKTREE_PATH}
branch: {BRANCH_NAME}
issue_identifier: {ISSUE_IDENTIFIER}
reused_current_worktree: {REUSED_CURRENT_WORKTREE or false}

## Step Log
- [x] Step 1-2: Issue discovered and loaded
- [x] Step 3: Worktree setup
- [ ] Step 4-5: Context loaded
- [ ] Step 6: Marked in progress
- [ ] Step 7-8: Plan and implementation
- [ ] Step 9-10: Journey tests and validation
- [ ] Step 11-12: Review and traceability
- [ ] Step 13-14: MR and completion
EOF
```

**From this point on, ALL commands run inside {WORKTREE_PATH}.**

### 4. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Worktree protocol applied (create or reuse), WORKTREE_PATH set, deps installed, build run, progress tracker initialized

### FAILURE: Inlining `git worktree add` outside the shared rule, skipping the protocol, ignoring rebase conflicts

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
