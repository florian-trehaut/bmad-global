# Step 1: Analyze Upstream Divergence

## STEP GOAL

Fetch upstream, compute the divergence between our fork and upstream, and present a structured summary for the user to review before merging.

## RULES

- Do NOT modify any files in this step — read-only analysis
- Present ALL upstream commits — no filtering
- Categorize commits to help the user understand impact

## SEQUENCE

### 1. Fetch Upstream

```bash
git fetch {UPSTREAM_REMOTE}
```

### 2. Find Last Sync Point

```bash
git merge-base {CURRENT_BRANCH} {UPSTREAM_REMOTE}/main
```

Store as `{MERGE_BASE}`.

### 3. Compute Divergence

```bash
# Commits upstream has that we don't
git log --oneline {MERGE_BASE}..{UPSTREAM_REMOTE}/main

# Commits we have that upstream doesn't
git log --oneline {MERGE_BASE}..{CURRENT_BRANCH}

# Files that will conflict (modified on both sides)
git diff --name-only {MERGE_BASE}..{CURRENT_BRANCH} > /tmp/ours.txt
git diff --name-only {MERGE_BASE}..{UPSTREAM_REMOTE}/main > /tmp/theirs.txt
comm -12 <(sort /tmp/ours.txt) <(sort /tmp/theirs.txt)
```

### 4. Categorize Upstream Commits

For each upstream commit, classify:

| Category | Pattern | Example |
|----------|---------|---------|
| **bugfix** | `fix:`, `fix(...)` | Bug fixes — high value for integration |
| **feature** | `feat:`, `feat(...)` | New functionality — review for relevance |
| **refactor** | `refactor:` | Structure changes — highest conflict risk |
| **docs** | `docs:`, `docs(...)` | Documentation — usually clean merge |
| **chore** | `chore:` | Release, CI, deps — evaluate case by case |

### 5. Identify Conflict Zones

For each file modified by both sides, analyze:
- What we changed (structural reorganization? content addition?)
- What they changed (bugfix? new content? refactor?)
- Predicted conflict severity: **CLEAN** (auto-merge likely), **MINOR** (small overlap), **MAJOR** (both restructured)

### 6. CHECKPOINT — Present Summary

```
## Upstream Sync Analysis

### Sync point
- Last common ancestor: {MERGE_BASE} ({date})
- Upstream commits to integrate: {N}
- Our commits since divergence: {M}

### Upstream Changes by Category

| Category | Count | Commits |
|----------|-------|---------|
| bugfix   | N     | list... |
| feature  | N     | list... |
| refactor | N     | list... |
| docs     | N     | list... |
| chore    | N     | list... |

### Conflict Prediction

| File | Our change | Their change | Severity |
|------|-----------|-------------|----------|
| ...  | ...       | ...         | CLEAN/MINOR/MAJOR |

### Files only they changed (clean merge): {count}
### Files only we changed (no conflict): {count}
### Files both changed (potential conflicts): {count}
```

WAIT for user confirmation before proceeding.

---

**Next:** Read fully and follow `./step-02-merge.md`
