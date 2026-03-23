---
nextStepFile: './step-09-journey-tests.md'
---

# Step 8: Solo Implementation (TDD)

## STEP GOAL:

Implement all tasks from the issue following strict TDD. ALL implementation happens inside {WORKTREE_PATH}.

## MANDATORY SEQUENCE

### 1. For Each Unchecked Task in the Issue

#### RED Phase — Write Failing Test

1. Write failing test(s) for the task
2. Run tests: `{TEST_COMMAND} -- {test_file}` (or the project-specific single-file test command)
3. **VERIFY they FAIL** for the right reason (missing implementation)
4. Explicitly state: `Tests fail because: [exact reason]`

**FORBIDDEN TDD shortcuts:**
- Removing/weakening assertions to make tests pass
- Writing implementation first, then retroactive tests
- Adding `.skip` to bypass failing tests
- Returning hardcoded values without real implementation

**FORBIDDEN data patterns (apply zero-fallback rules loaded at initialization):**
- `??` or `||` fallback on business-critical fields flowing to external systems, billing, or display
- Using a semantically different column because the correct one is unavailable
- Computing a derived value instead of reading the actual source
- Defaults (`0`, `''`, `'N/A'`) on required fields — if null -> throw + alert, NEVER substitute
- Data migrations (UPDATE/DELETE) with WHERE clauses that silently match zero rows in any target environment — names, slugs, and IDs differ between dev, staging, and production. If DB access is available, verify the WHERE clause against real data before committing. A migration that silently does nothing is a zero-fallback violation.

#### GREEN Phase — Implement

1. Write MINIMUM code to make tests pass
2. Run tests: verify they PASS
3. If tests fail -> fix implementation (not tests)

#### REFACTOR Phase

1. Improve code quality without changing behavior
2. Scope boundary: ONLY files modified during GREEN
3. Run tests — still PASS

### 2. Verify Test Coverage

After all tasks complete:
- Unit tests for all business logic
- Integration tests for API endpoints / DB operations
- Edge cases identified in the issue description
- Each source file has corresponding test file

```bash
{TEST_COMMAND}
```

### 3. Quality Checks

```bash
{QUALITY_GATE}
```

### 4. Commit

```bash
git add {specific_files}  # NOT git add . or git add -A
git commit -m "feat({scope}): {brief summary}"
```

Commit conventions: use conventional commits format (`feat`, `fix`, `refactor`, `test`, `chore`). Scope is the affected area.

### 5. Proceed

Load and execute {nextStepFile}.

**HALT conditions — STOP immediately if:**
- Missing dependencies that cannot be resolved
- 3 consecutive test failures on same task
- Security concern discovered
- Required data source is inaccessible and no semantically correct alternative exists (do NOT use wrong data as fallback)

## SUCCESS/FAILURE:

### SUCCESS: All tasks TDD'd, tests pass, quality checks pass, committed
### FAILURE: Skipping RED phase, committing with failing tests, using mocks in unit tests
