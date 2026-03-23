# Workflow Retrospective — Shared Step

**Loaded by:** Every bmad-* workflow as its FINAL step, after the main workflow logic completes.

**Goal:** Detect execution difficulties and propose improvements to the workflow itself, the project knowledge, or the project context.

---

## TRIGGER

This step activates ONLY if at least one of the following occurred during the workflow execution:

1. **HALT was triggered** at any point (and later resolved)
2. **User corrected** the workflow's behavior or output
3. **Unexpected data** was encountered (missing fields, unknown formats, edge cases)
4. **A workaround** was needed (manual step, alternate tool, retry)
5. **The user expressed frustration** or asked to skip/change approach
6. **A knowledge gap** was hit (workflow didn't know about a project-specific pattern)

If NONE of these occurred → skip this step entirely, present nothing.

---

## EXECUTION

### 1. Collect Friction Points

Review the conversation history for this workflow execution. For each friction point found, classify:

| Type | What happened | Example |
|------|--------------|---------|
| **WORKFLOW_GAP** | A step was missing, incomplete, or wrong in the workflow itself | "Step 3 didn't account for monorepo services" |
| **KNOWLEDGE_GAP** | Project-specific info was missing from workflow-knowledge/ | "Didn't know about the FNAC CSV encoding" |
| **CONTEXT_GAP** | A config value was missing from workflow-context.md | "No worktree template for this workflow type" |
| **CONVENTION_GAP** | A project convention wasn't documented anywhere | "Team uses specific commit message for hotfixes" |
| **TOOL_GAP** | A needed tool/skill wasn't available or didn't work | "DB proxy wasn't running, had to start manually" |
| **UX_FRICTION** | The workflow was confusing or asked unnecessary questions | "Step 2 asked for info that Step 1 already collected" |

### 2. Present Findings

If any friction points were found, present them concisely:

```
Workflow Retrospective — {workflow_name}

During this execution, I noticed {N} friction point(s):

1. [{TYPE}] {description}
   Impact: {what went wrong or was slower}
   Proposed fix: {specific change}
   Target: {which file to modify}

2. ...
```

### 3. Propose Improvements

For each friction point, propose ONE of these actions:

| Action | When | Target |
|--------|------|--------|
| **Edit global skill** | The workflow step itself is wrong/missing | `~/.claude/skills/bmad-{skill}/steps/step-XX.md` |
| **Edit project knowledge** | Project-specific info is missing | `.claude/workflow-knowledge/{file}.md` |
| **Edit project context** | A config value is missing | `.claude/workflow-context.md` |
| **Create new knowledge file** | A whole new domain of knowledge is needed | `.claude/workflow-knowledge/{new-file}.md` |
| **Add to CLAUDE.md** | A project convention should be documented | `CLAUDE.md` |
| **No action** | It was a one-off issue, not worth codifying | — |

### 4. User Decision

Present the proposed improvements and ask:

> **[A] Apply all** — I'll make all proposed changes now
> **[S] Select** — Let me pick which ones to apply
> **[L] Log only** — Don't change anything, just note these for later
> **[N] No thanks** — Skip, nothing worth changing

HALT and wait.

### 5. Apply (if chosen)

For each accepted improvement:

- **Global skill edit**: Read the target file, apply the change, verify it doesn't break the step-file conventions (< 250 lines, has NEXT pointer, etc.)
- **Project knowledge edit**: Read the target knowledge file, add the new section/information
- **Project context edit**: Read workflow-context.md, add/modify the YAML frontmatter key
- **New knowledge file**: Create the file with appropriate structure
- **CLAUDE.md edit**: Read CLAUDE.md, add the convention in the appropriate section

After each change, briefly confirm: "Updated {file}: {what was added/changed}"

### 6. Summary

If any changes were made:

```
Retrospective complete:
  {N} improvements applied
  Files modified: {list}

These changes will take effect in the next workflow execution.
```

---

## IMPORTANT RULES

- **Never force changes** — always present and let the user decide
- **Be specific** — "add X to line Y of file Z", not "consider updating the workflow"
- **Don't over-engineer** — one-off issues don't need permanent fixes
- **Respect scope** — global skill changes affect ALL projects, project changes affect only this one. When in doubt, prefer project-level changes.
- **Don't modify the retrospective step itself** — that's recursive madness
