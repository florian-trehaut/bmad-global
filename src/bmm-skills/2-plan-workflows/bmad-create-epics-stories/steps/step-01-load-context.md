# Step 01: Load Context from the Tracker

## STEP GOAL

Select the target project in the tracker, then load all available specification documents (PRD, Architecture, UX Design) that will serve as input for story decomposition.

## RULES

- The user MUST select a project — never auto-select
- PRD is mandatory — HALT if not found
- Architecture is strongly recommended but not blocking
- UX Design is optional — load if available
- Load full document content, not just titles

## SEQUENCE

### 1. List available projects

Fetch all epics/projects from the tracker (using CRUD patterns from tracker.md):
- Operation: List epics/projects
- Team: {TRACKER_TEAM_ID}

### 2. Present project selection

Display the list of projects to the user:

```
Projets disponibles dans {TRACKER_TEAM}:

1. {project_name_1}
2. {project_name_2}
...

Pour quel projet souhaitez-vous créer les epics et stories ?
(Entrez le numéro ou le nom du projet)
```

WAIT for user selection. Store the selected project as `{SELECTED_PROJECT}` with its ID as `{SELECTED_PROJECT_ID}`.

### 3. Load project documents

Fetch all documents attached to the selected project (using CRUD patterns from tracker.md):
- Operation: List documents
- Project: {SELECTED_PROJECT_ID}

### 4. Load PRD

Find and load the document identified as the PRD (title containing "PRD", "Product Requirements", or similar).

Load the PRD (using CRUD patterns from tracker.md):
- Operation: Get document
- Document: prd_document_id

**HALT if PRD not found:** "PRD non trouvé pour {SELECTED_PROJECT}. Créez d'abord le PRD avant de lancer la découpe en stories."

Store the full PRD content as `{PRD_CONTENT}`.

### 5. Load Architecture

Find and load the Architecture document if it exists (title containing "Architecture", "Technical Architecture", or similar).

Load the Architecture document (using CRUD patterns from tracker.md):
- Operation: Get document
- Document: architecture_document_id

If not found, inform the user:

```
Architecture document non trouvé pour {SELECTED_PROJECT}.
Voulez-vous continuer sans ? Les stories seront moins précises techniquement.
```

WAIT for user confirmation. Store the content as `{ARCHITECTURE_CONTENT}` or mark as unavailable.

### 6. Load UX Design (optional)

Find and load UX Design documents if available (title containing "UX", "Design", "Wireframes", or similar).

Load the UX document (using CRUD patterns from tracker.md):
- Operation: Get document
- Document: ux_document_id

If found, store as `{UX_CONTENT}`. If not found, continue silently — UX is optional.

### 7. CHECKPOINT

Present a summary of loaded context to the user:

```
Contexte chargé pour {SELECTED_PROJECT}:

- PRD: {prd_title} ({N} sections)
- Architecture: {architecture_title OR "Non disponible"}
- UX Design: {ux_title OR "Non disponible"}

Prêt à analyser les requirements et concevoir les stories.
Confirmez pour continuer.
```

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-design-stories.md`
