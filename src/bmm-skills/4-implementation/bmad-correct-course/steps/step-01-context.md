# Step 1: Gather Context

## STEP GOAL

Collect the change description from the user, load the current sprint state from the issue tracker, and let the user choose between incremental (interactive) and batch (full report) analysis modes.

## RULES

- Do NOT start the assessment yet — this step only gathers inputs
- The sprint state must come from real tracker data, never from assumptions
- If no active cycle exists, HALT with a clear message
- Store all loaded data for use in subsequent steps

## SEQUENCE

### 1. Ask for the change description

Ask {USER_NAME}:

> Describe the change or problem that requires a course correction. Include: what changed, why, and what triggered it.

Store the response as `CHANGE_DESCRIPTION`.

If the description is too vague (fewer than two sentences, no clear trigger), ask for clarification before proceeding.

### 2. Load planning artifacts

Load available planning documents to understand the project scope for impact assessment:

| Input | Path | Load Strategy |
|-------|------|---------------|
| PRD | `{planning_artifacts}/*prd*.md` or `{planning_artifacts}/*prd*/*.md` (sharded) | FULL_LOAD |
| Epics | `{planning_artifacts}/*epic*.md` or `{planning_artifacts}/*epic*/*.md` (sharded) | FULL_LOAD |
| Architecture | `{planning_artifacts}/*architecture*.md` or `{planning_artifacts}/*architecture*/*.md` (sharded) | FULL_LOAD |
| UX Design | `{planning_artifacts}/*ux*.md` or `{planning_artifacts}/*ux*/*.md` (sharded) | FULL_LOAD |
| Spec | `{planning_artifacts}/*spec-*.md` | FULL_LOAD |

**Discovery:** Search for whole document first, then check for sharded version (`index.md` + section files). If both exist, use whole document.

**Missing documents:** PRD and Epics are essential — HALT if not found. Architecture, UX Design, and Spec are loaded if available.

### 3. Load current sprint state from tracker

Execute the following tracker queries:

1. **Current cycle:** `{TRACKER_MCP_PREFIX}list_cycles(teamId: {TRACKER_TEAM_ID}, type: 'current')` — extract cycle name, start/end dates, progress
2. **All cycle issues:** `{TRACKER_MCP_PREFIX}list_issues(team: {TRACKER_TEAM}, limit: 100)` — filter to current cycle issues
3. **Active projects:** `{TRACKER_MCP_PREFIX}list_projects(team: {TRACKER_TEAM})` — list epics/projects with status

From the loaded data, build a sprint snapshot:

- **Cycle**: name, dates, progress percentage
- **Issues by status**: group by tracker state (Todo, In Progress, In Review, Done, Canceled)
- **Projects**: list active projects with their issue counts

### 4. Present sprint snapshot

Display the sprint snapshot to {USER_NAME} in a structured format:

```
## Sprint Snapshot — {cycle_name}

**Period:** {start_date} — {end_date}
**Progress:** {progress}%

### Issues by Status
- Todo: {count}
- In Progress: {count}
- In Review: {count}
- Done: {count}
- Canceled: {count}

### Active Projects
- {project_name}: {issue_count} issues ({status_breakdown})
...
```

### 5. CHECKPOINT — Choose analysis mode

Present the mode choice to {USER_NAME}:

> **Analysis mode:**
>
> 1. **Incremental** — review each assessment point interactively, discuss as we go
> 2. **Batch** — full analysis first, then present a comprehensive report
>
> Which mode?

WAIT for user selection.

Store the choice as `MODE` (incremental | batch).

---

**Next:** Read fully and follow `./step-02-assess.md`
