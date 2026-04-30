# Agent Teams Configuration — workflow-context.md Schema

**Loaded by:** `team-router.md` during workflow initialization to detect and configure Agent Teams mode.

---

## Purpose

Documents the optional `agent_teams` YAML section that projects add to their `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` to enable Agent Teams features. This section is read by the team router during workflow initialization to determine whether team mode is available and how teammates should be configured.

Projects without this section default to `TEAM_MODE = false` — all workflows run in their existing single-session mode.

---

## YAML Schema

Add this section to `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` YAML frontmatter:

```yaml
# --- Agent Teams (OPTIONAL) ---
agent_teams:
  enabled: true                      # Master switch — false disables all team features
  teammate_mode: 'self-service'      # How tasks are claimed by teammates
  default_worker_model: 'sonnet'     # Model hint for worker teammates
  default_lead_model: 'opus'         # Model hint for lead/orchestrator
  max_teammates: 5                   # Maximum concurrent teammates per team

  # Orchestrator-specific sizing (consumed by bmad-auto-flow per BAC-11/BAC-12)
  dev_team_size: 1                   # NEW. Default: 1. Clamped to [1, max_teammates]. Number of dev teammates spawned at the dev phase.
  code_review_team_size: 3           # NEW. Default: 3. Clamped to [1, max_teammates]. Number of distinct single-perspective teammates spawned at the code-review phase.
  phase_timeout_minutes: 30          # NEW. Default: 30. Per-phase wall-clock timeout. Triggers TAC-14 unwanted-pattern handler if a teammate emits no SendMessage within this window.

  # Optional audit log (T-SEC-1, low priority)
  audit_log_enabled: false           # NEW. Default: false. When true, the orchestrator writes phase transitions and decisions to _bmad-output/auto-flow/{ISO-timestamp}-{slug}.log

  # Optional project-aware lifecycle gates (auto-flow phases 4-5)
  lifecycle_artifacts:               # NEW. Default: {} (all gates inactive — backward-compat).
                                     # Declarative block describing project-specific lifecycle gates that bmad-auto-flow consults during phases 4 (code-review) and 5 (validation).
                                     # When set, the orchestrator adapts its flow: creates PR before code-review, invokes ci_watch_skill, waits for staging deploy, etc.
    pr_required: false               # bool, default false. When true, bmad-auto-flow step-07-code-review-phase.md MUST create a PR/MR via the forge command from workflow-context.md.forge_mr_create BEFORE invoking TaskCreate for any code-review perspective teammate. HALT explicit on forge command failure (no silent fallback)
    staging_required: false          # bool, default false. When true, bmad-auto-flow step-08-validation-phase.md MUST verify staging deploy status (via deploy_watch_skill) BEFORE invoking TaskCreate for the validator teammate
    ci_watch_skill: null             # string, optional, no default. Skill name (e.g. 'bmad-ci-watch' or 'ci-watch') invoked by step-07 to wait for CI green light. Resolution priority: explicit value > auto-discovered project-local skill (Glob {MAIN_PROJECT_ROOT}/.claude/skills/{ci-watch,*-ci-watch}/SKILL.md) > absent (skip gate gracefully)
    deploy_watch_skill: null         # string, optional, no default. Skill name invoked by step-08 to wait for staging deploy confirmation. Same resolution priority as ci_watch_skill

  # Per-role knowledge files — loaded JIT by each teammate
  # Values are filenames (not anchors) in .claude/workflow-knowledge/.
  # Since the consolidation, the only files are project.md, domain.md, api.md.
  # Per-role specialization happens via the H2 anchors mentioned in spawn prompts.
  knowledge_mapping:
    specs-reviewer:
      - project.md          # #review-perspectives, #conventions
      - domain.md           # ubiquitous language for spec validation
    security-reviewer:
      - project.md          # #review-perspectives, #investigation-checklist
      - api.md              # auth, surface area
    code-reviewer:
      - project.md          # #conventions, #review-perspectives, #tech-stack
    investigator:
      - project.md          # #investigation-checklist, #infrastructure
    scanner:
      - project.md          # #tech-stack, #conventions
    # Roles for bmad-auto-flow (per BAC-3, BAC-11, BAC-12, BAC-13)
    spec-reviewer:
      - project.md
      - domain.md
    dev:
      - project.md
      - api.md
    validator:
      - project.md
    # Per-perspective code review roles (single-perspective teammates per BAC-12 / TAC-9)
    code-reviewer-specs:
      - project.md
    code-reviewer-correctness:
      - project.md
    code-reviewer-security:
      - project.md
      - api.md
    code-reviewer-engineering-quality:
      - project.md
    code-reviewer-operations:
      - project.md
    code-reviewer-user-facing:
      - project.md

  # Knowledge files loaded by ALL teammates regardless of role
  global_knowledge:
    - project.md
```

