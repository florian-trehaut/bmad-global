---
nextStepFile: null
---

# Step 8: Cleanup

## STEP GOAL:

Clean up worktree (with user consent), delete WIP file, and present final summary.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- Never auto-remove the worktree — always ask
- The review is complete — this is housekeeping only

### Step-Specific Rules:

- WIP file is always deleted (review is complete)
- Worktree removal requires explicit user consent

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly

---

## MANDATORY SEQUENCE

### 1. Worktree Cleanup

**Apply §3 Cleanup from `bmad-shared/worktree-lifecycle.md`.**

<check if="REUSED_CURRENT_WORKTREE == true">
  The workflow reused the user's current worktree. Do NOT remove it — log "Worktree reused — cleanup skipped (user's worktree)." and skip the prompt below.
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == true">

  > **Worktree cleanup:**
  > Path: `{WORKTREE_PATH}`
  >
  > **[R]** Remove worktree | **[K]** Keep worktree

  WAIT for user selection.

  - **R**: Remove worktree:
    ```bash
    cd {MAIN_PROJECT_ROOT}
    git worktree remove {WORKTREE_PATH} --force
    git worktree prune
    ```
  - **K**: Keep worktree. Log: "Worktree kept at {WORKTREE_PATH}"
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == false">
  No worktree to remove — skip this step.
</check>

### 2. Delete WIP File

```bash
rm /tmp/bmad-wip-adr-review-{SLUG}.md
```

### 3. Present Final Summary

> **ADR Review Complete**
>
> | Field | Value |
> |-------|-------|
> | ADR | {adr_title} |
> | Source | {source_type}: {source_reference} |
> | Verdict | **{APPROVE / IMPROVE / REJECT}** ({confidence}) |
> | Findings | {blocker}B / {major}M / {minor}m / {info}I |
> | Accepted | {accepted_count} |
> | Rejected | {rejected_count} |
> | Skipped | {skipped_count} |
> | Anti-patterns | {detected_list or "none"} |
> | Published to | {destination}: {reference_or_path} |
> | Worktree | {removed / kept at path} |

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- User chose worktree disposition
- WIP file deleted
- Summary presented with all key metrics

### FAILURE:

- Auto-removing worktree without asking
- Leaving WIP file behind
- Not presenting final summary
