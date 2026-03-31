# Step 1: Collect Yesterday's Work

## STEP GOAL

Build a complete picture of what was accomplished since the last daily planning session by analyzing git commits and tracker issues. This data feeds the "yesterday" section of the daily script and updates the previous day's log with completion data.

## RULES

- **Fetch `origin/main` first** (`git fetch origin main`) before running git log — local branches may be stale
- Use `git log origin/main` with `--author` matching `{USER_NAME}` — do not include other people's commits
- Use the tracker MCP tools to query issues — do not assume issue states
- If the previous daily-log exists, use its date as the "since" reference. Otherwise, default to yesterday's date
- Do NOT update any tracker issue statuses — this step is read-only

## SEQUENCE

### 1. Determine the reference date

Check if `{MAIN_PROJECT_ROOT}/.claude/daily-log/` exists at the project root.

**If it exists:** find the most recent daily-log file (sorted by filename = date). Extract its `date` field. This is `{LAST_DAILY_DATE}`.

**If it does not exist or is empty:** set `{LAST_DAILY_DATE}` to yesterday's date (`{TODAY}` minus 1 day).

### 2. Collect git commits

First, fetch the latest state of origin/main:

```bash
git fetch origin main
```

Then detect the user's git identity:

```bash
git config user.name
git config user.email
```

Query using git author name first, then email as fallback:

```bash
git log origin/main --author="{git_user_name}" --since="{LAST_DAILY_DATE}" --until="{TODAY}" --oneline --no-merges
```

If no results, retry with the git email:

```bash
git log origin/main --author="{git_user_email}" --since="{LAST_DAILY_DATE}" --until="{TODAY}" --oneline --no-merges
```

**Important:** use `origin/main` as the ref, not the local branch — local may be behind. Use the actual `git config` values, not `{USER_NAME}` — the git author name may differ from the tracker username.

Store results as `YESTERDAY_COMMITS` — a list of `{hash} {message}` entries.

### 3. Collect completed tracker issues

Query the tracker for issues that were recently completed (status = Done or equivalent) and are assigned to or created by the user.

Query the tracker (using CRUD patterns from tracker.md):
- List issues for team `{TRACKER_TEAM}` with status "Done" or equivalent completion status
- Filter: assigned to `"me"` (authenticated user — NOT `{USER_NAME}` which may not match the tracker's user lookup) OR created by `"me"`
- Filter: updated since `{LAST_DAILY_DATE}`

For each completed issue, extract: `id`, `title`, `points` (estimate), `status`.

Store as `YESTERDAY_ISSUES`.

### 4. Update previous daily-log (if exists)

If a daily-log file exists for `{LAST_DAILY_DATE}`:
- Read it
- **Re-sync planned_issues estimates:** for each issue in `planned_issues` that has `points: null`, query the tracker for its current estimate. If it now has points, update the `planned_issues` entry. This catches issues that were estimated after the daily planning session.
- Recalculate `velocity_planned` = sum of all `planned_issues` points (after re-sync)
- Populate the `completed_issues` field with the issues found in step 3 that match the `planned_issues`
- Calculate `velocity_actual` = sum of completed issue points
- Write the updated file back

This closes the feedback loop — yesterday's plan now has actual completion data, and planned estimates are corrected retroactively.

### 5. Present summary

Display a brief summary:

```
Since {LAST_DAILY_DATE}:
  Commits: {count}
  Issues completed: {count} ({total_points} pts)
```

If this is the first run (no previous daily-log), note: "First daily planning session — no previous log to update."

---

**Next:** Read fully and follow `./steps/step-01b-collect-comms.md`
