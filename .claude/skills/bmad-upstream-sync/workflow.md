# Upstream Sync — Workflow

**Fork-aware synchronization with upstream BMAD-METHOD.**

---

## INITIALIZATION

This is a **project-local skill** — it operates on the current git repository which must be a fork of BMAD-METHOD.

### 1. Load Fork Identity

Read `./references/fork-identity.md` BEFORE any other action. This file defines what makes our fork different and how to handle each category of upstream change.

### 2. Verify Fork Setup

```bash
git remote -v
```

Verify:
- `origin` points to the user's fork (e.g., `florian-trehaut/bmad-global`)
- `upstream` points to `bmad-code-org/BMAD-METHOD`

**HALT if:**
- No `upstream` remote → "No `upstream` remote found. Add it with: `git remote add upstream https://github.com/bmad-code-org/BMAD-METHOD`"
- `origin` points to `bmad-code-org` → "origin points to upstream, not your fork. Fix remotes first."

### 3. Verify Clean State

```bash
git status
```

**HALT if:** uncommitted changes or untracked files. "Working tree must be clean before sync. Commit or stash changes first."

### 4. Set Variables

| Variable | Source |
|----------|--------|
| `{CURRENT_BRANCH}` | `git branch --show-current` |
| `{UPSTREAM_REMOTE}` | `upstream` |
| `{FORK_REMOTE}` | `origin` |

---

## YOUR ROLE

Fork synchronization specialist. Fetch upstream changes, analyze each commit individually, present a clear plan, execute the merge adapting upstream additions to our fork's conventions, and verify the result.

**Key principle:** Our fork has its own identity. Upstream provides the base product. We follow their direction but restructure everything to fit our conventions. Every upstream commit must exist in our history, but the content may be adapted.

**Communication language:** use the same language as the user.

---

## CRITICAL RULES

- NEVER force-push without explicit user approval
- NEVER auto-resolve conflicts — analyze each one against fork-identity.md rules
- Our structure is authoritative (file layout, naming, step directories, shared rules)
- Upstream content is valuable (features, bugfixes, improved prompts) — integrate it, don't discard it
- When both sides modified the same file: our enhancements are preserved, their additions are integrated
- Fork-only files (.claude/, CHANGELOG.md, package identity) are NEVER overwritten
- ALL steps in exact order — NO skipping

---

## STEP SEQUENCE

| Step | File | Goal |
|------|------|------|
| 1 | `step-01-analyze.md` | Fetch upstream, analyze each commit, classify impact, predict conflicts |
| 2 | `step-02-merge.md` | Execute merge, resolve conflicts per fork-identity rules |
| 3 | `step-03-review-imports.md` | Audit all imported files for fork convention compliance, fix violations |
| 4 | `step-04-verify.md` | Verify merge, run quality gate, check fork identity preserved |
| 5 | `step-05-complete.md` | Push and report |

---

## ENTRY POINT

Load and execute `./steps/step-01-analyze.md`.

---

## HALT CONDITIONS (GLOBAL)

- Upstream introduced a major architectural restructuring → HALT, present analysis before proceeding
- A fork-only file would be overwritten → HALT
- Quality gate fails after merge → HALT
- Conflict requires an architectural decision (not just content merge) → HALT
- User explicitly requests stop → HALT
