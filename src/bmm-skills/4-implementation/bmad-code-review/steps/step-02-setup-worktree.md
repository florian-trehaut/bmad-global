---
nextStepFile: './step-03-load-context.md'
---

# Step 2: Setup Review Worktree

## STEP GOAL:

Create a review worktree checked out to the MR branch. All review work MUST happen inside this worktree (or on the MR branch if worktrees are disabled).

## MANDATORY SEQUENCE

### 1. Setup Working Environment

**Apply the worktree lifecycle rules from `bmad-shared/worktree-lifecycle.md`.**

<check if="worktree_enabled == true (or absent)">

  #### Derive Worktree Path

  Use the `{WORKTREE_TEMPLATE_REVIEW}` template with `{MR_IID}` substituted.

  Example: `../MyProject-review-{MR_IID}`

  #### Check for Existing Review Worktree

```bash
git worktree list | grep "review-{MR_IID}"
```

  <check if="worktree exists">
    Safely remove existing worktree before recreation:

```bash
git fetch origin
# Remove the existing worktree (safe -- review worktrees have no local changes to preserve)
git worktree remove {REVIEW_WORKTREE_PATH} --force 2>/dev/null || true
# Also prune stale worktree entries
git worktree prune
```
  </check>

  #### Fetch All Refs

  **CRITICAL:** Always fetch ALL refs before any comparison -- stale `origin/main` produces inflated diffs.

```bash
git fetch origin
git worktree prune
```

  #### Create Review Worktree

  **CRITICAL:** `git worktree add PATH origin/BRANCH` creates a detached HEAD. ALWAYS use `-B` to create a local branch tracking the remote.

```bash
# Remove any existing worktree that holds the branch name
EXISTING_WT=$(git worktree list | grep "{MR_SOURCE_BRANCH}" | awk '{print $1}')
if [ -n "$EXISTING_WT" ]; then
  git worktree remove "$EXISTING_WT" --force 2>/dev/null || true
  git worktree prune
fi
# CRITICAL: -B creates a LOCAL branch tracking remote -- avoids detached HEAD
git worktree add -B review-{MR_IID} {REVIEW_WORKTREE_PATH} origin/{MR_SOURCE_BRANCH}
cd {REVIEW_WORKTREE_PATH}
# VERIFY not detached -- if empty, HALT immediately
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then echo "FATAL: detached HEAD in worktree -- HALT" && exit 1; fi
echo "On branch: $CURRENT_BRANCH"
git log -1 --oneline
```

  **HALT if detached HEAD:** The worktree MUST NOT be in detached HEAD state. Detached HEAD prevents commits and causes errors during fix application. If `git branch --show-current` returns empty, the worktree was created incorrectly.

  **Run post-creation setup** (MANDATORY — from `bmad-shared/worktree-lifecycle.md`):

```bash
cd {REVIEW_WORKTREE_PATH}
{install_command}      # HALT on failure
{build_command}        # HALT on failure, skip if empty
{typecheck_command}    # WARN on failure, skip if empty
```
</check>

<check if="worktree_enabled == false">
  No worktree — checkout MR branch in the current repo:

```bash
git fetch origin
git checkout {MR_SOURCE_BRANCH}
```

  Store `REVIEW_WORKTREE_PATH` = current project directory.
</check>

### 2. Store Path

Store `REVIEW_WORKTREE_PATH`.

**From this point on, ALL analysis AND fixes run inside {REVIEW_WORKTREE_PATH}.**

**CRITICAL — worktree IS the MR branch:** The local branch in this worktree tracks `origin/{MR_SOURCE_BRANCH}`. All commits made here push directly to the MR branch. There is NO "reporting" or "copying" of changes to another location. Commits and pushes happen from this worktree.

Proceed to {nextStepFile}.

## WORKTREE INVARIANT (enforced by all subsequent steps)

**REVIEW_WORKTREE_PATH must be set and point to a valid directory before ANY subsequent step executes.**

All steps from step-03 onward MUST verify this at entry:
- `REVIEW_WORKTREE_PATH` is set and non-empty
- The directory exists
- `git branch --show-current` inside the worktree returns a branch name (unless `worktree_enabled: false` and the check was done at checkout)

**If any check fails → HALT: "No valid worktree. Step 02 must complete successfully before continuing."**

This invariant exists because: skipping the worktree causes all file reads to target the main repo (wrong branch), producing a review based on stale code.

## SUCCESS/FAILURE:

### SUCCESS: Worktree created on MR branch (not detached), tracking origin/{MR_SOURCE_BRANCH}, deps installed, build run, REVIEW_WORKTREE_PATH stored

### FAILURE: Detached HEAD, working outside worktree, skipping install/build, REVIEW_WORKTREE_PATH not set
