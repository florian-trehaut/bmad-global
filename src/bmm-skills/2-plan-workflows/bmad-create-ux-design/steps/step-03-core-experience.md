---
nextStepFile: './step-04-emotional-response.md'
---

# Step 3: Core Experience Definition


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Core Experience Definition with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Define the core user experience, platform requirements, and what makes the interaction effortless. Establish experience principles that guide all subsequent UX decisions.

## RULES

- Build on project understanding from step 2
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper experience insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives on user experience
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Define Core User Action

"Now let's dig into the heart of the user experience for {project_name}.

**Core Experience Questions:**

- What's the ONE thing users will do most frequently?
- What user action is absolutely critical to get right?
- What should be completely effortless for users?
- If we nail one interaction, everything else follows -- what is it?

Think about the core loop or primary action that defines your product's value."

### 2. Explore Platform Requirements

"Let's define the platform context for {project_name}:

- Web, mobile app, desktop, or multiple platforms?
- Will this be primarily touch-based or mouse/keyboard?
- Any specific platform requirements or constraints?
- Do we need to consider offline functionality?
- Any device-specific capabilities we should leverage?"

### 3. Identify Effortless Interactions

"**Effortless Experience Design:**

- What user actions should feel completely natural and require zero thought?
- Where do users currently struggle with similar products?
- What interaction, if made effortless, would create delight?
- What should happen automatically without user intervention?
- Where can we eliminate steps that competitors require?"

### 4. Define Critical Success Moments

"**Critical Success Moments:**

- What's the moment where users realize 'this is better'?
- When does the user feel successful or accomplished?
- What interaction, if failed, would ruin the experience?
- What are the make-or-break user flows?
- Where does first-time user success happen?"

### 5. Synthesize Experience Principles

"Based on our discussion, I'm hearing these core experience principles for {project_name}:

**Experience Principles:**
- [Principle 1 based on core action focus]
- [Principle 2 based on effortless interactions]
- [Principle 3 based on platform considerations]
- [Principle 4 based on critical success moments]

These principles will guide all our UX decisions. Do these capture what's most important?"

### 6. Generate Core Experience Content

Prepare content to append to the document:

```markdown
## Core User Experience

### Defining Experience

[Core experience definition based on conversation]

### Platform Strategy

[Platform requirements and decisions based on conversation]

### Effortless Interactions

[Effortless interaction areas identified based on conversation]

### Critical Success Moments

[Critical success moments defined based on conversation]

### Experience Principles

[Guiding principles for UX decisions based on conversation]
```

### 7. Present Content and Menu

"I've defined the core user experience for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine the core experience definition
[P] Party Mode - Bring different perspectives on the user experience
[C] Continue - Save this and move to emotional response definition"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Core Experience Definition
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
