---
nextStepFile: './step-03-spec-phase.md'
---

# Step 2: Worktree Setup — Single Shared (BAC-6, BAC-7, TAC-5)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Worktree Setup with worktree_enabled={value}, SLUG={slug}
```

## STEP GOAL

Create a SINGLE shared worktree if `worktree_enabled=true` (BAC-6 / TAC-5). The worktree is propagated to all subsequent teammates via `task_contract.constraints.worktree_path` so they consume Branch D of `worktree-lifecycle.md`. If `worktree_enabled=false` (e.g., BMAD-METHOD self), skip worktree creation entirely (BAC-7).

The worktree is created BEFORE the spec phase so that any spec artifacts can be written to it directly (avoiding the bifurcation handoff complexity).

## MANDATORY SEQUENCE

### 1. Read worktree_enabled

```
worktree_enabled = {MAIN_PROJECT_ROOT}/.claude/workflow-context.md → frontmatter `worktree_enabled` (default true)
```

### 2. Branch on worktree_enabled

#### Branch A — `worktree_enabled == false` (BAC-7)

- `WORKTREE_PATH = MAIN_PROJECT_ROOT` (identity)
- `BRANCH_NAME = main` (or whatever current branch)
- Skip `git worktree add` entirely.
- Log:

```
auto-flow worktree: skipped (worktree_enabled=false, working on main directly)
```

#### Branch B — `worktree_enabled == true` (BAC-6)

- Derive `WORKTREE_PATH` and `BRANCH_NAME` from `worktree_templates.dev` and `branch_template` in workflow-context.md (substituting `{slug}` with `SLUG`; `{issue_number}` substituted later in step-03 once the spec is created and the issue ID is known — for now use a temporary placeholder like `auto`).
- Apply the worktree-lifecycle.md protocol with parameters:
  - `worktree_purpose = 'write'`
  - `worktree_path_expected = WORKTREE_PATH`
  - `worktree_base_ref = origin/main`
  - `worktree_branch_name = BRANCH_NAME`
  - `worktree_branch_strategy = 'feature-branch'`
  - `worktree_alignment_check = 'CURRENT_BRANCH == BRANCH_NAME'`
  - `worktree_use_provided = false` (we ARE the orchestrator creating it; teammates will use it via Branch D with `worktree_use_provided=true`)
- After the protocol returns with `WORKTREE_PATH` set, log:

```
auto-flow worktree: {WORKTREE_PATH} on branch {BRANCH_NAME}
```

### 3. Audit log

If audit_log_enabled:

```bash
echo "[step-02-worktree-setup] worktree_enabled={value}, WORKTREE_PATH={path}, BRANCH_NAME={branch}" >> $LOG_FILE
```

### 4. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: WORKTREE_PATH set (either to a created sibling or to MAIN_PROJECT_ROOT identity); BRANCH_NAME set
- **FAILURE**: creating a worktree when worktree_enabled=false, leaving WORKTREE_PATH unset

---

## STEP EXIT (CHK-STEP-02-EXIT)

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Worktree Setup
  actions_executed: read worktree_enabled={value}; {created sibling worktree at {path} | skipped — using MAIN_PROJECT_ROOT identity}
  artifacts_produced: WORKTREE_PATH={path}, BRANCH_NAME={branch}
  next_step: ./steps/step-03-spec-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-03-spec-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
