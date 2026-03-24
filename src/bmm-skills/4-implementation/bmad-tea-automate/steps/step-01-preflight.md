# Step 1: Preflight & Context Loading

## STEP GOAL

Detect the test framework, analyze source code structure, determine execution mode, and select coverage target.

## RULES

- Framework detection is mandatory — HALT if no test framework found
- BMad artifacts are OPTIONAL — their absence does NOT halt the workflow
- Source code analysis must be real (glob, grep, read) — never fabricated
- If the user specifies a coverage target or mode, respect it; otherwise auto-detect

## SEQUENCE

### 1. Detect test framework

Search for framework configuration files at the project root:

**JavaScript/TypeScript ecosystems:**
- `vitest.config.*` or `vite.config.*` with test section — Vitest
- `jest.config.*` or `package.json` jest section — Jest
- `playwright.config.*` — Playwright
- `cypress.config.*` — Cypress

**Python ecosystems:**
- `pytest.ini`, `pyproject.toml` with `[tool.pytest]`, `setup.cfg` with `[tool:pytest]` — pytest
- `tox.ini` — tox

**Other:**
- `go.mod` with `_test.go` files — Go testing
- `Cargo.toml` with `#[cfg(test)]` — Rust testing

Read the detected config file(s) to understand:
- Test directory structure
- Test file naming conventions (e.g., `*.spec.ts`, `*.test.ts`, `*_test.go`, `test_*.py`)
- Available fixtures/plugins
- Parallel execution capabilities

**HALT if no framework detected:** "No test framework configuration found. Install and configure a test framework first (e.g., vitest, jest, playwright, pytest)."

### 2. Analyze source code structure

Scan the project to understand:
- **Language(s):** Detect from file extensions, package files, config files
- **Directory layout:** `src/`, `lib/`, `app/`, `pages/`, `api/`, etc.
- **Existing tests:** Count and categorize existing test files by type (unit, integration, API, E2E)
- **Source-to-test ratio:** How many source files have corresponding test files
- **Test support infrastructure:** Existing fixtures, factories, helpers, mocks

Record these as working variables for later steps.

### 3. Determine execution mode

**Standalone mode** (default): Analyze the codebase directly without BMad artifacts.

**BMad-integrated mode** (if artifacts detected): Check for:
- Story files with acceptance criteria
- PRD documents
- Test-design documents
- Tech-spec documents

If BMad artifacts are found, read them to extract:
- Acceptance criteria to map to tests
- Risk assessments to inform priority
- Feature boundaries to scope coverage

If not found — proceed in standalone mode without halting.

### 4. Select coverage target

If the user specified a target, use it. Otherwise:

| Coverage Target | When to use | Scope |
|----------------|-------------|-------|
| `critical-paths` | Default. Focus on high-risk, high-traffic code | P0 + P1 tests only |
| `comprehensive` | User requests full coverage expansion | P0 + P1 + P2 tests |
| `selective` | User targets specific files/features | Only specified targets |

If the user provides specific files or directories to target, set `COVERAGE_TARGET = selective` and record the targets.

### 5. Load knowledge (from skill data, if available)

If `~/.claude/skills/bmad-test-design/data/knowledge/` exists, selectively load fragments relevant to the detected framework:

**Core (always load if available):**
- `test-levels-framework.md` — test level selection criteria
- `test-priorities-matrix.md` — P0-P3 classification
- `test-quality.md` — test design quality principles

**Framework-specific (load if relevant):**
- `fixture-architecture.md` — Playwright/Vitest fixture patterns
- `data-factories.md` — factory patterns with faker
- `api-testing-patterns.md` — API test structure
- `network-first.md` — network interception patterns
- `selector-resilience.md` — resilient selector strategies

If the knowledge directory does not exist, proceed without it — the workflow can operate purely from the framework documentation and best practices.

### 6. CHECKPOINT

Present to the user:

> **Framework:** {detected framework} ({config file path})
> **Language:** {primary language}
> **Mode:** {standalone or bmad-integrated}
> **Coverage target:** {critical-paths / comprehensive / selective}
> **Existing tests:** {count} files ({unit}/{integration}/{API}/{E2E} breakdown)
> **Source files:** {count} (estimated coverage: {X}%)
> **Knowledge loaded:** {list of fragments, or "none — using best practices"}

WAIT for user confirmation before proceeding.

---

**Next:** Read fully and follow `./step-02-identify.md`
