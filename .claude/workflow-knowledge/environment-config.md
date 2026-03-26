---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: b441da74
---

# Environment Configuration — Knowledge

## Overview

BMAD-METHOD is a CLI tool distributed as an npm package — it has no deployed environments (no staging, no production servers).

## "Environments" in Context

The only relevant concept is **distribution channels**:

| Channel | Purpose | Trigger |
|---|---|---|
| `next` | Pre-release for testing | Auto on push to main |
| `latest` | Stable release | Manual dispatch |

## Local Development

```bash
# Clone and setup
git clone git@github.com:florian-trehaut/bmad-global.git
cd bmad-global
npm install

# Run locally
node tools/cli/bmad-cli.js install

# Run tests
npm test

# Full quality gate
npm run quality
```

## Secrets and Configuration

| Secret | Environment | Source |
|---|---|---|
| `RELEASE_APP_ID` | CI (publish) | GitHub Actions secret |
| `RELEASE_APP_PRIVATE_KEY` | CI (publish) | GitHub Actions secret |
| `DISCORD_WEBHOOK` | CI (publish + notifications) | GitHub Actions secret |
| `SITE_URL` | CI (docs build) | GitHub repo variable (optional) |

npm publishing uses OIDC trusted publishing — no NPM_TOKEN needed.

## No Infrastructure Discovery Needed

- No cloud project IDs
- No service URLs
- No database connections
- No proxy configuration
- No runtime secrets beyond CI tokens

## Feature Flags

No feature flag system.
