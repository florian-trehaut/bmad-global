# Edit PRD -- Workflow

**BMAD v6.2.0 -- Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Edit and improve existing PRDs through structured enhancement workflow. Load the PRD, detect format (BMAD/legacy), review against quality standards, and apply targeted edits with user guidance.

**Your Role:** PRD improvement specialist. You analyze existing PRDs against quality standards, identify gaps, and guide targeted edits. Collaborative approach -- user decides what to change.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-\* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable                   | Key                        | Example                          |
| -------------------------- | -------------------------- | -------------------------------- |
| `PROJECT_NAME`             | `project_name`             | MyProject                        |
| `COMMUNICATION_LANGUAGE`   | `communication_language`   | English                          |
| `DOCUMENT_OUTPUT_LANGUAGE` | `document_output_language` | English                          |
| `USER_NAME`                | `user_name`                | Developer                        |
| `USER_SKILL_LEVEL`         | `user_skill_level`         | expert                           |
| `OUTPUT_FOLDER`            | `output_folder`            | \_bmad-output                    |
| `PLANNING_ARTIFACTS`       | `planning_artifacts`       | \_bmad-output/planning-artifacts |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file -- do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution.

### 3. Set related workflow paths

```yaml
related_workflows:
  advanced_elicitation: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
  party_mode: '~/.claude/skills/bmad-party-mode/workflow.md'
  validate_prd: '~/.claude/skills/bmad-validate-prd/SKILL.md'
```

If any of these files do not exist, the corresponding menu option is silently unavailable.

---


### CHK-INIT — Initialization Read Receipt

Emit EXACTLY this block (filling in actual values you read), then proceed to the first step. If any line cannot be filled truthfully, HALT.

```
CHK-INIT PASSED — Initialization complete:
  shared_rules_loaded: {N} files (list filenames)
  project_context: {MAIN_PROJECT_ROOT}/.claude/workflow-context.md (schema_version: {X})
  project_knowledge:
    - project.md (schema_version: {X})
    - domain.md ({"loaded" | "not required" | "required-but-missing"})
    - api.md ({"loaded" | "not required" | "required-but-missing"})
  worktree_path: {WORKTREE_PATH or "n/a"}
  team_mode: {true | false}
  user_name: {USER_NAME}
  communication_language: {LANGUAGE}
```

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file (~80-200 lines)
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **State Tracking**: Progress tracked in memory across steps

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C'
5. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps
- If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- YOU MUST ALWAYS WRITE all artifact and document content in `{DOCUMENT_OUTPUT_LANGUAGE}`
- **ZERO FALLBACK / ZERO FALSE DATA** -- Apply the shared rules loaded in initialization

---

## STEP SEQUENCE

| Step | File                            | Goal                                                                                     |
| ---- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| 1    | `step-01-discovery.md`          | Load PRD, detect format (BMAD/legacy), check for validation report, discover edit intent |
| 1b   | `step-01b-legacy-conversion.md` | Analyze legacy PRD gaps against BMAD standard, propose conversion strategy               |
| 2    | `step-02-review.md`             | Deep review, map findings to sections, build and approve change plan                     |
| 3    | `step-03-edit.md`               | Apply approved changes section-by-section, restructure if needed                         |
| 4    | `step-04-complete.md`           | Present edit summary, offer validation or additional edits                               |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-discovery.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` -- HALT
- PRD file not found at specified path -- HALT
- User explicitly requests stop -- HALT
- Required data source is inaccessible and no semantically correct alternative exists -- HALT

---

## WORKFLOW COMPLETION -- RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:

- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** -- it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
