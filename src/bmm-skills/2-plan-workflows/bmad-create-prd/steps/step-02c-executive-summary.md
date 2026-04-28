# Step 2c: Executive Summary Generation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02c-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02c-ENTRY PASSED — entering Step 2c: Executive Summary Generation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate the Executive Summary content using insights from classification (step 2) and vision discovery (step 2b), then append it to the PRD document. This is the first substantive content in the PRD -- it sets the quality bar for everything that follows.

## RULES

- Generate content based on discovered insights -- present draft for review before appending
- FORBIDDEN to append content without user approval via 'C'
- Content must be dense, precise, and zero-fluff (PRD quality standards)
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Synthesize Available Context

Review all available context before drafting:

- Classification from step 2: project type, domain, complexity, project context
- Vision and differentiator from step 2b: what makes this special, core insight
- Input documents: product briefs, research, brainstorming, project docs

### 2. Draft Executive Summary Content

Generate the Executive Summary section. Apply PRD quality standards:

- High information density -- every sentence carries weight
- Zero fluff -- no filler phrases or vague language
- Precise and actionable -- clear, specific statements
- Dual-audience optimized -- readable by humans, consumable by LLMs

### 3. Present Draft for Review

Present the drafted content to the user for review:

"Here's the Executive Summary I've drafted based on our discovery work. Please review and let me know if you'd like any changes:"

Show the full drafted content using the structure from the APPEND TO DOCUMENT section below.

Allow the user to:

- Request specific changes to any section
- Add missing information
- Refine the language or emphasis
- Approve as-is

### N. Present MENU OPTIONS

"Here's the Executive Summary for your PRD. Review the content above and let me know what you'd like to do."

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Success Criteria"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current executive summary content, process the enhanced content that comes back, ask user if they accept the improvements, if yes update content then redisplay menu, if no keep original content then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current executive summary content, process the collaborative improvements, ask user if they accept the changes, if yes update content then redisplay menu, if no keep original content then redisplay menu
- IF C: Append the final content to {outputFile}, update frontmatter by adding this step name to the end of the stepsCompleted array, then read fully and follow: ./step-03-success.md
- IF Any other: help user respond, then redisplay menu

## APPEND TO DOCUMENT

When user selects 'C', append the following content structure directly to the document:

```markdown
## Executive Summary

{vision_alignment_content}

### What Makes This Special

{product_differentiator_content}

## Project Classification

{project_classification_content}
```

Where:

- `{vision_alignment_content}` -- Product vision, target users, and the problem being solved. Dense, precise summary drawn from step 2b vision discovery.
- `{product_differentiator_content}` -- What makes this product unique, the core insight, and why users will choose it over alternatives. Drawn from step 2b differentiator discovery.
- `{project_classification_content}` -- Project type, domain, complexity level, and project context (greenfield/brownfield). Drawn from step 2 classification.

---

## STEP EXIT (CHK-STEP-02c-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02c-EXIT PASSED — completed Step 2c: Executive Summary Generation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
