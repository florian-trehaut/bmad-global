# workflow.md Template

Use this template when generating the workflow.md file for a new bmad-* skill. Choose the appropriate INITIALIZATION variant based on whether the skill is project-dependent or standalone.

---

## Template

````markdown
# {SKILL_DISPLAY_NAME} — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

{INITIALIZATION_VARIANT}

---

## YOUR ROLE

You are {ROLE_DESCRIPTION}.

{ROLE_DETAILS — 3-5 bullet points about what you do.}

**Tone:** {TONE_DESCRIPTION}

**Communication language:** use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all outputs.

---

## CRITICAL RULES

- **NEVER stop for "milestones" or "session boundaries"** — continue until COMPLETE or HALT
- Execute ALL steps in exact order — NO skipping
{ADDITIONAL_RULES — skill-specific rules, one per bullet}

---

## STEP SEQUENCE

| Step | File | Goal |
| ---- | ---- | ---- |
{STEP_TABLE — one row per step}

## ENTRY POINT

Load and execute `./steps/{FIRST_STEP_FILE}`.

## HALT CONDITIONS (GLOBAL)

These apply at ANY step:

{HALT_CONDITIONS — one per bullet}

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `{project-root}/_bmad/core/bmad-shared/retrospective-step.md`.

This shared step reviews the execution for friction points and proposes improvements to either:
- The global skill (workflow steps, data files)
- The project knowledge (`.claude/workflow-knowledge/`)
- The project context (`.claude/workflow-context.md`)

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
````

---

## INITIALIZATION Variants

### Variant A: Project-Dependent (needs workflow-context.md)

```markdown
### 1. Load project context

Read `.claude/workflow-context.md` from the project root (the git repository root).

**HALT if not found:** "No `.claude/workflow-context.md` found at project root. This file is required for all bmad-* workflows. Create it following the bmad-shared documentation."

Extract the following from the YAML frontmatter:

| Variable | Key | Example |
|----------|-----|---------|
{VARIABLE_TABLE — only variables this skill actually needs}

### 2. Load shared rules

Read all files in `{project-root}/_bmad/core/bmad-shared/`.

Apply these rules for the entire workflow execution. Key rule for this workflow: **{KEY_RULE_SUMMARY}.**

### 3. Load {knowledge_name} (optional)

If `.claude/workflow-knowledge/{filename}.md` exists at project root, read it. {PURPOSE}.

### 4. Set defaults

{DEFAULT_VARIABLES — initial values for workflow state}
```

### Variant B: Standalone / Meta-Skill (no workflow-context.md)

```markdown
This is a **{TYPE}-skill** — {REASON_NO_CONTEXT_NEEDED}.

### 1. {First initialization step}

{What to load — data files, templates, etc.}

### 2. {Second initialization step}

{Additional setup.}

### 3. Set defaults

{DEFAULT_VARIABLES}
```

---

## Placeholders Reference

| Placeholder | Description |
|-------------|-------------|
| `{SKILL_DISPLAY_NAME}` | Human-readable name (e.g., "Dev Story", "Validation Metier") |
| `{INITIALIZATION_VARIANT}` | Variant A or B content |
| `{ROLE_DESCRIPTION}` | One-sentence role (e.g., "an exacting Product Owner agent") |
| `{ROLE_DETAILS}` | Bullet points expanding the role |
| `{TONE_DESCRIPTION}` | Tone guidance (e.g., "factual, direct, no leniency") |
| `{ADDITIONAL_RULES}` | Skill-specific critical rules |
| `{STEP_TABLE}` | Step sequence table rows |
| `{FIRST_STEP_FILE}` | Filename of step 01 |
| `{HALT_CONDITIONS}` | Global halt condition bullets |
| `{VARIABLE_TABLE}` | workflow-context.md variables needed |
| `{KEY_RULE_SUMMARY}` | One-sentence key rule from no-fallback |
