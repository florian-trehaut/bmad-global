# Single-Perspective Code Review — Engineering Quality (Meta-4)

**Purpose:** Execute a single-perspective code review covering Meta-4 (engineering quality, naming, code organization, dead code, test coverage, refactoring opportunities) as a standalone workflow. Does not use the `Agent()` tool.

**Spec reference:** Story `auto-flow-orchestrator` Task D3.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually.

Key rules: `no-fallback-no-false-data.md`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loads `#conventions`, `#test-rules`, `#review-perspectives`).

### 3. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teammate-mode-routing.md`. Expected: TEAMMATE_MODE=true with `task_contract.role = 'code-reviewer-engineering-quality'`. Standalone supported. HALT if TEAMMATE_MODE=true and ORCH_AUTHORIZED=false.

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` §4.

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-engineering-quality initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md (loaded)
  teammate_mode: {true | false}
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-4-engineering-quality.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

Same shape as `bmad-code-review-perspective-specs` — `phase_complete` SendMessage in TEAMMATE_MODE with `parent_phase: 'code-review'` and findings tagged `meta: 4`.

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-engineering-quality executed end-to-end
```
