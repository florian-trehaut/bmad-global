# Step 2: Generate Tests


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Generate Tests with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate API tests and E2E tests for the identified features using the project's test framework and existing patterns. Focus on happy path + 1-2 critical error cases per feature.

## RULES

- Use standard test framework APIs only — no complex fixtures, no custom utilities, no unnecessary abstractions
- Follow the project's existing test patterns exactly (imports, structure, naming, assertions)
- Save test files in the project's existing test directory structure
- Each test file must be self-contained and runnable independently
- Tests must have clear, descriptive names that explain the expected behavior
- No hardcoded waits or sleeps — use framework-provided waiting mechanisms
- Tests must be independent — no execution order dependency

## SEQUENCE

### 1. Generate API tests (if applicable)

For each API endpoint/service identified in Step 1, generate tests covering:

**Happy path (required):**
- Correct status code (200, 201, etc.)
- Response structure validation (required fields present, correct types)
- Response body content for known inputs

**Critical error cases (1-2 per endpoint):**
- 400 — invalid input / missing required fields
- 401/403 — unauthorized access (if auth exists)
- 404 — resource not found
- 500 — server error trigger (if identifiable)

**Test structure:**
```
describe('{Endpoint/Service name}', () => {
  test('returns {expected} when {condition}', async () => {
    // Arrange — set up request
    // Act — call the endpoint
    // Assert — verify status + response structure
  });
});
```

Adapt the syntax to match the project's test framework (pytest fixtures, Go table-driven tests, etc.).

Set `API_TEST_COUNT` = number of API test cases generated.

### 2. Generate E2E tests (if UI exists)

For each UI feature identified in Step 1, generate tests covering:

**User workflows:**
- Complete user flow from entry to expected outcome
- Focus on what the user sees and does, not implementation details

**Locator strategy (in priority order):**
1. Role-based: `getByRole('button', { name: 'Submit' })`
2. Label-based: `getByLabel('Email')`
3. Text-based: `getByText('Welcome')`
4. Test-id: `getByTestId('...')` — only as last resort

**Test structure:**
```
test('{User action} should {expected outcome}', async ({ page }) => {
  // Navigate to the feature
  // Perform user actions (clicks, form fills, navigation)
  // Assert visible outcomes
});
```

Adapt to the project's E2E framework (Playwright, Cypress, Selenium, etc.).

**Keep tests linear and simple:**
- One workflow per test
- No conditional logic inside tests
- No loops or dynamic test generation
- Clear setup, action, assertion sections

Set `E2E_TEST_COUNT` = number of E2E test cases generated.

### 3. Write test files

Save each test file to the appropriate directory following the project's conventions:
- API tests: typically `tests/api/`, `__tests__/`, `src/**/*.test.*`, etc.
- E2E tests: typically `tests/e2e/`, `e2e/`, `cypress/e2e/`, etc.

Create directories if they don't exist yet, following the established pattern.

### 4. CHECKPOINT

Present to the user:

> **Tests generated:**
>
> **API Tests** ({API_TEST_COUNT} cases):
> - `{path/to/test-file}` — {what it tests}
> - ...
>
> **E2E Tests** ({E2E_TEST_COUNT} cases):
> - `{path/to/test-file}` — {what it tests}
> - ...
>
> Ready to run and validate?

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Generate Tests
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-validate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
