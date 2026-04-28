# Step 1: Detect Test Framework and Identify Features


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Detect Test Framework and Identify Features with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

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

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Detect Test Framework and Identify Features
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-generate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
