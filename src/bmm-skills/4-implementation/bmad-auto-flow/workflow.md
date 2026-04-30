# Auto-Flow — Workflow (cross-workflow lifecycle orchestrator)

**BMAD orchestrator for the full story lifecycle.** Composes 5 sub-workflows (spec → review → dev → code-review → validation) into a single user-facing entry point. The orchestrator runs the spec phase inline (interactive with the user) and delegates the other 4 phases to isolated Agent Teams teammates for impartial review and context isolation.

**This is the FIRST registered orchestrator skill** authorized to override Decision D16 of `spec-agent-teams-integration.md` (per `src/core-skills/bmad-shared/teams/orchestrator-registry.md`).

**Use when:** the user wants to run a full BMAD story lifecycle without manually invoking each phase. The orchestrator handles tracker transitions, question routing, phase failures, and worktree lifecycle.

**Pre-conditions:**
- `agent_teams.enabled: true` in `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (TEAM_MODE=true). If absent → fallback path (TAC-12 sequential inline) with startup banner warning per BAC-9.
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` env flag (Anthropic research preview).

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. HALT if missing.

Extract: `PROJECT_NAME`, `ISSUE_PREFIX`, `TRACKER`, `TRACKER_STATES`, `FORGE`, `FORGE_CLI`, `WORKTREE_PREFIX`, `WORKTREE_TEMPLATE_DEV`, `BRANCH_TEMPLATE`, `INSTALL_COMMAND`, `BUILD_COMMAND`, `TEST_COMMAND`, `LINT_COMMAND`, `QUALITY_GATE`, `COMMUNICATION_LANGUAGE`, `USER_NAME`, `agent_teams` block (entire YAML block).

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Key rules:
- `no-fallback-no-false-data.md` — Zero Fallback / Zero False Data
- `workflow-adherence.md` — NO-SKIP discipline + CHK-STEP receipts
- `team-router.md` — TEAM_MODE detection
- `spawn-protocol.md` — building spawn prompts for teammates
- `task-contract-schema.md` — task contract YAML schema (with new `metadata.{orchestrator_invoked, orchestrator_skill, parent_phase}` block)
- `agent-teams-config-schema.md` — agent_teams YAML schema
- `orchestrator-registry.md` — closed list of authorized orchestrators (`bmad-auto-flow` is here)
- `teammate-mode-routing.md` — teammate-side detection + interactivity rerouting (consumed by spawned teammates, not by this orchestrator)
- `worktree-lifecycle.md` — worktree protocol with new Branch D (provided path mode) consumed by teammates
- `boundaries-rule.md`, `validation-verdict-protocol.md`

### 3. Load project knowledge (REQUIRED)

Apply `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`. HALT if missing.
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md`. HALT if missing (orchestrator may invoke create-story which needs domain context).
- Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md`. HALT if missing.

### 4. Detect TEAM_MODE

Apply `~/.claude/skills/bmad-shared/teams/team-router.md`. This sets:

- `TEAM_MODE` (boolean — Agent Teams tools available + project config enabled)
- `MAX_TEAMMATES`, `TEAMMATE_MODE` (self-service vs assigned)
- `KNOWLEDGE_MAPPING`, `GLOBAL_KNOWLEDGE`

Validate orchestrator-specific fields from `agent_teams` block:
- `dev_team_size` (default 1, must be in `[1, max_teammates]`) — TAC-26
- `code_review_team_size` (default 3, must be in `[1, max_teammates]`) — BAC-12
- `phase_timeout_minutes` (default 30, must be positive) — TAC-14
- `audit_log_enabled` (default false, must be boolean) — T-SEC-1

HALT on any validation failure citing the field and `agent_teams-config-schema.md`.

If TEAM_MODE=false → fallback path (BAC-9, TAC-12, TAC-21):
- Display the startup banner with `**TEAM_MODE=false — running phases sequentially inline in this lead's context.**`
- All 5 phases execute in the orchestrator's own context (no teammates, no SendMessage).
- The phase logic is the same — just inline instead of delegated.

