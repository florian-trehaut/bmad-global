# BMAD Skill Conventions

Complete reference for the conventions that every bmad-* skill must follow. This file is loaded by the bmad-create-skill workflow and used as the validation baseline.

---

## 1. File Structure

Every bmad-* skill follows this structure:

```
bmad-{name}/
├── SKILL.md                       # Entry point (REQUIRED)
├── workflow.md                    # Main workflow (REQUIRED)
├── steps/                         # Step files (REQUIRED, at least 1)
│   ├── step-01-{name}.md
│   ├── step-02-{name}.md
│   └── ...
├── data/                          # Reference data (OPTIONAL)
│   └── {descriptive-name}.md
├── templates/                     # Output templates (OPTIONAL)
│   └── {purpose}-template.md
├── subagent-workflows/            # Subagent instructions (OPTIONAL)
│   └── {name}.md
└── team-workflows/                # Agent Teams configurations (OPTIONAL)
    └── team-config.md
```

**Rules:**
- Only create subdirectories that contain files
- Remove empty directories
- All files are markdown (`.md`)

---

## 2. SKILL.md Format

```markdown
---
name: bmad-{name}
description: "{Purpose sentence}. {What it does}. Use when '{trigger1}', '{trigger2}', '{trigger3}' is mentioned."
---

Follow the instructions in ./workflow.md.
```

**Rules:**
- YAML frontmatter with exactly two keys: `name` and `description`
- `name`: `bmad-{lowercase-hyphenated}`, must match the directory name
- `description`: includes purpose AND trigger phrases (at least 3 phrases)
- `description` max 1024 characters
- Must contain trigger phrases (typically "Use when..." or quoted trigger words)
- Body: exactly one line — `Follow the instructions in ./workflow.md.`
- No trailing content after the body line

---

## 3. workflow.md Format

### Required Sections (in order)

1. **Title** — `# {Name} — Workflow`
2. **Version tag** — `**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**`
3. **INITIALIZATION** — How the skill bootstraps
4. **YOUR ROLE** — Who the agent is during this workflow
5. **CRITICAL RULES** — Skill-specific guardrails
6. **STEP SEQUENCE** — Table of all steps with file paths and goals
7. **ENTRY POINT** — Pointer to the first step file
8. **HALT CONDITIONS (GLOBAL)** — When the workflow stops (can be inline or separate section)

### Retrospective Integration (REQUIRED)

Every workflow.md MUST end with a `## WORKFLOW COMPLETION — RETROSPECTIVE` section that references `~/.claude/skills/bmad-shared/core/retrospective-step.md`. This enables the self-improvement loop where each workflow execution can detect friction points and propose improvements.

Exception: read-only analysis workflows (like bmad-validate-skill) that don't modify anything and can't have meaningful friction points may omit this section.

### INITIALIZATION Patterns

**Project-dependent skill** (needs workflow-context.md):
```markdown
### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it with `/bmad-project-init`."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `{VAR}` | `{key}` | {example} |
```

**Standalone/meta skill** (no workflow-context.md needed):
```markdown
This is a **{type}-skill** — {reason}.

### 1. {First init step}
{What to load instead}
```

### Knowledge Loading (JIT)

All bmad-\* workflow skills must follow the protocol defined in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

```markdown
### N. Load project knowledge (REQUIRED)

Apply the protocol in `~/.claude/skills/bmad-shared/core/knowledge-loading.md`:

- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` — {what it provides and why}.
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md` — {only if the skill needs ubiquitous language}.
- **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md` — {only if the skill touches API contracts}.

HALT if any required file is missing (run `/bmad-knowledge-bootstrap`).
```

Never use the soft `If exists, read it` pattern for knowledge files — required files MUST trigger HALT when missing.

### Shared Rules Loading

```markdown
### N. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. (`core/` contains the universal rules auto-loaded by every workflow.)

If your skill is type-specific (spec, team-aware, validation, etc.), ALSO Glob the relevant subdirectory(ies) per the matrix in `~/.claude/skills/bmad-shared/SKILL.md`:

- Spec workflows: also `Glob ~/.claude/skills/bmad-shared/spec/*.md`
- Team-aware / orchestrator-spawned workflows: also `Glob ~/.claude/skills/bmad-shared/teams/*.md`
- Validation workflows: also `Read ~/.claude/skills/bmad-shared/validation/validation-protocol.md`
- Workflows with worktree: also `Read ~/.claude/skills/bmad-shared/lifecycle/worktree-lifecycle.md`
- Knowledge-aware workflows: also `Read ~/.claude/skills/bmad-shared/schema/knowledge-schema.md`

Apply these rules for the entire workflow execution. Key rule for this workflow: **{one-sentence key rule}.**
```

---

## 4. Step File Format

### Structure

```markdown
# Step {N}: {Descriptive Name}

## STEP GOAL

{One paragraph — what this step accomplishes and why.}

## RULES

{Step-specific rules — not workflow-global rules.}

