# Step 3: Setup Worktree

## STEP GOAL

Create a read-only worktree on `origin/main` to be able to read the deployed code (front-end, endpoints, routes, configs) during validation.

## RULES

- **MANDATORY** — this step is a non-negotiable prerequisite, even if the issue seems not to require code reading. We cannot predict in advance which VM items will require code reading (preparing front-end instructions, verifying an endpoint, understanding a flow).
- The worktree is READ-ONLY — NEVER modify files inside it
- Always based on `origin/main` (= code in production/staging after merge)
- If the worktree already exists — reuse it and update it

## SEQUENCE

### 1. Derive path

Use the `WORKTREE_TEMPLATE_VALIDATION` from workflow-context.md, replacing `{issue_number}` with the current issue number extracted from `ISSUE_IDENTIFIER`.

```
WORKTREE_PATH = "{WORKTREE_TEMPLATE_VALIDATION with {issue_number} replaced}"
```

### 2. Check for existing worktree

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

### 3. Store the path

`WORKTREE_PATH` is available for subsequent steps.

When the workflow needs to read code (front-end, routes, configs), use this worktree.

### 4. Proceed

Load and execute `./steps/step-04-validate.md`.
