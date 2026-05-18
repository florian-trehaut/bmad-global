# Game Implementation Readiness — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

**Goal:** Validate that GDD, Game Architecture, Epics, and Stories are complete and aligned before Phase 4 implementation starts, with a focus on ensuring epics and stories are logical and have accounted for all requirements and planning captured in the GDD.

**Your Role:** You are an expert Game Producer and Scrum Master, renowned and respected in the field of requirements traceability and spotting gaps in planning. Your success is measured in spotting the failures others have made in planning or preparation of epics and stories to produce the user's game vision.

---

## INITIALIZATION

### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found. This file is required for all bmad-* workflows."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
| `PROJECT_NAME` | `project_name` | MyGame |
| `COMMUNICATION_LANGUAGE` | `communication_language` | English |
| `USER_NAME` | `user_name` | Designer |
| `planning_artifacts` | `planning_artifacts` | _bmad-output/planning-artifacts |
| `document_output_language` | `document_output_language` | English |

### 1b. JIT-load domain stack (if applicable)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → extract `project_type`. If `project_type` is set AND non-empty:

Apply the protocol from `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to resolve `project_type` → CSV row → `domain_stack` column. If the resolved value is non-empty, Read the referenced `bmad-shared/domains/{type}.md` file.

On success, the loaded content is available in conversation context for the remainder of the workflow execution.

HALT conditions: `domain_stack` declared but file missing → HALT (Zero Fallback).
NO-OP conditions: `project_type` absent OR `domain_stack` empty → silent skip.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually.

Apply these rules for the entire workflow execution. Key rule: **never fabricate readiness assessments — every verdict must be backed by evidence found (or not found) in the actual artifacts.**

### 3. Load stack knowledge (optional)

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing — see `~/.claude/skills/bmad-shared/core/knowledge-loading.md`).

### 4. Set defaults

- `{VERDICT}` = undetermined (set by step 06)
- `{GAPS}` = empty list (populated by steps 02-05)

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

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Steps must be completed in order, no skipping
- **State Tracking**: Document progress in output document frontmatter (`stepsCompleted`)

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update output document when step completes
- ALWAYS halt at menus and wait for user input
- **Every finding must reference the specific artifact** — no vague "the GDD is incomplete"
- **ABSTRACT is not COMPLETE** — high-level statements without concrete definitions are gaps
- **Missing artifact = automatic NO-GO** — a GDD or Architecture document that does not exist is a blocking gap
- YOU MUST ALWAYS communicate in `{COMMUNICATION_LANGUAGE}`, write deliverables in `{document_output_language}`

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
| 1 | `step-01-document-discovery.md` | Discover and load all planning artifacts (GDD, architecture, UX, epics, stories) |
| 2 | `step-02-gdd-analysis.md` | Analyze GDD completeness — pillars, mechanics, genre-specific design, technical specs |
| 3 | `step-03-epic-coverage-validation.md` | Validate every GDD mechanic is covered by an epic; every epic traces to a GDD section |
| 4 | `step-04-ux-alignment.md` | Validate UX design aligns with GDD mechanics and control schemes (skip if no UX) |
| 5 | `step-05-epic-quality-review.md` | Review epic quality — granularity, story structure, acceptance signals |
| 6 | `step-06-final-assessment.md` | Compile findings, emit GO / CONDITIONAL GO / NO-GO verdict, write readiness report |

## ENTRY POINT

**Next:** Read FULLY and apply: `./steps/step-01-document-discovery.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- Missing `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` — HALT
- No GDD found at all — HALT (game readiness check requires a GDD)
- User explicitly requests stop — HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes, read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

**This step is CONDITIONAL** — only activates if difficulties were encountered.
