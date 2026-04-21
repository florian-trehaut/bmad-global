# Step 10: Cleanup & Report

## STEP GOAL

Clean up the temporary worktree, then present a summary with next steps.

## RULES

- Worktree cleanup failure is NON-CRITICAL — warn but don't halt
- This is the final step — no next step

## SEQUENCE

### 1. Cleanup Worktree

**Apply §3 Cleanup from `bmad-shared/worktree-lifecycle.md`.**

<check if="REUSED_CURRENT_WORKTREE == true">
  The workflow reused the user's current worktree. Do NOT remove it — log "Worktree reused — cleanup skipped (user's worktree)." and skip branch deletion.
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == true">

```bash
cd {MAIN_PROJECT_ROOT}
git worktree remove {SPEC_WORKTREE_PATH} --force
git worktree prune
```

  **If worktree removal fails:** Warn user but do NOT halt. Worktree cleanup is non-critical.

  > The temporary worktree could not be removed: {SPEC_WORKTREE_PATH}
  > You can remove it manually: `git worktree remove {SPEC_WORKTREE_PATH} --force`

  Also remove the local branch if it was created:

```bash
git branch -D create-story/{slug_or_identifier} 2>/dev/null || true
```
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == false">
  No worktree to remove — skip.
</check>

### 2. Workflow Complete

The bmad-create-story workflow is complete.

---

## END OF WORKFLOW
