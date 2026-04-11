# Worktree Lifecycle — Shared Rule

**This document is loaded by all bmad-* workflow skills at initialization.** It defines mandatory rules for worktree creation, post-creation setup, and cleanup. These rules apply to every workflow that creates or uses a git worktree.

---

## The Problem

Worktrees are fresh checkouts. They do not contain:

- Installed dependencies (`node_modules/`, `vendor/`, `.venv/`, `target/`)
- Build artifacts (`dist/`, `build/`, generated types, compiled code)
- Generated files (Prisma client, GraphQL types, protobuf stubs)

Without running install and build after worktree creation, the worktree is **broken**: imports fail, linters crash, tests cannot run, type resolution breaks, and investigation tools produce misleading results.

Additionally, not all projects use worktrees. Solo projects working directly on `main` should not be forced into worktree workflows.

---

## 1. Worktree Guard

Before creating a worktree, check `worktree_enabled` from `workflow-context.md` YAML frontmatter.

### When `worktree_enabled: true` (or absent — default is true)

Proceed with worktree creation as defined by the workflow step. After creation, execute the **Post-Creation Setup** sequence below.

### When `worktree_enabled: false`

Skip worktree creation entirely. Use a fallback strategy based on the workflow type:

| Workflow type | Fallback behavior |
|---------------|-------------------|
| **Read-only** (create-story, adr-review, validation-desktop) | Set `{WORKTREE_PATH}` = current project directory. Investigate in-place. |
| **Read-write** (dev-story) | Create branch in current repo: `git fetch origin main && git checkout -b {BRANCH_NAME} origin/main`. Set `{WORKTREE_PATH}` = current project directory. |
| **Review** (code-review) | Checkout MR branch in current repo: `git fetch origin && git checkout {MR_SOURCE_BRANCH}`. Set `{WORKTREE_PATH}` = current project directory. |
| **Investigation** (spike) | Set `{WORKTREE_PATH}` = current project directory. PoC code lives in the current repo. |

The rest of the workflow proceeds identically — `{WORKTREE_PATH}` is set either way, so downstream steps work without modification.

---

## 2. Post-Creation Setup — MANDATORY

After EVERY successful worktree creation (`git worktree add`), the following commands MUST be run inside the worktree directory, in order. This sequence is **NOT optional** and **MUST NOT be skipped** regardless of whether the worktree is read-only or read-write.

### Sequence

1. **Install dependencies**: Run `{install_command}` (from `workflow-context.md`)
   - **HALT if command fails** — the worktree is unusable without dependencies
   - Skip only if `install_command` is empty string

2. **Build project**: Run `{build_command}` (from `workflow-context.md`)
   - **HALT if command fails** — generated code/types are missing
   - Skip if `build_command` is empty string

3. **Type check**: Run `{typecheck_command}` (from `workflow-context.md`)
   - **WARN if command fails** (non-blocking — some projects have pre-existing type issues)
   - Skip if `typecheck_command` is empty string

### Verification Log

After setup completes, log:

```
Worktree setup complete: {WORKTREE_PATH}
  install: {OK|SKIPPED}
  build: {OK|SKIPPED}
  typecheck: {OK|WARN:{reason}|SKIPPED}
```

### Why This Is a Shared Rule

Individual step files historically implement install/build inconsistently — only 2 of 7 workflows ran `{install_command}`, and none ran `{build_command}`. This shared rule makes the post-creation setup impossible to forget. Every workflow step that creates a worktree MUST reference this rule instead of implementing setup logic inline.

---

## 3. Cleanup

When a workflow completes and needs to remove its worktree:

### When `worktree_enabled: true`

Standard cleanup:

```bash
cd {MAIN_PROJECT_ROOT}
git worktree remove {WORKTREE_PATH} --force
git worktree prune
```

Branch cleanup depends on the workflow (some keep branches, some delete them). Follow the workflow step's cleanup instructions.

### When `worktree_enabled: false`

No worktree to remove. If the workflow created a branch for its work:

- **Read-only workflows**: No branch was created — nothing to clean up.
- **Read-write workflows**: Ask user before deleting the branch. Checkout `main` before deleting:
  ```bash
  git checkout main
  git branch -D {BRANCH_NAME}   # Only after user approval
  ```

---

## Application by Workflow

| Workflow | Worktree type | Post-creation setup needed? | Fallback when disabled |
|----------|---------------|:--:|------------------------|
| bmad-dev-story | Read-write | YES | Branch in current repo |
| bmad-code-review | Read-write (MR branch) | YES | Checkout MR branch in-place |
| bmad-create-story | Read-only | YES | Investigate in current dir |
| bmad-spike | Read-write (PoC) | YES | Work in current dir |
| bmad-adr-review | Read-only (detached) | YES | Investigate in current dir |
| bmad-validation-desktop | Read-only (detached) | YES | Validate in current dir |
