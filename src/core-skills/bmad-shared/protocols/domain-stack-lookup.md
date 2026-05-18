# Domain Stack Lookup Protocol

**Loaded by:** Any bmad-\* workflow whose INIT consumes project-type-specific preset content (engines, personas, NFR baselines, security baseline, observability defaults). Used by `bmad-create-story` step-02d (pilot), `bmad-knowledge-bootstrap` step-04, `bmad-knowledge-refresh` step-02, and (mechanically) by every workflow/agent in the domain-consuming subset declared by `standalone-presets-foundation-and-game-dev-pilot.md` Guardrail #7.

**Indirection layer for** the `project_type` field in `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` → CSV `domain_stack` column → `bmad-shared/domains/{slug}.md` file.

---

## Purpose

Workflows and agents that benefit from project-type-specific content (game-dev / embedded / scientific / …) need a single mechanism to resolve `project_type` → preset file without each consumer hard-coding the CSV path or filesystem mapping. This protocol provides that abstraction.

The protocol enforces **zero-fallback** behavior: a declared-but-missing domain stack HALTs, while an absent `project_type` is a silent NO-OP. There is no graceful degradation in between.

---

## Contract — Input/Output

| Direction | Field | Type | Constraint |
|---|---|---|---|
| Input | `project_type` | string OR null | From `workflow-context.md` frontmatter. Nullable. When non-empty, MUST be lowercase kebab-case matching regex `^[a-z][a-z0-9-]*$`. |
| Input | `available_domains` | enum | Filesystem listing `bmad-shared/domains/*.md` minus `README.md`. Resolved at runtime — not declared. |
| Output | `domain_stack_path` | string OR null | Resolved file path (relative to repo root). Null if `project_type` is absent OR the matched CSV row has empty `domain_stack`. |
| Output | `loaded_content` | string OR null | File contents read into context. Null in the same conditions as `domain_stack_path`. |
| HALT (exception) | — | — | `project_type` declared AND CSV row found AND `domain_stack` column non-empty BUT file does not exist at the resolved path. |
| NO-OP (silent skip) | — | — | `project_type` absent from `workflow-context.md` OR matched CSV row has empty `domain_stack` OR `project_type` matches no CSV row. |

---

## Resolution Algorithm

