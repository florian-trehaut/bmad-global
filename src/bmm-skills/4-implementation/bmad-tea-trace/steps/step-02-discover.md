# Step 2: Discover Tests & Build Traceability Matrix


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Discover Tests & Build Traceability Matrix with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Discover all tests in the codebase relevant to the loaded requirements, classify them by test level, and build the traceability matrix mapping each acceptance criterion to its covering tests.

## RULES

- Every test mapping must reference an actual file path — read the test file to confirm the mapping
- Coverage status must be grounded in test content analysis, not filename guessing
- Classify coverage honestly: FULL only when all scenarios of the AC are validated at appropriate level(s)
- If a test is ambiguous (could map to multiple ACs), map it to the most specific one and note the ambiguity

## SEQUENCE

### 1. Discover tests

Search `{TEST_DIR}` (and co-located test files if applicable) using multiple strategies:

**By test ID pattern:**
- Scan for test IDs matching story/feature identifiers (e.g., `1.3-E2E-001`, `AC-01`)

**By describe/context blocks:**
- Search for `describe`, `context`, `it`, `test` blocks that reference requirement keywords

**By file path convention:**
- `*.e2e.*`, `*.spec.*`, `*.test.*`, `*.integration.*`, `*.unit.*`
- Feature-named directories or files

**By content search:**
- Search test file contents for AC keywords, feature names, requirement IDs

Record every discovered test with:
- File path
- Test name (describe/it block)
- Test ID (if present)

### 2. Classify by test level

Categorize each discovered test:

| Level | Indicators |
|-------|-----------|
| **E2E** | Browser automation, full-stack, `*.e2e.*`, Playwright/Cypress patterns |
| **API/Integration** | HTTP requests, API calls, `*.integration.*`, supertest/request patterns |
| **Component** | Component rendering, `*.component.*`, React Testing Library patterns |
| **Unit** | Pure function tests, `*.unit.*`, isolated logic, no external deps |

### 3. Build traceability matrix

For each acceptance criterion, map to discovered tests:

| AC ID | AC Description | Test ID | Test File | Test Level | Coverage Status |
|-------|---------------|---------|-----------|------------|-----------------|
| AC-01 | ... | T-001 | path/to/test | E2E | FULL |
| AC-02 | ... | — | — | — | NONE |

**Coverage status classification:**

| Status | Definition |
|--------|-----------|
| **FULL** | All scenarios validated at appropriate level(s). Read the test — assertions cover the AC completely. |
| **PARTIAL** | Some coverage but missing edge cases, error paths, or important scenarios |
| **NONE** | No test coverage at any level |
| **UNIT-ONLY** | Only unit tests exist — missing integration/E2E validation for something that needs it |
| **INTEGRATION-ONLY** | Only API/component tests — missing unit confidence for complex logic |

### 4. Identify orphaned tests

Flag tests that exist but do not map to any loaded AC. These are either:
- Tests for requirements not in scope (expected for partial trace)
- Tests with no clear requirement (potential maintenance burden)

### 5. Update counters

Set:
- `TOTAL_REQUIREMENTS` = count of ACs
- `COVERED_REQUIREMENTS` = count of ACs with FULL or PARTIAL status
- `TOTAL_TESTS` = count of discovered tests (mapped + orphaned)

### 6. CHECKPOINT

Present the traceability matrix summary:

> **Traceability Matrix Built**
>
> Requirements: {TOTAL_REQUIREMENTS}
> Tests discovered: {TOTAL_TESTS}
> Mapped tests: {mapped count}
> Orphaned tests: {orphaned count}
>
> **Coverage breakdown:**
> - FULL: {count} ({percentage}%)
> - PARTIAL: {count}
> - NONE: {count}
> - UNIT-ONLY: {count}
> - INTEGRATION-ONLY: {count}
>
> {Show the full matrix table}

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Discover Tests & Build Traceability Matrix
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-analyze.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
