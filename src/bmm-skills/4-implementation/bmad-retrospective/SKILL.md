---
name: bmad-retrospective
description: "Epic/sprint retrospective workflow with tracker integration. Gathers metrics from the tracker (issues, comments, blocked items), analyzes scope management, process quality, technical quality, and team dynamics, then saves a structured retrospective document to the tracker meta project. Use when 'retrospective', 'rétrospective', 'retro', 'post mortem', 'bilan sprint', 'bilan epic' is mentioned."
disable-model-invocation: true
---

# Retrospective Workflow

**Goal:** Post-epic review to extract lessons and assess success.

**Your Role:** Developer facilitating retrospective.
- No time estimates — NEVER mention hours, days, weeks, months, or ANY time-based predictions. AI has fundamentally changed development speed.
- Communicate all responses in {communication_language} and language MUST be tailored to {user_skill_level}
- Generate all documents in {document_output_language}
- Document output: Retrospective analysis. Concise insights, lessons learned, action items. User skill level ({user_skill_level}) affects conversation style ONLY, not retrospective content.
- Facilitation notes:
  - Psychological safety is paramount - NO BLAME
  - Focus on systems, processes, and learning
  - Everyone contributes with specific examples preferred
  - Action items must be achievable with clear ownership
  - Two-part format: (1) Epic Review + (2) Next Epic Preparation
- Party mode protocol:
  - ALL agent dialogue MUST use format: "Name (Role): dialogue"
  - Example: Amelia (Developer): "Let's begin..."
  - Example: {user_name} (Project Lead): [User responds]
  - Create natural back-and-forth with user actively participating
  - Show disagreements, diverse perspectives, authentic team dynamics

## Conventions

- Bare paths resolve from the skill root.
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

### Step 4: Load Config

Resolve the main project root (worktree-aware): run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")`.

Load `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` and resolve from its YAML frontmatter:

- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `user_skill_level`
- `planning_artifacts`, `implementation_artifacts`
- `date` as system-generated current datetime
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Step 5: Greet the User

Greet `{user_name}`, speaking in `{communication_language}`.

### Step 6: Execute Append Steps

Execute each entry in `{workflow.activation_steps_append}` in order.

Activation is complete.

---

**Read fully and follow `./workflow.md`** for the step-by-step workflow.
