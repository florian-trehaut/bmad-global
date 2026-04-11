---
nextStepFile: './step-12-ux-patterns.md'
---

# Step 11: Component Strategy

## STEP GOAL

Define the component library strategy. Analyze design system coverage, design custom components for gaps, and plan an implementation roadmap prioritized by user journey criticality.

## RULES

- Design system choice from step 6 determines available components; user journeys from step 10 identify component needs
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper component insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for technical perspectives on component design
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Analyze Design System Coverage

"Based on our chosen design system [design system from step 6], let's identify what components are already available and what we need to create custom.

**Available from Design System:**
[List of components available in chosen design system]

**Components Needed for {project_name}:**
Looking at our user journeys and design direction, we need:
- [Component need 1 from journey analysis]
- [Component need 2 from design requirements]
- [Component need 3 from core experience]

**Gap Analysis:**
- [Gap 1 -- needed but not available]
- [Gap 2 -- needed but not available]"

### 2. Design Custom Components

For each custom component needed:

"**[Component Name] Design:**

**Purpose:** What does this component do for users?
**Content:** What information or data does it display?
**Actions:** What can users do with this component?
**States:** What different states does it have? (default, hover, active, disabled, error, etc.)
**Variants:** Are there different sizes or styles needed?
**Accessibility:** What ARIA labels and keyboard support needed?

Let's walk through each custom component systematically."

### 3. Document Component Specifications

Component Specification Template:

```markdown
### [Component Name]

**Purpose:** [Clear purpose statement]
**Usage:** [When and how to use]
**Anatomy:** [Visual breakdown of parts]
**States:** [All possible states with descriptions]
**Variants:** [Different sizes/styles if applicable]
**Accessibility:** [ARIA labels, keyboard navigation]
**Content Guidelines:** [What content works best]
**Interaction Behavior:** [How users interact]
```

### 4. Define Component Strategy

"**Component Strategy:**

**Foundation Components:** (from design system)
- [Foundation component 1]
- [Foundation component 2]

**Custom Components:** (designed in this step)
- [Custom component 1 with rationale]
- [Custom component 2 with rationale]

**Implementation Approach:**
- Build custom components using design system tokens
- Ensure consistency with established patterns
- Follow accessibility best practices
- Create reusable patterns for common use cases"

### 5. Plan Implementation Roadmap

"**Implementation Roadmap:**

**Phase 1 -- Core Components:**
- [Component 1] -- needed for [critical flow]
- [Component 2] -- needed for [critical flow]

**Phase 2 -- Supporting Components:**
- [Component 3] -- enhances [user experience]
- [Component 4] -- supports [design pattern]

**Phase 3 -- Enhancement Components:**
- [Component 5] -- optimizes [user journey]
- [Component 6] -- adds [special feature]

This roadmap helps prioritize development based on user journey criticality."

### 6. Generate Component Strategy Content

Prepare content to append to the document:

```markdown
## Component Strategy

### Design System Components

[Analysis of available design system components based on conversation]

### Custom Components

[Custom component specifications based on conversation]

### Component Implementation Strategy

[Component implementation strategy based on conversation]

### Implementation Roadmap

[Implementation roadmap based on conversation]
```

### 7. Present Content and Menu

"I've defined the component strategy for {project_name}.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine our component strategy
[P] Party Mode - Bring technical perspectives on component design
[C] Continue - Save this and move to UX patterns"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}
