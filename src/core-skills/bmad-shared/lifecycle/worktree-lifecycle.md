# Worktree Lifecycle — Shared Rule

**This document is loaded by all bmad-* workflow skills at initialization.** It defines the mandatory, unified protocol for worktree detection, setup, reuse, post-creation setup, and cleanup. Every workflow that needs a working environment applies this rule with a small contract of parameters — it MUST NOT inline `git worktree add` or sync commands outside this rule.

---

## The Problem

1. **Fresh worktrees are broken without setup.** They do not contain installed dependencies (`node_modules/`, `vendor/`, `.venv/`, `target/`), build artifacts (`dist/`, `build/`, generated types), or generated files (Prisma client, GraphQL types, protobuf stubs). Without running install and build after worktree creation, imports fail, linters crash, tests cannot run, type resolution breaks.
2. **Not all projects use worktrees.** Solo projects working directly on `main` should not be forced into worktree workflows.
3. **Users may already be inside a worktree.** When the session is launched from a specific worktree (Claude Code Desktop, Superset, or any IDE that opens a particular worktree), creating a second sibling worktree in parallel is wasteful and confusing — the workflow should use the current worktree after verifying it is clean and up-to-date with the base ref.

---

## Contract — Parameters Passed by the Calling Step

Every step-file that applies this rule MUST declare the following parameters before invoking the protocol. These parameters fully specify the setup semantics for the workflow — the rule contains no workflow-specific logic.

| Parameter | Values | Meaning |
|-----------|--------|---------|
| `worktree_purpose` | `write` \| `review` \| `read-only` | Broad behavior class (see below) |
| `worktree_path_expected` | path (substituted template) | Conventional sibling path to create if a new worktree is needed |
| `worktree_base_ref` | `origin/main` \| `origin/{remote_branch}` | Upstream ref to sync with |
| `worktree_branch_name` | branch name (or `null` for detached) | Local branch to create/use |
| `worktree_branch_strategy` | `feature-branch` \| `match-remote` \| `detached` | How to wire the local branch on creation |
| `worktree_alignment_check` | human-readable predicate | How to decide whether the current worktree's branch is "compatible" with this workflow |
| `worktree_use_provided` | boolean (default `false`) | When `true` and `worktree_path_expected` is non-null, skip detection and use the provided path verbatim (Branch D). Set by Agent Teams teammates that received a worktree path via `task_contract.constraints.worktree_path`. |

### Purpose semantics

| Purpose | Used by | Local changes | Sync strategy |
|---------|---------|:-------------:|---------------|
| `write` | dev-story, spike, troubleshoot | Expected (commits accumulate on feature branch) | `git fetch origin && git rebase origin/main` (HALT on conflict) |
| `review` | code-review | Review fixes may be committed and pushed | `git fetch origin && git pull --rebase origin {remote_branch}` (HALT on conflict) |
| `read-only` | create-story, adr-review, validation-desktop | None — pure investigation | `git fetch origin && git reset --hard origin/main` |

---

## Flags from `workflow-context.md`

| Flag | Default | Effect |
|------|---------|--------|
| `worktree_enabled` | `true` | Master switch. `false` ⇒ skip worktrees entirely and use the fallback branch/in-place strategy. |
| `worktree_reuse_current` | `auto` | Behavior when the session is already inside a worktree. `auto` = detect + prompt on mismatch. `always` = always reuse (no prompt). `never` = always create the conventional sibling (ignore current worktree). |

Resolve both flags from `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` YAML frontmatter at initialization.

---

## 0. Detect Current Environment — Executed FIRST

Before anything else, detect whether the workflow is running from inside a git worktree.

```bash
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)
GIT_COMMON_DIR=$(git rev-parse --git-common-dir 2>/dev/null)

if [ -z "$GIT_DIR" ]; then
  # HALT: "Not in a git repository. Workflows require a git repo."
  exit 1
fi

if [ "$(realpath "$GIT_DIR")" != "$(realpath "$GIT_COMMON_DIR")" ]; then
  IN_WORKTREE=true
  CURRENT_WORKTREE_PATH=$(git rev-parse --show-toplevel)
  CURRENT_BRANCH=$(git branch --show-current)   # empty if detached
else
  IN_WORKTREE=false
fi
```

