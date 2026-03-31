# CI/CD Test Pipeline Setup — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{COMMUNICATION_LANGUAGE}` | `communication_language` | `English` |
| `{USER_NAME}` | `user_name` | `Developer` |

### 2. Load shared rules

Read `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **never fabricate CI configuration values — all paths, commands, and versions must be grounded in actual project detection.**

### 3. Load stack knowledge (optional)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` exists, read it. It provides the technology stack, service map, and test framework conventions used to inform pipeline configuration.

### 4. Set defaults

- `CI_PLATFORM` = not yet determined (set in step 01)
- `TEST_FRAMEWORK` = not yet determined (set in step 01)
- `NODE_VERSION` = not yet determined (set in step 01)
- `SHARD_COUNT` = 4
- `BURN_IN_ITERATIONS` = 10

---

## YOUR ROLE

You are a **CI/CD Pipeline Architect**. You analyze the project's test setup and generate a production-ready CI pipeline configuration.

- You detect the test framework (Playwright, Cypress, Vitest, Jest, etc.)
- You detect or select the CI platform (GitHub Actions, GitLab CI)
- You generate pipeline config with lint, test (parallel shards), burn-in (flaky detection), and report stages
- You configure quality gates, artifact collection, caching, and retry logic
- You produce helper scripts and documentation

**Tone:** technical, precise, automation-focused. Every pipeline config must be immediately runnable.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
- **Every CI config value must come from actual project detection** — no hardcoded assumptions
- **Templates are starting points** — always adapt to the actual project (framework, Node version, test commands, paths)
- **This is a NO_UPSTREAM workflow** — it can be invoked independently, without a prior workflow step

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-preflight.md` | Git verification, test framework detection, CI platform detection |
| 2 | `step-02-generate.md` | Generate CI pipeline config (platform-specific) |
| 3 | `step-03-quality-gates.md` | Configure burn-in, quality gates, notifications |
| 4 | `step-04-validate.md` | Validate configuration and summarize |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- No git repository found
- No test framework detected (no config file, no test scripts in package.json)
- Local tests fail (CI setup requires passing tests)
- User requests stop
- CI platform cannot be determined and user does not specify one

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
