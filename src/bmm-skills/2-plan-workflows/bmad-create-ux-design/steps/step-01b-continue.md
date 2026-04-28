---
nextStepFile: null
---

# Step 1B: Workflow Continuation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01b-ENTRY PASSED — entering Step 1B: Workflow Continuation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Resume the UX design workflow from where it was left off, reloading context and presenting progress to the user.

## RULES

- Only reload documents listed in `inputDocuments` -- do not discover new ones
- FORBIDDEN: modifying content completed in previous steps
- Determine the correct next step from `lastStep` / `stepsCompleted` frontmatter

## SEQUENCE

### 1. Analyze Current State

Review the frontmatter to understand:

- `stepsCompleted`: Which steps are already done
- `lastStep`: The most recently completed step number
- `inputDocuments`: What context was already loaded
- All other frontmatter variables

### 2. Load All Input Documents

Reload the context documents listed in `inputDocuments`:

- For each document in `inputDocuments`, load the complete file
- This ensures full context for continuation
- Do not discover new documents -- only reload what was previously processed

### 3. Summarize Current Progress

Welcome the user back and provide context:

"Welcome back {user_name}! I'm resuming our UX design collaboration for {project_name}.

**Current Progress:**

- Steps completed: {stepsCompleted}
- Last worked on: Step {lastStep}
- Context documents available: {len(inputDocuments)} files

Does this look right, or do you want to make any adjustments before we proceed?"

### 4. Determine Next Step

Based on `lastStep` value, determine which step to load next:

- If `lastStep = 1` -> Load `./step-02-discovery.md`
- If `lastStep = 2` -> Load `./step-03-core-experience.md`
- If `lastStep = 3` -> Load `./step-04-emotional-response.md`
- If `lastStep = 4` -> Load `./step-05-inspiration.md`
- If `lastStep = 5` -> Load `./step-06-design-system.md`
- If `lastStep = 6` -> Load `./step-07-defining-experience.md`
- If `lastStep = 7` -> Load `./step-08-visual-foundation.md`
- If `lastStep = 8` -> Load `./step-09-design-directions.md`
- If `lastStep = 9` -> Load `./step-10-user-journeys.md`
- If `lastStep = 10` -> Load `./step-11-component-strategy.md`
- If `lastStep = 11` -> Load `./step-12-ux-patterns.md`
- If `lastStep = 12` -> Load `./step-13-responsive-accessibility.md`
- If `lastStep = 13` -> Load `./step-14-complete.md`
- If `lastStep = 14` -> Workflow already complete

### 5. Handle Already Complete

If `lastStep` indicates the final step is completed:

"The UX design workflow for {project_name} is already complete. The final specification is at {planning_artifacts}/ux-design-specification.md.

Would you like to:
- Review the completed specification
- Start a new UX design revision
- Suggest next workflow steps"

### 6. Present Continuation

After presenting progress, ask:

"Ready to continue with Step {nextStepNumber}?

[C] Continue to Step {nextStepNumber}"

After user selects [C], load the appropriate next step file.

---

## STEP EXIT (CHK-STEP-01b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01b-EXIT PASSED — completed Step 1B: Workflow Continuation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
