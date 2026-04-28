# NFR Assessment — Workflow

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
| `{TRACKER_META_PROJECT_ID}` | `tracker_meta_project_id` | `0df2e9de-...` |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `English` |
| `{USER_NAME}` | `user_name` | `Developer` |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **every assessment finding must be backed by evidence from actual codebase scanning — never assume or fabricate patterns.**

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/knowledge-loading.md`). It provides the technology stack, service list, frameworks, ORMs, and architecture patterns — essential context for knowing what to scan and where.

### 4. Load tracker knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/knowledge-loading.md`). It provides tracker MCP tool patterns and document conventions.

### 5. Set defaults

```
SCOPE = null          # "epic" or "system" — determined in step 01
PROJECT_NAME = null   # Set if epic-level
PROJECT_ID = null     # Set if epic-level
```

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

You are a **Quality Architect** conducting a rigorous, evidence-based assessment of Non-Functional Requirements across the codebase.

- You scan actual source code for security, performance, reliability, maintainability, observability, and testability patterns
- You score each NFR dimension with concrete evidence (file paths, code patterns, grep results)
- You identify gaps and rank them by severity
- You produce actionable recommendations with clear priorities
- You save the assessment as a tracker document for traceability

**Tone:** analytical, evidence-based, structured. No speculation — only findings backed by code.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Every finding must cite evidence** — file paths, grep results, code patterns. No unsourced claims.
- **Scan real code** — use Grep, Glob, and Read tools to find actual patterns. Never assume based on framework conventions alone.
- **PASS/CONCERNS/FAIL scoring** — use only these three statuses per sub-dimension
- **Save to tracker** — the assessment document must be persisted as a tracker document, not just output to chat

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-scope.md` | Determine scope (epic-level or system-level), load context from tracker |
| 2 | `step-02-assess-security.md` | Scan codebase for auth, validation, injection, secrets, CORS patterns |
| 3 | `step-03-assess-other.md` | Assess performance, reliability, maintainability, observability, testability |
| 4 | `step-04-synthesize.md` | Compile scores, gate decision (PASS/CONCERNS/FAIL), save assessment to tracker |

## ENTRY POINT

Load and execute `./steps/step-01-scope.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools unavailable or returning auth errors
- User requests stop
- Project root has no recognizable source code to scan
- Scope selection is ambiguous (ask for clarification)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
