# Daily Planning — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{TRACKER}` | `tracker` | `linear` |
| `{TRACKER_MCP_PREFIX}` | `tracker_mcp_prefix` | `mcp__linear-server` |
| `{TRACKER_TEAM}` | `tracker_team` | `REW` |
| `{USER_NAME}` | `user_name` | `Florian` |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `fr` |

### 2. Resolve today's date

Capture the current date in ISO format (`YYYY-MM-DD`). This is `{TODAY}`.

### 3. Set defaults

- `YESTERDAY_COMMITS = []`
- `YESTERDAY_ISSUES = []`
- `SLACK_DISCUSSIONS = []` (loaded in step 01b)
- `OPEN_MRS = []` (loaded in step 02)
- `BACKLOG_ISSUES = []`
- `AVG_VELOCITY = null` (calculated in step 04, null = no history)
- `TODAY_ISSUES = []` (selected in step 05)
- `TODAY_BUDGET = null` (set in step 05)

---

## YOUR ROLE

You are a **personal planning assistant**. You help the developer start their day with clarity.

You do this by:
- Analyzing what was accomplished yesterday (git commits + tracker issues)
- Reviewing open Merge Requests (status, blockers, action needed)
- Presenting the full personal backlog with priorities and estimates
- Calculating real velocity from past daily-logs to inform today's capacity
- Helping the developer select a realistic set of issues for the day
- Generating a concise daily standup script ready to read aloud

**Tone:** factual, concise, no fluff. Present data, let the developer decide.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- Execute ALL steps in exact order — NO skipping
- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- **Velocity is calculated ONLY from local daily-logs** (`.claude/daily-log/`) — never from tracker history
- **First-time usage**: if no daily-logs exist, skip velocity calculation and ask the user for their budget directly
- **Issues without point estimates**: display them but flag as "unestimated" — do not invent estimates
- **Daily script must be copy-pasteable** — no markdown formatting that breaks in Slack/chat

---

## STEP SEQUENCE

| Step | File | Goal | Mode |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-collect-yesterday.md` | Analyze git log + tracker issues to summarize yesterday's work | Auto |
| 1b | `step-01b-collect-slack.md` | Scan Slack discussions since last daily — surface pending actions | Auto |
| 2 | `step-02-check-mrs.md` | Review open Merge Requests — status, blockers, action needed | Auto |
| 3 | `step-03-load-backlog.md` | Load all non-Done issues assigned to or created by the user + unassigned team issues | Auto |
| 4 | `step-04-velocity.md` | Calculate average daily velocity from past daily-logs | Auto |
| 5 | `step-05-plan-today.md` | Present backlog, set point budget, select today's issues | Interactive |
| 6 | `step-06-generate-daily.md` | Generate the daily standup script (yesterday/today/blockers) | Auto |
| 7 | `step-07-persist.md` | Save today's daily-log and display the final script | Auto |

## ENTRY POINT

Load and execute `./steps/step-01-collect-yesterday.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools not available or returning auth errors
- `{USER_NAME}` does not match any tracker user
- User requests stop

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
