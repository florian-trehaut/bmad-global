# Source Hash Mapping (3-file consolidated layout, multi-source)

Reference table mapping each knowledge file to the **multiple sources** used to compute its staleness hash, the dependency graph between knowledge files, and heuristics for mapping conversation context to affected files.

The 3-file consolidated layout (`project.md` / `domain.md` / `api.md`) replaced the legacy 10-file layout. Each knowledge file is derived from up to 5 source types (per the SDD priority pyramid): PRD, architecture, ADRs, phase 4 specs, code.

---

## Hash Computation

Each knowledge file's frontmatter stores a `source_hash` map (one hash per source type used) plus a `content_hash` for the body content (used to detect manual edits).

```yaml
source_hash:
  prd: abc12345        # only present if PRD was a source
  architecture: def67890
  adrs: ghi11111
  specs: jkl22222
  code: mno33333
content_hash: pqr44444
sources_used: [planning, specs, code]
```

For each source type, concatenate its source files and compute a truncated MD5:

```bash
hash_planning_prd()    { cat {planning_artifacts}/prd.md 2>/dev/null | md5 | cut -c1-8; }
hash_planning_arch()   { cat {planning_artifacts}/architecture.md 2>/dev/null | md5 | cut -c1-8; }
hash_planning_brief()  { cat {planning_artifacts}/product-brief.md 2>/dev/null | md5 | cut -c1-8; }
hash_adrs()            { cat {adr_location}/*.md 2>/dev/null | md5 | cut -c1-8; }
hash_specs()           { cat _bmad-output/implementation-artifacts/spec-*.md 2>/dev/null | md5 | cut -c1-8; }
hash_code_for(target)  { cat {code_sources_for_target} 2>/dev/null | md5 | cut -c1-8; }

# Body hash — used to detect manual edits
hash_content(file)     { sed '/^---$/,/^---$/d' "$file" 2>/dev/null | md5 | cut -c1-8; }
```

**Drift Axe 1** (code vs spec): independent check — see "Drift Detection" section below.
**Drift Axe 2** (manual edit vs source): `content_hash` mismatch + source change → block.

---

## Source File Mapping (per knowledge file × per source type)

### project.md