## SEQUENCE

### 1. {First action}
{Instructions}

### 2. {Second action}
{Instructions}

### N. CHECKPOINT                    # Only if interactive

{Present findings/decisions to user}

WAIT for user confirmation.

---

**Next:** Read fully and follow `./steps/step-{NN}-{name}.md`
```

Or for the last step:
```markdown
---

## END OF WORKFLOW

The bmad-{name} workflow is complete.
```

### Rules

- **< 200 lines** (soft limit), **250 max** (hard limit)
- **Self-contained** — understandable without reading other steps
- **Single goal** — expressible in one sentence
- **SEQUENCE section** with numbered instructions
- **NEXT pointer** — every step must end with navigation to the next step or END OF WORKFLOW
- **CHECKPOINT** — required for steps where user confirmation is needed
- **No orphan steps** — every step must be reachable from the ENTRY POINT
- **2-10 step files** per skill (hard limit). More than 10 risks LLM context degradation.
- A step MUST NOT load or reference future step files until the current step is complete (JIT loading only). Exception: the NEXT pointer.
- Any step presenting a user menu or choices MUST HALT and wait for user selection before proceeding. Never auto-select.
- No `name:` or `description:` in step file frontmatter — these fields belong only in SKILL.md.

### Frontmatter (Optional)

Some skills use YAML frontmatter in step files for metadata (e.g., `nextStepFile`). However, `name:` and `description:` fields are **not allowed** in step file frontmatter — they belong only in SKILL.md.

The NEXT pointer in the body is the primary navigation mechanism.

---

## 5. Variable Resolution

- All project-specific values come from `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` YAML frontmatter
- Variables use `{VARIABLE_NAME}` format (curly braces, UPPER_SNAKE_CASE)
- Common variables:

| Variable | Source |
|----------|--------|
| `{PROJECT_NAME}` | `project_name` |
| `{ISSUE_PREFIX}` | `issue_prefix` |
| `{TRACKER}` | `tracker` |
| `{TRACKER_MCP_PREFIX}` | `tracker_mcp_prefix` |
| `{TRACKER_TEAM}` | `tracker_team` |
| `{FORGE}` | `forge` |
| `{FORGE_CLI}` | `forge_cli` |
| `{INSTALL_COMMAND}` | `install_command` |
| `{BUILD_COMMAND}` | `build_command` |
| `{TEST_COMMAND}` | `test_command` |
| `{LINT_COMMAND}` | `lint_command` |
| `{QUALITY_GATE}` | `quality_gate` |
| `{COMM_PLATFORM}` | `comm_platform` |
| `{COMM_MCP_PREFIX}` | `comm_mcp_prefix` |
| `{USER_COMM_HANDLE}` | `user_comm_handle` |
| `{COMMUNICATION_LANGUAGE}` | `communication_language` |
| `{USER_NAME}` | `user_name` |

- Never hardcode values that should come from `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`

---

## 6. Path Resolution

### Intra-skill References
- From `workflow.md`: reference steps as `./steps/step-XX.md`, data as `./data/file.md`
- From step files in `steps/`: reference sibling steps as `./step-XX.md`, data files as `../data/file.md`, templates as `../templates/file.md`
- From subagent files in `subagent-workflows/`: reference data as `../data/file.md`

### Cross-skill References
- To invoke another skill: use "Invoke the `skill-name` skill" — NEVER "read and follow" for cross-skill
- "Read fully and follow" is for INTRA-skill file navigation only
- NEVER reference files inside another skill's directory (e.g., `~/.claude/skills/other-skill/data/file.md`)
- Exception: `bmad-shared` files can be referenced by path since they are shared infrastructure

### External References
- Project files: use `{MAIN_PROJECT_ROOT}` prefix for `.claude/` paths (e.g., `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)
- No absolute paths (no `~/`, no `/Users/`)
- No `{installed_path}` variable (legacy BMAD pattern)

---

## 7. Data Files

- Purpose: reference data, classification rules, templates, checklists
- Loaded JIT by the step that needs them
- Format: markdown with clear header and purpose description
- Self-contained — no dependencies on other data files
- Referenced as `./data/{filename}.md` from step files

---

## 7b. Team Workflows

- Purpose: Agent Teams role definitions and team configuration for parallel execution
- Only create this directory if the skill supports Agent Teams parallel execution
- Contains exactly one file: `team-config.md`
- The team router (`bmad-shared/teams/team-router.md`) detects this directory to activate team mode
- Skills without `team-workflows/` are completely unaffected — they run as today

### team-config.md Schema

```yaml
---
team_name_template: '{skill-slug}-{context_id}'
description_template: '{workflow description} for {context}'
---
```

#### Roles

```yaml
roles:
  role-key:                          # Unique identifier, used in task contracts
    persona: |                       # Role description embedded in spawn prompt
      You are a {role} specialist...
    count: 1                         # Number of teammates with this role
    claims:                          # Task ID patterns this role can claim (self-service mode)
      - 'A'
      - 'B'
    constraints:
      read_only: true
    knowledge_files:                 # Override project-level knowledge_mapping for this role
      - review-perspectives.md
      - stack.md
```

