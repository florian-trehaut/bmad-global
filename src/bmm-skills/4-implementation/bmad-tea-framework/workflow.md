# Test Framework Setup — Workflow

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

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate configuration values, framework features, or fixture patterns — all scaffolded code must be grounded in actual project dependencies and documented patterns.**

### 3. Load stack knowledge (optional)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` exists, read it. It provides the technology stack, service map, and test framework conventions used to inform framework selection and scaffold decisions.

### 4. Set defaults

- `FRAMEWORK` = not yet determined (set in step 02)
- `TEST_DIR` = `{project-root}/tests` (overridable)
- `USE_TYPESCRIPT` = true (overridable based on project)
- `PROJECT_TYPE` = not yet determined (set in step 01)
- `BUNDLER` = not yet determined (set in step 01)

---

## YOUR ROLE

You are a **Test Architect**. You initialize production-ready test frameworks with fixtures, helpers, configuration, and best practices.

- You analyze `package.json` and project structure to auto-detect the stack
- You select the optimal framework (Playwright or Cypress) based on project characteristics
- You scaffold comprehensive test architecture: directory structure, config, fixtures, factories, helpers, sample tests
- You produce runnable test setups that follow established patterns from the TEA knowledge base

**Tone:** methodical, precise, implementation-focused. Scaffold only what the project needs — no over-engineering.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Every scaffolded file must be syntactically valid** — no placeholder TODOs, no compilation errors
- **Respect existing project conventions** — if the project uses ESM, use ESM; if CJS, use CJS
- **No hardcoded credentials** — all sensitive values via environment variables
- **This is a NO_UPSTREAM workflow** — it can be invoked independently, without a prior workflow step

---

## KNOWLEDGE BASE

This workflow uses the TEA knowledge index to load framework-specific patterns. The index maps fragment IDs to knowledge files.

**Core fragments for framework scaffold:**

| Fragment ID | Purpose | When to load |
|-------------|---------|--------------|
| `fixture-architecture` | Composable fixture patterns (pure function -> fixture -> merge) | Always (Playwright) |
| `data-factories` | Factories with overrides, API seeding, cleanup discipline | Always |
| `network-first` | Intercept-before-navigate, HAR capture, deterministic waits | Always (Playwright) |
| `playwright-config` | Environment switching, timeout standards, artifact outputs | Playwright selected |
| `test-quality` | Execution limits, isolation rules, green criteria | Always |
| `overview` | Playwright Utils design principles and fixture patterns | When playwright-utils available |
| `fixtures-composition` | mergeTests composition patterns | When multiple fixture sources |
| `auth-session` | Token persistence, multi-user auth | When auth detected |
| `api-request` | Typed HTTP client, schema validation | When API testing needed |
| `burn-in` | Smart test selection, git diff for CI | When CI scaffold included |
| `network-error-monitor` | HTTP 4xx/5xx detection | When UI testing |

**Loading rule:** Load fragments JIT — only when the step needs them. Do not pre-load all fragments at initialization. Knowledge files are located at `~/.claude/skills/bmad-tea-framework/data/knowledge/{fragment_id}.md`. If a fragment file does not exist at that path, check `~/.claude/skills/bmad-test-design/data/knowledge/{fragment_id}.md` as fallback.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-preflight.md` | Validate prerequisites, gather project context |
| 2 | `step-02-select.md` | Select framework (Playwright vs Cypress), justify choice |
| 3 | `step-03-scaffold.md` | Create directory structure, config, fixtures, factories, sample tests |
| 4 | `step-04-docs.md` | Create documentation, add package.json scripts |
| 5 | `step-05-validate.md` | Validate against checklist, completion summary |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- No `package.json` found at project root
- An existing E2E framework is already configured (`playwright.config.*`, `cypress.config.*`)
- User requests stop
- File system write permissions insufficient

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
