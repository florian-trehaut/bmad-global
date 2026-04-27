---
---

# Step 14: Story Completion

## STEP GOAL:

Update tracker status, add completion comment with traceability report, and communicate completion to the user.

## MANDATORY SEQUENCE

### 1. Update Tracker Status

Update the issue in the tracker (using CRUD patterns from workflow-knowledge/project.md):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.in_review}

### 2. Add Completion Comment

Post a comment on the tracker issue with the full traceability report:

```
Implementation complete. All tests pass.

MR: !{MR_IID} — {MR_URL}

### Test Traceability

| AC | Priority | Coverage | Tests |
| -- | -------- | -------- | ----- |
{traceability_table}

**Verdict:** {traceability_verdict}
{gaps_if_any}

Files modified:
{file_list}

Ready for code review.

**Reminder:** In Review -> (after merge + deploy) -> **To Test** -> Done
The story moves to Done only after business validation in production.
```

### 3. Communicate Completion

```
## Story implemented

- **Issue**: {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
- **Tracker Status**: In Review
- **MR**: !{MR_IID} — {MR_URL}
- **Worktree**: {WORKTREE_PATH}
- **Self-review**: {review_verdict}
- **Tests**: All passing
- **Build**: Success

### Files modified
{file_list}

### Next step
Code review recommended (ideally with a different LLM for a fresh perspective).
```

## SUCCESS/FAILURE:

### SUCCESS: Status updated, traceability comment posted, user informed
### FAILURE: Not updating status, missing traceability in comment, setting status to Done (NEVER — max is In Review)
