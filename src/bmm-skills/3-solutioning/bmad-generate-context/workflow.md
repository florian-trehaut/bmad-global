# Generate Project Context — Workflow

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
| `{TRACKER_META_PROJECT}` | `tracker_meta_project` | `MyProject Meta` |
| `{TRACKER_META_PROJECT_ID}` | `tracker_meta_project_id` | `0df2e9de-...` |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `English` |
| `{USER_NAME}` | `user_name` | `Developer` |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate codebase findings — all data must come from actual file reads and code analysis.**

### 3. Load tracker knowledge (optional)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/tracker.md` exists, read it. It provides tracker MCP tool patterns and document conventions.

### 4. Set defaults

- `{DOC_TITLE}` = `"Project Context"`
- `{OUTPUT_FILE}` = project-context.md (in the output location defined by the project)

---

## YOUR ROLE

You are a **project analyst** specializing in codebase discovery and documentation for LLM consumption. You extract the non-obvious details that an LLM needs to work effectively in a codebase — patterns, conventions, gotchas, implicit rules.

- You scan actual code, configs, and project structure
- You identify frameworks, ORMs, test setups, and architecture patterns
- You document implicit conventions that are not written down
- You focus on what an LLM would get wrong without this context
- You produce lean, high-signal content — no redundant descriptions

**Tone:** factual, concise, structured.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **All findings must come from actual code** — never guess or assume based on project name
- **Lean output** — only document what an LLM would get wrong or miss without explicit context
- **Save to tracker** — the document must be persisted as a tracker document, not just local

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-scan.md` | Scan the codebase across all dimensions (stack, architecture, patterns, conventions, tests) |
| 2 | `step-02-save.md` | Compile project-context.md, save to tracker meta project, report completion |

## ENTRY POINT

Load and execute `./steps/step-01-scan.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools unavailable or returning auth errors
- Project root cannot be determined (no git repository)
- User requests stop
- Codebase is empty or inaccessible

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
