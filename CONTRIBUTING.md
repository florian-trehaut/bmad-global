# Contributing

This is a personal fork of [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD). It is not actively seeking external contributions.

## For upstream contributions

If you want to contribute to the BMad Method project, please contribute directly to the [upstream repository](https://github.com/bmad-code-org/BMAD-METHOD). See their [contributing guide](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/CONTRIBUTING.md).

## For this fork

This fork is maintained by [@florian-trehaut](https://github.com/florian-trehaut) for personal professional use. If you have suggestions or found a bug specific to this fork's extensions:

1. Open an issue on [this repository](https://github.com/florian-trehaut/bmad-global/issues)
2. Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
3. Run `npm test` before pushing — pre-commit hooks enforce this

## Development conventions

- All skills use step-file architecture (< 200 lines per step)
- Config via `.claude/workflow-context.md`, not `_bmad/` paths
- Skills reference `~/.claude/skills/bmad-shared/` for shared files
- Upstream sync via `bmad-upstream-sync` skill

## License

By contributing, your contributions are licensed under the same MIT License as the project.
