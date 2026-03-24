# Step 4: Complete Sync

## STEP GOAL

Push the merge to origin and report the sync summary.

## SEQUENCE

### 1. Push

```bash
git push {FORK_REMOTE} {CURRENT_BRANCH}
```

### 2. Report

```
## Upstream Sync Complete

- **Synced to:** {UPSTREAM_REMOTE}/main @ {upstream_head_hash}
- **Merge commit:** {merge_hash}
- **Upstream commits integrated:** {N}
- **Conflicts resolved:** {M}
- **Quality gate:** {PASS/FAIL}

### What was integrated
{Summary by category: N bugfixes, N features, N refactors, N docs, N chores}

### Conflict resolutions applied
{Brief log of each resolution}

### Next sync
Run this skill again anytime. Git will automatically know
the new merge base from this merge commit.
```

---

## END OF WORKFLOW

The bmad-upstream-sync workflow is complete.
