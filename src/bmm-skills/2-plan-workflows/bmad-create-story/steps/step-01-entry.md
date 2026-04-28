# Step 1: Entry & Mode Detection


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Entry & Mode Detection with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Greet the user, detect whether we are in Discovery mode (no existing issue) or Enrichment mode (existing issue to enrich), load initial context, and route to the appropriate step 2.

## RULES

- Communicate in `{COMMUNICATION_LANGUAGE}` with `{USER_NAME}`
- Mode detection is based on ONE signal: "Do we have a tracker issue to work with?"
- If user provides an issue identifier → Enrichment
- If user wants auto-discover → Enrichment (if issue found)
- If no issue and user describes something new → Discovery
- FORBIDDEN: asking detailed technical questions at this stage (too early)

## SEQUENCE

### 1. Load Project Context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if it exists — extract tracker constants, status mappings
- Load Project Context:
  1. Tracker documents (primary): list documents in the Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) → find "Project Context" → load its content by document ID
  2. Fallback local: search for `**/project-context.md` in the project

### 2. Greet and Detect Mode

Greet {USER_NAME} and analyze the user's request. Adapt tone to {COMMUNICATION_LANGUAGE}.

**Mode detection logic:**

**Path A — User provided an issue identifier** (e.g., `{ISSUE_PREFIX}-123` or a full ID):

1. Fetch the issue from the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) — Operation: Get issue by ID, Include: relations
2. Store: `ISSUE_ID`, `ISSUE_IDENTIFIER`, `ISSUE_TITLE`
3. Extract the project (epic): `PROJECT_NAME`, `PROJECT_ID`
4. Derive `EPIC_SLUG` — slugified version of `PROJECT_NAME` (lowercase, hyphenated)
5. Set `MODE = enrichment`
6. Present discovered issue, confirm with user

**Path B — User wants auto-discover** (no specific issue, but wants to enrich next available):

1. Get current cycle from the tracker — Operation: List cycles, Team: {TRACKER_TEAM_ID}, Filter: current
2. List Backlog issues — Operation: List issues, Team: {TRACKER_TEAM}, Status: {TRACKER_STATES.backlog}, Limit: 50
3. Filter to current cycle, sort by project name then issue number (ascending), select first
4. Fallback 1: Try Todo issues in current cycle (may need re-enrichment)
5. Fallback 2: Try Backlog issues without cycle assignment
6. If found: store `ISSUE_ID`, `ISSUE_IDENTIFIER`, `ISSUE_TITLE`, `PROJECT_NAME`, `PROJECT_ID`, `EPIC_SLUG`, set `MODE = enrichment`, present issue and confirm
7. If no issue found: **HALT** — "Aucune issue Backlog trouvee dans le tracker. Lancez le workflow de sprint planning pour creer des issues depuis les epics."

**Path C — User describes a new feature/bug/task** (no existing issue):

1. Understand the request at a high level — no deep questions yet
2. Set `MODE = discovery`
3. Derive a URL-safe `slug` (lowercase, hyphens) from the description
4. Confirm mode with user:

> Mode Discovery — je vais vous guider pour capturer le besoin metier, investiguer le code, et creer une issue tracker complete.

### 3. Route to Next Step

- **IF `MODE = enrichment`:** Load, read fully, and execute `./step-02e-load-context.md`
- **IF `MODE = discovery`:** Load, read fully, and execute `./step-02d-discover.md`

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Context loaded (tracker or local fallback)
- Mode detected and confirmed with user
- Issue metadata stored (Enrichment) or slug derived (Discovery)
- Correct next step loaded

### FAILURE:

- Asking detailed technical questions (too early)
- Not confirming mode with user before routing
- Auto-discovering when user explicitly described a new feature

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Entry & Mode Detection
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
