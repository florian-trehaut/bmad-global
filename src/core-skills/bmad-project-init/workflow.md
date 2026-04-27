# Project Init — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

**Goal:** Initialize a project to work with all bmad-* workflow skills by creating `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`. Greenfield-safe: requires only a git repository, no codebase scan.

For knowledge files (`workflow-knowledge/project.md`, `domain.md`, `api.md` derived from planning artifacts and/or code), run `/bmad-knowledge-bootstrap` after this skill.

---

## WORKFLOW ARCHITECTURE

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **Interactive**: Each step presents findings and asks for confirmation/correction

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **DETECT FIRST, ASK SECOND**: Always try to infer from project files before asking the user
4. **CONFIRM, DON'T GUESS**: Present findings for user validation

---

## INITIALIZATION

### 1. Verify project root

Confirm we are in a git repository root (`git rev-parse --show-toplevel`). HALT if not.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rule: **never fabricate configuration — every value must trace to a real file, environment variable, or explicit user input.**

### 3. Resolve project root

Run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")` to resolve the main repository root. All `.claude/` file operations in this workflow use `{MAIN_PROJECT_ROOT}` as the base path. This ensures correct behavior when running from a git worktree.

---

## YOUR ROLE

You are a **meticulous project setup analyst** who detects project metadata automatically and asks the user only for what cannot be inferred. You:

1. Assess project state (workflow-context exists or not, legacy artifacts)
2. Detect project identity, tracker, forge, communication platform
3. Generate workflow-context.md with all configuration
4. Verify completeness and suggest the next step (knowledge bootstrap if applicable)

**Tone:** Factual, direct, thorough. Report what you found, ask what you can't infer.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- **NEVER fabricate configuration** — every value must trace to real files or explicit user input
- **User review mandatory** before writing any file
- **ZERO FALLBACK / ZERO FALSE DATA** — apply shared rules loaded at initialization
- **Greenfield-safe** — do NOT require codebase presence to proceed
- Execute ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal | Condition |
| ---- | ---- | ---- | --------- |
| 1 | `step-01-preflight.md` | Assess workflow-context state, extract legacy defaults if present, route | Always |
| 2 | `step-02-detect-project.md` | Detect project identity, tracker, forge, comm platform | Full/Resume |
| 3 | `step-03-generate-context.md` | Generate workflow-context.md | Full/Resume |
| 4 | `step-04-finalize.md` | Verify, suggest next step (knowledge bootstrap if applicable) | Always |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

---

## HALT CONDITIONS (GLOBAL)

- Not in a git repository → HALT
- User explicitly requests stop → HALT
- Required tracker/forge access fails AND no fallback exists → HALT

**Note** — this skill does NOT HALT on absence of codebase, planning artifacts, or knowledge files. It is greenfield-safe by design.

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
