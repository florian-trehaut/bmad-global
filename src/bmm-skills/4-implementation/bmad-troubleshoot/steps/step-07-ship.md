# Step 7: Ship


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Ship with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Run the full quality gate, perform a condensed self-review, run the impartial scope-completeness audit, push the branch, create a merge request, and update the tracker to In Review.

## RULES

- Quality gate must pass — HALT after 3 failures
- Self-review is inline (not parallel agents) — bug fixes have small diffs
- The impartial scope-completeness audit (§3) is **MANDATORY** — bug fixes are the highest-risk surface for scope creep ("while I'm here") and symptom-vs-root-cause confusion. Skip allowed only on truly trivial fixes (single-line, single-file, no tests added) AND with explicit user approval (see §3.5)
- Use the project's push/MR skill if available in `LOCAL_SKILLS`
- NEVER push without quality gate passing AND scope-completeness verdict APPROVED (or revision applied)

## SEQUENCE

### 1. Run quality gate

```bash
cd {WORKTREE_PATH} && {QUALITY_GATE}
```

**If quality gate fails:**
- Read the error output
- Fix the issue (format, lint, type error)
- Re-run. HALT after 3 consecutive failures.

### 2. Condensed self-review

Review the diff inline — this is a bug fix, not a feature, so a condensed review suffices:

```bash
cd {WORKTREE_PATH} && git diff origin/main --stat
cd {WORKTREE_PATH} && git diff origin/main
```

Check against these 5 criteria:

| # | Check | Look for |
|---|-------|----------|
| 1 | **Correctness** | Does the fix actually address the root cause, not just the symptom? |
| 2 | **Zero fallback** | No new silent defaults, no `\|\| fallback`, no `?? default` on required values |
| 3 | **Test quality** | Test reproduces the bug (not just happy path), no mocks |
| 4 | **Scope discipline** | Only the fix — no unrelated changes, no "while I'm here" cleanup |
| 5 | **Security** | No secrets exposed, no injection vectors, no tenant isolation breach |

If any check fails: fix it, re-commit, re-run quality gate.

### 3. Impartial scope-completeness audit (MANDATORY)

This is the last safety net before push — an impartial subagent independently audits whether the fix addresses the diagnosed root cause AND ONLY that. The same-thread self-review (§2) is necessary but not sufficient — it shares context with the dev work and inherits its blind spots.

#### 3.1 Trivial-fix skip gate

Before invoking the subagent, check if the fix qualifies for skip. ALL of the following must be true:

- §2 self-review verdict was clean (no failed checks)
- Diff stats: ≤ 1 file changed AND ≤ 5 lines added/removed
- No new test file created (a fix with new tests is non-trivial by definition)
- No `import` / `require` change in the diff (suggests structural change)
- No public API surface change (function signatures, exported symbols, config keys)

If ALL conditions are met, present:

> The fix qualifies as trivial (1 file, ≤5 lines, no tests, no API change). Options:
> **[A]** Run audit anyway (recommended for safety)
> **[S]** Skip audit (you take responsibility for scope discipline)
>
> No default. WAIT for input.

If user picks `S` → skip §3.2-3.4, proceed to §4. Log: "Scope-completeness audit skipped on trivial fix per user approval."

If user picks `A` or any non-trivial condition is false → proceed to §3.2.

#### 3.2 Resolve subagent inputs

Compute the three inputs the audit subagent needs:

```bash
# Baseline: commit where the troubleshoot branch diverged from origin/main
BASELINE_COMMIT=$(cd {WORKTREE_PATH} && git merge-base HEAD origin/main)

# Worktree path
# Already set as {WORKTREE_PATH} in workflow state.
```

Issue body — fetch from the tracker and dump to a local file. The subagent reads that file (impartiality requires it not to receive the body inline):

```
Apply `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`:
- Operation: Get issue
- Identifier: {ISSUE_IDENTIFIER}

Dump the full issue body (description + any comments containing diagnosis updates) to:
  ISSUE_DUMP_PATH = {WORKTREE_PATH}/.bmad-troubleshoot-issue-{ISSUE_IDENTIFIER}.md
```

If the issue dump file cannot be written (no tracker access, malformed issue), HALT — the audit cannot run impartially without an issue body to verify against.

#### 3.3 Spawn the impartial audit subagent

Invoke the subagent contract per `./subagent-workflows/scope-completeness.md`. The spawning prompt MUST contain ONLY the three inputs — never a summary of the bug, the diagnosis, or the fix.

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Impartial scope-completeness audit (post-fix, pre-push)',
  prompt: |
    Read and apply this contract IN FULL: ~/.claude/skills/bmad-troubleshoot/subagent-workflows/scope-completeness.md

    Inputs:
      issue_path: '{ISSUE_DUMP_PATH}'
      worktree_path: '{WORKTREE_PATH}'
      baseline_commit: '{BASELINE_COMMIT}'

    Return the structured Markdown report defined in the contract. No preamble, no postamble.
)
```

#### 3.4 Handle the audit verdict

Display the subagent's full report verbatim to the user.

**If verdict = APPROVED (no BLOCKER, ≤ 2 MAJOR):**

If MAJOR findings exist, ask:
> The audit returned APPROVED with {N} MAJOR findings. Options:
> **[F]** Fix them now before pushing
> **[A]** Acknowledge and push anyway (findings will appear in MR description)
>
> No default. WAIT for input.

If `F` → apply the fixes, re-commit, loop back to §1 (quality gate). The audit is bounded to **2 iterations** — on a third NEEDS REVISION verdict, HALT and ask the user how to proceed (the loop suggests a deeper design issue).

If `A` → append the MAJOR findings to the MR description that will be created in §4.

If verdict = APPROVED with no MAJOR → proceed directly to §4.

**If verdict = NEEDS REVISION (any BLOCKER OR > 2 MAJOR):**

Present the BLOCKER and MAJOR findings. Ask:
> The audit returned NEEDS REVISION. The fix has scope or correctness issues that must be addressed before pushing. Options:
> **[F]** Fix the issues now (apply the audit's proposed actions, re-run quality gate, re-audit)
> **[O]** Override (you take full responsibility — the findings WILL be quoted in the MR description for review)
>
> No default. WAIT for input.

If `F` → apply fixes, re-commit, loop back to §1. Bounded to 2 iterations on NEEDS REVISION; on a third NEEDS REVISION, HALT.

If `O` → append all findings (BLOCKER + MAJOR) to the MR description verbatim. Proceed to §4.

#### 3.5 Cleanup

Once the audit completes (APPROVED or overridden), remove the temporary issue dump file:

```bash
rm -f {ISSUE_DUMP_PATH}
```

Non-blocking on failure.

### 4. Push and create MR

**If a push/MR skill exists in `LOCAL_SKILLS`:** invoke it.

**Otherwise:**

```bash
cd {WORKTREE_PATH}
git push -u origin HEAD
```

Create MR:
```bash
{FORGE_MR_CREATE} --title "fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}" --description "{ISSUE_IDENTIFIER}

## Summary
{ONE_LINE_ROOT_CAUSE}

## Test plan
- [x] Regression test written (RED/GREEN verified)
- [ ] Quality gate passed
- [ ] Deploy to staging and verify VM items"
```

Store `MR_IID` and `MR_URL`.

### 5. Update tracker

Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.in_review}

Add a comment on the tracker issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: {ISSUE_ID}
- Body: MR created: {MR_URL} — Fix pushed, quality gate passed. Awaiting review + merge + deploy to staging for VM verification.

### 6. Auto-proceed

MR created, tracker updated. Proceed to verification.

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Ship
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-08-verify.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
