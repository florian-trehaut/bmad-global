# Step 3: Setup Investigation Worktree

## STEP GOAL

Set up a read-only working environment synced with `origin/main` for code investigation. All code verification in subsequent steps must happen on the latest main. Apply the unified worktree lifecycle protocol from `bmad-shared/worktree-lifecycle.md`.

## RULES

- The worktree is READ-ONLY — no code changes, only investigation
- If the protocol fails, HALT — code verification requires a working environment

## SEQUENCE

### 1. Derive Paths

- `WORKTREE_PATH_EXPECTED`: substitute into `{WORKTREE_TEMPLATE_SPEC}` from `workflow-context.md` (`worktree_templates.quick_spec`), replacing `{slug}` with:
  - **Discovery mode:** the derived slug
  - **Enrichment mode:** `{EPIC_SLUG}-{ISSUE_IDENTIFIER}`
- `BRANCH_NAME`: `create-story/{slug_or_identifier}`

### 2. Apply the Worktree Lifecycle Protocol

**Apply the full protocol from `bmad-shared/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `read-only` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `{BRANCH_NAME}` |
| `worktree_branch_strategy` | `feature-branch` |
| `worktree_alignment_check` | `CURRENT_BRANCH == main` OR `CURRENT_BRANCH == master` OR `CURRENT_BRANCH == ""` (detached) |

After the protocol completes, set `SPEC_WORKTREE_PATH = WORKTREE_PATH`. Log: "Working environment ready: {SPEC_WORKTREE_PATH}"

### 3. Proceed

**From this point on, ALL code investigation runs inside {SPEC_WORKTREE_PATH}.**

---

**Next:** Read fully and follow `./step-04-investigate.md`
