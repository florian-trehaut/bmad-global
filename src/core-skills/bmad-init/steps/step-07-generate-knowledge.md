# Step 07 — Generate workflow-knowledge/ Files

**Goal:** Generate all 6 knowledge files in `.claude/workflow-knowledge/`, adapted to the detected project stack.

---

## General Principles

- Each file is a standalone knowledge document loaded JIT by workflows
- Use the format observed in existing workflow-knowledge files: markdown with tables, code blocks, checklists
- Content must be specific to THIS project, not generic boilerplate
- Include TODOs for information that could not be auto-detected
- Do NOT ask for line-by-line approval — generate, present a summary, and move on

---

## File 1: tracker.md

**Source:** Step-02 detection results.

### Structure

```markdown
# {Tracker Name} Tracker — Knowledge

## Concept Mapping
{Table mapping BMAD concepts to tracker concepts}

## API/Tool Reference
{MCP tools or CLI commands for CRUD operations}

## Document Title Conventions
{If Linear: title patterns for PRD, Architecture, etc.}
{If GitHub/GitLab: issue template conventions}

## Storage Adapter Pattern
{Read/Write/Issue resolution patterns}

## HALT Policy
{What to do when tracker tools are unavailable}
```

**Adapt based on tracker type:**
- **Linear**: Rich concept mapping (Project=Epic, Issue=Story, Sub-issue=Task, Cycle=Sprint, Document). Full MCP tool reference. Document title conventions. Storage adapter pattern with read/write/update. HALT policy for MCP unavailability.
- **GitHub**: Simpler mapping (Issue=Story, Milestone=Sprint, Label=State). `gh` CLI reference. No document concept — use wiki or repo files. HALT policy for CLI auth failure.
- **GitLab**: Similar to GitHub but with Epics, Boards. `glab` CLI reference. HALT policy for CLI auth failure.
- **Jira**: Project=Epic, Issue=Story, Sub-task=Task, Sprint=Sprint. REST API reference or CLI. HALT policy for auth failure.
- **File-based**: Minimal. YAML structure reference. No HALT policy needed.

Write to `.claude/workflow-knowledge/tracker.md`.

---

## File 2: stack.md

**Source:** Step-04 detection results.

### Structure

```markdown
# Tech Stack — Knowledge

## Architecture
{Detected architecture pattern + directory structure}

## Frameworks & ORMs
{Per-service table for monorepo, or single entry for monolith}

## Test Rules
### Forbidden Patterns (STRICT)
{Detected + user-specified forbidden patterns}

### Required Patterns
{Test patterns: fakes vs mocks, co-location, etc.}

### Test Pyramid
{Table: type, framework, suffix, location}

### Running Tests
{Commands for each test type}

## Code Conventions
{TypeScript/Python/Go conventions, formatting, imports}

## {Framework}-Specific Patterns
{Framework-specific rules: NestJS guards, React hooks, Django views, etc.}

## Packages
{Published packages and internal libs, if monorepo}
```

Write to `.claude/workflow-knowledge/stack.md`.

---

## File 3: infrastructure.md

**Source:** Step-05 detection results.

### Structure

```markdown
# Infrastructure — Knowledge

## {Cloud Provider} Layout
{Table: resource type, region, notes}

## Deployment Pipeline
{Flow diagram as text}
{CI tool + config file reference}
{Security scans if detected}

## Infrastructure as Code
{IaC tool + module structure}
{What requires IaC: services, buckets, secrets, etc.}

## Database Management
{Migration strategy: Prisma/Drizzle/other}
{Source of truth: migration files, not schema files}
{Prohibitions: no db:push, no manual DDL, etc.}

## Environment Variables
{Policy: crash on missing vs fallbacks}
{Secrets management approach}

## Docker (Local)
{Commands for local development}
```

Write to `.claude/workflow-knowledge/infrastructure.md`.

---

## File 4: environment-config.md

**Source:** Terraform/IaC config + cloud CLI discovery + user input.

### CRITICAL: NEVER fabricate URLs or infrastructure values

URLs, domains, ports, and project IDs MUST come from one of these sources (in priority order):
1. **IaC files** (Terraform, Pulumi, CloudFormation) — `infra/terraform/`, `variables.tf`, `*.tfvars`
2. **Cloud CLI discovery** — `gcloud run services list`, `aws ecs list-services`, etc.
3. **Existing project config** — `.env` files, `docker-compose.yml`, CI config
4. **User confirmation** — ask the user to provide or validate

If a value cannot be found from sources 1-3, use `TODO — discover via {command}` placeholders. NEVER guess or extrapolate URL patterns (e.g., never assume `service.domain.com` just because other services follow that pattern — the real architecture may be path-based routing, internal-only services, etc.).

### Detect infrastructure

1. Look for IaC directories: `infra/terraform/`, `terraform/`, `infrastructure/`, `pulumi/`, `cdk/`
2. Read load balancer / API gateway config to understand the **actual routing architecture** (path-based vs host-based vs direct)
3. Read variables files for domains, project IDs, regions
4. Run cloud CLI commands to discover deployed services and their URLs
5. Ask user only for values that cannot be detected

### Ask User (for values not found above)

"I need environment details to generate environment-config.md. For each environment (staging, production):
1. What is the GCP/AWS/cloud project name?
2. What is the domain pattern? (e.g., `*.staging.example.com`)
3. What are the service URLs? (or should I generate a discovery command?)
4. Database connection info? (proxy ports, instance names — no passwords)
5. How are credentials discovered? (Secret Manager, env files, etc.)"

