---
nextStepFile: './step-05-verdict.md'
---

# Step 4: Internal FAQ


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Internal FAQ with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Stress-test the concept from the builder's side. The customer FAQ asked "should I use this?" The internal FAQ asks "can we actually pull this off -- and should we?" You are now the internal stakeholder panel -- engineering lead, finance, legal, operations, the CEO who has seen a hundred pitches. The press release was inspiring. Now prove it is real.

## RULES

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step, ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread
- Coaching stance: Be direct, challenge vague thinking, but offer concrete alternatives when the user is stuck -- tough love, not tough silence
- Calibrate all question framing to `{concept_type}` (commercial, internal tool, open-source, community/nonprofit)
- All output written to documents must use `{DOCUMENT_OUTPUT_LANGUAGE}`

## SEQUENCE

### 1. Generate Internal FAQ Questions

**Generate 6-10 internal FAQ questions** that cover these angles:

- **Feasibility:** "What is the hardest technical problem here?" / "What do we not know how to build yet?" / "What are the key dependencies and risks?"
- **Business viability:** "What does the unit economics look like?" / "How do we acquire the first 100 customers?" / "What is the competitive moat -- and how durable is it?"
- **Resource reality:** "What does the team need to look like?" / "What is the realistic timeline to a usable product?" / "What do we have to say no to in order to do this?"
- **Risk:** "What kills this?" / "What is the worst-case scenario if we ship and it does not work?" / "What regulatory or legal exposure exists?"
- **Strategic fit:** "Why us? Why now?" / "What does this cannibalize?" / "If this succeeds, what does the company look like in 3 years?"
- **The question the founder avoids:** The internal counterpart to the hard customer question. The thing that keeps them up at night but has not been said out loud.

**Calibrate questions to context.** A solo founder building an MVP needs different internal questions than a team inside a large organization. Do not ask about "board alignment" for a weekend project. Do not ask about "weekend viability" for an enterprise product. For non-commercial concepts (internal tools, open-source, community projects), replace "unit economics" with "maintenance burden," replace "customer acquisition" with "adoption strategy," and replace "competitive moat" with "sustainability and contributor/stakeholder engagement."

### 2. Coach the Answers

Same approach as Customer FAQ -- draft, challenge, refine:

1. **Present all questions at once.**
2. **Work through answers.** Demand specificity. "We will figure it out" is not an answer. Neither is "we will hire for that." What is the actual plan?
3. **Honest unknowns are fine -- unexamined unknowns are not.** If the answer is "we do not know yet," the follow-up is: "What would it take to find out, and when do you need to know by?"
4. **Watch for hand-waving on resources and timeline.** These are the most commonly over-optimistic answers. Push for concrete scoping.

### 3. Headless Mode

If running headless: generate questions calibrated to context and best-effort answers. Flag high-risk areas and unknowns prominently.

### 4. Update the Document

Append the Internal FAQ section to the output document at `{planning_artifacts}/prfaq-{PROJECT_NAME}.md`. Update frontmatter: `status: "internal-faq"`, `stage: 4`, `updated` timestamp.

### 5. Coaching Notes Capture

Append a `<!-- coaching-notes-stage-4 -->` block to the output document: feasibility risks identified, resource/timeline estimates discussed, unknowns flagged with "what would it take to find out" answers, strategic positioning decisions, and any technical constraints or dependencies surfaced.

### 6. Save WIP

Update WIP file frontmatter: add `4` to `stepsCompleted`.

### 7. CHECKPOINT

This step is complete when the internal questions have honest, specific answers -- and the user has a clear-eyed view of what it actually takes to execute this concept. Optimism is fine. Delusion is not.

> The stakeholder panel is satisfied. Ready for the verdict?
>
> **[C]** Continue to The Verdict
> **[R]** Revisit -- I want to refine internal answers further

WAIT for user selection.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Internal FAQ
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `{nextStepFile}` — load the file with the Read tool, do not summarise from memory, do not skip sections.
