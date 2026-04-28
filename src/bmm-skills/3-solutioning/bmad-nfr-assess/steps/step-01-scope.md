# Step 1: Determine Scope


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Determine Scope with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Determine whether this NFR assessment targets a specific epic (project) or the entire system, then load the relevant context documents from the tracker.

## RULES

- The user MUST explicitly choose the scope — never auto-select.
- For epic-level: load PRD, Architecture, and Test Design documents from the Epic Project.
- For system-level: load global architecture documents from the Meta Project.
- If no documents are found for the selected scope, proceed anyway — the codebase scan is the primary evidence source.

## SEQUENCE

### 1. List active projects

Query the tracker for active epics/projects (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List epics/projects
- Team: {TRACKER_TEAM}
- State: started

### 2. Present scope choice to user

Present the following menu:

```
Quel type d'évaluation NFR ?

{numbered list of active projects from step 1}

Ou: "system" pour une évaluation globale du codebase.
```

WAIT for user selection.

### 3. Load context based on selection

**If user selects a project (epic-level):**

- Set `SCOPE = "epic"`, store `PROJECT_NAME` and `PROJECT_ID`
- List documents in the Epic Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
  - Operation: List documents
  - Project: PROJECT_ID
- Read the following documents if they exist (they enrich the assessment but are not required):
  - **PRD** — provides the functional requirements context
  - **Architecture** — provides design decisions and constraints
  - **Test Design** — provides existing test coverage plan
- Note which documents were found and which were missing.

**If user selects "system" (system-level):**

- Set `SCOPE = "system"`, `PROJECT_NAME = "System"`
- Load global documents from Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
  - Operation: List documents
  - Project: {TRACKER_META_PROJECT_ID}
- Read Project Context and Architecture documents if they exist.

### 4. Determine scan perimeter

**Epic-level:** Identify which apps/packages/libs are relevant to the epic based on:
- Services mentioned in the Architecture document
- Packages referenced in the PRD
- If unclear, ask the user which services are in scope

**System-level:** All `apps/`, `packages/`, and `libs/` directories are in scope. Exclude legacy services (`apps/tech/`, `apps/*-inventory/`) unless explicitly requested.

### 5. CHECKPOINT

Present to the user:

```
## Scope de l'évaluation NFR

- **Type:** {SCOPE}
- **Projet:** {PROJECT_NAME}
- **Périmètre de scan:** {list of directories/services}
- **Tracker documents chargés:** {list of loaded documents}
- **Documents manquants:** {list or "aucun"}
```

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Determine Scope
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-assess-security.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
