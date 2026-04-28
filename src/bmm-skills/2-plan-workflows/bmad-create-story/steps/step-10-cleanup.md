# Step 10: Cleanup & Report


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-10-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-10-ENTRY PASSED — entering Step 10: Cleanup & Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Clean up the temporary worktree, then present a summary with next steps.

## RULES

- Worktree cleanup failure is NON-CRITICAL — warn but don't halt
- This is the final step — no next step

## SEQUENCE

### 1. Cleanup Worktree

**Apply §3 Cleanup from `bmad-shared/worktree-lifecycle.md`.**

<check if="REUSED_CURRENT_WORKTREE == true">
  The workflow reused the user's current worktree. Do NOT remove it — log "Worktree reused — cleanup skipped (user's worktree)." and skip branch deletion.
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == true">

```bash
cd {MAIN_PROJECT_ROOT}
git worktree remove {SPEC_WORKTREE_PATH} --force
git worktree prune
```

  **If worktree removal fails:** Warn user but do NOT halt. Worktree cleanup is non-critical.

  > The temporary worktree could not be removed: {SPEC_WORKTREE_PATH}
  > You can remove it manually: `git worktree remove {SPEC_WORKTREE_PATH} --force`

  Also remove the local branch if it was created:

```bash
git branch -D create-story/{slug_or_identifier} 2>/dev/null || true
```
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == false">
  No worktree to remove — skip.
</check>

### 2. Workflow Complete

The bmad-create-story workflow is complete.

---

## END OF WORKFLOW

---

## STEP EXIT (CHK-STEP-10-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-10-EXIT PASSED — completed Step 10: Cleanup & Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-story executed end-to-end:
  steps_executed: ['01', '02d', '02e', '03', '04', '05', '06', '07', '08', '09', '10']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02d', '02e', '03', '04', '05', '06', '07', '08', '09', '10'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
