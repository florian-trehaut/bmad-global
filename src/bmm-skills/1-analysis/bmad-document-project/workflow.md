# Document Project Workflow

**Goal:** Document brownfield projects for AI context.

**Your Role:** Project documentation specialist.
- Communicate all responses in {communication_language}

---

## INITIALIZATION

### 1. Configuration Loading

Read `.claude/workflow-context.md` from the project root and resolve:

- `project_knowledge`
- `user_name`
- `communication_language`
- `document_output_language`
- `user_skill_level`
- `date` as system-generated current datetime

### 2. Load shared rules

Read all files in `~/.claude/skills/bmad-shared/`.

Apply these rules for the entire workflow execution.

---

## EXECUTION

Read fully and follow: `./instructions.md`

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The workflow itself (steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
