---
generated: 2026-04-27
generator: bmad-knowledge-bootstrap
sources_used: [code]
source_hash:
  code: 9ffeaad2
content_hash: a1b2c3d4
schema_version: "1.0"
manual_override: false
---

# BMAD-METHOD — Project Knowledge

<!-- Generated from code only — no planning artifacts found in this self-migration. Migrated from legacy 10-file layout (stack/conventions/infrastructure/environment-config/review-perspectives/investigation-checklist/tracker — comm-platform and validation absent). Manual edits supported but flagged on next refresh. -->

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
│   ├── bmad-project-init/
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

## Tech Stack

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

## Conventions

### Commit Conventions

#### Format

```
type(scope): description
```

Lowercase description, imperative mood, no trailing period.

#### Allowed Types

| Type | Usage |
|---|---|
| `feat` | New features |
| `fix` | Bug fixes |
| `refactor` | Code restructuring |
| `chore` | Version bumps, maintenance |
| `docs` | Documentation changes |
| `test` | Test additions/changes |

#### Scope Rules

Common scopes: `skills`, `cli`, `install`, `shared`, `sync`. Scope is optional for `chore`.

Examples:
- `fix(skills): move worktree setup to step 1 in bmad-validation-metier`
- `feat(skills): add bmad-adr-review structured ADR review skill`
- `refactor(skills): merge bmad-init into bmad-knowledge-bootstrap`
- `chore: bump version to 6.3.0`

### Branch Strategy

Feature branches off `main`. Format: `type/description` (kebab-case).

| Prefix | Example |
|---|---|
| `feat/` | `feat/global-installer`, `feat/standalone-adr-review-skill` |
| `fix/` | `fix/code-review-findings` |
| `chore/` | `chore/cleanup-skill-manifests` |
| `docs/` | `docs/tea-readme-update-3-levels` |
| `refactor/` | `refactor/derive-agent-identity` |

Two remotes: `origin` (personal fork) and `upstream` (bmad-code-org/BMAD-METHOD).

### PR Standards

#### Template (.github/PULL_REQUEST_TEMPLATE.md)

Four sections:
1. **What** — 1-2 sentences describing what changed
2. **Why** — 1-2 sentences explaining why, with optional `Fixes #issue_number`
3. **How** — 2-3 bullet points on implementation approach
4. **Testing** — 1-2 sentences on how it was tested

#### Issue Templates

| Template | Format | Title Prefix |
|---|---|---|
| `bug-report.yaml` | YAML form (structured) | `[BUG]` |
| `documentation.yaml` | YAML form (structured) | `[DOCS]` |
| `feature-request.md` | Markdown (freeform) | None |
| `issue.md` | Markdown (freeform) | None |

Blank issues disabled — linked to docs & Discord instead.

### Code Style

#### Formatting (Prettier)

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

#### Linting (ESLint 9 flat config)

Plugins: `@eslint/js`, `eslint-plugin-n` (Node.js), `eslint-plugin-unicorn`, `eslint-plugin-yml`, `eslint-config-prettier`.

Key rules:
- `yml/file-extension`: error — must use `.yaml` (not `.yml`)
- `yml/quotes`: error — prefer double quotes
- `no-console`: off (CLI tools need console)
- Tools/test files: heavily relaxed (CJS allowed, unused vars ignored)

#### Markdown Lint (5 active rules)

| Rule | Description |
|---|---|
| MD001 | Heading levels must increment by one |
| MD024 | No duplicate sibling headings |
| MD026 | No trailing commas in headings |
| MD034 | No bare URLs |
| MD037 | No spaces inside emphasis markers |

#### Naming Conventions

- **Skills**: `bmad-*` kebab-case (enforced by SKILL-04 validator rule)
- **Step files**: `step-NN[a-z]-description.md` zero-padded (enforced by STEP-01)
- **JS files**: kebab-case (tools/cli convention)
- **YAML files**: `.yaml` extension only (enforced by ESLint yml/file-extension)

