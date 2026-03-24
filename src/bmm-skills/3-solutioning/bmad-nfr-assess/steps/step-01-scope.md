# Step 1: Determine Scope

## STEP GOAL

Determine whether this NFR assessment targets a specific epic (project) or the entire system, then load the relevant context documents from Linear.

## RULES

- The user MUST explicitly choose the scope — never auto-select.
- For epic-level: load PRD, Architecture, and Test Design documents from the Epic Project.
- For system-level: load global architecture documents from the Meta Project.
- If no documents are found for the selected scope, proceed anyway — the codebase scan is the primary evidence source.

## SEQUENCE

### 1. List active projects

Query Linear for active projects:

```
{TRACKER_MCP_PREFIX}list_projects(team: '{TRACKER_TEAM}', state: 'started')
```

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
- List documents in the Epic Project:
  ```
  {TRACKER_MCP_PREFIX}list_documents(projectId: PROJECT_ID)
  ```
- Read the following documents if they exist (they enrich the assessment but are not required):
  - **PRD** — provides the functional requirements context
  - **Architecture** — provides design decisions and constraints
  - **Test Design** — provides existing test coverage plan
- Note which documents were found and which were missing.

**If user selects "system" (system-level):**

- Set `SCOPE = "system"`, `PROJECT_NAME = "System"`
- Load global documents from Meta Project:
  ```
  {TRACKER_MCP_PREFIX}list_documents(projectId: '{TRACKER_META_PROJECT_ID}')
  ```
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
- **Documents Linear chargés:** {list of loaded documents}
- **Documents manquants:** {list or "aucun"}
```

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-assess-security.md`
