# Single-Perspective Code Review — Security & Privacy (Meta-3)

**Purpose:** Execute a single-perspective code review covering Meta-3 (security, privacy, secrets handling, auth, data exposure) as a standalone workflow. Does not use the `Agent()` tool.

**Spec reference:** Story `auto-flow-orchestrator` Task D3.

**Note:** Standalone `bmad-code-review` runs Meta-3 with security-voting (S1+S2 — two independent security reviewers per BMAD security policy). When this subskill is invoked as a teammate, the orchestrator's code-review phase MAY spawn TWO instances of this subskill (different `task_id`) to preserve the voting — that is the orchestrator's responsibility, not this subskill's.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `validation-proof-principles.md`, `validation-verdict-protocol.md`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loads `#review-perspectives`, `#investigation-checklist`, `#security-baseline`).
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` (auth surface, secret handling, data exposure paths).

### 3. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. Expected: TEAMMATE_MODE=true with `task_contract.role = 'code-reviewer-security'`. Standalone supported. HALT if TEAMMATE_MODE=true and ORCH_AUTHORIZED=false.

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` §4.

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-security initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md, api.md (both loaded)
  teammate_mode: {true | false}
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-3-security-privacy.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

Same shape as `bmad-code-review-perspective-specs` — `phase_complete` SendMessage in TEAMMATE_MODE with `parent_phase: 'code-review'` and findings tagged `meta: 3`. Verdict is `APPROVE` only if zero security BLOCKERs.

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-security executed end-to-end
```