---

## Field Definitions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | boolean | YES | `false` | Master switch. Must be `true` for any team feature to activate |
| `teammate_mode` | enum | NO | `self-service` | `self-service`: teammates claim tasks from pool. `assigned`: lead assigns tasks explicitly |
| `default_worker_model` | string | NO | `sonnet` | Model suggestion for worker teammates. Informational — Claude Code may override |
| `default_lead_model` | string | NO | `opus` | Model suggestion for lead/orchestrator |
| `max_teammates` | integer | NO | `5` | Upper bound on concurrent teammates. Prevents runaway token usage |
| `dev_team_size` | integer | NO | `1` | Number of dev teammates spawned at the dev phase by `bmad-auto-flow`. Clamped to `[1, max_teammates]`. Validated at orchestrator startup (TAC-26) |
| `code_review_team_size` | integer | NO | `3` | Number of distinct single-perspective teammates spawned at the code-review phase. Clamped to `[1, max_teammates]`. Each teammate executes ONE extracted meta-perspective subskill (per BAC-12 / TAC-9) |
| `phase_timeout_minutes` | integer | NO | `30` | Per-phase wall-clock timeout. If no SendMessage from any teammate of the current phase arrives within this window, the orchestrator triggers TAC-14 (`[R]etry / [N]udge / [A]bandon`). Must be a positive integer |
| `audit_log_enabled` | boolean | NO | `false` | Optional. When `true`, the orchestrator writes phase transitions and decisions to `_bmad-output/auto-flow/{ISO-timestamp}-{slug}.log`. T-SEC-1 remediation, low priority |
| `lifecycle_artifacts` | map | NO | `{}` | Optional declarative block describing project-aware lifecycle gates consumed by `bmad-auto-flow` phases 4-5. Defaults preserve current behavior (all gates inactive). See sub-fields below |
| `lifecycle_artifacts.pr_required` | boolean | NO | `false` | When `true`, `step-07-code-review-phase.md` MUST create the PR/MR via `workflow-context.md.forge_mr_create` BEFORE TaskCreate for any code-review perspective teammate. HALT explicit on forge failure (no silent fallback) |
| `lifecycle_artifacts.staging_required` | boolean | NO | `false` | When `true`, `step-08-validation-phase.md` MUST verify staging deploy status via `deploy_watch_skill` BEFORE TaskCreate for the validator teammate |
| `lifecycle_artifacts.ci_watch_skill` | string | NO | `null` | Optional skill name. When set, `step-07-code-review-phase.md` invokes this skill to wait for CI green light. Resolution priority: explicit value > auto-discovered project-local skill (Glob `{MAIN_PROJECT_ROOT}/.claude/skills/{ci-watch,*-ci-watch}/SKILL.md`) > absent (skip gate gracefully) |
| `lifecycle_artifacts.deploy_watch_skill` | string | NO | `null` | Optional skill name. When set, `step-08-validation-phase.md` invokes this skill to wait for staging deploy confirmation. Same resolution priority as `ci_watch_skill` |
| `knowledge_mapping` | map | NO | `{}` | Role key → list of knowledge filenames in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` |
| `global_knowledge` | list | NO | `[]` | Knowledge files loaded by every teammate regardless of role |

### teammate_mode Values

| Mode | Behavior | When to Use |
|------|----------|-------------|
| `self-service` | Teammates call TaskList, find unclaimed tasks, claim and execute | Default. Good for homogeneous workers (multiple reviewers) |
| `assigned` | Lead assigns specific tasks to specific teammates at spawn time | Use when roles are heterogeneous and task routing matters |

### knowledge_mapping Keys

Knowledge mapping keys are **role identifiers** — they must match the `role` field in task contracts and the role keys in `team-config.md`. The values are filenames (not full paths) relative to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`.

