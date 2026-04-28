# Step 1: Preflight Checks


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Preflight Checks with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Verify CI prerequisites, detect the test framework, and determine the target CI platform.

## RULES

- All detection must be based on actual files found in the repository — never assume
- If git is not initialized, HALT immediately
- If no test framework is detected, HALT and suggest setting one up first
- If multiple CI platforms are detected, ask the user which to target
- Node version must come from `.nvmrc` or `package.json` engines field — default to current LTS only as last resort

## SEQUENCE

### 1. Verify Git Repository

Check that `.git/` exists in the project root.

Check for a configured remote (`git remote -v`).

**HALT if `.git/` is missing:** "Git repository required for CI/CD setup. Run `git init` first."

If no remote is configured, warn but do not halt — the pipeline can still be generated.

### 2. Detect Test Framework

Search for test framework configuration files:

| Framework | Config files | Package indicator |
|-----------|-------------|-------------------|
| **Playwright** | `playwright.config.ts`, `playwright.config.js` | `@playwright/test` in devDependencies |
| **Cypress** | `cypress.config.ts`, `cypress.config.js`, `cypress.json` | `cypress` in devDependencies |
| **Vitest** | `vitest.config.ts`, `vite.config.ts` (with test block) | `vitest` in devDependencies |
| **Jest** | `jest.config.ts`, `jest.config.js`, `jest.config.json` | `jest` in devDependencies |

Also read `package.json` scripts to identify test commands (e.g., `test`, `test:e2e`, `test:unit`, `test:integration`).

Set `TEST_FRAMEWORK` to the detected framework.

**HALT if no framework detected:** "No test framework configuration found. Set up a test framework before configuring CI."

### 3. Detect CI Platform

Check for existing CI configuration:

| Platform | Indicator files |
|----------|----------------|
| **GitHub Actions** | `.github/workflows/*.yml` or `.github/workflows/*.yaml` |
| **GitLab CI** | `.gitlab-ci.yml` |

If existing config is found:
> "Existing {platform} configuration found at {path}. Update the existing config or create a new test pipeline alongside it?"

WAIT for user response.

If no existing config is found, infer from git remote:
- `github.com` in remote URL -> GitHub Actions
- `gitlab.com` or `gitlab` in remote URL -> GitLab CI

If still ambiguous, ask the user:
> "Which CI platform? [1] GitHub Actions [2] GitLab CI"

WAIT for user response.

Set `CI_PLATFORM` to the detected/selected platform.

### 4. Read Environment Context

Detect Node version:
1. Read `.nvmrc` if present
2. Else check `package.json` `engines.node` field
3. Else default to Node 22 (current LTS) and inform the user

Read `package.json` to determine:
- Package manager (`npm`, `yarn`, `pnpm`) — check for lockfile presence
- Dependency install command (`npm ci`, `yarn install --frozen-lockfile`, `pnpm install --frozen-lockfile`)
- Cache paths for the detected package manager

Set `NODE_VERSION` to the detected version.

### 5. CHECKPOINT

Present detected configuration:

> **Preflight Summary**
>
> - **Git:** Initialized, remote: {remote URL or "none"}
> - **Test framework:** {TEST_FRAMEWORK}
> - **Test command:** {detected command from package.json}
> - **CI platform:** {CI_PLATFORM}
> - **Node version:** {NODE_VERSION} (source: {.nvmrc / package.json / default})
> - **Package manager:** {npm/yarn/pnpm}
> - **Existing CI config:** {path or "none"}

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Preflight Checks
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-generate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
