# Step 2: Test Strategy


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Test Strategy with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Translate each acceptance criterion into test scenarios, select the appropriate test level for each, assign priorities, and confirm the strategy with the user before generating any code.

## RULES

- Every acceptance criterion must map to at least one test scenario
- Avoid duplicate coverage — do not test the same behavior at multiple levels unless risk justifies it
- Follow the test pyramid: prefer Component > API > E2E (lowest adequate level)
- All tests are designed to FAIL before implementation (TDD red phase)
- Include negative and edge cases where risk is high

## SEQUENCE

### 1. Map acceptance criteria to test scenarios

For each AC from Step 1, generate one or more test scenarios:

```yaml
- ac: "AC-1: User can register with email and password"
  scenarios:
    - name: "should register new user successfully"
      type: happy_path
    - name: "should reject duplicate email"
      type: error_case
    - name: "should validate email format"
      type: edge_case
```

Include negative and edge cases for high-risk ACs.

### 2. Select test levels

For each scenario, choose the best test level:

| Level | When to use |
|-------|-------------|
| **E2E** | Critical user journeys, multi-page flows, visual feedback, end-to-end integration |
| **API** | Business logic validation, service contracts, HTTP status codes, error responses |
| **Component** | UI behavior in isolation, component interactions, state management, props/events |

**Decision criteria:**

- Does it require a browser? -> E2E
- Does it validate a service contract or business rule without UI? -> API
- Does it test UI behavior that can be isolated from the full app? -> Component
- Can it be tested at a lower level? -> Prefer the lower level

Set `PRIMARY_LEVEL` to the level with the most tests (typically E2E or API).

### 3. Prioritize tests

Assign P0-P3 priorities based on risk and business impact:

| Priority | Criteria |
|----------|----------|
| **P0** | Core happy path — feature is broken without this |
| **P1** | Important error handling and secondary flows |
| **P2** | Edge cases and boundary conditions |
| **P3** | Nice-to-have coverage, defensive tests |

If a test-design document exists (from `bmad-test-design` workflow), align priorities with its risk assessment.

### 4. Confirm red phase requirements

Verify that every test scenario:

- Asserts EXPECTED behavior (what the feature WILL do once implemented)
- Will FAIL when run because the feature does not exist yet
- Uses `test.skip()` to document the intentional failure

### 5. CHECKPOINT

Present the test strategy to the user:

> **Test Strategy — {STORY_ID}**
>
> **Primary Level:** {PRIMARY_LEVEL}
> **Test Distribution:**
> - E2E: {count} tests
> - API: {count} tests
> - Component: {count} tests
> - Total: {TOTAL_TEST_COUNT} tests
>
> | AC | Scenario | Level | Priority |
> |----|----------|-------|----------|
> | AC-1 | should register new user | E2E | P0 |
> | AC-1 | should reject duplicate email | API | P1 |
> | ... | ... | ... | ... |
>
> **TDD Phase:** RED — all tests will use `test.skip()` and fail until implementation

WAIT for user confirmation. User may request changes to levels or priorities.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Test Strategy
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-generate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
