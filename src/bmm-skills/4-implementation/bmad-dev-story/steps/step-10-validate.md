---
nextStepFile: './step-11-self-review.md'
---

# Step 10: Final Validations

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

If `.claude/workflow-knowledge/infrastructure.md` exists at project root, verify against it.

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
