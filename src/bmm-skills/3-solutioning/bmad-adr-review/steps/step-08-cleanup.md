---
nextStepFile: null
---

# Step 8: Cleanup


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
CHK-STEP-08-ENTRY PASSED — entering Step 8: Cleanup with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Clean up worktree (with user consent), delete WIP file, and present final summary.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- Never auto-remove the worktree — always ask
- The review is complete — this is housekeeping only

### Step-Specific Rules:

- WIP file is always deleted (review is complete)
- Worktree removal requires explicit user consent

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly

---

## MANDATORY SEQUENCE

### 1. Worktree Cleanup

**Apply §3 Cleanup from `bmad-shared/lifecycle/worktree-lifecycle.md`.**

<check if="REUSED_CURRENT_WORKTREE == true">
  The workflow reused the user's current worktree. Do NOT remove it — log "Worktree reused — cleanup skipped (user's worktree)." and skip the prompt below.
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == true">

  > **Worktree cleanup:**
  > Path: `{WORKTREE_PATH}`
  >
  > **[R]** Remove worktree | **[K]** Keep worktree

  WAIT for user selection.

  - **R**: Remove worktree:
    ```bash
    cd {MAIN_PROJECT_ROOT}
    git worktree remove {WORKTREE_PATH} --force
    git worktree prune
    ```
  - **K**: Keep worktree. Log: "Worktree kept at {WORKTREE_PATH}"
</check>

<check if="REUSED_CURRENT_WORKTREE != true AND worktree_enabled == false">
  No worktree to remove — skip this step.
</check>

### 2. Delete WIP File

```bash
rm /tmp/bmad-wip-adr-review-{SLUG}.md
```

### 3. Present Final Summary

> **ADR Review Complete**
>
> | Field | Value |
> |-------|-------|
> | ADR | {adr_title} |
> | Source | {source_type}: {source_reference} |
> | Verdict | **{APPROVE / IMPROVE / REJECT}** ({confidence}) |
> | Findings | {blocker}B / {major}M / {minor}m / {info}I |
> | Accepted | {accepted_count} |
> | Rejected | {rejected_count} |
> | Skipped | {skipped_count} |
> | Anti-patterns | {detected_list or "none"} |
> | Published to | {destination}: {reference_or_path} |
> | Worktree | {removed / kept at path} |

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- User chose worktree disposition
- WIP file deleted
- Summary presented with all key metrics

### FAILURE:

- Auto-removing worktree without asking
- Leaving WIP file behind
- Not presenting final summary

---

## STEP EXIT (CHK-STEP-08-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Cleanup
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-adr-review executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '07', '08']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '07', '08'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
