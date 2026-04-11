---
nextStepFile: './step-03-core-experience.md'
---

# Step 2: Project Understanding

## STEP GOAL

Understand the project context, target users, and what makes this product special from a UX perspective. Synthesize loaded documents and fill gaps through conversation.

## RULES

- Review all loaded context documents before asking questions
- Ask questions to fill gaps, not to repeat what documents already cover
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper project insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Review Loaded Context

Analyze what we know from the loaded documents:

"Based on the project documentation we have loaded, let me confirm what I'm understanding about {project_name}.

**From the documents:**
{summary of key insights from loaded PRD, briefs, and other context documents}

**Target Users:**
{summary of user information from loaded documents}

**Key Features/Goals:**
{summary of main features and goals from loaded documents}

Does this match your understanding? Are there any corrections or additions?"

### 2. Fill Context Gaps (If no documents or gaps exist)

If no documents were loaded or key information is missing:

"Since we don't have complete documentation, let's start with the essentials:

- **What are you building?** (Describe your product in 1-2 sentences)
- **Who is this for?** (Describe your ideal user or target audience)
- **What makes this special or different?** (What's the unique value proposition?)
- **What's the main thing users will do with this?** (Core user action or goal)"

### 3. Explore User Context Deeper

"Let me understand your users better to inform the UX design:

- What problem are users trying to solve?
- What frustrates them with current solutions?
- What would make them say 'this is exactly what I needed'?
- How tech-savvy are your target users?
- What devices will they use most?
- When/where will they use this product?"

### 4. Identify UX Design Challenges

"From what we've discussed, I'm seeing some key UX design considerations:

**Design Challenges:**
- [Identify 2-3 key UX challenges based on project type and user needs]
- [Note any platform-specific considerations]
- [Highlight any complex user flows or interactions]

**Design Opportunities:**
- [Identify 2-3 areas where great UX could create competitive advantage]
- [Note any opportunities for innovative UX patterns]

Does this capture the key UX considerations we need to address?"

### 5. Generate Project Understanding Content

Prepare content to append to the document:

```markdown
## Executive Summary

### Project Vision

[Project vision summary based on conversation]

### Target Users

[Target user descriptions based on conversation]

### Key Design Challenges

[Key UX challenges identified based on conversation]

### Design Opportunities

[Design opportunities identified based on conversation]
```

### 6. Present Content and Menu

Show the generated content and present choices:

"I've documented our understanding of {project_name} from a UX perspective.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[C] Continue - Save this and move to core experience definition"

### 7. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}
