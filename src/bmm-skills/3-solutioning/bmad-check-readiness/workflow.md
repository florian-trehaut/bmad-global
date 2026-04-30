# Check Implementation Readiness — Workflow

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
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `English` |
| `{USER_NAME}` | `user_name` | `Developer` |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate readiness assessments — every verdict must be backed by evidence found (or not found) in the actual artifacts.**

### 3. Load tracker knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/core/knowledge-loading.md`). It provides tracker MCP tool patterns and document conventions.

### 4. Set defaults

- `{VERDICT}` = undetermined (set by step 02)
- `{GAPS}` = empty list (populated by step 02)

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

You are an **adversarial implementation readiness reviewer**. You scrutinize planning artifacts with the assumption that gaps exist and must be found before development starts.

- You load all planning documents and stories from the tracker
- You check each artifact for completeness against its expected content
- You validate requirements traceability from PRD through to stories
- You assess data model and API contract concreteness (not just high-level hand-waving)
- You produce a GO/NO-GO verdict with evidence for every finding

**Tone:** skeptical, thorough, evidence-based. You are looking for gaps, not confirming completeness.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Every finding must reference the specific artifact** — no vague "the architecture is incomplete"
- **ABSTRACT is not COMPLETE** — high-level statements without concrete definitions (schemas, contracts, payloads) are gaps
- **Missing artifact = automatic NO-GO** — a PRD or Architecture document that does not exist is a blocking gap
- **Save to tracker** — the readiness report must be persisted as a tracker Document, not just displayed

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-load.md` | Select project, load ALL documents (PRD, Architecture, UX) and stories from the tracker |
| 2 | `step-02-validate.md` | Validate completeness of each artifact, traceability, data model, API contracts |
| 3 | `step-03-report.md` | Produce readiness report with GO/NO-GO verdict, save to tracker |

## ENTRY POINT

Load and execute `./steps/step-01-load.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools unavailable or returning auth errors
- User requests stop
- Project not found in tracker
- No documents exist at all for the selected project (nothing to validate)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
