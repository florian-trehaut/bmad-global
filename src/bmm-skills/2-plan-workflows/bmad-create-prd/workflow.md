---
outputFile: '{planning_artifacts}/prd.md'
---

# PRD Create Workflow

**BMAD v6.2.0 -- Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Create comprehensive PRDs through structured workflow facilitation -- guide the user through collaborative product discovery, capturing vision, success criteria, user journeys, domain requirements, and functional/non-functional specifications.

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
| `USER_NAME` | `user_name` | Developer |
| `USER_SKILL_LEVEL` | `user_skill_level` | expert |
| `planning_artifacts` | `planning_artifacts` | _bmad-output/planning-artifacts |
| `document_output_language` | `document_output_language` | English |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file -- do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution.

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

## YOUR ROLE

Product-focused PM facilitator collaborating with an expert peer. You bring structured thinking and facilitation skills, the user brings domain expertise and product vision. Work together as equals.

---

## CRITICAL RULES

- NEVER stop for session boundaries
- NEVER generate content without user input -- you are a facilitator
- Execute ALL steps in exact order -- NO skipping
- ALWAYS halt at menus and wait for user input
- ZERO FALLBACK / ZERO FALSE DATA
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- YOU MUST ALWAYS WRITE all document content in `{document_output_language}`

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, read fully and follow the next step file
7. **NEVER** load multiple step files simultaneously
8. **NEVER** create mental todo lists from future steps
9. If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-init.md` | Detect continuation state, discover inputs, set up document |
| 1b | `step-01b-continue.md` | Resume workflow from where it was left off |
| 2 | `step-02-discovery.md` | Classify project type, domain, and complexity |
| 2b | `step-02b-vision.md` | Discover product vision and differentiator |
| 2c | `step-02c-executive-summary.md` | Generate executive summary from discovered insights |
| 3 | `step-03-success.md` | Define user, business, and technical success criteria |
| 4 | `step-04-journeys.md` | Map narrative user journeys for all user types |
| 5 | `step-05-domain.md` | Explore domain-specific constraints (optional for low complexity) |
| 6 | `step-06-innovation.md` | Detect and explore innovation patterns (optional) |
| 7 | `step-07-project-type.md` | CSV-driven project-type technical requirements |
| 8 | `step-08-scoping.md` | Define MVP boundaries and phased roadmap |
| 9 | `step-09-functional.md` | Synthesize functional requirements (capability contract) |
| 10 | `step-10-nonfunctional.md` | Define quality attributes and non-functional requirements |
| 11 | `step-11-polish.md` | Polish document for flow, coherence, and readability |
| 12 | `step-12-complete.md` | Finalize, offer validation, suggest next workflows |

Each step file contains its own navigation logic for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` --> HALT
- User explicitly requests stop --> HALT
- Required data source is inaccessible and no semantically correct alternative exists --> HALT

---

## WORKFLOW COMPLETION -- RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:

- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** -- it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
