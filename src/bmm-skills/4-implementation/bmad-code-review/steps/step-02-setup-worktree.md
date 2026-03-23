---
nextStepFile: './step-03-load-context.md'
---

# Step 2: Setup Review Worktree

## STEP GOAL:

Create a review worktree checked out to the MR branch. All review work MUST happen inside this worktree.

## MANDATORY SEQUENCE

### 1. Derive Worktree Path

Use the `{WORKTREE_TEMPLATE_REVIEW}` template with `{MR_IID}` substituted.

Example: `../MyProject-review-{MR_IID}`

### 2. Check for Existing Review Worktree

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

### 3. Fetch All Refs

**CRITICAL:** Always fetch ALL refs before any comparison -- stale `origin/main` produces inflated diffs.

```bash
git fetch origin
git worktree prune
```

### 4. Create Review Worktree

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

### 5. Install Dependencies

```bash
cd {REVIEW_WORKTREE_PATH}
{INSTALL_COMMAND}
```

### 6. Store Path

Store `REVIEW_WORKTREE_PATH`.

**From this point on, ALL analysis AND fixes run inside {REVIEW_WORKTREE_PATH}.**

**CRITICAL — worktree IS the MR branch:** The local branch in this worktree tracks `origin/{MR_SOURCE_BRANCH}`. All commits made here push directly to the MR branch. There is NO "reporting" or "copying" of changes to another location. Commits and pushes happen from this worktree.

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Worktree created on MR branch (not detached), tracking origin/{MR_SOURCE_BRANCH}, deps installed
### FAILURE: Detached HEAD, working outside worktree, skipping install
