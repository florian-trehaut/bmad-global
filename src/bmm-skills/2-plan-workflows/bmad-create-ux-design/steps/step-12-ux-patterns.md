---
nextStepFile: './step-13-responsive-accessibility.md'
---

# Step 12: UX Consistency Patterns


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-12-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-12-ENTRY PASSED — entering Step 12: UX Consistency Patterns with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Establish UX consistency patterns for common situations: buttons, forms, navigation, feedback, modals, empty states, loading states, search, and filtering. Ensure integration with chosen design system.

## RULES

- Component strategy from step 11 and user journeys from step 10 inform pattern decisions
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper pattern insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives on consistency patterns
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Identify Pattern Categories

"Let's establish consistency patterns for how {project_name} behaves in common situations.

**Pattern Categories to Define:**
- Button hierarchy and actions
- Feedback patterns (success, error, warning, info)
- Form patterns and validation
- Navigation patterns
- Modal and overlay patterns
- Empty states and loading states
- Search and filtering patterns

Which categories are most critical for your product? We can go through each thoroughly or focus on the most important ones."

### 2. Define Critical Patterns First

For each critical pattern category:

"**[Pattern Type] Patterns:**
What should users see/do when they need to [pattern action]?

**Considerations:**
- Visual hierarchy (primary vs. secondary actions)
- Feedback mechanisms
- Error recovery
- Accessibility requirements
- Mobile vs. desktop considerations

**Examples:**
- [Example 1 for this pattern type]
- [Example 2 for this pattern type]

How should {project_name} handle [pattern type] interactions?"

### 3. Establish Pattern Guidelines

Pattern Guidelines Template:

```markdown
### [Pattern Type]

**When to Use:** [Clear usage guidelines]
**Visual Design:** [How it should look]
**Behavior:** [How it should interact]
**Accessibility:** [A11y requirements]
**Mobile Considerations:** [Mobile-specific needs]
**Variants:** [Different states or styles if applicable]
```

### 4. Design System Integration

"**Integration with [Design System]:**

- How do these patterns complement our design system components?
- What customizations are needed?
- How do we maintain consistency while meeting unique needs?

**Custom Pattern Rules:**
- [Custom rule 1]
- [Custom rule 2]
- [Custom rule 3]"

### 5. Create Pattern Documentation

Generate comprehensive pattern library:

- Clear usage guidelines for each pattern
- Visual examples and specifications
- Implementation notes for developers
- Accessibility checklists
- Mobile-first considerations

### 6. Generate UX Patterns Content

Prepare content to append to the document:

```markdown
## UX Consistency Patterns

### Button Hierarchy

[Button hierarchy patterns based on conversation]

### Feedback Patterns

[Feedback patterns based on conversation]

### Form Patterns

[Form patterns based on conversation]

### Navigation Patterns

[Navigation patterns based on conversation]

### Additional Patterns

[Additional patterns based on conversation]
```

### 7. Present Content and Menu

"I've established UX consistency patterns for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine our UX patterns
[P] Party Mode - Bring different perspectives on consistency patterns
[C] Continue - Save this and move to responsive design"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}

---

## STEP EXIT (CHK-STEP-12-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-12-EXIT PASSED — completed Step 12: UX Consistency Patterns
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
