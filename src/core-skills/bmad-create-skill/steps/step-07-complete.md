# Step 7: Complete

## STEP GOAL

Present the final skill structure, provide usage guidance, and close the workflow.

## SEQUENCE

### 1. Present the final structure

Show the complete file tree:

```
{TARGET_DIR}/
├── SKILL.md
├── workflow.md
├── steps/
│   ├── step-01-{name}.md
│   ├── step-02-{name}.md
│   └── ...
├── data/                          # if present
│   └── ...
├── templates/                     # if present
│   └── ...
└── subagent-workflows/            # if present
    └── ...
```

With line counts for each file.

### 2. Show invocation examples

"To invoke this skill, use any of these trigger phrases:"

List the trigger phrases from the SKILL.md description, showing both slash-command and natural language:

```
/bmad-{SKILL_NAME}
"{trigger phrase 1}"
"{trigger phrase 2}"
...
```

### 3. Scope-specific guidance

**If global skill:**
"This skill is installed at `~/.claude/skills/bmad-{SKILL_NAME}/` and is already active. It will appear in the skill list for all projects."

**If project skill:**
"This skill is at `{MAIN_PROJECT_ROOT}/.claude/skills/bmad-{SKILL_NAME}/`. To make it available:
1. It is already active for this project
2. Commit the `{MAIN_PROJECT_ROOT}/.claude/skills/bmad-{SKILL_NAME}/` directory to version control for team access"

### 4. Dependency reminders

**If the skill needs workflow-context.md:**
"This skill requires `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` in the project root. If the project is not yet initialized, run `/bmad-knowledge-bootstrap` first."

**If the skill needs specific workflow-knowledge files:**
"This skill loads the following knowledge files JIT:
{list files}
Ensure these exist in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` (created by `/bmad-knowledge-bootstrap`)."

### 5. Suggest validation

"Run `/bmad-validate-skill` on this skill for a deeper convention audit."

### 6. Summary

```
Skill bmad-{SKILL_NAME} created successfully.

  Files:       {total_count}
  Steps:       {step_count}
  Data files:  {data_count}
  Validation:  ALL PASSED

Location: {TARGET_DIR}
```

---

## END OF WORKFLOW

The bmad-create-skill workflow is complete.
