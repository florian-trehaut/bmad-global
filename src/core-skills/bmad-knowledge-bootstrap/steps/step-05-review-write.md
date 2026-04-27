---
nextStepFile: './step-06-verify.md'
---

# Step 7: Review and Write

## STEP GOAL:

Present each generated knowledge file draft to the user for Accept/Edit/Reject, then write approved files to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`.

## MANDATORY SEQUENCE

### 1. Present Drafts for Review

Present ONE file at a time, in this order (skip files not in TARGET_FILES):

1. stack.md
2. infrastructure.md
3. conventions.md
4. review-perspectives.md
5. tracker.md
6. environment-config.md
7. investigation-checklist.md
8. domain-glossary.md
9. api-surface.md

For each file, present the COMPLETE content (not a summary), then:

> **[A]** Accept — write as-is
> **[E]** Edit — modify specific sections
> **[R]** Reject — skip this file (log reason)

**Menu handling:**

- **A**: Mark as APPROVED
- **E**: Ask user what to edit. Apply corrections. Re-present for confirmation. Loop until accepted.
- **R**: Mark as REJECTED. Ask for brief reason. Log reason.

### 2. Present Summary Before Writing

After all files reviewed:

```
Knowledge files:
  APPROVED: {N} — {list}
  REJECTED: {N} — {list with reasons}

Ready to write {N} files to {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/
```

HALT — wait for confirmation to write.

### 3. Write Approved Files

```bash
mkdir -p {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge
```

For each APPROVED file:
- Write to `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename}` (frontmatter + body)
- Log: "Written: {filename} ({N} lines, source_hash: {hash})"

### 4. Present Write Summary

```
Knowledge Bootstrap — Files Written

Written:
- {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename} ({N} lines, hash: {hash})
{repeat for each file}

Rejected (not written):
- {filename}: {reason}

Total knowledge files: {count in {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/}
```

### 5. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Every draft presented individually for review
- User explicitly approved each file
- Only APPROVED files written
- Write confirmation with line counts

### FAILURE:

- Batch-approving without per-file review
- Writing REJECTED files
- Not presenting complete content
