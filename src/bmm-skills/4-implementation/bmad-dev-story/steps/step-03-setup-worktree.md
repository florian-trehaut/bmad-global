---
nextStepFile: './step-04-check-mr.md'
---

# Step 3: Setup Worktree

## STEP GOAL:

Create or enter the git worktree for this issue. All implementation work MUST happen inside the worktree (or on a dedicated branch if worktrees are disabled) — NEVER on the main branch.

## MANDATORY SEQUENCE

### 1. Derive Paths

- WORKTREE_PATH: from `{WORKTREE_TEMPLATE_DEV}` with `{ISSUE_NUMBER}` and `{SHORT_DESCRIPTION}` substituted
- BRANCH_NAME: from `{BRANCH_TEMPLATE}` with `{ISSUE_NUMBER}` and `{SHORT_DESCRIPTION}` substituted

### 2. Setup Working Environment

**Apply the worktree lifecycle rules from `bmad-shared/worktree-lifecycle.md`.**

<check if="worktree_enabled == true (or absent)">

  #### Check for Existing Worktree

```bash
git worktree list | grep "{WORKTREE_PREFIX}-{ISSUE_NUMBER}"
```

  <check if="worktree exists">
    Enter existing worktree and update:

```bash
cd {WORKTREE_PATH}
git fetch origin
git rebase origin/main
```

    <check if="rebase conflict">
      HALT — report conflict to user, do NOT force resolve
    </check>
    Verify clean state: `git status`
  </check>

  <check if="no worktree exists">
    Fetch and check for remote branch:

```bash
git fetch origin
git branch -r | grep "origin/{BRANCH_NAME}"
```

    <check if="remote branch exists">
```bash
# CRITICAL: use -B to create a LOCAL branch tracking the remote — avoids detached HEAD
git worktree add -B {BRANCH_NAME} {WORKTREE_PATH} origin/{BRANCH_NAME}
cd {WORKTREE_PATH}
# Verify NOT detached — if this prints empty, HALT
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then echo "FATAL: detached HEAD in worktree" && exit 1; fi
echo "On branch: $CURRENT_BRANCH"
git rebase origin/main
```
    </check>

    <check if="no remote branch">
```bash
git worktree add -b {BRANCH_NAME} {WORKTREE_PATH} origin/main
cd {WORKTREE_PATH}
# Verify NOT detached
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then echo "FATAL: detached HEAD in worktree" && exit 1; fi
echo "On branch: $CURRENT_BRANCH"
```
    </check>
  </check>

  **Run post-creation setup** (MANDATORY — from `bmad-shared/worktree-lifecycle.md`):

```bash
cd {WORKTREE_PATH}
{install_command}      # HALT on failure
{build_command}        # HALT on failure, skip if empty
{typecheck_command}    # WARN on failure, skip if empty
```
</check>

<check if="worktree_enabled == false">
  No worktree — create a branch in the current repo:

```bash
git fetch origin main
git checkout -b {BRANCH_NAME} origin/main
```

  <check if="branch already exists">
```bash
git checkout {BRANCH_NAME}
git rebase origin/main
```
    <check if="rebase conflict">
      HALT — report conflict to user, do NOT force resolve
    </check>
  </check>

  Store `WORKTREE_PATH` = current project directory.
</check>

### 3. Initialize Progress Tracker

```bash
cat > {WORKTREE_PATH}/agent-progress.md << 'EOF'
# Agent Progress — {ISSUE_IDENTIFIER}

## Status
current_step: 3
last_completed: worktree_setup
timestamp: {date}

## Context
worktree_path: {WORKTREE_PATH}
branch: {BRANCH_NAME}
issue_identifier: {ISSUE_IDENTIFIER}

## Step Log
- [x] Step 1-2: Issue discovered and loaded
- [x] Step 3: Worktree setup
- [ ] Step 4-5: Context loaded
- [ ] Step 6: Marked in progress
- [ ] Step 7-8: Plan and implementation
- [ ] Step 9-10: Journey tests and validation
- [ ] Step 11-12: Review and traceability
- [ ] Step 13-14: MR and completion
EOF
```

**From this point on, ALL commands run inside {WORKTREE_PATH}.**

### 4. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Worktree created/entered (or branch checked out), deps installed, build run, progress tracker initialized

### FAILURE: Working outside worktree/branch, skipping install/build, ignoring rebase conflicts
