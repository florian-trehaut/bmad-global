---
nextStepFile: './step-03-research-scan.md'
---

# Step 2: Detect Stack and Infrastructure


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Detect Stack and Infrastructure with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Auto-detect frameworks, ORMs, architecture patterns, test tools, code conventions, cloud provider, CI/CD, containers, IaC, and database setup from the codebase. Build a structured `detected_stack` profile.

## SKIP CONDITION

If `CODE_PRESENT=false` (set by step-01-preflight when no codebase manifest or source files detected) — **SKIP this step entirely** and proceed directly to {nextStepFile}. Set `detected_stack = {}` (empty profile). Knowledge will be derived from planning artifacts and/or phase 4 specs in subsequent steps.

## MANDATORY SEQUENCE

### 1. Detect Frameworks

Refer to `../data/detection-patterns.md` for signal patterns.

```bash
# JS/TS frameworks
ls nest-cli.json next.config.* angular.json vite.config.* nuxt.config.* 2>/dev/null
# Python
ls requirements.txt pyproject.toml setup.py Pipfile 2>/dev/null
# Rust / Go
ls Cargo.toml go.mod 2>/dev/null
```

For monorepo: check each app directory separately → build per-service framework table.

### 2. Detect ORMs

```bash
ls prisma/schema.prisma drizzle.config.* 2>/dev/null
grep -rl "typeorm\|sequelize\|sqlalchemy\|gorm\|diesel" */package.json apps/*/package.json requirements.txt pyproject.toml Cargo.toml go.mod 2>/dev/null
```

Map each service to its ORM.

### 3. Detect Architecture Patterns

```bash
find . -maxdepth 4 -type d \( -name "domain" -o -name "infrastructure" -o -name "controllers" -o -name "features" -o -name "handlers" -o -name "commands" \) -not -path "*/node_modules/*" 2>/dev/null | head -20
```

Classify: Hexagonal (domain/infrastructure/api), Layered/MVC (controllers/models), Feature-based (features/), CQRS (handlers/commands/queries), Modular (modules/).

Store per scope (e.g., backend: Hexagonal, frontend: Feature-based).

### 4. Detect Source File Patterns

```bash
# Source extensions by frequency
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.tsx" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/vendor/*" | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -5

# Test file naming patterns
find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" -o -name "test_*" \) -not -path "*/node_modules/*" | head -10
```

Store as `source_extensions` (glob list) and `test_file_patterns` (glob list).

### 5. Detect Test Frameworks

```bash
ls vitest.config.* jest.config.* pytest.ini conftest.py 2>/dev/null
find . -maxdepth 3 -name "vitest.config.*" -o -name "jest.config.*" 2>/dev/null
```

Determine test suffixes and location conventions.

### 6. Detect Code Conventions

```bash
ls .prettierrc* .eslintrc* eslint.config.* biome.json rustfmt.toml .editorconfig 2>/dev/null
ls tsconfig.json tsconfig.base.json 2>/dev/null
```

### 7. Detect Cloud Provider

```bash
which gcloud 2>/dev/null; ls .gcloudignore app.yaml 2>/dev/null
which aws 2>/dev/null; ls serverless.yml sam-template.yaml 2>/dev/null
which az 2>/dev/null; ls azure-pipelines.yml 2>/dev/null
ls vercel.json fly.toml railway.json Procfile 2>/dev/null
```

### 8. Detect CI/CD

```bash
ls .gitlab-ci.yml 2>/dev/null; ls -d .github/workflows/ 2>/dev/null
ls Jenkinsfile bitbucket-pipelines.yml .circleci/config.yml 2>/dev/null
```

If found: scan for deployment stages, security scans, auto-deploy triggers.

### 9. Detect Containers and IaC

```bash
ls Dockerfile docker-compose.yml docker-compose.yaml compose.yml 2>/dev/null
find . -maxdepth 3 -type d -name "terraform" 2>/dev/null
ls Pulumi.yaml cdk.json 2>/dev/null
```

### 10. Detect Database Setup

```bash
find . -maxdepth 4 -type d -name "migrations" -not -path "*/node_modules/*" 2>/dev/null
grep -i "DATABASE_URL\|DB_HOST\|MONGO_URI\|REDIS_URL" .env.example 2>/dev/null
```

### 11. Detect Validation Tooling

```bash
# E2E frameworks
ls playwright.config.* cypress.config.* 2>/dev/null
grep -l "tauri-driver\|tauri-plugin-playwright" Cargo.toml 2>/dev/null

# Component test frameworks (beyond what step 5 detects — validation-specific)
ls vitest.config.* jest.config.* 2>/dev/null

# Accessibility testing
grep -l "axe-core\|pa11y" package.json Cargo.toml 2>/dev/null

# Visual regression
grep -l "percy\|chromatic" package.json 2>/dev/null

# BDD/Acceptance
grep -l "cucumber" package.json Cargo.toml 2>/dev/null

# Property-based testing
grep -l "proptest\|quickcheck\|fast-check" Cargo.toml package.json 2>/dev/null

# Performance
grep -l "lighthouse\|@lhci" package.json 2>/dev/null

# WASM testing
grep -l "wasm-pack\|wasm-bindgen-test" Cargo.toml 2>/dev/null

# WASM frontend frameworks (Leptos, Yew, Dioxus)
grep -l "leptos\|yew\|dioxus" Cargo.toml 2>/dev/null

# Tauri
ls src-tauri/tauri.conf.json tauri.conf.json 2>/dev/null
```

Store as `detected_validation_stack`.

### 12. Ask User

Present findings and ask:
1. **Reference code**: Which directories represent good patterns? Which are legacy/forbidden?
2. **Forbidden patterns**: Patterns to flag in reviews?
3. **Environments**: Which exist? (dev, staging, production)
4. **Deployment model**: How triggered? (auto on merge, manual, tag-based)
5. **Database rules**: Any prohibitions? (never db:push, never manual DDL)
6. **Env var policy**: Must crash on missing, or fallbacks allowed?

### 13. Present Combined Summary

```
Stack:
  Frameworks:       {per-service table or single framework}
  ORMs:             {list}
  Architecture:     {pattern per scope}
  Source files:     {extensions list}
  Test files:       {patterns list}
  Test framework:   {framework}
  Conventions:      {linter + formatter}

Infrastructure:
  Cloud:            {provider}
  CI/CD:            {system}
  IaC:              {tool or none}
  Containers:       {Docker / none}
  Database:         {provider via ORM}

Reference code:     {list}
Forbidden sources:  {list}
Forbidden patterns: {list}
```

HALT — ask: "Does this look correct? Anything to add or correct?"

Store all confirmed values.

### 14. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All detection categories attempted
- Source file patterns detected (not hardcoded)
- Architecture patterns classified
- User confirmed findings

### FAILURE:

- Hardcoding file extensions instead of detecting
- Skipping infrastructure detection
- Not asking about deployment model

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Detect Stack and Infrastructure
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
