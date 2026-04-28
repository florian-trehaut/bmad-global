# Step 8: Architecture Completion and Handoff


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-08-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-08-ENTRY PASSED — entering Step 8: Architecture Completion and Handoff with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Complete the architecture workflow, provide a comprehensive completion summary, and guide the user to the next phase of their project development.

## RULES

- Read the complete step file before taking any action
- Present completion summary and implementation guidance
- This is the FINAL step in this workflow
- Communicate in `{COMMUNICATION_LANGUAGE}`

## SEQUENCE

### 1. Completion Summary

Both you and the user completed something significant together. Summarize what was achieved and acknowledge the user's contributions to the architectural decisions.

### 2. Update Document Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '{current_date}'
```

### 3. Next Steps Guidance

Architecture complete. Invoke the `bmad-help` skill.

Upon completion: offer to answer any questions about the Architecture Document.

## WORKFLOW COMPLETE

This is the final step of the Architecture workflow. The user now has a complete, validated architecture document ready for AI agent implementation.

The architecture serves as the single source of truth for all technical decisions, ensuring consistent implementation across the entire project development lifecycle.

---

## STEP EXIT (CHK-STEP-08-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Architecture Completion and Handoff
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-architecture executed end-to-end:
  steps_executed: ['01', '01b', '02', '03', '04', '05', '06', '07', '08']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '01b', '02', '03', '04', '05', '06', '07', '08'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
