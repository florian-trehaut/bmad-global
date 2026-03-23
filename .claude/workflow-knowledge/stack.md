# Tech Stack — Knowledge

## Project Nature

bmad-global is a **skill distribution framework** — not a typical application. It contains:

1. **Content layer** (unchanged): ~50+ Markdown/YAML skills, workflows, step files, templates, data files
2. **Tooling layer** (being rewritten): CLI installer, validators, docs builder

## Architecture

Module-based, phase-organized:

```
src/
├── bmm-skills/              # BMad Method module (default)
│   ├── 1-analysis/          # Phase 1: Research & analysis skills
│   ├── 2-plan-workflows/    # Phase 2: Planning & agent personas
│   ├── 3-solutioning/       # Phase 3: Architecture & design skills
│   ├── 4-implementation/    # Phase 4: Dev, review, sprint skills
│   ├── module.yaml          # Module metadata + config variables
│   └── module-help.csv      # Help system entries
├── core-skills/             # Core module (utilities)
│   ├── bmad-help/
│   ├── bmad-init/
│   ├── bmad-brainstorming/
│   └── module.yaml
tools/                       # CLI + validators (JS → Rust migration)
website/                     # Astro Starlight docs site
docs/                        # Documentation source
```

### Skill Structure (canonical)

```
bmad-{name}/
├── SKILL.md           # Entrypoint: frontmatter (name, description) + body
├── workflow.md        # Orchestration flow (optional)
├── steps/             # step-01-*.md through step-N-*.md (sequential)
├── data/              # CSV, JSON, detection patterns
└── templates/         # Output templates
```

## Current Stack (legacy JS — being replaced)

| Component | Technology |
|---|---|
| Language | JavaScript (Node.js ≥20) |
| CLI | Commander + @clack/prompts |
| Package manager | npm |
| Tests | Jest + custom Node scripts |
| Linting | ESLint (eslint.config.mjs) |
| Formatting | Prettier (prettier.config.mjs) |
| Markdown lint | markdownlint-cli2 |
| Pre-commit | Husky + lint-staged |
| Docs site | Astro Starlight |

## Target Stack (Rust)

| Component | Technology |
|---|---|
| Language | Rust |
| CLI | clap (or similar) |
| Package manager | Cargo |
| Tests | cargo test |
| Linting | clippy |
| Formatting | rustfmt |
| Distribution | cargo install / crates.io |
| Docs site | TBD (may keep Astro or migrate) |

## Test Rules

### Forbidden Patterns (STRICT)

- No mocking in unit tests — if mocks are needed, refactor to decouple
- No `console.log` left in production code
- No `any` type (when using TypeScript)

### Test Pyramid

| Type | Framework | Suffix | Location |
|---|---|---|---|
| Unit | cargo test | `#[test]` | Inline in source files |
| Integration | cargo test | `#[test]` | `tests/` directory |

### Running Tests

```bash
cargo test                    # All tests
cargo test -- --test-threads=1  # Sequential (if needed)
```

## Skill Validation Rules

28 rules total (14 deterministic + 14 inference):

- SKILL-01–07: SKILL.md existence, frontmatter, format
- WF-01–03: workflow.md structure
- PATH-01–05: No hardcoded paths, no `{installed_path}`
- STEP-01–07: Step file format, sequencing, count (2–10)
- REF-01–03: Reference integrity
- SEQ-02: No time estimates in prose

Validator: `tools/validate-skills.js` (to be rewritten in Rust)

## Code Conventions

- Conventional Commits for all commits
- Run `npm run quality` (→ `cargo test + clippy + fmt`) before pushing
- Skill names must match directory name, format: `bmad-*`
- Markdown follows `.markdownlint-cli2.yaml` rules
