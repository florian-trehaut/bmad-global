# Step 6: Persist Daily Log

## STEP GOAL

Save today's planning data to a local daily-log file for velocity tracking. This file will be read by future executions of this workflow to calculate velocity and update completion data.

## RULES

- Create `.claude/daily-log/` at the project root if it does not exist
- File name is `{TODAY}.md` (ISO date format)
- If a file for today already exists (workflow run twice in one day), overwrite it with the latest plan
- The file format must match `../data/daily-log-format.md` exactly
- `completed_issues` and `velocity_actual` are left empty — they will be populated by tomorrow's step-01

## SEQUENCE

### 1. Ensure directory exists

Check if `.claude/daily-log/` exists at the project root. If not, create it.

### 2. Build the daily-log content

Using the format from `../data/daily-log-format.md`:

```yaml
---
date: "{TODAY}"
budget_points: {TODAY_BUDGET}
planned_issues:
{for each issue in TODAY_ISSUES:}
  - id: "{issue.id}"
    title: "{issue.title}"
    points: {issue.points or null}
    status_at_plan: "{issue.status}"
{end for}
completed_issues: []
velocity_actual: null
velocity_planned: {TODAY_BUDGET}
notes: ""
---
```

### 3. Write the file

Write to `.claude/daily-log/{TODAY}.md` at the project root.

### 4. Confirm persistence

```
Daily log saved: .claude/daily-log/{TODAY}.md
  Planned: {count} issues, {total_points} pts budget
  Velocity tracking: {HISTORY_DAYS + 1} days logged
```

### 5. Add to .gitignore (first run only)

If this is the first daily-log file (directory was just created), check if `.claude/daily-log/` is in `.gitignore`. If not, suggest adding it:

"Consider adding `.claude/daily-log/` to `.gitignore` — these are personal planning files, not project artifacts."

---

## END OF WORKFLOW

The bmad-daily-planning workflow is complete.
