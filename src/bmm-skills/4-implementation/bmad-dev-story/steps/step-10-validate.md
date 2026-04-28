---
nextStepFile: './step-11-self-review.md'
---

# Step 10: Final Validations


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-10-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-10-ENTRY PASSED — entering Step 10: Final Validations with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Run all validation commands and verify infrastructure coherence for every impacted service.

## MANDATORY SEQUENCE

### 1. Run Validation Suite

Inside {WORKTREE_PATH}:

```bash
{TEST_COMMAND}
{BUILD_COMMAND}
{LINT_COMMAND}
```

<check if="any validation fails">
  Fix the issue. Re-run validations.
  If 3 consecutive failures -> HALT.
</check>

### 2. Infrastructure Coherence Check

Identify all services modified:

```bash
cd {WORKTREE_PATH}
git diff --name-only origin/main...HEAD | grep -oE '^(apps|libs|packages)/[^/]+' | sort -u
```

For EACH impacted service, verify:

1. **Build** — service included in CI/CD build phase
2. **Database migrations** — if schema files modified: migration file generated, migration step in CI/CD
3. **Deployment** — deployment config exists, referenced in pipeline
4. **Infrastructure** — IaC modules for new cloud resources
5. **Secrets and config** — env vars referenced in deployment config
6. **Stale references** — grep Dockerfiles and CI scripts for removed dependencies
7. **Cloud resources** — any created outside IaC = BLOCKER
8. **Changesets** — if shared packages/libs modified: changeset file exists

Verify against `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION).

Report per service:

```
Service: {name}
  Build pipeline:     OK / MISSING / WARNING
  Migrations:         OK / MISSING / WARNING
  Deployment config:  OK / MISSING / WARNING
  Infrastructure:     OK / MISSING / WARNING
  Secrets/config:     OK / MISSING / WARNING
```

<check if="any layer is MISSING or PARTIAL">
  HALT — report exact gaps.
  Do NOT proceed until all services are fully deployable.
</check>

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All validations pass, all services deployable
### FAILURE: Proceeding with failing tests, missing infra

---

## STEP EXIT (CHK-STEP-10-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-10-EXIT PASSED — completed Step 10: Final Validations
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
