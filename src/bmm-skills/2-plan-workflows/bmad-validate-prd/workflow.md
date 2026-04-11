# PRD Validate -- Workflow

**BMAD v6.2.0 -- Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Validate existing PRDs against BMAD standards through comprehensive review covering format, density, coverage, measurability, traceability, implementation leakage, domain compliance, project-type requirements, SMART criteria, holistic quality, and completeness.

**Your Role:** Validation architect and quality assurance specialist. You systematically validate PRDs against comprehensive quality standards, identifying gaps, inconsistencies, and areas for improvement. Evidence-based, thorough, constructive.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyProject |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `DOCUMENT_OUTPUT_LANGUAGE` | `document_output_language` | English |
| `USER_NAME` | `user_name` | Developer |
| `USER_SKILL_LEVEL` | `user_skill_level` | expert |
| `OUTPUT_FOLDER` | `output_folder` | _bmad-output |
| `PLANNING_ARTIFACTS` | `planning_artifacts` | _bmad-output/planning-artifacts |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file -- do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution.

### 3. Set WIP variables

```yaml
validation_report_path: "{PLANNING_ARTIFACTS}/prd-validation-report.md"
```

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file (~80-200 lines)
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **State Tracking**: Progress tracked via validation report frontmatter (`validationStepsCompleted`)
- **Subprocess Optimization**: Use subprocess/subagent tools when available for parallel operations

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C'
5. **SAVE STATE**: Update validation report before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update validation report frontmatter when completing a step
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps
- If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- YOU MUST ALWAYS write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`
- **ZERO FALLBACK / ZERO FALSE DATA** -- Apply the shared rules loaded in initialization

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-discovery.md` | Discover PRD, load input documents, initialize validation report |
| 2 | `step-02-format-detection.md` | Detect BMAD format classification, route non-standard PRDs |
| 2b | `step-02b-parity-check.md` | Gap analysis for non-standard PRDs (optional branch) |
| 3 | `step-03-density-validation.md` | Scan for conversational filler, wordiness, redundancy |
| 4 | `step-04-brief-coverage-validation.md` | Map Product Brief content to PRD sections |
| 5 | `step-05-measurability-validation.md` | Validate FR/NFR measurability and format |
| 6 | `step-06-traceability-validation.md` | Validate traceability chain, detect orphan requirements |
| 7 | `step-07-implementation-leakage-validation.md` | Detect technology/implementation details in requirements |
| 8 | `step-08-domain-compliance-validation.md` | Validate domain-specific compliance sections |
| 9 | `step-09-project-type-validation.md` | Validate project-type required/excluded sections |
| 10 | `step-10-smart-validation.md` | Score FRs on SMART criteria (1-5 scale) |
| 11 | `step-11-holistic-quality-validation.md` | Assess document flow, dual audience, overall quality rating |
| 12 | `step-12-completeness-validation.md` | Final gate: template variables, content, frontmatter completeness |
| 13 | `step-13-report-complete.md` | Finalize report, present summary, offer next actions |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-discovery.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` -> HALT
- PRD file not found at specified path -> HALT
- User explicitly requests stop -> HALT
- Required data source is inaccessible and no semantically correct alternative exists -> HALT

---

## WORKFLOW COMPLETION -- RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** -- it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
