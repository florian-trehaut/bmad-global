# Environment Config — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Deployed environments and configuration. -->

## Environments

<!-- Table: Environment | URL | Purpose | Access. Detected from deployment configs, .env files, CI variables. If no deployed environments: state "No deployed environments — distributed as {package type}." -->

| Environment | URL | Purpose |
|---|---|---|
| {e.g., staging} | {URL} | {purpose} |

## Local Development

<!-- How to run locally: commands, prerequisites, ports, env vars needed. Detected from README, docker-compose, Makefile. -->

## Secrets and Configuration

<!-- How secrets are managed: env vars, vault, config files. Map of required secrets per environment. Do NOT include actual secret values. -->

| Secret | Environment | Source |
|---|---|---|
| {e.g., DATABASE_URL} | {all/staging/prod} | {env var / vault / config} |

## Feature Flags

<!-- Feature flag system if any. How to toggle features per environment. -->
