---
nextStepFile: './step-09-design-directions.md'
---

# Step 8: Visual Foundation

## STEP GOAL

Establish the visual design foundation including color system, typography, spacing, and layout. Ensure accessibility compliance for all visual choices.

## RULES

- Design system choice from step 6 and emotional response goals from step 4 inform visual decisions
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper visual insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for design perspectives on visual choices
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Brand Guidelines Assessment

"Do you have existing brand guidelines or a specific color palette I should follow? (y/n)

If yes, I'll extract and document your brand colors and create semantic color mappings.
If no, I'll generate theme options based on your project's personality and emotional goals from our earlier discussion."

### 2. Generate Color Theme Options (If no brand guidelines)

"If no existing brand guidelines, I'll create a color theme visualizer to help you explore options.

I can generate comprehensive HTML color theme visualizers with multiple theme options, complete UI examples, and the ability to see how colors work in real interface contexts.

This will help you make an informed decision about the visual direction for {project_name}."

### 3. Define Typography System

"**Typography Questions:**

- What should the overall tone feel like? (Professional, friendly, modern, classic?)
- How much text content will users read? (Headings only? Long-form content?)
- Any accessibility requirements for font sizes or contrast?
- Any brand fonts we must use?

**Typography Strategy:**
- Choose primary and secondary typefaces
- Establish type scale (h1, h2, h3, body, etc.)
- Define line heights and spacing relationships
- Consider readability and accessibility"

### 4. Establish Spacing and Layout Foundation

"**Spacing and Layout Foundation:**

- How should the overall layout feel? (Dense and efficient? Airy and spacious?)
- What spacing unit should we use? (4px, 8px, 12px base?)
- How much white space should be between elements?
- Should we use a grid system? If so, what column structure?

**Layout Principles:**
- [Layout principle 1 based on product type]
- [Layout principle 2 based on user needs]
- [Layout principle 3 based on platform requirements]"

### 5. Create Visual Foundation Strategy

"**Visual Foundation Strategy:**

**Color System:**
- [Color strategy based on brand guidelines or generated themes]
- Semantic color mapping (primary, secondary, success, warning, error, etc.)
- Accessibility compliance (contrast ratios)

**Typography System:**
- [Typography strategy based on content needs and tone]
- Type scale and hierarchy
- Font pairing rationale

**Spacing & Layout:**
- [Spacing strategy based on content density and platform]
- Grid system approach
- Component spacing relationships

This foundation will ensure consistency across all our design decisions."

### 6. Generate Visual Foundation Content

Prepare content to append to the document:

```markdown
## Visual Design Foundation

### Color System

[Color system strategy based on conversation]

### Typography System

[Typography system strategy based on conversation]

### Spacing & Layout Foundation

[Spacing and layout foundation based on conversation]

### Accessibility Considerations

[Accessibility considerations based on conversation]
```

### 7. Present Content and Menu

"I've established the visual design foundation for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine our visual foundation
[P] Party Mode - Bring design perspectives on visual choices
[C] Continue - Save this and move to design directions"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}
