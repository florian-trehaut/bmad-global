# Step 2b: Setup Investigation Worktree

## STEP GOAL

Create a temporary worktree synced with origin/main for code verification in step 03. The analysis step verifies architecture claims against real code — that verification must happen on the latest main.

## RULES

- The worktree is READ-ONLY — no code changes, only investigation
- If worktree creation fails and `worktree_enabled: true`, HALT — code verification requires a worktree

## SEQUENCE

### 1. Setup Working Environment

**Apply the worktree lifecycle rules from `bmad-shared/worktree-lifecycle.md`.**

<check if="worktree_enabled == true (or absent)">
  Create a temporary worktree for investigation:

```bash
git fetch origin main
git worktree add {WORKTREE_TEMPLATE_SPEC} origin/main -b create-story/{EPIC_SLUG}-{ISSUE_IDENTIFIER}
```

  Where `{WORKTREE_TEMPLATE_SPEC}` is resolved from `workflow-context.md` `worktree_templates.quick_spec`, replacing `{slug}` with `{ISSUE_IDENTIFIER}`.

  **If worktree creation fails:** HALT — report error to user. Analysis requires a worktree for code verification.

  **Run post-creation setup** (MANDATORY — from `bmad-shared/worktree-lifecycle.md`):

```bash
cd {SPEC_WORKTREE_PATH}
{install_command}      # HALT on failure
{build_command}        # HALT on failure, skip if empty
{typecheck_command}    # WARN on failure, skip if empty
```

  Store `SPEC_WORKTREE_PATH` = resolved worktree path.
</check>

<check if="worktree_enabled == false">
  No worktree — investigate in the current project directory.

  Store `SPEC_WORKTREE_PATH` = current project directory.
</check>

Log: "Working environment ready: {SPEC_WORKTREE_PATH}"

### 2. Proceed

**From this point on, ALL code investigation runs inside {SPEC_WORKTREE_PATH}.**

---

**Next:** Read fully and follow `./step-03-analyze.md`
