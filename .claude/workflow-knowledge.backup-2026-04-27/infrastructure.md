---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: 76ffedff
---

# Infrastructure — Knowledge

## Overview

BMAD-METHOD is a **distributed npm package**, not a deployed service. There is no cloud infrastructure, no servers, no databases. The "infrastructure" is:

1. GitHub repository (source of truth)
2. GitHub Actions (CI/CD)
3. npm registry (package distribution)
4. GitHub Pages (docs website)
5. Discord (community notifications)

## CI/CD — GitHub Actions

### Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| Quality & Validation | `quality.yaml` | push to main, all PRs, workflow_dispatch | Format, lint, markdownlint, docs build, validate refs + skills |
| Publish | `publish.yaml` | push to main (src/tools changes), workflow_dispatch | npm publish + GitHub Release + Discord notify |
| Deploy Documentation | `docs.yaml` | push to main (docs/website changes), workflow_dispatch | Build Astro site + deploy to GitHub Pages |
| Discord Notification | `discord.yaml` | PR opened/closed, issue opened | Community notifications |
| CodeRabbit Review | `coderabbit-review.yaml` | pull_request_target ready_for_review | Triggers AI code review via comment |

### Quality Pipeline (quality.yaml)

5 parallel jobs (no dependencies between them):

| Job | Command | Purpose |
|---|---|---|
| `prettier` | `npm run format:check` | Formatting validation |
| `eslint` | `npm run lint` | JS/YAML linting (max-warnings=0) |
| `markdownlint` | `npm run lint:md` | Markdown quality |
| `docs` | `npm run docs:build` | Docs build + internal link validation |
| `validate` | `test:install` + `validate:refs` + `validate:skills` | Global installer test, file ref integrity, skill validation |

All jobs: checkout → setup-node (from .nvmrc) → npm ci → run command.

### Publish Pipeline (publish.yaml)

**Guard:** `github.repository == 'bmad-code-org/BMAD-METHOD'` — must be changed to `florian-trehaut/bmad-global` for fork publishing.

**Two channels:**

| Channel | Trigger | Process |
|---|---|---|
| `next` (prerelease) | push to main OR workflow_dispatch channel=next | Derive next prerelease version → `npm publish --tag next --provenance` |
| `latest` (stable) | workflow_dispatch channel=latest, bump=patch/minor/major | `npm version $bump` → `npm publish --tag latest --provenance` → git push tags → GitHub Release → Discord webhook |

**Permissions:** `id-token: write` (npm OIDC trusted publishing), `contents: write` (push tags).

**Secrets:**
- `RELEASE_APP_ID` + `RELEASE_APP_PRIVATE_KEY` — GitHub App token for pushing version commits (latest channel only)
- `GITHUB_TOKEN` — checkout + gh release create
- `DISCORD_WEBHOOK` — post-publish notification
- npm uses OIDC trusted publishing (no NPM_TOKEN secret)

**Key:** Forces `npm@11.6.2` globally for trusted publishing (requires Node ≥ 22.14.0).

### Docs Pipeline (docs.yaml)

Two sequential jobs:
1. `build` — checkout (fetch-depth: 0 for lastUpdated timestamps) → `npm run docs:build` → upload artifact from `build/site`
2. `deploy` — deploy to GitHub Pages via `actions/deploy-pages@v4`

Concurrency: group `pages`, cancel-in-progress **false**.

### Discord Notifications (discord.yaml)

Posts to Discord webhook on PR events (opened/merged/closed) and new issues. Uses helper functions from `.github/scripts/discord-helpers.sh` (escaping, truncation, URL wrapping).

## Distribution

```bash
npx @florian-trehaut/bmad-global install   # Interactive install into project
npm install -g @florian-trehaut/bmad-global # Global install
```

- Package: `@florian-trehaut/bmad-global` (scoped, public)
- Entry: `tools/cli/bmad-cli.js`
- Binary: `bmad-global` → `tools/bmad-npx-wrapper.js`
- Engine: Node ≥ 20.0.0

## Environment Variables

No runtime env vars for the tool itself. CI uses:
- `RELEASE_APP_ID` / `RELEASE_APP_PRIVATE_KEY` — GitHub App for release commits
- `DISCORD_WEBHOOK` — Discord notification URL
- npm registry tokens via OIDC trusted publishing
- `SITE_URL` (optional repo variable for docs build)

## Database

No database, no migrations, no ORM. All data is file-based (Markdown, YAML, CSV, JSON).

## Cloud Resources

No cloud infrastructure. Distribution and hosting handled entirely by GitHub (Actions, Pages, Releases) and npm registry.
