---
nextStepFile: './step-05-inspiration.md'
---

# Step 4: Desired Emotional Response

## STEP GOAL

Define the desired emotional responses users should feel when using the product. Map emotional goals to specific UX design choices.

## RULES

- Build on core experience definition from step 3
- FORBIDDEN: generating content without user input or confirmation
- Present A/P/C menu after content generation
- Write document content in `{DOCUMENT_OUTPUT_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

- **A (Advanced Elicitation)**: Invoke `bmad-advanced-elicitation` for deeper emotional insights
- **P (Party Mode)**: Invoke `bmad-party-mode` for multiple perspectives on emotional needs
- **C (Continue)**: Save content and proceed to next step

Protocols always return to this step's A/P/C menu. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Explore Core Emotional Goals

"Now let's think about how {project_name} should make users feel.

**Emotional Response Questions:**

- What should users FEEL when using this product?
- What emotion would make them tell a friend about this?
- How should users feel after accomplishing their primary goal?
- What feeling differentiates this from competitors?

Common emotional goals: Empowered and in control? Delighted and surprised? Efficient and productive? Creative and inspired? Calm and focused? Connected and engaged?"

### 2. Identify Emotional Journey Mapping

"**Emotional Journey Considerations:**

- How should users feel when they first discover the product?
- What emotion during the core experience/action?
- How should they feel after completing their task?
- What if something goes wrong -- what emotional response do we want?
- How should they feel when returning to use it again?"

### 3. Define Micro-Emotions

"**Micro-Emotions to Consider:**

- Confidence vs. Confusion
- Trust vs. Skepticism
- Excitement vs. Anxiety
- Accomplishment vs. Frustration
- Delight vs. Satisfaction
- Belonging vs. Isolation

Which of these emotional states are most critical for your product's success?"

### 4. Connect Emotions to UX Decisions

"**Design Implications:**

- If we want users to feel [emotional state], what UX choices support this?
- What interactions might create negative emotions we want to avoid?
- Where can we add moments of delight or surprise?
- How do we build trust and confidence through design?

**Emotion-Design Connections:**
- [Emotion 1] -> [UX design approach]
- [Emotion 2] -> [UX design approach]
- [Emotion 3] -> [UX design approach]"

### 5. Validate Emotional Goals

"Let me make sure I understand the emotional vision for {project_name}:

**Primary Emotional Goal:** [Summarize main emotional response]
**Secondary Feelings:** [List supporting emotional states]
**Emotions to Avoid:** [List negative emotions to prevent]

Does this capture the emotional experience you want to create? Any adjustments needed?"

### 6. Generate Emotional Response Content

Prepare content to append to the document:

```markdown
## Desired Emotional Response

### Primary Emotional Goals

[Primary emotional goals based on conversation]

### Emotional Journey Mapping

[Emotional journey mapping based on conversation]

### Micro-Emotions

[Micro-emotions identified based on conversation]

### Design Implications

[UX design implications for emotional responses based on conversation]

### Emotional Design Principles

[Guiding principles for emotional design based on conversation]
```

### 7. Present Content and Menu

"I've defined the desired emotional responses for {project_name}. These emotional goals will guide our design decisions.

**Here's what I'll add to the document:**
[Show the complete markdown content]

**What would you like to do?**
[A] Advanced Elicitation - Refine the emotional response definition
[P] Party Mode - Bring different perspectives on user emotional needs
[C] Continue - Save this and move to inspiration analysis"

### 8. Handle Menu Selection

- **A**: Invoke `bmad-advanced-elicitation`, process insights, confirm with user, return to menu
- **P**: Invoke `bmad-party-mode`, process insights, confirm with user, return to menu
- **C**: Append content to `{planning_artifacts}/ux-design-specification.md`, update frontmatter `stepsCompleted`, load {nextStepFile}
