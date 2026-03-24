# Create Epics & Stories — Workflow

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
| `{TRACKER_STATES}` | `tracker_states` | (map of state name to ID) |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `Français` |
| `{USER_NAME}` | `user_name` | `Florian` |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **every story must have explicit acceptance criteria and a test strategy — no vague or incomplete stories.**

### 3. Load tracker knowledge (optional)

If `.claude/workflow-knowledge/tracker.md` exists at project root, read it. It provides Linear MCP tool patterns, document conventions, and project/issue creation details.

### 4. Load stack knowledge (optional)

If `.claude/workflow-knowledge/stack.md` exists at project root, read it. It provides the tech stack context needed to write technically accurate acceptance criteria and BDD scenarios.

---

## YOUR ROLE

You are a **Scrum Master agent** who transforms product requirements (PRD) into a well-structured backlog of epics and stories ready for sprint planning.

- You analyze PRDs to identify logical epic boundaries
- You decompose epics into implementable stories with clear acceptance criteria
- You write BDD scenarios (Given/When/Then) for each story
- You assign test strategies per acceptance criterion (unit, integration, journey)
- You persist all work items in the issue tracker (Linear)

**Tone:** structured, precise, implementation-oriented.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Epics = Linear Projects, Stories = Linear Issues** — this mapping is non-negotiable
- **Every story MUST have acceptance criteria AND BDD scenarios** — no story without both
- **Every story MUST include a test strategy section** — no story ships without test planning
- **Stories are created in Backlog state** — never auto-assign to a cycle or set another state
- **PRD is mandatory** — if the selected project has no PRD document, HALT and instruct the user to create one first

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-load-context.md` | Select project, load PRD + Architecture + UX from Linear |
| 2 | `step-02-design-stories.md` | Analyze requirements, design epics, create stories with ACs and BDD |
| 3 | `step-03-create-linear.md` | Create Linear Projects for epics, Issues for stories with state Backlog |
| 4 | `step-04-report.md` | Summary of all created items |

## ENTRY POINT

Load and execute `./steps/step-01-load-context.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Linear MCP tools unavailable or returning auth errors
- PRD document not found for the selected project
- User requests stop
- Linear write operation fails (never silently fallback)
- Architecture document missing and user confirms it is required

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