### 5. Set defaults

- `FEATURE_DESCRIPTION = ""` (gathered in step-01)
- `SPEC_PROFILE = null` (chosen by user in step-01: `quick` or `full`)
- `ISSUE_ID = null` (created during spec phase)
- `WORKTREE_PATH = null` (created in step-02 if `worktree_enabled=true`)
- `TEAM_NAME = null` (set in step-04)
- `PHASE_RESULTS = {}` (one entry per phase)
- `QUESTION_BUFFER = []` (consumed by question-routing protocol — see `data/question-routing.md`)
- `MR_IID = null`, `MR_URL = null` (set in dev phase)

### 6. CHK-INIT — Initialization Read Receipt

```
CHK-INIT PASSED — bmad-auto-flow initialization complete:
  shared_rules_loaded: {N} files (must include teammate-mode-routing.md, orchestrator-registry.md, task-contract-schema.md, agent-teams-config-schema.md, worktree-lifecycle.md)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md (loaded)
    - api.md (loaded)
  team_mode: {true | false}
  max_teammates: {N}
  dev_team_size: {N} (clamped to [1, max_teammates])
  code_review_team_size: {N} (clamped to [1, max_teammates])
  phase_timeout_minutes: {N}
  audit_log_enabled: {true | false}
  worktree_enabled: {true | false}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
  fallback_active: {true if TEAM_MODE=false, else false}
```

---

## YOUR ROLE

You are the **lead orchestrator** of a 5-phase BMAD lifecycle. You:

1. **Greet the user** and gather the feature description (step-01).
2. **Set up a single shared worktree** if `worktree_enabled=true` (step-02).
3. **Run the spec phase INLINE** — interactive with the user, in your own context (step-03). The spec phase needs your context for the rest of the lifecycle (triaging review findings, answering teammate questions, etc.) so it stays in the lead.
4. **Create the team** with TeamCreate (step-04). The team config is in `team-workflows/team-config.md`.
5. **Spawn teammates** for phases 2-5 (review, dev, code-review, validation) per `task-contract-schema.md`. Each spawn prompt sets `metadata.orchestrator_invoked: true` and `metadata.orchestrator_skill: 'bmad-auto-flow'` (validated by teammates against `orchestrator-registry.md`).
6. **Route questions** from teammates to the user via batched AskUserQuestion (3 questions OR 30s OR URGENT tag — per `data/question-routing.md`).
7. **Handle phase failures** by presenting `[R]etry / [F]ix manually / [A]bandon` to the user.
8. **Apply tracker transitions** — you are the SOLE writer of the tracker during auto-flow execution per BAC-8.
9. **Clean up the team** with TeamDelete on workflow exit (success OR error path) per Guardrail 9.

**Tone:** factual, direct, no leniency. Report progress matter-of-factly. Surface phase verdicts verbatim from teammate reports.

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md.

---

## CRITICAL RULES

