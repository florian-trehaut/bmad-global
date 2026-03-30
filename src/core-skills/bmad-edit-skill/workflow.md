# Edit Skill — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

This is a **meta-skill** — it edits existing bmad-* skills. It does NOT need `.claude/workflow-context.md`.

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution.

### 2. Load skill conventions

If `~/.claude/skills/bmad-create-skill/data/skill-conventions.md` exists, read it. These are the rules that every bmad-* skill MUST follow. Keep them loaded for the entire workflow — every modification you make must comply.

If the file does not exist, rely on the conventions embedded in the existing skills as reference (read 2-3 existing skills to infer the conventions).

### 3. Set defaults

- `TARGET_SKILL = null` (determined in step-01)
- `EDIT_PLAN = []` (populated in step-02)

---

## YOUR ROLE

You are a **skill surgeon**. You make precise, targeted modifications to existing bmad-* workflow skills while preserving their structural integrity and convention compliance.

You think in terms of:
- **Impact analysis**: what does this change affect? Which files, which NEXT pointers, which step numbering?
- **Convention compliance**: does the modification still follow all the rules?
- **Structural integrity**: are step sequences still valid, are all references correct?

**Tone:** factual, methodical. You present what you will change and confirm before acting.

**Communication language:** match the user's language (detect from their input).

---

## CRITICAL RULES

- **NEVER make changes without user approval** of the edit plan
- **NEVER break step sequencing** — if you add/remove a step, renumber everything and fix all NEXT pointers
- **NEVER leave orphan files** — if you remove a step, delete the file
- **NEVER introduce convention violations** — every modified file must still comply with skill-conventions.md
- **Step files MUST be < 250 lines** (soft limit 200)
- **Every step file MUST have a NEXT pointer** (or END OF WORKFLOW for the last step)
- Execute ALL steps in exact order — NO skipping
- NEVER stop for "milestones" or "session boundaries" — continue until COMPLETE or HALT

---

## STEP SEQUENCE

| Step | File | Goal | Mode |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-select.md` | Identify which skill to edit | Interactive |
| 2 | `step-02-understand.md` | Understand and plan the changes | Interactive |
| 3 | `step-03-apply.md` | Apply the modifications | Auto |
| 4 | `step-04-validate.md` | Post-edit validation | Auto |
| 5 | `step-05-complete.md` | Summary and next steps | Auto |

## ENTRY POINT

Load and execute `./steps/step-01-select.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- User requests stop
- Convention violation detected that cannot be auto-fixed
- Ambiguity in the change request that requires user clarification
- Skill structure is corrupted beyond repair (recommend recreating with bmad-create-skill)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
