# Step 4: Validate & Complete

## STEP GOAL

Validate that all generated tests fail for the right reason (missing implementation, not test bugs), produce the ATDD checklist document, and deliver the completion summary.

## RULES

- Run the test suite to verify RED phase — all tests must be skipped or failing
- Tests that PASS before implementation indicate a test bug — fix immediately
- The ATDD checklist must be self-contained and actionable for the dev team
- Clean up any temporary artifacts

## SEQUENCE

### 1. Run test suite (RED phase verification)

Execute the test command to verify all tests are in the expected state:

```bash
{test_command} --grep "ATDD"
```

**Expected result:** All tests skipped (via `test.skip()`) or failing.

**If any test PASSES:** This is a test bug. The test is not actually testing new behavior. Investigate and fix:

- Is it testing existing functionality by accident?
- Are assertions correct and meaningful?
- Is it using mocked/stubbed behavior instead of real integration?

Fix the test and re-run until all tests are RED.

### 2. Validate test quality

Review all generated tests against this checklist:

- [ ] Every test uses `test.skip()` (TDD red phase)
- [ ] Every test asserts EXPECTED behavior (no placeholder assertions)
- [ ] Every test has Given-When-Then structure with comments
- [ ] Every test has a descriptive name explaining what it tests
- [ ] Every test includes a priority tag (`[P0]`, `[P1]`, etc.)
- [ ] No duplicate tests (same behavior tested at multiple levels without justification)
- [ ] No flaky patterns (race conditions, timing issues, hard waits)
- [ ] No test interdependencies (tests can run in any order)
- [ ] All tests are deterministic (same input -> same result)
- [ ] E2E tests use network-first pattern
- [ ] E2E tests use resilient selectors (`getByRole`, `getByText`)
- [ ] Factories use `@faker-js/faker` (no hardcoded data)
- [ ] Fixtures have auto-cleanup in teardown
- [ ] All TypeScript types are correct

Fix any gaps before proceeding.

### 3. Generate ATDD checklist

Create the ATDD checklist document at `{test_artifacts}/atdd-checklist-{STORY_ID}.md`:

```markdown
# ATDD Checklist — {STORY_ID}: {story_title}

**Date:** {current date}
**Author:** {USER_NAME}
**Primary Test Level:** {PRIMARY_LEVEL}

---

## Story Summary

{Brief 2-3 sentence summary of the user story}

**As a** {user_role}
**I want** {feature_description}
**So that** {business_value}

---

## Acceptance Criteria

1. {AC-1}
2. {AC-2}
3. {AC-3}

---

## Failing Tests Created (RED Phase)

### E2E Tests ({E2E_TEST_COUNT} tests)

**File:** `{test file path}`

- **Test:** {test_name}
  - **Status:** RED (test.skip) — {expected failure reason}
  - **Priority:** {P0/P1/P2/P3}
  - **Verifies:** {what this test validates}

### API Tests ({API_TEST_COUNT} tests)

**File:** `{test file path}`

- **Test:** {test_name}
  - **Status:** RED (test.skip) — {expected failure reason}
  - **Priority:** {P0/P1/P2/P3}
  - **Verifies:** {what this test validates}

### Component Tests ({COMPONENT_TEST_COUNT} tests)

**File:** `{test file path}`

- **Test:** {test_name}
  - **Status:** RED (test.skip) — {expected failure reason}
  - **Priority:** {P0/P1/P2/P3}
  - **Verifies:** {what this test validates}

---

## Data Factories Created

### {Entity} Factory

**File:** `{factory file path}`

**Exports:**
- `create{Entity}(overrides?)` — single entity with optional overrides
- `create{Entity}s(count)` — array of entities

---

## Fixtures Created

### {Feature} Fixtures

**File:** `{fixture file path}`

**Fixtures:**
- `{fixtureName}` — {description}
  - **Setup:** {what setup does}
  - **Provides:** {what test receives}
  - **Cleanup:** {what cleanup does}

---

## Mock Requirements

### {Service Name}

**Endpoint:** `{HTTP_METHOD} {url}`
**Success Response:** {shape}
**Error Response:** {shape}

---

## Required data-testid Attributes

### {Page/Component Name}

- `{data-testid}` — {element description}

---

## Implementation Checklist

### Test: {test_name}

**File:** `{test file path}`

**Tasks to make this test pass:**
- [ ] {implementation task 1}
- [ ] {implementation task 2}
- [ ] {implementation task 3}
- [ ] Add data-testid attributes: {list}
- [ ] Run test: `{test_command} {test file}`
- [ ] Test passes (green phase)

**Estimated Effort:** {hours}

---

## Running Tests

{test_command} --grep "ATDD"              # Run all ATDD tests
{test_command} {specific_file}            # Run specific file
{test_command} --headed {specific_file}   # Headed mode (E2E)
{test_command} --debug {specific_file}    # Debug mode

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

- All tests written with `test.skip()`
- Fixtures and factories created with auto-cleanup
- Mock requirements documented
- data-testid requirements listed
- Implementation checklist created

### GREEN Phase (DEV Team)

1. Pick one failing test from implementation checklist (start with P0)
2. Read the test to understand expected behavior
3. Implement minimal code to make that test pass
4. Remove `test.skip()` and run the test
5. Verify it passes (green)
6. Move to next test and repeat

### REFACTOR Phase (After All Tests Pass)

1. Verify all tests pass
2. Review code quality (readability, DRY, performance)
3. Refactor with tests as safety net
4. Run tests after each refactor to confirm no regressions
```

### 4. Completion summary

Present to the user:

> ## ATDD Complete — {STORY_ID}
>
> **TDD Phase:** RED (all tests failing/skipped as expected)
> **Primary Level:** {PRIMARY_LEVEL}
>
> **Tests Generated:**
> - E2E: {E2E_TEST_COUNT}
> - API: {API_TEST_COUNT}
> - Component: {COMPONENT_TEST_COUNT}
> - Total: {TOTAL_TEST_COUNT}
>
> **Infrastructure:**
> - Factories: {count}
> - Fixtures: {count}
> - Mock requirements: {count}
> - data-testid requirements: {count}
>
> **Files:**
> - {list all generated file paths}
> - Checklist: `{test_artifacts}/atdd-checklist-{STORY_ID}.md`
>
> **Next steps:**
> 1. Share the ATDD checklist with the dev team
> 2. Begin implementation following the checklist (one test at a time)
> 3. Remove `test.skip()` as each feature is implemented
> 4. Run `{test_command} --grep "ATDD"` to track progress

---

## END OF WORKFLOW

The bmad-tea-atdd workflow is complete.
