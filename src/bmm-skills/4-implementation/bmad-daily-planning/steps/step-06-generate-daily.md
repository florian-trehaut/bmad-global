# Step 6: Generate Daily Script

## STEP GOAL

Generate a plain-text daily standup script ready to be copy-pasted into Slack, Teams, or read aloud at the daily meeting.

## RULES

- Output must be **plain text** — no markdown formatting (no `##`, no `**`, no backticks)
- Use `{COMMUNICATION_LANGUAGE}` for all labels and headers
- Blockers are detected from tracker issue labels/status (blocked) — if none found, show "None"/"Aucun"
- Keep each line concise — issue ID + short title + points
- The script should be self-contained and ready to use without editing

## SEQUENCE

### 1. Load the daily script template

Read `../templates/daily-script-template.md` for the output format reference.

### 2. Build the "Yesterday" section

From `YESTERDAY_COMMITS` and `YESTERDAY_ISSUES`:

- For each completed issue: `• {ISSUE_PREFIX}-{ID} — {title} ({points} pts) ✓`
- For commits not linked to any issue: `• {commit message} (no ticket)`
- Group by issue when possible — don't list both the issue and its commits separately

### 3. Build the "Today" section

From `TODAY_ISSUES`:

- For each planned issue: `• {ISSUE_PREFIX}-{ID} — {title} ({points} pts)`
- For unestimated issues: `• {ISSUE_PREFIX}-{ID} — {title} (? pts)`
- Add the budget line: `Budget: {TODAY_BUDGET} pts (average: {AVG_VELOCITY} pts/day)` or `Budget: {TODAY_BUDGET} pts (first session)` if no velocity

### 3b. Build the "Slack Actions" section

If `SLACK_DISCUSSIONS` contains entries with `action_needed != null`:

```
Slack Actions:
  • #{channel_name}: {action_detail} (with @participant)
  • DM @participant: {action_detail}
```

If no pending Slack actions: omit this section entirely (do not display an empty section).

### 4. Build the "Blockers" section

Check `BACKLOG_ISSUES` for any issues with:
- Status containing "blocked" or similar
- Priority "Urgent" that are not selected for today (might indicate something stuck)

If blockers found: list them. If none: "None" / "Aucun" (per `{COMMUNICATION_LANGUAGE}`).

### 5. Assemble and store

Combine all sections into `DAILY_SCRIPT` following the template format.

Display the complete script to the user:

```
--- DAILY SCRIPT (copy-paste ready) ---

{DAILY_SCRIPT}

--- END ---
```

---

**Next:** Read fully and follow `./steps/step-07-persist.md`