#### File Organization

- Skills: phase-organized under `src/bmm-skills/{1-4}-*/` and `src/core-skills/`
- Tooling: flat scripts in `tools/`, CLI in `tools/cli/commands/`
- Tests: `test/test-*.js` and `test/test-*.mjs`
- Docs: Diataxis structure in `docs/` (tutorials, how-to, explanation, reference)

#### Import Order (JS)

CommonJS (`require`) for all tools/ scripts:
1. Third-party packages (`commander`, `yaml`, `csv-parse/sync`)
2. Node built-ins with `node:` prefix (`require('node:fs')`, `require('node:path')`)
3. Local/relative modules (`require('./lib/prompts')`)

ESM only for config files (`eslint.config.mjs`, `prettier.config.mjs`).

### Documentation Standards

- No inline comments unless explaining "why" (not "what")
- Skill descriptions must contain "Use when" or "Use if" (enforced by SKILL-06)
- Docs site follows Diataxis framework: tutorials, how-to, explanation, reference
- llms.txt + llms-full.txt generated for LLM consumption (max 600k chars)

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

### Skill Validation Rules

27 rules total (14 deterministic + 13 inference):

- SKILL-01–07: SKILL.md existence, frontmatter, name format, description quality
- WF-01–03: workflow.md must not duplicate name/description, frontmatter variables
- PATH-01–05: No hardcoded paths, no `{installed_path}`, relative references
- STEP-01–07: Step file format, sequencing, count (2–10), no forward loading
- REF-01–03: Reference integrity (variables defined, files resolve, invocation language)
- SEQ-01–02: No skip instructions, no time estimates

Validator: `tools/validate-skills.js` — `--strict` mode exits 1 on any HIGH+ findings.

## Infrastructure

### Overview

BMAD-METHOD is a **distributed npm package**, not a deployed service. There is no cloud infrastructure, no servers, no databases. The "infrastructure" is:

1. GitHub repository (source of truth)
2. GitHub Actions (CI/CD)
3. npm registry (package distribution)
4. GitHub Pages (docs website)
5. Discord (community notifications)

### CI/CD Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| Quality & Validation | `quality.yaml` | push to main, all PRs, workflow_dispatch | Format, lint, markdownlint, docs build, validate refs + skills |
| Publish | `publish.yaml` | push to main (src/tools changes), workflow_dispatch | npm publish + GitHub Release + Discord notify |
| Deploy Documentation | `docs.yaml` | push to main (docs/website changes), workflow_dispatch | Build Astro site + deploy to GitHub Pages |
| Discord Notification | `discord.yaml` | PR opened/closed, issue opened | Community notifications |
| CodeRabbit Review | `coderabbit-review.yaml` | pull_request_target ready_for_review | Triggers AI code review via comment |

### Quality Pipeline (quality.yaml)

5 parallel jobs (no dependencies between them):

| Job | Command | Purpose |
|---|---|---|
| `prettier` | `npm run format:check` | Formatting validation |
| `eslint` | `npm run lint` | JS/YAML linting (max-warnings=0) |
| `markdownlint` | `npm run lint:md` | Markdown quality |
| `docs` | `npm run docs:build` | Docs build + internal link validation |
| `validate` | `test:install` + `validate:refs` + `validate:skills` | Global installer test, file ref integrity, skill validation |

All jobs: checkout → setup-node (from .nvmrc) → npm ci → run command.

### Publish Pipeline (publish.yaml)

**Guard:** `github.repository == 'bmad-code-org/BMAD-METHOD'` — must be changed to `florian-trehaut/bmad-global` for fork publishing.

**Two channels:**

| Channel | Trigger | Process |
|---|---|---|
| `next` (prerelease) | push to main OR workflow_dispatch channel=next | Derive next prerelease version → `npm publish --tag next --provenance` |
| `latest` (stable) | workflow_dispatch channel=latest, bump=patch/minor/major | `npm version $bump` → `npm publish --tag latest --provenance` → git push tags → GitHub Release → Discord webhook |

