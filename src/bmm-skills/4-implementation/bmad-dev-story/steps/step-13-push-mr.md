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

### 2. Fact-Check MR Description Against Code

**CRITICAL — every claim in the MR description must be verifiable in the code.**

Before creating/updating the MR, verify the description draft:

1. **API names and function names** — grep the codebase for every function, method, class, or API name mentioned. If a name doesn't exist in the code, fix the description.
2. **Numeric claims** — "handles N cases", "reduces X by Y%", "70+ tests" — verify the exact count. Use precise numbers, not approximations.
3. **Behavioral claims** — "does X when Y happens" — trace the code path to confirm.
4. **Comments in code** — verify that code comments referenced in the description accurately describe what the code does.
5. **Performance claims** — if the description claims latency, throughput, or size improvements, these must be backed by measurements (see performance measurement step if applicable).

If any claim is false or misleading, fix it before publishing. A MR description that contradicts the code destroys reviewer trust.

### 3. Create or Update MR

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

### 4. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Branch pushed, MR created/updated
### FAILURE: Force pushing, pushing to main
