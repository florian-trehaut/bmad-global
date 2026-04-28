---
nextStepFile: './step-10-validate.md'
---

# Step 9: Journey Tests (Conditional)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: Journey Tests (Conditional) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Assess whether journey tests are needed and write them directly if so. Skip entirely for single-service stories.

## MANDATORY SEQUENCE

### 1. Assess Journey Test Need

Journey tests are required if ALL of the following are true:
1. At least one AC is P0 or P1 priority
2. The implementation touches multiple services OR sends events/HTTP to another service
3. No equivalent scenario already exists in the project's journey test directory

Check for existing journey test scenarios:

```bash
# Look for journey/e2e test directories in the project
find {WORKTREE_PATH} -type d -name "journeys" -o -name "e2e" | head -5
```

### 2. Route

<check if="journey tests NOT required (single-service, P2+ only, or already covered)">
  Log: "Journey tests not required — single-service story / already covered"
  Skip — continue to {nextStepFile}.
</check>

<check if="journey tests required">

### 3. Discover Existing Patterns

Look for existing journey test patterns in the project to follow conventions:

```bash
# Find existing journey test files for pattern reference
find {WORKTREE_PATH}/tests -name "*.yaml" -o -name "*.yml" | head -10
```

Read 1-2 existing scenarios from the same category to understand the structure and conventions used in this project.

### 4. Write Journey Tests Directly

For each P0/P1 AC that involves cross-service flows:
1. Write the journey test YAML following existing project conventions
2. Include: setup (health checks, seed data), steps (requests, assertions), teardown (cleanup)
3. Cover: happy path + primary error path

### 5. Validate Journey Tests

Required checks:
- All P0 ACs with cross-service flows are covered
- Negative paths written for critical flows
- AC citations in assertions
- Specific matchers used (not just status code checks)

<check if="any check fails">
  Fix the failing checks directly. If unable to fix -> HALT and report to user.
</check>

</check>

### 6. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Journey tests assessed, written if needed, validated
### FAILURE: Skipping assessment for cross-service stories, writing without validation

---

## STEP EXIT (CHK-STEP-09-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-09-EXIT PASSED — completed Step 9: Journey Tests (Conditional)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