**Permissions:** `id-token: write` (npm OIDC trusted publishing), `contents: write` (push tags).

**Secrets:**
- `RELEASE_APP_ID` + `RELEASE_APP_PRIVATE_KEY` — GitHub App token for pushing version commits (latest channel only)
- `GITHUB_TOKEN` — checkout + gh release create
- `DISCORD_WEBHOOK` — post-publish notification
- npm uses OIDC trusted publishing (no NPM_TOKEN secret)

**Key:** Forces `npm@11.6.2` globally for trusted publishing (requires Node ≥ 22.14.0).

### Docs Pipeline (docs.yaml)

Two sequential jobs:
1. `build` — checkout (fetch-depth: 0 for lastUpdated timestamps) → `npm run docs:build` → upload artifact from `build/site`
2. `deploy` — deploy to GitHub Pages via `actions/deploy-pages@v4`

Concurrency: group `pages`, cancel-in-progress **false**.

### Discord Notifications (discord.yaml)

Posts to Discord webhook on PR events (opened/merged/closed) and new issues. Uses helper functions from `.github/scripts/discord-helpers.sh` (escaping, truncation, URL wrapping).

### Distribution

```bash
npx @florian-trehaut/bmad-global install   # Interactive install into project
npm install -g @florian-trehaut/bmad-global # Global install
```

- Package: `@florian-trehaut/bmad-global` (scoped, public)
- Entry: `tools/cli/bmad-cli.js`
- Binary: `bmad-global` → `tools/bmad-npx-wrapper.js`
- Engine: Node ≥ 20.0.0

### Database

No database, no migrations, no ORM. All data is file-based (Markdown, YAML, CSV, JSON).

### Cloud Resources

No cloud infrastructure. Distribution and hosting handled entirely by GitHub (Actions, Pages, Releases) and npm registry.

## Environments

### Deployed Environments

BMAD-METHOD is a CLI tool distributed as an npm package — it has no deployed environments (no staging, no production servers).

The only relevant concept is **distribution channels**:

| Channel | Purpose | Trigger |
|---|---|---|
| `next` | Pre-release for testing | Auto on push to main |
| `latest` | Stable release | Manual dispatch |

### Local Development

```bash
# Clone and setup
git clone git@github.com:florian-trehaut/bmad-global.git
cd bmad-global
npm install

# Run locally
node tools/cli/bmad-cli.js install

# Run tests
npm test

# Full quality gate
npm run quality
```

### Secrets and Configuration

| Secret | Environment | Source |
|---|---|---|
| `RELEASE_APP_ID` | CI (publish) | GitHub Actions secret |
| `RELEASE_APP_PRIVATE_KEY` | CI (publish) | GitHub Actions secret |
| `DISCORD_WEBHOOK` | CI (publish + notifications) | GitHub Actions secret |
| `SITE_URL` | CI (docs build) | GitHub repo variable (optional) |

npm publishing uses OIDC trusted publishing — no NPM_TOKEN needed.

### Feature Flags

No feature flag system.

## Validation Tooling

No dedicated E2E or validation framework — BMAD-METHOD is a CLI distribution package, not a deployed app. Tests are Node.js scripts in `test/`. See "Test Rules" section above.

## Review Perspectives

### Mandatory Perspectives (6 + 2 conditional)

#### 1. Specs Compliance (ALWAYS)

- Every AC from the story must be addressed in the implementation
- No scope creep: changes not in the story ACs require justification
- DoD: tests pass, validators pass, no TODOs left in implementation
- Skill changes: does the modified skill still match its SKILL.md description?
- Step changes: does the step still follow the canonical format (goal, sequence, success/failure metrics)?

#### 2. Zero Fallback / Zero False Data (ALWAYS)

