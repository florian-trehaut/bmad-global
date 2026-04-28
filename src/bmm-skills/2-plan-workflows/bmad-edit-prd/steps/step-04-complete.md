---
prdFile: '{prd_file_path}'
validationWorkflow: '../../bmad-validate-prd/steps/step-01-discovery.md'
---

# Step 4: Complete & Validate


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Complete & Validate with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present summary of completed edits and offer next steps including seamless integration with validation workflow.

## RULES

- No additional edits in this step -- summary and routing only
- Always offer the validation option when the validate-prd skill is available
- Present a clear, concise summary of all changes made
- Communicate in `{COMMUNICATION_LANGUAGE}`

## SEQUENCE

### 1. Compile Edit Summary

From step 3, compile:

**Changes Made:**

- Sections added: {list with names}
- Sections updated: {list with names}
- Content removed: {list}
- Structure changes: {description}

**Edit Details:**

- Total sections affected: {count}
- Mode: {restructure/targeted/both}
- Priority addressed: {Critical/High/Medium/Low}

**PRD Status:**

- Format: {BMAD Standard / BMAD Variant / Legacy (converted)}
- Completeness: {assessment}

### 2. Present Completion Summary

"**PRD Edit Complete**

**Updated PRD:** {prd_file_path}

**Changes Summary:**
{Present bulleted list of major changes}

**Edit Mode:** {mode}
**Sections Modified:** {count}
**PRD Format:** {format}

PRD is now ready for:

- Downstream workflows (UX Design, Architecture)
- Validation to verify quality
- Production use

What would you like to do next?"

### 3. Menu

**[V] Run Full Validation** - Execute complete validation workflow to verify PRD quality
**[E] Edit More** - Make additional edits to the PRD
**[S] Summary** - End with detailed summary of changes
**[X] Exit** - Exit edit workflow

WAIT for user input.

- **IF V:** "Starting Validation Workflow. This will run all validation checks on the updated PRD." Read fully and follow: {validationWorkflow}
- **IF E:** Ask what additional edits to make, then read fully and follow: `./step-03-edit.md`
- **IF S:** Present detailed summary including complete list of changes, key improvements, and recommendations for next steps. "Edit Workflow Complete."
- **IF X:** Display brief summary. "Edit Workflow Complete."

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Complete & Validate
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-edit-prd executed end-to-end:
  steps_executed: ['01', '01b', '02', '03', '04']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '01b', '02', '03', '04'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
