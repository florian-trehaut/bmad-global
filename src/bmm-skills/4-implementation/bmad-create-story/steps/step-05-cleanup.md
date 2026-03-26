# Step 5: Cleanup

## STEP GOAL

Remove the investigation worktree and present completion summary.

## SEQUENCE

### 1. Remove worktree

```bash
git worktree remove {SPEC_WORKTREE_PATH} --force
```

If removal fails, log a warning but do not HALT — the worktree can be cleaned up manually.

### 2. Completion

The bmad-create-story workflow is complete.

---

## END OF WORKFLOW
