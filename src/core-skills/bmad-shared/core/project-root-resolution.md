# Project Root Resolution

**This document is loaded by all bmad-* workflow skills at initialization.** It defines how to resolve the main project root, which is critical when working from git worktrees.

---

## The Problem

BMAD knowledge files (`.claude/workflow-context.md`, `.claude/workflow-knowledge/`, `.claude/daily-log/`) live in the main project root. Git worktrees are separate directories with their own file tree — these files do not exist there.

When a workflow says "read from the project root", the project root **must** be the main repository, not the current worktree.

---

## Resolution Rule

At initialization, **before** reading any `.claude/` file, resolve the main project root:

```bash
MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")
```

This returns:
- The main repo path when run from a worktree
- The main repo path when run from the main repo itself (identity — `dirname .git` = `.`)

**Store this as `{MAIN_PROJECT_ROOT}` and use it for ALL `.claude/` file access throughout the workflow.**

---

## Path Mapping

| Old pattern | New pattern |
|-------------|-------------|
| `.claude/workflow-context.md` | `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` |
| `.claude/workflow-knowledge/*.md` | `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/*.md` |
| `.claude/daily-log/*.md` | `{MAIN_PROJECT_ROOT}/.claude/daily-log/*.md` |
| `.claude/skills/*/SKILL.md` | `{MAIN_PROJECT_ROOT}/.claude/skills/*/SKILL.md` |

---

## Mandatory for All Workflows

Every workflow that reads `.claude/` files **must** resolve `{MAIN_PROJECT_ROOT}` first. This is not optional — without it, the workflow breaks in worktrees.

Agents (SKILL.md) that load workflow-context must include the resolution step in their "On Activation" section.
