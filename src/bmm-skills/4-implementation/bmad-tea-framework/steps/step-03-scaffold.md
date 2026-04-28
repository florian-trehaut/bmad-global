# Step 3: Scaffold Framework


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
CHK-STEP-03-ENTRY PASSED — entering Step 3: Scaffold Framework with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate the complete test directory structure, configuration files, fixtures, factories, helpers, and sample tests. This is the core implementation step.

## RULES

- Every generated file must be syntactically valid — no TODOs, no placeholder text, no compilation errors
- Follow the project's module system (ESM/CJS) and TypeScript preference from step 01
- Load TEA knowledge fragments JIT before implementing each section
- All imports must resolve correctly
- No hardcoded credentials — environment variables only
- Respect existing project structure (do not create files that conflict with existing ones)

## SEQUENCE

### 1. Load knowledge fragments

Load the knowledge fragments identified in step 02 from the TEA knowledge base.

**Fragment resolution order:**
1. `~/.claude/skills/bmad-tea-framework/data/knowledge/{fragment_id}.md`
2. `~/.claude/skills/bmad-test-design/data/knowledge/{fragment_id}.md` (fallback)

**Always load:**
- `data-factories` — factory patterns with overrides and cleanup
- `test-quality` — quality standards and isolation rules

**Playwright-specific (load if Playwright selected):**
- `fixture-architecture` — composable fixture pattern (pure function -> fixture -> mergeTests)
- `playwright-config` — config guardrails (timeouts, artifacts, reporters)
- `network-first` — intercept-before-navigate workflow

Read each fragment fully. The patterns described in these fragments are the authoritative reference for the scaffolded code.

### 2. Create directory structure

Create the following directories under `{TEST_DIR}`:

```
{TEST_DIR}/
  e2e/                    # E2E test specs
  support/
    fixtures/             # Test fixtures (Playwright) or custom commands (Cypress)
    helpers/              # Utility functions (API client, auth, network)
    page-objects/         # Page object models (optional, create if project is large)
    factories/            # Data factories with faker
```

**Note:** The `support/` directory is the critical pattern. Test organization under it (e2e/, api/, integration/) is flexible and project-dependent.

### 3. Generate framework configuration

**If Playwright — create `playwright.config.ts` (or `.js`) at project root:**

Apply patterns from `playwright-config` fragment:
- **Timeouts:** `actionTimeout: 15_000`, `navigationTimeout: 30_000`, `timeout: 60_000`
- **Base URL:** `process.env.BASE_URL || 'http://localhost:3000'`
- **Test directory:** point to `{TEST_DIR}/e2e`
- **Artifacts policy:** `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- **Reporters:** `[['html'], ['junit', { outputFile: 'test-results/junit.xml' }]]` + default list reporter
- **Parallelism:** `fullyParallel: true`, `workers: process.env.CI ? 2 : undefined`
- **Retries:** `process.env.CI ? 1 : 0`
- **Projects:** at minimum `chromium`; add `firefox` and `webkit` as commented-out options

**If Cypress — create `cypress.config.ts` (or `.js`) at project root:**

- **Base URL:** `process.env.BASE_URL || 'http://localhost:3000'`
- **Spec pattern:** `{TEST_DIR}/e2e/**/*.cy.{ts,js}`
- **Support file:** `{TEST_DIR}/support/index.ts`
- **Timeouts:** `defaultCommandTimeout: 15000`, `pageLoadTimeout: 30000`
- **Video:** `false` (enable on CI)
- **Screenshots:** `true` on failure
- **Retries:** `{ runMode: 1, openMode: 0 }`

### 4. Create environment configuration

**`.env.example` at project root:**

```env
# Test Environment
TEST_ENV=local
BASE_URL=http://localhost:3000
# API_URL=http://localhost:3001/api
# AUTH_USER=test@example.com
# AUTH_PASSWORD=
```

**`.nvmrc` at project root** (if not already present):

```
24
```

### 5. Create fixtures (Playwright) or support files (Cypress)

**If Playwright:**

Apply patterns from `fixture-architecture` fragment.

Create `{TEST_DIR}/support/fixtures/index.ts`:
- Import `test as base` from `@playwright/test`
- Define fixture types interface
- Extend base test with custom fixtures
- Export `test` and `expect`
- Include `mergeTests` pattern if multiple fixture sources are anticipated

Create `{TEST_DIR}/support/fixtures/types.ts`:
- Type definitions for all custom fixtures

**If Cypress:**

Create `{TEST_DIR}/support/index.ts`:
- Import custom commands
- Global before/after hooks for cleanup

Create `{TEST_DIR}/support/commands.ts`:
- Custom Cypress commands (login, API helpers)

### 6. Create data factories

Apply patterns from `data-factories` fragment.

Create `{TEST_DIR}/support/factories/user.factory.ts`:
- Use `@faker-js/faker` for realistic data generation
- `build()` method returns a plain object with overrides support
- `create()` method calls API to persist (if API available)
- `cleanup()` method tracks and removes created entities
- Auto-cleanup integration with fixtures (Playwright) or hooks (Cypress)

Create `{TEST_DIR}/support/factories/index.ts`:
- Re-export all factories

### 7. Create helpers

Create helpers based on project characteristics from step 01:

**Always create `{TEST_DIR}/support/helpers/index.ts`:**
- Re-export barrel file

**If API layer detected — create `{TEST_DIR}/support/helpers/api.helper.ts`:**
- Typed API client wrapper
- Base URL from environment
- Common headers (auth token injection)
- Response type helpers

**If auth detected — create `{TEST_DIR}/support/helpers/auth.helper.ts`:**
- Login helper function
- Token/session storage helper
- Multi-user support pattern

**If Playwright and network mocking needed — create `{TEST_DIR}/support/helpers/network.helper.ts`:**
- Route interception utilities (apply `network-first` patterns)
- Mock response builders
- HAR recording helpers (reference only)

### 8. Create sample test

Create `{TEST_DIR}/e2e/example.spec.ts` (Playwright) or `{TEST_DIR}/e2e/example.cy.ts` (Cypress):

The sample test must demonstrate:
- Import from custom fixtures (not raw `@playwright/test`)
- Given/When/Then structure via `test.describe` and `test.step` (Playwright) or `describe`/`it` (Cypress)
- `data-testid` selector strategy: `page.getByTestId('...')` or `cy.get('[data-testid="..."]')`
- Factory usage for test data
- At least one meaningful assertion
- Proper cleanup pattern

The sample test should be realistic for the detected project type (e.g., a login flow for auth-enabled apps, an API health check for backend-only projects).

### 9. Confirm scaffold

List all files created with their paths. Do not wait for user confirmation — proceed directly to the next step.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Scaffold Framework
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-04-docs.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
