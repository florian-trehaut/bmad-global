# {Project Name} — Project Knowledge

<!-- Template for bmad-knowledge-bootstrap. Consolidates tech stack, conventions, infrastructure, environment, validation, review perspectives, investigation checklist, tracker, and comm platform into a single project-level knowledge file. Loaded JIT by workflows. -->

<!-- Generated from {sources_used}. Manual edits supported but flagged on next refresh.
     To change tech-stack/conventions/infra: edit the source (PRD / architecture.md / ADRs / specs / code) and re-run /bmad-knowledge-refresh.
     To capture facts not present in any source: edit this file directly (will be flagged on next refresh as manual override). -->

## Project Nature

<!-- One paragraph: what is the project? Application, library, framework, CLI tool, etc. Derived from PRD §"Project Type", architecture.md §"System Context", or product-brief.md §"Product Concept". Brownfield fallback: derive from package manifest + README. -->

## Architecture

<!-- High-level architecture: monorepo/single-repo, directory structure diagram, key directories and their purpose. Derived from architecture.md §"Project Structure" or §"Directory Layout". Brownfield fallback: scan top-level directories. -->

## Tech Stack

<!-- Component | Technology table covering Language, Package manager, Tests, Linting, Formatting, Pre-commit, Docs. Derived from architecture.md §"Tech Stack" overlaid with code reality (package.json/Cargo.toml/etc versions). -->

| Component | Technology |
|---|---|
| Language | {detected} |
| Package manager | {detected} |
| Tests | {detected} |
| Linting | {detected} |
| Formatting | {detected} |
| Pre-commit | {detected} |

## Source File Patterns

<!-- Detected from file extension distribution in the codebase OR from architecture.md §"Source Patterns". Used by workflows (dev-story, code-review) to dynamically scope searches/greps to the correct file types instead of hardcoding extensions. -->

| Pattern | Description |
|---|---|
| Source files | {glob list, e.g., `*.rs`, `*.ts`, `*.py`} |
| Test files | {glob list, e.g., `*_test.rs`, `*.spec.ts`, `*.test.py`} |
| Config files | {glob list, e.g., `*.toml`, `*.json`, `*.yaml`} |

## Architecture Patterns

<!-- Detected from directory structure, import patterns, ADRs, architecture.md §"Patterns". Used by workflows to evaluate code against the project's actual architecture style. -->

<!-- Possible values: Hexagonal, Layered (MVC/MVP), CQRS, Feature-based, Modular, Monolithic, Microservices, etc. If multiple patterns coexist (e.g., Hexagonal for backend, Feature-based for frontend), list each with its scope. -->

| Scope | Pattern | Key Rules |
|---|---|---|
| {e.g., Backend} | {e.g., Hexagonal} | {e.g., Domain must not import infrastructure} |

## Conventions

### Commit Conventions

<!-- Detected from git log analysis (conventional commits? prefix patterns? scope rules?) AND/OR from ADRs / architecture.md §"Commit Format". -->

#### Format

<!-- e.g., type(scope): description -->

#### Allowed Types

<!-- e.g., feat, fix, refactor, docs, chore, test -->

### Branch Strategy

<!-- Detected from git branches AND/OR architecture.md §"Branching". -->

### PR Standards

<!-- From PR templates, merge patterns, ADRs. -->

### Code Style

<!-- Detected from .editorconfig, lint configs, formatter configs. Key rules only — not a dump of the entire config. ADRs may add forbidden patterns. -->

#### Naming Conventions

<!-- Files, functions, classes, variables: camelCase, snake_case, kebab-case? -->

#### File Organization

<!-- How files are organized: by feature? by layer? co-located tests? -->

#### Import Order

<!-- Import ordering conventions if enforced by linter or ADR. -->

### Documentation Standards

<!-- Inline comments policy, JSDoc/docstring conventions, README expectations. -->

## Test Rules

### Forbidden Patterns (STRICT)

<!-- Patterns forbidden in tests — derived from lint configs, existing test conventions, ADRs. -->

### Test Pyramid

<!-- Type | Framework | Suffix | Location. Derived from test configs, architecture.md §"Test Strategy", and existing test file patterns. -->

