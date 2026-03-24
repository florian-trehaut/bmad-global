# Step 5: Plan Today

## STEP GOAL

Classify issues, cross-reference with forge state, present the backlog to the user, suggest a point budget, and let the user select work for today. This is the core interactive step.

## RULES

- NEVER auto-select issues — the user decides what to work on
- Issues already In Progress should be highlighted (work started, should be continued)
- Unestimated issues are displayed but flagged — propose launching estimation agents if multiple are unestimated
- If velocity is unknown (first run), ask the user to set their own budget
- HALT and WAIT for user selection — do not proceed without explicit confirmation
- Cross-reference each issue with forge (branch exists? MR open? MR merged?) to show the real state — tracker status may be stale
- Classify issues as **quick-fix** (short description, no spec) vs **feature** (QuickSpec format with DoD/BAC/TAC/VM) to help the user organize their day

## SEQUENCE

### 1. Present the backlog table

Display all `BACKLOG_ISSUES` in a formatted table:

```
| # | ID | Title | Status | Points | Priority | Project |
|---|-----|-------|--------|--------|----------|---------|
```

Highlight issues that are In Progress with a marker (e.g., `►`).
Mark unestimated issues with `?` in the Points column.

### 2. Suggest a point budget

**If `AVG_VELOCITY` is available:**
```
Suggested budget: {AVG_VELOCITY} pts (based on {HISTORY_DAYS}-day average)
Plan accuracy so far: {accuracy}%
```

**If no velocity data:**
```
No velocity data yet — this is your first daily planning session.
How many points do you want to take today?
```

### 3. CHECKPOINT

Ask the user:

"Which issues do you want to work on today? You can:
- List issue numbers from the table (e.g., 1, 3, 5)
- Set a different budget (e.g., 'budget 8')
- Add a custom task not in the tracker (e.g., 'add: Review PR for colleague')

What's your plan for today?"

WAIT for user confirmation.

### 4. Process the selection

Based on the user's response:
- Map selected numbers to `BACKLOG_ISSUES` entries
- Calculate total points of selected issues (unestimated = 0)
- Set `TODAY_BUDGET` to either the suggested budget or the user's override
- Store selected issues as `TODAY_ISSUES`

### 5. Confirm the plan

Display the confirmed plan:

```
Today's plan ({total_points} pts / {TODAY_BUDGET} pts budget):
  {list of selected issues with IDs, titles, and points}
```

If total exceeds budget: "Warning: you're {N} pts over budget."
If total is well under budget: "You have {N} pts of capacity remaining."

---

**Next:** Read fully and follow `./steps/step-06-generate-daily.md`