Individual workflows can override the project-level mapping in their `team-workflows/team-config.md` by specifying `knowledge_files` per role.

Priority order (highest wins):
1. Role-specific `knowledge_files` in `team-config.md`
2. Role-specific entry in `knowledge_mapping`
3. `global_knowledge` (always loaded)

---

## Integration Points

| Consumer | Reads | Purpose |
|----------|-------|---------|
| `team-router.md` | `enabled`, `teammate_mode`, `max_teammates` | Determine TEAM_MODE and team configuration |
| `spawn-protocol.md` | `knowledge_mapping`, `global_knowledge`, `default_worker_model` | Build teammate spawn prompts with correct knowledge |
| `team-config.md` (per-skill) | References role keys from `knowledge_mapping` | Skill-specific team definitions |
| `knowledge-schema.md` | (read by spawn-protocol when resolving anchors) | Defines valid section IDs the teammate may reference |
| `protocols/*.md` | (loaded JIT by teammate) | Indirection layer for tracker CRUD, tech-stack lookups, etc. — teammates use protocols instead of direct anchor refs |

---

## Example: bmad-code-review Project Configuration

```yaml
agent_teams:
  enabled: true
  teammate_mode: 'self-service'
  default_worker_model: 'sonnet'
  default_lead_model: 'opus'
  max_teammates: 5

  knowledge_mapping:
    specs-reviewer:
      - project.md          # #review-perspectives, #conventions
      - domain.md
    qa-reviewer:
      - project.md          # #review-perspectives, #test-rules, #validation-tooling
    architecture-reviewer:
      - project.md          # #review-perspectives, #infrastructure, #architecture-patterns
      - api.md
    security-reviewer:
      - project.md          # #review-perspectives, #investigation-checklist
      - api.md

  global_knowledge:
    - project.md
```

This configuration enables the colleague review mode in `bmad-code-review` step-06 to spawn 5 workers (3 review-workers + 2 security-reviewers) with role-appropriate knowledge files.

---

## Validation Rules

The team router validates this section during initialization:

1. If `agent_teams` key is absent → `TEAM_MODE = false` (no error)
2. If `enabled` is absent or `false` → `TEAM_MODE = false` (no error)
3. If `enabled` is `true` but `teammate_mode` has an invalid value → HALT with error
4. If `max_teammates` is present but not a positive integer → HALT with error
5. If `dev_team_size` is present but not in `[1, max_teammates]` → HALT with error citing both fields
6. If `code_review_team_size` is present but not in `[1, max_teammates]` → HALT with error
7. If `phase_timeout_minutes` is present but not a positive integer → HALT with error
8. If `audit_log_enabled` is present but not boolean → HALT with error
9. If `lifecycle_artifacts.pr_required` is present but not boolean → HALT with error
10. If `lifecycle_artifacts.staging_required` is present but not boolean → HALT with error
11. If `lifecycle_artifacts.ci_watch_skill` is present but not a string → HALT with error
12. If `lifecycle_artifacts.deploy_watch_skill` is present but not a string → HALT with error
13. Knowledge files in `knowledge_mapping` and `global_knowledge` are validated at spawn time (missing files trigger the Knowledge Generation Mandate)

Validations 5–12 are performed by `bmad-auto-flow` during its `step-01-entry` (orchestrator-specific fields, not used by other workflows).
