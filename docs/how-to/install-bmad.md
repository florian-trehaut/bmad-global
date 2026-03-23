---
title: "How to Install BMad"
description: Step-by-step guide to installing BMad in your project
sidebar:
  order: 1
---

Use the `bmad install` command to set up BMad globally on your machine.

## When to Use This

- Setting up BMad for the first time
- Updating an existing BMad installation

:::note[Prerequisites]
- **Node.js** 20+ (required for the installer)
- **AI tool** (Claude Code, Cursor, or similar)
:::

## Steps

### 1. Install the Package

```bash
npm install -g bmad-method
```

Or run directly without installing globally:

```bash
npx bmad-method install
```

### 2. Run the Installer

```bash
bmad install
```

The installer runs with zero prompts and installs all BMad skills globally to `~/.claude/skills/bmad/`.

To force a fresh install (overwriting existing files):

```bash
bmad install --force
```

To see detailed output during installation:

```bash
bmad install --debug
```

## What You Get

```text
~/.claude/skills/bmad/
├── bmm/            # BMad Method module
│   └── config.yaml # Module settings
├── core/           # Required core module
├── manifest.yaml   # Installation manifest
└── ...

your-project/
└── _bmad-output/       # Generated artifacts (project-local)
```

## Verify Installation

Run `bmad-help` to verify everything works and see what to do next.

**BMad-Help is your intelligent guide** that will:
- Confirm your installation is working
- Show what's available based on your installed modules
- Recommend your first step

You can also ask it questions:
```
bmad-help I just installed, what should I do first?
bmad-help What are my options for a SaaS project?
```

## Troubleshooting

**Installer throws an error** — Copy-paste the output into your AI assistant and let it figure it out.

**Installer worked but something doesn't work later** — Your AI needs BMad context to help. See [How to Get Answers About BMad](./get-answers-about-bmad.md) for how to point your AI at the right sources.
