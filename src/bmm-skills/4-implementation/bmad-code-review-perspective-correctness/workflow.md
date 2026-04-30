# Single-Perspective Code Review — Correctness & Reliability (Meta-2)

**Purpose:** Execute a single-perspective code review covering Meta-2 (correctness, error handling, reliability, edge cases) as a standalone workflow. Does not use the `Agent()` tool — designed for invocation as an Agent Teams teammate (Agent tool removed at spawn time per Anthropic platform contract) or for focused single-perspective reviews.

**Spec reference:** Story `auto-flow-orchestrator` Task D3.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `validation-proof-principles.md`, `evidence-based-debugging.md`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`. HALT if missing.

### 3. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. Expected: TEAMMATE_MODE=true with `task_contract.role = 'code-reviewer-correctness'`. Standalone supported. HALT if TEAMMATE_MODE=true and ORCH_AUTHORIZED=false.

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` — see that workflow's §4 for the resolution pattern. Active sub-axes default to all Meta-2 axes; subset via `task_contract.metadata.active_sub_axes`.

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-correctness initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md (loaded)
  teammate_mode: {true | false}
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-2-correctness-reliability.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

Same shape as `bmad-code-review-perspective-specs` — `phase_complete` SendMessage in TEAMMATE_MODE with `parent_phase: 'code-review'` and findings tagged `meta: 2`.

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-correctness executed end-to-end
```
