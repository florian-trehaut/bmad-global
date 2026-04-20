---
nextStepFile: './step-02-phase-2-removals.md'
---

# Step 1: Phase 1 — Pre-Rebase Overlap Detection

## STEP GOAL:

Identify files modified BOTH in this MR AND in the target branch since the branch point. Overlap = regression risk, because a rebase on top of these target changes can silently discard them during conflict resolution.

## MANDATORY SEQUENCE

### 1. Find Merge-Base

```bash
cd {REVIEW_WORKTREE_PATH}
MERGE_BASE=$(git merge-base HEAD origin/{MR_TARGET_BRANCH})
echo "Branch point: $MERGE_BASE ($(git log -1 --format='%ai %s' $MERGE_BASE))"
```

If the merge-base command fails → HALT. Report the error.

### 2. Collect File Lists

```bash
# Files modified by the MR (branch point -> HEAD)
MR_FILES=$(git diff --name-only $MERGE_BASE..HEAD | sort)

# Files modified in target since the branch point
MAIN_FILES=$(git diff --name-only $MERGE_BASE..origin/{MR_TARGET_BRANCH} | sort)

# Intersection = files touched by BOTH sides -> regression risk
OVERLAP=$(comm -12 <(echo "$MR_FILES") <(echo "$MAIN_FILES"))
```

### 3. Report & Classify

<check if="OVERLAP is empty">
  Log: "No overlap — no regression risk from stale rebase (Phase 1)."
  Store: `REGRESSION_RISK_LEVEL_PHASE_1 = NONE`, `OVERLAPPING_FILES = []`.
</check>

<check if="OVERLAP is non-empty">
  For each overlapping file, show:
  - Recent target commits that touched it: `git log --oneline $MERGE_BASE..origin/{MR_TARGET_BRANCH} -- "$f"`
  - Lines present in target but missing from branch: `git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f"`

  Classify risk level by file type + diff content:

  | Risk | Signals | Emits |
  |------|---------|-------|
  | **HIGH** | `domain/`, `use-cases/`, `helpers/`, `*.spec.ts`, `*.test.ts`, `.csv`/`.json` mapping files, OR non-trivial (>5 lines) deletion in diff | BLOCKER finding |
  | **MEDIUM** | `infrastructure/`, `config/`, minor changes only | WARNING finding |
  | **LOW** | Lockfiles, generated files, formatting-only | No finding, log only |

  For HIGH RISK — emit BLOCKER:

  ```yaml
  - severity: BLOCKER
    file: '{file}'
    title: 'Regression risk: stale rebase suspected on {file}'
    detail: |
      Modified in target by {commit_hash} {commit_message}.
      The rebase may have silently discarded these changes.
      Reviewer MUST verify line-by-line.
    evidence: |
      {git log output for this file}
      {git diff output HEAD..target}
  ```

  For MEDIUM RISK — same structure, severity WARNING.

  Store: `REGRESSION_RISK_LEVEL_PHASE_1`, `OVERLAPPING_FILES`, `PHASE_1_FINDINGS`.
</check>

### 4. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Merge-base resolved, overlap computed, each file classified, findings stored
### FAILURE: Skipping file classification, ignoring HIGH RISK overlaps, downgrading BLOCKER to WARNING
