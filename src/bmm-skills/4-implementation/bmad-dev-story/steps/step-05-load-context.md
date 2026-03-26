---
nextStepFile: './step-06-mark-in-progress.md'
---

# Step 5: Load Project Context

## STEP GOAL:

Load the project context (source of truth for dev standards) and check for cross-session recovery.

## MANDATORY SEQUENCE

### 1. Load Issue Description

The issue description (loaded from tracker in Step 2) IS the story — it contains tasks, AC, guardrails.

### 2. Load Project Context

1. **Primary (tracker):** If `{TRACKER_META_PROJECT_ID}` is set, list documents in the Meta Project (using CRUD patterns from tracker.md) to find "Project Context" document, then load its content by ID.
2. **Fallback (local):** Search for `**/project-context.md` in the project.

### 3. Load Dev Standards

If `.claude/workflow-knowledge/stack.md` exists at project root, read it for tech stack context, forbidden patterns, test rules, and reference code pointers.

### 4. Check for Progress Recovery

```bash
ls {WORKTREE_PATH}/agent-progress.md 2>/dev/null && cat {WORKTREE_PATH}/agent-progress.md
```

<check if="agent-progress.md exists AND current_step > 5">
  Recovery mode — read progress file.
  Log: "Resuming from Step {current_step} — steps 1-{current_step-1} already completed"
  Skip ahead to the step indicated by current_step.
</check>

### 5. Check for Review Continuation

Check issue comments for "Action Items" or "Review Findings" from a previous code review.

<check if="review action items found with unchecked items">
  This is a review continuation — address action items first.
  Log: "Resuming after code review — addressing action items"
</check>

### 6. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Context loaded, recovery checked, standards available
### FAILURE: Skipping context load, ignoring recovery state
