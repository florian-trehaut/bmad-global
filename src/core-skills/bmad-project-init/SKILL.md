---
name: bmad-project-init
description: "Initialize BMAD project configuration. Creates workflow-context.md from project detection — greenfield-safe (no codebase required). Use when 'bmad init', 'initialize project', 'setup bmad', 'configure project', 'init bmad', 'setup workflows', 'project init', 'init context', 'workflow context' is mentioned."
disable-model-invocation: true
---

# Project Init

## Overview

Initialize project configuration for BMAD workflows. Creates `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` with project identity, tracker, forge, and tooling configuration. **Greenfield-safe**: requires only a git repository, no codebase to scan.

For knowledge file generation (workflow-knowledge/*.md derived from planning artifacts and/or code), run `/bmad-knowledge-bootstrap` after this skill.

## Conventions

- Bare paths (e.g. `steps/step-01-preflight.md`) resolve from the skill root.
- `{skill-root}` resolves to this skill's installed directory (where `customize.toml` lives).
- `{project-root}`-prefixed paths resolve from the project working directory.
- `{skill-name}` resolves to the skill directory's basename.

## On Activation

### Step 1: Resolve the Workflow Block

Run: `python3 ~/.claude/skills/bmad-shared/scripts/resolve_customization.py --skill {skill-root} --key workflow`

**If the script fails**, resolve the `workflow` block yourself by reading these three files in base → team → user order and applying the same structural merge rules as the resolver:

1. `{skill-root}/customize.toml` — defaults
2. `{project-root}/_bmad/custom/{skill-name}.toml` — team overrides
3. `{project-root}/_bmad/custom/{skill-name}.user.toml` — personal overrides

Any missing file is skipped. Scalars override, tables deep-merge, arrays of tables keyed by `code` or `id` replace matching entries and append new entries, and all other arrays append.

### Step 2: Execute Prepend Steps

Execute each entry in `{workflow.activation_steps_prepend}` in order before proceeding.

### Step 3: Load Persistent Facts

Treat every entry in `{workflow.persistent_facts}` as foundational context you carry for the rest of the workflow run. Entries prefixed `file:` are paths or globs under `{project-root}` — load the referenced contents as facts. All other entries are facts verbatim.

### Step 4: Load Project Workflow Context (if exists)

Resolve the main project root (worktree-aware): run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")`.

If `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` exists, load it and resolve from its YAML frontmatter:
- Use `{user_name}` for greeting
- Use `{communication_language}` for all communications

If `workflow-context.md` is missing, that's expected — this skill creates it. Ask the user for their name and preferred language during the workflow.

### Step 5: Greet the User

Greet `{user_name}` (or ask if absent), speaking in `{communication_language}` (or ask if absent). Be warm but efficient.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

---

**Activation complete.** Read fully and follow `./workflow.md` for the step-by-step workflow.
