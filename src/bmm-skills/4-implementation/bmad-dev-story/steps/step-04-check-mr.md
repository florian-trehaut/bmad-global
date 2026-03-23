---
nextStepFile: './step-05-load-context.md'
---

# Step 4: Check Existing MR

## STEP GOAL:

Detect if a Merge Request already exists for this branch.

## MANDATORY SEQUENCE

### 1. Search for Existing MR

```bash
{FORGE_MR_LIST} --source-branch {BRANCH_NAME}
```

<check if="MR found">
  Store MR_IID and MR_URL.
  Log: "Existing MR found: !{MR_IID}"
</check>

<check if="no MR found">
  Store MR_IID = null (will create at Step 13).
  Log: "No existing MR — will create at completion"
</check>

### 2. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: MR status determined and stored
### FAILURE: Not checking, assuming MR state
