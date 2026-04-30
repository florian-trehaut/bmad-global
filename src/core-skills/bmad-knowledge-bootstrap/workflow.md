# Knowledge Bootstrap — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

**Goal:** Generate `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` files (`project.md`, `domain.md`, `api.md`) from available knowledge sources: planning artifacts (PRD, architecture, ADRs), phase 4 specs, and/or codebase. Derives knowledge per the SDD priority pyramid (specs > ADRs > architecture > PRD > code).

**Prerequisite**: `workflow-context.md` must exist. Run `/bmad-project-init` first if missing.

---

## WORKFLOW ARCHITECTURE

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **Interactive**: Each step presents findings and asks for confirmation/correction
- **Adaptive**: Derives from whatever sources exist; HALTs only if NO source at all

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **DETECT FIRST, ASK SECOND**: Always try to infer from sources before asking the user
4. **CONFIRM, DON'T GUESS**: Present findings for user validation

---

## INITIALIZATION

### 1. Verify project root

Confirm we are in a git repository root (`git rev-parse --show-toplevel`). HALT if not.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/core/*.md`, then Read each file individually. The 5 core rules are universal. Other subdirectories (`spec/`, `teams/`, `validation/`, `lifecycle/`, `schema/`, `protocols/`, `data/`, `stacks/`) are JIT-loaded per workflow type — see `~/.claude/skills/bmad-shared/SKILL.md` for the lookup table.

Apply these rules for the entire workflow execution. Key rule: **generated knowledge must be derived from real source data — never fabricate content from assumptions.**

### 3. Resolve project root

Run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")` to resolve the main repository root. All `.claude/` file operations in this workflow use `{MAIN_PROJECT_ROOT}` as the base path. This ensures correct behavior when running from a git worktree.

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

You are a **meticulous knowledge analyst** who reads available planning artifacts, phase 4 specs, and codebase, then derives consolidated knowledge files. You:

1. Verify workflow-context.md exists (HALT to project-init if not)
2. Detect available knowledge sources (planning, specs, code)
3. Detect stack from codebase (if code present)
4. Research conventions and deeply scan available sources
5. Generate `project.md`, `domain.md`, `api.md` from templates, applying SDD priority
6. Present each file for user review before writing
7. Verify completeness, migrate legacy workflows if present
8. Synthesize a self-contained CLAUDE.local.md from generated knowledge

**Tone:** Factual, direct, thorough. Report what you found, ask what you can't infer.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- **NEVER fabricate knowledge** — every fact must trace to real sources (planning artifacts, specs, code)
- **Templates define structure only** — sources provide content
- **User review mandatory** before writing any file
- **Staleness tracking mandatory** — every knowledge file gets frontmatter with generation date + multi-source hash + content_hash
- **ZERO FALLBACK / ZERO FALSE DATA** — apply shared rules loaded at initialization
- **Adaptive sources** — derive from what's present; do NOT require all sources
- Execute ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal | Condition |
| ---- | ---- | ---- | --------- |
| 1 | `step-01-preflight.md` | Verify workflow-context.md, detect sources, classify mode, route | Always |
| 2 | `step-02-detect-stack.md` | Detect stack, frameworks, infra, source patterns | Skip if CODE_PRESENT=false |
| 3 | `step-03-research-scan.md` | Web research + deep scan of all available sources | Always |
| 4 | `step-04-generate-knowledge.md` | Generate project.md / domain.md / api.md from sources | Always |
| 5 | `step-05-review-write.md` | Per-file user review + write approved files | Always |
| 6 | `step-06-verify.md` | Verify, readiness, conditional legacy workflow migration | Always |
| 7 | `step-07-generate-claude-local.md` | Synthesize CLAUDE.local.md from knowledge files | Always |

## ENTRY POINT

Load and execute `./steps/step-01-preflight.md`.

---

## HALT CONDITIONS (GLOBAL)

- Not in a git repository → HALT
- `workflow-context.md` missing → HALT with message: "Run /bmad-project-init first to initialize project configuration."
- No knowledge sources detected (NEITHER planning artifacts NOR phase 4 specs NOR codebase) → HALT with message: "Run phase 1-3 workflows OR phase 4 specs OR add code first."
- User explicitly requests stop → HALT

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/core/retrospective-step.md`.

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
