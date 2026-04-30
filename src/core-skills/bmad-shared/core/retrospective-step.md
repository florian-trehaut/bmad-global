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

Friction point {N}: {short title}

  What happened: {description of what occurred}
  Impact: {what went wrong or was slower}
  Workflow file involved: {relative framework path}

  ...
```

**PATH RULES — CRITICAL:**
- Use **relative framework paths** from the skill root: `bmad-code-review/steps/step-01-discover.md`
- For shared files: `bmad-shared/core/retrospective-step.md`
- For project-level files: `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`, `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{file}.md`
- **NEVER** use absolute installed paths like `~/.claude/skills/bmad-{skill}/...`
- The retrospective is consumed by the framework developer — installed paths point to the wrong files

**SCOPE RULES:**
- **Diagnose only** — describe the problem and its impact, identify which file(s) are involved
- **Do NOT propose specific code changes** — the framework developer decides the fix
- **Do NOT offer to apply changes** — this agent executes workflows, it does not modify the framework
- **Do NOT modify any skill files** — not installed files, not source files, nothing

### 3. Done

Present the findings and end the workflow. No further action needed from this step.

---

## IMPORTANT RULES

- **Diagnose, don't fix** — describe what happened and the impact, never propose or apply code changes
- **Relative paths only** — use framework-relative paths (e.g., `bmad-code-review/steps/step-01.md`), never installed paths (`~/.claude/skills/...`)
- **Don't over-engineer** — one-off issues don't need reporting
- **Don't modify any files** — not skill files, not project files, nothing. Output is text only.
- **Don't modify the retrospective step itself** — that's recursive madness
