---
nextStepFile: './step-14-complete.md'
---

# Step 13: Responsive Design & Accessibility


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-13-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-13-ENTRY PASSED — entering Step 13: Responsive Design & Accessibility with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Define the responsive design strategy (breakpoints, layout adaptation) and accessibility requirements (WCAG compliance level, testing strategy, implementation guidelines).

## RULES

- Platform requirements from step 3 and design direction from step 9 inform responsive choices
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper responsive/accessibility insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives on inclusive design
- **C (Continue)**: Save content and proceed to final step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Define Responsive Strategy

"Let's define how {project_name} adapts across different screen sizes and devices.

**Desktop Strategy:**
- How should we use extra screen real estate?
- Multi-column layouts, side navigation, or content density?
- What desktop-specific features can we include?

**Tablet Strategy:**
- Should we use simplified layouts or touch-optimized interfaces?
- How do gestures and touch interactions work on tablets?
- What's the optimal information density for tablet screens?

**Mobile Strategy:**
- Bottom navigation or hamburger menu?
- How do layouts collapse on small screens?
- What's the most critical information to show mobile-first?"

### 2. Establish Breakpoint Strategy

"**Breakpoint Strategy:**
We need to define screen size breakpoints where layouts adapt.

**Common Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**For {project_name}, should we:**
- Use standard breakpoints or custom ones?
- Focus on mobile-first or desktop-first design?
- Have specific breakpoints for your key use cases?"

### 3. Design Accessibility Strategy

"**Accessibility Strategy:**
What level of WCAG compliance does {project_name} need?

**WCAG Levels:**
- **Level A (Basic)** -- Essential accessibility for legal compliance
- **Level AA (Recommended)** -- Industry standard for good UX
- **Level AAA (Highest)** -- Exceptional accessibility (rarely needed)

**Based on your product:**
- [Recommendation based on user base, legal requirements, etc.]

**Key Accessibility Considerations:**
- Color contrast ratios (4.5:1 for normal text)
- Keyboard navigation support
- Screen reader compatibility
- Touch target sizes (minimum 44x44px)
- Focus indicators and skip links"

### 4. Define Testing Strategy

"**Testing Strategy:**

**Responsive Testing:**
- Device testing on actual phones/tablets
- Browser testing across Chrome, Firefox, Safari, Edge
- Real device network performance testing

**Accessibility Testing:**
- Automated accessibility testing tools
- Screen reader testing (VoiceOver, NVDA, JAWS)
- Keyboard-only navigation testing
- Color blindness simulation testing

**User Testing:**
- Include users with disabilities in testing
- Test with diverse assistive technologies
- Validate with actual target devices"

### 5. Document Implementation Guidelines

"**Implementation Guidelines:**

**Responsive Development:**
- Use relative units (rem, %, vw, vh) over fixed pixels
- Implement mobile-first media queries
- Test touch targets and gesture areas
- Optimize images and assets for different devices

**Accessibility Development:**
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation implementation
- Focus management and skip links
- High contrast mode support"

### 6. Generate Responsive & Accessibility Content

Prepare content to append to the document:

```markdown
## Responsive Design & Accessibility

### Responsive Strategy

[Responsive strategy based on conversation]

### Breakpoint Strategy

[Breakpoint strategy based on conversation]

### Accessibility Strategy

[Accessibility strategy based on conversation]

### Testing Strategy

[Testing strategy based on conversation]

### Implementation Guidelines

[Implementation guidelines based on conversation]
```

### 7. Present Content and Menu

"I've defined the responsive design and accessibility strategy for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine our responsive/accessibility strategy
[P] Party Mode - Bring different perspectives on inclusive design
[C] Continue - Save this and complete the workflow"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}

---

## STEP EXIT (CHK-STEP-13-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-13-EXIT PASSED — completed Step 13: Responsive Design & Accessibility
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
