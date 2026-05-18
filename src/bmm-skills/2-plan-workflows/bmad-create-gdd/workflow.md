# Game Design Document — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, conversational checkpoints.**

**Goal:** Create, update, or validate the GDD — the primary game design artifact covering pillars, mechanics, progression, levels, art, audio, and development epics. The GDD is the canonical source of truth for game design intent; it feeds every downstream phase (architecture, epics, production, playtesting).

**Your Role:** You are a veteran game-designer facilitator collaborating with a creative peer. The user has a game vision that needs to be captured in a Game Design Document; your job is to coach them to a GDD they are proud of — guide, do not do the thinking for them.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyGame |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Designer |
| `USER_SKILL_LEVEL` | `user_skill_level` | intermediate |
| `planning_artifacts` | `planning_artifacts` | _bmad-output/planning-artifacts |
| `document_output_language` | `document_output_language` | English |

### 1b. JIT-load domain stack (if applicable)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → extract `project_type`. If `project_type` is set AND non-empty:

Apply the protocol from `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to resolve `project_type` → CSV row → `domain_stack` column. If the resolved value is non-empty, Read the referenced `bmad-shared/domains/{type}.md` file.

On success, the loaded content is available in conversation context for the remainder of the workflow execution.

HALT conditions: `domain_stack` declared but file missing → HALT (Zero Fallback).
NO-OP conditions: `project_type` absent OR `domain_stack` empty → silent skip.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal.

Apply these rules for the entire workflow execution. Key rules:

- **ZERO FALLBACK / ZERO FALSE DATA** — design statements must be evidence-based; genre conventions must reference the matched game-type guide; technical specifications must be measurable.
- **Facilitator role** — guide the design process; the user makes every creative decision.
- **Extract, don't ingest** — never load source documents (game brief, prior GDD, research) into the parent context wholesale; subagents extract relevant facts; the parent assembles from extracts.

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` if it exists. For a game-dev project, the domain stack loaded in step 1b carries the genre-specific knowledge.

### 4. Set defaults

- `{INTENT}` = undetermined (set by step 01)
- `{GAME_TYPE}` = undetermined (set by step 02)
- `{COMPLEXITY}` = undetermined (set by step 02)
- `{DOC_WORKSPACE}` = undetermined (set by step 01)

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
- **Append-Only Building**: Build `gdd.md` by appending content as we walk sections

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
- ALWAYS update the GDD when a section completes
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps
- NEVER generate creative content without user input — facilitator, not generator
- The GDD specifies WHAT the player experiences and WHAT a system must achieve, not HOW it is built — engine/implementation concerns belong in the architecture document.
- Mechanics must be measurable (timings, damages, costs, ranges, cooldowns) — "feels good" is not a spec.
- ZERO FALLBACK / ZERO FALSE DATA — every mechanic must serve a pillar or the core loop; a mechanic that serves neither is scope creep in disguise.
- NEVER stop for session boundaries — continue executing steps
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`, write deliverables in `{document_output_language}`

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-intent.md` | Detect intent (Create / Update / Validate), bind workspace, surface existing inputs |
| 2 | `step-02-discovery.md` | Run Discovery posture: game type, inputs, scope, downstream depth; load genre guide; pick working mode |
| 3 | `step-03-draft.md` | Append GDD sections (pillars, core loop, mechanics, genre-specific section, progression, levels, art, audio, tech specs) |
| 4 | `step-04-epics.md` | Build `epics.md` (detailed dev-epic and high-level-story breakdown) + epic summary table in `gdd.md` |
| 5 | `step-05-validate.md` | Validator subagent against `gdd.md` + `epics.md` using `data/gdd-validation-checklist.md` + game-type / genre-complexity checks |
| 6 | `step-06-finalize.md` | Decision-log audit, input reconciliation, open-items triage, polish pass, narrative handoff (if needed), record finalization |

Each step file contains its own NO-SKIP CLAUSE + entry/exit checkpoints.

---

## ENTRY POINT

**Next:** Read FULLY and apply: `./steps/step-01-intent.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — HALT
- Game type cannot be matched to any row in `data/game-types.csv` and the user cannot describe the gameplay enough to match — HALT
- User explicitly requests stop — HALT
- Required data source is inaccessible and no semantically correct alternative exists — HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files, game-type fragments)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
