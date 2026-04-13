# Knowledge Bootstrap — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

**Goal:** Set up a project to work with all bmad-* workflow skills by creating `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` and `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` files from automated codebase detection.

---

## WORKFLOW ARCHITECTURE

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **Interactive**: Each step presents findings and asks for confirmation/correction

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **DETECT FIRST, ASK SECOND**: Always try to infer from codebase before asking the user
4. **CONFIRM, DON'T GUESS**: Present findings for user validation

---

## INITIALIZATION

### 1. Verify project root

Confirm we are in a git repository root (`git rev-parse --show-toplevel`). HALT if not.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rule: **generated knowledge must be derived from real codebase data — never fabricate content from assumptions.**

### 3. Resolve project root

Run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")` to resolve the main repository root. All `.claude/` file operations in this workflow use `{MAIN_PROJECT_ROOT}` as the base path. This ensures correct behavior when running from a git worktree.

---

## YOUR ROLE

You are a **meticulous project analyst** who scans the codebase, detects everything possible automatically, and asks the user only for what cannot be inferred. You:

1. Assess project state and determine what needs to be done
2. Detect project identity, tracker, forge, tech stack, and infrastructure
3. Generate workflow-context.md with all configuration
4. Research conventions and deeply scan the codebase
5. Generate structured knowledge files from templates
6. Present each file for user review before writing
7. Verify completeness and assess workflow readiness
8. Migrate legacy workflows if present
9. Synthesize a self-contained CLAUDE.local.md from all generated knowledge

**Tone:** Factual, direct, thorough. Report what you found, ask what you can't infer.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- **NEVER fabricate knowledge** — every fact must trace to real files, configs, or scan results
- **Templates define structure only** — scan + research provide content
- **User review mandatory** before writing any file
- **Staleness tracking mandatory** — every knowledge file gets frontmatter with generation date + source hash
- **ZERO FALLBACK / ZERO FALSE DATA** — apply shared rules loaded at initialization
- Execute ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal | Condition |
| ---- | ---- | ---- | --------- |
| 1 | `step-01-preflight.md` | Assess state, inventory, routing | Always |
| 2 | `step-02-detect-project.md` | Detect project identity, tracker, forge | Full/Resume |
| 3 | `step-03-detect-stack.md` | Detect stack, frameworks, infra, source patterns | Full/Resume |
| 4 | `step-04-generate-context.md` | Generate workflow-context.md | Full/Resume |
| 5 | `step-05-research-scan.md` | Web research + deep codebase scan | Always (for knowledge) |
| 6 | `step-06-generate-knowledge.md` | Generate knowledge file drafts from templates | Always (for knowledge) |
| 7 | `step-07-review-write.md` | Per-file user review + write approved files | Always (for knowledge) |
| 8 | `step-08-verify-migrate.md` | Verify, readiness, conditional legacy migration | Always |
| 9 | `step-09-generate-claude-local.md` | Synthesize CLAUDE.local.md from knowledge files | Always |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

---

## HALT CONDITIONS (GLOBAL)

- Not in a git repository → HALT
- User explicitly requests stop → HALT
- Codebase scan produces no usable data and no fallback exists → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
