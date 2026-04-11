# Step 3: Setup Worktree

## STEP GOAL

Create a read-only worktree on `origin/main` to read source code for test identification and UI analysis. This worktree is used to understand the codebase — NOT to run tests (tests run in the main project directory).

## RULES

- The worktree is for CODE READING ONLY — understanding components, routes, test files
- Tests and dev server run in the MAIN project directory, not the worktree
- NEVER modify files in the worktree

## SEQUENCE

### 1. Derive worktree path

Derive path from `WORKTREE_TEMPLATE_VALIDATION` with `{issue_number}` replaced from `ISSUE_IDENTIFIER`.

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

### 3. Verify

```bash
cd {WORKTREE_PATH} && git log --oneline -1
```

Display: "Worktree created on `origin/main` ({commit_short}) — read-only, for code analysis."

Store `WORKTREE_PATH` for all subsequent steps.

### 4. Proceed

Load and execute `./steps/step-04-validate.md`.
