# Infrastructure — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Populate from CI/CD files, Dockerfiles, deployment configs. -->

## Overview

<!-- One paragraph: what is the deployment model? SaaS, CLI tool, library, self-hosted, serverless? -->

## CI/CD

### Workflows

<!-- Table: Workflow | Trigger | Purpose. Detected from .github/workflows/, .gitlab-ci.yml, etc. -->

| Workflow | Trigger | Purpose |
|---|---|---|
| {filename} | {trigger events} | {what it does} |

### Quality Pipeline

<!-- Describe the quality/test pipeline: which jobs run, in what order, parallelism. -->

### Publish/Deploy Pipeline

<!-- How releases/deployments work: triggers, guards, channels, post-deploy actions. -->

## Distribution

<!-- How the software is distributed: npm, cargo, docker, app stores, direct download. Include install commands. -->

## Environment Variables

<!-- Runtime and CI env vars. Table: Variable | Context (runtime/CI) | Purpose. Detected from .env files, CI configs, code references. -->

## Database

<!-- Database technology, migration approach, ORM. If none: state "No database." -->

## Cloud Resources

<!-- Cloud services used: hosting, storage, CDN, monitoring. If none: state "No cloud infrastructure." -->