| Type | Framework | Suffix | Location |
|---|---|---|---|
| Unit | {detected} | {detected} | {detected} |
| Integration | {detected} | {detected} | {detected} |

### Running Tests

<!-- Commands to run tests — extracted from package.json scripts, Makefile, or equivalent. -->

## Infrastructure

### Overview

<!-- One paragraph: what is the deployment model? SaaS, CLI tool, library, self-hosted, serverless? Derived from architecture.md §"Infrastructure" / §"Deployment". -->

### CI/CD Workflows

<!-- Workflow | Trigger | Purpose. Detected from .github/workflows/, .gitlab-ci.yml, etc. AND/OR architecture.md §"CI/CD". -->

| Workflow | Trigger | Purpose |
|---|---|---|
| {filename} | {trigger events} | {what it does} |

### Quality Pipeline

<!-- Describe the quality/test pipeline: which jobs run, in what order, parallelism. -->

### Publish/Deploy Pipeline

<!-- How releases/deployments work: triggers, guards, channels, post-deploy actions. -->

### Distribution

<!-- How the software is distributed: npm, cargo, docker, app stores, direct download. Include install commands. -->

### Database

<!-- Database technology, migration approach, ORM. If none: state "No database." -->

### Cloud Resources

<!-- Cloud services used: hosting, storage, CDN, monitoring. If none: state "No cloud infrastructure." -->

## Environments

### Deployed Environments

<!-- Environment | URL | Purpose. Derived from deployment configs, .env files, architecture.md §"Environments". If none: state "No deployed environments — distributed as {package type}." -->

| Environment | URL | Purpose |
|---|---|---|
| {e.g., staging} | {URL} | {purpose} |

### Local Development

<!-- How to run locally: commands, prerequisites, ports, env vars needed. -->

### Secrets and Configuration

<!-- How secrets are managed: env vars, vault, config files. Map of required secrets per environment. Do NOT include actual secret values. -->

| Secret | Environment | Source |
|---|---|---|
| {e.g., DATABASE_URL} | {all/staging/prod} | {env var / vault / config} |

### Feature Flags

<!-- Feature flag system if any. How to toggle features per environment. -->

## Validation Tooling

### Validation Stack

<!-- Component | Technology | Command. Detected from package.json, Cargo.toml, config files. -->

| Component | Technology | Command |
|---|---|---|
| E2E framework | {detected: playwright, cypress, tauri-driver, none} | {e2e command} |
| Component tests | {detected: vitest, jest, wasm-pack test, none} | {component command} |
| Visual regression | {detected: playwright visual, percy, chromatic, none} | {visual command} |
| Accessibility | {detected: axe-core, pa11y, none} | {a11y command} |
| Performance | {detected: lighthouse, none} | {perf command} |
| BDD/Acceptance | {detected: cucumber-rs, cucumber-js, none} | {bdd command} |
| Property-based | {detected: proptest, quickcheck, fast-check, none} | {property command} |

### Stack-Specific Validation Notes

<!-- CRITICAL: Populate this section with stack-specific behavior that affects validation. Examples:
  - Leptos/Yew/Dioxus: WASM hydration delay — must wait for hydration before asserting.
  - Tauri: Standard Playwright does NOT work (no CDP in native webviews). Use tauri-driver.
  - Rust backend (Axum/Actix): axum-test crate for API validation, cargo test for integration.
  - Standard JS/TS: Playwright/Cypress work normally. -->

### Test Discovery Patterns

<!-- How to find tests matching a VM description. Detected from existing test files and conventions. -->

| Test type | File pattern | Name pattern | Command pattern |
|---|---|---|---|
| E2E | {pattern} | {convention} | {command} |
| Component | {pattern} | {convention} | {command} |
| Integration | {pattern} | {convention} | {command} |

### Validation Anti-Patterns (project-specific)

<!-- Patterns specific to this project's stack that look like valid proof but aren't. -->

## Review Perspectives

### Mandatory Perspectives

<!-- Review perspectives applicable to this project. Adapt to detected stack. -->

#### 1. Specs Compliance

<!-- Does the code do what was asked? AC coverage, scope analysis. Universal. -->

#### 2. Zero Fallback / Zero False Data

