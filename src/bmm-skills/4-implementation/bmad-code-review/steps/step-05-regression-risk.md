---
nextStepFile: './step-06-execute-review.md'
---

# Step 5: Regression Risk Detection

## STEP GOAL:

Detect the #1 cause of regression in codebases: stale branches that overwrite recent main changes during rebase. When a branch is rebased onto the target, conflict resolution can silently discard changes from MRs merged after the branch was created. The rebase also overwrites the regression tests, so CI passes despite the regression.

This step runs TWO complementary detection phases.

---

## PHASE 1: Pre-Rebase Overlap Detection

Identifies files modified BOTH in this MR and in the target branch since the branch point.

```bash
cd {REVIEW_WORKTREE_PATH}

# Find merge-base (where the branch diverged from target)
MERGE_BASE=$(git merge-base HEAD origin/{MR_TARGET_BRANCH})
echo "Branch point: $MERGE_BASE ($(git log -1 --format='%ai %s' $MERGE_BASE))"

# Files modified by the MR (branch point -> HEAD)
MR_FILES=$(git diff --name-only $MERGE_BASE..HEAD | sort)

# Files modified in target since the branch point
MAIN_FILES=$(git diff --name-only $MERGE_BASE..origin/{MR_TARGET_BRANCH} | sort)

# Intersection = files touched by BOTH sides -> regression risk
OVERLAP=$(comm -12 <(echo "$MR_FILES") <(echo "$MAIN_FILES"))

if [ -n "$OVERLAP" ]; then
  echo ""
  echo "REGRESSION RISK -- Files modified in BOTH this MR AND target since branch point:"
  echo "$OVERLAP"
  echo ""
  echo "Recent target commits on these files (merged AFTER branch point):"
  for f in $OVERLAP; do
    echo ""
    echo "--- $f ---"
    git log --oneline $MERGE_BASE..origin/{MR_TARGET_BRANCH} -- "$f"
  done
else
  echo "No overlap -- no regression risk from stale rebase (Phase 1)."
fi
```

### Phase 1: Show Missing Content

If OVERLAP is non-empty, show what the target has that the branch does NOT:

```bash
for f in $OVERLAP; do
  echo ""
  echo "=== REGRESSION CHECK: $f ==="
  echo "Lines in target (origin/{MR_TARGET_BRANCH}) but MISSING from this branch:"
  git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f"
done
```

### Phase 1: Classify Risk Level

- **HIGH RISK (BLOCKER):** Overlapping files contain business logic (`domain/`, `use-cases/`, `helpers/`), test files (`*.spec.ts`), or config files (`.csv`, `.json` mappings). The diff shows non-trivial deletions.
- **MEDIUM RISK (WARNING):** Overlapping files are infrastructure-only (`infrastructure/`, `config/`) and the diff shows only minor changes.
- **LOW RISK:** Overlap limited to lockfiles, generated files, or formatting-only.

For HIGH RISK:
- Add BLOCKER finding: "Regression risk: `{file}` was modified in target by `{commit_hash} {commit_message}`. The rebase may have silently discarded these changes. Reviewer MUST verify line-by-line."
- List specific target commits that touched each overlapping file
- Show exact lines present in target but absent from the branch

For MEDIUM RISK:
- Add WARNING finding with same details but lower severity

Store: `REGRESSION_RISK_LEVEL`, `OVERLAPPING_FILES`.

---

## PHASE 2: Post-Rebase Detection

Phase 1 fails when the branch has already been rebased onto the target -- the merge-base becomes the tip of the target, so the overlap is empty. Phase 2 catches this by comparing the branch's version of modified files against the target. If the MR REMOVES code that exists in the target, it is suspicious.

```bash
cd {REVIEW_WORKTREE_PATH}

# Get all files modified by this MR (vs target branch)
CHANGED_FILES=$(git diff --name-only origin/{MR_TARGET_BRANCH}...HEAD)

# For each changed file, check if the MR REMOVES lines from target
SUSPICIOUS_FILES=""
for f in $CHANGED_FILES; do
  # Skip files that don't exist in target (new files)
  git show origin/{MR_TARGET_BRANCH}:"$f" > /dev/null 2>&1 || continue

  # Count lines removed from target (lines present in target but ABSENT from branch)
  REMOVED_FROM_MAIN=$(git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f" | grep "^+" | grep -v "^+++" | wc -l | tr -d ' ')

  if [ "$REMOVED_FROM_MAIN" -gt 5 ]; then
    SUSPICIOUS_FILES="$SUSPICIOUS_FILES $f($REMOVED_FROM_MAIN lines)"
  fi
done

if [ -n "$SUSPICIOUS_FILES" ]; then
  echo ""
  echo "POST-REBASE REGRESSION RISK -- These files REMOVE code that exists in current target:"
  echo "$SUSPICIOUS_FILES"
  echo ""
  echo "This may indicate a rebase that silently discarded recent changes."
  echo "Showing removals for each suspicious file:"
  for f in $CHANGED_FILES; do
    git show origin/{MR_TARGET_BRANCH}:"$f" > /dev/null 2>&1 || continue
    REMOVED=$(git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f" | grep "^+" | grep -v "^+++" | wc -l | tr -d ' ')
    if [ "$REMOVED" -gt 5 ]; then
      echo ""
      echo "=== $f -- $REMOVED lines in target but MISSING from branch ==="
      git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f"
    fi
  done
else
  echo "Phase 2: No suspicious removals of target code detected."
fi
```

### Phase 2: Cross-Reference with Issue Scope (CRITICAL)

**Every deletion must be justified by the issue scope.** A MR titled "migrate Applewood" has NO business removing FNAC mappings or FNAC test files. This cross-reference is the strongest regression signal available.

For each file with suspicious removals, apply this decision tree:

1. **Is the file within the scope of the tracker issue?**
   - Parse LINKED_TRACKER_ISSUE description for mentioned services, providers, features
   - If the file is OUT of scope AND has removals -> **BLOCKER** (near-certain rebase regression)

2. **If the file IS in scope -- are the specific removed lines justified?**
   - Removing old code replaced by new code in the same MR -> legitimate
   - Removing functions/tests/config NOT replaced -> suspicious
   - Key question: "Can I find a NEW version of this removed code elsewhere in the MR diff?"

3. **Test file special rule:**
   - If `*.spec.ts` files show net deletions of test cases (not just refactoring), this is a red flag
   - Tests should only be removed when the tested functionality is intentionally removed
   - Tests disappearing alongside code changes is the signature of a bad rebase

### Phase 2: Verification Procedure

For each suspicious removal, the reviewer MUST:

1. Read the full reverse diff: `git diff HEAD..origin/{MR_TARGET_BRANCH} -- {file}`
2. Check if removed code was added by a recent MR: `git log --oneline origin/{MR_TARGET_BRANCH} -- {file}`
3. Cross-check with issue scope: "Does {ISSUE_IDENTIFIER} ({issue_title}) justify removing {function_name} from {file}?"
4. If removed code was added by a different MR AND removal is not in issue scope -> BLOCKER: "Regression: `{file}` loses code from `{commit}` (`{message}`). Out of scope. Likely caused by stale rebase."

Store: `PHASE2_SUSPICIOUS_REMOVALS` for use in step-06 Specs Compliance perspective.

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Both phases executed, all risks classified and stored
### FAILURE: Skipping regression detection, ignoring HIGH RISK findings