| Source type | Source files / inputs |
|---|---|
| `prd` | `{planning_artifacts}/prd.md` (sections: Project Type, Non-functional Requirements) |
| `architecture` | `{planning_artifacts}/architecture.md` (sections: Tech Stack, Patterns, Project Structure, Infrastructure, Environments, Test Strategy, Conventions, Observability) |
| `adrs` | `{adr_location}/*.md` (Accepted/Approved status only, chronological — most recent wins) |
| `specs` | `_bmad-output/implementation-artifacts/spec-*.md` (sections: Technical Decisions, Forbidden Patterns) |
| `code` | `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `tsconfig.json`, lint configs (`.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `prettier.config.*`, `biome.json`, `ruff.toml`, `clippy.toml`), test configs (`vitest.config.*`, `jest.config.*`, `pytest.ini`), CI files (`.github/workflows/*.yml`, `.gitlab-ci.yml`), `Dockerfile`, deploy configs (`terraform/*.tf`, `serverless.yml`, `fly.toml`, `render.yaml`), `.env.example`, `.editorconfig`, `.github/pull_request_template.md`, `playwright.config.*`, `cypress.config.*`, `src/` directory structure, `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (tracker + comm sections) |

### domain.md

| Source type | Source files / inputs |
|---|---|
| `prd` | `{planning_artifacts}/prd.md` (sections: Domain, Functional Requirements, Vision) |
| `architecture` | `{planning_artifacts}/architecture.md` (sections: Domain Model, Bounded Contexts) |
| `adrs` | `{adr_location}/*.md` (domain-related decisions only) |
| `specs` | `_bmad-output/implementation-artifacts/spec-*.md` (sections: Domain Entities, Glossary additions) |
| `code` | entity/model files (`*.entity.ts`, `*.model.ts`, `models.py`), schema files (`prisma/schema.prisma`), domain exceptions, bounded-context directories |

### api.md

| Source type | Source files / inputs |
|---|---|
| `prd` | (rarely contributes — leave empty unless PRD has explicit API design section) |
| `architecture` | `{planning_artifacts}/architecture.md` (section: API Design, Endpoints, Auth) |
| `adrs` | `{adr_location}/*.md` (API-related decisions only) |
| `specs` | `_bmad-output/implementation-artifacts/spec-*.md` (sections: API Contract, Endpoint additions) |
| `code` | route/controller files, OpenAPI specs (`openapi.yaml`, `swagger.json`), GraphQL schemas (`*.graphql`) |

**Notes:**
- `code` source is excluded entirely if `CODE_PRESENT=false` (greenfield post-planning).
- `adrs` source filters by topic relevance per target (project-wide ADRs → project.md; domain ADRs → domain.md; API ADRs → api.md).
- A single ADR may contribute to multiple targets if it spans concerns.

---

## Dependency Graph (3-file layout)

```
Tier 0 (independent — refresh first):
  project.md
  domain.md

Tier 1 (depends on Tier 0):
  api.md  ← domain.md  (API endpoints reference domain entities)
```

**Cascade rule:** If `domain.md` is marked REFRESH_NEEDED, `api.md` is automatically marked REFRESH_CASCADE (medium priority). `project.md` has no dependents (it's leaf).

---

## Drift Detection (2 axes)

### Axe 1 — Code vs Specs

Independent of source_hash. Compare what specs declare vs what code shows:

```bash
detect_drift_axis_1() {
  for spec in _bmad-output/implementation-artifacts/spec-*.md; do
    # Extract declared tech (e.g., "ORM: Prisma") from spec
    # Compare to observable code (e.g., grep "drizzle-orm" package.json)
    # If mismatch → mark DRIFT_AXIS1, capture (spec_path, declared_value, observed_value)
  done
}
```

Trigger: refresh detects spec declares X, code has Y.
Action: BLOCK in step-03-review-and-apply with `[U] Update spec / [F] Fix code / [I] Ignore / [Q] Quit`.

### Axe 2 — Manual Edit vs Source Change

Comparison: stored `content_hash` (in frontmatter) vs current `content_hash` (computed now).

```bash
detect_drift_axis_2() {
  for kf in project.md domain.md api.md; do
    stored=$(yaml_extract content_hash "$kf")
    current=$(hash_content "$kf")
    if [ "$stored" != "$current" ]; then
      # Manual edit detected
      # Check if any source has also changed
      if any_source_changed_for "$kf"; then
        mark DRIFT_AXIS2 "$kf"
      fi
      # If only manual edit + no source change → silently skip in refresh (don't overwrite)
    fi
  done
}
```

Trigger: user edited the knowledge file directly AND a source has also changed.
Action: BLOCK in step-03-review-and-apply with `[M] Merge / [O] Overwrite / [K] Keep manual / [Q] Quit`.

`manual_override: true` flag in frontmatter (set when user chooses [K]) excludes the file from refresh permanently until reset.

---

## Context-to-File Mapping

When analyzing conversation history for changes during the development session, use these heuristics:

| Conversation Signal | Likely Affected Files |
|---|---|
| New dependency added (npm install, cargo add, pip install) | project.md |
| Package manifest modified (package.json, Cargo.toml, pyproject.toml) | project.md |
| New CI workflow or pipeline change | project.md (§Infrastructure) |
| Docker / deployment config change | project.md (§Infrastructure, §Environments) |
| New API endpoint or route added | api.md |
| New entity, model, or schema created | domain.md, api.md (cascade) |
| Linter or formatter config changed | project.md (§Conventions, §Review Perspectives, §Tech Stack) |
| New test framework or test config change | project.md (§Test Rules, §Validation Tooling) |
| Directory structure reorganized | project.md (§Investigation Checklist, §Architecture) |
| .env file modified or new env vars added | project.md (§Environments) |
| Tracker configuration changed | project.md (§Tracker Patterns) AND workflow-context.md |
| Git workflow or branch strategy changed | project.md (§Conventions) |
| PR template modified | project.md (§Conventions) |
| Communication platform config changed | project.md (§Communication Platform) AND workflow-context.md |
| **Architecture document updated** (planning artifact) | project.md, api.md (cascade if API section changed) |
| **PRD updated** (planning artifact) | domain.md, project.md (§Project Nature) |
| **New ADR created or accepted** | project.md, domain.md, or api.md depending on topic |
| **Phase 4 spec written or modified** | project.md, api.md, domain.md depending on spec scope |
| **Phase 4 spec contradicts code (Drift Axe 1)** | BLOCK refresh, prompt user resolution |

**Mapping rules:**
- A single conversation change may affect multiple files — always check all columns
- Context signals are **candidates**, not certainties — always confirm with hash comparison (per source type)
- If the conversation context is ambiguous, prefer over-inclusion (check the hash to confirm)
