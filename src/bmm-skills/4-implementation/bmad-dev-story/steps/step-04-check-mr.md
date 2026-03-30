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

### 2. Search for Prior Closed/Rejected MRs on Same Issue

**CRITICAL — learn from prior attempts before writing code.**

Search for closed MRs related to this issue (by issue identifier in title/description, or by branch pattern):

```bash
# Search by issue identifier in MR title/description
{FORGE_CLI} mr list --state closed --search "{ISSUE_IDENTIFIER}" 2>/dev/null || true
# Search by issue number in branch name
{FORGE_CLI} mr list --state closed --search "{ISSUE_NUMBER}" 2>/dev/null || true
```

<check if="closed/rejected MRs found">
  For each prior MR, extract:
  - **Title, author, close reason** (merged or rejected/closed without merge)
  - **Review comments** — especially rejection reasons, reviewer objections
  - **Approach taken** — skim the diff to understand the architecture choice

  Present to user:

  ```
  Prior MR(s) found for {ISSUE_IDENTIFIER}:

  - !{prior_iid}: "{title}" by @{author} — {merged/rejected}
    Reason: {close reason or reviewer objection summary}
    Approach: {brief description of the approach}

  These prior attempts may inform our implementation. Key takeaways:
  - {lessons learned}
  ```

  Store `PRIOR_MRS` for reference in plan-approval step (step-07).
</check>

<check if="no closed MRs found">
  Log: "No prior MRs found for this issue — fresh start."
</check>

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: MR status determined, prior attempts surfaced, context stored
### FAILURE: Not checking, assuming MR state, missing prior rejected MRs
