# Task Contract Schema — Shared Definition

**Loaded by:** Any bmad-\* workflow step that creates tasks for Agent Teams teammates.

---

## Purpose

This schema generalizes the `review_contract` pattern from `bmad-code-review` into a universal task contract for Agent Teams. Every task assigned to a teammate MUST include a contract following this schema, embedded as YAML in the task description.

The contract is the teammate's **sole source of truth** — it defines what to do, what to read, what to produce, and what constraints to respect.

---

## Contract YAML Schema

```yaml
task_contract:
  # ── Identity (REQUIRED) ──────────────────────────────────────
  team_name: '{team-name}'           # Must match TeamCreate name
  task_id: '{unique-id}'             # Unique within team (e.g., 'A', 'B', 'S1')
  role: '{role-key}'                 # Matches a role from team-config.md

  # ── Workflow Selection (CONDITIONAL) ─────────────────────────
  workflow_to_invoke: '{path/to/workflow.md or step file}'  # NEW. REQUIRED when the teammate must execute a nominated workflow integrally.
                                     # The teammate MUST execute this workflow per teammate-mode-routing.md §Required Workflow Application —
                                     # Read workflow.md AND each step file, emit CHK-INIT + CHK-STEP-NN-ENTRY/EXIT receipts, emit phase_complete only after full execution.
                                     # When omitted, the teammate executes the workflow inferred from `metadata.parent_phase` per orchestrator-registry mapping.

  # ── Scope (REQUIRED) ─────────────────────────────────────────
  scope_type: 'review'               # review | investigation | generation | planning | validation
  scope_files:                       # File paths to work on (REQUIRED for review/investigation)
    - 'path/to/file.ts'
  scope_domain: '{description}'      # Human-readable domain/bounded context

  # ── Input Artifacts (at least one REQUIRED) ──────────────────
  input_artifacts:
    - type: 'tracker_issue'          # tracker_issue | diff | document | custom
      identifier: '{ISSUE_ID}'
      content: |
        {issue description with acceptance criteria}

    - type: 'diff'
      worktree_path: '{path}'
      target_branch: '{branch}'
      stats: '+142/-38 across 8 files'

    - type: 'document'
      path: '{path to artifact}'
      format: 'markdown'

    - type: 'custom'
      data: {free-form YAML for skill-specific inputs}

  # ── Deliverable (REQUIRED) ───────────────────────────────────
  deliverable:
    format: 'yaml_report'            # yaml_report | markdown_document | tracker_update | knowledge_file
    template: '{path}'               # Path to output template (optional)
    send_to: '{lead_name}'           # Recipient for SendMessage

  # ── Constraints (OPTIONAL) ───────────────────────────────────
  constraints:
    read_only: true                  # true | false (default: true)
    worktree_path: '{path}'          # If working in a worktree (consumed by worktree-lifecycle.md Branch D)
    tracker_writes: false            # NEW. true | false. Default: false in TEAMMATE_MODE, true otherwise.
                                     # When false, the teammate emits tracker_write_request via SendMessage instead of writing the tracker directly.
                                     # See teammate-mode-routing.md §B.
    autonomy_policy: 'strict'        # NEW. enum: spec-driven | strict. Default: strict (backward-compat = current behavior pre-impl).
                                     # When spec-driven, the teammate auto-acknowledges decisions that verbatim-match the spec, auto-resolves TACTICAL items
                                     # from spec patterns (Boundaries Always Do, Findings Rule 8 fix-MINOR, format choices), and HALTs on STRUCTURAL
                                     # divergence/absence (arch decisions, ADR gap, plan-shape divergence, missing spec section, drift, dependency add,
                                     # migration files, major-version bump). See teammate-mode-routing.md §Autonomy policy enforcement.
    trace_path: '/tmp/bmad-{project_slug}-auto-flow/{RUN_ID}/{role}-{task_id}.md'  # NEW. Absolute path the teammate writes detailed work to before phase_complete.
                                     # Default templated path; project_slug = lowercase(project_name).replace(non-alphanumeric, '-'); RUN_ID = {ISO-timestamp}-{slug}.
                                     # See teammate-mode-routing.md §Trace work to disk.

    # ── Auto-flow-unification additive fields (M18-M20) ───────────
    worktree_branch_name: '{git-branch-name}'  # NEW. string | null. Default: derives from current_branch in worktree at spawn time.
                                     # Type: git branch name. Validation: matches `[a-zA-Z0-9/_.-]+`.
                                     # Backward-compat: optional — existing contracts without this field continue to work (defaulted at runtime).
                                     # Read by: worktree-lifecycle.md Branch D alignment check (orchestrator vs teammate worktree branch consistency).
                                     # Written by: orchestrator at spawn time (set explicitly when worktree branch != current_branch).

    operating_rules:                 # NEW. list[string]. Default for read-only investigators:
                                     #   ['~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md',
                                     #    '~/.claude/skills/bmad-shared/teams/task-contract-schema.md']
                                     # Type: list of ABSOLUTE paths (or `~/.claude/skills/...` resolved paths).
                                     # Loaded BEFORE workflow's INIT block — sets the runtime-behavior context.
                                     # Distinct from `scope_files` (investigation targets) — this list is operating rules, not work targets.
                                     # Mitigates the over-prescription pattern documented in `feedback_spawn_prompt_scope_discipline.md`.
                                     # Validation: each path MUST resolve to an existing file under `~/.claude/skills/bmad-shared/`.
                                     # Backward-compat: optional with safe default — existing contracts work.
      - '~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md'
      - '~/.claude/skills/bmad-shared/teams/task-contract-schema.md'

    mode_override: 'standalone'      # NEW. enum: standalone | teammate | null. Default: null (auto-detect from task_contract YAML presence).
                                     # Type: enum string. Purpose: testing/debugging only — bypasses auto-detection of TEAMMATE_MODE.
                                     # Does NOT bypass authorization checks (ORCH_AUTHORIZED still validated separately per orchestrator-registry.md).
                                     # Validation: enum check (one of standalone | teammate | null).
                                     # Backward-compat: optional, null = current behavior.

    halt_conditions:                 # Conditions that must trigger a HALT
      - 'Missing required knowledge file after generation attempt'
      - 'Scope ambiguity that cannot be resolved from context'

  # ── Metadata (OPTIONAL — used for orchestrator-spawned tasks) ─
  metadata:
    orchestrator_invoked: true       # NEW. Boolean. Default: false.
                                     # When true, signals that the spawning skill is an orchestrator authorized to override Decision D16
                                     # of spec-agent-teams-integration.md (teammates may execute top-level workflows).
                                     # The teammate's INITIALIZATION (via teammate-mode-routing.md) validates this against orchestrator-registry.md.
    orchestrator_skill: 'bmad-auto-flow'  # NEW. String. REQUIRED when orchestrator_invoked=true.
                                          # Must match a skill listed in src/core-skills/bmad-shared/teams/orchestrator-registry.md.
                                          # Mismatch → HALT in INITIALIZATION (TAC-30).
    parent_phase: 'review'           # NEW. String. One of: spec | review | dev | code-review | validation.
                                     # The phase of the orchestrator that spawned this teammate. Used by the teammate to decide
                                     # which sub-workflow to invoke (e.g., review phase → bmad-review-story).
```

