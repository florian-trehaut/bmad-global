---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: 9ffeaad2
---

# Tech Stack — Knowledge

## Project Nature

BMAD-METHOD is a **skill distribution framework** for AI-driven agile development. The primary content is ~50+ Markdown/YAML skills, workflows, step files, templates, and data files executed by LLMs. The JavaScript tooling in `tools/` handles installation, validation, and documentation building.

## Architecture

Module-based, phase-organized:

```
src/
├── bmm-skills/              # BMad Method module (default)
│   ├── 1-analysis/          # Phase 1: Research & analysis (5 skills)
│   ├── 2-plan-workflows/    # Phase 2: Planning & agent personas (9 skills)
│   ├── 3-solutioning/       # Phase 3: Architecture & design (10 skills)
│   ├── 4-implementation/    # Phase 4: Dev, review, sprint (26 skills)
│   ├── module.yaml          # Module metadata + config variables
│   └── module-help.csv      # Help system entries
├── core-skills/             # Core module (20 utility skills)
│   ├── bmad-knowledge-bootstrap/
│   ├── bmad-create-skill/
│   ├── bmad-help/
│   └── module.yaml
tools/                       # CLI + validators (JavaScript/Node.js)
│   ├── cli/                 # bmad-cli.js + commands/ + installers/
│   ├── validate-skills.js   # Skill validation (14 deterministic rules)
│   ├── validate-file-refs.js # File reference integrity
│   └── build-docs.mjs       # Docs site + llms.txt builder
website/                     # Astro Starlight docs site
docs/                        # Documentation source
test/                        # Tests (Node.js scripts)
```

### Skill Structure (canonical)

```
bmad-{name}/
├── SKILL.md           # Entrypoint: frontmatter (name, description) + body
├── workflow.md        # Orchestration flow (optional)
├── steps/             # step-01-*.md through step-N-*.md (2-10, sequential)
├── data/              # CSV, JSON, detection patterns, checklists
├── templates/         # Output templates
└── subagent-workflows/ # Delegated sub-agent workflows (optional)
```

## Current Stack

| Component | Technology |
|---|---|
| Primary content | Markdown (92.6% of src/) + YAML + CSV |
| Tooling language | JavaScript (Node.js ≥20, .nvmrc: 22) |
| CLI framework | Commander + @clack/prompts |
| Package manager | npm |
| Tests | Node.js scripts (test/test-*.js, test/test-*.mjs) + Jest 30 (declared) |
| Linting | ESLint 9 flat config (unicorn + node + yml plugins) |
| Formatting | Prettier (printWidth: 140, singleQuote: true, trailingComma: all) |
| Markdown lint | markdownlint-cli2 (5 rules: MD001, MD024, MD026, MD034, MD037) |
| Pre-commit | Husky + lint-staged |
| Docs site | Astro Starlight |

## Source File Patterns

| Pattern | Description |
|---|---|
| Source files | `*.md`, `*.yaml`, `*.csv`, `*.js`, `*.mjs`, `*.py`, `*.json` |
| Test files | `test/test-*.js`, `test/test-*.mjs` |
| Config files | `*.yaml`, `*.json`, `*.mjs` (at root) |
| Skill content | `src/**/*.md`, `src/**/*.yaml`, `src/**/*.csv` |

## Architecture Patterns

| Scope | Pattern | Key Rules |
|---|---|---|
| Skills | Module-based, phase-organized | Skills grouped in numbered phase dirs under bmm-skills/. Each skill is self-contained with SKILL.md entrypoint |
| Tooling | Flat script-based | CLI commands in tools/cli/commands/, validators as standalone scripts |
| Docs | Astro Starlight convention | pages/ + components/ + lib/ under website/ |

## Test Rules

### Forbidden Patterns (STRICT)

- No mocking in unit tests — if mocks are needed, refactor to decouple
- No `console.log` left in production code
- No `any` type (if using TypeScript)

### Test Pyramid

| Type | Framework | Suffix/Pattern | Location |
|---|---|---|---|
| Unit | Node.js scripts | `test/test-*.js` | `test/` |
| Unit (ESM) | Node.js scripts | `test/test-*.mjs` | `test/` |
| Integration | Node.js (tmpdir) | `test/test-global-installer.js` | `test/` |
| Validation | Custom validators | `npm run validate:skills`, `npm run validate:refs` | `tools/` |

### Running Tests

```bash
npm test                     # Full test suite (refs + install + lint + md + format)
npm run quality              # Full quality gate (test + docs:build + validate:skills + validate:refs)
npm run validate:skills      # Skill validation only (14 rules)
npm run validate:refs        # File reference validation only
```

## Skill Validation Rules

27 rules total (14 deterministic + 13 inference):

- SKILL-01–07: SKILL.md existence, frontmatter, name format, description quality
- WF-01–03: workflow.md must not duplicate name/description, frontmatter variables
- PATH-01–05: No hardcoded paths, no `{installed_path}`, relative references
- STEP-01–07: Step file format, sequencing, count (2–10), no forward loading
- REF-01–03: Reference integrity (variables defined, files resolve, invocation language)
- SEQ-01–02: No skip instructions, no time estimates

Validator: `tools/validate-skills.js` — `--strict` mode exits 1 on any HIGH+ findings.

## Code Conventions

- Conventional Commits: `type(scope): description` (feat, fix, chore, refactor, docs)
- Run `npm run quality` before pushing
- Skill names must match directory name, format: `bmad-*`
- YAML extension: `.yaml` enforced (not `.yml`)
- Markdown follows `.markdownlint-cli2.yaml` rules (5 active rules)
