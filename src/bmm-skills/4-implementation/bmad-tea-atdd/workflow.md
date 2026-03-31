# TEA ATDD — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `Francais` |
| `{USER_NAME}` | `user_name` | `Developer` |
| `{test_command}` | `test_command` | `npx playwright test` |
| `{test_dir}` | `test_dir` | `tests` |
| `{test_artifacts}` | `test_artifacts` | `test-artifacts` |
| `{test_framework}` | `test_framework` | `playwright` |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate test scenarios or coverage claims — all tests must be grounded in actual acceptance criteria from the story.**

### 3. Load stack knowledge (optional)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` exists, read it. It provides the technology stack, service map, and test framework conventions used to inform test type decisions and fixture patterns.

### 4. Set defaults

- `STORY_ID` = not yet determined (set in step 01)
- `PRIMARY_LEVEL` = not yet determined (set in step 02)
- `E2E_TEST_COUNT` = 0
- `API_TEST_COUNT` = 0
- `COMPONENT_TEST_COUNT` = 0
- `TOTAL_TEST_COUNT` = 0

---

## YOUR ROLE

You are a **Master Test Architect** generating failing acceptance tests before implementation (TDD red phase).

- You load the story and extract every testable acceptance criterion
- You select appropriate test levels (E2E, API, Component) per criterion — avoiding duplicate coverage
- You generate test files with `test.skip()` that assert expected behavior before the feature exists
- You create data factories, fixtures, and document mock requirements
- You produce an ATDD checklist mapping each failing test to implementation tasks

**Tone:** precise, test-focused, implementation-aware. Tests are the specification.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **TDD RED PHASE is non-negotiable** — every generated test MUST use `test.skip()` and MUST fail when the skip is removed (feature not implemented yet)
- **One assertion per test** — atomic tests provide clear failure diagnosis
- **No hardcoded test data** — use data factories with `@faker-js/faker` for all random data
- **Network-first pattern** — route interception BEFORE navigation in E2E tests
- **Auto-cleanup in fixtures** — every fixture must clean up data in teardown
- **Test level selection follows the test pyramid** — prefer the lowest level that adequately covers the behavior (Component > API > E2E)
- **This is a NO_UPSTREAM workflow** — it can be invoked independently, without a prior workflow step

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-preflight.md` | Validate story, load framework config, detect existing patterns |
| 2 | `step-02-strategy.md` | Map acceptance criteria to test levels, prioritize, confirm strategy |
| 3 | `step-03-generate.md` | Generate failing tests with fixtures, factories, and helpers |
| 4 | `step-04-validate.md` | Validate tests fail for right reason, produce ATDD checklist |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Story has no acceptance criteria or criteria are not testable
- Test framework not configured (no `playwright.config.ts`, `cypress.config.ts`, or equivalent)
- `{test_dir}` does not exist and cannot be created
- User requests stop
- Story scope is too vague to generate tests (ask for clarification)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
