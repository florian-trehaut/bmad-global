---
nextStepFile: './step-04-check-mr.md'
---

# Step 3: Setup Worktree


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Setup Worktree with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Set up the working environment for this story by applying the unified worktree lifecycle protocol from `bmad-shared/worktree-lifecycle.md`. All implementation work MUST happen inside `WORKTREE_PATH`.

## MANDATORY SEQUENCE

### 1. Derive Paths

- `WORKTREE_PATH_EXPECTED`: substitute `{ISSUE_NUMBER}` and `{SHORT_DESCRIPTION}` into `{WORKTREE_TEMPLATE_DEV}` from `workflow-context.md`.
- `BRANCH_NAME`: substitute `{ISSUE_NUMBER}` and `{SHORT_DESCRIPTION}` into `{BRANCH_TEMPLATE}` from `workflow-context.md`.

### 2. Apply the Worktree Lifecycle Protocol

**Apply the full protocol from `bmad-shared/worktree-lifecycle.md` with the following contract parameters:**

| Parameter | Value |
|-----------|-------|
| `worktree_purpose` | `write` |
| `worktree_path_expected` | `{WORKTREE_PATH_EXPECTED}` |
| `worktree_base_ref` | `origin/main` |
| `worktree_branch_name` | `{BRANCH_NAME}` |
| `worktree_branch_strategy` | `feature-branch` (or `match-remote` if remote branch `origin/{BRANCH_NAME}` already exists) |
| `worktree_alignment_check` | `CURRENT_BRANCH == {BRANCH_NAME}` |

**Remote branch pre-check (write workflows only):** before invoking the protocol, check whether `origin/{BRANCH_NAME}` exists. If it does, switch `worktree_branch_strategy` to `match-remote` so the protocol reuses the remote branch. Otherwise keep `feature-branch`.

```bash
git fetch origin
if git branch -r | grep -q "origin/{BRANCH_NAME}$"; then
  BRANCH_STRATEGY=match-remote
else
  BRANCH_STRATEGY=feature-branch
fi
```

The protocol sets `WORKTREE_PATH` and may set `REUSED_CURRENT_WORKTREE=true`.

### 2b. Spec Handoff to Worktree (story-spec v3 bifurcation)

After the worktree protocol returns and `WORKTREE_PATH` is set, perform the bifurcation spec handoff if applicable.

**Determine handoff applicability:**

```
handoff_required = (spec_split_enabled == true)
                   AND (worktree_enabled == true)
                   AND (REUSED_CURRENT_WORKTREE == false)
                   AND (local spec exists at {MAIN_PROJECT_ROOT}/{TRACKER_STORY_LOCATION}/{story_key}.md)
                   AND (local spec frontmatter has mode: bifurcation)
```

The predicate uses **AND** (not OR) on the worktree conditions: handoff fires only when a NEW dev worktree was created (worktree_enabled true AND not reused). This avoids attempting `git mv` of a file from the main repo to itself when:

- Trunk-based projects (`worktree_enabled: false`) — no worktree to hand off into; spec stays in place.
- The session was already in a dev worktree and the protocol set `REUSED_CURRENT_WORKTREE = true` — the spec has already been handed off (or is already in the worktree alongside the work).

If `handoff_required == false` (any condition fails) → **skip silently** to step 3. Common skip reasons: project trunk-based (`worktree_enabled: false`), legacy v2 spec (no `mode` field), monolithic mode, current worktree was reused (handoff already done or unnecessary), spec already in worktree (move was done in a prior session).

**If `handoff_required == true`:** apply `~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md` operation 6 (Worktree handoff — `git mv`):

1. Verify the source file exists at `{MAIN_PROJECT_ROOT}/{TRACKER_STORY_LOCATION}/{story_key}.md`. If absent, HALT with `Spec handoff: source file expected at {path} but not found. Investigate.`.
2. Verify the worktree is on the dev branch (`{BRANCH_NAME}`). If not (HEAD detached, wrong branch) → HALT with the worktree state.
3. Execute atomically:
   ```bash
   cd {MAIN_PROJECT_ROOT}
   git mv {TRACKER_STORY_LOCATION}/{story_key}.md {WORKTREE_PATH}/{TRACKER_STORY_LOCATION}/{story_key}.md
   git -C {WORKTREE_PATH} commit -m "spec: handoff to worktree" -- {TRACKER_STORY_LOCATION}/{story_key}.md
   ```
4. Verify the source file is **absent** from the main repo:
   ```bash
   git -C {MAIN_PROJECT_ROOT} ls-files -- {TRACKER_STORY_LOCATION}/{story_key}.md
   ```
   If output is non-empty → HALT with `Spec handoff: source file still present in main repo after git mv. Investigate.`.
5. Emit structured echo (per Observability Requirements):
   ```
   Spec handoff: {MAIN_PROJECT_ROOT}/{TRACKER_STORY_LOCATION}/{story_key}.md → {WORKTREE_PATH}/{TRACKER_STORY_LOCATION}/{story_key}.md (commit {SHA})
   ```

**HALT contract:** any failure in steps 1-4 above is a HALT — never force the move, never silently retry, never proceed without the handoff once it has started. The `git mv` is atomic per git semantics: if it fails (uncommitted changes, conflict, fs error), both source and destination remain unchanged.

### 3. Initialize Progress Tracker

```bash
cat > {WORKTREE_PATH}/agent-progress.md << 'EOF'
# Agent Progress — {ISSUE_IDENTIFIER}

## Status
current_step: 3
last_completed: worktree_setup
timestamp: {date}

## Context
worktree_path: {WORKTREE_PATH}
branch: {BRANCH_NAME}
issue_identifier: {ISSUE_IDENTIFIER}
reused_current_worktree: {REUSED_CURRENT_WORKTREE or false}

## Step Log
- [x] Step 1-2: Issue discovered and loaded
- [x] Step 3: Worktree setup
- [ ] Step 4-5: Context loaded
- [ ] Step 6: Marked in progress
- [ ] Step 7-8: Plan and implementation
- [ ] Step 9-10: Journey tests and validation
- [ ] Step 11-12: Review and traceability
- [ ] Step 13-14: MR and completion
EOF
```

**From this point on, ALL commands run inside {WORKTREE_PATH}.**

### 4. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Worktree protocol applied (create or reuse), WORKTREE_PATH set, deps installed, build run, progress tracker initialized

### FAILURE: Inlining `git worktree add` outside the shared rule, skipping the protocol, ignoring rebase conflicts

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Setup Worktree
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
