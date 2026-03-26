# Step 2b: Setup Investigation Worktree

## STEP GOAL

Create a temporary worktree synced with origin/main for code verification in step 03. The analysis step verifies architecture claims against real code — that verification must happen on the latest main.

## RULES

- The worktree is READ-ONLY — no code changes, only investigation
- If worktree creation fails, HALT — code verification requires a worktree

## SEQUENCE

### 1. Create worktree

```bash
git fetch origin main
git worktree add {WORKTREE_TEMPLATE_SPEC} origin/main -b create-story/{EPIC_SLUG}-{ISSUE_IDENTIFIER}
```

Where `{WORKTREE_TEMPLATE_SPEC}` is resolved from `workflow-context.md` `worktree_templates.quick_spec`, replacing `{slug}` with `{ISSUE_IDENTIFIER}`.

**If worktree creation fails:** HALT — report error to user. Analysis requires a worktree for code verification.

Store `SPEC_WORKTREE_PATH` = resolved worktree path.

Log: "Worktree created: {SPEC_WORKTREE_PATH} (synced with origin/main)"

### 2. Proceed

**From this point on, ALL code investigation runs inside {SPEC_WORKTREE_PATH}.**

---

**Next:** Read fully and follow `./step-03-analyze.md`
