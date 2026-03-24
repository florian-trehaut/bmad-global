# Step 1: Discover Test Files & Load Context

## STEP GOAL

Determine review scope, discover test files, load TEA knowledge base fragments, and gather related context artifacts (story, test-design).

## RULES

- If scope is unclear, ask the user to clarify before proceeding
- All knowledge fragments are loaded from `~/.claude/skills/bmad-test-design/data/knowledge/`
- Do not fabricate test file lists — use actual file system discovery
- If no test files are found, HALT with a clear message

## SEQUENCE

### 1. Determine scope

If the user has not specified a target, ask:

> "What scope for the test quality review?
> - **Single file** — provide the file path
> - **Directory** — provide the directory path
> - **Suite** — review all tests in the repository"

WAIT for user response.

Set `REVIEW_SCOPE` to `single`, `directory`, or `suite` based on the answer.

### 2. Discover test files

**Single mode:**
- Read the provided file path
- HALT if the file does not exist or is empty

**Directory mode:**
- Glob for test files under the specified directory: `**/*.spec.{ts,tsx,js,jsx}`, `**/*.test.{ts,tsx,js,jsx}`, `**/*_test.{go,py}`, `**/test_*.py`
- HALT if no test files found

**Suite mode:**
- Glob for test files from the project root using the patterns above
- Also check for framework config files: `playwright.config.ts`, `jest.config.ts`, `vitest.config.ts`, `cypress.config.ts`, `cypress.config.js`
- HALT if no test files found

Store the discovered file list in `TEST_FILES`.

### 3. Detect test framework

From the discovered files and any framework config files, detect the test framework in use:
- **Playwright**: `playwright.config.*`, `@playwright/test` imports
- **Jest**: `jest.config.*`, `@jest/globals` or `describe`/`it` without Playwright
- **Vitest**: `vitest.config.*`, `import { describe } from 'vitest'`
- **Cypress**: `cypress.config.*`, `cy.` commands

Store as `TEST_FRAMEWORK`.

### 4. Load knowledge base fragments

Load from `~/.claude/skills/bmad-test-design/data/knowledge/`:

**Always load (core quality KB):**
- `test-quality.md` — Definition of Done (determinism, isolation, assertions, length, duration)
- `data-factories.md` — Factory patterns and data isolation
- `test-levels-framework.md` — Test pyramid and level appropriateness
- `selective-testing.md` — Duplicate coverage detection

**Load if stack knowledge indicates Playwright (or if Playwright detected):**
- `fixture-architecture.md` — Pure function to fixture patterns
- `network-first.md` — Route intercept before navigate
- `playwright-config.md` — Configuration best practices

**Load if stack knowledge indicates Cypress:**
- `network-first.md` — Intercept patterns (Cypress variant)

**HALT if `test-quality.md` is not found** — the core quality criteria are required.

### 5. Gather context artifacts (optional)

Search for related artifacts that provide review context:

- **Story file**: Look for a story or spec file related to the test (check for `.story.md`, acceptance criteria documents, or ask the user if they have a story reference)
- **Test design document**: Look for a test-design artifact that defines priorities (P0/P1/P2/P3) for the tests under review

If found, extract:
- Acceptance criteria from the story (for coverage gap analysis)
- Priority assignments from the test-design (P0/P1/P2/P3)

These are optional — the review proceeds without them, but coverage analysis will be less precise.

### 6. CHECKPOINT

Present to the user:

> **Review Scope:** {REVIEW_SCOPE}
> **Test Files Found:** {count} files
> **Test Framework:** {TEST_FRAMEWORK}
> **Knowledge Fragments Loaded:** {list of loaded fragment names}
> **Context Artifacts:**
> - Story: {found/not found}
> - Test Design: {found/not found}

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-evaluate.md`
