# Step 2: Identify Test Targets


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Identify Test Targets with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Determine what needs to be tested, select appropriate test levels, assign priorities, and produce a coverage plan.

## RULES

- Every target must be grounded in actual source code analysis — no hypothetical targets
- Test level selection follows the test pyramid: prefer the LOWEST level that covers the behavior
- No duplicate coverage — the same behavior must NOT be tested at E2E AND API AND unit level
- Priority assignment must be justified (risk, criticality, complexity)

## SEQUENCE

### 1. Identify targets by mode

**Standalone mode (no BMad artifacts):**

1. If `selective` coverage target with specific files/features: analyze those files only
2. Otherwise, auto-discover by scanning `{source_dir}`:
   - List all source files (excluding test files, config, dependencies)
   - Identify files WITHOUT corresponding test files (coverage gaps)
   - Prioritize gaps by:
     - **No test coverage** — highest priority
     - **Complex business logic** — functions with many branches, error handling
     - **External integrations** — API calls, database queries, auth flows
     - **Critical user paths** — login, checkout, payment, data mutations

**BMad-integrated mode (artifacts available):**

1. Map acceptance criteria from story to test scenarios
2. Check for existing test-design document — use its risk assessment for priority
3. Check for existing ATDD tests — expand beyond them (edge cases, negative paths)
4. Cross-reference with source code to find implementation details

### 2. Select test levels

For each identified target, assign ONE primary test level:

| Level | Use when | Examples |
|-------|----------|---------|
| **Unit** | Pure logic, calculations, transformations, edge cases, error handling | Utility functions, validators, parsers, formatters |
| **Integration** | Multiple modules collaborating, real DB/service interactions | Repository + DB, service + external API |
| **API** | HTTP endpoint behavior, request/response contracts, auth | REST endpoints, GraphQL resolvers, middleware |
| **E2E** | Critical user journeys that cross system boundaries | Login flow, checkout flow, onboarding |

**Anti-patterns to avoid:**
- Testing business logic at E2E level (use unit/integration instead)
- Testing UI rendering at API level (use component/E2E instead)
- Testing the same validation at both unit AND API level

### 3. Assign priorities

For each test scenario, assign a priority:

| Priority | Criteria | CI execution |
|----------|----------|-------------|
| **P0** | Critical path + security + data integrity | Every commit |
| **P1** | Important features + integration points + error handling | Every PR |
| **P2** | Edge cases + less-critical variations | Nightly |
| **P3** | Nice-to-have + rare scenarios + exploratory | Weekly/manual |

Apply the coverage target filter:
- `critical-paths`: generate P0 + P1 only
- `comprehensive`: generate P0 + P1 + P2
- `selective`: generate all priorities for targeted files

### 4. Produce coverage plan

Build a structured coverage plan:

```
Coverage Plan
=============

Target: {project name}
Coverage target: {critical-paths / comprehensive / selective}
Mode: {standalone / bmad-integrated}

## Test Generation Plan

### Unit Tests
| Target file | Test scenarios | Priority | Justification |
|------------|---------------|----------|---------------|
| ... | ... | P0/P1/P2 | ... |

### Integration Tests
| Target module | Test scenarios | Priority | Justification |
|--------------|---------------|----------|---------------|
| ... | ... | P0/P1/P2 | ... |

### API Tests
| Endpoint | Test scenarios | Priority | Justification |
|----------|---------------|----------|---------------|
| ... | ... | P0/P1/P2 | ... |

### E2E Tests
| User journey | Test scenarios | Priority | Justification |
|-------------|---------------|----------|---------------|
| ... | ... | P0/P1/P2 | ... |

## Summary
- Total planned: {count}
- By priority: P0={n}, P1={n}, P2={n}, P3={n}
- By level: Unit={n}, Integration={n}, API={n}, E2E={n}
```

### 5. CHECKPOINT

Present the coverage plan to the user.

WAIT for user confirmation before proceeding to generation.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Identify Test Targets
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-generate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
