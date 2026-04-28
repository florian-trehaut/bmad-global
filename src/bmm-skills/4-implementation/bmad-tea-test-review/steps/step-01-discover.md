# Step 1: Discover Test Files & Load Context


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Discover Test Files & Load Context with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

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
- **Acceptance criteria from the story** (for coverage gap analysis):
  - **BACs (Given/When/Then)** — track separately; coverage by integration / journey tests
  - **TACs (EARS — Ubiquitous / Event-driven / State-driven / Optional / Unwanted)** — track separately; coverage by unit / integration tests; verify the test scaffold matches the EARS pattern (mismatch = MINOR finding)
  - For legacy specs without v2 BAC/TAC distinction, fall back to generic AC extraction
- Priority assignments from the test-design (P0/P1/P2/P3)
- **NFR Registry rows declaring measurable targets** (e.g. Performance p95 < 500ms) — flag absence of corresponding test/measurement as a coverage gap
- **Observability mandatory log events** — flag absence of corresponding test asserting log emission as a coverage gap

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

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Discover Test Files & Load Context
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-evaluate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
