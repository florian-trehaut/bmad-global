# Step 3: Generate Tests

## STEP GOAL

Generate test files, fixtures, factories, and helpers according to the coverage plan from Step 2.

## RULES

- Follow the coverage plan exactly — do not add or remove test scenarios without justification
- All tests must use Given-When-Then structure (in comments or naming)
- All test names must include priority tags: `[P0]`, `[P1]`, `[P2]`, `[P3]`
- Use data factories for test data — no hardcoded values
- Tests must be deterministic, isolated, and self-cleaning
- Each test file must stay under 200 lines — split if larger
- Follow the project's existing conventions (naming, imports, structure)

## SEQUENCE

### 1. Prepare test infrastructure

Before generating tests, ensure the supporting infrastructure exists:

**A) Test directory structure:**

Create directories as needed following the project's convention. Common patterns:
- `tests/unit/`, `tests/integration/`, `tests/api/`, `tests/e2e/`
- `__tests__/` alongside source files
- `test/` at project root
- `tests/` at project root with type subdirectories

Match whatever the project already uses. If no convention exists, propose one and confirm with user.

**B) Data factories:**

If the project uses dynamic test data (not static fixtures), create or enhance factory files:
- Use `@faker-js/faker` (JS/TS), `faker` (Python), or equivalent for the detected language
- All factories must support overrides for specific scenarios
- Location: follow project convention, or `tests/support/factories/`

**C) Fixtures and helpers:**

If the framework supports fixtures (Playwright, pytest, etc.), create or enhance:
- Authentication fixtures (with auto-cleanup)
- API client fixtures (authenticated request helper)
- Database fixtures (with auto-cleanup/rollback)
- Location: follow project convention, or `tests/support/fixtures/`

### 2. Generate tests by level

Process each level from the coverage plan. For each level, generate all test files.

**Inline branching:** Generate different test levels sequentially within this step. For each level:

1. Read the target source file(s) to understand the implementation
2. Generate the test file following framework conventions
3. Write the file to the appropriate directory

**Unit tests:**
- One test file per source file (or per module)
- Test pure logic: inputs, outputs, edge cases, error paths
- No mocks unless absolutely necessary (prefer refactoring for testability)
- Use framework's assertion library

**Integration tests:**
- Test module collaborations with real dependencies (DB, internal services)
- Mock only external third-party services
- Include setup/teardown for test data

**API tests:**
- Test HTTP endpoints: status codes, response structure, auth, errors
- Use the framework's HTTP client (supertest, httpx, request fixture, etc.)
- Test both happy path and error scenarios (400, 401, 403, 404, 500)
- Validate response body structure, not just status codes

**E2E tests:**
- Test complete user journeys (multi-page, multi-step)
- Use resilient selectors: `getByRole`, `getByText`, `getByLabel`, `data-testid` (not CSS classes)
- Apply network-first pattern: route interception BEFORE navigation
- No hard waits — use explicit waits (`expect().toBeVisible()`, `waitForResponse()`, etc.)
- One assertion per test (atomic design)

### 3. Quality checks per file

After generating each test file, verify:

- [ ] Priority tags present in all test names
- [ ] Given-When-Then comments present
- [ ] No hardcoded test data (uses factories or constants)
- [ ] No hard waits or sleep calls
- [ ] No shared mutable state between tests
- [ ] No conditional test flow (`if` inside tests)
- [ ] Imports are correct for the framework
- [ ] File under 200 lines

Fix any violations before moving to the next file.

### 4. Track generated files

Maintain a running list of all generated files:

```
Generated Files
===============
Tests:
  - tests/unit/validators.test.ts (5 tests: P0=2, P1=2, P2=1)
  - tests/api/auth.spec.ts (8 tests: P0=3, P1=3, P2=2)
  - ...

Infrastructure:
  - tests/support/factories/user.factory.ts
  - tests/support/fixtures/auth.fixture.ts
  - ...
```

### 5. Generation complete

Display summary:

> **Test generation complete.**
> - Test files created: {count}
> - Infrastructure files created: {count}
> - Total test count: {count} (P0={n}, P1={n}, P2={n}, P3={n})
> - By level: Unit={n}, Integration={n}, API={n}, E2E={n}

Proceed immediately to validation — do not wait.

---

**Next:** Read fully and follow `./step-04-summary.md`
