# Step 6: Fix (TDD)

## STEP GOAL

Implement the fix using strict TDD — write failing test first (RED), then implement the fix (GREEN), then clean up (REFACTOR). All work inside the worktree.

## RULES

- **Strict TDD** — RED → GREEN → REFACTOR, no exceptions
- **All work in `{WORKTREE_PATH}`** — never modify files outside
- **Minimum change** — fix the bug, nothing more. No refactoring of unrelated code.
- **HALT on 3 consecutive failures** on the same test
- Follow project dev standards from `stack.md` if loaded

## SEQUENCE

### 1. Install and build

Ensure the worktree is ready:

```bash
cd {WORKTREE_PATH}
{INSTALL_COMMAND}
{BUILD_COMMAND}
```

### 2. RED — Write failing test

For each TAC from the fix plan, write a test that:
- Reproduces the bug (the test MUST fail without the fix)
- Verifies the expected behavior after the fix

Run the test:
```bash
cd {WORKTREE_PATH} && {TEST_COMMAND}
```

**Verify the test FAILS for the right reason** — the failure must demonstrate the bug, not a setup issue.

### 3. GREEN — Implement the fix

Follow the fix plan from step 4. For each task:
- Make the specific change described
- Keep changes minimal — fix the bug, nothing more

Run tests after each change:
```bash
cd {WORKTREE_PATH} && {TEST_COMMAND}
```

**Verify ALL tests PASS** — both the new test and existing tests.

### 4. REFACTOR — Clean up

If the fix introduced any code that could be cleaner:
- Refactor without changing behavior
- Run tests again to verify no regression

### 5. Check for similar patterns

If the bug was a pattern (e.g., missing null check, wrong enum mapping):
- Grep the codebase for the same pattern
- If found elsewhere, add a comment in the tracker issue noting the locations (do NOT fix them — out of scope)

### 6. Format and lint

```bash
cd {WORKTREE_PATH} && {FORMAT_FIX_COMMAND}
```

### 7. Commit

```bash
cd {WORKTREE_PATH}
git add -A
git commit -m "fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}

{ISSUE_IDENTIFIER}"
```

### 8. Auto-proceed

Fix implemented and committed. Proceed to ship.

---

**Next:** Read fully and follow `./steps/step-07-ship.md`
