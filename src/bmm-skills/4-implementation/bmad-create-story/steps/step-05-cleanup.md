# Step 5: Cleanup

## STEP GOAL

Remove the investigation worktree and present completion summary.

## SEQUENCE

### 1. Remove worktree

**Apply cleanup rules from `bmad-shared/worktree-lifecycle.md`.**

<check if="worktree_enabled == true">

```bash
git worktree remove {SPEC_WORKTREE_PATH} --force
```

  If removal fails, log a warning but do not HALT — the worktree can be cleaned up manually.
</check>

<check if="worktree_enabled == false">
  No worktree to remove — skip this step.
</check>

### 2. Completion

The bmad-create-story workflow is complete.

---

## END OF WORKFLOW
