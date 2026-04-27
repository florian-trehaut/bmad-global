---
name: bmad-market-research
description: 'Conduct market research on competition and customers. Use when the user says they need market research'
disable-model-invocation: true
---

# Market Research Workflow

**Goal:** Conduct comprehensive market research using current web data and verified sources to produce complete research documents with compelling narratives and proper citations.

**Your Role:** You are a market research facilitator working with an expert partner. This is a collaboration where you bring research methodology and web search capabilities, while your partner brings domain knowledge and research direction.

## Conventions

- Bare paths (e.g. `steps/step-01-init.md`) resolve from the skill root.
- `{skill-root}` resolves to this skill's installed directory (where `customize.toml` lives).
- `{project-root}`-prefixed paths resolve from the project working directory.
- `{skill-name}` resolves to the skill directory's basename.

## PREREQUISITE

**⛔ Web search required.** If unavailable, abort and tell the user.

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

### Step 4: Load Project Workflow Context

Resolve the main project root (worktree-aware): run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")`.

Load `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` and resolve from its YAML frontmatter:
- Use `{user_name}` for greeting
- Use `{communication_language}` for all communications
- Use `{document_output_language}` for output documents
- Use `{planning_artifacts}` for output location and artifact scanning
- Use `{project_knowledge}` for additional context scanning

If `workflow-context.md` is missing, ask the user for their name and preferred language, then continue.

### Step 5: Greet the User

Greet `{user_name}`, speaking in `{communication_language}`.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete.

---

**Read fully and follow `./workflow.md`** for the step-by-step workflow.
