# Step 4: Scaffold the Skill

## STEP GOAL

Create the directory structure, SKILL.md, and workflow.md for the new skill. These are the foundational files — step files come in step 5.

## RULES

- Use the templates from `./templates/` as starting points
- Customize templates with values from the design (steps 1-3)
- Verify against `./data/skill-conventions.md` after writing each file
- Do NOT create step files yet — only the skeleton

## SEQUENCE

### 1. Create directory structure

```bash
mkdir -p {TARGET_DIR}/{steps,data,templates,subagent-workflows}
```

Only create subdirectories that are needed (from the file list in step 3). Remove empty ones.

### 2. Write SKILL.md

Use `./templates/skill-md-template.md` as the base.

Customize:
- `name`: `bmad-{SKILL_NAME}` from step 2
- `description`: trigger phrases from step 1, purpose summary

Write to `{TARGET_DIR}/SKILL.md`.

Verify:
- YAML frontmatter has `name` and `description`
- Body is exactly: `Follow the instructions in ./workflow.md.`
- No trailing whitespace or extra content

### 3. Write workflow.md

Use `./templates/workflow-md-template.md` as the base.

Customize the **INITIALIZATION** section:

**If project-dependent** (needs workflow-context.md):
```markdown
### 1. Load project context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
{list only the variables this skill actually needs}
```

**If standalone/meta** (does not need `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`):
```markdown
This is a **{type}-skill** — {reason it doesn't need `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`}.

### 1. {First initialization step}
{what to load instead}
```

Customize the remaining sections:
- **YOUR ROLE**: Role description from design brief
- **CRITICAL RULES**: Skill-specific rules (not generic boilerplate)
- **STEP SEQUENCE**: Table from the design
- **ENTRY POINT**: Pointer to first step file
- **HALT CONDITIONS (GLOBAL)**: From the design

Write to `{TARGET_DIR}/workflow.md`.

Verify:
- Has all required sections: INITIALIZATION, YOUR ROLE, CRITICAL RULES, STEP SEQUENCE, ENTRY POINT
- HALT CONDITIONS section present (either in INITIALIZATION or separate)
- Step sequence table matches the design
- Entry point references the correct first step file
- No hardcoded project-specific values

### 4. RETROSPECTIVE section

Append the standard retrospective completion section from the workflow.md template. This is mandatory for all workflow skills (exception: read-only analysis skills). The section must reference `~/.claude/skills/bmad-shared/retrospective-step.md`.

### 5. Create placeholder data files

For each data file in the design, create a placeholder with a header and purpose comment:

```markdown
# {Title}

{One-line purpose description}

---

{Content will be written in step 5}
```

This prevents broken references when step files are built.

### 6. Present scaffold

Show the created file tree and the content of SKILL.md and workflow.md.

"Scaffold created. Here is what was written:"

{tree view}
{SKILL.md content}
{workflow.md content}

Proceed directly to step 5 (no checkpoint needed — the design was already approved).

---

**Next:** Read fully and follow `./steps/step-05-build-steps.md`
