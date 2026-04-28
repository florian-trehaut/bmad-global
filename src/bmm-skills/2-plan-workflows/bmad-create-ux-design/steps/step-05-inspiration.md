---
nextStepFile: './step-06-design-system.md'
---

# Step 5: UX Pattern Analysis & Inspiration


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
CHK-STEP-05-ENTRY PASSED — entering Step 5: UX Pattern Analysis & Inspiration with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Analyze inspiring products and UX patterns to inform design decisions. Extract transferable patterns and identify anti-patterns to avoid.

## RULES

- Build on emotional response goals from step 4
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper pattern insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives on UX patterns
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Identify User's Favorite Apps

"Let's learn from products your users already love and use regularly.

**Inspiration Questions:**

- Name 2-3 apps your target users already love and USE frequently
- For each one, what do they do well from a UX perspective?
- What makes the experience compelling or delightful?
- What keeps users coming back to these apps?

Think about apps in your category or even unrelated products that have great UX."

### 2. Analyze UX Patterns and Principles

"For each inspiring app, let's analyze their UX success:

**For [App Name]:**

- What core problem does it solve elegantly?
- What makes the onboarding experience effective?
- How do they handle navigation and information hierarchy?
- What are their most innovative or delightful interactions?
- What visual design choices support the user experience?
- How do they handle errors or edge cases?"

### 3. Extract Transferable Patterns

"**Transferable UX Patterns:**
Looking across these inspiring apps, I see patterns we could adapt:

**Navigation Patterns:**
- [Pattern 1] - could work for your [specific use case]
- [Pattern 2] - might solve your [specific challenge]

**Interaction Patterns:**
- [Pattern 1] - excellent for [your user goal]
- [Pattern 2] - addresses [your user pain point]

**Visual Patterns:**
- [Pattern 1] - supports your [emotional goal]
- [Pattern 2] - aligns with your [platform requirements]

Which of these patterns resonate most for your product?"

### 4. Identify Anti-Patterns to Avoid

"**UX Anti-Patterns to Avoid:**
From analyzing both successes and failures in your space:

- [Anti-pattern 1] - users find this confusing/frustrating
- [Anti-pattern 2] - this creates unnecessary friction
- [Anti-pattern 3] - doesn't align with your [emotional goals]

Learning from others' mistakes is as important as learning from their successes."

### 5. Define Design Inspiration Strategy

"**Design Inspiration Strategy:**

**What to Adopt:**
- [Specific pattern] - because it supports [your core experience]
- [Specific pattern] - because it aligns with [user needs]

**What to Adapt:**
- [Specific pattern] - modify for [your unique requirements]
- [Specific pattern] - simplify for [your user skill level]

**What to Avoid:**
- [Specific anti-pattern] - conflicts with [your goals]
- [Specific anti-pattern] - doesn't fit [your platform]

This strategy will guide our design decisions while keeping {project_name} unique."

### 6. Generate Inspiration Analysis Content

Prepare content to append to the document:

```markdown
## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

[Analysis of inspiring products based on conversation]

### Transferable UX Patterns

[Transferable patterns identified based on conversation]

### Anti-Patterns to Avoid

[Anti-patterns to avoid based on conversation]

### Design Inspiration Strategy

[Strategy for using inspiration based on conversation]
```

### 7. Present Content and Menu

"I've analyzed inspiring UX patterns to inform our design strategy for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Deepen our UX pattern analysis
[P] Party Mode - Bring different perspectives on inspiration sources
[C] Continue - Save this and move to design system choice"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: UX Pattern Analysis & Inspiration
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
