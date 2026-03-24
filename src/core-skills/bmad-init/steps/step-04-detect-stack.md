# Step 04 — Detect Tech Stack

**Goal:** Auto-detect frameworks, ORMs, architecture patterns, test tools, and code conventions.

---

## 1. Detect Frameworks

Scan for framework signals. Refer to `../data/detection-patterns.md` for the full pattern table.

```bash
# NestJS
ls nest-cli.json 2>/dev/null; grep -l "@nestjs/core" package.json */package.json apps/*/package.json 2>/dev/null

# Next.js
ls next.config.* 2>/dev/null

# Angular
ls angular.json 2>/dev/null

# Vite
ls vite.config.* 2>/dev/null

# Nuxt
ls nuxt.config.* 2>/dev/null

# Python
ls requirements.txt pyproject.toml setup.py Pipfile 2>/dev/null

# Go
ls go.mod 2>/dev/null

# Rust
ls Cargo.toml 2>/dev/null
```

For monorepo: check each app directory separately to build a per-service framework table.

```bash
# Per-app detection (monorepo)
for app in apps/*/; do
  name=$(basename "$app")
  echo "=== $name ==="
  grep -o '"@nestjs/core"' "$app/package.json" 2>/dev/null && echo "  → NestJS"
  ls "$app/next.config."* 2>/dev/null && echo "  → Next.js"
  ls "$app/vite.config."* 2>/dev/null && echo "  → Vite"
done
```

## 2. Detect ORMs

```bash
# Prisma
ls prisma/schema.prisma 2>/dev/null; find . -maxdepth 4 -name "schema.prisma" 2>/dev/null | head -20

# Drizzle
ls drizzle.config.* 2>/dev/null; grep -rl "drizzle-orm" */package.json apps/*/package.json 2>/dev/null

# TypeORM
grep -rl "typeorm" */package.json apps/*/package.json 2>/dev/null

# Sequelize
grep -rl "sequelize" */package.json apps/*/package.json 2>/dev/null

# SQLAlchemy (Python)
grep -rl "sqlalchemy" requirements.txt pyproject.toml 2>/dev/null
```

For monorepo: map each service to its ORM.

## 3. Detect Architecture Patterns

```bash
# Hexagonal (ports/adapters)
find . -maxdepth 4 -type d -name "domain" 2>/dev/null | head -10
find . -maxdepth 4 -type d -name "infrastructure" 2>/dev/null | head -10
find . -maxdepth 4 -type d -name "api" -not -path "*/node_modules/*" 2>/dev/null | head -10

# MVC
find . -maxdepth 4 -type d -name "controllers" 2>/dev/null | head -10
find . -maxdepth 4 -type d -name "models" 2>/dev/null | head -10

# Feature-based
find . -maxdepth 4 -type d -name "features" 2>/dev/null | head -10
find . -maxdepth 4 -type d -name "modules" -not -path "*/node_modules/*" 2>/dev/null | head -10
```

Determine predominant pattern across the codebase.

## 4. Detect Test Frameworks

```bash
# Vitest
ls vitest.config.* 2>/dev/null; find . -maxdepth 3 -name "vitest.config.*" 2>/dev/null

# Jest
ls jest.config.* 2>/dev/null; find . -maxdepth 3 -name "jest.config.*" 2>/dev/null

# Mocha
grep -l "mocha" package.json 2>/dev/null

# Pytest
ls pytest.ini pyproject.toml conftest.py 2>/dev/null

# Custom runners
ls tests/ 2>/dev/null; find . -maxdepth 3 -type d -name "journeys" 2>/dev/null
```

Determine test suffixes and location conventions:
```bash
# Find test files
find . -name "*.spec.ts" -not -path "*/node_modules/*" 2>/dev/null | head -5
find . -name "*.test.ts" -not -path "*/node_modules/*" 2>/dev/null | head -5
find . -name "*.integration.spec.ts" -not -path "*/node_modules/*" 2>/dev/null | head -5
```

## 5. Detect Code Conventions

```bash
# Prettier
ls .prettierrc .prettierrc.* prettier.config.* 2>/dev/null

# ESLint
ls .eslintrc .eslintrc.* eslint.config.* 2>/dev/null

# TypeScript config
ls tsconfig.json tsconfig.base.json 2>/dev/null
```

Check for strict mode, path aliases, import conventions.

## 6. Ask User

After presenting all auto-detected findings, ask:

1. **Reference code**: Which services/directories represent good patterns to follow? Which are legacy/forbidden?
2. **Forbidden patterns**: Any patterns that should be flagged in reviews? (e.g., mocks, console.log, any, etc.)
3. **Anything missing or wrong** in the detected stack?

---

## CHECKPOINT

Present the detected stack as a draft table:

**Monorepo (if applicable):**

```
| Service | Framework | ORM | Schema | Notes |
|---------|-----------|-----|--------|-------|
| app-a   | NestJS 11 | Prisma | public | |
| app-b   | Next.js   | Drizzle | — | |
| ...     | ...       | ...    | ...    | |
```

**Architecture:** {Hexagonal / MVC / Feature-based / Mixed}

**Test framework:** {Vitest / Jest / Mixed} — Suffixes: `*.spec.ts`, `*.integration.spec.ts`

**Code conventions:** {Prettier + ESLint + TypeScript strict}

**Reference code:** {list}
**Forbidden sources:** {list}
**Forbidden patterns:** {list}

Ask user: "Does this stack summary look correct? Anything to add or correct?"

**Store all confirmed values for step-06 and step-07 (stack.md generation).**

---

**Next:** Read and follow `./steps/step-05-detect-infra.md`
