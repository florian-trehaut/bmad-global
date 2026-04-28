# Step 4: Documentation & Scripts


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
CHK-STEP-04-ENTRY PASSED — entering Step 4: Documentation & Scripts with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Create test documentation and add the necessary scripts to `package.json` so the test suite is immediately usable.

## RULES

- Documentation must be accurate to the actual scaffold — reference real file paths, real commands
- package.json modifications must be minimal and non-destructive (add scripts, do not remove existing ones)
- Do not add dependencies to package.json — the user will install them via the instructions

## SEQUENCE

### 1. Create tests/README.md

Create `{TEST_DIR}/README.md` with the following sections:

**Setup:**
- Prerequisites (Node.js version, framework install command)
- Environment configuration (copy `.env.example`, fill values)
- Browser installation (Playwright: `npx playwright install`, Cypress: auto on first run)

**Running Tests:**
- Run all tests: `npm run test:e2e`
- Run headed (visible browser): framework-specific command
- Run specific test file: framework-specific command
- Run in debug mode: framework-specific command
- View test report: framework-specific command

**Architecture:**
- Directory structure overview (tree view of what was scaffolded)
- Fixture pattern explanation (how to add new fixtures)
- Factory pattern explanation (how to add new factories)
- Helper pattern explanation (when and how to add helpers)

**Best Practices:**
- Use `data-testid` for selectors
- Follow Given/When/Then structure
- One assertion focus per test
- Use factories for test data, never hardcode
- Clean up created data after tests
- Network interception before navigation (if Playwright)
- No hard-coded waits — use framework wait mechanisms

**CI Integration:**
- Recommended CI script
- Environment variables needed in CI
- Artifact collection (traces, screenshots, videos)
- Parallel execution configuration

### 2. Update package.json scripts

Read the current `package.json` and add the following scripts (do not overwrite existing scripts):

**If Playwright:**

```json
{
  "scripts": {
    "test:e2e": "npx playwright test",
    "test:e2e:headed": "npx playwright test --headed",
    "test:e2e:ui": "npx playwright test --ui",
    "test:e2e:report": "npx playwright show-report"
  }
}
```

**If Cypress:**

```json
{
  "scripts": {
    "test:e2e": "npx cypress run",
    "test:e2e:open": "npx cypress open"
  }
}
```

Merge these into the existing `scripts` object. If a script key already exists, do NOT overwrite it — report the conflict and let the user decide.

### 3. List dependencies to install

Present the list of packages the user needs to install (do NOT run npm install):

**If Playwright:**
```
npm install -D @playwright/test @faker-js/faker
npx playwright install
```

**If Cypress:**
```
npm install -D cypress @faker-js/faker
```

**If TypeScript and not already installed:**
```
npm install -D typescript @types/node
```

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Documentation & Scripts
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-05-validate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
