# Step 2: Preflight

## STEP GOAL

Verify that the frontend toolchain, test runners, and target environment are operational before starting validation. Each check is a hard gate — HALT at the first failure.

## RULES

- Each check that fails — HALT with a clear message and corrective action
- NEVER bypass a failed check
- NEVER assume that access works without verifying it
- Adapt checks to the project's frontend framework and test tools as described in `workflow-context.md` and `stack.md`

## SEQUENCE

### 1. Load environment, stack, and validation knowledge

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` was loaded during initialization, extract relevant frontend framework, test toolchain, and build conventions.

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/environment-config.md` exists and was loaded, extract frontend-specific parameters (staging URLs, dev server config, test fixture paths).

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/validation.md` was loaded during initialization:
- Extract `Validation Stack` table → use as pre-detected test commands (skip auto-detection for components already known)
- Extract `Stack-Specific Validation Notes` → store as `STACK_NOTES` for use in step-04
- Extract `Test Discovery Patterns` → store as `TEST_DISCOVERY` for test file matching in step-04
- Extract `Validation Anti-Patterns` → store as `ANTI_PATTERNS` for proof evaluation in step-04

### 2. Detect frontend framework

Read `package.json` in the project root. Identify:
- **Framework:** React, Vue, Angular, Svelte, Next.js, Nuxt, SvelteKit, Astro, Remix, Solid, Qwik
- **Bundler:** Vite, Webpack, Turbopack, esbuild, Rollup
- **TypeScript:** presence of `tsconfig.json` or `typescript` in devDependencies

Store `FRONTEND_FRAMEWORK`, `BUNDLER`, `HAS_TYPESCRIPT`.

Display: "Detected: **{FRONTEND_FRAMEWORK}** with **{BUNDLER}**"

**If no `package.json` found:**
HALT: "No package.json found. This skill is designed for JavaScript/TypeScript frontend projects."

### 3. Detect test toolchain

Check `devDependencies` and `dependencies` in `package.json` for:
- **E2E:** `@playwright/test`, `cypress`, `puppeteer`
- **Component:** `@testing-library/*`, `vitest`, `jest`, `@vue/test-utils`, `@angular/core/testing`
- **Accessibility:** `@axe-core/playwright`, `axe-core`, `pa11y`
- **Visual regression:** `@playwright/test` (visual comparisons), `@percy/cli`, `chromatic`

Check for config files: `playwright.config.*`, `cypress.config.*`, `vitest.config.*`, `jest.config.*`

Store `E2E_FRAMEWORK`, `COMPONENT_FRAMEWORK`, `A11Y_TOOL`, `VISUAL_TOOL`.

If `E2E_TEST_COMMAND` or `COMPONENT_TEST_COMMAND` were not provided in workflow-context.md, infer them from detected tooling:
- Playwright detected → `E2E_TEST_COMMAND = npx playwright test`
- Cypress detected → `E2E_TEST_COMMAND = npx cypress run`
- Vitest detected → `COMPONENT_TEST_COMMAND = npx vitest run`
- Jest detected → `COMPONENT_TEST_COMMAND = npx jest`

Display: "Test toolchain: E2E={E2E_FRAMEWORK}, Component={COMPONENT_FRAMEWORK}"

**If no test framework detected:**
Warn: "No E2E or component test framework detected. Validation will rely on user screenshots and manual verification for UI-related VMs."

### 4. Check environment access

**If `ENVIRONMENT = dev_server`:**
1. If `DEV_SERVER_COMMAND` is set, attempt to verify the dev server can start:
   - Check if the port is already in use (`lsof -i :{port}`)
   - If not running, note: "Dev server will need to be started with `{DEV_SERVER_COMMAND}`"
2. If `DEV_SERVER_URL` is set, store it. Otherwise default to `http://localhost:3000`
3. Check that `{INSTALL_COMMAND}` has been run (node_modules exists)

**If `ENVIRONMENT = staging`:**
1. Discover the staging URL from environment-config.md or workflow-context.md
2. Verify the URL responds:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" {staging_url}
   ```
3. HALT if not accessible: "Staging environment at {staging_url} is not accessible. Status: {status_code}."

**If `ENVIRONMENT = production`:**
1. Discover the production URL from environment-config.md or workflow-context.md
2. Verify the URL responds (same as staging)
3. Remind: "Production mode active. Write actions will require authorization."

### 5. Check E2E test runner (if E2E framework detected)

If Playwright is the E2E framework:
```bash
npx playwright install --check 2>&1 || true
```

If browsers are not installed, HALT: "Playwright browsers are not installed. Run `npx playwright install` first."

Verify the test runner works with a dry run or version check:
```bash
npx playwright test --version 2>&1
```

If Cypress is the E2E framework:
```bash
npx cypress verify 2>&1
```

### 6. Check component test runner (if relevant to VM items)

If any VM item is likely to be classified as `component`:
```bash
{COMPONENT_TEST_COMMAND} --version 2>&1 || true
```

Verify the test runner is operational.

### 7. Check dependencies installed

Verify that `node_modules` exists:
```bash
test -d node_modules && echo "ok" || echo "missing"
```

If missing:
HALT: "Dependencies not installed. Run `{INSTALL_COMMAND}` first."

### 8. Verify Chrome MCP availability (MANDATORY)

Attempt to use `mcp__claude-in-chrome__tabs_context_mcp`.

**If it responds:** Store `CHROME_MCP = true`. Display: "Chrome MCP active — browser validation enabled."

**If it fails or is not available:** HALT: "Chrome MCP is required for frontend validation. Activate the Claude-in-Chrome extension in your browser and ensure it is connected to Claude Code. Then re-launch the validation."

Load `../data/chrome-mcp-patterns.md` for reference during validation execution.

### 9. Preflight Summary

Display a summary table:

```
Preflight — {ENVIRONMENT}
+------------------------------+--------+--------------------------------------+
| Check                        | Status | Details                              |
+------------------------------+--------+--------------------------------------+
| Chrome MCP                   | ok     | Connected                            |
| Frontend framework           | ok     | {FRONTEND_FRAMEWORK} + {BUNDLER}     |
| E2E test runner              | ok/n/a | {E2E_FRAMEWORK}                      |
| Component test runner        | ok/n/a | {COMPONENT_FRAMEWORK}                |
| A11y tooling                 | ok/n/a | {A11Y_TOOL}                          |
| Environment access           | ok/err | {environment_url}                    |
| Dependencies                 | ok/err | node_modules present                 |
+------------------------------+--------+--------------------------------------+
```

"All checks passed. Launching validation."

### 10. Proceed

Load and execute `./steps/step-03-setup-worktree.md`.
