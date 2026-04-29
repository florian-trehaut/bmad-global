---
nextStepFile: null
---

# Step 9: Finalize — TeamDelete + User Report (Guardrail 9)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: Finalize with TEAM_NAME={name}, exit_path={success|halt|abandon}
```

## STEP GOAL

Always called as the final step regardless of how the workflow ended (success, HALT, abandon). Per Guardrail 9, the orchestrator MUST call TeamDelete on EVERY exit path — leaking team state at `~/.claude/teams/{team-name}/` violates Agent Teams "one team per session" limitation.

Additionally:
- Display a final report to the user summarizing what was accomplished and the final tracker state.
- If audit_log_enabled, close the audit log file.
- Emit CHK-WORKFLOW-COMPLETE per `workflow-adherence.md` Rule 7.

## MANDATORY SEQUENCE

### 1. Determine exit_path

```
exit_path = 'success' if PHASE_RESULTS contains all 5 phases with positive verdicts
          | 'halt' if HALT happened mid-flow
          | 'abandon' if user chose [A]bandon at any phase
```

### 2. TeamDelete (Guardrail 9 — every exit path)

If TEAM_MODE=true and TEAM_NAME is non-null:

```
Invoke TeamDelete with team_name = TEAM_NAME.
```

If TeamDelete fails:
- Log the failure (do not HALT — we are in cleanup)
- Suggest manual cleanup: `rm -rf ~/.claude/teams/{TEAM_NAME}/`

If TEAM_MODE=false: skip TeamDelete (no team to delete).

### 3. Build user report

Compose the final report (in `COMMUNICATION_LANGUAGE`):

```
# Auto-Flow Terminé — {ISSUE_ID}

**Status final tracker** : {PHASE_RESULTS aggregated to final tracker state}
**MR** : {MR_URL or "n/a"}
**Worktree** : {WORKTREE_PATH or "n/a (worktree_enabled=false)"}

## Phases

| Phase | Verdict | Notes |
|-------|---------|-------|
| 1. Spec ({SPEC_PROFILE}) | {APPROVED-INLINE} | Spec at {SPEC_PATH} |
| 2. Review | {PHASE_RESULTS['review'].verdict} | {findings_count} findings |
| 3. Dev ({SPEC_PROFILE → workflow}) | {PHASE_RESULTS['dev'].verdict} | MR: {MR_URL} |
| 4. Code Review | {PHASE_RESULTS['code-review'].verdict} | {N} perspectives, {findings_count} findings |
| 5. Validation | {PHASE_RESULTS['validation'].verdict} | {per_vm_results summary} |

{If exit_path == 'abandon' or 'halt':}
Reason: {explanation of why exited early}
Pickup point: {what state the story was left in, how to resume manually}
{End if}
```

Display to user via assistant text output (not AskUserQuestion — this is the workflow's final speech, not a question).

### 4. Close audit log

If audit_log_enabled:

```bash
echo "[step-09-finalize] exit_path={path}, TeamDelete={ok|failed|skipped}" >> $LOG_FILE
echo "[end-of-auto-flow] $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $LOG_FILE
```

### 5. Worktree cleanup decision

Per `worktree-lifecycle.md` §3:

- If `worktree_enabled=false`: no worktree to clean (Branch A was taken in step-02).
- If `worktree_enabled=true` and `exit_path == 'success'`: leave the worktree in place for the user to push / merge / inspect. Do NOT auto-remove.
- If `exit_path == 'abandon'` or `halt`: ASK user whether to keep or remove the worktree (it may contain WIP).

### 6. Emit CHK-WORKFLOW-COMPLETE (workflow-adherence Rule 7)

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-auto-flow executed end-to-end:
  steps_executed: [01, 02, 03, 04, 05, 06, 07, 08, 09]    ← OR partial list if halt happened earlier
  steps_skipped: []                                        ← OR list with verbatim user citation if applicable
  final_artifacts:
    - issue: {ISSUE_ID}
    - spec_path: {SPEC_PATH}
    - mr_url: {MR_URL or "n/a"}
    - tracker_status: {final_status}
    - team: {TEAM_NAME or "n/a"} ({deleted | failed | skipped})
    - phase_results:
        review: {verdict}
        dev: {verdict}
        code-review: {verdict}
        validation: {verdict}
```

If `steps_executed != [01..09]` sequential AND `steps_skipped` non-empty without verbatim user citation → HALT (the workflow is reporting an inconsistent state).

## SUCCESS / FAILURE

- **SUCCESS**: TeamDelete called (Guardrail 9), final report displayed, audit log closed, CHK-WORKFLOW-COMPLETE emitted, worktree decision documented
- **FAILURE**: skipping TeamDelete (Guardrail 9 violation), missing CHK-WORKFLOW-COMPLETE (Rule 7 violation), removing worktree without asking on abandon path

---

## STEP EXIT (CHK-STEP-09-EXIT)

```
CHK-STEP-09-EXIT PASSED — completed Step 9: Finalize
  actions_executed: TeamDelete {invoked → ok | failed → manual cleanup suggested | skipped (TEAM_MODE=false)}; user report displayed; audit log {closed | not enabled}; worktree decision: {kept | removed | asked user}
  artifacts_produced: final user-facing report; CHK-WORKFLOW-COMPLETE emitted
  next_step: WORKFLOW-COMPLETE
```

This is the LAST step of `bmad-auto-flow`. After CHK-STEP-09-EXIT, the workflow exits cleanly. The retrospective step (per `~/.claude/skills/bmad-shared/retrospective-step.md`) may activate next if difficulties were encountered.