---

## Field Definitions

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `team_name` | YES | string | Must match an active TeamCreate team name |
| `task_id` | YES | string | Unique within the team. Used for dependency tracking |
| `role` | YES | string | Role key from `team-config.md`. Determines persona and knowledge |
| `scope_type` | YES | enum | Defines what kind of work the teammate performs |
| `scope_files` | conditional | list | REQUIRED for `review` and `investigation`. Optional otherwise |
| `scope_domain` | NO | string | Human-readable context for the work scope |
| `input_artifacts` | YES (≥1) | list | At least one artifact must be provided |
| `deliverable.format` | YES | enum | Determines output validation rules |
| `deliverable.send_to` | YES | string | Team lead name or recipient identifier |
| `constraints.read_only` | NO | boolean | Default `true`. Only set `false` for generation/planning tasks |
| `constraints.worktree_path` | NO | string | Path to isolated worktree if applicable. When non-null in TEAMMATE_MODE, consumed by `worktree-lifecycle.md` Branch D (provided path mode) |
| `constraints.tracker_writes` | NO | boolean | Default `false` in TEAMMATE_MODE, `true` otherwise. When `false`, the teammate MUST emit `tracker_write_request` SendMessage instead of writing the tracker directly. Enforces BAC-8 of story `auto-flow-orchestrator` |
| `constraints.autonomy_policy` | NO | enum | Default `strict`. Enum: `spec-driven` \| `strict`. When `spec-driven`, teammate auto-acknowledges spec-verbatim decisions, auto-resolves TACTICAL items from spec patterns, and HALTs (`SendMessage(question, critical_ambiguity: true)`) on STRUCTURAL divergence/absence. When `strict`, all decisions route to lead/user (current behavior pre-impl). See `teammate-mode-routing.md §Autonomy policy enforcement` |
| `constraints.trace_path` | NO | string | Default `/tmp/bmad-{project_slug}-auto-flow/{RUN_ID}/{role}-{task_id}.md`. Absolute path the teammate writes detailed work to before emitting `phase_complete`. `project_slug = lowercase(project_name).replace(non-alphanumeric, '-')`; `RUN_ID` set in orchestrator INIT. HALT if parent dir non-creatable (no silent fallback). See `teammate-mode-routing.md §Trace work to disk` |
| `workflow_to_invoke` | conditional | string | REQUIRED when teammate must execute a nominated workflow integrally. Path to `workflow.md` (or specific step file). Forces teammate to apply `teammate-mode-routing.md §Required Workflow Application` — Read all step files, emit CHK receipts, emit `phase_complete` only after `CHK-WORKFLOW-COMPLETE` |
| `constraints.halt_conditions` | NO | list | Skill-specific halt triggers beyond global HALT rules |
| `metadata.orchestrator_invoked` | NO | boolean | Default `false`. When `true`, signals the spawning skill is an authorized orchestrator that may override Decision D16. Validated against `orchestrator-registry.md` by `teammate-mode-routing.md` |
| `metadata.orchestrator_skill` | conditional | string | REQUIRED when `metadata.orchestrator_invoked=true`. Must match a skill name listed in `src/core-skills/bmad-shared/teams/orchestrator-registry.md`. Mismatch → HALT (TAC-30) |
| `metadata.parent_phase` | NO | enum | One of `spec` \| `review` \| `dev` \| `code-review` \| `validation`. Used by the teammate to determine which sub-workflow to invoke when the role is generic |
| `constraints.worktree_branch_name` | NO | string \| null | Default: derives from current_branch in worktree at spawn time. Validation: matches `[a-zA-Z0-9/_.-]+`. Read by `worktree-lifecycle.md` Branch D alignment check. Written by orchestrator at spawn time when worktree branch != current_branch. Backward-compat: optional (M18) |
| `constraints.operating_rules` | NO | list[string] | Default for read-only investigators: `['~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md', '~/.claude/skills/bmad-shared/teams/task-contract-schema.md']`. List of ABSOLUTE paths (or `~/.claude/skills/...` resolved paths) loaded BEFORE workflow INIT to set runtime-behavior context. **Distinct from `scope_files`** — operating rules are policy, not work targets. Mitigates over-prescription pattern from `feedback_spawn_prompt_scope_discipline.md`. Each path MUST resolve to an existing file under `~/.claude/skills/bmad-shared/`. Backward-compat: optional with safe default (M19) |
| `constraints.mode_override` | NO | enum \| null | Default: null (auto-detect from task_contract YAML presence). Enum: `standalone` \| `teammate` \| null. Testing/debugging only — bypasses auto-detection of TEAMMATE_MODE. **Does NOT bypass authorization checks** (ORCH_AUTHORIZED still validated separately per `orchestrator-registry.md`). Backward-compat: optional, null = current behavior (M20) |

