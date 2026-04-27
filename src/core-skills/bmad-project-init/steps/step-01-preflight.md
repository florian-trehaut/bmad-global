---
nextStepFile: './step-02-detect-project.md'
---

# Step 1: Preflight and Routing

## STEP GOAL:

Assess whether `workflow-context.md` already exists, extract defaults from legacy BMAD installations if present, detect knowledge file state for downstream awareness, and route accordingly.

## MANDATORY SEQUENCE

### 1. Assess Current State

Run a comprehensive scan:

**A. New-format setup:**
- `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` exists?
- Count TODOs in existing file (`grep -c "TODO" {MAIN_PROJECT_ROOT}/.claude/workflow-context.md 2>/dev/null`)
- Check for missing required keys in workflow-context.md frontmatter

**B. Legacy BMAD installation:**
- `_bmad/` directory at project root?
- `{MAIN_PROJECT_ROOT}/.claude/workflows/` with `workflow.yaml` or `instructions.md` files?
- `{MAIN_PROJECT_ROOT}/.claude/commands/` files referencing `workflow.xml` or `workflow.yaml`?
- BMAD config files: `_bmad/bmm/config.yaml`, `_bmad/core/config.yaml`?

**C. Knowledge files state (informational only — managed by `/bmad-knowledge-bootstrap`):**

- `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` directory exists?
- Old 10-file layout detected (`stack.md`, `conventions.md`, `infrastructure.md`, `environment-config.md`, `validation.md`, `review-perspectives.md`, `investigation-checklist.md`, `tracker.md`, `comm-platform.md`, `domain-glossary.md`, `api-surface.md`)?
- New 3-file layout detected (`project.md`, `domain.md`, `api.md`)?

This information is captured for the finalize step (step-04), not used here.

**Classify the project state into ONE:**

| State | Condition | Action |
|-------|-----------|--------|
| **FRESH** | No workflow-context.md, no legacy BMAD | Full init from scratch |
| **LEGACY_ONLY** | No workflow-context.md, but `_bmad/` or legacy workflows exist | Extract defaults from legacy, then full init |
| **EXISTS** | workflow-context.md exists | Offer update — fill TODOs, refresh fields |

### 2. Present Assessment

```
Project state: {STATE}

New-format setup:
  workflow-context.md:    {EXISTS / MISSING} {N TODOs if exists}

Legacy artifacts:
  _bmad/ directory:       {YES / NO}
  Legacy workflows:       {N files in {MAIN_PROJECT_ROOT}/.claude/workflows/}

Knowledge files (informational):
  workflow-knowledge/:    {EXISTS / MISSING}
  Layout:                 {old 10-file / new 3-file / none / mixed}
```

HALT and wait for user choice:

- **FRESH**: "[C] Continue with full initialization / [Q] Quit"
- **LEGACY_ONLY**: "[E] Extract from legacy and initialize / [S] Start fresh / [Q] Quit"
- **EXISTS**: "[U] Update existing workflow-context.md / [V] Validate current setup / [Q] Quit"

### 3. Extract from Legacy (if applicable)

If state is LEGACY_ONLY and user chose Extract:

Read available BMAD config files and extract defaults:
- `_bmad/bmm/config.yaml` or `_bmad/core/config.yaml` → `user_name`, `communication_language`, `project_name`
- `{MAIN_PROJECT_ROOT}/.claude/workflows/**/workflow.yaml` → worktree templates, forge paths, branch templates

Store all extracted values as defaults for subsequent steps.

### 4. Determine Step Routing

Based on state and user choice:

- **Full init** (FRESH, or user chose Full/Start fresh): Run steps 02-04 sequentially
- **Update** (EXISTS):
  - Read existing workflow-context.md, load all current values as defaults
  - If workflow-context.md has no TODOs and all keys present: skip step-02, go to step-03 with existing values for review
  - Otherwise: run steps 02-04 to fill gaps
- **Validate only**: Run step-04 verification section inline, then END

### 5. Worktree Detection

If `git rev-parse --git-common-dir` does not return `.git` (i.e., we are in a worktree):
- Inform the user: "Running from a worktree. workflow-context.md will be written to the main repository at `{MAIN_PROJECT_ROOT}`."
- This is informational only — proceed normally.

### 6. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Project state correctly classified
- User chose action before proceeding
- Legacy values extracted if applicable
- Step routing determined

### FAILURE:

- Auto-proceeding without user choice
- Skipping legacy extraction when legacy exists
