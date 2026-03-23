# Environment Configuration — Knowledge

## Overview

bmad-global is a CLI tool distributed as a package — it has no deployed environments (no staging, no production servers).

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
cargo build

# Run locally
cargo run -- install

# Run tests
cargo test
```

## No Infrastructure Discovery Needed

- No cloud project IDs
- No service URLs
- No database connections
- No proxy configuration
- No secrets beyond CI tokens
