# Detection Patterns

Reference file listing all auto-detection patterns used by the bmad-knowledge-bootstrap workflow.
Loaded by step files that need detection logic.

---

## Package Managers

| Lock File | Manager | Install Command | Run Command | Workspace Flag |
|-----------|---------|-----------------|-------------|----------------|
| `pnpm-lock.yaml` | pnpm | `pnpm install` | `pnpm` | `pnpm -w` |
| `yarn.lock` | yarn | `yarn install` | `yarn` | `yarn workspace` |
| `package-lock.json` | npm | `npm install` | `npm run` | `npm -w` |
| `bun.lockb` | bun | `bun install` | `bun run` | `bun --filter` |

### Monorepo Workspace Config

| File | Tool |
|------|------|
| `pnpm-workspace.yaml` | pnpm workspaces |
| `turbo.json` | Turborepo |
| `nx.json` | Nx |
| `lerna.json` | Lerna |
| `rush.json` | Rush |

### Workspace Directories

| Directory | Typical Content |
|-----------|-----------------|
| `apps/` | Application services |
| `packages/` | Published shared packages |
| `libs/` | Internal shared libraries |
| `services/` | Microservices (alternative to apps/) |
| `modules/` | Feature modules |
| `tools/` | Build tools, scripts |

---

## Frameworks

| Signal | Framework | Type | Language |
|--------|-----------|------|----------|
| `nest-cli.json` OR `@nestjs/core` in deps | NestJS | backend | TypeScript |
| `next.config.*` | Next.js | fullstack | TypeScript/JavaScript |
| `angular.json` | Angular | frontend | TypeScript |
| `vite.config.*` (without framework plugin) | Vite | build tool | TypeScript/JavaScript |
| `nuxt.config.*` | Nuxt | fullstack | TypeScript/JavaScript |
| `remix.config.*` OR `@remix-run/node` in deps | Remix | fullstack | TypeScript |
| `astro.config.*` | Astro | frontend | TypeScript |
| `svelte.config.*` | SvelteKit | fullstack | TypeScript/JavaScript |
| `express` in deps (no NestJS) | Express | backend | TypeScript/JavaScript |
| `fastify` in deps | Fastify | backend | TypeScript/JavaScript |
| `hono` in deps | Hono | backend | TypeScript/JavaScript |
| `django` in requirements | Django | fullstack | Python |
| `flask` in requirements | Flask | backend | Python |
| `fastapi` in requirements | FastAPI | backend | Python |
| `go.mod` | Go stdlib/framework | backend | Go |
| `Cargo.toml` | Rust | backend/system | Rust |
| `Gemfile` with `rails` | Ruby on Rails | fullstack | Ruby |
| `mix.exs` with `phoenix` | Phoenix | fullstack | Elixir |

---

## ORMs / Database Libraries

| Signal | ORM | Language |
|--------|-----|----------|
| `prisma/` dir OR `@prisma/client` in deps | Prisma | TypeScript |
| `drizzle.config.*` OR `drizzle-orm` in deps | Drizzle | TypeScript |
| `typeorm` in deps | TypeORM | TypeScript |
| `sequelize` in deps | Sequelize | TypeScript/JavaScript |
| `mikro-orm` in deps | MikroORM | TypeScript |
| `knex` in deps | Knex | TypeScript/JavaScript |
| `sqlalchemy` in requirements | SQLAlchemy | Python |
| `django.db` imports | Django ORM | Python |
| `tortoise-orm` in requirements | Tortoise ORM | Python |
| `gorm.io/gorm` in go.mod | GORM | Go |
| `diesel` in Cargo.toml | Diesel | Rust |
| `activerecord` in Gemfile | ActiveRecord | Ruby |
| `ecto` in mix.exs | Ecto | Elixir |

---

## Cloud Providers

| Signal | Provider | Notes |
|--------|----------|-------|
| `gcloud` CLI available OR `.gcloudignore` | GCP | Check `gcloud config get-value project` for project name |
| `app.yaml` | GCP App Engine | |
| `cloudrun-template.*` files | GCP Cloud Run | |
| `aws` CLI available OR `.aws/` dir | AWS | Check `aws sts get-caller-identity` |
| `serverless.yml` with `provider: aws` | AWS (Serverless) | |
| `sam-template.yaml` | AWS SAM | |
| `cdk.json` with AWS refs | AWS CDK | |
| `az` CLI available | Azure | |
| `azure-pipelines.yml` | Azure DevOps | |
| `vercel.json` OR `.vercel/` dir | Vercel | |
| `fly.toml` | Fly.io | |
| `railway.json` OR `railway.toml` | Railway | |
| `render.yaml` | Render | |
| `Procfile` (no other signals) | Heroku | |
| `netlify.toml` | Netlify | |

