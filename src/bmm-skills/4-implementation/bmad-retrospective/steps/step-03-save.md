# Step 03: Save Retrospective Document


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
CHK-STEP-03-ENTRY PASSED — entering Step 03: Save Retrospective Document with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Compile the full retrospective analysis into a structured document, save it as a tracker document in the meta project, and report completion to the user.

## RULES

- HALT on tracker write failure — never silently fallback
- Document title must follow the convention: `Retrospective: {PROJECT_NAME}`
- Check for existing document before creating (update if exists)
- The document must be self-contained — readable without access to the conversation

## SEQUENCE

### 1. Compile the retrospective document

Assemble the complete document using this structure:

```markdown
# Retrospective: {PROJECT_NAME}

**Date:** {current date}
**Facilitator:** {USER_NAME}

---

## Métriques

| Métrique | Valeur |
|----------|--------|
| Issues totales | {N} |
| Issues terminées | {N} |
| Issues annulées | {N} |
| Taux de complétion | {N}% |
| Issues bloquées | {N} |
| Commits | {N} |

### Répartition par statut

{breakdown table}

---

## 1. Gestion du Scope

### Scope original vs livré
{analysis from step 02}

### Ajouts non planifiés
{list of added stories with context}

### Stories abandonnées
{list of dropped stories with reasons}

### Discipline scope
{rating and justification}

---

## 2. Qualité du Process

### Qualité des stories
{findings}

### Revue de code
{review thoroughness findings}

### Blocages
{blocked issues analysis with causes and resolutions}

### Fluidité du flux
{flow efficiency findings}

---

## 3. Qualité Technique

### Activité code
{git metrics}

### Hotspots
{most modified files}

### Conformité architecture
{architecture compliance findings}

### Tests et bugs
{test/bug findings}

---

## 4. Leçons apprises

### Ce qui a bien fonctionné
{3-5 items with evidence}

### Ce qui doit être amélioré
{3-5 items with evidence and recommendations}

### Actions pour le prochain epic
{2-4 concrete action items}

---

## Comparaison avec la rétrospective précédente

{If previous retro existed: recurring themes, resolved items, new issues}
{If no previous retro: "Première rétrospective — servira de baseline."}
```

### 2. Check for existing retrospective document

Search for an existing document with the same title in the Meta Project:

List documents in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {TRACKER_META_PROJECT_ID}

Look for a document titled `Retrospective: {PROJECT_NAME}`.

### 3. Save or update the document

If a matching document exists, update it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update document
- Document: existing_doc_id
- Content: retrospective_content

If no matching document, create it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: "Retrospective: {PROJECT_NAME}"
- Project: {TRACKER_META_PROJECT}
- Content: retrospective_content

If the tracker write fails: **HALT** — report the error to the user. The retrospective content is still available in the conversation.

### 4. Report completion

Present:

```
Rétrospective terminée

- Epic : {PROJECT_NAME}
- Tracker document : Retrospective: {PROJECT_NAME}
- Issues analysées : {total_issues}
- Taux complétion : {done_count}/{total_issues} ({percentage}%)

Points clés :
  1. {key takeaway 1}
  2. {key takeaway 2}
  3. {key takeaway 3}

Actions pour le prochain epic :
  1. {action item 1}
  2. {action item 2}
```

---

## END OF WORKFLOW

The bmad-retrospective workflow is complete.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 03: Save Retrospective Document
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-retrospective executed end-to-end:
  steps_executed: ['01', '02', '03']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
