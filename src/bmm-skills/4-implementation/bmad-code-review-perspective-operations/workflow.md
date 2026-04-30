# Single-Perspective Code Review — Operations & Deployment (Meta-5, conditional)

**Purpose:** Execute a single-perspective code review covering Meta-5 (operations, deployment, infrastructure, observability — logs/metrics/traces, runbooks, rollback) as a standalone workflow. Does not use the `Agent()` tool.

**Conditional activation:** This perspective only activates when the diff contains operational changes (CI/CD, infra, observability config, deployment scripts). Standalone `bmad-code-review` evaluates the activation predicate at step-01-gather-context. When invoked as a teammate, the orchestrator decides activation and only spawns this subskill if Meta-5 is active.

**Spec reference:** Story `auto-flow-orchestrator` Task D3.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loads `#infrastructure`, `#environments`, `#observability-standards`).

### 3. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. Expected: TEAMMATE_MODE=true with `task_contract.role = 'code-reviewer-operations'`. Standalone supported. HALT if TEAMMATE_MODE=true and ORCH_AUTHORIZED=false.

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` §4. The contract MUST indicate Meta-5 is active (orchestrator validated activation pre-spawn).

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-operations initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md (loaded)
  teammate_mode: {true | false}
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-5-operations-deployment.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

Same shape as `bmad-code-review-perspective-specs` — `phase_complete` SendMessage in TEAMMATE_MODE with `parent_phase: 'code-review'` and findings tagged `meta: 5`.

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-operations executed end-to-end
```
