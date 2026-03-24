# Step 01: Load Planning Artifacts

## STEP GOAL

Select the target project from the tracker, then load ALL planning artifacts (PRD, Architecture, UX Design documents) and all stories/issues. This step gathers the raw material that step 02 will validate.

## RULES

- Load EVERY document in the project — do not cherry-pick
- Load ALL issues (up to limit) — stories without acceptance criteria are a gap signal
- If a document fails to load, record it as a gap (do not silently skip)
- Present the inventory to the user before proceeding

## SEQUENCE

### 1. List available projects

Query the tracker for all projects in the team:

```
{TRACKER_MCP_PREFIX}list_projects(team: "{TRACKER_TEAM}")
```

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

Fetch the document list for the selected project:

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{PROJECT_ID}")
```

For EACH document found, load its full content:

```
{TRACKER_MCP_PREFIX}get_document(id: document_id)
```

Classify each document by type based on its title and content:

| Type | Expected title patterns |
|------|------------------------|
| PRD | "PRD", "Product Requirements", "Cahier des charges", "Requirements" |
| Architecture | "Architecture", "Technical Design", "Design technique" |
| UX Design | "UX", "Design", "Wireframes", "Maquettes", "UI" |
| Other | Any planning document that does not fit the above |

### 4. Load all project issues (stories/epics)

```
{TRACKER_MCP_PREFIX}list_issues(team: "{TRACKER_TEAM}", project: "{PROJECT_NAME}", limit: 100)
```

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

**Next:** Read fully and follow `./step-02-validate.md`
