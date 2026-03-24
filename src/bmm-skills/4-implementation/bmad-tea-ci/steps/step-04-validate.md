# Step 4: Validate and Summarize

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
