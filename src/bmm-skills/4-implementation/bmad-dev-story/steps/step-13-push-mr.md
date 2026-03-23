---
nextStepFile: './step-14-complete.md'
---

# Step 13: Push & Merge Request

## STEP GOAL:

Push the branch and create or update the forge Merge Request.

## MANDATORY SEQUENCE

### 1. Push Branch

```bash
cd {WORKTREE_PATH}
git push -u origin {BRANCH_NAME}
```

### 2. Create or Update MR

<check if="MR_IID is null (no existing MR)">
  Create MR:

```bash
{FORGE_MR_CREATE} \
  --source-branch {BRANCH_NAME} \
  --target-branch main \
  --title "{ISSUE_IDENTIFIER}: {ISSUE_TITLE}" \
  --description "## Summary

Implements {ISSUE_IDENTIFIER} — {ISSUE_TITLE}

Tracker: {ISSUE_IDENTIFIER}

## Changes

{file_list}

## Test Plan

All acceptance criteria tested via TDD.

## Traceability

{traceability_table}"
```

  Store MR_IID and MR_URL.
</check>

<check if="MR_IID exists (MR already open)">
  Push updates the existing MR automatically.
  Log: "MR !{MR_IID} updated with latest changes"
</check>

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Branch pushed, MR created/updated
### FAILURE: Force pushing, pushing to main
