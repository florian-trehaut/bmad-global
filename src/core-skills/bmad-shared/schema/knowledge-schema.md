---
schema_version: "1.2"
schema_status: stable

# ============================================================
# KNOWLEDGE SCHEMA — Single Source of Truth
# ============================================================
# This file is the canonical schema for the project knowledge
# files (project.md / domain.md / api.md). It is read by:
#   - bmad-knowledge-bootstrap (producer): generates files matching this schema
#   - bmad-knowledge-refresh (maintainer): preserves user customisations
#   - Shared protocols (consumers): resolve semantic IDs to file:anchor
#   - validate-knowledge-refs.js: enforces consumer/producer contract
#
# When this schema changes, schema_version MUST be bumped.
# Breaking changes (rename/remove a section) require a new MAJOR
# version and a documented migration path.
# ============================================================

files:
  project:
    path: "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md"
    required: true
    sections:
      - id: project-nature
        anchor: "project-nature"
        title: "Project Nature"
        description: "What kind of system this is (web app, CLI, framework, library, …)"
        required: false
      - id: architecture
        anchor: "architecture"
        title: "Architecture"
        description: "High-level architecture, components, data flows"
        required: false
      - id: tech-stack
        anchor: "tech-stack"
        title: "Tech Stack"
        description: "Languages, frameworks, libraries, runtime versions, package manager"
        required: true
      - id: source-file-patterns
        anchor: "source-file-patterns"
        title: "Source File Patterns"
        description: "Source extensions, test file naming, project layout"
        required: false
      - id: architecture-patterns
        anchor: "architecture-patterns"
        title: "Architecture Patterns"
        description: "Recurring patterns (DI, repository, hexagonal, …) used in the codebase"
        required: false
      - id: conventions
        anchor: "conventions"
        title: "Conventions"
        description: "Commit format, branch naming, code style, file naming, comment policy"
        required: true
      - id: test-rules
        anchor: "test-rules"
        title: "Test Rules"
        description: "Test pyramid, coverage rules, naming, layer boundaries"
        required: true
      - id: infrastructure
        anchor: "infrastructure"
        title: "Infrastructure"
        description: "Cloud, CI/CD, deployment topology, distribution"
        required: false
      - id: environments
        anchor: "environments"
        title: "Environments"
        description: "dev / staging / prod URLs, secrets, environment-specific config"
        required: false
      - id: validation-tooling
        anchor: "validation-tooling"
        title: "Validation Tooling"
        description: "Lint, format, type-check, test runner commands and discovery patterns"
        required: true
      - id: review-perspectives
        anchor: "review-perspectives"
        title: "Review Perspectives"
        description: "Code review checklist, severity rules, project-specific perspectives"
        required: false
      - id: investigation-checklist
        anchor: "investigation-checklist"
        title: "Investigation Checklist"
        description: "Domain-specific debug/investigation queries"
        required: false
      - id: tracker-patterns
        anchor: "tracker-patterns"
        title: "Tracker Patterns"
        description: "CRUD patterns for the issue tracker (file, MCP, or CLI based)"
        required: true
      - id: communication-platform
        anchor: "communication-platform"
        title: "Communication Platform"
        description: "Slack, Teams, Discord, etc. — handle and MCP prefix"
        required: false
      # ----- v1.1 additions (story-spec v2 (monolithic) or v3 (bifurcation) schema) -----
      - id: data-sources
        anchor: "data-sources"
        title: "Data Sources"
        description: "DB hosts, provider systems (SFTP/FTP/API), cloud platforms accessible to this project — read by step-04 access-verification"
        required: false
      - id: compliance-requirements
        anchor: "compliance-requirements"
        title: "Compliance Requirements"
        description: "Project-wide compliance constraints (GDPR, HIPAA, SOC2, PCI-DSS, ...) — read by step-09 security gate"
        required: false
      - id: observability-standards
        anchor: "observability-standards"
        title: "Observability Standards"
        description: "Default log fields, metric naming conventions, SLO baselines — read by step-09 observability requirements"
        required: false
      - id: nfr-defaults
        anchor: "nfr-defaults"
        title: "NFR Defaults"
        description: "Project-wide NFR baselines (perf p95, scalability targets, availability SLO, ...) — read by step-09 NFR registry"
        required: false
      - id: security-baseline
        anchor: "security-baseline"
        title: "Security Baseline"
        description: "Project-wide auth/authz patterns, secret management approach, audit policy — read by step-09 security gate"
        required: false

  domain:
    path: "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/domain.md"
    required: false
    body_only: true
    description: "Ubiquitous language, bounded contexts, entity relationships, domain rules, named agents, external systems"

  api:
    path: "{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/api.md"
    required: false
    body_only: true
    description: "API style, endpoints, request/response schemas, authentication, integrations"

