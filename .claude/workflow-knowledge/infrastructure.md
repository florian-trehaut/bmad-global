# Infrastructure — Knowledge

## Overview

bmad-global is a **distributed package**, not a deployed service. There is no cloud infrastructure, no servers, no databases. The "infrastructure" is:

1. GitHub repository (source of truth)
2. GitHub Actions (CI/CD)
3. Package registry (npm currently → crates.io target)
4. Docs website (Astro → GitHub Pages or similar)

## CI/CD — GitHub Actions

### Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `quality.yaml` | PR + push to main | Format check, lint, markdownlint, docs build, validate refs, validate skills |
| `publish.yaml` | Push to main (src/tools changes) + manual dispatch | Publish to registry + GitHub Release + Discord notify |
| `docs.yaml` | Docs changes | Build and deploy documentation site |
| `discord.yaml` | Various events | Discord community notifications |
| `coderabbit-review.yaml` | PRs | AI-powered code review |

### Quality Pipeline (quality.yaml)

5 parallel jobs:
1. **prettier** — Format check
2. **eslint** — Linting
3. **markdownlint** — Markdown quality
4. **docs** — Build documentation site
5. **validate** — Test install components + validate file refs + validate skills

Target (Rust migration):
1. **rustfmt** — Format check
2. **clippy** — Linting
3. **markdownlint** — Markdown quality (keep as-is)
4. **docs** — Build documentation site
5. **cargo test** — All tests including validators

### Publish Pipeline (publish.yaml)

- **Guard**: `github.repository == 'bmad-code-org/BMAD-METHOD'` — MUST be changed to `florian-trehaut/bmad-global`
- **Channels**: `latest` (stable, manual dispatch) / `next` (prerelease, auto on push)
- **npm trusted publishing** with provenance — to be replaced with cargo publish
- **Post-publish**: GitHub Release creation + Discord webhook

## Distribution

### Current (npm)

```bash
npx bmad-method install     # Interactive install into project
npm install -g bmad-method  # Global install
```

### Target (Cargo)

```bash
cargo install bmad-global   # Global install
bmad-global install         # Interactive install into project
```

## Environment Variables

No runtime env vars for the tool itself. CI uses:
- `RELEASE_APP_ID` / `RELEASE_APP_PRIVATE_KEY` — GitHub App for release commits
- `DISCORD_WEBHOOK` — Discord notification URL
- npm/cargo registry tokens via OIDC trusted publishing

## No Database

No database, no migrations, no ORM. All data is file-based (Markdown, YAML, CSV, JSON).
