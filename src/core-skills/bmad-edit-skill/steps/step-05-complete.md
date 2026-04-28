# Step 5: Complete


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Complete with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present a summary of all changes made and suggest next steps.

## SEQUENCE

### 1. List all files modified/created/deleted

```
## Edit Summary — {TARGET_SKILL.name}

### Files modified
- {file_path} — {what changed}
- ...

### Files created
- {file_path} — {purpose}
- ...

### Files deleted
- {file_path} — {reason}
- ...
```

### 2. Show final structure

```
### Final Structure
- SKILL.md
- workflow.md
- steps/
  - step-01-{name}.md ({lines} lines)
  - step-02-{name}.md ({lines} lines)
  - ...
- data/
  - {files}
```

### 3. Show renumbering map (if applicable)

If any steps were renumbered:

```
### Step Renumbering
- step-03-old-name.md -> step-04-old-name.md
- step-04-old-name.md -> step-05-old-name.md
```

### 4. Suggest next steps

"Edit complete. You may want to:"
- "Run `/bmad-validate-skill` for a deeper convention compliance check"
- "Test the workflow by invoking `/bmad-{name}`"

End of workflow.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Complete
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-edit-skill executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
