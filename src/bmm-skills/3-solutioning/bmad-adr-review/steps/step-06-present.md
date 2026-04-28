---
nextStepFile: './step-07-publish.md'
---

# Step 6: Present Findings & Verdict


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
CHK-STEP-06-ENTRY PASSED — entering Step 6: Present Findings & Verdict with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Compute verdict from accumulated findings, present findings interactively for reviewer confirmation, and finalize the review assessment.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- Present findings neutrally — let the evidence speak
- The user can ACCEPT, REJECT, MODIFY, or SKIP each finding
- The user can override the computed verdict — their judgment is final

### Step-Specific Rules:

- The user MUST explicitly select 'C' to proceed — never auto-proceed from this step
- Loop the menu until the user is satisfied
- Every edit re-presents the findings summary
- Present BLOCKERs first, then MAJORs, then MINORs, then INFOs

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Loop menu until user selects 'C'

---

## MANDATORY SEQUENCE

### 1. Compute Verdict

Collect ALL findings from steps 2-5. Apply decision rules from `data/review-criteria.md`:

- **APPROVE**: 0 BLOCKERs AND ≤2 MAJORs (all with clear mitigations) AND decision is sound
- **IMPROVE**: 0 BLOCKERs AND (>2 MAJORs OR MAJORs without clear mitigations) AND decision direction is sound
- **REJECT**: ≥1 BLOCKER OR fundamental reasoning flaw OR evidence contradicts decision

Compute confidence:
- **HIGH**: All claims fact-checked, evidence verified, codebase thoroughly scanned
- **MEDIUM**: Most claims checked, some evidence unverifiable
- **LOW**: Limited codebase access, many claims unverifiable

### 2. Present Summary

> **ADR Review — Findings Summary**
>
> **Verdict: {APPROVE | IMPROVE | REJECT}** (Confidence: {HIGH | MEDIUM | LOW})
>
> | Severity | Count |
> |----------|-------|
> | BLOCKER | {N} |
> | MAJOR | {N} |
> | MINOR | {N} |
> | INFO | {N} |
>
> | Category | Findings | Highest Severity |
> |----------|----------|-----------------|
> | Fact Check | {N} | {severity} |
> | Reasoning | {N} | {severity} |
> | Alternatives | {N} | {severity} |
> | Coherence | {N} | {severity} |
> | Consequences | {N} | {severity} |
> | Evidence | {N} | {severity} |
> | NFR Readiness | {N} | {severity} |
>
> **Anti-patterns detected:** {list or "none"}

### 3. Present Findings Interactively

Present findings one by one, BLOCKERs first:

For each finding:

> **F-{N}: {title}**
> - Category: {category} | Severity: {severity}
> - ADR Section: {section}
> - Detail: {detail}
> - Evidence: {evidence}
> - Proposed Action: {proposed_action}
>
> **[A]** Accept | **[R]** Reject | **[M]** Modify | **[S]** Skip

**Menu handling per finding:**

- **A**: Mark finding as ACCEPTED — included in final report
- **R**: Mark finding as REJECTED — excluded from report, log reason
- **M**: User provides modified version — update finding, mark ACCEPTED
- **S**: Mark finding as SKIPPED — mentioned in report but not counted toward verdict

After modifying/rejecting findings, recompute verdict if severity balance changed.

### 4. Present Final Verdict

After all findings reviewed:

> **Final Verdict: {APPROVE | IMPROVE | REJECT}** (Confidence: {confidence})
>
> **Accepted findings:** {N} | **Rejected:** {N} | **Skipped:** {N}
>
> {If IMPROVE:}
> **Conditions for approval:**
> 1. {condition from accepted MAJOR findings}
>
> {If REJECT:}
> **Blocking issues:**
> 1. {blocker from accepted BLOCKER findings}
>
> The user can override this verdict. Type the new verdict to override, or accept as-is.

WAIT for user confirmation or override.

<check if="user overrides verdict">
  Store override with user's justification.
  Log: "Verdict overridden: {old} → {new}. Reason: {justification}"
</check>

### 5. Update WIP

Add step 6 to `stepsCompleted`. Store final findings state and verdict.

### 6. Present Menu

> **[C]** Continue to publish (Step 7)
> **[E]** Edit findings — modify accepted/rejected state
> **[Q]** Questions — ask about findings or methodology
> **[R]** Adversarial Review — run `{adversarial_review}` for additional challenge

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **E**: Re-present findings for review. Redisplay menu.
- **Q**: Answer questions. Redisplay menu.
- **R**: Run `{adversarial_review}` on the ADR content with current findings as context. Process new findings — present each for ACCEPT/REJECT. Recompute verdict. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Verdict computed from decision rules (not gut feeling)
- All findings presented individually for user review
- User explicitly confirmed or overridden verdict
- User selected 'C' to proceed

### FAILURE:

- Auto-computing verdict without presenting findings
- Not allowing user to reject/modify findings
- Auto-proceeding without explicit 'C'
- Ignoring user verdict override

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Present Findings & Verdict
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
