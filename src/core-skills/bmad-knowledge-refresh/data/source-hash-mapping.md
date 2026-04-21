# Source Hash Mapping

Reference table mapping each knowledge file to the source files used to compute its staleness hash, the dependency graph between knowledge files, and heuristics for mapping conversation context to affected files.

---

## Hash Computation

For each knowledge file, concatenate the content of all listed source files and compute a truncated MD5:

```bash
cat {source_files} 2>/dev/null | md5 | cut -c1-8
```

The resulting 8-character hash is stored in the file's YAML frontmatter as `source_hash`. A mismatch between the stored hash and the current hash means the source files have changed since the knowledge was generated.

---

## Source File Mapping

| Knowledge File | Source Files for Hash |
|---|---|
| stack.md | package.json, Cargo.toml, pyproject.toml, go.mod, tsconfig.json, lint configs (.eslintrc*, eslint.config.*, .prettierrc*, prettier.config.*, biome.json, ruff.toml, clippy.toml), test configs (vitest.config.*, jest.config.*, pytest.ini) |
| infrastructure.md | .github/workflows/*.yml, .gitlab-ci.yml, Dockerfile, docker-compose.*, deploy configs (terraform/*.tf, serverless.yml, fly.toml, render.yaml) |
| conventions.md | .editorconfig, lint configs, .github/pull_request_template.md |
| domain-glossary.md | entity/model files, schema files (prisma/schema.prisma, `*.entity.ts`, `*.model.ts`, models.py) |
| api-surface.md | route/controller files, OpenAPI specs (openapi.yaml, swagger.json) |
| review-perspectives.md | lint configs, test configs, `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` |
| investigation-checklist.md | src/ directory structure (`find . -maxdepth 3 -type d \| sort`) |
| tracker.md | `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (tracker section only) |
| environment-config.md | .env.example, .env.*, deploy configs |
| validation.md | playwright.config.*, cypress.config.*, vitest.config.*, Cargo.toml (test deps), package.json (test-related deps) |
| comm-platform.md | `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (comm platform section only) |

**Notes:**
- `conventions.md` deliberately excludes `git log` from hash computation — git log changes with every commit, making the hash useless. The git log is used during the scan phase (step 02) to detect commit pattern changes, not for staleness detection.
- `investigation-checklist.md` uses a sorted directory listing. Only top-level structure matters — deep changes within existing directories rarely affect the checklist.

---

## Dependency Graph

Some knowledge files depend on others. When a parent changes, its dependents may also need refresh (cascade detection).

```
Tier 0 (independent — refresh first):
  stack.md
  infrastructure.md
  conventions.md
  domain-glossary.md
  environment-config.md
  tracker.md
  comm-platform.md

Tier 1 (depends on Tier 0 — refresh after parents):
  review-perspectives.md      ← stack.md
  investigation-checklist.md  ← stack.md
  validation.md               ← stack.md
  api-surface.md              ← domain-glossary.md
```

**Cascade rule:** If a Tier 0 file is marked REFRESH_NEEDED, all its Tier 1 dependents are automatically marked REFRESH_CASCADE (medium priority).

---

## Context-to-File Mapping

When analyzing conversation history for what changed during the development session, use these heuristics to identify which knowledge files are likely affected:

| Conversation Signal | Likely Affected Files |
|---|---|
| New dependency added (npm install, cargo add, pip install) | stack.md |
| Package manifest modified (package.json, Cargo.toml, pyproject.toml) | stack.md, possibly validation.md |
| New CI workflow or pipeline change | infrastructure.md |
| Docker / deployment config change | infrastructure.md, environment-config.md |
| New API endpoint or route added | api-surface.md |
| New entity, model, or schema created | domain-glossary.md, api-surface.md |
| Linter or formatter config changed | conventions.md, review-perspectives.md, stack.md |
| New test framework or test config change | stack.md, validation.md |
| Directory structure reorganized (new dirs, moved files) | investigation-checklist.md |
| .env file modified or new env vars added | environment-config.md |
| Tracker configuration changed | tracker.md |
| Git workflow or branch strategy changed | conventions.md |
| PR template modified | conventions.md |
| Communication platform config changed | comm-platform.md |

**Mapping rules:**
- A single conversation change may affect multiple files — always check all columns
- Context signals are **candidates**, not certainties — always confirm with hash comparison
- If the conversation context is ambiguous, prefer over-inclusion (check the hash to confirm)
