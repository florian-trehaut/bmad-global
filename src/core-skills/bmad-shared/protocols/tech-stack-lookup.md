# Tech Stack Lookup Protocol

**Loaded by:** Any bmad-\* workflow that needs to know the project's languages, frameworks, runtime versions, source/test file patterns, or architecture patterns.

**Indirection layer for** the schema sections `tech-stack`, `source-file-patterns`, `architecture-patterns` (per `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` v1).

---

## Purpose

Workflows that reason about the project's stack (validation, code-review, dev-story, troubleshoot, spike, test-design, etc.) need consistent access to language / framework / runtime details without each one hard-coding the project.md anchor. This protocol provides that abstraction.

---

## Resolution

The project's tech stack lives in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`, in the section described in `knowledge-schema.md` as:

- `tech-stack` — required; languages, frameworks, libraries, runtime versions, package manager
- `source-file-patterns` — optional; source extensions, test file naming, project layout
- `architecture-patterns` — optional; recurring patterns (DI, repository, hexagonal, …)

`project.md` is already loaded by INITIALIZATION. This protocol describes how to consume the relevant sections.

---

## Common lookups

### Language / framework detection

Read the tech-stack section to determine:

- Primary language(s) — used to pick stack-specific grep patterns, lint rules, test discovery.
- Frameworks — used to identify framework-specific anti-patterns, idioms, conventions.
- Runtime versions — used to validate version-specific syntax, deprecation warnings.
- Package manager — used to construct install / build / test commands.

Workflows downstream of this protocol may also consult `workflow-context.md` for the resolved commands (`install_command`, `build_command`, `test_command`, `lint_command`, `format_command`, `typecheck_command`, `quality_gate`).

### Source / test file discovery

Read the source-file-patterns section (when present) to obtain:

- Source file extensions / globs (e.g., `**/*.{ts,tsx}`, `app/**/*.py`).
- Test file naming conventions (e.g., `*.spec.ts`, `*.test.ts`, `*_test.py`, `*.unit.test.*`).
- Test type folders / suffixes per the project's test pyramid.

### Architecture pattern recognition

Read the architecture-patterns section (when present) to obtain:

- Architectural style (layered, hexagonal, microservices, monolith).
- Conventions for cross-cutting concerns (logging, error handling, DI).
- Forbidden patterns or legacy zones.

---

## HALT conditions

- The required `tech-stack` section is missing from `project.md` → HALT, run `/bmad-knowledge-refresh`.
- Workflow needs `source-file-patterns` for test discovery but the section is empty → HALT, ask user to populate or run `/bmad-knowledge-refresh` with code present.

---

## Why this protocol exists

- **Decoupling**: workflows don't reference `project.md#tech-stack` directly — they call this protocol.
- **Single source of change**: rename / restructure the tech-stack section → only this file updates.
- **Maintainability**: ~33 previous workflow refs to `#tech-stack` (plus refs to `source-file-patterns` and `architecture-patterns`) are now refs to one protocol file.
- **Composability**: protocols downstream (e.g., `validation-tooling-lookup`) compose this protocol when they need stack info too.

See `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` for the full architecture rationale.
