# Step 01: Gather Epic Data

## STEP GOAL

Identify the completed epic/project for retrospective, load all issues with their statuses and metrics from Linear, retrieve scope documents (PRD, architecture), and collect git history for the epic period.

## RULES

- All data must come from real Linear API calls — no fabrication
- Present the project list and let the user choose — never auto-select
- Gather ALL issues (use limit: 100), not just completed ones
- Read comments only on issues that were blocked or had significant status changes

## SEQUENCE

### 1. List available projects

List all projects for the team to identify candidates for retrospective:

```
{TRACKER_MCP_PREFIX}list_projects(team: "{TRACKER_TEAM}")
```

### 2. CHECKPOINT — Project selection

Present the list of projects to the user:

```
Rétrospective — Sélection du projet

Projets disponibles :
  1. {project_name} ({status})
  2. {project_name} ({status})
  ...

Pour quel projet (epic) voulez-vous faire la rétrospective ?
```

WAIT for user selection.

Store: `{PROJECT_NAME}`, `{PROJECT_ID}`, `{EPIC_SLUG}` (slugified project name).

### 3. Load all issues for the project

Fetch all issues associated with this project:

```
{TRACKER_MCP_PREFIX}list_issues(team: "{TRACKER_TEAM}", project: "{PROJECT_NAME}", limit: 100)
```

Compute and store the following metrics:

- **Total issues** — count of all issues
- **Issues by status** — breakdown (Done, In Progress, Backlog, Cancelled, etc.)
- **Completion rate** — Done / Total (excluding Cancelled)
- **Blocked issues** — issues that had Blocked status or labels

### 4. Load comments on key issues

For issues that were blocked, cancelled, or had labels indicating problems, read their comments to understand context:

```
{TRACKER_MCP_PREFIX}list_comments(issueId: "{issue_id}")
```

Focus on:
- Blocked reasons and resolution
- Review feedback and iterations
- Scope change discussions

Store notable comments and their themes.

### 5. Load project documents from Linear

Search for PRD, architecture, and other scope documents associated with the project:

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{PROJECT_ID}")
```

Read the PRD and architecture documents if found — these define the original scope baseline for comparison.

### 6. Check git history

Run `git log --oneline --since="N months ago"` scoped to relevant paths or commit messages mentioning the epic name or issue prefixes. This provides:

- Number of commits and contributors
- Commit frequency patterns
- Files most frequently changed

### 7. Load previous retrospectives (optional)

Check if any previous retrospective documents exist in the Meta Project:

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{TRACKER_META_PROJECT_ID}")
```

Look for documents titled `Retrospective: *`. If found, note recurring themes for comparison.

### 8. CHECKPOINT — Data summary

Present gathered data to the user:

```
Données collectées pour : {PROJECT_NAME}

- Issues totales : {N}
- Par statut : Done ({N}), In Progress ({N}), Backlog ({N}), Cancelled ({N})
- Issues bloquées : {N}
- Documents scope trouvés : {list}
- Commits git : {N}
- Rétrospectives précédentes : {N}

Prêt à analyser. Continuer ?
```

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-analyze.md`
