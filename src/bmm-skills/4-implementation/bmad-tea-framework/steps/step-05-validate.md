# Step 5: Validate & Summarize

## STEP GOAL

Validate the framework setup against the quality checklist, fix any gaps, and present a completion summary with next steps.

## RULES

- Every checklist item must be verified — do not assume correctness from having created the file
- If a gap is found, fix it before completing the workflow
- The completion summary must give the user a clear path to running their first test

## SEQUENCE

### 1. Validate prerequisites

Verify:
- [ ] `package.json` exists and was read successfully
- [ ] No conflicting E2E framework was present before scaffold
- [ ] Project type was correctly identified

### 2. Validate directory structure

Verify all directories exist:
- [ ] `{TEST_DIR}/` root
- [ ] `{TEST_DIR}/e2e/`
- [ ] `{TEST_DIR}/support/fixtures/` (Playwright) or `{TEST_DIR}/support/` (Cypress)
- [ ] `{TEST_DIR}/support/helpers/`
- [ ] `{TEST_DIR}/support/factories/`

### 3. Validate configuration

Verify the framework config file:
- [ ] Config file exists at project root (`playwright.config.ts` or `cypress.config.ts`)
- [ ] Timeouts are configured (action: 15s, navigation: 30s, test: 60s)
- [ ] Base URL uses environment variable with fallback
- [ ] Artifacts set to retain-on-failure
- [ ] Reporters configured (HTML + JUnit for Playwright)
- [ ] Parallel execution enabled
- [ ] CI-specific settings present (retries, workers)

### 4. Validate environment files

Verify:
- [ ] `.env.example` exists with `TEST_ENV`, `BASE_URL`
- [ ] `.nvmrc` exists (or was already present)
- [ ] No real credentials in `.env.example`

### 5. Validate fixtures and factories

Verify:
- [ ] Fixture index file exists and exports `test` and `expect` (Playwright) or support file exists (Cypress)
- [ ] At least one data factory exists with `build()` and cleanup pattern
- [ ] Factory uses `@faker-js/faker` import
- [ ] Factories are re-exported from index

### 6. Validate sample test

Verify:
- [ ] Example test file exists in `{TEST_DIR}/e2e/`
- [ ] Test imports from custom fixtures (not raw framework)
- [ ] Test uses `data-testid` selector strategy
- [ ] Test demonstrates factory usage
- [ ] Test follows Given/When/Then structure

### 7. Validate documentation and scripts

Verify:
- [ ] `{TEST_DIR}/README.md` exists with setup, running, architecture sections
- [ ] `package.json` has `test:e2e` script
- [ ] Dependencies to install were listed to the user

### 8. Validate knowledge base alignment

Verify that scaffolded code follows the loaded knowledge fragments:
- [ ] Fixture pattern matches `fixture-architecture` fragment (if Playwright)
- [ ] Factory pattern matches `data-factories` fragment
- [ ] Config follows `playwright-config` fragment (if Playwright)
- [ ] Network patterns follow `network-first` fragment (if applicable)

### 9. Fix gaps

If any checklist item failed, fix it now. Report what was fixed.

### 10. Completion summary

Present:

> **Framework Setup Complete**
>
> **Framework:** {Playwright / Cypress}
> **Files created:** {count}
> **Checklist:** {passed}/{total} items
>
> **Files created:**
> ```
> {tree view of all created files}
> ```
>
> **Knowledge fragments applied:**
> - {fragment_id}: {how it was applied}
>
> **Next steps:**
> 1. Install dependencies:
>    ```
>    {install command from step 04}
>    ```
> 2. Copy environment config:
>    ```
>    cp .env.example .env
>    ```
> 3. Edit `.env` with your local values
> 4. Run the sample test:
>    ```
>    npm run test:e2e
>    ```
> 5. Read `{TEST_DIR}/README.md` for detailed guidance
>
> **Recommended follow-up workflows:**
> - `bmad-test-design` — plan risk-based test coverage
> - `bmad-tea-ci` — set up CI pipeline for tests

---

**Workflow complete.** The retrospective step (if applicable) will now execute.
