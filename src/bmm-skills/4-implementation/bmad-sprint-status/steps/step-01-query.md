# Step 1: Query Tracker Data

## STEP GOAL

Retrieve all data needed for the sprint status report: the current cycle, all team issues, and all projects (epics). This step performs three tracker queries and stores the raw results for classification in step 2.

## RULES

- Use `{TRACKER_MCP_PREFIX}` for all tool calls
- Use `{TRACKER_TEAM}` and `{TRACKER_TEAM_ID}` for team filtering
- If any query fails with auth errors, HALT and report the error
- Do NOT filter issues by cycle at query time — fetch all issues to get the full picture
- Store raw data; classification happens in step 2

## SEQUENCE

### 1. Get the current cycle

Call `{TRACKER_MCP_PREFIX}list_cycles` with parameters:
- `teamId`: `{TRACKER_TEAM_ID}`
- Filter for the current (active) cycle

**HALT if no current cycle found:** "No active cycle found in the tracker for team {TRACKER_TEAM}. Create a cycle in the tracker or verify the configuration."

Store from the result:
- `CYCLE_ID` — the cycle identifier
- `CYCLE_NAME` — the cycle name/number
- `CYCLE_START` — start date
- `CYCLE_END` — end date

### 2. List all issues in the team

Call `{TRACKER_MCP_PREFIX}list_issues` with parameters:
- `team`: `{TRACKER_TEAM}`
- `limit`: 250

Store all returned issues as `ALL_ISSUES`.

If the result indicates more issues exist beyond the limit, make additional paginated calls to retrieve all issues.

### 3. List all projects (epics)

Call `{TRACKER_MCP_PREFIX}list_projects` with parameters:
- `team`: `{TRACKER_TEAM}`

Store all returned projects as `ALL_PROJECTS`. These represent epics in the tracker.

### 4. Verify data completeness

Confirm that all three queries returned data:
- `CYCLE_ID` is set
- `ALL_ISSUES` is non-empty (if empty, note it but do not HALT — an empty sprint is a valid state to report)
- `ALL_PROJECTS` is available (may be empty if no projects exist)

---

**Next:** Read fully and follow `./step-02-report.md`
