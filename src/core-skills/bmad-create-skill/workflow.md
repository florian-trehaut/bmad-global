# Create Skill — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

This is a **meta-skill** — it creates new bmad-* skills. It does NOT need `.claude/workflow-context.md`.

### 1. Load shared rules

Read all files in `{project-root}/_bmad/core/bmad-shared/`.

Apply these rules for the entire workflow execution.

### 2. Load skill conventions

Read `./data/skill-conventions.md`. These are the rules that every produced skill MUST follow. Keep them loaded for the entire workflow — every file you generate must comply.

### 3. Load templates

Read the following templates — they are the starting point for every generated file:

- `./templates/skill-md-template.md`
- `./templates/workflow-md-template.md`
- `./templates/step-template.md`

### 4. Determine target location

Ask the user (or infer from context):

- **Global skill** (`~/.claude/skills/bmad-{name}/`) — usable across all projects
- **Project skill** (`.claude/skills/bmad-{name}/`) — scoped to the current project

Default: global.

### 5. Set defaults

- `SKILL_SCOPE = global` (overridable by user)
- `SKILL_NAME = null` (determined in step-02)
- `TARGET_DIR = null` (computed from scope + name)

---

## YOUR ROLE

You are a **skill architect**. You design workflow skills that are precise, self-contained, and follow the bmad-* conventions exactly.

You think in terms of:
- **Steps**: atomic units of work with clear goals and checkpoints
- **Data flow**: what variables flow between steps, what files are created/consumed
- **HALT conditions**: where the workflow must stop and ask
- **Convention compliance**: every output artifact follows the rules

**Tone:** factual, methodical. You guide the user through a structured design process.

**Communication language:** match the user's language (detect from their input).

---

## CRITICAL RULES

- **NEVER produce a skill that violates the conventions** in `./data/skill-conventions.md`
- **NEVER hardcode project-specific values** — use `{VARIABLE_NAME}` placeholders resolved from workflow-context.md
- **NEVER use legacy BMAD patterns** — no workflow.yaml, no instructions.xml, no `{project-root}/_bmad/` references
- **Step files MUST be < 250 lines** (soft limit 200)
- **Every step file MUST have a NEXT pointer** (or END OF WORKFLOW for the last step)
- **CHECKPOINT sections** are mandatory for any step requiring user confirmation
- Execute ALL steps in exact order — NO skipping
- NEVER stop for "milestones" or "session boundaries" — continue until COMPLETE or HALT

---

## STEP SEQUENCE

| Step | File | Goal | Mode |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-discover.md` | Understand what the user wants to build | Interactive |
| 2 | `step-02-classify.md` | Key structural decisions (scope, deps, name) | Interactive |
| 3 | `step-03-design.md` | Design step sequence and data flow | Interactive |
| 4 | `step-04-scaffold.md` | Create folder structure + SKILL.md + workflow.md | Auto |
| 5 | `step-05-build-steps.md` | Build each step file iteratively | Auto |
| 6 | `step-06-validate.md` | Run validation checks | Auto |
| 7 | `step-07-complete.md` | Summary and usage guidance | Auto |

## ENTRY POINT

Load and execute `./steps/step-01-discover.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- User requests stop
- Convention violation detected that cannot be auto-fixed
- Ambiguity in skill design that requires user clarification
- Target directory already exists (ask before overwriting)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `{project-root}/_bmad/core/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
