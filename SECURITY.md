# Security Policy

## This fork

For security issues specific to this fork's extensions, open a private issue or contact [@florian-trehaut](https://github.com/florian-trehaut) directly.

## Upstream

For security issues in the core BMad Method framework, report to the [upstream repository](https://github.com/bmad-code-org/BMAD-METHOD/security/advisories/new). Do not report upstream vulnerabilities here.

## Scope

This fork adds skills (Markdown workflow files) and a Node.js installer. The attack surface is limited to:

- **Installer** (`tools/cli/`) — file copy operations to `~/.claude/skills/`
- **Skills** — Markdown files interpreted by Claude Code at runtime
- **Git operations** — auto commit/push after install (if `~/.claude` is a git repo)

## Best Practices

- Review AI-generated code before executing
- Keep Node.js and Claude Code updated
- Review skill changes after upstream sync (`bmad-upstream-sync`)
