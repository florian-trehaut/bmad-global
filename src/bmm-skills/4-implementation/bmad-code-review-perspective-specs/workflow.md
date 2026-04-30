# Single-Perspective Code Review — Specs Compliance & Contract Integrity (Meta-1)

**Purpose:** Execute a single-perspective code review covering Meta-1 (Specs Compliance, API Contract & Backward Compat, Decision Documentation, Documentation Coherence) as a standalone workflow. Does not use the `Agent()` tool — designed for invocation as an Agent Teams teammate (where `Agent()` is removed at spawn time per Anthropic platform contract) or for focused single-perspective reviews.

**Relationship to bmad-code-review:** This subskill is the **single-perspective companion** of `bmad-code-review` Meta-1. The full `bmad-code-review` skill spawns 5–7 metas in parallel via `Agent()` (preserved for standalone invocation per VM-NR-4 of story `auto-flow-orchestrator`). This subskill executes the SAME Meta-1 logic but inline (no Agent() call), making it usable inside teammate contexts.

**Spec reference:** Story `auto-flow-orchestrator` Task D3 (refactor) — see also `BAC-12`, `TAC-9`, Risk-4.

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

### 3. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`. The expected calling context is TEAMMATE_MODE=true with `task_contract.role = 'code-reviewer-specs'`. Standalone invocation is also supported (TEAMMATE_MODE=false).

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false → HALT (D16 strict applies; orchestrator-spawned only).

### 4. Resolve review contract

The review contract is the input to the Meta-1 logic. Source depends on mode:

- **TEAMMATE_MODE=true**: read from `task_contract`:
  - `worktree_path` from `task_contract.constraints.worktree_path` (required, HALT if null)
  - `mr_target_branch` from `task_contract.input_artifacts[type=diff].target_branch`
  - `linear_issue` (or equivalent tracker issue) from `task_contract.input_artifacts[type=tracker_issue]`
  - `changed_files` from `task_contract.scope_files`
  - `diff_stats` from `task_contract.input_artifacts[type=diff].stats`
  - `active_sub_axes` defaults to `['1a', '1b', '1c', '1d']` (all sub-axes); subset allowed via `task_contract.metadata.active_sub_axes`
  - `project_adrs` from project ADRs loaded by step-01 of `bmad-code-review` (or empty array if not loaded)

- **TEAMMATE_MODE=false** (standalone): the caller MUST provide the same shape via the invocation arguments. If invoked via `/bmad-code-review-perspective-specs` slash command, prompt the user for `worktree_path`, `mr_target_branch`, and `mr_iid` (which is then expanded to the rest via `gh pr view` or equivalent forge CLI).

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

### Standalone mode (TEAMMATE_MODE=false)

Emit the YAML findings report to stdout (or to a file at `_bmad-output/code-review-perspective-specs/{mr_iid}-{date}.yaml`). The user invokes `/bmad-code-review` (full skill) or aggregates manually if multiple perspectives are run.

### Teammate mode (TEAMMATE_MODE=true)

Emit a `phase_complete` SendMessage per `teammate-mode-routing.md` §D with:

```yaml
type: phase_complete
task_id: '{TASK_ID}'
parent_phase: 'code-review'
deliverable:
  format: 'yaml_report'
  artifacts: []
  summary: |
    Meta-1 (specs-compliance) review complete.
    {N} findings: {n_blocker} BLOCKER, {n_major} MAJOR, {n_minor} MINOR, {n_info} INFO.
verdict: '{APPROVE | FINDINGS}'
findings:
  - severity: '{BLOCKER | MAJOR | MINOR | INFO}'
    sub_axis: '{1a | 1b | 1c | 1d}'
    file_line: '{path:lineno}'
    description: '{finding text}'
    proposed_action: '{concrete action — never "decide X"}'
  # ... (one entry per finding)
```

The verdict is `APPROVE` if zero BLOCKER findings, `FINDINGS` otherwise.

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
