# Public API Surface Detection

**Consumed by:** sub-axis 1b (API Contract & Backward Compat), 1d (Documentation Coherence — detecting changed exports), 5c (Commit History — detecting API-touching commits).

When a diff changes the public API surface, every sub-axis that consumes this file treats the change as a breaking-change candidate and applies the appropriate tooling.

---

## What counts as "public API surface"

| Stack | Surface signals |
|-------|-----------------|
| **TypeScript / JavaScript (npm library)** | `index.ts` / `index.js` exports; `package.json` `"exports"` / `"main"` / `"types"` / `"bin"` fields; `.d.ts` type declarations |
| **REST API** | OpenAPI (`openapi.yaml`, `openapi.json`, `swagger.yaml`) schema changes; path-level route diffs in controllers |
| **gRPC / Protobuf** | `*.proto` files; field numbering; service/method signatures |
| **GraphQL** | `*.graphql` / `*.gql` schema files; resolver signatures |
| **CLI** | argv parsing: `commander`, `yargs`, `clap`, `argparse` — flag additions / removals / renamings |
| **Database** | Migration files (`*.sql`, Prisma migrations, Rails migrations) — table/column add/rename/drop |
| **Public Go types** | Exported (capitalized) functions, structs, interfaces in non-`internal/` packages |
| **Rust** | `pub`/`pub(crate)` items in library crates (checked via `cargo-semver-checks`) |
| **Python** | `__all__` in `__init__.py`; public (non-underscore-prefixed) symbols |
| **Java** | `public` / `protected` members in non-test source roots |

If ANY of the above files / paths appear in `CHANGED_FILES`, the diff affects the public API surface and sub-axis 1b must execute.

---

## Tool dispatch per stack

| Stack detected | Tool | Purpose |
|----------------|------|---------|
| TypeScript library with `"types"` field | [`@microsoft/api-extractor`](https://api-extractor.com) | Generate `.api.md` report; diff against main |
| REST/OpenAPI | [`oasdiff`](https://github.com/Tufin/oasdiff) | Classify change as breaking / non-breaking / compatible |
| GraphQL | [`graphql-inspector`](https://the-guild.dev/graphql/inspector) | Schema diff + breaking change detection |
| Protobuf | [`buf breaking`](https://buf.build/docs/breaking/overview) | Detect wire-breaking changes |
| Rust | [`cargo-semver-checks`](https://github.com/obi1kenobi/cargo-semver-checks) | Automated semver audit |
| Go | [`gorelease`](https://pkg.go.dev/golang.org/x/exp/cmd/gorelease) or [`apidiff`](https://pkg.go.dev/golang.org/x/exp/apidiff) | Detect API changes in public packages |
| Python | [`mypy --strict`](https://mypy.readthedocs.io) + `__all__` diff | Surface public-API drift |

If the project does not have the tool configured, sub-axis 1b emits a **QUESTION**: "recommend adding `{tool}` to catch breaking changes — no automated check ran for this review."

---

## Breaking-change classification

| Change type | Severity | Action |
|-------------|----------|--------|
| Removed public symbol | BLOCKER | `decision_needed` — requires major version bump |
| Renamed public symbol | BLOCKER | `decision_needed` — typically needs deprecation+rename dance |
| Added required parameter | BLOCKER | `decision_needed` |
| Removed required field (request) | BLOCKER | `decision_needed` |
| Added field (response — optional) | RECOMMENDATION | `patch` / `defer` — non-breaking if additive |
| Added new endpoint | RECOMMENDATION | `patch` |
| Loosened constraint (e.g. required → optional) | RECOMMENDATION | `patch` |
| Internal rename only (no public surface touched) | QUESTION | `defer` |

---

## Expand/contract discipline (reused in sub-axis 2c)

For persistent storage (DB migrations) and public schemas, enforce the 2-phase migration pattern:

1. **Expand:** Add the new column/field WITHOUT removing the old one; deploy, backfill, verify reads.
2. **Contract:** Remove the old column/field after a deprecation window.

A single MR that does both expand and contract → **BLOCKER** (no rollback path).

---

## Deprecation 6-month rule

Any deprecated public symbol must carry:

- `@deprecated` marker (JSDoc / TSDoc / Python deprecation warning / Rust `#[deprecated]`)
- Removal date: minimum 6 months after deprecation announcement
- Replacement reference: "Use `newFunction()` instead"
- Entry in CHANGELOG under the deprecation release

Sub-axis 1d (Documentation Coherence) validates these markers are present when a symbol is flagged as deprecated.
