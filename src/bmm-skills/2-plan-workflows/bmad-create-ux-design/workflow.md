# Create UX Design -- Workflow

**BMAD v6.2.0 -- Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Create comprehensive UX design specifications through collaborative visual exploration and informed decision-making -- capture core experience, emotional design goals, design system choices, visual foundations, user journeys, component strategy, and responsive/accessibility patterns.

**Your Role:** UX Design Facilitator collaborating with a product expert. You bring design system knowledge, accessibility expertise, and user experience methodology; the user brings product vision and domain context.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyProject |
| `OUTPUT_FOLDER` | `output_folder` | _bmad-output |
| `PLANNING_ARTIFACTS` | `planning_artifacts` | _bmad-output/planning-artifacts |
| `PRODUCT_KNOWLEDGE` | `product_knowledge` | _bmad-output/product-knowledge |
| `USER_NAME` | `user_name` | Developer |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `DOCUMENT_OUTPUT_LANGUAGE` | `document_output_language` | English |
| `USER_SKILL_LEVEL` | `user_skill_level` | expert |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution.

### 3. Set paths

```yaml
default_output_file: "{planning_artifacts}/ux-design-specification.md"
```

### 4. Set related workflow paths

```yaml
related_workflows:
  advanced_elicitation: "~/.claude/skills/bmad-advanced-elicitation/SKILL.md"
  party_mode: "~/.claude/skills/bmad-party-mode/workflow.md"
```

If any of these files do not exist, the corresponding menu option (A/P) is silently unavailable.

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
- **State Tracking**: Progress tracked via output file frontmatter (`stepsCompleted`)
- **Subprocess Optimization**: Use subprocess/subagent tools when available for parallel operations

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C'
5. **SAVE STATE**: Update output file before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update output file when step completes
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps
- If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- YOU MUST ALWAYS WRITE all artifact and document content in `{DOCUMENT_OUTPUT_LANGUAGE}`
- **ZERO FALLBACK / ZERO FALSE DATA** -- Apply the shared rules loaded in initialization

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-init.md` | Detect existing workflow, discover input documents, create output file |
| 1b | `step-01b-continue.md` | Resume from existing WIP state |
| 2 | `step-02-discovery.md` | Review loaded context, fill gaps, identify UX challenges |
| 3 | `step-03-core-experience.md` | Define core user action, platform strategy, experience principles |
| 4 | `step-04-emotional-response.md` | Define emotional goals, emotional journey, micro-emotions |
| 5 | `step-05-inspiration.md` | Analyze inspiring products, extract transferable UX patterns |
| 6 | `step-06-design-system.md` | Choose design system approach and customization strategy |
| 7 | `step-07-defining-experience.md` | Define the core interaction, mental model, experience mechanics |
| 8 | `step-08-visual-foundation.md` | Establish color system, typography, spacing, layout foundation |
| 9 | `step-09-design-directions.md` | Generate design direction mockups, facilitate selection |
| 10 | `step-10-user-journeys.md` | Design user journey flows with Mermaid diagrams |
| 11 | `step-11-component-strategy.md` | Define component library strategy, custom component specs |
| 12 | `step-12-ux-patterns.md` | Establish UX consistency patterns (buttons, forms, nav, feedback) |
| 13 | `step-13-responsive-accessibility.md` | Define responsive strategy, breakpoints, WCAG compliance |
| 14 | `step-14-complete.md` | Finalize document, update status, suggest next steps |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` -> HALT
- Output file creation fails -> HALT
- User explicitly requests stop -> HALT
- Required data source is inaccessible and no semantically correct alternative exists -> HALT

---

## WORKFLOW COMPLETION -- RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** -- it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