- **D16 OVERRIDE AUTHORIZATION** — this orchestrator is registered in `orchestrator-registry.md`. Spawn prompts MUST set `metadata.orchestrator_invoked: true` AND `metadata.orchestrator_skill: 'bmad-auto-flow'`. Teammates validate this via `teammate-mode-routing.md` and HALT if mismatched.
- **NEVER stop for "milestones"** — continue end-to-end until COMPLETE or HALT.
- **TRACKER WRITES ARE EXCLUSIVE** — only this orchestrator writes the tracker (BAC-8). Teammates emit `tracker_write_request` SendMessage — orchestrator processes them. Set `task_contract.constraints.tracker_writes: false` on every spawn.
- **WORKTREE PATH PROPAGATED** — all teammates receive the same `WORKTREE_PATH` via `task_contract.constraints.worktree_path` (consumed by `worktree-lifecycle.md` Branch D). Single shared worktree per BAC-6 / TAC-19.
- **QUESTION BATCHING** — flush buffer when N=3 OR T=30s OR URGENT tag (TAC-23). Single AskUserQuestion call per flush (TAC-24).
- **TEAMDELETE ON EXIT** — call TeamDelete in step-09-finalize on EVERY exit path (success, HALT, blocker). Guardrail 9.
- **PERMISSION INHERITANCE TRANSPARENCY** — startup banner displays the inherited permission mode before TeamCreate (TAC-29 / BAC-14).
- **PRE-SPAWN VALIDATION (TAC-28)** — before each TaskCreate, assert `task_contract.input_artifacts.tracker_issue.identifier` is non-null and well-formed. HALT if missing.
- **SERIALIZE SENDMESSAGE HANDLING (TAC-27)** — single-threaded message queue, processed in arrival order. See `data/question-routing.md` §Ordering.

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-entry.md` | Greet user, gather feature description, choose spec profile (quick / full), display permission-mode banner (TAC-29) |
| 2 | `step-02-worktree-setup.md` | Create single shared worktree IF `worktree_enabled=true` (BAC-6) — else skip (BAC-7) |
| 3 | `step-03-spec-phase.md` | Run spec INLINE — invoke `bmad-create-story` (full) or `bmad-quick-spec` (quick) in this context |
| 4 | `step-04-team-create.md` | TeamCreate with config from `team-workflows/team-config.md` (skipped if TEAM_MODE=false) |
| 5 | `step-05-review-phase.md` | Spawn 1 spec-reviewer teammate; await `phase_complete`; transition tracker → reviewed |
| 6 | `step-06-dev-phase.md` | Spawn N=`dev_team_size` dev teammates (default 1); workflow choice based on SPEC_PROFILE (BAC-13); await `phase_complete`; transition tracker → review |
| 7 | `step-07-code-review-phase.md` | Spawn N=`code_review_team_size` distinct single-perspective teammates (BAC-12 / TAC-9); collect findings; transition tracker → ready-for-merge |
| 8 | `step-08-validation-phase.md` | Spawn 1 validator teammate; await PASS/FAIL; transition tracker → done (PASS) or → in-progress (FAIL with menu) |
| 9 | `step-09-finalize.md` | TeamDelete (always); cleanup; final user report |

Each step file has its own `nextStepFile` frontmatter for sequential enforcement.

---

## SUBAGENT WORKFLOWS

This orchestrator does NOT use `Agent()` (subagent dispatch). It uses Agent Teams (`TeamCreate`, `TaskCreate`, `SendMessage`). For TEAM_MODE=false fallback, all phase logic runs inline in the lead's context — no subagent dispatch in any path.

---

## ENTRY POINT

After CHK-INIT is emitted, **Read FULLY and apply**: `./steps/step-01-entry.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

---

## HALT CONDITIONS (GLOBAL)

- Required knowledge file missing → HALT
- TEAM_MODE=true but `agent_teams` config validation fails → HALT
- A teammate emits `blocker` SendMessage and the user chooses [A]bandon → HALT (cleanup via step-09)
- Phase timeout > `phase_timeout_minutes` and user chooses [A]bandon → HALT
- TeamCreate fails → HALT (cannot proceed without team)
- Mid-flow, the orchestrator detects its own ID is no longer in `orchestrator-registry.md` → HALT (auto-detection guard)

---

## WORKFLOW EXIT

After step-09-finalize, emit:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-auto-flow executed end-to-end:
  steps_executed: [01, 02, 03, 04, 05, 06, 07, 08, 09]   ← OR partial list ending in 09 if HALT happened
  steps_skipped: []                                       ← OR list with citation if applicable
  final_artifacts:
    - issue: {ISSUE_ID}
    - mr: {MR_URL or "n/a"}
    - tracker_status: {final_status}
    - phase_results: {PHASE_RESULTS summary}
```

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After step-09 emits, read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`. Conditional — only activates if difficulties were encountered.
