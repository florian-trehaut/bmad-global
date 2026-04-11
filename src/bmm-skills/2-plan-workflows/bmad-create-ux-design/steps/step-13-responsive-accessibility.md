---
nextStepFile: './step-14-complete.md'
---

# Step 13: Responsive Design & Accessibility

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
