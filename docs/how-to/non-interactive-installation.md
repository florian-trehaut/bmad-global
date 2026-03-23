---
title: Non-Interactive Installation
description: Install BMad using command-line flags for CI/CD pipelines and automated deployments
sidebar:
  order: 2
---

Use command-line flags to install BMad non-interactively. This is useful for:

## When to Use This

- Automated deployments and CI/CD pipelines
- Scripted installations
- Quick installations with known configurations

:::note[Prerequisites]
Requires [Node.js](https://nodejs.org) v20+ and `npx` (included with npm).
:::

## Available Flags

| Flag | Description |
|------|-------------|
| `--force` | Overwrite existing installation |
| `--debug` | Enable debug output during installation |

## Installation

BMad installs globally to `~/.claude/skills/bmad/` with zero prompts:

```bash
bmad install
```

Or with flags:

```bash
bmad install --force --debug
```

If you haven't installed the package globally, use npx:

```bash
npx bmad-method install --force
```

## Examples

### CI/CD Pipeline Installation

```bash
#!/bin/bash
# install-bmad.sh

npm install -g bmad-method
bmad install --force
```

### Update Existing Installation

```bash
bmad install --force
```

## What You Get

- A fully configured `~/.claude/skills/bmad/` directory with agents, workflows, and modules
- A `~/.claude/skills/bmad/manifest.yaml` tracking the installation
- A project-local `_bmad-output/` folder for generated artifacts (unchanged)

## Uninstallation

To remove BMad entirely:

```bash
bmad uninstall
```

To skip confirmation:

```bash
bmad uninstall --force
```

This removes `~/.claude/skills/bmad/` entirely.

:::tip[Best Practices]
- Use `--force` for truly unattended installations
- Use `--debug` if you encounter issues during installation
:::

## Troubleshooting

### Installation fails

- Ensure you have write permissions to `~/.claude/skills/bmad/`
- Run with `--debug` for detailed output

:::note[Still stuck?]
Run with `--debug` for detailed output, or report at <https://github.com/bmad-code-org/BMAD-METHOD/issues>.
:::