<!-- Silent defaults, wrong data substitution, lossy mapping. Universal. -->

#### 3. Security

<!-- Stack-specific security checklist: injection, auth, crypto, SSRF. -->

#### 4. QA & Testing

<!-- Stack-specific test quality checklist. Forbidden patterns, test completeness rules. -->

#### 5. Code Quality

<!-- Architecture boundaries, naming conventions, dead code, stack-specific anti-patterns. -->

#### 6. Tech Lead

<!-- SOLID, scalability, DI patterns, backward compatibility, migration risks. -->

#### 7. Pattern Consistency

<!-- Reference code directories, approved patterns, legacy code to avoid. -->

#### 8. Commit History

<!-- Commit format, squash policy, PR conventions. -->

### Severity Classification

<!-- BLOCKER, WARNING, RECOMMENDATION, QUESTION — define what qualifies for each in this project's context. -->

### Grep Scans

<!-- Stack-specific grep patterns for automated detection. -->

## Investigation Checklist

### How to Use

<!-- Domain-specific investigation checklists. Each section lists key areas to verify when reviewing or troubleshooting code. -->

### Domain: {Domain 1}

<!-- Detected from project architecture: major modules, bounded contexts, or service areas. -->

#### Key Files

<!-- Critical files/directories for this domain. -->

#### Verification Points

<!-- What to check when investigating issues in this domain. -->

#### Common Failure Modes

<!-- Known failure patterns specific to this domain. -->

### Cross-Cutting Concerns

#### Data Integrity

<!-- Foreign key consistency, required fields, enum validity. -->

#### Performance

<!-- N+1 queries, unbounded fetches, missing indexes. -->

#### Observability

<!-- Logging patterns, metrics, alerting integration points. -->

## Tracker Patterns

### Tracker Type

<!-- MCP-based, CLI-based, or file-based. Specific tool (e.g., Linear MCP, gh CLI, glab CLI, sprint-status.yaml). -->

### Tool Interface

<!-- How to call the tracker. Fill ONE of:
  - MCP-based: prefix for MCP tool calls (e.g., mcp__linear-server__, mcp__linear__)
  - CLI-based: CLI command and auth (e.g., gh issue list --repo org/repo)
  - File-based: file paths and format -->

### Concept Mapping

| BMAD Concept | Tracker Equivalent |
|---|---|
| Epic | {tracker's grouping entity} |
| Story | {tracker's work item entity} |
| Sprint | {tracker's time-boxed iteration entity} |
| Document | {tracker's document/page entity, if any} |

### State Machines

<!-- Valid states and transitions. Detected from workflow-context.md tracker_states. -->

### Story Key Format

<!-- How story identifiers are constructed. -->

### CRUD Operations

<!-- Concrete tool calls or file operations for each operation. -->

| Operation | Method |
|---|---|
| List issues | {concrete call} |
| Get single issue by ID | {concrete call} |
| Create issue | {concrete call} |
| Update issue | {concrete call} |
| List epics/projects | {concrete call} |
| Create epic/project | {concrete call} |
| List sprints/cycles | {concrete call} |
| Search issues by keyword | {concrete call} |
| Save/create document | {concrete call, or N/A} |

### Tracker HALT Policy

<!-- When tracker operations should cause HALT vs. graceful degradation. -->

## Communication Platform

### Platform Type

<!-- Slack, Teams, Discord, or none. Interface type (MCP, CLI, API). -->

### Comm Tool Interface

<!-- MCP-based: prefix for MCP tool calls (e.g., mcp__slack__) | CLI-based: command + auth | none: workflows skip comm steps. -->

### User Handle

<!-- The authenticated user's handle on the platform (e.g., @florian). -->

### Comm CRUD Operations

| Operation | Method |
|---|---|
| List channels | {concrete call} |
| Search messages from user | {concrete call} |
| Search messages mentioning user | {concrete call} |
| Search DMs from user | {concrete call} |
| Search DMs to user | {concrete call} |
| Read channel history | {concrete call} |
| Read thread replies | {concrete call} |

### Comm HALT Policy

<!-- Communication platform is always optional. If unavailable: log warning and skip — do NOT HALT. -->
