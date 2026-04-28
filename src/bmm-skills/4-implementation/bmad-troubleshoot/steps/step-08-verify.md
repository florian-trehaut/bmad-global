# Step 8: Verify & Complete


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-08-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-08-ENTRY PASSED — entering Step 8: Verify & Complete with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

After the MR is merged and deployed, execute the validation metier items against the staging environment. Post the verdict to the tracker, update status, and clean up.

## RULES

- **Only real evidence counts** — API responses, DB queries, logs. Code analysis is NOT proof.
- **In production:** reads only, every write requires explicit user authorization
- **Binary verdict:** ALL VM pass = Done. ANY fail = stays In Review.
- VM verification is OPTIONAL in this step — the user may prefer to do it later or via the bmad-validation-metier skill

## SEQUENCE

### 1. Check deployment status

Ask user:

> The MR has been created. Options:
> **[V]** Verify now — the MR is merged and deployed to staging, let's run the VM
> **[L]** Verify later — I'll run `/bmad-validation-metier` when the deploy is done
> **[S]** Skip verification — just clean up

WAIT for user response.

- **IF L or S:** skip to step 5 (cleanup)
- **IF V:** continue below

### 2. Execute VM items

For each VM item from the tracker issue:

1. Execute the test against the real `{TARGET_ENV}` environment
2. Use `LOCAL_SKILLS` for DB access, API calls, etc.
3. Collect evidence (API response, DB query result, log entry)
4. Verdict: **PASS** (with evidence) or **FAIL** (with evidence)

```markdown
### VM Results

| # | VM Item | Verdict | Evidence |
|---|---------|---------|----------|
| VM-1 | {description} | PASS/FAIL | {evidence_summary} |
```

### 3. Determine verdict

**ALL PASS:** verdict = DONE
**ANY FAIL:** verdict = FAIL — issue stays In Review

### 4. Post results to tracker

Post a comment on the tracker issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: {ISSUE_ID}
- Body: VM results table with verdict

**If DONE:**

Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.done}

**If FAIL:**
Leave state as In Review. Report which VM items failed and why.

### 5. Cleanup worktree

```bash
cd {project-root}
git worktree remove {WORKTREE_PATH} --force 2>/dev/null || true
git branch -D troubleshoot/{AFFECTED_SERVICE}-{DATE} 2>/dev/null || true
```

Worktree cleanup failure is non-critical — warn but do not HALT.

### 6. Final summary

```
## Troubleshoot Complete

**Issue:** {ISSUE_IDENTIFIER} — fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}
**Root cause:** {ROOT_CAUSE_ONE_LINE}
**MR:** {MR_URL}
**Verdict:** {VERDICT or "Verification pending"}

### Evidence Trail
- Logs: {LOG_EVIDENCE_SUMMARY}
- Database: {DB_EVIDENCE_SUMMARY}
- Code: {CODE_EVIDENCE_SUMMARY}

### What was fixed
{FIX_SUMMARY}

### Regression test
{TEST_FILE_PATH} — reproduces the original bug
```

---

## END OF WORKFLOW

The bmad-troubleshoot workflow is complete.

---

## STEP EXIT (CHK-STEP-08-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Verify & Complete
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-troubleshoot executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '07', '08']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '07', '08'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
