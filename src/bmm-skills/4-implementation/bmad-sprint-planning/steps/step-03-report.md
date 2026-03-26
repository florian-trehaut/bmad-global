# Step 3: Sprint Planning Report

## STEP GOAL

Present a clear summary of all actions taken during sprint planning — projects created/skipped, issues created/skipped, cycle assignments — so the user has a complete picture of the synchronized state.

## RULES

- Report in `{COMMUNICATION_LANGUAGE}`
- Include counts for every action category
- Group by Project (epic) for readability
- Suggest next steps based on what was accomplished

## SEQUENCE

### 1. Compile results

Gather all logged actions from Steps 1 and 2:

- Projects created vs. already existing
- Issues created vs. already existing
- Issues assigned to the current cycle
- Any errors or warnings encountered

### 2. Present summary

Display the report to `{USER_NAME}`:

```
## Sprint Planning — Synchronisation Tracker

### Projets (Epics)

{for each project:}
- {status_indicator} **{project_name}** — {issue_count} stories
  {status_indicator}: "Cree" if new, "Existant" if already existed}

### Issues (Stories)

| Categorie | Nombre |
|-----------|--------|
| Creees | {issues_created} |
| Existantes | {issues_skipped} |
| Assignees au cycle | {issues_assigned} |
| Total | {total} |

### Detail par Projet

{for each project:}
#### {project_name}
{for each issue in project:}
- [{identifier}] {title} — {status} {cycle_indicator}

### Cycle courant : {cycle_name}
- Issues dans ce cycle : {issues_assigned}
```

### 3. Suggest next steps

Based on workflow results, suggest relevant next actions:

- If issues were created: suggest reviewing/refining specs with the quick-spec or review-story workflows
- If issues were assigned to cycle: suggest starting development with the dev-story workflow
- If no action was taken: note that everything was already synchronized

---

## END OF WORKFLOW

The bmad-sprint-planning workflow is complete.
