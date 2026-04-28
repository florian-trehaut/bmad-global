---
---

# Step 14: Story Completion


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-14-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-14-ENTRY PASSED — entering Step 14: Story Completion with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Update tracker status, add completion comment with traceability report, and communicate completion to the user.

## MANDATORY SEQUENCE

### 1. Update Tracker Status

Update the issue in the tracker (using CRUD patterns from workflow-knowledge/project.md):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.in_review}

### 2. Add Completion Comment

Post a comment on the tracker issue with the full traceability report:

```
Implementation complete. All tests pass.

MR: !{MR_IID} — {MR_URL}

### Test Traceability

| AC | Priority | Coverage | Tests |
| -- | -------- | -------- | ----- |
{traceability_table}

**Verdict:** {traceability_verdict}
{gaps_if_any}

Files modified:
{file_list}

Ready for code review.

**Reminder:** In Review -> (after merge + deploy) -> **To Test** -> Done
The story moves to Done only after business validation in production.
```

### 3. Communicate Completion

```
## Story implemented

- **Issue**: {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
- **Tracker Status**: In Review
- **MR**: !{MR_IID} — {MR_URL}
- **Worktree**: {WORKTREE_PATH}
- **Self-review**: {review_verdict}
- **Tests**: All passing
- **Build**: Success

### Files modified
{file_list}

### Next step
Code review recommended (ideally with a different LLM for a fresh perspective).
```

## SUCCESS/FAILURE:

### SUCCESS: Status updated, traceability comment posted, user informed
### FAILURE: Not updating status, missing traceability in comment, setting status to Done (NEVER — max is In Review)

---

## STEP EXIT (CHK-STEP-14-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-14-EXIT PASSED — completed Step 14: Story Completion
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-dev-story executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
