---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: f318564d
---

# Conventions — Knowledge

## Commit Conventions

### Format

```
type(scope): description
```

Lowercase description, imperative mood, no trailing period.

### Allowed Types

| Type | Usage |
|---|---|
| `feat` | New features |
| `fix` | Bug fixes |
| `refactor` | Code restructuring |
| `chore` | Version bumps, maintenance |
| `docs` | Documentation changes |
| `test` | Test additions/changes |

### Scope Rules

Common scopes: `skills`, `cli`, `install`, `shared`, `sync`. Scope is optional for `chore`.

Examples:
- `fix(skills): move worktree setup to step 1 in bmad-validation-metier`
- `feat(skills): add bmad-adr-review structured ADR review skill`
- `refactor(skills): merge bmad-init into bmad-knowledge-bootstrap`
- `chore: bump version to 6.3.0`

## Branch Strategy

Feature branches off `main`. Format: `type/description` (kebab-case).

| Prefix | Example |
|---|---|
| `feat/` | `feat/global-installer`, `feat/standalone-adr-review-skill` |
| `fix/` | `fix/code-review-findings` |
| `chore/` | `chore/cleanup-skill-manifests` |
| `docs/` | `docs/tea-readme-update-3-levels` |
| `refactor/` | `refactor/derive-agent-identity` |

Two remotes: `origin` (personal fork) and `upstream` (bmad-code-org/BMAD-METHOD).

## PR Standards

### Template (.github/PULL_REQUEST_TEMPLATE.md)

Four sections:
1. **What** — 1-2 sentences describing what changed
2. **Why** — 1-2 sentences explaining why, with optional `Fixes #issue_number`
3. **How** — 2-3 bullet points on implementation approach
4. **Testing** — 1-2 sentences on how it was tested

### Issue Templates

| Template | Format | Title Prefix |
|---|---|---|
| `bug-report.yaml` | YAML form (structured) | `[BUG]` |
| `documentation.yaml` | YAML form (structured) | `[DOCS]` |
| `feature-request.md` | Markdown (freeform) | None |
| `issue.md` | Markdown (freeform) | None |

Blank issues disabled — linked to docs & Discord instead.

## Code Style

### Formatting (Prettier)

| Option | Value |
|---|---|
| printWidth | 140 |
| tabWidth | 2 |
| useTabs | false |
| semi | true |
| singleQuote | true (JS), false (YAML/JSON) |
| trailingComma | all |
| endOfLine | lf |
| proseWrap | preserve |

Plugin: `prettier-plugin-packagejson` (sorts package.json keys).

### Linting (ESLint 9 flat config)

Plugins: `@eslint/js`, `eslint-plugin-n` (Node.js), `eslint-plugin-unicorn`, `eslint-plugin-yml`, `eslint-config-prettier`.

Key rules:
- `yml/file-extension`: error — must use `.yaml` (not `.yml`)
- `yml/quotes`: error — prefer double quotes
- `no-console`: off (CLI tools need console)
- Tools/test files: heavily relaxed (CJS allowed, unused vars ignored)

### Markdown Lint (5 active rules)

| Rule | Description |
|---|---|
| MD001 | Heading levels must increment by one |
| MD024 | No duplicate sibling headings |
| MD026 | No trailing commas in headings |
| MD034 | No bare URLs |
| MD037 | No spaces inside emphasis markers |

### Naming Conventions

- **Skills**: `bmad-*` kebab-case (enforced by SKILL-04 validator rule)
- **Step files**: `step-NN[a-z]-description.md` zero-padded (enforced by STEP-01)
- **JS files**: kebab-case (tools/cli convention)
- **YAML files**: `.yaml` extension only (enforced by ESLint yml/file-extension)

### File Organization

- Skills: phase-organized under `src/bmm-skills/{1-4}-*/` and `src/core-skills/`
- Tooling: flat scripts in `tools/`, CLI in `tools/cli/commands/`
- Tests: `test/test-*.js` and `test/test-*.mjs`
- Docs: Diataxis structure in `docs/` (tutorials, how-to, explanation, reference)

### Import Order (JS)

CommonJS (`require`) for all tools/ scripts:
1. Third-party packages (`commander`, `yaml`, `csv-parse/sync`)
2. Node built-ins with `node:` prefix (`require('node:fs')`, `require('node:path')`)
3. Local/relative modules (`require('./lib/prompts')`)

ESM only for config files (`eslint.config.mjs`, `prettier.config.mjs`).

## Documentation Standards

- No inline comments unless explaining "why" (not "what")
- Skill descriptions must contain "Use when" or "Use if" (enforced by SKILL-06)
- Docs site follows Diataxis framework: tutorials, how-to, explanation, reference
- llms.txt + llms-full.txt generated for LLM consumption (max 600k chars)
