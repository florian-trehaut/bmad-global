# Step 2: Create/Sync Projects and Issues, Assign to Cycle

## STEP GOAL

Create missing tracker projects (for epics) and issues (for stories), skip items that already exist, then interactively assign issues to the current cycle based on user choice.

## RULES

- Never create a Project or Issue that already exists — use the match mapping from Step 1
- Issues are created in Backlog state — cycle assignment is a separate decision
- Use the tracker CRUD patterns from tracker.md for all tracker operations
- Log every action (created or skipped) for the final report
- When creating Issues, associate them with the correct Project (epic)

## SEQUENCE

### 1. Create missing Projects (Epics)

For each epic that has NO matching tracker project:

- Create Project in the tracker (using CRUD patterns from workflow-knowledge/project.md):
  - Operation: Create project
  - Name: epic title (e.g., "Epic 1: Campaign Management")
  - Team: {TRACKER_TEAM_ID}
  - Description: epic description from the source file (if available)
- Log: "Project created: {project_name} ({project_id})"
- Store the new project ID for issue association

For each epic that HAS a matching tracker project:
- Log: "Project exists: {project_name} ({project_id})"
- Use the existing project ID for issue association

### 2. Create missing Issues (Stories)

For each story that has NO matching tracker issue:

- Create Issue in the tracker (using CRUD patterns from tracker.md):
  - Operation: Create issue
  - Title: story title (e.g., "Story 1.1: User Authentication")
  - Team: {TRACKER_TEAM_ID}
  - Project: the Project ID for this story's parent epic
  - Status: {TRACKER_STATES.backlog}
  - Description: story description from the source file (if available), including the story key (e.g., `Key: 1-1-user-authentication`)
- Log: "Issue created: {identifier} — {title}"
- Add to the list of newly created issues

For each story that HAS a matching tracker issue:
- Log: "Issue exists: {identifier} — {title} [{status}]"

### 3. CHECKPOINT — Cycle assignment

Present all issues (new and existing) grouped by Project to `{USER_NAME}` in `{COMMUNICATION_LANGUAGE}`:

```
## Attribution au Cycle

Cycle courant : {cycle_name}

### {Project 1 name}
{for each issue in project:}
- [{identifier}] {title} — {status} {NEW if just created}

### {Project 2 name}
{for each issue in project:}
- [{identifier}] {title} — {status} {NEW if just created}

---

Comment souhaitez-vous procéder ?

1. Assigner TOUTES les issues Backlog au cycle courant
2. Choisir les issues à assigner
3. Ne rien assigner (laisser en Backlog)
```

WAIT for user selection.

### 4. Execute cycle assignment

Based on user choice:

**Choice 1 — Assign all Backlog issues:**

For each issue in Backlog status:
- Update the issue in the tracker (using CRUD patterns from tracker.md):
  - Operation: Update issue
  - Issue: issue ID
  - Cycle: current cycle ID
- Log: "Assigned to cycle: {identifier} — {title}"
- Increment `issues_assigned` counter

**Choice 2 — User selects issues:**

Display a numbered list of all Backlog issues:
```
1. [{identifier}] {title}
2. [{identifier}] {title}
...
```

Ask: "Entrez les numeros des issues a assigner (ex: 1,3,5) :"

WAIT for user input.

For each selected issue:
- Update the issue in the tracker (using CRUD patterns from tracker.md):
  - Operation: Update issue
  - Issue: issue ID
  - Cycle: current cycle ID
- Log: "Assigned to cycle: {identifier} — {title}"
- Increment `issues_assigned` counter

**Choice 3 — Skip assignment:**

Log: "Cycle assignment skipped — all issues remain in Backlog"

---

**Next:** Read fully and follow `./step-03-report.md`
