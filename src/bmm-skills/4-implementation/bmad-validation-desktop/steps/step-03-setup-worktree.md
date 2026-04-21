# Step 3: Setup Worktree

## STEP GOAL

Set up a read-only working environment on `origin/main` to read code during validation (test identification, UI component structure, log format patterns, integration point protocols). Apply the unified worktree lifecycle protocol from `bmad-shared/worktree-lifecycle.md`.

## RULES

- **MANDATORY** — this step is a non-negotiable prerequisite, even if the issue seems not to require code reading. We cannot predict in advance which VM items will require code reading.
- The worktree is READ-ONLY — NEVER modify files inside it
- Always based on `origin/main` (= latest merged code)

## SEQUENCE

### 1. Derive Paths

- `WORKTREE_PATH_EXPECTED`: substitute `{issue_number}` (from `ISSUE_IDENTIFIER`) into `{WORKTREE_TEMPLATE_VALIDATION}` from `workflow-context.md`.

### 2. Apply the Worktree Lifecycle Protocol

**Apply the full protocol from `bmad-shared/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `read-only` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `null` |
| `worktree_branch_strategy` | `detached` |
| `worktree_alignment_check` | `CURRENT_BRANCH == main` OR `CURRENT_BRANCH == master` OR `CURRENT_BRANCH == ""` (detached) |

After the protocol completes, `WORKTREE_PATH` is set. Log: "Worktree ready on `origin/main` — read-only."

### 3. Proceed

`WORKTREE_PATH` is available for subsequent steps.

When the workflow needs to read code (test files, UI components, log formats, integration protocols), use this worktree.

Load and execute `./steps/step-04-validate.md`.
