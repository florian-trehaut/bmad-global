# Step 6: Resolve Findings

**Goal:** Handle adversarial review findings interactively, apply fixes, finalize.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teammate-mode-routing.md`, when TEAMMATE_MODE=true:

- §A — every per-finding interactive prompt is rerouted via SendMessage `question` payload; block on reply.
- §B — any tracker write (status update, MR creation) goes through `tracker_write_request` SendMessage (constraint `tracker_writes: false` enforced).
- §D — the workflow ends with a `phase_complete` SendMessage to the lead with verdict DONE / FINDINGS, the MR URL (if created) as a deliverable, and the resolved findings summary.

When TEAMMATE_MODE=false, proceed below as normal.

---


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Resolve Findings with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## RESOLUTION OPTIONS

Present: "How would you like to handle these findings?"

**[W] Walk through** — Discuss each finding individually
**[F] Fix automatically** — Automatically fix issues classified as "real"
**[S] Skip** — Acknowledge and proceed

ALWAYS halt and wait for user input.

## BLOCKER findings — non-skippable

Findings flagged BLOCKER from the v2 spec audit (scope creep into Out-of-Scope, Boundaries Never-Do violation, missing Security Gate remediation, broken EARS pattern coverage on tested TACs) cannot be Skipped. The user must Fix or Walk-through them. If the user attempts [S] on a BLOCKER, refuse and re-present the menu with only [W] and [F] available for those findings.

This mirrors create-story step-12 multi-validator semantics (no BLOCKER → Step 13 publication).

---

## WALK THROUGH [W]

For each finding in order:
1. Present the finding with context
2. Ask: **fix now / skip / discuss**
3. If fix: Apply the fix immediately
4. If skip: Note as acknowledged, continue
5. If discuss: Provide more context, re-ask
6. Move to next finding

After all findings processed, summarize what was fixed/skipped.

---

## FIX AUTOMATICALLY [F]

1. Filter findings to only those classified as "real"
2. Apply fixes for each real finding
3. Report what was fixed:

```
**Auto-fix Applied:**
- F1: {description of fix}
- F3: {description of fix}
...

Skipped (noise/uncertain): F2, F4
```

---

## SKIP [S]

1. Acknowledge all findings were reviewed
2. Note that user chose to proceed without fixes
3. Continue to completion

---

## UPDATE TECH-SPEC (Mode A only)

If `{execution_mode}` is "tech-spec":
1. Load `{tech_spec_path}`
2. Update status to "Completed"
3. Add review notes with finding count, fixes applied, resolution approach
4. Save changes

---

## COMPLETION OUTPUT

```
**Review complete. Ready to commit.**

**Implementation Summary:**
- {what was implemented}
- Files modified: {count}
- Tests: {status}
- Review findings: {X} addressed, {Y} skipped
```

---

## WORKFLOW COMPLETE

This is the final step. The Quick Dev workflow is now complete.

User can:
- Commit changes
- Run additional tests
- Start new Quick Dev session

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Resolve Findings
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-quick-dev executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
