# Step 3: Sprint Planning Report


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
CHK-STEP-03-ENTRY PASSED — entering Step 3: Sprint Planning Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present a clear summary of all actions taken during sprint planning — projects created/skipped, issues created/skipped, cycle assignments — so the user has a complete picture of the synchronized state.

## RULES

- Report in `{COMMUNICATION_LANGUAGE}`
- Include counts for every action category
- Group by Project (epic) for readability
- Suggest next steps based on what was accomplished

## SEQUENCE

### 1. Compile results

Gather all logged actions from Steps 1 and 2:

- Projects created vs. already existing
- Issues created vs. already existing
- Issues assigned to the current cycle
- Any errors or warnings encountered

### 2. Present summary

Display the report to `{USER_NAME}`:

```
## Sprint Planning — Synchronisation Tracker

### Projets (Epics)

{for each project:}
- {status_indicator} **{project_name}** — {issue_count} stories
  {status_indicator}: "Cree" if new, "Existant" if already existed}

### Issues (Stories)

| Categorie | Nombre |
|-----------|--------|
| Creees | {issues_created} |
| Existantes | {issues_skipped} |
| Assignees au cycle | {issues_assigned} |
| Total | {total} |

### Detail par Projet

{for each project:}
#### {project_name}
{for each issue in project:}
- [{identifier}] {title} — {status} {cycle_indicator}

### Cycle courant : {cycle_name}
- Issues dans ce cycle : {issues_assigned}
```

### 3. Suggest next steps

Based on workflow results, suggest relevant next actions:

- If issues were created: suggest reviewing/refining specs with the create-story or review-story workflows
- If issues were assigned to cycle: suggest starting development with the dev-story workflow
- If no action was taken: note that everything was already synchronized

---

## END OF WORKFLOW

The bmad-sprint-planning workflow is complete.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Sprint Planning Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-sprint-planning executed end-to-end:
  steps_executed: ['01', '02', '03']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
