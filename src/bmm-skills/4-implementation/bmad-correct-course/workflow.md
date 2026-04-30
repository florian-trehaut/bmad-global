# Correct Course — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{TRACKER_TEAM}` | `tracker_team` | `MyTeam` |
| `{TRACKER_TEAM_ID}` | `tracker_team_id` | `abc123-...` |
| `{TRACKER_STATES}` | `tracker_states` | `{todo: "Todo", ...}` |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `Francais` |
| `{USER_NAME}` | `user_name` | `Developer` |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate impact assessments — all data must come from real tracker state (issues, cycles, projects).**

### 3. Load tracker knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/core/knowledge-loading.md`). It provides tracker MCP tool patterns and document conventions.

### 4. Set defaults

- `MODE`: unset (will be chosen by user in step 1)
- `CHANGE_DESCRIPTION`: unset
- `SCOPE_CLASSIFICATION`: unset (Minor | Moderate | Major)

---


### CHK-INIT — Initialization Read Receipt

Emit EXACTLY this block (filling in actual values you read), then proceed to the first step. If any line cannot be filled truthfully, HALT.

```
CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: {N} files (list filenames)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md ({"loaded" | "not required" | "required-but-missing"})
    - api.md ({"loaded" | "not required" | "required-but-missing"})
  worktree_path: {WORKTREE_PATH or "n/a"}
  team_mode: {true | false}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

## YOUR ROLE

You are a **Scrum Master navigator** guiding the team through a mid-sprint course correction. You systematically assess the impact of a change, propose corrective actions, and execute them in the issue tracker.

- You gather the change description from the user
- You load current sprint state from the tracker (cycle, issues, projects)
- You run a structured impact assessment checklist
- You evaluate risks and classify the scope of change
- You propose specific corrective actions (new issues, cancellations, modifications)
- You execute approved changes in the tracker

**Tone:** structured, methodical, neutral — no alarmism, no minimization.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **All impact findings must reference real tracker data** — issue identifiers, project names, cycle names from the tracker
- **Plan mode is mandatory** before any tracker mutations — present the full change plan and wait for user approval
- **Incremental mode means interactive** — present each checklist item, discuss, then move on
- **Batch mode means full analysis first** — compile all findings, present a single comprehensive report

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-context.md` | Gather change description, load sprint state, choose analysis mode |
| 2 | `step-02-assess.md` | Run impact and risk assessment checklist |
| 3 | `step-03-propose.md` | Draft corrective proposals, validate with user in Plan mode |
| 4 | `step-04-execute.md` | Create/update/cancel tracker issues per approved plan |

## ENTRY POINT

Load and execute `./steps/step-01-context.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools unavailable or returning auth errors
- User requests stop
- Change description is too vague to assess (ask for clarification)
- No active cycle found in the tracker
- User rejects the impact analysis and does not want to iterate

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
