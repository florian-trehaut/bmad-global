# Step 01: Scan Codebase


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
CHK-STEP-01-ENTRY PASSED — entering Step 01: Scan Codebase with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Scan the entire codebase to extract non-obvious details an LLM needs to work effectively: tech stack, architecture patterns, conventions, test setup, gotchas. Produce a structured analysis ready for compilation into project-context.md.

## RULES

- Read actual files — never infer from directory names alone
- Focus on unobvious details — skip anything an LLM would correctly assume from standard framework defaults
- Cover all dimensions below even if some yield no findings
- Do not document obvious things (e.g., "TypeScript uses .ts files")

## SEQUENCE

### 1. Discover project structure

Scan the top-level directory structure. Identify:
- Monorepo vs single-app layout
- Package manager (lockfile type)
- Build orchestrator (Nx, Turborepo, Lerna, none)
- Key config files (tsconfig, eslint, prettier, docker-compose)

Read the root `package.json` (or equivalent) for workspace definitions.

### 2. Identify tech stack per service/app

For each app or service in the monorepo:
- **Framework & version** — read package.json dependencies
- **ORM / DB layer** — Prisma, Drizzle, TypeORM, Knex, raw SQL
- **Schema management** — migration strategy (Prisma migrate, Drizzle generate, Flyway)
- **API style** — REST, GraphQL, gRPC, event-driven
- **Messaging** — Pub/Sub, RabbitMQ, Kafka, none
- **Runtime** — Node version, ESM vs CJS, module resolution

### 3. Analyze architecture patterns

Scan representative source files for:
- **Layer structure** — hexagonal/ports-and-adapters, MVC, clean architecture, or flat
- **Dependency injection** — NestJS modules, manual DI, service locator
- **Domain modeling** — rich domain models vs anemic, value objects, aggregates
- **Error handling** — custom exceptions, result types, error codes
- **Shared code** — packages/, libs/, how cross-cutting concerns are organized

### 4. Extract conventions

Look for implicit rules by scanning multiple files:
- **Import style** — relative vs path aliases, `.js` extension requirement
- **Naming conventions** — files, classes, methods, constants
- **Code organization within a service** — folder structure patterns (api/, domain/, infrastructure/)
- **Formatting** — prettier/eslint config specifics that deviate from defaults
- **Environment handling** — env var patterns, config modules, validation

### 5. Analyze test setup

For each test type found:
- **Framework** — Jest, Vitest, Playwright, custom runner
- **Configuration** — separate configs per type, shared setup files
- **Test utilities** — factories, fixtures, helpers, testcontainers
- **Naming convention** — `.spec.ts`, `.test.ts`, `.integration.spec.ts`, `.e2e.spec.ts`
- **Run commands** — how each type is executed

### 6. Identify gotchas and anti-patterns

Scan for things that would trip up an LLM:
- Legacy code that should NOT be used as reference (deprecated patterns)
- Database quirks (shared schemas, read-only services, cross-DB references)
- Deployment specifics (CI/CD patterns, environment differences)
- Published packages with registry specifics
- Git workflow conventions (branch naming, commit format, MR process)

### 7. CHECKPOINT

Present a summary of findings to the user:

```
Codebase scan complete

- Services/apps found: {N}
- Shared packages: {N}
- Primary framework: {name}
- ORMs: {list}
- Test frameworks: {list}
- Key gotchas: {N} identified

Dimensions covered:
  [x] Project structure
  [x] Tech stack per service
  [x] Architecture patterns
  [x] Conventions
  [x] Test setup
  [x] Gotchas
```

Ask if the user wants to add or correct anything before compilation.

WAIT for user confirmation.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 01: Scan Codebase
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-save.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
