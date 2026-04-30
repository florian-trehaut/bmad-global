# Spawn Protocol — Teammate Prompt Template

**Loaded by:** Any bmad-\* workflow step that spawns Agent Teams teammates.

---

## Purpose

This template defines the structure of the prompt given to each teammate at spawn time. Since Claude Code Agent Teams teammates do NOT support custom `.claude/agents/` definitions, specialization happens exclusively through the spawn prompt. This template ensures all teammates receive consistent context while being specialized for their role.

---

## Spawn Prompt Structure

The spawn prompt is assembled from 5 sections. All sections are REQUIRED unless marked optional.

### Section 1: PERSONA

```markdown
## PERSONA

You are a **{ROLE_NAME}** teammate in team "{TEAM_NAME}".

{ROLE_PERSONA_CONTENT}
```

**Content source:**
- If the role has a `persona` field in `team-config.md` → embed that content
- If the role maps to a BMAD agent persona → embed the agent's SKILL.md body
- If neither → use a minimal role description from the task contract's `scope_domain`

**Two specialization modes** (combinable):

| Mode | When to use | PERSONA includes |
|------|-------------|-----------------|
| **Persona** | Worker needs judgment/perspective (review, architecture) | Full SKILL.md or rich persona from team-config |
| **Contract-only** | Worker executes a protocol (scan, parse, format) | Minimal role sentence — scope comes from contract |

### Section 2: PROJECT CONTEXT

```markdown
## PROJECT CONTEXT

Project: {PROJECT_NAME}
Communication language: {COMMUNICATION_LANGUAGE}

Read these files BEFORE starting work:

### Project config (REQUIRED)
- {MAIN_PROJECT_ROOT}/.claude/workflow-context.md

### Project knowledge (REQUIRED — generate if missing)
{for each file in resolved_knowledge_files:}
- {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{file}
{endfor}

### Schema and rules (REQUIRED)
- ~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md
- ~/.claude/skills/bmad-shared/core/knowledge-loading.md
- ~/.claude/skills/bmad-shared/schema/knowledge-schema.md

### Protocols (JIT — load only when needed)
The teammate may consult these shared protocols when its task requires:
- ~/.claude/skills/bmad-shared/protocols/tracker-crud.md            # tracker queries / mutations
- ~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md       # language / framework / runtime detection
- ~/.claude/skills/bmad-shared/protocols/environments-lookup.md     # staging / production URLs / DB proxies
- ~/.claude/skills/bmad-shared/protocols/validation-tooling-lookup.md # lint / format / test runner / discovery patterns

**RULE:** Never reference `project.md#<anchor>` directly in your output — go through the corresponding protocol or the `direct_reference_allowed` set defined in knowledge-schema.md (currently: conventions, review-perspectives, investigation-checklist, communication-platform).
```

**Knowledge resolution order** (highest priority wins):
1. Role-specific `knowledge_files` in `team-config.md`
2. Role-specific entry in `workflow-context.md` → `agent_teams.knowledge_mapping`
3. `agent_teams.global_knowledge` (always included)

The `resolved_knowledge_files` list always contains `project.md` at minimum (the schema's required file). `domain.md` and `api.md` are added per role mapping.

### Section 3: TASK CONTRACT

````markdown
## TASK CONTRACT

```yaml
task_contract:
  team_name: '{TEAM_NAME}'
  task_id: '{TASK_ID}'
  role: '{ROLE_KEY}'
  scope_type: '{SCOPE_TYPE}'
  scope_files: [...]
  scope_domain: '{DOMAIN}'
  input_artifacts:
    - type: '{TYPE}'
      ...
  deliverable:
    format: '{FORMAT}'
    send_to: '{LEAD_NAME}'
  constraints:
    read_only: {true|false}
    worktree_path: '{PATH}'
    halt_conditions:
      - '...'
```
````

The contract follows the schema defined in `task-contract-schema.md`. It is the teammate's **sole source of truth** for what to do.

### Section 4: KNOWLEDGE GENERATION MANDATE (optional)

Include this section when knowledge files may be missing (e.g., first run on a new project).

```markdown
## KNOWLEDGE GENERATION MANDATE

