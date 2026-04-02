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
- **Files adapted to fork conventions:** {K}
- **Quality gate:** {PASS/FAIL}
- **Fork identity:** preserved

### What was integrated

| Category | Count | Key changes |
|----------|-------|-------------|
| bugfix | {N} | {summary} |
| feature | {N} | {summary} |
| refactor | {N} | {summary} |
| docs | {N} | {summary} |
| chore | {N} | {summary} |

### Fork adaptations applied
{List of structural adaptations: renamed dirs, added shared rule refs, etc.}

### Conflict resolutions
{Brief log of each resolution with strategy used}

### Fork-protected files (kept ours)
{List of files where upstream changes were ignored}

### Next sync
Run this skill again anytime. Git will automatically know
the new merge base from this merge commit.
```

---

## END OF WORKFLOW
