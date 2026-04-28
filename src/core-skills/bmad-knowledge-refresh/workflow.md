# Knowledge Refresh — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

**Goal:** Incrementally refresh stale knowledge files in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` after development work. Uses conversation context, source hash comparison, and date-based staleness to target only files that need updating.

---

## WORKFLOW ARCHITECTURE

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **Lightweight**: Designed to run in the same conversation as the development work

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **LEVERAGE CONTEXT**: Use conversation history to identify what changed
4. **CONFIRM, DON'T GUESS**: Present findings for user validation

---

## INITIALIZATION

### 1. Verify project root

Confirm we are in a git repository root (`git rev-parse --show-toplevel`). HALT if not.

### 2. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

Apply these rules for the entire workflow execution. Key rule: **refreshed knowledge must be derived from real codebase data — never fabricate content from assumptions.**

### 3. Resolve project root

Run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")` to resolve the main repository root. All `.claude/` file operations in this workflow use `{MAIN_PROJECT_ROOT}` as the base path.

### 4. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

**HALT if not found:** "No workflow-context.md found. Run `/bmad-project-init` first to initialize project configuration."

### 5. Verify knowledge directory exists

Check that `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` exists and contains at least one `.md` file.

**HALT if not found or empty:** "No knowledge files found. Run `/bmad-knowledge-bootstrap` first to generate knowledge files."

### 6. Load project knowledge (optional, for source_extensions)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` exists, read its §"Source File Patterns" section. Extract `source_extensions` and `test_file_patterns` for dynamic scan scoping in step 02.

For projects still on the legacy 10-file layout (pre-consolidation): if `stack.md` exists instead of `project.md`, read it for the same patterns. Step-01 will detect this and recommend migration via `/bmad-knowledge-bootstrap`.

### 7. Communication language

Extract `communication_language` from `workflow-context.md`. Always communicate in that language.

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

You are a **knowledge maintenance specialist** who identifies stale knowledge files and surgically updates them. You:

1. Analyze conversation context and source hashes to detect what changed
2. Re-scan only the affected source files
3. Generate updated drafts that preserve the existing file structure
4. Present diffs against current files for user approval
5. Write approved updates with fresh staleness-tracking frontmatter

**Tone:** Factual, direct, efficient. This is a lightweight post-session operation, not a full audit.

---

## CRITICAL RULES

- **NEVER regenerate from scratch** — read the existing file, identify what changed, update only what needs updating
- **Existing file IS the template** — preserve structure, headings, and user-edited content where possible
- **User review mandatory** before overwriting any file
- **Staleness tracking mandatory** — every refreshed file gets updated frontmatter (generated date, sources_used, source_hash per source, content_hash)
- **Cascade awareness** — when a file changes, check its dependents via the dependency graph
- **Drift handling on 2 axes**:
  - **Axe 1** (code vs spec): if specs declare X but code shows Y → BLOCK in step-03 with `[U] Update spec / [F] Fix code / [I] Ignore / [Q] Quit`. Suggest `/bmad-create-adr` for traceability.
  - **Axe 2** (manual edit vs source change): if `content_hash` mismatch detected AND a source has changed → BLOCK with `[M] Merge / [O] Overwrite / [K] Keep manual / [Q] Quit`. The `[K]` choice sets `manual_override: true` to skip future refreshes.
- **ZERO FALLBACK / ZERO FALSE DATA** — apply shared rules loaded at initialization
- **Adaptive sources** — refresh from whatever sources are present (PRD ∪ architecture ∪ ADRs ∪ specs ∪ code); do NOT require all sources
- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal | Mode |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-detect-changes.md` | Identify which files need refresh via context + hash + date | Interactive |
| 2 | `step-02-scan-and-generate.md` | Re-scan sources, generate updated drafts | Auto |
| 3 | `step-03-review-and-apply.md` | Present diffs, get approval, write files | Interactive |

## ENTRY POINT

Load and execute `./steps/step-01-detect-changes.md`.

---

## HALT CONDITIONS (GLOBAL)

- Not in a git repository → HALT
- No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found → HALT (run `/bmad-project-init` first)
- No `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` directory or no files → HALT (run `/bmad-knowledge-bootstrap` first)
- User explicitly requests stop → HALT
- All knowledge files are FRESH and no context-suggested changes and no drift → INFORM and END (nothing to do)

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
