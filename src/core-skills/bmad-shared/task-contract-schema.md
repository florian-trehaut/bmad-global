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
    worktree_path: '{path}'          # If working in a worktree
    halt_conditions:                 # Conditions that must trigger a HALT
      - 'Missing required knowledge file after generation attempt'
      - 'Scope ambiguity that cannot be resolved from context'
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
| `constraints.worktree_path` | NO | string | Path to isolated worktree if applicable |
| `constraints.halt_conditions` | NO | list | Skill-specific halt triggers beyond global HALT rules |

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

An invalid contract MUST cause the teammate to HALT immediately and report the validation failure to the lead via SendMessage.

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
