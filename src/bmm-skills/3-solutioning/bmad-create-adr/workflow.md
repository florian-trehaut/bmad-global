# Create ADR — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, collaborative checkpoints.**

**Goal:** Guide the creation of a well-structured Architecture Decision Record through evidence-based investigation. Can be invoked standalone or as a sub-workflow when spec/dev workflows detect the need for a new architectural decision.

**Your Role:** Collaborative ADR Facilitator. You bring structure, evidence discipline, and anti-pattern awareness. The user brings domain knowledge and decision authority. Together you produce a well-reasoned, evidence-based ADR.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key |
|----------|-----|
| `PROJECT_NAME` | `project_name` |
| `FORGE` | `forge` |
| `FORGE_CLI` | `forge_cli` |
| `FORGE_API_BASE` | `forge_api_base` |
| `FORGE_PROJECT_PATH` | `forge_project_path` |
| `TRACKER` | `tracker` |
| `COMMUNICATION_LANGUAGE` | `communication_language` |
| `USER_NAME` | `user_name` |
| `USER_SKILL_LEVEL` | `user_skill_level` |
| `ADR_LOCATION` | `adr_location` |
| `ADR_FORMAT` | `adr_format` |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rules for this workflow:

- **ZERO FALLBACK / ZERO FALSE DATA** — Every claim in the ADR must reference concrete evidence. "We believe X" or "in our experience" is NOT evidence unless accompanied by specific references.
- **Evidence over opinion** — PoC results, benchmarks, documentation URLs, codebase analysis. Never speculation.

### 3. Load stack knowledge (optional)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` exists, read it. Contains tech stack details, forbidden patterns, and reference code pointers.

### 4. Detect invocation mode

- `SUB_WORKFLOW_MODE = true` if the initial prompt contains a decision description from a parent workflow (e.g., triggered via `[A] Create ADR now` menu from another workflow).
- `STANDALONE_MODE = true` otherwise.

### 5. Set defaults

```yaml
WIP_FILE: null                 # populated by step-01
INVOCATION_MODE: null          # standalone | sub-workflow
CALLING_WORKFLOW: null         # name of calling workflow, if sub-workflow
ADR_LOCATION: null             # from workflow-context.md or user
ADR_FORMAT: null               # madr | nygard | custom | unknown -> defaults to madr
EXISTING_ADRS: []              # populated by step-01
NEXT_ADR_NUMBER: null          # auto-detected by step-01
SUPERSEDES_ADR: null           # set by step-02 if applicable
SLUG: null                     # kebab-case identifier
PROBLEM_STATEMENT: null        # from step-02
DECISION_DRIVERS: []           # from step-02
OPTIONS: []                    # accumulated in step-03
EVIDENCE: {}                   # accumulated in step-04
DECISION: null                 # formulated in step-05
ADR_DRAFT: null                # composed in step-06
```

### 6. Set related workflow paths

```yaml
related_workflows:
  advanced_elicitation: skill:bmad-advanced-elicitation
  party_mode: skill:bmad-party-mode
  adversarial_review: skill:bmad-review-adversarial-general
  adr_review: skill:bmad-adr-review
```

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file (~80-200 lines)
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **State Tracking**: Progress tracked via WIP file frontmatter (`stepsCompleted`)
- **No Worktree**: ADR creation writes to the main repo — no isolation needed

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C'
5. **SAVE STATE**: Update WIP file before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update WIP file when step completes
- ALWAYS halt at menus and wait for user input
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- **ZERO FALLBACK / ZERO FALSE DATA** — Apply the shared rules loaded in initialization
- The user decides — you facilitate and challenge, but the final decision is the user's
- Prevent anti-patterns structurally — do not allow Fairy Tale, Sprint, Tunnel Vision, or Retroactive Fiction patterns to form

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-init.md` | Accept context, load existing ADRs, detect numbering, create WIP |
| 2 | `step-02-context.md` | Capture problem statement, forces, decision drivers, conflict check |
| 3 | `step-03-options.md` | Discover and document options (incl. do-nothing), Sprint prevention |
| 4 | `step-04-evidence.md` | Gather evidence for each option, Retroactive Fiction prevention |
| 5 | `step-05-decision.md` | Trade-off evaluation, decision formulation, consequences |
| 6 | `step-06-compose.md` | Draft ADR from template, self-review, anti-pattern scan |
| 7 | `step-07-publish.md` | Write ADR file, handle supersession, summary, return control |

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

---

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → HALT
- `adr_location` is "none" and user cannot provide a path → HALT
- User explicitly requests stop → HALT
- 3 consecutive tool failures on same operation → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
