# Step 3: Setup Worktree

## STEP GOAL

Create a read-only worktree on `origin/main` to be able to read the code during validation (test identification, UI component structure, log format patterns, integration point protocols).

## RULES

- **MANDATORY** — this step is a non-negotiable prerequisite, even if the issue seems not to require code reading. We cannot predict in advance which VM items will require code reading.
- The worktree is READ-ONLY — NEVER modify files inside it
- Always based on `origin/main` (= latest merged code)
- If the worktree already exists — reuse it and update it

## SEQUENCE

### 1. Setup Working Environment

**Apply the worktree lifecycle rules from `bmad-shared/worktree-lifecycle.md`.**

<check if="worktree_enabled == true (or absent)">

  #### Derive path

  Use the `WORKTREE_TEMPLATE_VALIDATION` from workflow-context.md, replacing `{issue_number}` with the current issue number extracted from `ISSUE_IDENTIFIER`.

```
WORKTREE_PATH = "{WORKTREE_TEMPLATE_VALIDATION with {issue_number} replaced}"
```

  #### Check for existing worktree

```bash
git worktree list | grep "{WORKTREE_PATH base name}"
```

  **If the worktree exists:**
```bash
cd {WORKTREE_PATH}
git fetch origin
git checkout origin/main --detach
```

  **If the worktree does not exist:**
```bash
git fetch origin
git worktree add --detach {WORKTREE_PATH} origin/main
```

  Verify:
```bash
cd {WORKTREE_PATH} && git log --oneline -1
```

  Display: "Worktree created on `origin/main` ({commit_short}) — read-only."

  **Run post-creation setup** (MANDATORY — from `bmad-shared/worktree-lifecycle.md`):

```bash
cd {WORKTREE_PATH}
{install_command}      # HALT on failure
{build_command}        # HALT on failure, skip if empty
{typecheck_command}    # WARN on failure, skip if empty
```
</check>

<check if="worktree_enabled == false">
  No worktree — validate in the current project directory.

  Store `WORKTREE_PATH` = current project directory.
</check>

### 2. Store the path

`WORKTREE_PATH` is available for subsequent steps.

When the workflow needs to read code (test files, UI components, log formats, integration protocols), use this worktree.

### 3. Proceed

Load and execute `./steps/step-04-validate.md`.
