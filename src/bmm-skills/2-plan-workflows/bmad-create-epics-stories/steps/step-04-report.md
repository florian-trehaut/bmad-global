# Step 04: Completion Report


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
CHK-STEP-04-ENTRY PASSED — entering Step 04: Completion Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present a structured summary of all created tracker items (Projects and Issues) so the user has a clear view of the backlog and knows what to do next.

## RULES

- Report must list every created item with its tracker identifier
- Include counts and grouping by epic
- Suggest relevant next workflow steps

## SEQUENCE

### 1. Compile report

Present the following summary to the user:

```
Epics et Stories créés pour {SELECTED_PROJECT}

Tracker projects (Epics):
{for each epic}
  - {epic_name} (ID: {project_id})
{end}

Tracker issues (Stories):
{for each epic}
  {epic_name}:
  {for each story}
    - {identifier}: {story_title} [Backlog] — Test strategy incluse ({ac_count} ACs)
  {end}
{end}

Totaux:
  - Epics: {epic_count}
  - Stories: {story_count}
  - ACs totaux: {total_ac_count}

Prochaines étapes possibles:
  - "test design" — plan de test détaillé au niveau epic
  - "nfr assess" — évaluer les exigences non-fonctionnelles
  - "check readiness" — valider que tout est prêt pour l'implémentation
  - "sprint planning" — assigner les stories à un cycle
```

---

## END OF WORKFLOW

The bmad-create-epics-stories workflow is complete.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 04: Completion Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-epics-stories executed end-to-end:
  steps_executed: ['01', '02', '03', '04']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
