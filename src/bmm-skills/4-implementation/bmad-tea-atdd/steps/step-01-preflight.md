# Step 1: Preflight & Context Loading


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Preflight & Context Loading with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Verify prerequisites and load all required inputs before generating failing tests: validate the story, detect the test framework, and inventory existing test patterns.

## RULES

- Story MUST have clear, testable acceptance criteria — HALT if missing
- Test framework MUST be configured — HALT if missing
- Load existing patterns from `{test_dir}` to ensure consistency with project conventions
- Do not generate any tests in this step — only collect inputs

## SEQUENCE

### 1. Validate story input

If the user has not provided a story, ask:

> "Which story should I generate ATDD tests for? Provide the story file path, issue link, or paste the acceptance criteria directly."

WAIT for user response.

Once the story is provided, extract:

- **Story ID** (set `STORY_ID`)
- **Story title**
- **All acceptance criteria** (ACs) — each must be testable
- **Affected components/systems**
- **Technical constraints** (if any)

**HALT if:** Story has no acceptance criteria, or criteria are not testable (e.g., "improve performance" without measurable target).

### 2. Detect test framework

Scan the project root for framework configuration:

- `playwright.config.ts` / `playwright.config.js`
- `cypress.config.ts` / `cypress.config.js`
- `vitest.config.ts` / `jest.config.ts` (for component/unit)

Read the detected config to understand:

- Base URL
- Test directory structure
- Timeout settings
- Reporter configuration

Cross-reference with `{test_framework}` from workflow-context.md.

**HALT if:** No test framework configuration found.

### 3. Inventory existing patterns

Inspect `{test_dir}` for:

- **Directory structure** — how are tests organized? (`e2e/`, `api/`, `component/`, `support/`)
- **Existing fixtures** — what fixtures already exist? What patterns do they follow?
- **Existing factories** — are there data factories? What library do they use?
- **Naming conventions** — file naming patterns (`.spec.ts`, `.test.ts`, etc.)
- **Import patterns** — how do existing tests import fixtures and helpers?

This ensures generated tests match the project's established conventions.

### 4. Load knowledge fragments (if available)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` exists, check for and load relevant fragments:

- `fixture-architecture.md` — fixture composition patterns
- `data-factories.md` — factory patterns with faker
- `network-first.md` — route interception patterns
- `component-tdd.md` — component test strategies
- `test-quality.md` — test design principles
- `selector-resilience.md` — robust selector strategies

These are optional — the workflow can proceed without them using built-in best practices.

### 5. CHECKPOINT

Present to the user:

> **Preflight Summary**
>
> **Story:** {STORY_ID} — {story_title}
> **Acceptance Criteria:** {count} ACs extracted
> **Framework:** {detected framework} ({config file path})
> **Test Directory:** `{test_dir}`
> **Existing Patterns:** {summary — e.g., "Playwright fixtures with auto-cleanup, faker-based factories"}
> **Knowledge Loaded:** {list of loaded fragments or "None — using built-in best practices"}

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Preflight & Context Loading
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-strategy.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
