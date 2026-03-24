# Step 1: Detect Test Framework and Identify Features

## STEP GOAL

Detect the project's existing test framework and conventions, then determine which features to test.

## RULES

- Use whatever test framework the project already has — never override existing choices
- If no framework exists, suggest the standard recommendation for the detected stack and WAIT for user confirmation before proceeding
- Follow existing test file patterns (naming, directory structure, imports)
- Do not install packages without user confirmation

## SEQUENCE

### 1. Detect test framework

Scan the project for test framework indicators:

1. **Package manifest** — check `package.json` (Node), `pyproject.toml` / `setup.cfg` (Python), `Cargo.toml` (Rust), `go.mod` (Go), `Gemfile` (Ruby), or equivalent for test dependencies:
   - JavaScript/TypeScript: playwright, jest, vitest, cypress, mocha, ava
   - Python: pytest, unittest, robot
   - Go: testing (stdlib), testify
   - Other: framework-specific indicators

2. **Config files** — check for `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`, `pytest.ini`, `conftest.py`, `.mocharc.*`, etc.

3. **Existing test files** — search for files matching `*.test.*`, `*.spec.*`, `*_test.*`, `test_*.*` patterns. Read 2-3 examples to understand:
   - Import patterns
   - Describe/test structure
   - Assertion style
   - Setup/teardown patterns
   - Naming conventions

4. **Test runner command** — check `package.json` scripts (`test`, `test:unit`, `test:e2e`), `Makefile` targets, or CI config for the test execution command.

Set `TEST_FRAMEWORK` and `TEST_RUNNER_CMD` based on findings.

### 2. Handle missing framework

If no test framework is detected:

1. Analyze source code to determine project type (React, Vue, Node API, Python FastAPI, etc.)
2. Recommend the standard test framework for that stack:
   - React/Vue/Node: vitest (unit) + playwright (E2E)
   - Python API: pytest
   - Go: stdlib testing
   - Other: the most common choice for the stack

Present recommendation and WAIT for user confirmation.

**HALT if user declines:** "No test framework available. Install a test framework and re-run."

### 3. Identify features to test

Ask the user what to test:

> "What should I generate tests for?"
>
> **Options:**
> - **A) Specific feature** — name or path (e.g., `src/auth/`, `UserProfile component`)
> - **B) Directory scan** — I'll scan a directory and list testable features
> - **C) Auto-discover** — I'll scan the full codebase and propose features

WAIT for user response.

### 4. Build feature list

Based on user's choice:

**Option A (specific feature):**
- Read the specified source files
- Identify API endpoints, components, services, or functions to test

**Option B (directory scan):**
- List files in the specified directory
- Identify modules, components, endpoints, and services
- Present a numbered list and let user select which to test

**Option C (auto-discover):**
- Scan source directories for API routes/controllers, UI components/pages, and service/business logic modules
- Present a numbered list grouped by type (API, UI, Service)
- Let user select which to test

### 5. CHECKPOINT

Present to the user:

> **Test Framework:** {TEST_FRAMEWORK}
> **Test Runner:** {TEST_RUNNER_CMD}
> **Existing patterns:** {brief summary of conventions found}
> **Features to test:** {numbered list}
> **Test types:** API tests: {yes/no} | E2E tests: {yes/no}

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-generate.md`
