# Step 1: Determine Scope and Load Context


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Determine Scope and Load Context with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Determine whether the test design operates at epic-level (specific project) or system-level (whole codebase), then load all relevant context documents from the tracker.

## RULES

- If the user specifies an epic or project name, use **epic-level** mode
- If the user requests a system-wide review or does not specify a project, use **system-level** mode
- If ambiguous, ask the user to clarify before proceeding
- All documents must be loaded from the tracker — do not fabricate content

## SEQUENCE

### 1. Ask for scope (if not already provided)

If the user has not specified a target, ask:

> "Test design for a specific epic/project, or a system-level review?"

WAIT for user response.

### 2. Detect operating mode

Apply the following detection logic in priority order:

**A) Explicit user intent (highest priority):**

- User provides PRD + Architecture docs (no epic/stories) --> **system-level** (Phase 3 solutioning — architecture-wide test design)
- User provides Epic + Stories (no PRD/ADR) --> **epic-level** (Phase 4 implementation — focused test plan)
- User provides both PRD/ADR + Epic/Stories --> prefer **system-level** first (covers the broader scope)

**B) Context-based detection:**

- If a sprint artifact exists (e.g., `tracker_file` from `workflow-context.md` for file-based trackers, or active epics in the configured tracker) --> **epic-level** (active implementation phase)
- Otherwise --> **system-level**

**C) If still ambiguous --> ask:**

> "Should I create (A) **System-level** test design (PRD + Architecture --> Architecture + QA docs for dev and QA teams), or (B) **Epic-level** test design (Epic --> single test plan)?"

WAIT for user response.

**If user specifies an epic/project:**

Set `MODE = "epic-level"`.

Load the Epic Project from the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Get project
- Query: PROJECT_NAME
- Include milestones: true

**If user requests system-level review OR no specific epic:**

Set `MODE = "system-level"`.

### 3. Load context documents

**Epic-level mode:**

1. List documents in the project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
   - Operation: List documents
   - Project: PROJECT_ID

2. Find and load the **PRD** document (search for "PRD" in document titles).
   **HALT if not found:** "No PRD document found in project. A PRD is required for epic-level test design."

3. Find and load the **Architecture** document (search for "Architecture" in document titles).
   **HALT if not found:** "No Architecture document found in project. Architecture is required for test design."

4. Find and load the **UX Design** document if available (not required).

5. List all stories in the project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
   - Operation: List issues
   - Team: {TRACKER_TEAM}
   - Project: PROJECT_NAME

**System-level mode:**

1. Load global documents from Meta Project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
   - Operation: List documents
   - Project: {TRACKER_META_PROJECT_ID}

   Find and load "Project Context" and "Architecture Globale" documents.

2. List all active epics/projects (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
   - Operation: List epics/projects
   - Team: {TRACKER_TEAM}
   - State: started

### 4. CHECKPOINT

Present to the user:

> **Mode:** {MODE}
> **Target:** {project name or "System"}
> **Documents loaded:**
> - PRD: {title or "N/A"}
> - Architecture: {title or "N/A"}
> - UX Design: {title or "N/A"}
> **Stories/Projects found:** {count}

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Determine Scope and Load Context
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-risk-assess.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
