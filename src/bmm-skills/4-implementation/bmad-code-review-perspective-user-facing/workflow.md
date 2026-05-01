# Single-Perspective Code Review — User-Facing Quality (Meta-6, conditional)

**Purpose:** Execute a single-perspective code review covering Meta-6 (UX, i18n, accessibility, error messages, loading states, empty states). Does not use the `Agent()` tool.

**This skill is teammate-only** (M14 of `standalone-auto-flow-unification.md`). It is invoked via `/bmad-auto-flow` Phase 7 OR directly via TaskCreate from any orchestrator. It does NOT support direct user invocation.

**Conditional activation:** This perspective only activates when the diff contains user-facing changes (frontend, CLI prompts, error messages, generated content). The orchestrator validates activation pre-spawn.

**Spec reference:** Story `auto-flow-orchestrator` Task D3 + story `auto-flow-unification` M14/M15.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loads `#review-perspectives`, `#conventions`).

### 3. Detect teammate mode (M14 — teammate-only enforcement)

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. **This skill REQUIRES TEAMMATE_MODE=true** with `task_contract.role = 'code-reviewer-user-facing'`.

If TEAMMATE_MODE=false → HALT with the message :

```
HALT — bmad-code-review-perspective-user-facing is a teammate-only skill (M14 of `standalone-auto-flow-unification.md`).
  recommended action: invoke /bmad-auto-flow Phase 7 OR /bmad-code-review standalone.
  reference: spec auto-flow-unification §VM-NR-4.
```

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict).

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` §4. The contract MUST indicate Meta-6 is active.

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-user-facing initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md (loaded)
  teammate_mode: true
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-6-user-facing-quality.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

**Load:** `~/.claude/skills/bmad-shared/data/code-review-perspective-output-schema.md` — single canonical output schema for all 6 perspective subskills (M15 of `standalone-auto-flow-unification.md` ; enforced by TAC-18 ; verified by VM-9).

For Meta-6, use the schema with :
- `parent_phase`: `code-review`
- `deliverable.summary`: "Meta-6 (user-facing-quality) review complete. {N} findings ..."
- `findings[].sub_axis`: one of `6a` (UI / UX), `6b` (Accessibility), `6c` (Performance — perceived), `6d` (Cross-browser / Cross-device)

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-user-facing executed end-to-end
```
