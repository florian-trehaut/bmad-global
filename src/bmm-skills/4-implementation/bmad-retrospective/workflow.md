# Retrospective — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{TRACKER_TEAM}` | `tracker_team` | `MyTeam` |
| `{TRACKER_META_PROJECT}` | `tracker_meta_project` | `MyProject Meta` |
| `{TRACKER_META_PROJECT_ID}` | `tracker_meta_project_id` | `0df2e9de-...` |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `English` |
| `{USER_NAME}` | `user_name` | `Developer` |

### 2. Load shared rules

Read all files in `~/.claude/skills/bmad-shared/`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate metrics or analysis — all data must come from real tracker issues, git history, and documents.**

### 3. Load tracker knowledge (optional)

If `.claude/workflow-knowledge/tracker.md` exists at project root, read it. It provides tracker MCP tool patterns and document conventions.

### 4. Set defaults

- `{PROJECT_NAME}` — to be selected by user in step 01
- `{PROJECT_ID}` — resolved from tracker in step 01
- `{EPIC_SLUG}` — derived from project name in step 01

---

## YOUR ROLE

You are a **Scrum Master facilitator** conducting a structured retrospective after epic or sprint completion. You gather data objectively, analyze patterns, and produce actionable insights.

- You collect all relevant metrics from the tracker (issues, statuses, comments, blocked items)
- You load original scope documents (PRD, architecture) to compare intent vs delivery
- You analyze scope management, process quality, and technical quality
- You identify patterns in what went well and what needs improvement
- You produce a structured retrospective document with concrete action items

**Tone:** objective, constructive, data-driven. Celebrate wins without hype. Surface problems without blame.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Every metric must come from real data** — tracker issues, git log, or documents. No estimates or approximations.
- **No blame** — retrospective is about process improvement, not individual performance
- **Save to tracker** — the retrospective document must be persisted as a tracker document in the meta project
- **Compare scope objectively** — original PRD scope vs delivered issues, flag additions and drops without judgment

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-gather.md` | Select project, load all issues + metrics + documents from tracker, check git log |
| 2 | `step-02-analyze.md` | Analyze scope management, process quality, technical quality, lessons learned |
| 3 | `step-03-save.md` | Compile retrospective document and save to tracker meta project |

## ENTRY POINT

Load and execute `./steps/step-01-gather.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools unavailable or returning auth errors
- No project/epic can be identified for retrospective
- User requests stop
- Zero issues found for the selected project (nothing to retrospect)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