# ============================================================
# EXTENSIBILITY — How users add custom knowledge
# ============================================================
extensibility:
  allow_custom_sections: true
  custom_section_convention: |
    Users may add additional H2 sections to project.md / domain.md / api.md.
    Bundled BMAD workflows IGNORE unknown sections (additive evolution — no breakage).
    Custom skills MAY consume custom sections by referencing them via this schema's
    extension hook (declare a new section with required: false in a project-local
    override at .claude/workflow-knowledge/.knowledge-schema.local.md).
  refresh_preservation: |
    bmad-knowledge-refresh preserves all custom sections verbatim. Only sections
    declared in this schema (or in .knowledge-schema.local.md) are subject to
    automatic regeneration.

# ============================================================
# PROTOCOL REGISTRY — Indirection layer for high-density refs
# ============================================================
# Workflows MUST reference protocols (not section anchors directly) for the
# patterns listed below. This decouples workflow files from project.md
# section identifiers — when a section is renamed, only its protocol updates.
protocols:
  tracker-crud:
    file: "~/.claude/skills/bmad-shared/protocols/tracker-crud.md"
    sections_consumed: [tracker-patterns]
    consumed_by: "Any workflow performing CRUD on the issue tracker"
  tech-stack-lookup:
    file: "~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md"
    sections_consumed: [tech-stack, source-file-patterns, architecture-patterns]
    consumed_by: "Workflows needing language/framework/runtime info"
  environments-lookup:
    file: "~/.claude/skills/bmad-shared/protocols/environments-lookup.md"
    sections_consumed: [environments, infrastructure]
    consumed_by: "Validation workflows discovering staging/production URLs"
  validation-tooling-lookup:
    file: "~/.claude/skills/bmad-shared/protocols/validation-tooling-lookup.md"
    sections_consumed: [validation-tooling, test-rules]
    consumed_by: "Test design, validation-*, dev-story validation steps"
  concurrency-review:
    file: "~/.claude/skills/bmad-shared/protocols/concurrency-review.md"
    sections_consumed: []
    stacks_consumed: ["bmad-shared/stacks/{language}.md#concurrency"]
    consumed_by: "review-story, dev-story, create-story, code-review meta-2 (sub-axis 2f)"
  null-safety-review:
    file: "~/.claude/skills/bmad-shared/protocols/null-safety-review.md"
    sections_consumed: []
    stacks_consumed: ["bmad-shared/stacks/{language}.md#null-safety"]
    consumed_by: "review-story, dev-story, create-story, code-review meta-2 (sub-axis 2e)"
    cross_reference: "bmad-shared/core/no-fallback-no-false-data.md (business angle, complementary)"
  spec-bifurcation:
    file: "~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md"
    sections_consumed: []
    consumed_by: "create-story step-13-output, quick-dev step-oneshot, dev-story step-03-setup-worktree, review-story step-05-analyze, validation-{metier,frontend,desktop} step-01-intake, knowledge-bootstrap step-01-preflight, knowledge-refresh step-01-detect-changes, project-init step-03-generate-context"
    cross_reference: "bmad-shared/spec/spec-completeness-rule.md (v3 schema definition), bmad-shared/protocols/tracker-crud.md (CRUD recipes)"

# ============================================================
# DIRECT-REFERENCE EXCEPTIONS
# ============================================================
# Anchors with very low frequency that don't justify a dedicated protocol.
# Direct references are allowed in workflows ONLY for these — flagged by the
# validator as informational, not errors.
direct_reference_allowed:
  - conventions               # frontmatter / commit / naming policy lookups
  - review-perspectives       # code-review skill specifics
  - investigation-checklist   # troubleshoot / review-story specifics
  - communication-platform    # daily-planning, comm-platform handles
  # ----- v1.1 additions (story-spec v2 (monolithic) or v3 (bifurcation) schema, low-consumption) -----
  - data-sources              # create-story / quick-dev step-04 access-verification
  - compliance-requirements   # create-story / code-review meta-3 / quick-dev
  - observability-standards   # create-story step-09 / code-review meta-2 / quick-dev
  - nfr-defaults              # create-story step-09 / quick-dev
  - security-baseline         # create-story step-09 / code-review meta-3 / quick-dev
---

# Knowledge Schema — v1.2

This document is the **single source of truth** for the project knowledge layout consumed by all bmad-\* workflow skills. It defines:

