# Environments Lookup Protocol

**Loaded by:** Validation workflows (`bmad-validation-frontend`, `bmad-validation-desktop`, `bmad-validation-metier`) and any workflow needing staging/production URLs, deployment topology, or environment-specific configuration.

**Indirection layer for** the schema sections `environments` and `infrastructure` (per `~/.claude/skills/bmad-shared/knowledge-schema.md` v1).

---

## Purpose

Workflows that interact with deployed environments (staging, production, QA) need consistent access to URLs, secrets references, DB proxy requirements, and platform-specific service names — without each one hard-coding `project.md` anchors.

---

## Resolution

The project's environment topology lives in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`:

- `environments` — optional; dev / staging / prod URLs, secrets, environment-specific config
- `infrastructure` — optional; cloud, CI/CD, deployment topology, distribution

`project.md` is already loaded by INITIALIZATION. Some additional configuration may also be in `workflow-context.md` (resolved environment, CI variables, etc.).

---

## Common lookups

### URL discovery (staging / production)

Read the environments section to find:

- Staging URL (used by frontend validation, API smoke checks, contract tests).
- Production URL (used by post-deploy verification, production smoke checks — write actions require explicit user authorisation).
- Backoffice / admin URLs (used by operator workflows).

If the project has multiple staging environments (per-PR previews, integration), they are listed in this section with their resolution rule (e.g., "preview-{branch}.example.com").

### DB proxy / connection requirements

Read the environments section for:

- DB proxy startup requirements (some projects must restart proxies at session start).
- Connection methods (local skill, sidecar, MCP).
- Environment-specific credentials reference (env var names, secret manager paths — never the secrets themselves).

The DB connection itself is performed through a project-local skill (e.g., `db-connect`, `querying-db`) declared in `{MAIN_PROJECT_ROOT}/.claude/skills/`.

### Cloud / platform service names

Read the infrastructure section for:

- Cloud platform (GCP, AWS, Azure, on-prem).
- Service names (which may differ from application service names — cross-reference required).
- CI/CD pipeline (GitHub Actions, GitLab CI, CircleCI) and key variables.

---

## HALT conditions

- Workflow needs staging/prod URL but the `environments` section is missing or empty → HALT, instruct user to populate it (run `/bmad-knowledge-refresh`).
- Target environment is unreachable → HALT, do not silently fall back to a different environment.
- Environment URL responds with non-2xx status → HALT, report the status code.

---

## Production safety

When `ENVIRONMENT == production`:

- Read-only operations require no user authorisation.
- Write operations (POST, PUT, DELETE, mutations, configuration changes) require **explicit user authorisation** before each call. Never batch-authorise.
- Always log the operation in the workflow output for auditability.

This is a hard rule independent of project configuration.

---

## Why this protocol exists

- **Decoupling**: workflows don't reference `project.md#environments` or `#infrastructure` directly.
- **Single source of change**: rename or restructure → only this file updates.
- **Maintainability**: 8 previous workflow refs (validation-frontend, validation-desktop, validation-metier, etc.) consolidated.
- **Production safety**: a single place to enforce the "explicit authorisation" rule on production writes.

See `~/.claude/skills/bmad-shared/knowledge-schema.md` for the full architecture rationale.
