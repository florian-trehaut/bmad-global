---
---

# Step 8: Cleanup & Report

## STEP GOAL:

Clean up the temporary worktree and WIP file, then present a summary with next steps.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- Worktree cleanup failure is NON-CRITICAL -- warn but don't halt
- WIP file deletion is safe -- the tracker issue is the source of truth now

### Step-Specific Rules:

- Focus on clean exit -- no lingering state
- This is the final step -- no nextStepFile

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Graceful degradation for non-critical cleanup failures

---

## MANDATORY SEQUENCE

### 1. Cleanup Worktree

```bash
cd {project-root}
git worktree remove {SPEC_WORKTREE_PATH} --force
```

**If worktree removal fails:** Warn user but do NOT halt. Worktree cleanup is non-critical.

> The temporary worktree could not be removed: {SPEC_WORKTREE_PATH}
> You can remove it manually: `git worktree remove {SPEC_WORKTREE_PATH} --force`

Also remove the local branch if it was created:

```bash
git branch -D spec/{slug} 2>/dev/null || true
```

### 2. Delete WIP File

Delete `{wip_file}` (issue created successfully -- WIP no longer needed).

### 3. Present Summary

> ## Spec Created
>
> - **Issue**: {NEW_ISSUE_IDENTIFIER} -- {title}
> - **Tracker Status**: Todo
> - **Type**: {type}
> - **Priority**: {priority_label}
> - **Project**: {project_name_if_any or "Standalone"}
>
> ### Issue Lifecycle
>
> ```
> Todo -> In Progress -> In Review -> To Test -> Done
> ```
>
> - After merge + deploy: the story will move to **To Test**
> - A comment will recap the **Validation Metier** tests to execute in production
> - The story will only move to **Done** after manual validation of business tests
>
> ### Next Steps
>
> Use the dev-story workflow to implement this issue,
> or sprint-planning to schedule it in a sprint.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Worktree removed (or warning issued if removal fails)
- WIP file deleted
- Summary presented with issue identifier and next steps

### FAILURE:

- Halting on non-critical worktree cleanup failure
- Not deleting WIP file
- Not presenting summary