If user doesn't know all values yet, generate a skeleton with `TODO` placeholders.

### Structure

```markdown
# Environment Configuration — Knowledge

## Environments

### Staging
{Project, domain, region}
{Service URLs table}
{Cloud Run/Lambda/etc. discovery command}

### Production
{Same structure}
{PRODUCTION SAFETY: Every write action requires explicit user authorization.}

## Database Proxy / Connection
{Instance table with ports}
{Connection pattern}
{Credential discovery commands}

## Health Check Pattern
{Standard health check command and expected response}
```

Write to `.claude/workflow-knowledge/environment-config.md`.

---

## File 5: investigation-checklist.md

**Source:** Stack detection + user input on domain areas.

### Ask User

"What are the main domain areas of your project? For each area, what external data sources exist?
Examples:
- Catalog domain → SFTP/FTP servers, REST APIs for product data
- Orders domain → Payment APIs, shipping APIs
- Email domain → Email service provider (Resend, SendGrid, etc.)
- Auth domain → Identity provider

List the areas relevant to your project, and I'll generate investigation checklists for each."

### Structure

```markdown
# Investigation Checklist — Knowledge

Domain-specific investigation guides for spec review (review-story workflow).
Each domain lists what to verify with REAL DATA, not code analysis.

---

## {Domain 1}

### Sources to check
{List external sources: APIs, files, databases}

### Investigation points
- [ ] {Check real data format matches story assumptions}
- [ ] {Check field mapping: source → domain → DB}
- [ ] {Check edge cases from real data}
- [ ] {Check volumetry}
- [ ] {Check existing code handles discovered cases}

---

## {Domain 2}
{Same pattern}

---

## Impact Analysis (ALWAYS RUN)

### Cross-service impact
- [ ] Which services consume the modified code?
- [ ] Which services produce data for the modified code?
- [ ] Shared packages: does the change affect other consumers?
- [ ] DB schema changes: FK cascades, index impacts, migration safety

### Client/tenant impact
- [ ] Is the change client-specific or applies to all?
- [ ] Multi-tenant data isolation preserved?
- [ ] Feature flags needed for gradual rollout?

### Non-regression
- [ ] Existing tests still pass with proposed changes?
- [ ] Edge cases from production data covered?
- [ ] Performance impact on existing flows?
```

Write to `.claude/workflow-knowledge/investigation-checklist.md`.

---

## File 6: review-perspectives.md

**Source:** Stack detection + framework-specific rules.

### Structure

```markdown
# Code Review Perspectives — Knowledge

## Perspectives (6 mandatory + conditional)

### 1. Specs Compliance (ALWAYS)
{AC mapping, scope creep detection, DoD}

### 2. Zero Fallback / Zero False Data (ALWAYS)
{Wrong data substitution, silent defaults, lossy mapping}
{Alerting vs logging distinction — adapt to project's alerting system}
{Switch default policy}
{Env var policy}

### 3. Security (ALWAYS)
{Framework-specific security: guards, CSRF, SQL injection, secrets}
{Auth patterns specific to the project}

### 4. QA and Testing (ALWAYS)
{Test rules from stack.md: forbidden mocks, required patterns}
{Test pyramid enforcement}

### 5. Code Quality (ALWAYS)
{Architecture compliance, DDD patterns, typing strictness}
{Framework-specific quality: N+1 queries, proper DI, etc.}

### 6. Tech Lead (ALWAYS)
{Architecture patterns, performance, migration safety}
{Package management: changesets, versioning}

### 7. Pattern Consistency (CONDITIONAL — on multi-file changes)
{Reference services, forbidden sources, naming conventions}

### 8. Infra Deployability (CONDITIONAL — on infra-touching changes)
{Dockerfile, CI pipeline, cloud config, IaC, secrets}

## Severity Classification
| Severity | Criteria | Action |
|----------|----------|--------|
| BLOCKER | Security vulnerability, data loss risk, broken AC, zero-fallback violation | Must fix before merge |
| WARNING | Performance issue, missing edge case test, minor pattern deviation | Should fix, discuss |
| RECOMMENDATION | Code style, naming, minor improvement | Nice to have |
| QUESTION | Unclear intent, needs clarification | Ask author |

## Security Voting (Colleague Review)
{Confirmation from 2 independent reviewers for security findings}

## Excluded from Review
{Generated files, config directories, etc.}
```

Write to `.claude/workflow-knowledge/review-perspectives.md`.

---

## Summary

After writing all 6 files, present a summary:

```
Created workflow-knowledge/ files:
  1. tracker.md          — {tracker_type} integration ({line_count} lines)
  2. stack.md            — {framework} stack, {architecture} arch ({line_count} lines)
  3. infrastructure.md   — {cloud_provider} infra, {ci_tool} CI ({line_count} lines)
  4. environment-config.md — {env_count} environments ({todo_count} TODOs)
  5. investigation-checklist.md — {domain_count} domains ({line_count} lines)
  6. review-perspectives.md — {perspective_count} perspectives ({line_count} lines)
```

---

## CHECKPOINT

Ask user: "All 6 knowledge files have been created. Any corrections needed before we verify?"

---

**Next:** Read and follow `./steps/step-08-verify.md`
