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

  # Per-role knowledge files — loaded JIT by each teammate
  knowledge_mapping:
    specs-reviewer:
      - review-perspectives.md
      - stack.md
    security-reviewer:
      - review-perspectives.md
      - stack.md
    code-reviewer:
      - review-perspectives.md
      - stack.md
      - conventions.md
    investigator:
      - stack.md
      - infrastructure.md
    scanner:
      - stack.md
      - infrastructure.md
      - conventions.md

  # Knowledge files loaded by ALL teammates regardless of role
  global_knowledge:
    - stack.md
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
      - review-perspectives.md
      - stack.md
    qa-reviewer:
      - review-perspectives.md
      - stack.md
    architecture-reviewer:
      - review-perspectives.md
      - stack.md
      - infrastructure.md
    security-reviewer:
      - review-perspectives.md
      - stack.md

  global_knowledge:
    - stack.md
```

This configuration enables the colleague review mode in `bmad-code-review` step-06 to spawn 5 workers (3 review-workers + 2 security-reviewers) with role-appropriate knowledge files.

---

## Validation Rules

The team router validates this section during initialization:

1. If `agent_teams` key is absent → `TEAM_MODE = false` (no error)
2. If `enabled` is absent or `false` → `TEAM_MODE = false` (no error)
3. If `enabled` is `true` but `teammate_mode` has an invalid value → HALT with error
4. If `max_teammates` is present but not a positive integer → HALT with error
5. Knowledge files in `knowledge_mapping` and `global_knowledge` are validated at spawn time (missing files trigger the Knowledge Generation Mandate)
