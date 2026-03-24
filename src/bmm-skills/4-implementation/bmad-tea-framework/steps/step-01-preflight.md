# Step 1: Preflight Checks

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
- `.claude/workflow-knowledge/stack.md`
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

**Next:** Read fully and follow `./step-02-select.md`
