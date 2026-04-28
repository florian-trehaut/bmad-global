# Step 02: Save Brief to the Tracker


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 02: Save Brief to the Tracker with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Persist the product brief as a tracker document, either in a matching Project or in the Meta Project.

## RULES

- HALT on tracker write failure — never silently fallback
- Check if a matching Project exists before defaulting to Meta
- Document title: `Product Brief` (in Project) or `Product Brief: {title}` (in Meta)

## SEQUENCE

### 1. Determine target project

List epics/projects to find a match (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List epics/projects
- Team: {TRACKER_TEAM}

If a project matching the brief topic exists, save the document there.
Otherwise, save in the Meta Project.

### 2. Check for existing document

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: target_project_id

Look for an existing `Product Brief` document.

### 3. Save or update

If exists, update the document (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update document
- Document: existing_doc_id
- Content: brief_content

If not, create it (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: document_title
- Project: target_project_name
- Content: brief_content

If the tracker write fails: **HALT** — report the error.

### 4. Report completion

Present:

```
Product Brief créé

- Titre: {brief_title}
- Tracker project: {target_project_name}
- Document: Product Brief

Prochaine étape : /bmad-create-prd pour transformer ce brief en PRD détaillé
```

---

## END OF WORKFLOW

The bmad-create-product-brief workflow is complete.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Save Brief to the Tracker
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-product-brief executed end-to-end:
  steps_executed: ['01', '02']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