### Scope Type Semantics

| Scope Type | Teammate Action | Typical Read-Only | Example |
|------------|----------------|-------------------|---------|
| `review` | Analyze artifacts, produce findings report | YES | Code review, spec review |
| `investigation` | Research a question, produce evidence report | YES | Bug investigation, data trace |
| `generation` | Produce a new artifact (document, code, knowledge) | NO | Knowledge file generation |
| `planning` | Analyze inputs, produce a plan or recommendation | YES | Architecture proposal |
| `validation` | Execute checks against criteria, produce pass/fail | YES | Readiness check, VM gate |

### Deliverable Format Semantics

| Format | Expected Output | Validation |
|--------|----------------|------------|
| `yaml_report` | Structured YAML with typed findings | Must contain required top-level keys per workflow |
| `markdown_document` | Markdown document for persistence | Must have title, sections, valid markdown |
| `tracker_update` | Status change + comment for tracker | Must contain issue identifier and state |
| `knowledge_file` | Markdown suitable for `workflow-knowledge/` | Must include YAML frontmatter with `generated` date |

---

## Example: Mapping from bmad-code-review

The existing `review_contract` in `bmad-code-review` step-06 maps to this schema as follows:

```yaml
# BEFORE (hardcoded in step-06)
review_contract:
  worktree_path: '{REVIEW_WORKTREE_PATH}'
  mr_target_branch: '{MR_TARGET_BRANCH}'
  mr_iid: 123
  group_id: 'A'
  perspectives: ['specs_compliance']
  linear_issue:
    identifier: 'PRJ-48'
    description: '...'
    acceptance_criteria: [...]
  changed_files: ['src/foo.ts']
  diff_stats: '+142/-38 across 8 files'

# AFTER (using task contract schema)
task_contract:
  team_name: 'review-123'
  task_id: 'A'
  role: 'specs-reviewer'

  scope_type: 'review'
  scope_files: ['src/foo.ts']
  scope_domain: 'Specs compliance review'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: 'PRJ-48'
      content: '...'
    - type: 'diff'
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      target_branch: '{MR_TARGET_BRANCH}'
      stats: '+142/-38 across 8 files'

  deliverable:
    format: 'yaml_report'
    send_to: '{lead_name}'

  constraints:
    read_only: true
    worktree_path: '{REVIEW_WORKTREE_PATH}'
```

