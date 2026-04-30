---
nextStepFile: './step-09-journey-tests.md'
---

# Step 8: Solo Implementation (TDD)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-08-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-08-ENTRY PASSED — entering Step 8: Solo Implementation (TDD) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Implement all tasks from the issue following strict TDD. ALL implementation happens inside {WORKTREE_PATH}.

## MANDATORY SEQUENCE

### 0. Apply Boundaries Triple (story-spec v2)

Before executing any task, load the story's Boundaries section (loaded in Step 5) and configure execution policy:

- **✅ Always Do** — execute these without prompting (TACTICAL routine).
- **⚠️ Ask First** — when about to perform any action listed here (or matching the pattern), branch on TEAMMATE_MODE + autonomy_policy:
  - **TEAMMATE_MODE=true AND autonomy_policy=spec-driven** : classify the trigger per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §Autonomy policy enforcement`.
    - **TACTICAL** (file format choice, refactor approach, scope-bounded routine — covered by spec patterns Boundaries Always Do or Findings Rule 8) : auto-proceed using the spec pattern. Capture in workflow's `AUTONOMY_DECISIONS[]` accumulator : `{decision: 'ask-first-tactical', classification: 'tactical', default_applied: '{spec pattern applied}', rationale: 'TAC-5b — Boundaries Always Do covers this'}`.
    - **STRUCTURAL** (add a dependency to `package.json` / requirements.txt / Cargo.toml / etc., modify CI/CD `.github/workflows/*` / `.gitlab-ci.yml`, create migration files, major-version bump of any runtime/framework/database client, touch files outside the spec's File List) : emit `SendMessage(question, critical_ambiguity: true)` to `LEAD_NAME` and HALT (per TAC-6).
  - **Else** : HALT and ask user explicitly (TEAMMATE_MODE=false standalone, or TEAMMATE_MODE=true strict). Wait for confirmation before proceeding.
- **🚫 Never Do** — refuse outright, even if user/instruction asks. Common examples per `~/.claude/skills/bmad-shared/spec/boundaries-rule.md`: commit secrets, edit `node_modules/`, remove failing tests, use `--no-verify`, push to main/master without PR (project-dependent). Never Do is policy-independent — same behavior across all autonomy_policy values.

**Out-of-Scope register check:** before EACH task, verify the task does not deliver any item from the spec's Out-of-Scope register (OOS-N). If a task accidentally addresses an OOS-N item, that's scope creep — stop and ask user to either re-scope the story or revise the OOS register.

**Risks register check:** for each HIGH-impact risk in the spec, verify the planned implementation includes the declared mitigation. Missing mitigation on a HIGH-impact risk → HALT and ask user.

### 1. For Each Unchecked Task in the Issue

#### RED Phase — Write Failing Test

1. Write failing test(s) for the task
2. Run tests: `{TEST_COMMAND} -- {test_file}` (or the project-specific single-file test command)
3. **VERIFY they FAIL** for the right reason (missing implementation)
4. Explicitly state: `Tests fail because: [exact reason]`

**FORBIDDEN TDD shortcuts:**
- Removing/weakening assertions to make tests pass
- Writing implementation first, then retroactive tests
- Adding `.skip` to bypass failing tests
- Returning hardcoded values without real implementation

**FORBIDDEN data patterns (apply zero-fallback rules loaded at initialization):**
- `??` or `||` fallback on business-critical fields flowing to external systems, billing, or display
- Using a semantically different column because the correct one is unavailable
- Computing a derived value instead of reading the actual source
- Defaults (`0`, `''`, `'N/A'`) on required fields — if null -> throw + alert, NEVER substitute
- Data migrations (UPDATE/DELETE) with WHERE clauses that silently match zero rows in any target environment — names, slugs, and IDs differ between dev, staging, and production. If DB access is available, verify the WHERE clause against real data before committing. A migration that silently does nothing is a zero-fallback violation.

#### GREEN Phase — Implement

1. Write MINIMUM code to make tests pass
2. Run tests: verify they PASS
3. If tests fail -> fix implementation (not tests)

#### REFACTOR Phase

1. Improve code quality without changing behavior
2. Scope boundary: ONLY files modified during GREEN
3. Run tests — still PASS

#### Runtime Robustness Guardrails (apply per detected stack)

After GREEN passes, before COMMIT, apply both protocols loaded JIT:

- `~/.claude/skills/bmad-shared/protocols/concurrency-review.md`
- `~/.claude/skills/bmad-shared/protocols/null-safety-review.md`

The protocols read `~/.claude/skills/bmad-shared/stacks/{language}.md` for the detected languages.

**Concurrency guardrail** — apply when the changed code involves goroutines, threads, async tasks, queues, batch processors, schedulers, callbacks under timers, or shared mutable state. Run the language-specific concurrent test command:

- Go: `go test -race ./...` MUST pass — failure is a HALT (not "skip", not "known issue")
- Rust: `cargo test` with relevant async tests; consider `loom` for low-level critical sections
- TypeScript / Node.js: stress test pattern — `await Promise.all(Array.from({ length: 100 }, () => fn(sharedKey)))` and assert state consistency
- Python: `pytest-asyncio` async tests with `asyncio.gather(*[fn() for _ in range(100)])`

If the project has no concurrent test for the new code path, **add one before commit**.

**Null safety guardrail** — for every nullable field crossing a boundary touched by this change, verify the project's stack-specific compiler/lint configuration enforces it:

- Go: `go vet`, `staticcheck`, optionally `nilaway`
- Rust: `clippy::unwrap_used`, `clippy::expect_used`, `clippy::indexing_slicing` denied at crate level
- TypeScript: `tsconfig.json` has `strictNullChecks: true` AND `noUncheckedIndexedAccess: true`
- Python: `mypy --strict` (or `pyright --strict`) and `ruff` rules `B008`, `S101`, `RUF013`

A test exercises the absent-value path for every new nullable field. Missing test = MAJOR finding (do not commit).

**Note:** the term "zero-fallback rules" in this file refers to `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md` — that file/rule is NOT renamed by this story. Only the dev-story self-review YAML report key (`scores.zero_fallback`) and perspective heading rename to `runtime_robustness`.

### 2. Verify Test Coverage

After all tasks complete:
- Unit tests for all business logic
- Integration tests for API endpoints / DB operations
- Edge cases identified in the issue description
- Each source file has corresponding test file

```bash
{TEST_COMMAND}
```

### 3. Quality Checks

```bash
{QUALITY_GATE}
```

### 4. Commit

```bash
git add {specific_files}  # NOT git add . or git add -A
git commit -m "feat({scope}): {brief summary}"
```

Commit conventions: use conventional commits format (`feat`, `fix`, `refactor`, `test`, `chore`). Scope is the affected area.

### 5. Proceed

Load and execute {nextStepFile}.

**HALT conditions — STOP immediately if:**
- Missing dependencies that cannot be resolved
- 3 consecutive test failures on same task
- Security concern discovered
- Required data source is inaccessible and no semantically correct alternative exists (do NOT use wrong data as fallback)
- `go test -race` failure on a Go change — concurrency bug, NEVER ship without fixing

## SUCCESS/FAILURE:

### SUCCESS: All tasks TDD'd, tests pass, quality checks pass, committed
### FAILURE: Skipping RED phase, committing with failing tests, using mocks in unit tests

---

## STEP EXIT (CHK-STEP-08-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Solo Implementation (TDD)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
