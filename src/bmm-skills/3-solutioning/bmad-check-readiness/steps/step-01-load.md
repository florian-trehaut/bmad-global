# Step 01: Load Planning Artifacts


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 01: Load Planning Artifacts with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Select the target project from the tracker, then load ALL planning artifacts (PRD, Architecture, UX Design documents) and all stories/issues. This step gathers the raw material that step 02 will validate.

## RULES

- Load EVERY document in the project — do not cherry-pick
- Load ALL issues (up to limit) — stories without acceptance criteria are a gap signal
- If a document fails to load, record it as a gap (do not silently skip)
- Present the inventory to the user before proceeding

## SEQUENCE

### 1. List available projects

Query the tracker for all epics/projects in the team (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List epics/projects
- Team: {TRACKER_TEAM}

### 2. Ask user to select a project

Present the project list:

```
{USER_NAME}, pour quel projet vérifier la readiness ?

1. {project_name_1}
2. {project_name_2}
...

Choix :
```

WAIT for user response.

Store: `{PROJECT_NAME}`, `{PROJECT_ID}`.

### 3. Load all project documents

Fetch the document list for the selected project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {PROJECT_ID}

For EACH document found, load its full content (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Get document
- Document: document_id

Classify each document by type based on its title and content:

| Type | Expected title patterns |
|------|------------------------|
| PRD | "PRD", "Product Requirements", "Cahier des charges", "Requirements" |
| Architecture | "Architecture", "Technical Design", "Design technique" |
| UX Design | "UX", "Design", "Wireframes", "Maquettes", "UI" |
| Other | Any planning document that does not fit the above |

### 4. Load all project issues (stories/epics)

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Project: {PROJECT_NAME}
- Limit: 100

For each issue, note:
- Title
- Status
- Whether it has a description
- Whether the description contains acceptance criteria (look for "AC", "Acceptance Criteria", "Critères d'acceptation", checkbox lists)

### 5. Build artifact inventory

Compile what was found and what is missing:

```
Inventaire des artefacts — {PROJECT_NAME}

Documents trouvés:
  - PRD: {found/missing} — {document_title if found}
  - Architecture: {found/missing} — {document_title if found}
  - UX Design: {found/missing} — {document_title if found}
  - Autres: {list of other documents}

Issues:
  - Total: {count}
  - Avec critères d'acceptation: {count}
  - Sans critères d'acceptation: {count}
  - Epics: {count}
  - Stories: {count}
```

### 6. CHECKPOINT

Present the inventory to the user.

If critical artifacts are missing (no PRD, no Architecture), flag it now:

```
ATTENTION: {artifact} non trouvé dans le projet. Cela constituera un blocage automatique (NO-GO).
Voulez-vous continuer la validation avec les artefacts disponibles ?
```

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 01: Load Planning Artifacts
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-validate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