If ANY knowledge file listed in PROJECT CONTEXT does NOT exist:
1. Log: "Missing knowledge: {file}. Generating from codebase scan."
2. Analyze the codebase to produce the missing knowledge
3. Write it to {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{file}
4. Include YAML frontmatter: generated date, source_hash, generator name
5. Report the generation in your task completion message

This ensures the knowledge system self-heals across all projects.
```

### Section 5: COMMUNICATION RULES

```markdown
## COMMUNICATION RULES

- Report results via SendMessage to: '{LEAD_NAME}'
- Output format: {DELIVERABLE_FORMAT} as defined in task contract
- You are {READ_ONLY|READ_WRITE} for this task

### Trace work to disk (mandatory before phase_complete)

Write detailed work to `{TRACE_PATH}` BEFORE emitting `phase_complete`. The file is the durable audit anchor that lets the lead drill down into reasoning the synthetic `summary:` cannot carry.

Required structure (markdown, 5 sections, in order) :
1. **Task Assignment** — verbatim copy of the task_contract YAML
2. **Steps Executed** — chronological log of each workflow step + CHK-STEP-NN-ENTRY/EXIT receipts emitted
3. **Decisions Taken** — verbatim copy of every `autonomy_decisions[]` entry accumulated during execution
4. **Artifacts Produced** — files modified/created with absolute paths + stats (+N/-M lines), or synthetic outputs if read-only
5. **Phase Complete Payload** — verbatim copy of the YAML payload sent via SendMessage

The trace file MUST exist before the SendMessage(phase_complete) is invoked. If the parent directory of `{TRACE_PATH}` is non-creatable (permission denied, disk full, etc.), emit `SendMessage(blocker)` with the underlying error and HALT — never silently fall back to a different path. See `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §Trace work to disk`.

### Autonomy policy enforcement

When `task_contract.constraints.autonomy_policy == spec-driven`, branch every interactive decision per the 4-way classification :
- **acknowledge** (verbatim spec match) — auto-resolve, capture in autonomy_decisions[]
- **TACTICAL** (Boundaries Always Do, Findings Rule 8 fix-MINOR, format choices) — apply spec pattern, capture in autonomy_decisions[]
- **STRUCTURAL** (arch decision, ADR gap, plan divergence, missing spec section, drift, dependency add, CI/CD modify, major-version bump) — emit `SendMessage(question, critical_ambiguity: true)`, HALT until reply
- **Runtime CRITIQUE** (test fail unfix-able, contract violation, real-data ambiguity) — emit `SendMessage(question, critical_ambiguity: true)`, HALT

When `autonomy_policy == strict` (default, backward-compat), all interactive decisions route to lead via `SendMessage(question)` — no auto-resolution. See `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §Autonomy policy enforcement`.

### Completion Protocol
1. Build your output in the exact format specified by deliverable.format
2. Verify your output contains all required fields before reporting
3. **Write the trace file at `{TRACE_PATH}` per the structure above** — this is mandatory before step 4
4. SendMessage your complete output to '{LEAD_NAME}' (include `trace_files: ['{TRACE_PATH}']` in the phase_complete payload)
5. Call TaskUpdate(status: "completed")
6. If you receive validation feedback:
   a. Read the feedback carefully
   b. Revise your output to fix the issues
   c. Update the trace file (sections 4-5) with the revision
   d. Re-send via SendMessage
   e. Call TaskUpdate(status: "completed") again

### Constraints
- NEVER communicate with other teammates directly — only via lead
- NEVER modify files unless constraints.read_only == false
- NEVER invoke `Agent()` (sub-agent fork) — Agent Teams platform constraint per anthropics/claude-code#32723 (TAC-18). Hub-and-spoke architecture forbids forks inside teammates ; all delegation happens lead-side.
- NEVER write secrets, credentials, API keys, tokens, or PII into the trace file at `{TRACE_PATH}`
- If blocked: SendMessage(blocker) to lead explaining the blocker — do NOT silently degrade
- HALT on any condition in constraints.halt_conditions
```

---

## Template Assembly

Workflow steps assemble the spawn prompt by:

1. Load `team-config.md` for role definitions
2. Load `agent-teams-config-schema.md` knowledge mapping from `workflow-context.md`
3. For each teammate to spawn:
   a. Select role from `team-config.md`
   b. Resolve knowledge files (team-config override → project mapping → global)
   c. Build task contract per `task-contract-schema.md`
   d. Assemble sections 1-5 into the spawn prompt
   e. Spawn teammate with assembled prompt

### Variable Reference

| Variable | Source |
|----------|--------|
| `{TEAM_NAME}` | TeamCreate name (from `team-config.md` template) |
| `{ROLE_NAME}` | Human-readable role name from team-config |
| `{ROLE_KEY}` | Role identifier from team-config |
| `{ROLE_PERSONA_CONTENT}` | `persona` field from team-config or agent SKILL.md |
| `{PROJECT_NAME}` | `workflow-context.md` → `project_name` |
| `{COMMUNICATION_LANGUAGE}` | `workflow-context.md` → `communication_language` |
| `{LEAD_NAME}` | Orchestrator agent name |
| `{DELIVERABLE_FORMAT}` | Task contract → `deliverable.format` |
| `{READ_ONLY\|READ_WRITE}` | Task contract → `constraints.read_only` |
| `{TRACE_PATH}` | Task contract → `constraints.trace_path` (default `/tmp/bmad-{project_slug}-auto-flow/{RUN_ID}/{role}-{task_id}.md`) |
| `{AUTONOMY_POLICY}` | Task contract → `constraints.autonomy_policy` (default `strict`) |

---

## Task Completion Validation

Before accepting a teammate's output as complete, the orchestrator validates the deliverable format.

### Validation by Format

| Format | Required Structure |
|--------|-------------------|
| `yaml_report` | Valid YAML with top-level keys matching the workflow's expected report schema |
| `markdown_document` | Valid markdown with title heading and expected sections |
| `tracker_update` | Contains issue identifier and status transition |
| `knowledge_file` | Valid markdown with YAML frontmatter (`generated`, `source_hash`) |

### Validation Flow

```
Teammate calls TaskUpdate(status: "completed")
│
├─ Orchestrator receives SendMessage output
│  │
│  ├─ Output matches deliverable.format expectations?
│  │  ├─ YES → Accept result, record findings, task is complete
│  │  └─ NO → Send feedback via SendMessage:
│  │           "Output validation failed: {reason}.
│  │            Expected format: {format}. Missing: {fields}.
│  │            Please revise and resubmit."
│  │           Teammate revises and resubmits
│  │
│  └─ Teammate fails validation 3+ times?
│     └─ YES → Mark task as "failed"
│              Log: "Teammate {name} unable to produce valid {format}"
│              Orchestrator attempts task inline as fallback
```

### Implementation Note

This validation is a **documented pattern** the orchestrator step implements — it is not automatic. The orchestrator's step file contains the validation logic specific to its workflow. See `bmad-code-review` step-06 section 6.5 for a reference implementation of report collection and validation.

---

## Error Recovery

### Teammate Failure

If a teammate fails, times out, or produces unusable output:

1. Orchestrator logs: "Teammate {name} failed on task {task_id}: {reason}"
2. If `retry_count < 2`: respawn a new teammate with the same task contract
3. If `retry_count >= 2`: mark task as failed, attempt inline execution as fallback
4. If inline fallback also fails: HALT and report to user

### Graceful Degradation

When `TEAM_MODE == false` (Agent Teams unavailable), the workflow MUST still function:

- If `team-config.md` defines a `fallback.subagent_workflow` → use existing subagent pattern
- If `fallback.mode == 'sequential-inline'` → orchestrator executes all tasks sequentially in its own context
- The spawn protocol is NOT used — tasks are executed directly using the task contract as inline instructions

Agent Teams is an **enhancement** for context isolation and parallelism — never a hard requirement.
