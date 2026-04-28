# Step 3: Quality Gates and Notifications


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Quality Gates and Notifications with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Configure burn-in loop parameters, quality gate thresholds, and notification hooks in the generated CI pipeline.

## RULES

- Quality gates must be concrete and enforceable in CI — no aspirational thresholds
- Burn-in parameters must be tuned to the project size (large suites may need fewer iterations)
- Notification configuration should be optional — present options and let the user decide

## SEQUENCE

### 1. Burn-In Configuration Review

Review the burn-in stage generated in step 02 and verify:

| Parameter | Default | Adjustment criteria |
|-----------|---------|-------------------|
| **Iterations** | 10 | Reduce to 5 if test suite > 100 tests (runtime concern) |
| **Trigger** | PRs + schedule | Add `workflow_dispatch` for manual runs |
| **Schedule** | Weekly (Sunday 2 AM UTC) | Adjust based on team preference |
| **Timeout** | 60 minutes | Increase if single run > 5 minutes |

Ask the user:
> "Burn-in defaults: {BURN_IN_ITERATIONS} iterations, weekly schedule (Sunday 2 AM UTC), on PRs to main/develop. Adjust any of these?"

WAIT for user response. Apply any requested changes to the CI config.

### 2. Quality Gates

Define pass/fail criteria for the pipeline:

**a. Test pass rate**
- All tests must pass (100% pass rate) — no partial pass threshold
- Burn-in: all iterations must pass (any failure = flaky test detected)

**b. Lint gate**
- Lint must pass before tests run (pipeline dependency)
- Zero lint errors required (warnings configurable)

**c. Coverage gate (optional)**
- If the project has coverage configured, add coverage threshold check
- Ask the user if coverage reporting should be added to the pipeline

**d. Concurrency control**
- Cancel in-progress runs on the same branch (GitHub Actions: `concurrency` group)
- Prevent parallel burn-in runs (resource-intensive)

### 3. Notifications

Present notification options:

> "Configure failure notifications? Options:
> [1] GitHub/GitLab native (PR status checks only — no extra setup)
> [2] Slack webhook (requires `SLACK_WEBHOOK_URL` secret)
> [3] Email (platform-dependent)
> [4] None — rely on PR status checks"

WAIT for user response.

If Slack is chosen:
- Add a notification step to the report stage
- Document the required `SLACK_WEBHOOK_URL` secret
- Include pipeline URL and failure summary in the notification payload

### 4. Secrets Documentation

Create `docs/ci-secrets.md` documenting all required CI secrets:

| Secret | Required | Purpose |
|--------|----------|---------|
| (framework-specific secrets) | Varies | Test execution |
| `SLACK_WEBHOOK_URL` | If Slack notifications enabled | Failure alerts |

Include setup instructions for the detected CI platform:
- GitHub Actions: Repository Settings -> Secrets and variables -> Actions
- GitLab CI: Project Settings -> CI/CD -> Variables

### 5. Apply Changes

Update the CI configuration file with any modifications from this step (burn-in adjustments, notification steps, concurrency settings).

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Quality Gates and Notifications
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-04-validate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