1. **Read** `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` YAML frontmatter (already loaded by every workflow's INIT — do not re-read; reuse the in-memory value).
2. **Extract** the `project_type` field.
   - If absent / empty / null → **NO-OP**: return `domain_stack_path = null`, `loaded_content = null`. Do not log a warning. Do not emit a finding. This is the documented opt-out for projects that don't want domain-aware behavior (preserves BAC-3 of the originating story).
3. **Validate** the `project_type` value against regex `^[a-z][a-z0-9-]*$` (lowercase kebab-case, no whitespace, no leading digit).
   - On regex mismatch → **HALT** with message: `domain-stack-lookup: project_type "{value}" does not match required regex ^[a-z][a-z0-9-]*$ (lowercase kebab-case). Fix workflow-context.md or run /bmad-project-init.`
4. **Read** the canonical project-types CSV at the path documented in §Canonical CSV Path below.
5. **Match** the row whose `project_type` column exactly equals the input value (case-sensitive). Alias resolution is NOT applied at this layer — see §Alias Resolution below.
   - On no match → **NO-OP**: return `domain_stack_path = null`, `loaded_content = null`. The project declared a type that the CSV taxonomy does not currently model — treat as opt-out. (Note: a future story may HALT here instead; the v1 contract is NO-OP for forward-compat as users may opt into a type before the CSV is updated.)
6. **Read** the matched row's `domain_stack` column.
   - If empty / whitespace-only → **NO-OP**: return `domain_stack_path = null`, `loaded_content = null`. The taxonomy declares the type but no preset content backs it — valid opt-out.
7. **Resolve** the `domain_stack` value to an absolute filesystem path.
   - The value is a path relative to the repo root (e.g., `bmad-shared/domains/game-dev.md`). The protocol resolves this as `{REPO_ROOT}/src/core-skills/{value}` (since `bmad-shared/` lives at `src/core-skills/bmad-shared/`).
   - Actually, when invoked from a deployed `~/.claude/skills/` context, the resolved path is `~/.claude/skills/{value}`. The protocol picks the correct base by detecting which root contains a readable file (deployed first, source fallback for repo-local dev).
8. **Verify** the file exists.
   - If missing → **HALT** with message: `domain-stack-lookup: project_type "{value}" resolves to domain_stack "{path}" but the file does not exist. Either create the file at {path} or clear the domain_stack column for this row.`
9. **Read** the file contents.
10. **Return** `domain_stack_path = {resolved path}`, `loaded_content = {file content}`. The caller is free to extract specific H2 sections (Engines / Personas / NFR Baselines / Security Baseline / Observability Defaults / GDD Discovery Hints / External References) per its needs.

---

## Canonical CSV Path

The canonical project-types CSV is:

```
src/bmm-skills/2-plan-workflows/bmad-create-prd/data/project-types.csv
```

(relative to the repo root for source-tree invocation, or `~/.claude/skills/bmad-create-prd/data/project-types.csv` for deployed-tree invocation — the protocol picks the correct base via the same dual-root detection as step 7 of the resolution algorithm).

This is the **single source of truth** for project-type taxonomy.

**Other copies of `project-types.csv` in the codebase are NOT consulted by this protocol:**

- `src/bmm-skills/2-plan-workflows/bmad-validate-prd/data/project-types.csv` — a 4-column / 6-row variant consumed only by `bmad-validate-prd` step-09 for its own schema-validation purposes. Its schema differs from the canonical (no `required_sections`, no `domain_stack`) — alignment is deferred to follow-up story `bmad-validate-prd-schema-alignment` (OOS-9 of the originating story).
- `src/bmm-skills/3-solutioning/bmad-create-architecture/data/project-types.csv` — another 4-column / 6-row variant. Same status as above.

A future story `bmad-validate-prd-schema-alignment` may reconcile these copies to a single canonical source. Until then, this protocol consults ONLY the `bmad-create-prd` copy.

---

## HALT Conditions

The protocol HALTs (per the zero-fallback policy in `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md`) when **any** of the following occur:

| # | Condition | HALT Message |
|---|---|---|
| H1 | `project_type` regex mismatch (non-empty value fails `^[a-z][a-z0-9-]*$`) | `domain-stack-lookup: project_type "{value}" does not match required regex ^[a-z][a-z0-9-]*$ (lowercase kebab-case). Fix workflow-context.md or run /bmad-project-init.` |
| H2 | CSV file missing at canonical path | `domain-stack-lookup: canonical CSV not found at {path}. The framework installation is incomplete — run \`node tools/cli/bmad-cli.js install --force\`.` |
| H3 | CSV declared `domain_stack` but target file missing | `domain-stack-lookup: project_type "{value}" resolves to domain_stack "{path}" but the file does not exist. Either create the file at {path} or clear the domain_stack column for this row.` |
| H4 | Target file unreadable (permissions, encoding) | `domain-stack-lookup: project_type "{value}" resolves to {path} but reading the file failed: {error}.` |

H3 is also detected statically at validate-time by the DOM-01 rule in `tools/validate-skills.js` (HIGH severity, exit 1 in `--strict` mode). Runtime H3 is a defense-in-depth in case the CSV is modified between validate and use.

---

## NO-OP Conditions

The protocol silently returns `(null, null)` when **any** of the following hold:

| # | Condition | Rationale |
|---|---|---|
| N1 | `project_type` field absent from `workflow-context.md` | Opt-out: the project has not declared a domain type — preserve BAC-3 backward compat |
| N2 | `project_type` field present but empty / whitespace-only | Explicit opt-out via empty value |
| N3 | `project_type` value matches no row in CSV | Forward-compat: user may declare a type before the CSV adds it; treat as opt-out for now (future story may HALT) |
| N4 | Matched CSV row has empty / whitespace-only `domain_stack` | The taxonomy models the type but no preset content backs it — valid opt-out per CSV design (additive column, empty for 9 of 10 rows in v1) |

NO-OP is **silent**: no log, no warning, no token cost from a "skipping load" message. Consumer workflows treat `null` returns as "no domain content available" and behave identically to projects without `project_type`.

---

## Alias Resolution

v1 contract: **no alias resolution**. The `project_type` value must exactly match a CSV row's `project_type` column (case-sensitive lowercase kebab-case).

**Examples:**

| `workflow-context.md` value | CSV row | Resolved? |
|---|---|---|
| `game` | `game` | YES |
| `game-dev` | (no row with `project_type=game-dev`) | NO → NO-OP per N3 |
| `gamedev` | (no row) | NO → NO-OP per N3 |
| `Game` | `game` (case differs) | NO → HALT per H1 (regex requires lowercase) |
| ` game ` | `game` | depends on parse: if `workflow-context.md` reader trims, YES; if not, HALT per H1 |

Aliases (e.g., `game` ↔ `game-dev` ↔ `gamedev` resolving to the same row) are deferred to a future story (`domain-alias-resolution`, OOS-6 of the originating story). When implemented, aliases will live in an additional CSV column (`aliases`) consulted by step 5 of the resolution algorithm.

---

## Cross-references

- `~/.claude/skills/bmad-shared/domains/README.md` — directory structure + required H2 sections for domain files
- `~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md` — the parallel protocol for tech-stack (language-keyed) resolution
- `~/.claude/skills/bmad-shared/core/knowledge-loading.md` — the overall knowledge loading protocol that this lookup composes
- `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md` — the zero-fallback policy enforced by H1-H4
- `tools/validate-skills.js` — rule DOM-01 (HIGH severity) detects H3 statically at validate-time
- `src/bmm-skills/2-plan-workflows/bmad-create-prd/data/project-types.csv` — the canonical CSV
- `src/bmm-skills/2-plan-workflows/bmad-create-story/steps/step-02d-discover.md` — the pilot consumer
- `src/core-skills/bmad-knowledge-bootstrap/steps/step-04-generate-knowledge.md` — knowledge-bootstrap consumer
- `src/core-skills/bmad-knowledge-refresh/steps/step-02-scan-and-generate.md` — knowledge-refresh consumer
