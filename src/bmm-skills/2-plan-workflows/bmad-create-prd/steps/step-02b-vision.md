# Step 2b: Product Vision Discovery


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02b-ENTRY PASSED — entering Step 2b: Product Vision Discovery with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Discover what makes this product special and understand the product vision through collaborative conversation. No content generation -- facilitation only. This step ONLY discovers; it does NOT write to the document.

## RULES

- Focus on discovering vision and differentiator -- no content generation yet
- FORBIDDEN to generate executive summary content (that's the next step)
- FORBIDDEN to append anything to the document in this step
- Build on classification insights from step 2
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Acknowledge Classification Context

Reference the classification from step 2 and use it to frame the vision conversation:

"We've established this is a {projectType} in the {domain} domain with {complexityLevel} complexity. Now let's explore what makes this product special."

### 2. Explore What Makes It Special

Guide the conversation to uncover the product's unique value:

- **User delight:** "What would make users say 'this is exactly what I needed'?"
- **Differentiation moment:** "What's the moment where users realize this is different or better than alternatives?"
- **Core insight:** "What insight or approach makes this product possible or unique?"
- **Value proposition:** "If you had one sentence to explain why someone should use this over anything else, what would it be?"

### 3. Understand the Vision

Dig deeper into the product vision:

- **Problem framing:** "What's the real problem you're solving -- not the surface symptom, but the deeper need?"
- **Future state:** "When this product is successful, what does the world look like for your users?"
- **Why now:** "Why is this the right time to build this?"

### 4. Validate Understanding

Reflect back what you've heard and confirm:

"Here's what I'm hearing about your vision and differentiator:

**Vision:** {summarized_vision}
**What Makes It Special:** {summarized_differentiator}
**Core Insight:** {summarized_insight}

Does this capture it? Anything I'm missing?"

Let the user confirm or refine your understanding.

### N. Present MENU OPTIONS

Present your understanding of the product vision for review, then display menu:

"Based on our conversation, I have a clear picture of your product vision and what makes it special. I'll use these insights to draft the Executive Summary in the next step.

**What would you like to do?**"

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Executive Summary"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current vision insights, process the enhanced insights that come back, ask user if they accept the improvements, if yes update understanding then redisplay menu, if no keep original understanding then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current vision insights, process the collaborative insights, ask user if they accept the changes, if yes update understanding then redisplay menu, if no keep original understanding then redisplay menu
- IF C: Update {outputFile} frontmatter by adding this step name to the end of stepsCompleted array, then read fully and follow: ./step-02c-executive-summary.md
- IF Any other: help user respond, then redisplay menu

---

## STEP EXIT (CHK-STEP-02b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02b-EXIT PASSED — completed Step 2b: Product Vision Discovery
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