`git rev-parse --git-dir` returns `.git/worktrees/<name>` from inside a worktree, and `.git` (equal to `--git-common-dir`) from the main repo. The inequality is the canonical signature.

---

## 1. Setup Protocol — Unified

The protocol branches on two flags. Execute exactly one of the four branches below.

### Precedence (when multiple branches could apply)

```
D > A > B > C
```

- **Branch D** (`worktree_use_provided == true` AND `worktree_path_expected` non-null) — applies first. Used by Agent Teams teammates that received a worktree path via `task_contract.constraints.worktree_path`. The orchestrator has already resolved the project's `worktree_enabled` choice; the teammate MUST honor the provided path and MUST NOT re-evaluate `worktree_enabled` or attempt to create a sibling.
- **Branch A** (`worktree_enabled == false`) — applies when D does not. Trunk-based projects skip worktrees entirely.
- **Branch B** (`IN_WORKTREE == false` OR `worktree_reuse_current == never`) — applies when D and A do not. Creates the conventional sibling.
- **Branch C** (default — `IN_WORKTREE == true` AND `worktree_reuse_current != never`) — applies when D, A, and B do not. Reuse the current worktree.

The precedence is unconditional — D supersedes A even when `worktree_enabled` is `false`. This is the correct behavior because the orchestrator that set `worktree_path` already accounted for `worktree_enabled` when deciding whether to create the worktree at all. A teammate that re-evaluates `worktree_enabled` would either (a) refuse to use the provided path on a trunk-based project — but the orchestrator already created one because it's running multi-teammate work — or (b) create a sibling redundant to the provided path. Both are wrong.

### Branch D — `worktree_use_provided == true` AND `worktree_path_expected` non-null

The orchestrator passed a pre-resolved worktree path. Use it verbatim.

```bash
WORKTREE_PATH={worktree_path_expected}

# Verify the path exists and is a git worktree
if [ ! -d "$WORKTREE_PATH/.git" ] && [ ! -f "$WORKTREE_PATH/.git" ]; then
  # HALT: "Provided worktree_path={path} does not exist or is not a git worktree. Orchestrator failed to set up the worktree before spawning the teammate."
  exit 1
fi

cd "$WORKTREE_PATH"
CURRENT_BRANCH=$(git branch --show-current)
```

Verify branch alignment per the declared `worktree_alignment_check`:

- **For `feature-branch` / `match-remote` strategies**: `CURRENT_BRANCH == {worktree_branch_name}` MUST hold. If not, HALT — the orchestrator and teammate disagree on branch state, which is a contract violation.
- **For `detached` strategy**: `CURRENT_BRANCH == ""` (empty) MUST hold. If not, HALT.

**Source of `{worktree_branch_name}` in TEAMMATE_MODE (RevCorr-3 fix)** : when this protocol runs from a teammate, `{worktree_branch_name}` MUST be read from `task_contract.constraints.worktree_branch_name` (M18 of `standalone-auto-flow-unification.md`). The orchestrator sets it explicitly when it differs from `current_branch` ; if absent, defaults to whatever `git branch --show-current` returns at the provided `worktree_path`. See `~/.claude/skills/bmad-shared/teams/task-contract-schema.md` §Validation Rule 12 for format constraints.

Set `REUSED_CURRENT_WORKTREE=true` so cleanup (§3) skips worktree removal — the orchestrator owns this worktree's lifecycle, not the teammate.

Proceed to **§2 Post-Creation Setup**.

### Branch A — `worktree_enabled == false`

Skip worktree creation entirely. Apply the fallback for the declared `worktree_purpose`:

| Purpose | Fallback |
|---------|----------|
| `write` | `git fetch origin main && git checkout -B {worktree_branch_name} origin/main` in the current repo. Set `WORKTREE_PATH = current repo root`. |
| `review` | `git fetch origin && git checkout {remote_branch}` in the current repo. Set `WORKTREE_PATH = current repo root`. |
| `read-only` | No branch switch. Set `WORKTREE_PATH = current repo root`. Investigate in-place. |

Proceed directly to **§2 Post-Creation Setup** with `WORKTREE_PATH` set.

### Branch B — `IN_WORKTREE == false` OR `worktree_reuse_current == never`

Create the conventional sibling worktree at `worktree_path_expected` from `worktree_base_ref`.

Execute the commands for the declared `worktree_branch_strategy`:

