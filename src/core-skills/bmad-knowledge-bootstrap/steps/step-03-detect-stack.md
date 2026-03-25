---
nextStepFile: './step-04-generate-context.md'
---

# Step 3: Detect Stack and Infrastructure

## STEP GOAL:

Auto-detect frameworks, ORMs, architecture patterns, test tools, code conventions, cloud provider, CI/CD, containers, IaC, and database setup. Build a structured `detected_stack` profile.

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

### 11. Ask User

Present findings and ask:
1. **Reference code**: Which directories represent good patterns? Which are legacy/forbidden?
2. **Forbidden patterns**: Patterns to flag in reviews?
3. **Environments**: Which exist? (dev, staging, production)
4. **Deployment model**: How triggered? (auto on merge, manual, tag-based)
5. **Database rules**: Any prohibitions? (never db:push, never manual DDL)
6. **Env var policy**: Must crash on missing, or fallbacks allowed?

### 12. Present Combined Summary

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

### 13. Proceed

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
