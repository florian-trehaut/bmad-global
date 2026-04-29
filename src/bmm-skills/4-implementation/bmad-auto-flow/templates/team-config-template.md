# {Skill Name} Team Configuration — Template

**Use this template when creating a new orchestrator skill that needs Agent Teams.** The template mirrors the structure of `bmad-auto-flow/team-workflows/team-config.md` (the first reference implementation in BMAD).

**Loaded by:** `team-router.md` during INITIALIZATION when the parent skill is invoked, AND by the parent skill's `step-04-team-create.md` (or equivalent) to build the `TeamCreate` payload.

**Reminder:** Adding a new orchestrator requires registration in `src/core-skills/bmad-shared/orchestrator-registry.md` (see that file's "How to Add a New Orchestrator Skill" section). Skills NOT in the registry MUST NOT set `metadata.orchestrator_invoked: true`.

---

## Team Identity

```yaml
team_name_template: '{skill-prefix}-{ISO_DATE}-{slug}'
team_description: '{one-line description of what this orchestrator does}'
```

---

## Roles

For each role this orchestrator may spawn, document:

### Role: `{role-key}`

| Field | Value |
|-------|-------|
| Persona | {description} |
| Count per phase | {N or formula} |
| Workflow invoked | {path to workflow.md} |
| Sub-axes / activation | {when this role activates} |
| Knowledge files | {project.md, domain.md, ...} |
| Read-only? | {YES/NO} |
| Tracker writes? | {NO — orchestrator-spawned must always defer} |
| Deliverable format | {yaml_report / markdown_document / tracker_update / knowledge_file} |

(Repeat for each role.)

---

## Team distribution

Specify `teammate_mode`: `'self-service'` (default) or `'assigned'`.

---

## Spawn template

Every spawn prompt for this orchestrator's teammates:

```yaml
task_contract:
  team_name: '{TEAM_NAME}'
  task_id: '{phase}-{role}-{N}'
  role: '{role-key}'

  scope_type: '...'
  scope_files: [...]
  scope_domain: '...'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'                # Validated TAC-28 (must be non-null)
      content: |
        {full content}

  deliverable:
    format: 'yaml_report'
    send_to: '{LEAD_NAME}'

  constraints:
    read_only: {true|false}
    worktree_path: '{WORKTREE_PATH}'
    tracker_writes: false                     # ALWAYS false for orchestrator-spawned tasks
    halt_conditions: [...]

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: '{your-skill-name}'   # MUST be in orchestrator-registry.md
    parent_phase: '{phase-key}'
```

---

## Consensus rules

| Phase | Consensus rule |
|-------|----------------|
| {phase-name} | {rule for combining N teammates' verdicts} |

---

## Fallback configuration

```yaml
fallback:
  mode: 'sequential-inline'   # When TEAM_MODE=false
  startup_banner: |
    ⚠️  TEAM_MODE=false — running phases sequentially inline.
    {orchestrator-specific guidance}
```

---

## Cross-references

- `~/.claude/skills/bmad-shared/orchestrator-registry.md` — register this skill before deployment
- `~/.claude/skills/bmad-shared/teammate-mode-routing.md`
- `~/.claude/skills/bmad-shared/task-contract-schema.md`
- `~/.claude/skills/bmad-shared/agent-teams-config-schema.md`
