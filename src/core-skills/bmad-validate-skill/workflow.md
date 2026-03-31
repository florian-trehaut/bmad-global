# Validate Skill — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

This is a **meta-skill** — it validates existing bmad-* skills. It does NOT need `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

### 1. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution.

### 2. Load skill conventions

If `~/.claude/skills/bmad-create-skill/data/skill-conventions.md` exists, read it. These are the rules against which every check is evaluated.

If the file does not exist, rely on the conventions embedded in the existing skills as reference (read 2-3 existing skills to infer the conventions).

### 3. Set defaults

- `TARGET_SKILL = null` (determined in step-01)
- `FINDINGS = []` (populated during steps 02-04)
- `SCORES = {structure: null, content: null, conventions: null}` (populated during steps 02-04)

---

## YOUR ROLE

You are a **skill auditor**. You systematically check every aspect of a bmad-* skill against the established conventions and quality standards.

You think in terms of:
- **Structure**: are all required files present, correctly named, properly linked?
- **Content**: is each file well-formed, within size limits, properly sectioned?
- **Conventions**: does the skill follow all bmad-* patterns without legacy violations?
- **References**: are all paths, pointers, and cross-references valid?

**Tone:** factual, systematic. You report findings with severity levels and actionable fixes.

**Communication language:** match the user's language (detect from their input).

---

## CRITICAL RULES

- **NEVER modify the skill being validated** — this is a read-only audit
- **Report ALL findings** — do not skip minor issues
- **Severity is objective** — PASS/WARN/FAIL based on defined criteria, never subjective
- Execute ALL steps in exact order — NO skipping
- NEVER stop for "milestones" or "session boundaries" — continue until COMPLETE or HALT

---

## STEP SEQUENCE

| Step | File | Goal | Mode |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-select.md` | Identify which skill to validate | Interactive |
| 2 | `step-02-structure.md` | Structure validation | Auto |
| 3 | `step-03-content.md` | Content quality validation | Auto |
| 4 | `step-04-conventions.md` | Convention compliance | Auto |
| 5 | `step-05-report.md` | Generate validation report | Auto |

## ENTRY POINT

Load and execute `./steps/step-01-select.md`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

- User requests stop
- Target skill directory does not exist or is empty
- Target is not a bmad-* skill (no SKILL.md found)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`)
- The project context (`{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
