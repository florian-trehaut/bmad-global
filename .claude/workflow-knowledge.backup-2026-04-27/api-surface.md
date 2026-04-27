---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: fc0f0bba
---

# API Surface — Knowledge

## API Style

CLI commands (not REST/GraphQL). BMAD-METHOD exposes a Node.js CLI tool and a set of validation scripts.

## CLI Commands

### bmad install

Interactive installation of BMAD skills into a project.

```bash
npx @florian-trehaut/bmad-global install
bmad-global install              # if globally installed
```

| Option | Description |
|---|---|
| `-f, --force` | Overwrite existing installation without confirmation |
| `-d, --debug` | Enable debug output |

**Flow:** Select modules → configure variables → create directories → copy skills to `~/.claude/skills/` → write config files.

### bmad status

Display BMAD installation status and module versions.

```bash
bmad-global status
```

No options. Shows installed modules, skill count, version.

### bmad uninstall

Remove BMAD global installation.

```bash
bmad-global uninstall
```

| Option | Description |
|---|---|
| `-f, --force` | Remove without confirmation |
| `-d, --debug` | Enable debug output |

## Validation Scripts

### validate-skills

Validates skill structure against 27 rules (14 deterministic + 13 inference).

```bash
node tools/validate-skills.js [path] [--strict] [--json]
```

| Option | Description |
|---|---|
| `[path]` | Specific skill directory to validate (default: all skills) |
| `--strict` | Exit 1 on any HIGH+ severity finding |
| `--json` | Output findings as JSON (for CI integration) |

**Rule categories:** SKILL (7), WF (3), PATH (5), STEP (7), REF (3), SEQ (2)

**Severity levels:** CRITICAL > HIGH > MEDIUM > LOW

**CI integration:** Supports GitHub Actions annotations format.

### validate-file-refs

Validates cross-file references in source files.

```bash
node tools/validate-file-refs.js [--strict] [--verbose]
```

**Checks:**
- `{project-root}/_bmad/` references resolve to real `src/` files
- `{_bmad}/` shorthand references resolve
- Relative paths (`./file.md`, `../data/file.csv`) point to existing files
- `exec="..."` and `<invoke-task>` targets exist
- Step metadata (`thisStepFile`, `nextStepFile`, `continueStepFile`, `skipToStepFile`, `altStepFile`, `workflowFile`) references are valid
- `Load: \`./file.md\`` directives target existing files
- No absolute paths (`/Users/`, `/home/`, `C:\`) leak into source

### build-docs

Builds documentation site and generates LLM-friendly text output.

```bash
node tools/build-docs.mjs
```

**Outputs:**
- `build/site/` — Astro Starlight deployable static site
- `build/artifacts/llms.txt` — LLM-friendly summary
- `build/artifacts/llms-full.txt` — Full consolidated docs (max 600k chars / ~150k tokens)

**Excludes from LLM output:** changelog, ide-info, upgrade guides, FAQ, glossary, game-dev, files/dirs starting with `_`.

## Schemas

### module.yaml

```yaml
code: string                    # Module identifier (e.g., "bmm", "core")
name: string                    # Display name
description: string             # Optional
default_selected: boolean       # Pre-selected during install (optional)
header: string                  # CLI header text (optional, core only)
subheader: string               # CLI subheader with \n support (optional)

<variable_name>:                # User-configurable variable
  prompt: string | string[]     # Question(s) shown during install
  default: string               # Default value (supports interpolation)
  result: string                # Output format (supports {value}, {project-root})
  single-select:                # Optional selection UI
    - value: string
      label: string

directories:                    # Directories to create during install
  - string                      # Supports variable interpolation
```

**Interpolation variables:** `{value}`, `{project-root}`, `{directory_name}`, `{output_folder}`, and references to other module variables.

### SKILL.md Frontmatter

```yaml
---
name: string        # Required. Must match directory name. Pattern: bmad-[a-z0-9-]+
description: string # Required. Max 1024 chars. Must contain "Use when" or "Use if".
---
```

**Body:** For workflow skills: typically `Follow the instructions in ./workflow.md.` For agent skills: full persona definition (identity, communication style, principles, critical actions, capabilities table, activation protocol).

### Step File Format

**Filename:** `step-NN[a-z]-description.md` (zero-padded, 2-10 per skill)

**Frontmatter:** Must NOT have `name` or `description`. May have navigation metadata (`nextStepFile`, `altStepFile`, etc.).

**Body:** Free-form markdown with goal section, mandatory sequence, and success/failure metrics.

## Phase-Skill Map

| Phase | Skills |
|---|---|
| 1-analysis | Brainstorm, Market Research, Domain Research, Technical Research, Create Brief |
| 2-plan-workflows | Create PRD, Quick Spec, Validate PRD, Edit PRD, Create UX, + agent personas |
| 3-solutioning | Create Architecture, Create Epics and Stories, Check Implementation Readiness, ADR Review |
| 4-implementation | Sprint Planning, Create Story, Dev Story, Sprint Status, Code Review, QA, Review Story, Troubleshoot, Validation Metier, Retrospective, + more |
| core | Knowledge Bootstrap, Create Skill, Help, Brainstorming, Distillator, Builder Setup, + more |

## Error Handling

- CLI uses `@clack/prompts` cancel handling for user interrupts
- Validators report findings with file:line references and severity levels
- Missing required config causes HALT (not silent default)
- `--strict` mode converts HIGH+ findings to process exit code 1

## Versioning

Semantic versioning (semver). Current: `6.3.0`. Single source of truth: `package.json`.

Two distribution channels: `next` (prerelease) and `latest` (stable).
