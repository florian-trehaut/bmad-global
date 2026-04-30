# Auto-Flow Team Configuration

**This is the FIRST `team-workflows/team-config.md` implementation in BMAD.** It serves as the reference for future migrations of other workflows.

**Loaded by:** `team-router.md` during INITIALIZATION when this skill is invoked, AND by `step-04-team-create.md` to build the `TeamCreate` payload.

---

## Team Identity

```yaml
team_name_template: 'auto-flow-{ISO_DATE}-{slug}'   # Substituted at TeamCreate time
team_description: 'BMAD cross-workflow lifecycle orchestration — spec → review → dev → code-review → validation'
```

---

## Roles

The orchestrator may spawn teammates with these roles. Each role has a persona, knowledge mapping (via `agent_teams.knowledge_mapping` in workflow-context.md), and a task contract template.

### Role: `spec-reviewer` (BAC-3, TAC-7)

| Field | Value |
|-------|-------|
| Persona | Adversarial spec reviewer (mirrors `bmad-review-story` persona) |
| Count per phase | Exactly 1 |
| Workflow invoked | `bmad-review-story/workflow.md` |
| Sub-axes | All (the full review-story workflow) |
| Knowledge files | Per `knowledge_mapping.spec-reviewer` in workflow-context.md (project.md, domain.md) |
| Read-only? | YES (`task_contract.constraints.read_only: true`) |
| Tracker writes? | NO (`task_contract.constraints.tracker_writes: false`) |
| Deliverable format | `yaml_report` with verdict APPROVE / FINDINGS |

### Role: `dev` (BAC-11, TAC-8, TAC-26)

| Field | Value |
|-------|-------|
| Persona | Developer (mirrors `bmad-dev-story` or `bmad-quick-dev` persona) |
| Count per phase | `agent_teams.dev_team_size` (default 1, clamped to `[1, max_teammates]`) |
| Workflow invoked | If `SPEC_PROFILE == 'quick'` → `bmad-quick-dev/workflow.md` ; else (`SPEC_PROFILE == 'full'`) → `bmad-dev-story/workflow.md` |
| Knowledge files | Per `knowledge_mapping.dev` (project.md, api.md) |
| Read-only? | NO (`constraints.read_only: false` — writes code) |
| Tracker writes? | NO (`constraints.tracker_writes: false`) |
| Deliverable format | `yaml_report` with `commit_id`, `mr_url`, `test_results` |

### Role: `code-reviewer-{perspective}` (BAC-12, TAC-9)

