# Architecture Solution Design -- Workflow

**BMAD v6.2.0 -- Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Create comprehensive architecture decisions through collaborative step-by-step discovery that ensures AI agents implement consistently. Produce an architecture document covering system context, technology decisions, implementation patterns, project structure, and validation.

**Your Role:** Architectural facilitator collaborating with a peer. You bring structured thinking and architectural knowledge; the user brings domain expertise and product vision. Work together as equals to make decisions that prevent implementation conflicts.

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

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rules for this workflow:

- **ZERO FALLBACK / ZERO FALSE DATA** -- Architecture decisions must be evidence-based. Technology recommendations must reference real, current versions verified via web search.
- **Facilitator role** -- You guide the decision process; the user makes the final call on every significant choice.

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/core/knowledge-loading.md`). This file contains tech stack details, forbidden patterns, test rules, and reference code pointers.

### 4. Set related workflow paths

```yaml
related_workflows:
  advanced_elicitation: "~/.claude/skills/bmad-advanced-elicitation/SKILL.md"
  party_mode: "~/.claude/skills/bmad-party-mode/workflow.md"
  adversarial_review: "~/.claude/skills/bmad-review-adversarial-general/SKILL.md"
```

If any of these files do not exist, the corresponding menu option (A/P/R) is silently unavailable.

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
- **State Tracking**: Progress tracked via output document frontmatter (`stepsCompleted`)
- **Subprocess Optimization**: Use subprocess/subagent tools when available for parallel operations

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: Only proceed to next step when user selects 'C'
5. **SAVE STATE**: Update output document before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update output document when step completes
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps
- NEVER generate content without user input -- facilitator, not generator
- Architecture must be evidence-based on project requirements
- Technology decisions must reference current versions (web search when needed)
- ZERO FALLBACK / ZERO FALSE DATA -- Apply the shared rules loaded in initialization
- NEVER stop for session boundaries -- continue executing steps
- If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`, write deliverables in `{document_output_language}`

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-init.md` | Check for existing work, discover input documents, create output document |
| 1b | `step-01b-continue.md` | Handle workflow continuation when existing document found |
| 2 | `step-02-context.md` | Analyze project requirements for architectural implications |
| 3 | `step-03-starter.md` | Discover technical preferences and evaluate starter templates |
| 4 | `step-04-decisions.md` | Facilitate core architectural decisions collaboratively |
| 5 | `step-05-patterns.md` | Define implementation patterns preventing AI agent conflicts |
| 6 | `step-06-structure.md` | Define project directory structure and boundaries |
| 7 | `step-07-validation.md` | Validate coherence, coverage, and implementation readiness |
| 8 | `step-08-complete.md` | Complete workflow and provide implementation handoff |

Each step file contains its own navigation reference for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-init.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` -- HALT
- Missing PRD input document -- HALT (architecture requires a PRD)
- User explicitly requests stop -- HALT
- Required data source is inaccessible and no semantically correct alternative exists -- HALT

---

## WORKFLOW COMPLETION -- RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** -- it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
