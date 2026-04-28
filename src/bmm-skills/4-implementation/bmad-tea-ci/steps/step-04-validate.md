# Step 4: Validate and Summarize


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Validate and Summarize with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate the generated CI configuration against the quality checklist and present a completion summary with next steps for the user.

## RULES

- Every validation item must be checked — do not skip any
- If a validation item fails, fix it before completing the workflow
- The summary must include exact file paths and actionable next steps

## SEQUENCE

### 1. Configuration Validation

Verify the generated CI config file:

**Structural checks:**
- [ ] File is valid YAML (no syntax errors)
- [ ] All stages present: lint, test, burn-in, report
- [ ] Sharding configured with `fail-fast: false`
- [ ] Burn-in loop with correct iteration count and exit-on-failure
- [ ] Artifact upload on failure with retention policy
- [ ] Caching configured for dependencies and browsers (if applicable)
- [ ] Concurrency control configured
- [ ] Timeouts set on all jobs

**Project alignment checks:**
- [ ] Node version matches project (`.nvmrc` / `package.json`)
- [ ] Test command matches project (`package.json` scripts)
- [ ] Artifact paths match framework output directories
- [ ] Package manager commands are correct
- [ ] No hardcoded values that should be dynamic

**Security checks:**
- [ ] No credentials or secrets in the configuration file
- [ ] Secrets reference platform secret management (not env vars)
- [ ] No debug output that could expose secrets

Fix any failing checks before proceeding.

### 2. Helper Scripts Validation

Verify generated scripts:

- [ ] `scripts/ci-local.sh` exists and is executable
- [ ] `scripts/burn-in.sh` exists and is executable
- [ ] Scripts use the correct test commands
- [ ] Scripts have proper shebang (`#!/bin/bash`)
- [ ] Scripts use `set -euo pipefail`

### 3. Completion Summary

Present to the user:

> **CI Pipeline Setup Complete**
>
> **Platform:** {CI_PLATFORM}
> **Config file:** {output path}
>
> **Pipeline stages:**
> - Lint: {lint command or "skipped — no lint script found"}
> - Test: {SHARD_COUNT} parallel shards, {test command}
> - Burn-in: {BURN_IN_ITERATIONS} iterations, triggers: {PR/schedule/manual}
> - Report: aggregated summary
>
> **Quality gates:**
> - 100% test pass rate required
> - Burn-in stability gate
> - Concurrency: cancel-in-progress
>
> **Files created:**
> - {CI config path}
> - `scripts/ci-local.sh`
> - `scripts/burn-in.sh`
> - `docs/ci-secrets.md` (if secrets documented)
>
> **Next steps for you:**
> 1. Review the generated CI configuration
> 2. Configure required secrets in {CI_PLATFORM} settings
> 3. Commit and push to trigger the first pipeline run
> 4. Monitor the first run and adjust shard count if needed
> 5. Run `scripts/burn-in.sh` locally to validate flaky detection

---

**Workflow complete.**

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Validate and Summarize
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-tea-ci executed end-to-end:
  steps_executed: ['01', '02', '03', '04']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