#### Distribution and Consensus

```yaml
distribution: 'self-service'         # self-service | assigned

consensus:                           # Optional — voting/agreement rules
  strategy: 'majority'               # majority | unanimous | single
  scope:                             # Which roles participate in consensus
    - 'security-reviewer'

fallback:                            # When TEAM_MODE == false
  mode: 'sequential-inline'          # Execute tasks sequentially in main context
  subagent_workflow: '../subagent-workflows/{name}.md'  # Existing fallback file
```

### Rules

- `team-config.md` is the only file in `team-workflows/`
- Every role must have a `persona` and a `count`
- `fallback` section is REQUIRED — Agent Teams is an enhancement, never a dependency
- Role keys must be valid identifiers (lowercase, hyphenated)

---

## 8. Naming Conventions

| Element | Format | Example |
|---------|--------|---------|
| Skill directory | `bmad-{name}` | `bmad-dev-story` |
| Step files | `step-{NN}-{name}.md` | `step-01-discover.md` |
| Data files | `{descriptive-name}.md` | `vm-classification-rules.md` |
| Template files | `{purpose}-template.md` | `tracker-comment-template.md` |
| Subagent files | `{name}.md` | `self-review.md` |
| Team config files | `team-config.md` | `team-config.md` |
| Variables | `{UPPER_SNAKE_CASE}` | `{TRACKER_TEAM}` |

- Step numbers are zero-padded to 2 digits
- Names are lowercase, hyphenated
- Names are descriptive but concise (2-4 words)

---

## 9. Prohibited Patterns

| Pattern | Why it is forbidden |
|---------|-------------------|
| `workflow.yaml` | Legacy BMAD format — replaced by workflow.md |
| `instructions.xml` | Legacy BMAD format — replaced by step files |
| `workflow.xml` | Legacy BMAD engine reference |
| `{project-root}/_bmad/` | Legacy BMAD path — our skills are in `~/.claude/skills/` or `{MAIN_PROJECT_ROOT}/.claude/skills/` |
| Hardcoded project names | Use `{PROJECT_NAME}` from `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` |
| Hardcoded tool names (`pnpm`, `glab`, `gh`) | Use config variables (`{PACKAGE_MANAGER}`, `{FORGE_CLI}`) |
| Hardcoded tracker IDs | Use `{TRACKER_TEAM_ID}`, `{TRACKER_STATES}` |
| Hardcoded URLs | Use workflow-knowledge files |
| `console.log` in generated code | Use NestJS Logger |
| `@ts-ignore` without justification | Not allowed in our codebase |
| `name:` / `description:` in non-SKILL.md frontmatter | These fields belong only in SKILL.md |
| `"skip to step"` / `"jump ahead"` / `"go directly to"` | Sequential execution is mandatory |
| Time estimates (`"~5 min"`, `"takes about"`, `"N minutes"`) | AI execution speed varies too much |
| Absolute paths (`~/`, `/Users/`, `/home/`) | Not portable across machines |
| `{installed_path}` | Legacy BMAD pattern, not used in our conventions |
| Cross-skill file paths (`~/.claude/skills/other-skill/file.md`) | Skills must be self-contained; use "Invoke the skill" instead |
| Intra-skill path variables in frontmatter | Paths should be inline in instructions, not declared in frontmatter |

---

## 10. Quality Checklist

Before considering a skill complete, verify:

- [ ] SKILL.md has name + description (<1024 chars) with trigger phrases
- [ ] SKILL.md body is just "Follow the instructions in ./workflow.md."
- [ ] workflow.md has INITIALIZATION section
- [ ] workflow.md has step-file architecture boilerplate (Critical Rules)
- [ ] Step count is 2-10
- [ ] Each step file < 200 lines (soft), 250 max (hard)
- [ ] Each step has NEXT pointer (except last step)
- [ ] NEXT pointer chain is complete (no orphans, no dead ends)
- [ ] Interactive steps have CHECKPOINT sections
- [ ] No hardcoded project references
- [ ] Path resolution follows conventions (relative from originating file)
- [ ] No prohibited patterns
- [ ] No `name:`/`description:` in non-SKILL.md files
- [ ] No skip instructions or time estimates
- [ ] All data/template files are referenced by at least one step
- [ ] HALT conditions are comprehensive
- [ ] Variables use `{UPPER_SNAKE_CASE}` format
- [ ] workflow.md has RETROSPECTIVE section at the end (unless read-only analysis skill)
- [ ] If `team-workflows/` exists, it contains `team-config.md`
- [ ] `team-config.md` defines at least one role with persona and count
- [ ] `team-config.md` has a `fallback` section for when Agent Teams is unavailable
- [ ] Each role key in `team-config.md` matches a role key in task contracts
