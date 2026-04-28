---
nextStepFile: './step-10-user-journeys.md'
---

# Step 9: Design Direction Mockups


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-09-ENTRY PASSED — entering Step 9: Design Direction Mockups with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate comprehensive design direction mockups showing different visual approaches. Facilitate user selection through interactive exploration and comparison.

## RULES

- Visual foundation from step 8 provides design tokens; core experience from step 7 informs layout
- Generate HTML visualizer for design directions exploration
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper design insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives on design directions
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Generate Design Direction Variations

"I'll generate 6-8 different design direction variations exploring:

- Different layout approaches and information hierarchy
- Various interaction patterns and visual weights
- Alternative color applications from our foundation
- Different density and spacing approaches
- Various navigation and component arrangements

Each mockup will show a complete vision for {project_name} with all our design decisions applied."

### 2. Create HTML Design Direction Showcase

"I'm creating a comprehensive HTML design direction showcase at `{planning_artifacts}/ux-design-directions.html`

**What you'll see:**
- 6-8 full-screen mockup variations
- Interactive states and hover effects
- Side-by-side comparison tools
- Complete UI examples with real content
- Responsive behavior demonstrations

Each mockup represents a complete visual direction for your app's look and feel."

### 3. Present Design Exploration Framework

"As you explore the design directions, look for:

- **Layout Intuitiveness** - Which information hierarchy matches your priorities?
- **Interaction Style** - Which interaction style fits your core experience?
- **Visual Weight** - Which visual density feels right for your brand?
- **Navigation Approach** - Which navigation pattern matches user expectations?
- **Component Usage** - How well do the components support your user journeys?
- **Brand Alignment** - Which direction best supports your emotional goals?

Take your time exploring -- this is a crucial decision that will guide all our design work!"

### 4. Facilitate Design Direction Selection

"After exploring all the design directions:

**Which approach resonates most with you?**
- Pick a favorite direction as-is
- Combine elements from multiple directions
- Request modifications to any direction
- Use one direction as a base and iterate

**Tell me:**
- Which layout feels most intuitive for your users?
- Which visual weight matches your brand personality?
- Which interaction style supports your core experience?
- Are there elements from different directions you'd like to combine?"

### 5. Document Design Direction Decision

"Based on your exploration, I'm understanding your design direction preference:

**Chosen Direction:** [Direction number or combination]
**Key Elements:** [Specific elements you liked]
**Modifications Needed:** [Any changes requested]
**Rationale:** [Why this direction works for your product]

This will become our design foundation moving forward. Are we ready to lock this in, or do you want to explore variations?"

### 6. Generate Design Direction Content

Prepare content to append to the document:

```markdown
## Design Direction Decision

### Design Directions Explored

[Summary of design directions explored based on conversation]

### Chosen Direction

[Chosen design direction based on conversation]

### Design Rationale

[Rationale for design direction choice based on conversation]

### Implementation Approach

[Implementation approach based on chosen direction]
```

### 7. Present Content and Menu

"I've documented our design direction decision for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine our design direction
[P] Party Mode - Bring different perspectives on visual choices
[C] Continue - Save this and move to user journey flows"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}

---

## STEP EXIT (CHK-STEP-09-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-09-EXIT PASSED — completed Step 9: Design Direction Mockups
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
