---
nextStepFile: './step-02-detect-project.md'
---

# Step 1: Preflight and Inventory

## STEP GOAL:

Assess the project's current state, inventory existing configuration and knowledge files, determine what needs to be done, and route to the appropriate steps.

## MANDATORY SEQUENCE

### 1. Assess Current State

Run a comprehensive scan:

**A. New-format setup:**
- `.claude/workflow-context.md` exists?
- `.claude/workflow-knowledge/` directory exists? Which files?
- Count TODOs in existing files (`grep -rc "TODO" .claude/workflow-context.md .claude/workflow-knowledge/*.md 2>/dev/null`)
- Check for missing required keys in workflow-context.md frontmatter

**B. Legacy BMAD installation:**
- `_bmad/` directory at project root?
- `.claude/workflows/` with `workflow.yaml` or `instructions.md` files?
- `.claude/commands/` files referencing `workflow.xml` or `workflow.yaml`?
- BMAD config files: `_bmad/bmm/config.yaml`, `_bmad/core/config.yaml`?

**C. Knowledge file staleness (if files exist):**

For each existing knowledge file, check staleness:
- `MISSING` — file not in workflow-knowledge/
- `FOUND_STALE` — no `generated` frontmatter OR `generated` date > 7 days ago
- `FOUND_FRESH` — `generated` date ≤ 7 days

**Classify the project into ONE state:**

| State | Condition | Action |
|-------|-----------|--------|
| **FRESH** | No workflow-context.md, no legacy | Full init from scratch |
| **LEGACY_ONLY** | No workflow-context.md, but `_bmad/` or legacy workflows exist | Extract from legacy, then full init |
| **PARTIAL_INIT** | workflow-context.md exists but has TODOs, missing keys, or stale/incomplete knowledge files | Resume: fill gaps, update stale content |
| **MIGRATION_IN_PROGRESS** | workflow-context.md exists AND legacy files still present | Complete: fill gaps, migrate, cleanup |
| **COMPLETE** | workflow-context.md exists, no TODOs, knowledge files current, no legacy artifacts | Offer: update, validate |

### 2. Present Assessment

```
Project state: {STATE}

New-format setup:
  workflow-context.md:    {EXISTS / MISSING} {N TODOs if exists}
  workflow-knowledge/:    {N of 9 files present} ({N fresh, N stale, N missing})

Legacy artifacts:
  _bmad/ directory:       {YES / NO}
  Legacy workflows:       {N files in .claude/workflows/}
  Extractable config:     {YES / NO}
```

HALT and wait for user choice:

- **FRESH**: "[C] Continue with full initialization"
- **LEGACY_ONLY**: "[E] Extract from legacy and initialize / [S] Start fresh / [Q] Quit"
- **PARTIAL_INIT**: "[R] Resume (fill gaps + refresh stale) / [F] Full re-init / [Q] Quit"
- **MIGRATION_IN_PROGRESS**: "[R] Resume and complete migration / [C] Cleanup legacy only / [Q] Quit"
- **COMPLETE**: "[U] Update with new detections / [V] Validate current setup / [Q] Quit"

### 3. Extract from Legacy (if applicable)

If state is LEGACY_ONLY or MIGRATION_IN_PROGRESS and user chose Extract/Resume:

Read available BMAD config files and extract defaults:
- `_bmad/bmm/config.yaml` or `_bmad/core/config.yaml` → `user_name`, `communication_language`, `project_name`
- `.claude/workflows/**/workflow.yaml` → worktree templates, forge paths, branch templates

Store all extracted values as defaults for subsequent steps.

### 4. Determine Step Routing

Based on state and user choice:

- **Full init** (FRESH, or user chose Full/Start fresh): Run steps 02 through 08
- **Resume** (PARTIAL_INIT, MIGRATION_IN_PROGRESS):
  - Read existing workflow-context.md, load all current values as defaults
  - If workflow-context.md has no TODOs and all keys present: skip steps 02-04, go to step 05
  - Otherwise: run steps 02-04 to fill gaps, then 05-08
  - Always run step 08
- **Cleanup only**: Jump directly to step 08
- **Validate only**: Run step 08's verification section inline, then END

### 5. Create Target Directories

```bash
mkdir -p .claude/workflow-knowledge
```

### 6. Determine TARGET_FILES for Knowledge Generation

For knowledge file generation (steps 05-07), determine which files to generate:

- **Full init**: All 9 knowledge files
- **Resume**: Missing + stale files only (user can override with [F] Force all)
- **Update**: Only stale files

Present knowledge file inventory:

| File | Status |
|------|--------|
| stack.md | {MISSING/STALE/FRESH} |
| infrastructure.md | {MISSING/STALE/FRESH} |
| conventions.md | {MISSING/STALE/FRESH} |
| review-perspectives.md | {MISSING/STALE/FRESH} |
| tracker.md | {MISSING/STALE/FRESH} |
| environment-config.md | {MISSING/STALE/FRESH} |
| investigation-checklist.md | {MISSING/STALE/FRESH} |
| domain-glossary.md | {MISSING/STALE/FRESH} |
| api-surface.md | {MISSING/STALE/FRESH} |

Store TARGET_FILES list.

### 7. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Project state correctly classified
- User chose action before proceeding
- Legacy values extracted if applicable
- Step routing determined
- TARGET_FILES list built

### FAILURE:

- Auto-proceeding without user choice
- Classifying MIGRATION_IN_PROGRESS as COMPLETE
- Skipping legacy extraction when legacy exists
