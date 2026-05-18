# Domains — Project-Type-Specific Preset Files

**Purpose:** A global catalog of project-type-specific preset content (engines, personas, NFR baselines, security baseline, observability defaults, discovery hints) consumed by BMAD protocols. Each file in this directory describes idiomatic patterns, baselines, and reference material for a single domain (game development, embedded firmware, scientific computing, …).

**Loaded by:**

- `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` — resolves `project_type` from `workflow-context.md` → matches the `project_type` row in `src/bmm-skills/2-plan-workflows/bmad-create-prd/data/project-types.csv` → reads the file referenced in the `domain_stack` column.

Future protocols may add new H2 sections (e.g., `## Personas`, `## Observability Defaults`) to the same files. Existing protocols ignore unknown sections — the files are additive (same evolution policy as `stacks/`).

---

## File naming convention

Each domain file is named `{slug}.md` in lowercase kebab-case, matching the value of a `project_type` row in `project-types.csv` (or a documented alias resolved via the `domain-stack-lookup` protocol's CSV `domain_stack` column).

Currently shipped:

| Domain | File | CSV `project_type` value |
|---|---|---|
| Game development | `game-dev.md` | `game` |

The canonical filename is decoupled from the CSV `project_type` value via the `domain_stack` column — the CSV row's `domain_stack` cell stores the relative path, not the bare slug. This allows the same domain file to back multiple `project_type` rows (or aliases) in the future without renaming.

---

## Required structure

Each domain file (other than this `README.md`) MUST contain at minimum these H2 sections, each describing the domain-specific content for that section:

```markdown
# Domain: {Name}

**Loaded by:** Protocol `domain-stack-lookup.md` when `workflow-context.md`
declares `project_type` matching a CSV row whose `domain_stack` column resolves to this file.

## Engines
<!-- or "## Frameworks" / "## Platforms" / "## Toolchains" — domain-appropriate label -->

### {Engine A}
- Idiomatic patterns
- Known gotchas
- Performance baselines
- Sourced URLs (vendor docs)

### {Engine B}
...

## Personas

{Optional descriptors of domain-specific agent personas — used by discovery hints
and create-story flows. If a persona is implemented as a skill, link to it.}

## GDD Discovery Hints
<!-- or domain-equivalent: "## Discovery Hints" / "## Specification Hints" -->

{Questions and prompts that the create-story / create-prd / quick-spec flows
should surface when the domain is active.}

## NFR Baselines

{Performance, scalability, availability, reliability defaults specific to
the domain. These feed into the spec's NFR Registry as default values, NOT
hard targets — projects override as needed.}

## Security Baseline

{Domain-specific security considerations (e.g., GDPR/COPPA for kids' games,
anti-cheat for competitive titles, secure boot for firmware).}

## Observability Defaults

{Patterns + vendor URLs for crash reporting, telemetry, gameplay analytics,
metrics. Vendor URLs only — no copied code per OOS-5.}

## External References

{Sourced URLs grouped by topic. One link per claim.}
```

Additional H2 sections MAY be added per domain (e.g., `## Compliance Notes`, `## Common Pitfalls`). Future protocols may target these new sections without breaking existing readers (additive evolution).

---

## Relationship to `bmad-shared/stacks/`

`stacks/` and `domains/` are parallel directories with different scopes:

| | `bmad-shared/stacks/` | `bmad-shared/domains/` (this directory) |
|---|---|---|
| Keyed on | Language (Go, Rust, TypeScript, Python) | Project type / domain (game, future: embedded, scientific, …) |
| Loaded by | `concurrency-review.md`, `null-safety-review.md` | `domain-stack-lookup.md` |
| Resolves via | `tech-stack-lookup` protocol (alias-aware) | `domain-stack-lookup` protocol (CSV-row exact match) |
| Required sections | `## Concurrency`, `## Null Safety` | `## Engines`, `## Personas`, `## GDD Discovery Hints`, `## NFR Baselines`, `## Security Baseline`, `## Observability Defaults`, `## External References` |

A language can apply to many domains (Go is used for both game-server and IoT-embedded). The two systems are orthogonal — load both if the project's tech stack AND project type are declared.

---

## Adding a new domain

1. Create `src/core-skills/bmad-shared/domains/{slug}.md` following the required structure above.
2. Add or enrich a row in `src/bmm-skills/2-plan-workflows/bmad-create-prd/data/project-types.csv` so that its `domain_stack` column points to your new file (relative to repo root: `bmad-shared/domains/{slug}.md`).
3. Run `npm run validate:skills` to confirm the DOM-01 rule passes (verifies the `domain_stack` reference resolves to an existing file).
4. Run `node tools/cli/bmad-cli.js install --force` to deploy the new content.

The bundled v1 set covers `game-dev.md`. Other domains can be added by users without modifying the protocol or any consumer workflow — the JIT-load block (per `domain-stack-lookup.md`) auto-picks them up via the CSV row.

---

## When a domain file is referenced but missing

Per `domain-stack-lookup.md` HALT Conditions: if a CSV row declares a non-empty `domain_stack` whose target file does not exist, the protocol HALTs with a structured error (the validator DOM-01 rule pre-detects this at `npm run validate:skills` time). This is consistent with the project's zero-fallback policy (`~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md`).

If `project_type` is **absent** from `workflow-context.md` (or the matched CSV row has empty `domain_stack`), the protocol is a silent **NO-OP** — no load, no error, no token cost. This is the documented opt-out for projects that don't want domain-aware behavior.

---

## Versioning

Each domain file is independent — no cross-file version constraint. Adding, modifying, or deleting a domain file does not require a knowledge-schema bump (this directory is in `bmad-shared/`, not in project knowledge).

If a future schema change requires per-domain metadata (e.g., source pin SHA for imported content), the files will gain YAML frontmatter at that point.

---

## Cross-references

- `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` — the loader protocol
- `~/.claude/skills/bmad-shared/stacks/README.md` — the parallel language-keyed system
- `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md` — the zero-fallback policy applied by HALT on missing file
- `src/bmm-skills/2-plan-workflows/bmad-create-prd/data/project-types.csv` — the canonical project-type taxonomy
