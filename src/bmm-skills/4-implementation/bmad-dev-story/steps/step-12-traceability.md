---
nextStepFile: './step-13-push-mr.md'
---

# Step 12: Traceability & Task Verification

## STEP GOAL:

Every AC must have at least one test at the level specified in the test strategy. Every task must be verified complete. Missing coverage = finding.

## MANDATORY SEQUENCE

### 1. Build Traceability Matrix

For each AC in the issue description:

```yaml
traceability:
  - ac_id: 'AC1'
    ac_text: '{description}'
    expected_levels: [Unit, Integration]  # from TEST_STRATEGY
    priority: P0
    coverage:
      unit: { status: COVERED | MISSING, tests: ['file.spec.ts:line - test name'] }
      integration: { status: COVERED | MISSING, tests: [] }
      journey: { status: COVERED | MISSING | N/A, tests: [] }
    overall: FULL | PARTIAL | MISSING
```

### 2. Scan Test Files

```bash
cd {WORKTREE_PATH}
git diff --name-only origin/main...HEAD | grep -E '\.(spec|test)\.(ts|js)$'
```

For each test file, read and match `describe`/`it` blocks to ACs by keyword/intent matching.

### 3. Evaluate Completeness

```yaml
traceability_summary:
  total_acs: 0
  fully_covered: 0
  partially_covered: 0
  not_covered: 0
  verdict: PASS | GAPS_FOUND
```

### 4. Address Gaps

<check if="verdict == PASS">
  Log: "Traceability: PASS — all ACs covered at expected test levels"
</check>

<check if="gaps include P0 ACs">
  **P0 gaps are BLOCKERS — must fix before proceeding.**
  Write missing tests now (TDD RED -> GREEN).
  Re-evaluate traceability.
</check>

<check if="gaps are P1+ only">
  Ask user:
  1. Complete missing tests now
  2. Continue and note gaps in tracker comment
  WAIT for user choice.
</check>

### 5. Verify Task Completion

For each task marked [x] in the issue, verify it is truly complete:
- Code exists for this task
- Tests exist for this task
- Tests pass
- Acceptance criteria satisfied
- No regressions introduced

<check if="any task incorrectly marked complete">
  Flag the task as incomplete.
  Fix the issue.
  Re-validate.
</check>

### 6. Proceed

Store TRACEABILITY_REPORT for inclusion in completion comment (Step 14).
Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Every AC mapped to tests, P0 gaps addressed, all tasks verified
### FAILURE: Skipping traceability, ignoring P0 gaps, marking tasks complete without verification
