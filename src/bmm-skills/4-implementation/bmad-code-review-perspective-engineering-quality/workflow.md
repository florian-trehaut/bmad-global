# Single-Perspective Code Review — Engineering Quality (Meta-4)

**Purpose:** Execute a single-perspective code review covering Meta-4 (engineering quality, naming, code organization, dead code, test coverage, refactoring opportunities). Does not use the `Agent()` tool.

**This skill is teammate-only** (M14 of `standalone-auto-flow-unification.md`). It is invoked via direct TaskCreate from any orchestrator. It does NOT support direct user invocation.

**Important note (OOS-9 of `standalone-auto-flow-unification.md`):** Meta-4 is intentionally NOT included in `bmad-auto-flow` Phase 7 (the auto-flow orchestrator runs only Meta-1/2/3 always + Meta-5/6 reserve). Meta-4 coverage relies on standalone `/bmad-code-review` invocation. This perspective subskill remains available for advanced orchestration scenarios that explicitly include Meta-4.

**Spec reference:** Story `auto-flow-orchestrator` Task D3 + story `auto-flow-unification` M14/M15 + OOS-9.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loads `#conventions`, `#test-rules`, `#review-perspectives`).

### 3. Detect teammate mode (M14 — teammate-only enforcement)

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. **This skill REQUIRES TEAMMATE_MODE=true** with `task_contract.role = 'code-reviewer-engineering-quality'`.

If TEAMMATE_MODE=false → HALT with the message :

```
HALT — bmad-code-review-perspective-engineering-quality is a teammate-only skill (M14 of `standalone-auto-flow-unification.md`).
  recommended action: invoke /bmad-code-review standalone (which spawns Meta-4 via Agent()).
  note: Meta-4 is OUT OF SCOPE for /bmad-auto-flow Phase 7 per OOS-9.
  reference: spec auto-flow-unification §OOS-9 + §VM-NR-4.
```

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict).

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` §4.

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-engineering-quality initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md (loaded)
  teammate_mode: true
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-4-engineering-quality.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

**Load:** `~/.claude/skills/bmad-shared/data/code-review-perspective-output-schema.md` — single canonical output schema for all 6 perspective subskills (M15 of `standalone-auto-flow-unification.md` ; enforced by TAC-18 ; verified by VM-9).

For Meta-4, use the schema with :
- `parent_phase`: `code-review`
- `deliverable.summary`: "Meta-4 (engineering-quality) review complete. {N} findings ..."
- `findings[].sub_axis`: one of `4a` (Architecture Hygiene), `4b` (Refactoring Opportunity), `4c` (Test Coverage / Quality), `4d` (Tech Debt)

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-engineering-quality executed end-to-end
```
