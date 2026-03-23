---
nextStepFile: './step-05-regression-risk.md'
---

# Step 4: Discover Actual Changes

## STEP GOAL:

Analyze the MR diff to understand scope, impacted services/packages, and build the review attack plan.

## MANDATORY SEQUENCE

### 1. Git Diff Analysis

Run git commands inside {REVIEW_WORKTREE_PATH}:

```bash
cd {REVIEW_WORKTREE_PATH}
git diff --name-only origin/{MR_TARGET_BRANCH}...HEAD
git diff --stat origin/{MR_TARGET_BRANCH}...HEAD
```

### 2. Forge API Diff (for DiffNote line numbers)

Get the diff from the forge API to obtain accurate line numbers for posting DiffNotes later:

```bash
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}/changes" | \
  jq -r '.changes[] | "\n=== \(.new_path) ===\n\(.diff)"'
```

### 3. Summarize Changes

Build a summary:

- Total files changed, lines added/removed
- Impacted services/packages (parse paths for `apps/*/`, `packages/*/`, `libs/*/`)
- Types of changes: domain logic, API, infrastructure, tests, config, migrations

### 4. Build Review Attack Plan

<check if="LINKED_TRACKER_ISSUE exists">
  Cross-reference issue description tasks vs git reality:
  - Which ACs have corresponding code changes?
  - Which ACs have NO visible implementation?
  - Are there code changes NOT covered by any AC?
  Build review attack plan based on ACs and tasks from issue description.
</check>

<check if="no LINKED_TRACKER_ISSUE">
  Build review attack plan based on MR description and diff only.
</check>

Store: `CHANGED_FILES`, `DIFF_STATS`, `IMPACTED_SERVICES`, `ATTACK_PLAN`.

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Full diff analyzed, impacted services identified, attack plan built
### FAILURE: Proceeding without understanding the diff scope
