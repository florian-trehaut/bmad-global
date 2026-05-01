# Single-Perspective Code Review — Security & Privacy (Meta-3)

**Purpose:** Execute a single-perspective code review covering Meta-3 (security, privacy, secrets handling, auth, data exposure). Does not use the `Agent()` tool.

**This skill is teammate-only** (M14 of `standalone-auto-flow-unification.md`). It is invoked via `/bmad-auto-flow` Phase 7 OR directly via TaskCreate from any orchestrator. It does NOT support direct user invocation.

**Spec reference:** Story `auto-flow-orchestrator` Task D3 + story `auto-flow-unification` M14/M15.

**Note:** Standalone `bmad-code-review` runs Meta-3 with security-voting (S1+S2 — two independent security reviewers per BMAD security policy). When this subskill is invoked as a teammate, the orchestrator's code-review phase MAY spawn TWO instances of this subskill (different `task_id`) to preserve the voting — that is the orchestrator's responsibility, not this subskill's.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `validation/validation-protocol.md#proof-principles`, `validation/validation-protocol.md#verdict`, `workflow-adherence.md`, `teammate-mode-routing.md`.

### 2. Load project context

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loads `#review-perspectives`, `#investigation-checklist`, `#security-baseline`).
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` (auth surface, secret handling, data exposure paths).

### 3. Detect teammate mode (M14 — teammate-only enforcement)

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. **This skill REQUIRES TEAMMATE_MODE=true** with `task_contract.role = 'code-reviewer-security'`.

If TEAMMATE_MODE=false → HALT with the message :

```
HALT — bmad-code-review-perspective-security is a teammate-only skill (M14 of `standalone-auto-flow-unification.md`).
  recommended action: invoke /bmad-auto-flow Phase 7 OR /bmad-code-review standalone.
  reference: spec auto-flow-unification §VM-NR-4.
```

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict).

### 4. Resolve review contract

Same shape as `bmad-code-review-perspective-specs` §4.

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-security initialization complete:
  shared_rules_loaded: {N} files
  project_knowledge: project.md, api.md (both loaded)
  teammate_mode: true
  review_contract: {summary}
```

---

## EXECUTION

Read FULLY and apply `~/.claude/skills/bmad-code-review/subagent-workflows/meta-3-security-privacy.md`. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

**Load:** `~/.claude/skills/bmad-shared/data/code-review-perspective-output-schema.md` — single canonical output schema for all 6 perspective subskills (M15 of `standalone-auto-flow-unification.md` ; enforced by TAC-18 ; verified by VM-9).

For Meta-3, use the schema with :
- `parent_phase`: `code-review`
- `deliverable.summary`: "Meta-3 (security-privacy) review complete. {N} findings ..."
- `findings[].sub_axis`: one of `3a` (Authentication / Authorization), `3b` (Input Validation), `3c` (Secret Management), `3d` (Vulnerability Surface)

Verdict is `APPROVE` only if zero security BLOCKERs (per the shared schema's verdict computation rule).

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-security executed end-to-end
```