---

## CI/CD Systems

| Signal | System | Config Location |
|--------|--------|-----------------|
| `.gitlab-ci.yml` | GitLab CI | Root or includes in subdirs |
| `.github/workflows/*.yml` | GitHub Actions | `.github/workflows/` |
| `Jenkinsfile` | Jenkins | Root |
| `bitbucket-pipelines.yml` | Bitbucket Pipelines | Root |
| `.circleci/config.yml` | CircleCI | `.circleci/` |
| `.travis.yml` | Travis CI | Root |
| `buildkite.yml` OR `.buildkite/` | Buildkite | Root or `.buildkite/` |
| `azure-pipelines.yml` | Azure Pipelines | Root |
| `.drone.yml` | Drone CI | Root |
| `tekton/` dir | Tekton | `tekton/` |

---

## Infrastructure as Code

| Signal | Tool | Notes |
|--------|------|-------|
| `*.tf` files OR `terraform/` dir | Terraform | Check for `backend` config for remote state |
| `Pulumi.yaml` OR `pulumi/` dir | Pulumi | |
| `cdk.json` | AWS CDK | TypeScript/Python/Java |
| `*.cloudformation.yml` OR `template.yaml` | CloudFormation | |
| `ansible/` dir OR `*.playbook.yml` | Ansible | Configuration management |
| `helm/` dir OR `Chart.yaml` | Helm | Kubernetes package manager |
| `kustomize/` OR `kustomization.yaml` | Kustomize | Kubernetes overlays |

---

## Architecture Patterns

| Directory Pattern | Architecture | Description |
|-------------------|-------------|-------------|
| `domain/` + `infrastructure/` + `api/` | Hexagonal (Ports/Adapters) | Clean separation of business logic |
| `domain/` + `application/` + `infrastructure/` | Clean Architecture | Onion-style layers |
| `controllers/` + `services/` + `models/` | MVC | Model-View-Controller |
| `features/` (each with own controller+service+model) | Feature-based | Vertical slices |
| `modules/` (each self-contained) | Modular | NestJS-style module organization |
| `handlers/` + `commands/` + `queries/` | CQRS | Command-Query Responsibility Segregation |
| `pages/` + `components/` + `lib/` | Next.js/SPA | Frontend convention |
| `routes/` + `middleware/` + `models/` | Express-style | Backend MVC variant |

---

## Test Frameworks

| Signal | Framework | Language |
|--------|-----------|----------|
| `vitest.config.*` OR `vitest` in deps | Vitest | TypeScript/JavaScript |
| `jest.config.*` OR `jest` in deps | Jest | TypeScript/JavaScript |
| `mocha` in deps | Mocha | TypeScript/JavaScript |
| `pytest.ini` OR `conftest.py` OR `pytest` in deps | pytest | Python |
| `_test.go` file suffix | Go testing | Go |
| `#[cfg(test)]` in source | Rust testing | Rust |
| `*_spec.rb` files | RSpec | Ruby |
| `*_test.exs` files | ExUnit | Elixir |

### Test File Conventions

| Suffix | Typical Type |
|--------|-------------|
| `*.spec.ts` / `*.test.ts` | Unit test |
| `*.integration.spec.ts` | Integration test |
| `*.e2e.spec.ts` / `*.e2e-spec.ts` | End-to-end test |
| `*.external.spec.ts` | External API test |
| `*.journey.yaml` / `*.yaml` (in journeys/) | Journey/scenario test |

---

## Formatting & Linting

| Signal | Tool |
|--------|------|
| `.prettierrc` / `.prettierrc.*` / `prettier.config.*` | Prettier |
| `.eslintrc` / `.eslintrc.*` / `eslint.config.*` | ESLint |
| `biome.json` | Biome |
| `.editorconfig` | EditorConfig |
| `ruff.toml` / `[tool.ruff]` in pyproject.toml | Ruff (Python) |
| `black` in requirements | Black (Python) |
| `.golangci.yml` | golangci-lint (Go) |
| `rustfmt.toml` / `.rustfmt.toml` | rustfmt (Rust) |
| `clippy.toml` | Clippy (Rust) |

---

## Source Control Forges

| Remote URL Pattern | Forge | CLI Tool |
|--------------------|-------|----------|
| `gitlab.com` or custom GitLab | GitLab | `glab` |
| `github.com` | GitHub | `gh` |
| `bitbucket.org` | Bitbucket | — |
| `dev.azure.com` or `visualstudio.com` | Azure DevOps | `az repos` |
| `sr.ht` | SourceHut | — |
