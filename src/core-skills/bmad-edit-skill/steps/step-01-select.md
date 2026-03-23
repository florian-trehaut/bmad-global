# Step 1: Select Skill to Edit

## STEP GOAL

Identify which bmad-* skill the user wants to edit, load its entire structure, and present a current overview.

## RULES

- Scan BOTH global (`~/.claude/skills/bmad-*/`) and project (`.claude/skills/bmad-*/`) locations
- NEVER modify any file in this step — read-only discovery
- Present enough context for the user to confirm the right skill
- Load the ENTIRE skill structure before proceeding

## SEQUENCE

### 1. List all bmad-* skills

Scan both locations:

**Global:** `~/.claude/skills/bmad-*/`
**Project:** `.claude/skills/bmad-*/` (from the git repository root)

For each skill found, read `SKILL.md` and extract:
- `name` from frontmatter
- `description` from frontmatter
- Location (global / project)

Count the files in each skill directory (steps, data, subagent-workflows, etc.).

### 2. Present the skill list

```
## Available bmad-* skills

| #   | Name                    | Location | Files | Description                     |
| --- | ----------------------- | -------- | ----- | ------------------------------- |
| 1   | bmad-dev-story          | global   | 18    | Automated story implementation  |
| 2   | bmad-validation-metier  | global   | 12    | Production validation gate      |
| ... | ...                     | ...      | ...   | ...                             |

Which skill do you want to edit?
```

**If the user already specified a skill name** — skip the list, go directly to step 3.

WAIT for user selection.

### 3. Load the entire skill

Store `TARGET_SKILL = {name, location, base_path}`.

Read ALL files in the skill:
- `SKILL.md`
- `workflow.md`
- All files in `steps/` (or root-level step files for older structure)
- All files in `data/` (if exists)
- All files in `subagent-workflows/` (if exists)
- All files in `templates/` (if exists)

### 4. Legacy Format Detection

After loading the skill, check for legacy BMAD patterns:

1. Does the skill contain a `workflow.yaml` file? → LEGACY
2. Does it contain an `instructions.xml` file? → LEGACY
3. Grep all files for `{installed_path}` → LEGACY
4. Grep all files for `_bmad/core/tasks/workflow.xml` → LEGACY
5. Does it use `disable-model-invocation` in any file? → LEGACY

**If ANY legacy pattern detected:**

Present warning:
> This skill uses legacy BMAD format (pre-6.2.0). The following legacy patterns were found:
> {list of patterns found}
>
> **Recommendation:** Run `/bmad-create-skill` to rebuild this skill from scratch using current conventions. Editing a legacy skill risks producing an inconsistent hybrid.
>
> **[R] Rebuild** (recommended) — Invoke bmad-create-skill
> **[C] Continue anyway** — Edit the legacy skill as-is
> **[Q] Quit**

HALT and wait for user choice. If Rebuild, invoke the `bmad-create-skill` skill.

### 5. Present current structure

```
## Skill: {name}

**Location:** {base_path}
**Description:** {description}

### Structure
- SKILL.md
- workflow.md
- steps/
  - step-01-discover.md (45 lines)
  - step-02-load-issue.md (32 lines)
  - ...
- data/
  - some-data.md (20 lines)
- subagent-workflows/
  - self-review.md (80 lines)

### Workflow overview
- Steps: {count}
- Data files: {count}
- Subagent workflows: {count}
- Step sequence: step-01 -> step-02 -> ... -> step-{N}
```

### 6. Proceed

Load and execute `./steps/step-02-understand.md`.
