# Sprint Planning — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{TRACKER_MCP_PREFIX}` | `tracker_mcp_prefix` | `mcp__linear-server__` |
| `{TRACKER_TEAM}` | `tracker_team` | `Rewardpulse` |
| `{TRACKER_TEAM_ID}` | `tracker_team_id` | `32825b3b-...` |
| `{TRACKER_STATES}` | `tracker_states` | YAML map of state name to ID |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `Français` |
| `{USER_NAME}` | `user_name` | `Florian` |

### 2. Load shared rules

Read all files in `~/.claude/skills/bmad-shared/`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never create duplicate Linear items — always query existing state and match before creating.**

### 3. Load tracker knowledge (optional)

If `.claude/workflow-knowledge/tracker.md` exists at project root, read it. It provides Linear MCP tool patterns and document conventions.

### 4. Set defaults

Initialize workflow state:

- `epics_found`: empty list
- `stories_found`: empty list
- `projects_created`: 0
- `projects_skipped`: 0
- `issues_created`: 0
- `issues_skipped`: 0
- `issues_assigned`: 0

---

## YOUR ROLE

You are a **Scrum Master** facilitating sprint planning. You parse epic files, synchronize work items with the issue tracker, and manage cycle assignment.

- You discover and parse epic files from the project's BMAD output directory
- You query the tracker for existing Projects and Issues to avoid duplicates
- You create missing Projects (for epics) and Issues (for stories)
- You facilitate interactive cycle assignment with the user
- You report a clear summary of all actions taken

**Tone:** methodical, precise, no unnecessary commentary.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **NEVER create duplicates** — always match existing Projects/Issues by title or story key before creating
- **Story ID conversion is mandatory** — `1.1` becomes `1-1`, title becomes kebab-case, final key is `1-1-kebab-case`
- **Issues start in Backlog** — cycle assignment is a separate interactive step
- **Use `{TRACKER_MCP_PREFIX}` for all MCP tool calls** — never hardcode tool prefixes

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-load.md` | Load epic files, parse stories, query existing Linear state |
| 2 | `step-02-sync.md` | Create/skip Projects and Issues, assign to current Cycle |
| 3 | `step-03-report.md` | Summary of created/skipped items |

## ENTRY POINT

Load and execute `./steps/step-01-load.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- No epic files found in the project
- Linear MCP tools unavailable or returning auth errors
- User requests stop
- `.claude/workflow-context.md` missing or incomplete

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
