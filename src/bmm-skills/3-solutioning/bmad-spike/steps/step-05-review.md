---
nextStepFile: './step-06-stories.md'
---

# Step 5: Review


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Review with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Present the complete deliverable for review. Offer adversarial review, editing, and questioning. The deliverable must be validated before publishing.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- Present the work clearly and invite critique
- The adversarial review specifically challenges: Is evidence sufficient? Are options missing? Does the recommendation follow from evidence? Are risks understated?
- Accept edits gracefully — the user's judgment on the recommendation is final

### Step-Specific Rules:

- The user MUST explicitly select 'C' to proceed — never auto-proceed from this step
- Loop the menu until the user is satisfied
- Every edit re-presents the full deliverable

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Loop menu until user selects 'C'

---

## MANDATORY SEQUENCE

### 1. Present Complete Deliverable

Display the full deliverable content from Step 4 (with any accumulated revisions). Include a summary header:

> **Spike Deliverable — Ready for Review**
>
> | Metric | Value |
> |--------|-------|
> | Type | {spike_type} |
> | Format | {output_format} |
> | KACs answered | {count} / {total} |
> | Verdict | {GO / NO-GO / GO WITH CAVEATS} |
> | Follow-up stories | {count} |
> | Evidence sources | {count} (code, docs, PoC, benchmarks) |
>
> {full deliverable content}

### 2. Update WIP

Add this step to `stepsCompleted`.

### 3. Present Menu

> **[C]** Continue to story creation (Step 6)
> **[E]** Edit — modify the deliverable
> **[Q]** Questions — ask about findings or methodology
> **[A]** Advanced Elicitation — deep challenge on the deliverable
> **[P]** Party Mode — multi-agent perspectives on the deliverable
> **[R]** Adversarial Review — formal critical review

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}

- **E**: Ask user what to edit. Apply edits. Re-present the full deliverable. Redisplay menu.

- **Q**: Answer user's questions about the findings, methodology, evidence, or recommendation. Redisplay menu.

- **A**: Run `{advanced_elicitation}` with the deliverable content as input. Process output — present proposed changes. Ask user to accept/reject each change. Apply accepted changes. Re-present deliverable. Redisplay menu.

- **P**: Run `{party_mode}` with the deliverable content as input. Process output — present perspectives. Ask user which perspectives to incorporate. Apply accepted changes. Re-present deliverable. Redisplay menu.

- **R**: Run adversarial review (see below). Process findings. Return to menu.

### Adversarial Review [R] Process

Invoke `{adversarial_review}` with the deliverable content. The review specifically challenges:

1. **Evidence sufficiency**: Is the evidence actually enough to support the recommendation? Are there gaps?
2. **Missing options**: Were relevant alternatives not considered?
3. **Logic chain**: Does the recommendation logically follow from the evidence?
4. **Risk assessment**: Are risks understated or mitigations handwaved?
5. **Confirmation bias**: Did the investigation favor a pre-existing preference?
6. **Reproducibility**: Could someone reproduce the PoC/benchmark results?

If the review returns zero findings: re-analyze — zero findings on an investigation deliverable is suspicious.

Order findings by severity. Present as table:

| # | Severity | Finding | Proposed Action |
|---|----------|---------|-----------------|
| 1 | {HIGH/MEDIUM/LOW} | {description} | {specific action} |

Ask user which findings to accept. Apply accepted findings to the deliverable. Re-present. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Deliverable presented clearly with summary metrics
- User explicitly selects 'C' to proceed
- All accepted edits/review findings incorporated
- Deliverable in final state before publishing

### FAILURE:

- Auto-proceeding without explicit 'C'
- Not re-presenting deliverable after edits
- Ignoring adversarial review findings
- Accepting zero findings from adversarial review without re-analysis

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Review
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
