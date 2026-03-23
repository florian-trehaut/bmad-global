# MR Classification Rules

Rules for classifying Merge Requests into review categories.

## Prerequisites

- `CURRENT_USER`: the authenticated forge user (from `{FORGE_API_BASE} user`)
- `MR_AUTHOR`: the MR author's username
- `MR_DRAFT`: boolean, whether the MR is a draft
- `MR_HAS_CONFLICTS`: boolean, whether the MR has merge conflicts
- `EXPLICIT_APPROVALS`: list of usernames who have explicitly approved the MR

## Classification Logic

### Category 1: Colleague Review

```
MR_AUTHOR != CURRENT_USER
AND MR_DRAFT == false
AND CURRENT_USER NOT IN EXPLICIT_APPROVALS
```

These are MRs from teammates that need your review. This is the primary review mode -- you are an external adversarial reviewer.

### Category 2: Self-Review

```
MR_AUTHOR == CURRENT_USER
AND MR_DRAFT == false
```

These are your own MRs. Self-review runs 6 perspectives inline (no parallel agents). Consider using a different LLM for a fresh perspective.

### Category 3: Already Reviewed

```
CURRENT_USER IN EXPLICIT_APPROVALS
```

Regardless of who the author is, you have already approved this MR. Useful for:
- Checking if the author addressed your previous review comments
- Re-reviewing after significant changes
- Verifying thread resolution before merge

### Category 4: Draft / Non-Reviewable

```
MR_DRAFT == true
OR MR_HAS_CONFLICTS == true
```

MRs that are not ready for formal review. Drafts are work in progress. MRs with conflicts cannot be safely reviewed because the final code after conflict resolution is unknown.

## Approval Policy

The forge may report `approved=true` when no approval rules are configured. The team policy is:

**A MR is "approved" only if `approved_by` contains at least 1 explicit username.**

Check `has_explicit_approval` rather than the bare `approved` field.

## Edge Cases

- **MR with no tracker issue**: Classified normally but noted as "forge-only review". Specs Compliance perspective will be limited.
- **MR targeting non-main branch**: Still reviewable, but regression risk detection uses the actual target branch, not main.
- **MR from external contributor**: Treated as colleague review with extra security scrutiny.
