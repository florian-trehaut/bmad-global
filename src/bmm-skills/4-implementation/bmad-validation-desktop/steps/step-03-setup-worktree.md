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

Set up a read-only working environment on `origin/main` to read code during validation (test identification, UI component structure, log format patterns, integration point protocols). Apply the unified worktree lifecycle protocol from `bmad-shared/worktree-lifecycle.md`.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teammate-mode-routing.md`, when TEAMMATE_MODE=true and ORCH_AUTHORIZED=true:

- The orchestrator has already provided a worktree via `task_contract.constraints.worktree_path`. Apply `worktree-lifecycle.md` Branch D (provided path mode); the orchestrator owns this worktree.
- Set `worktree_use_provided=true` in the contract parameters; HALT if `worktree_path` is null.

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below as normal.

## RULES

- **MANDATORY** — this step is a non-negotiable prerequisite, even if the issue seems not to require code reading. We cannot predict in advance which VM items will require code reading.
- The worktree is READ-ONLY — NEVER modify files inside it
- Always based on `origin/main` (= latest merged code)

## SEQUENCE

### 1. Derive Paths

- `WORKTREE_PATH_EXPECTED`: substitute `{issue_number}` (from `ISSUE_IDENTIFIER`) into `{WORKTREE_TEMPLATE_VALIDATION}` from `workflow-context.md`.

### 2. Apply the Worktree Lifecycle Protocol

**Apply the full protocol from `bmad-shared/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `read-only` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `null` |
| `worktree_branch_strategy` | `detached` |
| `worktree_alignment_check` | `CURRENT_BRANCH == main` OR `CURRENT_BRANCH == master` OR `CURRENT_BRANCH == ""` (detached) |

After the protocol completes, `WORKTREE_PATH` is set. Log: "Worktree ready on `origin/main` — read-only."

### 3. Proceed

`WORKTREE_PATH` is available for subsequent steps.

When the workflow needs to read code (test files, UI components, log formats, integration protocols), use this worktree.

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
