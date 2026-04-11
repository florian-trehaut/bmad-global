---
nextStepFile: null
---

# Step 14: Workflow Completion

## STEP GOAL

Finalize the UX design specification document, update workflow status, and suggest next steps for the project.

## RULES

- This is a FINAL step -- no further steps after this
- Update output file frontmatter with final `stepsCompleted` to indicate completion
- FORBIDDEN: loading additional steps after this one

## SEQUENCE

### 1. Announce Workflow Completion

"**UX Design Complete, {user_name}!**

I've successfully collaborated with you to create a comprehensive UX design specification for {project_name}.

**What we've accomplished:**

- Project understanding and user insights
- Core experience and emotional response definition
- UX pattern analysis and inspiration
- Design system choice and implementation strategy
- Core interaction definition and experience mechanics
- Visual design foundation (colors, typography, spacing)
- Design direction mockups and visual explorations
- User journey flows and interaction design
- Component strategy and custom component specifications
- UX consistency patterns for common interactions
- Responsive design and accessibility strategy

**The complete UX design specification is now available at:** `{planning_artifacts}/ux-design-specification.md`

**Supporting Visual Assets:**
- Color themes visualizer: `{planning_artifacts}/ux-color-themes.html`
- Design directions mockups: `{planning_artifacts}/ux-design-directions.html`

This specification is now ready to guide visual design, implementation, and development."

### 2. Workflow Status Update

- Load the project's workflow status file (if one exists)
- Update workflow_status["create-ux-design"] = `{planning_artifacts}/ux-design-specification.md`
- Save file, preserving all comments and structure
- Mark current timestamp as completion time
- Update output file frontmatter: append step 14 to `stepsCompleted`, set `lastStep = 14`

### 3. Suggest Next Steps

Invoke the `bmad-help` skill.

### 4. Final Completion Confirmation

Congratulate the user on the UX design specification you completed together.

**Next Steps Guidance:**

**Immediate Options:**
1. **Wireframe Generation** -- Create low-fidelity layouts based on UX spec
2. **Interactive Prototype** -- Build clickable prototypes for testing
3. **Solution Architecture** -- Technical design with UX context
4. **Figma Visual Design** -- High-fidelity UI implementation
5. **Epic Creation** -- Break down UX requirements for development

**Recommended Sequence:**
For design-focused teams: Wireframes -> Prototypes -> Figma Design -> Development
For technical teams: Architecture -> Epic Creation -> Development

Consider team capacity, timeline, and whether user validation is needed before implementation.

**Core Deliverables:**
- UX Design Specification: `{planning_artifacts}/ux-design-specification.md`
- Color Themes Visualizer: `{planning_artifacts}/ux-color-themes.html`
- Design Directions: `{planning_artifacts}/ux-design-directions.html`
