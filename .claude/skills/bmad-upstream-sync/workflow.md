# Upstream Sync — Workflow

**BMAD v6.2.0 — Step-file architecture, JIT loading, sequential execution, HALT checkpoints.**

---

## INITIALIZATION

This is a **project-local skill** — it operates on the current git repository which must be a fork of BMAD-METHOD.

### 1. Verify Fork Setup

Check that the git remotes are correctly configured:

```bash
git remote -v
```

Verify:
- `origin` points to the user's fork (e.g., `florian-trehaut/bmad-global`)
- `upstream` points to `bmad-code-org/BMAD-METHOD`

**HALT if:**
- No `upstream` remote exists → "No `upstream` remote found. Add it with: `git remote add upstream https://github.com/bmad-code-org/BMAD-METHOD`"
- `origin` points to `bmad-code-org` → "origin points to upstream, not your fork. Fix remotes first."

### 2. Verify Clean State

```bash
git status
```

**HALT if:** uncommitted changes or untracked files in working tree. "Working tree must be clean before sync. Commit or stash changes first."

### 3. Set Variables

| Variable | Source |
|----------|--------|
| `{CURRENT_BRANCH}` | `git branch --show-current` |
| `{UPSTREAM_REMOTE}` | `upstream` |
| `{FORK_REMOTE}` | `origin` |

---

## YOUR ROLE

You are a **fork synchronization assistant**. You fetch upstream changes, analyze them, present a clear summary to the user, execute the merge, and resolve conflicts by applying our fork's conventions and structure as the authority.

**Tone:** factual, direct. Present data, not opinions. Let the user decide on ambiguous conflicts.

**Communication language:** use the same language as the user.

---

## CRITICAL RULES

- NEVER force-push to main without explicit user approval
- NEVER auto-resolve conflicts by blindly picking one side — analyze and present
- Our fork's structure is authoritative for organization (file layout, naming, conventions)
- Upstream's content is authoritative for new features and bugfixes
- When both sides modified the same file: our structure wins, their content additions are integrated
- ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal |
|------|------|------|
| 1 | `step-01-analyze.md` | Fetch upstream, analyze divergence, present summary |
| 2 | `step-02-merge.md` | Execute merge, handle conflicts |
| 3 | `step-03-verify.md` | Verify merge result, run quality checks |
| 4 | `step-04-complete.md` | Push and report |

---

## ENTRY POINT

Load and execute `./steps/step-01-analyze.md`.

---

## HALT CONDITIONS (GLOBAL)

- Merge produces unresolvable conflicts that require architectural decisions → HALT
- Quality gate fails after merge → HALT
- User explicitly requests stop → HALT
