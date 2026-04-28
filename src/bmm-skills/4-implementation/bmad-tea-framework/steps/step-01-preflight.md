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

Verify the project is ready for framework scaffolding and gather key context about the stack, dependencies, and existing test infrastructure.

## RULES

- `package.json` must exist at the project root — no package.json, no framework setup
- If an existing E2E framework config is detected, HALT — do not overwrite
- Gather enough context to inform framework selection in the next step
- Do not install anything yet — this step is read-only analysis

## SEQUENCE

### 1. Validate package.json

Read `package.json` from the project root.

**HALT if not found:** "No `package.json` found at project root. This workflow requires a Node.js project."

Extract:
- `name`, `type` (module/commonjs)
- `dependencies` and `devDependencies` — identify framework (React, Vue, Angular, Next.js, Nuxt, SvelteKit, Express, Fastify, NestJS, etc.)
- Bundler (Vite, Webpack, Rollup, esbuild, Turbopack) from deps or config files
- Existing test tooling (Jest, Vitest, Mocha, etc.)
- TypeScript presence (`typescript` in devDependencies, `tsconfig.json` exists)

### 2. Check for existing E2E framework

Search the project root for:
- `playwright.config.ts`, `playwright.config.js`, `playwright.config.mjs`
- `cypress.config.ts`, `cypress.config.js`, `cypress.config.mjs`
- `cypress.json` (legacy Cypress)
- `@playwright/test` or `cypress` in dependencies/devDependencies

**HALT if found:** "Existing E2E framework detected: {framework}. This workflow initializes a new framework — use the edit workflow to modify an existing setup."

### 3. Detect project characteristics

Determine:
- **Project type:** frontend (SPA), fullstack (SSR/SSG), backend-only (API), monorepo
- **Module system:** ESM (`"type": "module"`) or CJS
- **TypeScript:** yes/no (set `USE_TYPESCRIPT` accordingly)
- **Bundler:** identified or N/A (backend projects)
- **Auth system:** present? (look for auth-related dependencies: passport, next-auth, clerk, supabase-auth, etc.)
- **API layer:** present? (look for axios, fetch wrappers, tRPC, GraphQL clients)

### 4. Locate architecture documents (optional)

Search for documentation that can inform the scaffold:
- `architecture.md`, `ARCHITECTURE.md`
- `tech-spec*.md`
- `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`
- `docs/` directory with relevant specs

If found, note their locations for reference in later steps. Do not block if absent.

### 5. CHECKPOINT

Present to the user:

> **Preflight Summary**
>
> **Project:** {name from package.json}
> **Type:** {project type}
> **Module system:** {ESM/CJS}
> **TypeScript:** {yes/no}
> **Bundler:** {name or N/A}
> **Existing test tools:** {list or none}
> **Auth detected:** {yes/no}
> **API layer detected:** {yes/no}
> **Architecture docs:** {found/not found}
> **Blockers:** {none or description}

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

**Next:** Read FULLY and apply: `./step-02-select.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
