![BMad Method](banner-bmad-method.png)

# bmad-global — Personal BMad Fork

[![Upstream](https://img.shields.io/badge/upstream-bmad--code--org%2FBMAD--METHOD-blue)](https://github.com/bmad-code-org/BMAD-METHOD)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)

Personal fork of [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) with opinionated extensions for daily professional use.

## What this fork adds

This fork extends the upstream BMad Method with:

- **Global flat install** — Skills install to `~/.claude/skills/{skill-name}/` for Claude Code discovery, with auto git commit/push
- **Agent Teams infrastructure** — Shared schemas, protocols, and conventions for Claude Code Agent Teams (`bmad-shared/`)
- **Knowledge Bootstrap** — Automated workflow-knowledge file generation (`bmad-knowledge-bootstrap`)
- **Daily Planning** — Personal daily planning workflow with velocity tracking (`bmad-daily-planning`)
- **TEA suite** — Test Engineering & Automation skills (ATDD, automation, CI, framework, test review, traceability)
- **Desktop validation** — Business validation gate for desktop applications (`bmad-validation-desktop`)
- **Workflow improvements** — "Investigate first, ask second" for troubleshooting, anti-rationalization rule for code review
- **Path corrections** — All skill paths updated for global flat install (no more `_bmad/core/` dead refs)
- **Upstream sync skill** — `bmad-upstream-sync` for merging upstream changes with guided conflict resolution

## Quick Start

```bash
# Clone this fork
git clone https://github.com/florian-trehaut/bmad-global.git
cd bmad-global

# Install dependencies
npm ci

# Install skills globally (flat layout to ~/.claude/skills/)
npx bmad install --force
```

After install, open any project in Claude Code — all `bmad-*` skills are available globally.

## Upstream Sync

This fork tracks `bmad-code-org/BMAD-METHOD` as `upstream`. To merge upstream changes:

```
bmad-upstream-sync
```

This runs the upstream sync skill which fetches, analyzes divergence, resolves conflicts guided by our conventions, and produces a clean merge commit.

## Project Structure

```
src/
  core-skills/          # Framework skills (shared, init, help, builders)
  bmm-skills/           # BMad Method skills by category
    1-analysis/         # Research, documentation, product briefs
    2-plan-workflows/   # PRD, UX, specs, validation
    3-solutioning/      # Architecture, epics, readiness checks
    4-implementation/   # Dev, review, test, troubleshoot, sprint
tools/cli/              # Installer and CLI
test/                   # Test suites
docs/                   # Documentation site (Starlight)
```

## Key Differences from Upstream

| Aspect | Upstream | This fork |
|--------|----------|-----------|
| Install target | `_bmad/` in project | `~/.claude/skills/` global |
| Skill layout | Nested `_bmad/core/`, `_bmad/bmm/` | Flat `~/.claude/skills/bmad-*/` |
| Config loading | `_bmad/bmm/config.yaml` | `.claude/workflow-context.md` |
| Shared files path | `{project-root}/_bmad/core/bmad-shared/` | `~/.claude/skills/bmad-shared/` |
| Agent Teams | Not supported | Schemas + protocols in bmad-shared |
| Issue tracker | GitHub Issues | Linear (via MCP) |

## Development

```bash
npm test          # Run all checks (refs, install, lint, format)
npm run lint      # ESLint
npm run lint:md   # Markdownlint (781+ files)
npm run format    # Prettier check
```

## Upstream

- [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) — Original project
- [BMad Docs](https://docs.bmad-method.org) — Official documentation
- [Discord](https://discord.gg/gk8jAdXWmj) — Community

## License

MIT License — see [LICENSE](LICENSE).

**BMad** and **BMAD-METHOD** are trademarks of BMad Code, LLC. See [TRADEMARK.md](TRADEMARK.md).