---

## Validation Rules

A task contract is **invalid** if any of these conditions are true:

1. Missing any REQUIRED field (`team_name`, `task_id`, `role`, `scope_type`, `deliverable.format`, `deliverable.send_to`)
2. `scope_type` is `review` or `investigation` but `scope_files` is empty
3. `input_artifacts` is empty (no input provided)
4. `scope_type` value is not in the enum
5. `deliverable.format` value is not in the enum
6. `metadata.orchestrator_invoked` is `true` but `metadata.orchestrator_skill` is missing or empty (TAC-30)
7. `metadata.orchestrator_invoked` is `true` but `metadata.orchestrator_skill` is not listed in `src/core-skills/bmad-shared/teams/orchestrator-registry.md` (TAC-30)
8. `input_artifacts` contains a `tracker_issue` artifact whose `identifier` is null/missing/malformed (TAC-28)
9. `constraints.autonomy_policy` is set to a value outside the enum `spec-driven | strict` (TAC-4)
10. `constraints.trace_path` is set but its parent directory is non-creatable (permission denied, disk full, etc.) — HALT with `blocker` SendMessage citing the underlying error; never silently fall back to a different path (TAC-16)
11. `workflow_to_invoke` is non-empty but the path does not resolve to an existing `workflow.md` or step file readable by the teammate (per `teammate-mode-routing.md §Required Workflow Application`). **Validation timing (per Phase 7 code-review F-correctness-7)** : the lead validates at TaskCreate emission (resolves the path against `~/.claude/skills/` from the orchestrator's filesystem) AND the teammate re-validates at INIT (resolves the path against its own filesystem after spawn) — both checks required per defensive programming.
12. `constraints.worktree_branch_name` is set but does not match the regex `[a-zA-Z0-9/_.-]+` — HALT with offending value cited (M18 / TAC-11)
13. `constraints.operating_rules` contains a path that does not resolve to an existing file under `~/.claude/skills/bmad-shared/` — HALT with offending path cited (M19 / TAC-11)
14. `constraints.mode_override` is set to a value outside the enum `standalone | teammate | null` — HALT with offending value cited (M20 / TAC-11). Note: setting `mode_override` does NOT bypass `ORCH_AUTHORIZED` — the authorization check in `teammate-mode-routing.md §Detection step 2` still applies.

An invalid contract MUST cause the teammate to HALT immediately and report the validation failure to the lead via SendMessage. For violations 6–8, the HALT message MUST cite the registry path or the missing field per the `teammate-mode-routing.md` HALT messages section. For violations 9–14, the HALT message MUST cite the offending field and the schema rule (`task-contract-schema.md` §Validation Rules) and reference the relevant TAC.

---

## Anti-Deviation Rules

These rules apply to every teammate receiving a task contract:

- Execute ONLY the work described in the contract scope
- Read ONLY files listed in `scope_files` and `input_artifacts` (plus knowledge files from spawn protocol)
- Produce output ONLY in the format specified by `deliverable.format`
- Report ONLY to `deliverable.send_to`
- Respect `constraints.read_only` — if `true`, do NOT edit, fix, commit, or modify any file
- HALT on any condition listed in `constraints.halt_conditions`
- NEVER downgrade severity to avoid rejection
- NEVER skip scope items to finish faster
