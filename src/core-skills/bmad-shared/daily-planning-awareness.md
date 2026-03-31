# Daily Planning Awareness

**This document is loaded by all bmad-* workflow skills at initialization.** It provides context about the user's daily plan when one exists.

---

## Rule

At the start of any bmad-* workflow, check if a daily plan exists for today:

```
{MAIN_PROJECT_ROOT}/.claude/daily-log/{TODAY}.md
```

Where `{TODAY}` is the current date in `YYYY-MM-DD` format.

**If the file exists**, read it and extract:
- `planned_issues` — the issues the user planned to work on today
- `budget_points` — the point budget for the day
- `notes` — any context notes

**Use this context to:**
- Confirm that a ticket being worked on is part of today's plan (or flag if it isn't — the user may have forgotten to plan it)
- Avoid suggesting work that conflicts with the plan
- Reference point estimates when discussing scope or effort
- Know what else the user has on their plate today

**If the file does not exist**, skip silently — the user may not have run daily planning today.

---

## Loading Pattern

Add this to the INITIALIZATION section of any workflow that benefits from daily awareness:

```markdown
### N. Load daily plan (optional)

If `{MAIN_PROJECT_ROOT}/.claude/daily-log/{TODAY}.md` exists (where `{TODAY}` is today's date in YYYY-MM-DD format), read it. This provides context about the user's planned work for the day — issues selected, point budget, and notes.
```

This is **optional** — the workflow must function without it. It only enriches context.

---

## Which Workflows Benefit

| Workflow | How it uses daily plan |
|----------|----------------------|
| **dev-story** | Confirm the story being implemented is in today's plan |
| **quick-spec** | Know what's already planned to avoid duplicating spec work |
| **code-review** | See if the MR being reviewed maps to a planned issue |
| **troubleshoot** | Context about what the user was working on when the bug appeared |
| **sprint-status** | Compare plan vs actual progress |
| **quick-dev** | Confirm the task is in today's plan |
