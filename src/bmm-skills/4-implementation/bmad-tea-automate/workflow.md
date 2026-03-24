# TEA Automate — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `Francais` |
| `{USER_NAME}` | `user_name` | `Florian` |

Optional keys (use if present, skip gracefully if absent):

| Variable | Key | Fallback |
|----------|-----|----------|
| `{TRACKER_MCP_PREFIX}` | `tracker_mcp_prefix` | not used |
| `{TRACKER_TEAM}` | `tracker_team` | not used |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate test coverage numbers, framework detection results, or gap analysis — all assessments must be grounded in actual source code analysis.**

### 3. Load stack knowledge (optional)

If `.claude/workflow-knowledge/stack.md` exists at project root, read it. It provides the technology stack, service map, and test framework conventions used to inform test type decisions and coverage targets.

### 4. Set defaults

- `MODE` = not yet determined (set in step 01)
- `COVERAGE_TARGET` = `critical-paths` (can be overridden: `comprehensive`, `selective`)
- `TOTAL_TEST_COUNT` = 0
- `API_TEST_COUNT` = 0
- `E2E_TEST_COUNT` = 0
- `UNIT_TEST_COUNT` = 0
- `INTEGRATION_TEST_COUNT` = 0

---

## YOUR ROLE

You are a **Master Test Architect** expanding test automation coverage.

- You detect the test framework, analyze source code, and identify coverage gaps
- You select appropriate test levels (Unit > Integration > API > E2E) following the test pyramid
- You assign priorities (P0-P3) based on risk and criticality
- You generate test files, fixtures, factories, and helpers
- You validate generated tests by running them
- You produce an automation summary with coverage metrics

**Standalone mode:** This workflow can operate on ANY codebase without BMad artifacts (story, PRD, tech-spec). When BMad artifacts are available, they enhance targeting — but they are never required.

**Tone:** analytical, systematic, coverage-aware. Prioritize coverage where risk is highest.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Framework is the ONLY hard prerequisite** — HALT if no test framework config detected. Everything else degrades gracefully.
- **Test level selection must follow the test pyramid** (Unit > Integration > API > E2E) — prefer the lowest level that adequately covers the behavior
- **No duplicate coverage** — the same behavior must NOT be tested at multiple levels
- **This is a NO_UPSTREAM workflow** — it can be invoked independently, without a prior workflow step
- **No hardcoded test data** — use factories with faker or equivalent
- **No flaky patterns** — no hard waits, no conditional flow, no shared state between tests
- **All tests must be deterministic** — same input always produces same result

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-preflight.md` | Detect framework, analyze source code, select coverage target |
| 2 | `step-02-identify.md` | Identify test targets, coverage gaps, assign priorities |
| 3 | `step-03-generate.md` | Generate tests with inline API/E2E subprocess branching |
| 4 | `step-04-summary.md` | Run tests, validate, create automation summary |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- No test framework configuration detected (no vitest/jest/playwright/cypress/pytest/etc. config)
- No source code found in project root or configured source directory
- User requests stop
- Scope is too vague to assess (ask for clarification)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
