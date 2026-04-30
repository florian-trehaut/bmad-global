# Step 3: Setup Investigation Worktree


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
CHK-STEP-03-ENTRY PASSED — entering Step 3: Setup Investigation Worktree with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Set up a read-only working environment synced with `origin/main` for code investigation. All code verification in subsequent steps must happen on the latest main. Apply the unified worktree lifecycle protocol from `bmad-shared/lifecycle/worktree-lifecycle.md`.

## RULES

- The worktree is READ-ONLY — no code changes, only investigation
- If the protocol fails, HALT — code verification requires a working environment

## SEQUENCE

### 1. Derive Paths

- `WORKTREE_PATH_EXPECTED`: substitute into `{WORKTREE_TEMPLATE_SPEC}` from `workflow-context.md` (`worktree_templates.quick_spec`), replacing `{slug}` with:
  - **Discovery mode:** the derived slug
  - **Enrichment mode:** `{EPIC_SLUG}-{ISSUE_IDENTIFIER}`
- `BRANCH_NAME`: `create-story/{slug_or_identifier}`

### 2. Apply the Worktree Lifecycle Protocol

**Apply the full protocol from `bmad-shared/lifecycle/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `read-only` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `{BRANCH_NAME}` |
| `worktree_branch_strategy` | `feature-branch` |
| `worktree_alignment_check` | `CURRENT_BRANCH == main` OR `CURRENT_BRANCH == master` OR `CURRENT_BRANCH == ""` (detached) |

After the protocol completes, set `SPEC_WORKTREE_PATH = WORKTREE_PATH`. Log: "Working environment ready: {SPEC_WORKTREE_PATH}"

### 3. Proceed

**From this point on, ALL code investigation runs inside {SPEC_WORKTREE_PATH}.**

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Setup Investigation Worktree
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-04-investigate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