1. The files that must exist (project.md, optionally domain.md / api.md).
2. The sections inside project.md, each with a stable semantic `id`, an H2 `anchor`, a human-readable `title`, and a `required` flag.
3. The protocols that abstract high-density references — workflows MUST go through these instead of referencing anchors directly.
4. How users may extend the schema with custom sections without breaking bundled workflows.

The schema is versioned. Breaking changes (renaming or removing a section) require bumping `schema_version` to a new MAJOR version and providing a migration path.

---

## Why this exists

A previous migration consolidated 10 knowledge files into 3 (project.md, domain.md, api.md) but left **162 hard-coded H2 anchor references** scattered across step files — most heavily concentrated on `#tracker-patterns` (107 refs) and `#tech-stack` (33 refs). This produced tight coupling between every consumer workflow and the exact section identifiers in project.md.

This schema, paired with shared protocols, introduces a **decoupling layer** so that:

- Workflows reference **protocols** (semantic abstractions) — never `project.md#tracker-patterns` directly.
- Protocols reference the **schema** — they translate semantic IDs into file:anchor.
- Renaming a section requires updating the schema and the relevant protocol — **not 100+ workflow files**.

This pattern is documented in:

- [Data Contracts for Agents (Sopan Deole, Medium 2026)](https://medium.com/@deolesopan/data-contracts-for-agents-keep-tools-and-schemas-stable-as-systems-evolve-8af6f3e024ba)
- [6 agentic knowledge base patterns (The New Stack)](https://thenewstack.io/agentic-knowledge-base-patterns/) — pattern 5 "Source of Truth for Data Intelligence" matches this design
- [Claude Skill best practices — progressive disclosure](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Layer 4 — Validator (validate-knowledge-refs.js)                │
│  REF-01: no legacy filenames                                     │
│  REF-02: no soft loads on required files                         │
│  REF-03: no direct anchor refs in workflows (must use protocols) │
│  REF-04: schema_version present in produced project.md           │
└──────────────────────────────────────────────────────────────────┘
           │ enforces
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Layer 3 — Workflows (consumers)                                 │
│  src/bmm-skills/**/{workflow,steps/*}.md                         │
│  Reference protocols by path; never anchors directly.            │
└──────────────────────────────────────────────────────────────────┘
           │ load JIT
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Layer 2 — Protocols (capability layer, JIT-loaded)              │
│  ~/.claude/skills/bmad-shared/protocols/                         │
│    ├── tracker-crud.md           (consumes #tracker-patterns)    │
│    ├── tech-stack-lookup.md      (consumes #tech-stack, …)       │
│    ├── environments-lookup.md    (consumes #environments)        │
│    └── validation-tooling-lookup.md (consumes #validation-tooling)│
└──────────────────────────────────────────────────────────────────┘
           │ resolve via schema (this file)
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Layer 1 — Producer (bmad-knowledge-bootstrap)                   │
│  Generates project.md / domain.md / api.md per this schema.      │
│  Writes schema_version: "1.0" in produced project.md frontmatter.│
└──────────────────────────────────────────────────────────────────┘
           │ writes
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Layer 0 — Knowledge files (project-local, per-user)             │
│  {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/                 │
│    ├── project.md   (15 H2 sections per schema v1)               │
│    ├── domain.md    (full body)                                  │
│    └── api.md       (full body)                                  │
│  Users may add custom H2 sections (additive, ignored by bundled) │
└──────────────────────────────────────────────────────────────────┘
```

---

## Versioning rules

| Change | Effect on `schema_version` |
|--------|----------------------------|
| Add a new optional section | minor bump (1.0 → 1.1, 1.1 → 1.2, …) |
| Add a new file | minor bump |
| Add a new protocol | minor bump |
| Rename a section anchor / id | **MAJOR bump** (1.x → 2.0) — breaking |
| Remove a section | **MAJOR bump** — breaking |
| Make an optional section required | **MAJOR bump** — breaking |
| Tighten constraints (regex, type) on existing field | **MAJOR bump** — breaking |

### v1.0 → v1.1 changelog (story-spec v2 (monolithic) or v3 (bifurcation) schema)

Five new optional sections added to `project.md` to support the story-spec v2 (monolithic) or v3 (bifurcation) schema (real-data confrontation + NFR + security gate + observability + compliance):

- `data-sources` — accessible DB / providers / cloud platforms (consumed by step-04 access-verification in create-story / quick-dev)
- `compliance-requirements` — GDPR / HIPAA / SOC2 / PCI-DSS / project-specific (consumed by step-09 security gate)
- `observability-standards` — log fields, metric naming, SLO baselines (consumed by step-09 observability requirements)
- `nfr-defaults` — project-wide NFR baselines (consumed by step-09 NFR registry)
- `security-baseline` — project-wide auth/authz/secret patterns (consumed by step-09 security gate)

All five are **optional** — projects that do not declare them simply produce per-story values without baseline cross-reference. Bundled workflows that consume them read defensively (no HALT if section absent).

`bmad-knowledge-bootstrap` and `bmad-knowledge-refresh` will, on next run, ask the user whether to populate these sections (skippable per section).

### v1.1 → v1.2 changelog (story-spec v3 bifurcation)

Two additive changes to support story-spec v3 bifurcation mode (business sections in collaborative tracker, technical sections in local file):

1. **New protocol registered**: `spec-bifurcation` (additive in the `protocols:` map) — abstracts the section→location mapping, drift detection, sync, and worktree handoff for bifurcation mode. Workflows reference this protocol; they never inline bifurcation logic.
2. **New `workflow-context.md` field documented**: `spec_split_enabled: true | false` (optional, default `false`). Master switch for bifurcation. Set during `bmad-project-init` step-03-generate-context (initial), or via `bmad-knowledge-bootstrap` / `bmad-knowledge-refresh` (toggle later). Ignored when `tracker == file` (file-based tracker has no collaborative tracker available).

This is a **MINOR bump** because both changes are additive and backward-compatible:
- Projects without `spec_split_enabled` (or with `spec_split_enabled: false`) keep producing monolithic v2 specs unchanged.
- Existing v2 specs (with `mode` field absent or `mode: monolithic`) are read as monolithic regardless of project flag.
- No section was renamed or removed.

`bmad-knowledge-bootstrap` and `bmad-knowledge-refresh` prompt the user for `spec_split_enabled` if `tracker` is collaborative (Linear / GitHub / GitLab / Jira) and the field is absent in `workflow-context.md`. The prompt is skipped on file-based trackers.

Bumping MAJOR requires:
1. Updating `bmad-knowledge-bootstrap` to emit the new schema_version.
2. Updating `bmad-knowledge-refresh` with a migration step from N to N+1.
3. Updating affected protocols.
4. Documenting the migration in CHANGELOG and release notes.

A project's `project.md` declares its `schema_version` in YAML frontmatter. If a workflow detects a mismatch with the installed BMAD's schema, it HALTs and instructs the user to run `/bmad-knowledge-refresh` to migrate.

---

## Reading this schema programmatically

The YAML frontmatter above is the machine-readable contract. The validator parses it directly. Tools should read by:

```bash
# Find the schema (always at this path post-install)
SCHEMA="$HOME/.claude/skills/bmad-shared/schema/knowledge-schema.md"

# Extract the YAML frontmatter block
sed -n '/^---$/,/^---$/p' "$SCHEMA" | sed '1d;$d'
```

Or in Node:

```js
const fs = require('node:fs');
const yaml = require('js-yaml');
const text = fs.readFileSync(SCHEMA_PATH, 'utf8');
const match = text.match(/^---\n([\s\S]*?)\n---/);
const schema = yaml.load(match[1]);
```

---

## How to extend (user-side)

Users with project-specific knowledge that doesn't fit the canonical sections may:

1. **Add custom H2 sections to project.md** — they will be preserved by `bmad-knowledge-refresh`. Bundled workflows ignore them.
2. **Declare custom sections** in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/.knowledge-schema.local.md` (same YAML format as this file, but listing only additions). Custom skills consume these via the same protocol pattern.
3. **Author a custom protocol** in `{MAIN_PROJECT_ROOT}/.claude/skills/{plugin}/protocols/{my-protocol}.md` — the protocol references the local schema overrides.

The bundled BMAD workflows never read project-local schema overrides — they only consume v1 canonical sections.

---

## Stacks — language-specific rule files (added with the Runtime Robustness Stacks story)

Beyond the project-knowledge files (`project.md`, `domain.md`, `api.md`), BMAD now supports a global, **language-keyed** rule store at `~/.claude/skills/bmad-shared/stacks/{language}.md`. Each stack file contains H2 sections per concern:

- `## Concurrency` — read by `concurrency-review.md` protocol
- `## Null Safety` — read by `null-safety-review.md` protocol
- (future) other concerns may add new H2 sections without breaking existing protocols

Stacks are **global** (not per-project) — they describe how a language behaves, not how a project uses it. Adding a new language = adding `stacks/{language}.md` with the required H2 sections. No knowledge-schema bump is required (the directory lives in `bmad-shared/`, separate from project knowledge).

The validator rule `STACK-15` (`tools/validate-skills.js`) checks that each stack file has the required H2 sections.

See `~/.claude/skills/bmad-shared/stacks/README.md` for the stack file convention and the relationship with `bmad-code-review/data/stack-grep-bank/` (a separate, skill-local grep-pattern store).