- **Skill content**: No fabricated examples, placeholder data, or hallucinated tool names in workflow steps
- **CLI output**: Error messages must be accurate — no misleading "success" on partial failure
- **Config resolution**: Missing variables must HALT, never silently use empty string or default
- **File operations**: Verify paths exist before writing; never overwrite without detection
- **Validator output**: False positives/negatives are critical bugs — validator must be deterministic
- **Template content**: No placeholder sections left in generated output

#### 3. Security (ALWAYS)

- No secrets, API keys, or tokens in committed files
- `.gitignore` covers `.env`, credential files, `config.user.yaml`
- CLI does not execute user-provided strings as shell commands without sanitization
- No path traversal vulnerabilities in file operations (installer writes only to intended directories)
- Installer does not modify files outside intended target directories
- No absolute paths (`/Users/`, `/home/`, `C:\`) in source files (enforced by validate-file-refs.js)

#### 4. QA & Testing (ALWAYS)

- New JS tooling code has tests in `test/`
- Validators have test fixtures covering edge cases
- Skill changes are covered by `npm run validate:skills`
- File reference changes are covered by `npm run validate:refs`
- No mocking in unit tests — refactor to decouple if needed
- Test names describe the behavior, not the implementation

#### 5. Code Quality (ALWAYS)

- JavaScript: Node.js patterns, proper error handling, no `any` type
- Markdown: follows `.markdownlint-cli2.yaml` rules (5 active rules)
- YAML: valid syntax, `.yaml` extension (not `.yml`), double quotes
- Skill structure follows canonical format (SKILL.md, workflow.md, steps/)
- No dead code, no commented-out code
- Step files: 2-10 per skill, sequential numbering, no gaps

#### 6. Tech Lead (ALWAYS)

- Architecture: does the change fit the module-based, phase-organized structure?
- Backward compatibility: does the change break existing installed projects (`~/.claude/skills/`)?
- Performance: CLI should be fast — no unnecessary file system scans
- Distribution: changes don't break `npm publish` or npx install flow
- Conventional Commits: commit message follows `type(scope): description` convention
- Version impact: does this warrant a patch, minor, or major bump?

#### 7. Pattern Consistency (CONDITIONAL — on multi-file changes)

- Skill naming: `bmad-*` convention respected
- Step file numbering: sequential, no gaps, 2-10 per skill
- Template variables: consistent `{variable}` syntax
- Module.yaml: follows established schema (code, name, variables with prompt/default/result)
- Reference existing skills as patterns when creating new ones
- SKILL.md frontmatter: `name` and `description` required, description contains "Use when"/"Use if"

#### 8. Infra/CI (CONDITIONAL — on CI/workflow changes)

- GitHub Actions: workflow syntax valid, triggers correct
- npm publish: package.json metadata complete (name, version, bin, main, engines)
- Version bumping: follows semver
- Release process: tag + release + notification chain intact
- Docs build: Astro site builds, llms.txt under 600k char limit
- Quality gate: all 5 parallel jobs pass

### Severity Classification

| Severity | Criteria | Action |
|---|---|---|
| BLOCKER | Security vulnerability, data loss risk, broken AC, zero-fallback violation, validator false negative, broken install flow | Must fix before merge |
| WARNING | Performance issue, missing edge case test, minor pattern deviation, missing skill validation | Should fix, discuss |
| RECOMMENDATION | Code style, naming, minor improvement | Nice to have |
| QUESTION | Unclear intent, needs clarification | Ask author |

### Security Voting (Colleague Review)

Security findings require confirmation from 2 independent review perspectives before being classified as BLOCKER.

### Grep Scans

| Pattern | What it detects | Severity |
|---|---|---|
| `installed_path` | Hardcoded install path variable | BLOCKER (PATH-02) |
| `/Users/\|/home/\|C:\\` | Absolute paths leaked into source | BLOCKER |
| `console\.log` | Debug logging left in production CLI code | WARNING |
| `TODO\|FIXME\|HACK` | Unresolved markers | WARNING |
| `\.yml` (in YAML refs) | Wrong extension (should be .yaml) | WARNING |

### Excluded from Review

- `_bmad-output/` — generated artifacts
- `node_modules/` — dependencies
- `website/node_modules/` — docs dependencies
- `build/` — build output
- `package-lock.json` — auto-generated
- `test/fixtures/` — test data

## Investigation Checklist

Domain-specific investigation guides for spec review (review-story workflow). Each domain lists what to verify with REAL DATA, not code analysis.

### Domain: Skill System

#### Key Files

- `src/bmm-skills/` — all method skills by phase
- `src/core-skills/` — utility/framework skills
- `tools/validate-skills.js` — validation rules
- `tools/skill-validator.md` — full rule specification

#### Verification Points

- Does the proposed change respect the canonical skill structure (SKILL.md, workflow.md, steps/, data/, templates/)?
- Does the skill name follow `bmad-*` convention?
- Does SKILL.md frontmatter have required `name` and `description` fields?
- Does `description` contain "Use when" or "Use if"?
- Are step files numbered sequentially (step-01 through step-N, 2–10 steps)?
- Do file references use relative paths (no `{installed_path}`)?
- Does the skill pass all 27 validation rules?
- Does workflow.md NOT have `name` or `description` in frontmatter?

#### Common Failure Modes

- Hardcoded absolute paths leaking into skill files
- Step files referencing non-existent data or template files
- SKILL.md description missing "Use when" trigger phrase
- Step count outside 2-10 range
- Forward-loading of step files (loading step N+1 before completing step N)

### Domain: CLI / Installer

#### Key Files

- `tools/cli/bmad-cli.js` — CLI entrypoint
- `tools/cli/commands/` — install, uninstall, status commands
- `tools/cli/installers/lib/core/global-installer.js` — core install logic
- `tools/bmad-npx-wrapper.js` — npx binary wrapper

#### Verification Points

- Does the installer correctly resolve skill paths from src/ to ~/.claude/skills/?
- Are all module.yaml variables properly resolved during install?
- Does the installer handle existing installations (update, quick-update)?
- Does the installer detect and handle config files correctly?
- Does the installer create required directories from module.yaml `directories` list?
- Does the npx wrapper correctly delegate to bmad-cli.js?

#### Common Failure Modes

- Path resolution errors between src/ structure and installed flat structure
- Module.yaml variable interpolation failures (`{project-root}`, `{value}`, `{directory_name}`)
- Overwriting user config during update (should preserve config.user.yaml)
- Missing dependencies at install time

### Domain: Documentation / Website

#### Key Files

- `website/astro.config.mjs` — Astro configuration
- `tools/build-docs.mjs` — docs build + llms.txt generation
- `docs/` — documentation source (Diataxis structure)

#### Verification Points

- Do doc links resolve correctly after changes?
- Does `llms-full.txt` stay under 600k char limit?
- Are new skills documented in the appropriate docs section?
- Does the docs build complete without errors?
- Are translations (fr/, zh-cn/) consistent with English source?

#### Common Failure Modes

- Broken internal links after skill renaming
- llms.txt exceeding size limit after adding content
- Astro build errors from malformed MDX
- Missing frontmatter in docs pages

### Domain: Validation System

#### Key Files

- `tools/validate-skills.js` — skill validation (14 deterministic rules)
- `tools/skill-validator.md` — full rule specification (27 rules)
- `tools/validate-file-refs.js` — file reference integrity
- `test/test-file-refs-csv.js` — reference validator tests

#### Verification Points

- Do all existing skills still pass validation after changes?
- Are new validation rules backward-compatible?
- Does the validator correctly report file:line for findings?
- Does `--strict` mode correctly exit 1 on HIGH+ findings?
- Are false positives/negatives properly handled?

#### Common Failure Modes

- New validation rule breaking existing valid skills
- Regex patterns too strict or too loose
- Missing test fixtures for edge cases
- GitHub Actions annotation format errors

### Cross-Cutting Concerns

#### Impact Analysis (ALWAYS RUN)

- Does a skill format change affect the installer's manifest generation?
- Does a CLI change affect existing installed projects (`~/.claude/skills/`)?
- Does a validator rule change cause existing skills to fail?
- Does a docs change affect llms.txt generation?

#### Backward Compatibility

- Can users with existing `~/.claude/skills/` installations update cleanly?
- Are module.yaml config variables backward-compatible?
- Do renamed/removed skills have migration paths?

#### Non-regression

- All existing tests pass? (`npm test`)
- Quality gate passes? (`npm run quality`)
- Skill validation passes for all skills? (`npm run validate:skills`)
- File references valid? (`npm run validate:refs`)

## Tracker Patterns

### Tracker Type

File-based (`sprint-status.yaml`). No external tracker service.

### Concept Mapping

| BMAD Concept | File-Based Equivalent |
|---|---|
| Epic | `epic-{N}` entry in sprint-status.yaml |
| Story | `{epic_num}-{story_num}-{kebab-title}` entry in sprint-status.yaml |
| Story File | `{story_key}.md` in implementation-artifacts/ |
| Sprint | All entries in sprint-status.yaml (single sprint at a time) |
| Retrospective | `epic-{N}-retrospective` entry in sprint-status.yaml |
| Document | Markdown files in planning-artifacts/ |

### File Structure

#### sprint-status.yaml

Location: `_bmad-output/implementation-artifacts/sprint-status.yaml`

```yaml
generated: 2026-03-22
last_updated: 2026-03-22
project: BMAD-METHOD
project_key: BMAD
tracking_system: file-system
story_location: _bmad-output/implementation-artifacts

development_status:
  epic-1: backlog
  1-1-story-slug: backlog
  1-2-another-story: backlog
  epic-1-retrospective: optional
  epic-2: backlog
  # ...
```

### State Machines

**Epic states:** `backlog` → `in-progress` → `done`

**Story states:** `backlog` → `ready-for-dev` → `in-progress` → `review` → `done`

**Retrospective states:** `optional` → `done`

### Auto-Detection Rules

- Story file exists at `{story_location}/{story_key}.md` → auto-upgrade to `ready-for-dev`
- Never downgrade a status
- Epic auto-upgrades to `in-progress` when first story is created

### Story Key Format

From epic definition `Story 1.2: User Authentication`:
1. Replace period with dash: `1-2`
2. Convert title to kebab-case: `user-authentication`
3. Final key: `1-2-user-authentication`

### Story Discovery

Always read sprint-status.yaml **top-to-bottom**. The first entry matching `{N}-{N}-{slug}` with status `backlog` is the next story to work on.

### Epic File Location

Planning artifacts: `_bmad-output/planning-artifacts/`

Supported formats:
- Single file: `epics.md`, `bmm-epics.md`, or any `*epic*.md`
- Sharded: `epics/index.md` + `epics/epic-{N}.md`

### CRUD Operations

| Operation | Method |
|---|---|
| Read sprint status | Read `_bmad-output/implementation-artifacts/sprint-status.yaml` |
| Update story status | Edit the YAML value for the story key |
| Create story file | Write `_bmad-output/implementation-artifacts/{story_key}.md` |
| Read epic definitions | Read `_bmad-output/planning-artifacts/epics.md` |
| Create retrospective | Write `_bmad-output/implementation-artifacts/epic-{N}-retro-{date}.md` |

### Tracker HALT Policy

No external dependencies — file-based tracker is always available. HALT only if sprint-status.yaml is malformed YAML.

## Communication Platform

No team communication platform configured for this project. Workflows skip comm-related steps.
