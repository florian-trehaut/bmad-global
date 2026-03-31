# Team Router — Shared Initialization Step

**Loaded by:** Any bmad-\* workflow.md during INITIALIZATION to detect Agent Teams availability and configure team mode.

---

## Purpose

Centralized detection of Agent Teams capability. Workflows load this file once during initialization. The result (`TEAM_MODE`) is consumed by individual steps to branch between parallel team execution and sequential inline/subagent execution.

This is a **shared utility** — like `no-fallback-no-false-data.md`, it is loaded at initialization time, not as a numbered step in the workflow sequence.

---

## Detection Sequence

Execute these checks in order. Stop at the first failure.

### 1. Check Tool Availability

Verify that Agent Teams tools are available in the current Claude Code session:

- `TeamCreate` tool is accessible
- `TaskCreate` tool is accessible
- `SendMessage` tool is accessible

If ANY tool is unavailable → set `TEAM_MODE = false`, skip remaining checks.

**Note:** Tool availability depends on the environment flag `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. The router does not check the flag directly — it checks for tool presence, which is the observable effect.

### 2. Check Workflow Configuration

Does the current skill have a team configuration?

```
Check: {skill_root}/team-workflows/team-config.md exists?
```

If not found → set `TEAM_MODE = false`, skip remaining checks.

If found → load and parse `team-config.md`. Extract:
- `TEAM_ROLES`: role definitions (key, persona, count, constraints)
- `TEAM_DISTRIBUTION`: `self-service` or `assigned`
- `TEAM_CONSENSUS`: consensus rules (if defined)
- `TEAM_FALLBACK`: fallback configuration

### 3. Check Project Configuration

Does `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` have Agent Teams enabled?

```
Check: agent_teams.enabled == true in workflow-context.md YAML frontmatter?
```

If `agent_teams` key is absent → set `TEAM_MODE = false`.
If `agent_teams.enabled` is absent or `false` → set `TEAM_MODE = false`.

If enabled → extract:
- `MAX_TEAMMATES`: from `agent_teams.max_teammates` (default: 5)
- `TEAMMATE_MODE`: from `agent_teams.teammate_mode` (default: `self-service`)
- `KNOWLEDGE_MAPPING`: from `agent_teams.knowledge_mapping`
- `GLOBAL_KNOWLEDGE`: from `agent_teams.global_knowledge`

### 4. Set TEAM_MODE

If all checks pass → set `TEAM_MODE = true`.

---

## Exported Variables

| Variable | Type | Value when true | Value when false |
|----------|------|-----------------|------------------|
| `TEAM_MODE` | boolean | `true` | `false` |
| `TEAM_ROLES` | map | Parsed from team-config.md | empty |
| `TEAM_DISTRIBUTION` | string | From team-config.md | N/A |
| `TEAM_CONSENSUS` | map | From team-config.md (optional) | empty |
| `TEAM_FALLBACK` | map | From team-config.md | N/A |
| `MAX_TEAMMATES` | integer | From workflow-context.md | N/A |
| `TEAMMATE_MODE` | string | From workflow-context.md | N/A |
| `KNOWLEDGE_MAPPING` | map | From workflow-context.md | empty |
| `GLOBAL_KNOWLEDGE` | list | From workflow-context.md | empty |

---

## Usage in Workflows

### In workflow.md INITIALIZATION

Add this step after loading project context and shared rules:

```markdown
### N. Detect Agent Teams capability

Load and apply `~/.claude/skills/bmad-shared/team-router.md`.

This sets TEAM_MODE for the duration of the workflow. If TEAM_MODE is true,
team-config.md has been loaded and TEAM_ROLES are available for steps that
support parallel execution.
```

### In Step Files That Branch on TEAM_MODE

```markdown
<check if="TEAM_MODE == true">
  [Team execution path — spawn teammates per team-config.md]
  [Use spawn-protocol.md to build spawn prompts]
  [Use task-contract-schema.md for task definitions]
</check>

<check if="TEAM_MODE == false">
  [Fallback path — use TEAM_FALLBACK configuration]
  [If fallback.subagent_workflow exists → use existing subagent pattern]
  [If fallback.mode == 'sequential-inline' → execute tasks in main context]
</check>
```

---

## Fallback Guarantee

When `TEAM_MODE == false`, the workflow MUST still produce correct results using one of:

1. **Subagent fallback** — if `team-config.md` defines `fallback.subagent_workflow`, use the existing `subagent-workflows/` pattern
2. **Sequential inline** — if `fallback.mode == 'sequential-inline'`, the orchestrator executes all task contracts sequentially in its own context
3. **Existing behavior** — if no `team-workflows/` directory exists, the workflow runs exactly as it did before Agent Teams integration

Agent Teams is an **enhancement** for context isolation and parallelism. It is NEVER a hard requirement for any workflow to function correctly.

---

## Diagnostic Output

When the router completes, log the result:

```
TEAM_MODE = {true|false}
  Tool check: {pass|fail}
  Workflow config: {found|not found}
  Project config: {enabled|disabled|absent}
  {if true: Roles: {count}, Distribution: {mode}, Max teammates: {N}}
```

This log helps diagnose why team mode did or did not activate.
