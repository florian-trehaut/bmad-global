# Step 2: Generate CI Pipeline Configuration

## STEP GOAL

Create the platform-specific CI pipeline configuration file with test execution, parallel sharding, burn-in loop, caching, artifact collection, and report aggregation.

## RULES

- Use the CI templates from `~/.claude/skills/bmad-tea-ci/data/` as starting points, then adapt to the project
- Every value in the generated config must reflect the actual project (framework, Node version, test commands, paths)
- Never hardcode values that were detected in step 01 — use the detected values
- If the project uses Cypress instead of Playwright, adapt browser install commands and cache paths accordingly
- If the project uses a non-browser framework (Vitest, Jest), omit browser install/cache sections

## SEQUENCE

### 1. Load Template

Based on `CI_PLATFORM`:

| Platform | Template | Output path |
|----------|----------|-------------|
| **GitHub Actions** | `~/.claude/skills/bmad-tea-ci/data/github-actions-template.yaml` | `.github/workflows/test.yml` |
| **GitLab CI** | `~/.claude/skills/bmad-tea-ci/data/gitlab-ci-template.yaml` | `.gitlab-ci.yml` |

Read the template file fully.

### 2. Adapt Pipeline Stages

The pipeline must include these stages, adapted to the detected project:

**a. Lint stage**
- Run the project's lint command (from `package.json` scripts)
- If no lint script exists, skip this stage and note it in the summary
- Timeout: 5 minutes

**b. Test stage (parallel shards)**
- Use `SHARD_COUNT` shards (default: 4)
- Sharding syntax depends on framework:
  - Playwright: `--shard={N}/{TOTAL}`
  - Cypress: requires `cypress-parallel` or split by spec files
  - Vitest: `--shard={N}/{TOTAL}`
  - Jest: `--shard={N}/{TOTAL}`
- Set `fail-fast: false` (GitHub Actions) or equivalent
- Timeout: 30 minutes per shard

**c. Burn-in stage (flaky detection)**
- Run `BURN_IN_ITERATIONS` iterations (default: 10)
- Exit immediately on first failure (`|| exit 1`)
- Trigger conditions: PRs to main/develop branches + scheduled runs
- Timeout: 60 minutes

**d. Report stage**
- Aggregate results from test and burn-in stages
- Generate summary (GitHub step summary / GitLab artifacts)

### 3. Configure Caching

Based on the detected package manager:

| Package manager | Cache path | Cache key |
|----------------|-----------|-----------|
| **npm** | `~/.npm` | `hashFiles('**/package-lock.json')` |
| **yarn** | `~/.yarn/cache` | `hashFiles('**/yarn.lock')` |
| **pnpm** | `~/.pnpm-store` | `hashFiles('**/pnpm-lock.yaml')` |

If browser-based framework (Playwright/Cypress), add browser cache:
- Playwright: `~/.cache/ms-playwright`
- Cypress: `~/.cache/Cypress`

### 4. Configure Artifacts

Upload on failure only:
- `test-results/` directory
- Framework-specific report directory (`playwright-report/`, `cypress/screenshots/`, etc.)
- Traces/videos if applicable
- Retention: 30 days
- Unique artifact names per shard

### 5. Configure Retry Logic

- Max retries: 2 attempts for test jobs
- Retry only on infrastructure/transient errors (not test assertion failures)
- For Playwright: use `--retries=1` in the test command
- For other frameworks: use CI-level retry

### 6. Write Configuration

Create necessary directories (e.g., `.github/workflows/`) if they don't exist.

Write the adapted pipeline configuration to the output path.

### 7. Generate Helper Scripts

Create the following in `scripts/`:

**a. `scripts/ci-local.sh`** — Run CI pipeline locally (mirrors CI environment)
```bash
#!/bin/bash
# Run CI test pipeline locally
set -euo pipefail
npm ci
npm run lint
npm run test:e2e
```

**b. `scripts/burn-in.sh`** — Run burn-in loop locally
```bash
#!/bin/bash
# Local burn-in loop for flaky test detection
set -euo pipefail
ITERATIONS=${1:-10}
for i in $(seq 1 $ITERATIONS); do
  echo "Burn-in iteration $i/$ITERATIONS"
  npm run test:e2e || { echo "FAILED on iteration $i"; exit 1; }
done
echo "Burn-in complete — no flaky tests detected"
```

Adapt commands to the actual project (test command, framework).

Make scripts executable (`chmod +x`).

---

**Next:** Read fully and follow `./step-03-quality-gates.md`
