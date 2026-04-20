---
---

# Step 2: Phase 2 — Post-Rebase Suspicious Removal Detection

## STEP GOAL:

Phase 1 fails when the branch has already been rebased onto the target — merge-base becomes the target tip and overlap is empty. Phase 2 catches the common case by comparing the branch's version of each modified file against the target. If the MR REMOVES code that exists in the target, and the removal is not justified by the tracker issue's scope, it is suspicious.

## MANDATORY SEQUENCE

### 1. Collect Modified Files

```bash
cd {REVIEW_WORKTREE_PATH}
CHANGED_FILES=$(git diff --name-only origin/{MR_TARGET_BRANCH}...HEAD)
```

### 2. Detect Suspicious Removals

For each changed file that exists in the target:

```bash
for f in $CHANGED_FILES; do
  # Skip files that don't exist in target (new files)
  git show origin/{MR_TARGET_BRANCH}:"$f" > /dev/null 2>&1 || continue

  # Count lines present in target but ABSENT from branch
  REMOVED_FROM_MAIN=$(git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f" \
    | grep "^+" | grep -v "^+++" | wc -l | tr -d ' ')

  # Threshold: > 5 lines removed suggests non-trivial loss
  if [ "$REMOVED_FROM_MAIN" -gt 5 ]; then
    # Record as suspicious
    ...
  fi
done
```

Store raw evidence for each suspicious file: `git diff HEAD..origin/{MR_TARGET_BRANCH} -- "$f"` output.

### 3. Cross-Reference with Tracker Issue Scope (CRITICAL)

**Every deletion must be justified by the issue scope.** A MR titled "migrate Applewood" has NO business removing FNAC mappings or FNAC test files. This cross-reference is the strongest regression signal available.

<check if="LINKED_TRACKER_ISSUE is provided">

  For each suspicious file, apply this decision tree:

  1. **Is the file within the scope of the tracker issue?**
     - Parse the issue description for mentioned services, providers, features, domains
     - If the file is OUT of scope AND has removals → **BLOCKER** (near-certain rebase regression)
     - Record `out_of_scope: true`

  2. **If the file IS in scope — are the specific removed lines justified?**
     - Removing old code replaced by new code in the same MR → legitimate → `out_of_scope: false`, no finding
     - Removing functions/tests/config NOT replaced anywhere in the MR → suspicious → BLOCKER
     - Key question: "Can I find a NEW version of this removed code elsewhere in the MR diff?"

  3. **Test file special rule:**
     - If `*.spec.ts`, `*.test.ts`, `*.test.py`, or equivalent show net deletions of test cases (not just refactoring) → RED FLAG → BLOCKER
     - Tests should only be removed when the tested functionality is intentionally removed
     - Tests disappearing alongside code changes is the signature of a bad rebase

</check>

<check if="LINKED_TRACKER_ISSUE is null">

  Scope cross-reference is not available. Emit WARNING (not BLOCKER) for each suspicious file:

  > Suspicious removal of {N} lines from target. Scope cross-reference unavailable (no linked tracker issue). Reviewer must verify each removal is intentional.

  Test file special rule still applies: `*.spec.ts` / `*.test.*` net deletions are BLOCKER regardless.

</check>

### 4. Verification Procedure (per suspicious file)

For each suspicious removal, the reviewer (receiver of this report) MUST:

1. Read the full reverse diff: `git diff HEAD..origin/{MR_TARGET_BRANCH} -- {file}`
2. Check if removed code was added by a recent MR: `git log --oneline origin/{MR_TARGET_BRANCH} -- {file}`
3. Cross-check with issue scope: "Does {ISSUE_IDENTIFIER} ({issue_title}) justify removing {function_name} from {file}?"
4. If removed code was added by a different MR AND removal is not in issue scope → BLOCKER:
   > Regression: `{file}` loses code from `{commit}` (`{message}`). Out of scope. Likely caused by stale rebase.

### 5. Emit Report

Build the combined report from Phase 1 + Phase 2 findings:

```yaml
regression_risk_report:
  level: HIGH | MEDIUM | LOW | NONE   # max of phase_1 and phase_2 levels
  overlapping_files: { from Phase 1 }
  phase2_suspicious_removals:
    - file: 'src/domain/foo.ts'
      removed_lines: 42
      out_of_scope: true
      is_test_file: false
      recent_target_commits:
        - hash: 'abc1234'
          message: 'feat(foo): add bar helper'
      evidence: |
        {git diff output}
  findings:
    - { severity, file, title, detail, evidence }
```

Return the report as the final response. This report is consumed by the review orchestrator's Specs Compliance perspective.

## SUCCESS/FAILURE:

### SUCCESS: Both phases executed, each suspicious file classified (in/out of scope, test file), report emitted
### FAILURE: Skipping scope cross-reference, downgrading test-file BLOCKER, omitting evidence