```bash
# feature-branch strategy (new local branch from base_ref)
git fetch origin
git worktree add -b {worktree_branch_name} {worktree_path_expected} {worktree_base_ref}

# match-remote strategy (local branch tracking a remote branch)
# CRITICAL: use -B to create a LOCAL branch tracking the remote — avoids detached HEAD
git fetch origin
# Clean any existing worktree with the same path or remote branch
EXISTING_WT=$(git worktree list | grep "{remote_branch}" | awk '{print $1}')
[ -n "$EXISTING_WT" ] && git worktree remove "$EXISTING_WT" --force 2>/dev/null
git worktree prune
git worktree add -B {worktree_branch_name} {worktree_path_expected} {worktree_base_ref}

# detached strategy (no local branch, detached HEAD)
git fetch origin
git worktree add --detach {worktree_path_expected} {worktree_base_ref}
```

After the `git worktree add` command, verify non-detached state (for `feature-branch` and `match-remote`):

```bash
cd {worktree_path_expected}
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  # HALT: "FATAL: detached HEAD in new worktree — expected branch {worktree_branch_name}"
  exit 1
fi
echo "On branch: $CURRENT_BRANCH"
```

Set `WORKTREE_PATH = {worktree_path_expected}`. Proceed to **§2 Post-Creation Setup**.

### Branch C — `IN_WORKTREE == true` AND `worktree_reuse_current != never`

The session is already inside a worktree. Attempt to reuse it.

#### C.1 Cleanliness check — MANDATORY

```bash
cd {CURRENT_WORKTREE_PATH}
if [ -n "$(git status --porcelain)" ]; then
  # HALT: "Current worktree has uncommitted changes. Commit, stash, or cd to the main repo before running this workflow."
  exit 1
fi
```

No auto-stash. The user must take explicit action.

#### C.2 Alignment check

Compute `ALIGNED` per the step-file's declared `worktree_alignment_check` predicate. Typical forms:

| `worktree_purpose` | Alignment predicate (example) |
|--------------------|-------------------------------|
| `write` | `CURRENT_BRANCH == {worktree_branch_name}` |
| `review` | `CURRENT_BRANCH == {remote_branch}` OR `CURRENT_BRANCH == {worktree_branch_name}` |
| `read-only` | `CURRENT_BRANCH == main` OR `CURRENT_BRANCH == master` OR `CURRENT_BRANCH == ""` (detached) |

#### C.3 Decision

- **If `worktree_reuse_current == always`** → treat as aligned (skip the prompt).
- **Else if `ALIGNED`** → proceed to C.4 Sync.
- **Else** (`worktree_reuse_current == auto` AND NOT aligned) → present the menu:

  > You are in worktree `{CURRENT_WORKTREE_PATH}` on branch `{CURRENT_BRANCH or "(detached)"}`.
  >
  > This workflow expects a `{worktree_purpose}` worktree on `{worktree_base_ref}` (branch `{worktree_branch_name or "detached"}`).
  >
  > **[U]** Use current worktree — switch to `{worktree_base_ref}` / `{worktree_branch_name}` in place (destructive to current branch state)
  > **[C]** Create conventional worktree at `{worktree_path_expected}`
  >
  > No default. WAIT for explicit input (`U` or `C`).

  - On `U` → switch the current worktree's branch in-place:
    ```bash
    cd {CURRENT_WORKTREE_PATH}
    git fetch origin
    git checkout -B {worktree_branch_name} {worktree_base_ref}   # feature-branch / match-remote
    # OR
    git checkout {worktree_base_ref} --detach                     # detached strategy
    ```
    Then proceed to C.4 Sync.

  - On `C` → fall back to **Branch B** (create the conventional sibling). Do NOT touch the current worktree. `WORKTREE_PATH` will point to the new sibling.

  - On other input → redisplay the menu. No default key.

#### C.4 Sync with upstream

Execute the sync strategy for the declared `worktree_purpose`:

```bash
cd {CURRENT_WORKTREE_PATH}

# worktree_purpose == write
git fetch origin
git rebase origin/main
# HALT on conflict — never force-resolve

# worktree_purpose == review
git fetch origin
git pull --rebase origin {remote_branch}
# HALT on conflict

# worktree_purpose == read-only
git fetch origin
git reset --hard origin/main
```

