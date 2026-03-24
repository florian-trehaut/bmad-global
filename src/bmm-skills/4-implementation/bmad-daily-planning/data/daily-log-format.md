# Daily Log Format

Defines the structure of each daily-log file persisted in `.claude/daily-log/`. One file per day, named `{YYYY-MM-DD}.md`.

---

## Format

```yaml
---
date: "YYYY-MM-DD"
budget_points: N            # Points the user committed to for the day
planned_issues:             # Issues selected during planning
  - id: "PREFIX-123"
    title: "Issue title"
    points: N               # null if unestimated
    status_at_plan: "Todo"  # Status when planned
completed_issues:           # Filled by next day's step-01 (or manually)
  - id: "PREFIX-123"
    points: N
velocity_actual: N          # Sum of completed issue points (filled next day)
velocity_planned: N         # Same as budget_points (for tracking plan vs actual)
notes: ""                   # Optional freeform notes
---
```

## Rules

- `date` is ISO format, matches filename
- `budget_points` is what the user chose in step-04
- `planned_issues` captures the selection at planning time
- `completed_issues` is populated by the NEXT day's execution of step-01 (looking back at yesterday)
- Issues without point estimates have `points: null` — they count as 0 for velocity calculation
- `velocity_actual` = sum of `completed_issues[].points` (nulls = 0)
- `velocity_planned` = `budget_points`

## Velocity Calculation

```
AVG_VELOCITY = sum(velocity_actual for all logs where velocity_actual != null) / count(such logs)
```

Only days with at least one completed issue contribute to the average. Days where `completed_issues` is empty are excluded (no data, not "zero velocity").
