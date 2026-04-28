---
nextStepFile: './step-07-defining-experience.md'
---

# Step 6: Design System Choice


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
CHK-STEP-06-ENTRY PASSED — entering Step 6: Design System Choice with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Choose the appropriate design system approach based on project requirements, constraints, and team capabilities. Document the rationale and customization strategy.

## RULES

- Platform requirements from step 3 and inspiration patterns from step 5 inform this decision
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper design system insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for technical perspectives on design systems
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Present Design System Options

"For {project_name}, we need to choose a design system foundation. Think of design systems like LEGO blocks for UI -- they provide proven components and patterns, ensuring consistency and speeding development.

**Design System Approaches:**

**1. Custom Design System**
- Complete visual uniqueness
- Full control over every component
- Higher initial investment
- Perfect for established brands with unique needs

**2. Established System (Material Design, Ant Design, etc.)**
- Fast development with proven patterns
- Great defaults and accessibility built-in
- Less visual differentiation
- Ideal for startups or internal tools

**3. Themeable System (MUI, Chakra UI, Tailwind UI)**
- Customizable with strong foundation
- Brand flexibility with proven components
- Moderate learning curve
- Good balance of speed and uniqueness

Which direction feels right for your project?"

### 2. Analyze Project Requirements

"**Let's consider your specific needs:**

**Based on our previous conversations:**
- Platform: [platform from step 3]
- Timeline: [inferred from user conversation]
- Team Size: [inferred from user conversation]
- Brand Requirements: [inferred from user conversation]
- Technical Constraints: [inferred from user conversation]

**Decision Factors:**
- Need for speed vs. need for uniqueness
- Brand guidelines or existing visual identity
- Team's design expertise
- Long-term maintenance considerations
- Integration requirements with existing systems"

### 3. Explore Specific Design System Options

"**Recommended Options Based on Your Needs:**

**For [Your Platform Type]:**
- [Option 1] - [Key benefit] - [Best for scenario]
- [Option 2] - [Key benefit] - [Best for scenario]
- [Option 3] - [Key benefit] - [Best for scenario]

**Considerations:**
- Component library size and quality
- Documentation and community support
- Customization capabilities
- Accessibility compliance
- Performance characteristics
- Learning curve for your team"

### 4. Facilitate Decision Process

"**Decision Framework:**

1. What's most important: Speed, uniqueness, or balance?
2. How much design expertise does your team have?
3. Are there existing brand guidelines to follow?
4. What's your timeline and budget?
5. Long-term maintenance needs?

Let's evaluate options based on your answers to these questions."

### 5. Finalize Design System Choice

"Based on our analysis, I recommend [Design System Choice] for {project_name}.

**Rationale:**
- [Reason 1 based on project needs]
- [Reason 2 based on constraints]
- [Reason 3 based on team considerations]

**Next Steps:**
- We'll customize this system to match your brand and needs
- Define component strategy for custom components needed
- Establish design tokens and patterns

Does this design system choice feel right to you?"

### 6. Generate Design System Content

Prepare content to append to the document:

```markdown
## Design System Foundation

### Design System Choice

[Design system choice based on conversation]

### Rationale for Selection

[Rationale for design system selection based on conversation]

### Implementation Approach

[Implementation approach based on chosen system]

### Customization Strategy

[Customization strategy based on project needs]
```

### 7. Present Content and Menu

"I've documented our design system choice for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine our design system decision
[P] Party Mode - Bring technical perspectives on design systems
[C] Continue - Save this and move to defining experience"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Design System Choice
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
