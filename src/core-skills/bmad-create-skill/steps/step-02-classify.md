# Step 2: Classify and Structure

## STEP GOAL

Make the key structural decisions that determine the skill's file layout, dependency model, and naming.

## RULES

- All decisions must be grounded in the design brief from step 1
- Refer to `./data/skill-conventions.md` for naming and structure rules
- If any decision is ambiguous, ask — do not guess

## SEQUENCE

### 1. Determine scope

Based on the design brief:

**Global** (`~/.claude/skills/bmad-{name}/`) if:
- The skill is project-agnostic (works across any project)
- It uses `workflow-context.md` for project-specific values (standard pattern)
- Other bmad-* skills in the ecosystem are global

**Project** (`{MAIN_PROJECT_ROOT}/.claude/skills/bmad-{name}/`) if:
- The skill is deeply specific to one project (e.g., references custom domain logic)
- It cannot be generalized via workflow-context.md variables

Default: **Global** (most skills should be global with project-specific values from workflow-context.md).

### 2. Determine dependency model

| Decision | Options |
|----------|---------|
| **Needs `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`?** | YES = project-dependent (load at init, HALT if missing) / NO = standalone meta-skill |
| **Which variables?** | List exact keys needed from workflow-context.md YAML frontmatter |
| **Needs `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`?** | List which files and which step loads them (JIT) |
| **Needs no-fallback-no-false-data?** | YES if the skill touches code, data, or makes assertions about correctness |

### 3. Estimate step count

Based on the rough sequence from step 1, refine into concrete steps:

**Guidelines:**
- Aim for **5-10 steps** (fewer = too coarse, more = too granular)
- Each step should have a **single clear goal** that fits in one sentence
- Interactive checkpoints count as part of their step, not separate steps
- Data loading / context gathering can be combined into one step
- Validation and completion should be separate steps

Map each rough step to: `step-XX-{name}.md`

### 4. Determine data files

Does the skill need reference data?

| Data type | When needed | Example |
|-----------|-------------|---------|
| Classification rules | When the skill categorizes inputs | `vm-classification-rules.md` |
| Templates | When the skill generates structured output | `tracker-comment-template.md` |
| Detection patterns | When the skill auto-detects configuration | `detection-patterns.md` |
| Reference tables | When the skill looks up values | `proof-standards.md` |

List each data file with: name, purpose, which step loads it.

### 5. Determine subagent workflows

Subagents are appropriate when:
- A step involves **parallel independent work** (e.g., reviewing N files simultaneously)
- A step produces **large context** that should not pollute the main conversation
- The skill orchestrates **multiple agents** for different perspectives

If subagents are needed: list each with name, purpose, which step invokes it.

Most skills do NOT need subagents — only add them if the design brief explicitly calls for parallelism.

### 6. Choose the name

Format: `bmad-{name}`

Rules:
- Lowercase, hyphenated
- Descriptive but concise (2-3 words max)
- Must not conflict with existing skills

Check existing skills:
```bash
ls ~/.claude/skills/bmad-*/SKILL.md 2>/dev/null
ls {MAIN_PROJECT_ROOT}/.claude/skills/bmad-*/SKILL.md 2>/dev/null
```

Propose the name and verify no conflict.

### 7. Compute target directory

Based on scope and name:
- Global: `~/.claude/skills/bmad-{name}/`
- Project: `{MAIN_PROJECT_ROOT}/.claude/skills/bmad-{name}/`

Check if the directory already exists. If it does: HALT and ask whether to overwrite, rename, or abort.

### 8. CHECKPOINT

Present all classification decisions:

```
## Classification

**Name:**          bmad-{name}
**Scope:**         {global / project}
**Target:**        {target_directory}
**Dependencies:**
  - {MAIN_PROJECT_ROOT}/.claude/workflow-context.md: {yes/no}
    Variables: {list or "N/A"}
  - {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/: {list of files or "none"}
  - no-fallback-no-false-data: {yes/no}
**Steps:**         {count} steps
  {numbered list: step-XX-name — goal}
**Data files:**    {count or "none"}
  {list: filename — purpose}
**Subagents:**     {count or "none"}
  {list: name — purpose}
**Templates:**     {count or "none"}
  {list: filename — purpose}
```

"Does this structure look right? Any changes?"

WAIT for user confirmation. Apply corrections.

---

**Next:** Read fully and follow `./steps/step-03-design.md`
