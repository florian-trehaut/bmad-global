# Step 1: Discover Requirements

## STEP GOAL

Understand what the user wants the new skill to do through open-ended conversation. Capture the purpose, triggers, interaction model, and dependencies.

## RULES

- Ask open-ended questions — do not assume
- Detect the user's language and match it
- Do NOT start designing yet — this step is purely about understanding
- Summarize understanding at the end and get explicit confirmation

## SEQUENCE

### 1. Ask about purpose

"What should this skill do? Describe the workflow it automates — from trigger to completion."

Probe for:
- **What problem does it solve?** (manual process, repetitive task, quality gate, etc.)
- **Who uses it?** (developer, reviewer, PM, automated)
- **What is the input?** (issue ID, branch name, file path, freeform text, nothing)
- **What is the output?** (files created, status updated, report generated, code changes)
- **What are the main steps?** (rough sequence, even if not detailed yet)

### 2. Ask about interaction model

"How interactive should this be?"

Options:
- **Fully automated** — runs start to finish, HALTs only on errors
- **Interactive** — checkpoints at key decisions, user confirms before proceeding
- **Mixed** — some steps auto, some require input (most common)

### 3. Ask about dependencies

"Does this skill need access to any of these?"

| Dependency | Question |
|------------|----------|
| Project context | Does it need `.claude/workflow-context.md`? (i.e., does it use tracker, forge, build commands, etc.) |
| Project knowledge | Does it need `.claude/workflow-knowledge/` files? (stack info, environment config, etc.) |
| External tools | Does it call CLI tools, MCP servers, APIs? |
| Subagents | Are there steps that benefit from parallel execution via subagents? |
| Shared rules | Does `no-fallback-no-false-data.md` apply? (usually yes if the skill touches code or data) |

### 4. Ask about trigger phrases

"What phrases should invoke this skill? List variations — English and other languages if relevant."

Examples from existing skills:
- bmad-dev-story: 'dev story', 'implement story', 'start development', 'lance le dev'
- bmad-validation-metier: 'validation metier', 'validate ticket', 'tester en staging', 'VM'
- bmad-init: 'init bmad', 'setup workflows', 'bmad init'

### 5. Compile design brief

Assemble the answers into a mental design brief:

```
## Design Brief

**Purpose:** {one paragraph}
**Trigger phrases:** {list}
**Input:** {what the skill receives}
**Output:** {what the skill produces}
**Interaction model:** {automated / interactive / mixed}
**Dependencies:**
  - workflow-context.md: {yes/no}
  - workflow-knowledge/: {list of files or "none"}
  - External tools: {list or "none"}
  - Subagents: {yes/no — if yes, for what}
  - Shared rules: {yes/no}
**Rough step sequence:** {numbered list}
```

### 6. CHECKPOINT

Present the design brief to the user:

"Here is my understanding of the skill you want to build:"

{display the design brief}

"Is this accurate? Any corrections or additions?"

WAIT for user confirmation. Apply any corrections before proceeding.

---

**Next:** Read fully and follow `./steps/step-02-classify.md`
