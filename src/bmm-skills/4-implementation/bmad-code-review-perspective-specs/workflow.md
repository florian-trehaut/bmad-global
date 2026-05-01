# Single-Perspective Code Review — Specs Compliance & Contract Integrity (Meta-1)

**Purpose:** Execute a single-perspective code review covering Meta-1 (Specs Compliance, API Contract & Backward Compat, Decision Documentation, Documentation Coherence). Does not use the `Agent()` tool — designed for invocation as an Agent Teams teammate.

**This skill is teammate-only** (M14 of `standalone-auto-flow-unification.md`). It is invoked via `/bmad-auto-flow` Phase 7 OR directly via TaskCreate from any orchestrator. It does NOT support direct user invocation (no fictional standalone slash command branch).

**Relationship to bmad-code-review:** This subskill is the **single-perspective companion** of `bmad-code-review` Meta-1. The full `bmad-code-review` skill spawns 5–7 metas in parallel via `Agent()` (preserved for standalone user invocation per VM-NR-4 of story `auto-flow-orchestrator`). This subskill executes the SAME Meta-1 logic but inline (no Agent() call), making it usable inside teammate contexts.

**Spec reference:** Story `auto-flow-orchestrator` Task D3 + story `auto-flow-unification` M14/M15 — see also `BAC-12`, `TAC-9`, `TAC-13`, `TAC-18`, Risk-4.

---

## INITIALIZATION

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules: `no-fallback-no-false-data.md`, `validation/validation-protocol.md#proof-principles`, `validation/validation-protocol.md#verdict`, `workflow-adherence.md`, `teammate-mode-routing.md`, `task-contract-schema.md`.

### 2. Load project context

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` (Meta-1 reviews API contracts — required).

### 3. Detect teammate mode (M14 — teammate-only enforcement)

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. **This skill REQUIRES TEAMMATE_MODE=true** with `task_contract.role = 'code-reviewer-specs'`.

If TEAMMATE_MODE=false → HALT immediately with the message :

```
HALT — bmad-code-review-perspective-specs is a teammate-only skill (M14 of `standalone-auto-flow-unification.md`).
  reason: this perspective subskill is invoked via /bmad-auto-flow Phase 7 OR direct TaskCreate from any orchestrator — it does NOT support direct user invocation.
  recommended action:
    (1) /bmad-auto-flow — full lifecycle code-review with all 5 perspectives in Phase 7
    (2) /bmad-code-review — standalone meta-orchestrator with Agent() spawning 5-7 metas in parallel
  reference: spec auto-flow-unification §VM-NR-4.
```

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict applies; orchestrator-spawned only).

### 4. Resolve review contract

The review contract is the input to the Meta-1 logic. Source : `task_contract` (TEAMMATE_MODE=true is the only supported mode per M14) :

- `worktree_path` from `task_contract.constraints.worktree_path` (required, HALT if null)
- `mr_target_branch` from `task_contract.input_artifacts[type=diff].target_branch`
- `linear_issue` (or equivalent tracker issue) from `task_contract.input_artifacts[type=tracker_issue]`
- `changed_files` from `task_contract.scope_files`
- `diff_stats` from `task_contract.input_artifacts[type=diff].stats`
- `active_sub_axes` defaults to `['1a', '1b', '1c', '1d']` (all sub-axes); subset allowed via `task_contract.metadata.active_sub_axes`
- `project_adrs` from project ADRs loaded by step-01 of `bmad-code-review` (or empty array if not loaded)

### 5. CHK-INIT

```
CHK-INIT PASSED — bmad-code-review-perspective-specs initialization complete:
  shared_rules_loaded: {N} files (must include teammate-mode-routing.md, no-fallback-no-false-data.md)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (loaded)
    - api.md (loaded — REQUIRED for Meta-1)
  teammate_mode: {true | false}
  orch_authorized: {true | false | "n/a"}
  review_contract:
    worktree_path: {path}
    mr_target_branch: {branch}
    mr_iid: {iid | "n/a"}
    changed_files: {N}
    active_sub_axes: {list}
```

---

## EXECUTION

Apply the Meta-1 logic by reading and following `~/.claude/skills/bmad-code-review/subagent-workflows/meta-1-contract-spec.md` (or its source path `src/bmm-skills/4-implementation/bmad-code-review/subagent-workflows/meta-1-contract-spec.md` if working from the source repo).

Read FULLY and apply that file — load it with the Read tool, do not summarise from memory, do not skip sections.

The Meta-1 file contains the full sub-axis logic (1a Specs Compliance, 1b API Contract & Backward Compat, 1c Decision Documentation, 1d Documentation Coherence) and the YAML report schema. Execute it inline — DO NOT spawn an Agent().

---

## OUTPUT

**Load:** `~/.claude/skills/bmad-shared/data/code-review-perspective-output-schema.md` — single canonical output schema for all 6 perspective subskills (M15 of `standalone-auto-flow-unification.md` ; enforced by TAC-18 ; verified by VM-9).

For Meta-1, use the schema with these perspective-specific values :

- `parent_phase`: `code-review` (constant)
- `deliverable.summary`: "Meta-1 (specs-compliance) review complete. {N} findings: {n_blocker} BLOCKER, {n_major} MAJOR, {n_minor} MINOR, {n_info} INFO."
- `findings[].sub_axis`: one of `1a` (Specs Compliance), `1b` (API Contract & Backward Compat), `1c` (Decision Documentation), `1d` (Documentation Coherence)

The verdict is `APPROVE` if zero BLOCKER findings, `FINDINGS` otherwise (per the shared schema's verdict computation rule).

---

## WORKFLOW EXIT

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-code-review-perspective-specs executed end-to-end:
  steps_executed: [INIT, EXECUTION-Meta-1, OUTPUT]
  steps_skipped: []
  final_artifacts:
    - findings: {N}
    - verdict: {APPROVE | FINDINGS}
```

## HALT CONDITIONS

- `worktree_path` not accessible → HALT
- `linear_issue` / tracker_issue artifact missing in TEAMMATE_MODE → HALT (TAC-28)
- Any sub-axis cannot be evaluated due to missing knowledge → HALT (do NOT fabricate verdicts)
