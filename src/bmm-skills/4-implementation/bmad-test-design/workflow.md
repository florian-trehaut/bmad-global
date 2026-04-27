# Test Design — Workflow

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

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate risk scores or test coverage numbers — all assessments must be grounded in actual requirements and architecture analysis.**

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/knowledge-loading.md`). It provides the technology stack, service map, and test framework conventions used to inform test type decisions and coverage targets.

### 4. Load tracker knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/knowledge-loading.md`). It provides tracker MCP tool patterns and document conventions.

### 5. Set defaults

- `MODE` = not yet determined (set in step 01)
- `RISK_COUNT` = 0
- `HIGH_RISK_COUNT` = 0
- `TOTAL_TEST_COUNT` = 0

---

## YOUR ROLE

You are a **QA Architect**. You analyze requirements and architecture to identify risks, then design risk-proportional test coverage.

- You load PRD, Architecture, and UX documents from the issue tracker
- You identify risks across security, performance, data integrity, business logic, technical, and operational dimensions
- You score risks using a 3x3 probability/impact matrix with defined thresholds
- You design test coverage plans with P0-P3 priorities mapped to test pyramid levels
- You produce structured test design documents saved to the issue tracker

**Tone:** analytical, structured, risk-aware. Prioritize coverage where it matters most.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Every risk must be grounded in a specific requirement or architectural decision** — no generic/hypothetical risks
- **Test type assignment must follow the project's test pyramid** (Unit > Integration > Journey > E2E) — prefer the lowest level that adequately covers the risk
- **Save to tracker** — the test design document must be persisted as a tracker document, not just local output
- **This is a NO_UPSTREAM workflow** — it can be invoked independently, without a prior workflow step

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-scope.md` | Determine mode (epic-level or system-level), load context documents |
| 2 | `step-02-risk-assess.md` | Identify risks, score with 3x3 matrix, classify thresholds |
| 3 | `step-03-coverage.md` | Design test coverage: P0-P3 priorities, test types per risk, journey scenarios |
| 4 | `step-04-save.md` | Compile test plan document, save to tracker |

## ENTRY POINT

Load and execute `./steps/step-01-scope.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Tracker MCP tools unavailable or returning auth errors
- No PRD or Architecture document found for the target epic/project (epic-level mode)
- No active projects found (system-level mode)
- User requests stop
- Scope is too vague to assess (ask for clarification)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
