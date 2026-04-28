---
nextStepFile: './step-03-customer-faq.md'
---

# Step 2: The Press Release


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: The Press Release with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Produce a press release that would make a real customer stop scrolling and pay attention. Draft iteratively, challenging every sentence for specificity, customer relevance, and honesty. This is the heart of Working Backwards.

## RULES

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step, ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread
- Coaching stance: Be direct, challenge vague thinking, but offer concrete alternatives when the user is stuck -- tough love, not tough silence
- All output written to documents must use `{DOCUMENT_OUTPUT_LANGUAGE}`

## SEQUENCE

### 1. Concept Type Adaptation

Check `{concept_type}` (commercial product, internal tool, open-source, community/nonprofit). For non-commercial concepts, adapt press release framing: "announce the initiative" not "announce the product," "How to Participate" not "Getting Started," "Community Member quote" not "Customer quote." The structure stays -- the language shifts to match the audience.

### 2. The Forge

The press release has a specific structure, and each part earns its place by forcing a different type of clarity:

| Section | What It Forces |
|---------|---------------|
| **Headline** | Can you say what this is in one sentence a customer would understand? |
| **Subheadline** | Who benefits and what changes for them? |
| **Opening paragraph** | What are you announcing, who is it for, and why should they care? |
| **Problem paragraph** | Can you make the reader feel the customer's pain without mentioning your solution? |
| **Solution paragraph** | What changes for the customer? (Not: what did you build.) |
| **Leader quote** | What is the vision beyond the feature list? |
| **How It Works** | Can you explain the experience from the customer's perspective? |
| **Customer quote** | Would a real person say this? Does it sound human? |
| **Getting Started** | Is the path to value clear and concrete? |

### 3. Coaching Approach

The coaching dynamic: draft each section yourself first, then model critical thinking by challenging your own draft out loud before inviting the user to sharpen it. Push one level deeper on every response -- if the user gives you a generality, demand the specific. The cycle is: draft, self-challenge, invite, deepen.

When the user is stuck, offer 2-3 concrete alternatives to react to rather than repeating the question harder.

### 4. Quality Bars

These are the standards to hold the press release to. Do not enumerate them to the user -- embody them in your challenges:

- **No jargon** -- If a customer would not use the word, neither should the press release
- **No weasel words** -- "significantly", "revolutionary", "best-in-class" are banned. Replace with specifics.
- **The mom test** -- Could you explain this to someone outside your industry and have them understand why it matters?
- **The "so what?" test** -- Every sentence should survive "so what?" If it cannot, cut or sharpen it.
- **Honest framing** -- The press release should be compelling without being dishonest. If you are overselling, the customer FAQ will expose it.

### 5. Headless Mode

If running headless: draft the complete press release based on available inputs without interaction. Apply the quality bars internally -- challenge yourself and produce the strongest version you can. Write directly to the output document.

### 6. Update the Document

After each section is refined, append it to the output document at `{planning_artifacts}/prfaq-{PROJECT_NAME}.md`. Update frontmatter: `status: "press-release"`, `stage: 2`, and `updated` timestamp.

### 7. Coaching Notes Capture

Append a `<!-- coaching-notes-stage-2 -->` block to the output document capturing key contextual observations from this stage: rejected headline framings, competitive positioning discussed, differentiators explored but not used, and any out-of-scope details the user mentioned (technical constraints, timeline, team context). These notes survive context compaction and feed the Step 5 distillate.

### 8. Save WIP

Update WIP file frontmatter: add `2` to `stepsCompleted`.

### 9. CHECKPOINT

This step is complete when the full press release reads as a coherent, compelling announcement that a real customer would find relevant. The user should feel proud of what they have written -- and confident every sentence earned its place.

> The press release is forged. Ready to face the customer's hardest questions?
>
> **[C]** Continue to Customer FAQ
> **[R]** Revisit -- I want to refine the press release further

WAIT for user selection.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: The Press Release
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `{nextStepFile}` — load the file with the Read tool, do not summarise from memory, do not skip sections.
