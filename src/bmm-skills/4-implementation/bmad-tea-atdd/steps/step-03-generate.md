# Step 3: Generate Failing Acceptance Tests


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Generate Failing Acceptance Tests with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate all failing test files, data factories, and fixtures based on the confirmed test strategy. Every test uses `test.skip()` and asserts expected behavior that does not yet exist (TDD red phase).

## RULES

- ALL tests MUST use `test.skip()` — this is TDD red phase
- ALL assertions must target EXPECTED behavior (not placeholders like `expect(true).toBe(true)`)
- One assertion per test (atomic test design)
- Use data factories with `@faker-js/faker` — no hardcoded test data
- Fixtures must have auto-cleanup in teardown
- E2E tests: network-first pattern (route interception BEFORE navigation)
- E2E tests: resilient selectors (`getByRole`, `getByText`, `getByLabel` — no CSS classes)
- Match the project's existing naming conventions and import patterns from Step 1
- Write files to disk as they are generated

## SEQUENCE

### 1. Generate E2E tests (if applicable)

For each E2E scenario from Step 2, create test files in `{test_dir}/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('[Story Name] E2E Tests (ATDD)', () => {
  test.skip('[P0] should complete user registration', async ({ page }) => {
    // Given: user navigates to registration page
    await page.goto('/register');

    // When: user fills form and submits
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Then: success message displayed and redirect
    await expect(page.getByText('Registration successful')).toBeVisible();
    await page.waitForURL('/dashboard');
  });
});
```

**E2E requirements:**

- Use Given-When-Then structure with comments
- Network-first: `await page.route()` calls BEFORE `await page.goto()`
- Resilient selectors: `getByRole`, `getByText`, `getByLabel`
- No hard waits or sleeps — explicit waits only
- Include priority tag in test name: `[P0]`, `[P1]`, etc.

### 2. Generate API tests (if applicable)

For each API scenario from Step 2, create test files in `{test_dir}/api/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('[Story Name] API Tests (ATDD)', () => {
  test.skip('[P0] should create user via POST /api/users', async ({ request }) => {
    // Given: valid user data
    const userData = createUser();

    // When: POST to registration endpoint
    const response = await request.post('/api/users/register', {
      data: userData,
    });

    // Then: 201 Created with user object
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      id: expect.any(Number),
      email: userData.email,
    });
  });
});
```

**API requirements:**

- Test both happy path and error cases (400, 401, 403, 404, 422, 500)
- Validate response structure, not just status codes
- Use data factories for request payloads

### 3. Generate Component tests (if applicable)

For each Component scenario from Step 2, create test files in `{test_dir}/component/`:

```typescript
import { test, expect } from '@playwright/experimental-ct-react';
// or the appropriate component testing import

test.describe('[Component Name] Tests (ATDD)', () => {
  test.skip('[P0] should render registration form', async ({ mount }) => {
    // Given: component mounted
    const component = await mount(<RegistrationForm />);

    // Then: all form fields present
    await expect(component.getByLabel('Email')).toBeVisible();
    await expect(component.getByLabel('Password')).toBeVisible();
    await expect(component.getByRole('button', { name: 'Register' })).toBeVisible();
  });
});
```

**Component requirements:**

- Test mounting, interactions, state, props, and events
- Use the project's component testing setup (Playwright CT, Vitest, etc.)

### 4. Generate data factories

Create factory files in `{test_dir}/support/factories/` (or match the project's existing factory location):

```typescript
import { faker } from '@faker-js/faker';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides,
  };
}

export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}
```

**Factory requirements:**

- Use `@faker-js/faker` for all random data generation
- Support overrides for specific test scenarios
- Generate complete valid objects matching API contracts
- Properly typed (TypeScript)

### 5. Generate fixtures

Create fixture files in `{test_dir}/support/fixtures/` (or match the project's existing fixture location):

```typescript
import { test as base } from '@playwright/test';

type MyFixtures = {
  testUser: User;
};

export const test = base.extend<MyFixtures>({
  testUser: async ({ request }, use) => {
    // Setup: create test data
    const user = createUser();
    const response = await request.post('/api/users', { data: user });
    const created = await response.json();

    // Provide to test
    await use(created);

    // Teardown: clean up
    await request.delete(`/api/users/${created.id}`);
  },
});
```

**Fixture requirements:**

- Use `test.extend()` pattern (Playwright) or equivalent
- Setup phase creates test preconditions
- `await use(data)` provides data to test
- Teardown phase auto-cleans created data
- Fixtures are isolated (each test gets fresh data)
- Fixtures are composable (can use other fixtures)

### 6. Document mock requirements

If the story involves external services, document mock requirements as comments in the test files or in a separate `{test_dir}/support/mocks/README.md`:

- Endpoint URL and HTTP method
- Success response shape
- Error response shape
- Any special requirements (auth headers, rate limits)

### 7. Document data-testid requirements

If E2E tests reference UI elements that need `data-testid` attributes, collect them:

```
Required data-testid attributes:
- registration-form: main form container
- email-input: email field
- password-input: password field
- submit-button: form submit button
- error-message: validation error display
```

These will be included in the ATDD checklist for the dev team.

### 8. Write all files to disk

Ensure all generated files are written to the project:

- Test files in appropriate `{test_dir}` subdirectories
- Factory files in `{test_dir}/support/factories/`
- Fixture files in `{test_dir}/support/fixtures/`

Create directories as needed.

### 9. Confirm generation

Present a summary of generated files:

> **Files Generated:**
> - `{test_dir}/e2e/{feature}.spec.ts` — {count} tests (all `test.skip()`)
> - `{test_dir}/api/{feature}.spec.ts` — {count} tests (all `test.skip()`)
> - `{test_dir}/support/factories/{entity}.factory.ts`
> - `{test_dir}/support/fixtures/{feature}.fixture.ts`
>
> All tests use `test.skip()` (TDD red phase).

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Generate Failing Acceptance Tests
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-04-validate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