The code-review phase spawns **N distinct single-perspective teammates** — each with a specific perspective key. The Agent tool is removed from teammates per Anthropic platform contract (per `code.claude.com/docs/en/agent-teams` Limitations + GitHub Issue #32731), so each teammate executes ONE extracted meta-perspective subskill inline (NOT `bmad-code-review/workflow.md`).

| Sub-role | Workflow invoked | Activation |
|----------|------------------|-----------|
| `code-reviewer-specs` | `bmad-code-review-perspective-specs/workflow.md` | Always (Meta-1) |
| `code-reviewer-correctness` | `bmad-code-review-perspective-correctness/workflow.md` | Always (Meta-2) |
| `code-reviewer-security` | `bmad-code-review-perspective-security/workflow.md` | Always (Meta-3) — security-voting handled by spawning 2 instances if `code_review_team_size >= 4` |
| `code-reviewer-engineering-quality` | `bmad-code-review-perspective-engineering-quality/workflow.md` | Always (Meta-4) |
| `code-reviewer-operations` | `bmad-code-review-perspective-operations/workflow.md` | Conditional (Meta-5) — activated when diff contains operational changes |
| `code-reviewer-user-facing` | `bmad-code-review-perspective-user-facing/workflow.md` | Conditional (Meta-6) — activated when diff contains user-facing changes |

| Field | Value |
|-------|-------|
| Count per phase | `agent_teams.code_review_team_size` (default 3, clamped to `[1, max_teammates]`). Default selection: specs + correctness + security. If `code_review_team_size > 3`, add engineering-quality, then operations (if active), then user-facing (if active), then a second security teammate (S1+S2 voting). |
| Knowledge files | Per `knowledge_mapping.code-reviewer-{perspective}` |
| Read-only? | YES (`constraints.read_only: true`) |
| Tracker writes? | NO (`constraints.tracker_writes: false`) |
| Deliverable format | `yaml_report` with verdict APPROVE / FINDINGS, findings tagged `meta: N` |

### Role: `validator` (BAC-3, TAC-10)

| Field | Value |
|-------|-------|
| Persona | Exacting Product Owner (mirrors `bmad-validation-metier`/`-frontend`/`-desktop` persona) |
| Count per phase | Exactly 1 |
| Workflow invoked | `bmad-validation-metier/workflow.md` (default), `bmad-validation-frontend/workflow.md` if frontend type, `bmad-validation-desktop/workflow.md` if desktop type. Type detected from spec or asked at orchestrator step-08. |
| Knowledge files | Per `knowledge_mapping.validator` |
| Read-only? | YES (validation never writes code) |
| Tracker writes? | NO (`constraints.tracker_writes: false`) |
| Deliverable format | `yaml_report` with verdict PASS / FAIL, per-VM verdicts |

---

## Team distribution

`teammate_mode: 'self-service'` (default — teammates claim tasks from the pool). Tasks are pre-tagged with the role, and only teammates with the matching role claim them.

If `teammate_mode: 'assigned'` is configured in workflow-context.md, the orchestrator assigns tasks at TaskCreate time using the task_id field as the binding key.

---

## Spawn template

Every teammate spawn prompt follows `~/.claude/skills/bmad-shared/teams/spawn-protocol.md` with these orchestrator-specific additions:

```yaml
task_contract:
  team_name: '{TEAM_NAME}'
  task_id: '{phase}-{role}-{N}'
  role: '{role-key from above}'

  scope_type: 'review' | 'investigation' | 'generation' | 'validation'
  scope_files: [...]
  scope_domain: '{phase-specific scope}'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'                # MUST be non-null (TAC-28)
      content: |
        {full spec content from step-03}
    # Plus phase-specific artifacts (diff, document, etc.)

  deliverable:
    format: 'yaml_report'
    send_to: '{LEAD_NAME}'                    # the orchestrator's lead identifier

  constraints:
    read_only: {true|false per role above}
    worktree_path: '{WORKTREE_PATH}'          # single shared, set in step-02
    tracker_writes: false                     # ALWAYS false for orchestrator-spawned tasks
    halt_conditions: [...]

  metadata:
    orchestrator_invoked: true                # D16 override flag
    orchestrator_skill: 'bmad-auto-flow'      # validated against orchestrator-registry.md
    parent_phase: '{spec|review|dev|code-review|validation}'
```

---

## Consensus rules

| Phase | Consensus rule |
|-------|----------------|
| review | Single teammate — verdict is its own |
| dev | Single teammate (default 1) — verdict is its own. If `dev_team_size > 1`, the orchestrator coordinates merge of independent dev work (advanced — currently OOS for v1.0) |
| code-review | Aggregate findings from N teammates. Overall verdict = APPROVE if 0 BLOCKERs across all teammates, else FINDINGS. Security perspective uses S1+S2 voting if 2 security teammates spawned (`code_review_team_size >= 4`). |
| validation | Single teammate — verdict is its own |

---

## Fallback configuration

```yaml
fallback:
  mode: 'sequential-inline'   # When TEAM_MODE=false (BAC-9, TAC-12)
  startup_banner: |
    ⚠️  TEAM_MODE=false — running phases sequentially inline in this lead's context.
    Phases 2-5 (review, dev, code-review, validation) will execute one after another in YOUR session, not in isolated teammates.
    Question routing is direct (no batching). Tracker writes are direct (no SendMessage).
    To enable team mode: set `agent_teams.enabled: true` in workflow-context.md and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1.
```

---

## Cross-references

- `~/.claude/skills/bmad-shared/teams/orchestrator-registry.md` — registry where `bmad-auto-flow` is the only authorized orchestrator
- `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md` — teammate-side detection and rerouting protocol
- `~/.claude/skills/bmad-shared/teams/task-contract-schema.md` — task contract schema with `metadata` block
- `~/.claude/skills/bmad-shared/teams/agent-teams-config-schema.md` — `agent_teams` configuration schema
- `data/question-routing.md` — orchestrator-side question batching protocol
- `templates/team-config-template.md` — empty template for future orchestrator skills to mimic this pattern
