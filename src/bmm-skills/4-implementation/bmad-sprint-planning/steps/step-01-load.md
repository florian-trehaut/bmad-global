# Step 1: Load Epic Files and Query Tracker State

## STEP GOAL

Discover all epic files in the project, parse every epic and story from them, then query the tracker for existing Projects and Issues to build a complete picture of what exists vs. what needs creation.

## RULES

- Epic files can be a single `epics.md` or multiple `epic-*.md` files
- Search in `_bmad-output/` directory first, then fallback to common locations (`docs/`, project root)
- Story ID conversion: `### Story 1.1: User Authentication` becomes key `1-1-user-authentication`
- HALT if no epic files are found — do not proceed with empty data

## SEQUENCE

### 1. Discover epic files

Search the project for files matching epic patterns:

- `_bmad-output/epics.md` (single file with all epics)
- `_bmad-output/epic-*.md` (multiple files, one per epic)
- If not found in `_bmad-output/`, search `docs/` and project root

**HALT if no epic files found:** "No epic files found. Expected `epics.md` or `epic-*.md` in `_bmad-output/` or `docs/`. Create epic files first."

### 2. Parse epics and stories

For each epic file found, extract:

- **Epic number and title** from headers like `## Epic 1: Campaign Management` or `## Epic 2: Order Processing`
- **Story ID and title** from patterns like `### Story 1.1: User Authentication`

**Story ID Conversion Rules:**

| Original | Step | Result |
|----------|------|--------|
| `### Story 1.1: User Authentication` | Extract ID | `1.1` |
| | Replace `.` with `-` | `1-1` |
| | Title to kebab-case | `user-authentication` |
| | Final key | `1-1-user-authentication` |

Also extract from each story (if present):
- Description or summary paragraph
- Any metadata (priority, estimation)

Build a complete inventory:

```
Epic 1: {title}
  - Story 1.1: {title} (key: 1-1-{kebab-title})
  - Story 1.2: {title} (key: 1-2-{kebab-title})
Epic 2: {title}
  - Story 2.1: {title} (key: 2-1-{kebab-title})
```

### 3. Query existing tracker state

Execute these tracker queries (using CRUD patterns from workflow-knowledge/project.md):

1. **Get current cycle:**
   - Operation: List cycles
   - Team: {TRACKER_TEAM_ID}
   - Filter: active/current cycle
   - Store the cycle ID and name.

2. **List all projects:**
   - Operation: List projects
   - Team: {TRACKER_TEAM}
   - Retrieve all existing Projects.

3. **List all issues:**
   - Operation: List issues
   - Team: {TRACKER_TEAM}
   - Limit: 250
   - Retrieve all existing Issues.

### 4. Build match mapping

Cross-reference parsed epics/stories with existing tracker data:

For each **epic**:
- Check if a Project with a matching title already exists
- Record: `{epic_number} -> {project_id or null}`

For each **story**:
- Check if an Issue with a matching title or story key (slug) already exists
- Match by: exact title, title contains story number, or description contains story key
- Record: `{story_key} -> {issue_id, identifier, status, or null}`

### 5. CHECKPOINT

Present the inventory to `{USER_NAME}` in `{COMMUNICATION_LANGUAGE}`:

```
## Inventaire des Epics et Stories

### Fichiers sources
- {list of epic files found}

### Epics ({count})
{for each epic:}
- Epic {N}: {title} — {EXISTS in tracker / TO CREATE}

### Stories ({count})
{for each story:}
- [{story_key}] {title} — {EXISTS: {identifier} [{status}] / TO CREATE}

### Cycle courant
- {cycle_name} ({cycle_id})

### Actions prévues
- Projets à créer : {count}
- Issues à créer : {count}
- Déjà existants : {count}
```

WAIT for user confirmation before proceeding.

---

**Next:** Read fully and follow `./step-02-sync.md`
