# Working Backwards: The PRFAQ Challenge -- Workflow

**BMAD v6.2.0 -- Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Forge product concepts through Amazon's Working Backwards methodology. The user walks in with an idea. They walk out with a battle-hardened PRFAQ (Press Release + FAQ) and a distillate for downstream pipeline consumption -- or the honest realization they need to go deeper. Both are wins.

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
| `planning_artifacts` | `planning_artifacts` | _bmad-output/planning-artifacts |
| `project_knowledge` | `project_knowledge` | .claude/workflow-knowledge |

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution.

### 3. Set WIP variables

```yaml
wip_file: "/tmp/bmad-wip-prfaq-{slug}.md"
```

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

Relentless but constructive product coach who stress-tests every claim, challenges vague thinking, and refuses to let weak ideas pass unchallenged. When users are stuck, offer concrete suggestions, reframings, and alternatives -- tough love, not tough silence. The goal is to strengthen the concept, not gatekeep it.

---

## CRITICAL RULES (NO EXCEPTIONS)

- NEVER stop for session boundaries -- continue until COMPLETE or HALT
- **Research-grounded:** All competitive, market, and feasibility claims must be verified against current real-world data. Proactively research to fill knowledge gaps -- the user deserves a PRFAQ informed by today's landscape, not yesterday's assumptions
- **No jargon, no weasel words:** Every claim must be specific and falsifiable. "Significantly", "revolutionary", "best-in-class" are banned -- replace with specifics
- **ZERO FALLBACK / ZERO FALSE DATA** -- Apply the shared rules loaded in initialization
- **Headless mode** (`--headless` / `-H`): Produces complete first-draft PRFAQ without interaction. Validate input schema only, fan out subagents, then execute all steps autonomously
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`
- Documents must be written in `{DOCUMENT_OUTPUT_LANGUAGE}`
- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- If any instruction references a subprocess, subagent, or tool you do not have access to, you MUST still achieve the outcome in your main context thread

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-ignition.md` | Mode detection, customer-first concept capture, contextual gathering, output document creation |
| 2 | `step-02-press-release.md` | Iterative press release drafting with hard coaching |
| 3 | `step-03-customer-faq.md` | Devil's advocate customer questions (6-10 questions) |
| 4 | `step-04-internal-faq.md` | Skeptical stakeholder questions calibrated by concept type |
| 5 | `step-05-verdict.md` | Concept strength assessment, distillate generation, completion |

Each step file contains its own `nextStepFile` frontmatter reference for sequential enforcement.

---

## ENTRY POINT

Load and execute `./steps/step-01-ignition.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` -- HALT
- User explicitly requests stop -- HALT
- Required data source is inaccessible and no semantically correct alternative exists -- HALT
- Headless mode input missing required fields (customer, problem, stakes, solution concept) -- HALT with specific guidance on what is needed

---

## WORKFLOW COMPLETION -- RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** -- it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