Set `WORKTREE_PATH = {CURRENT_WORKTREE_PATH}`. Record `REUSED_CURRENT_WORKTREE=true` so cleanup (§3) can skip worktree removal.

Proceed to **§2 Post-Creation Setup**.

---

## 2. Post-Creation Setup — MANDATORY (runs on every branch, every invocation)

After `WORKTREE_PATH` is set (whether the worktree was created, switched in place, or synced), run the dependency setup sequence **inside** `WORKTREE_PATH`. This is non-optional and MUST NOT be skipped — dependencies may have changed after fetch, and fresh worktrees have no deps at all.

### Sequence

```bash
cd {WORKTREE_PATH}
{install_command}      # HALT on failure — worktree is unusable without deps. Skip only if empty.
{build_command}        # HALT on failure — generated code/types missing. Skip if empty.
{typecheck_command}    # WARN on failure (non-blocking). Skip if empty.
```

### Verification log

```
Worktree setup complete: {WORKTREE_PATH}
  reused_current: {true|false}
  install: {OK|SKIPPED}
  build: {OK|SKIPPED}
  typecheck: {OK|WARN:{reason}|SKIPPED}
```

### Why always re-run install on reuse

Lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `poetry.lock`, `Cargo.lock`) may have changed on `origin/main` since the worktree was last used. Running install unconditionally guarantees correctness at the cost of some runtime. A conditional diff-based shortcut is explicitly out of scope — it introduces subtle bugs when transitive deps change without lockfile diff.

---

## 3. Cleanup

When a workflow completes and needs to tear down its working environment:

### If `REUSED_CURRENT_WORKTREE == true` (Branch C or Branch D was taken)

**Do NOT remove the worktree.** Either the user (Branch C) or the orchestrator (Branch D) owns this worktree's lifecycle — the workflow merely borrowed it. Log: `"Worktree reused — cleanup skipped (owned by {user|orchestrator})."` Branch handling is deferred to the owner.

### Else, if `worktree_enabled == true` (Branch B was taken)

Standard cleanup:

```bash
cd {MAIN_PROJECT_ROOT}
git worktree remove {WORKTREE_PATH} --force
git worktree prune
```

Branch cleanup depends on the workflow (some keep branches for reference, some delete them). Follow the calling step's cleanup instructions.

### Else, if `worktree_enabled == false` (Branch A was taken)

No worktree to remove. If the workflow created a branch for its work:

- **read-only** workflows: no branch was created — nothing to clean up.
- **write / review** workflows: ASK the user before deleting the branch. Checkout `main` before deleting:
  ```bash
  git checkout main
  git branch -D {worktree_branch_name}   # Only after user approval
  ```

---

## Application by Workflow

| Workflow | `worktree_purpose` | `worktree_branch_strategy` | `worktree_base_ref` | `worktree_branch_name` template |
|----------|--------------------|----------------------------|---------------------|---------------------------------|
| `bmad-dev-story` | `write` | `feature-branch` | `origin/main` | `{BRANCH_TEMPLATE}` |
| `bmad-code-review` | `review` | `match-remote` | `origin/{MR_SOURCE_BRANCH}` | `review-{MR_IID}` |
| `bmad-create-story` | `read-only` | `feature-branch` | `origin/main` | `create-story/{slug}` |
| `bmad-spike` | `write` | `feature-branch` | `origin/main` | `spike/{slug}` |
| `bmad-adr-review` | `read-only` | `detached` | `origin/main` | `null` |
| `bmad-validation-desktop` | `read-only` | `detached` | `origin/main` | `null` |
| `bmad-troubleshoot` | `write` | `feature-branch` | `origin/main` | `troubleshoot/{date}` |

Each workflow's worktree-setup step passes the appropriate row's parameters and invokes this rule. Inline `git worktree add` / `git rebase` / `git reset` calls outside this rule are forbidden — they are the historical source of inconsistency that this rule replaces.

---

## Why This Is a Shared Rule

Before this rule, each workflow inlined its own creation logic with subtle inconsistencies: only 2 of 7 ran `{install_command}`, none ran `{build_command}`, alignment checks were ad-hoc or absent, and none handled the "user is already in a worktree" case. This rule centralizes the protocol, makes the 7 workflows behave identically modulo their declared parameters, and adds two structural improvements — current-worktree detection and a reuse flag — that were previously impossible to retrofit.
