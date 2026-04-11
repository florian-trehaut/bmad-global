# Step 2b: Product Vision Discovery

## STEP GOAL

Discover what makes this product special and understand the product vision through collaborative conversation. No content generation -- facilitation only. This step ONLY discovers; it does NOT write to the document.

## RULES

- Focus on discovering vision and differentiator -- no content generation yet
- FORBIDDEN to generate executive summary content (that's the next step)
- FORBIDDEN to append anything to the document in this step
- Build on classification insights from step 2
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Acknowledge Classification Context

Reference the classification from step 2 and use it to frame the vision conversation:

"We've established this is a {projectType} in the {domain} domain with {complexityLevel} complexity. Now let's explore what makes this product special."

### 2. Explore What Makes It Special

Guide the conversation to uncover the product's unique value:

- **User delight:** "What would make users say 'this is exactly what I needed'?"
- **Differentiation moment:** "What's the moment where users realize this is different or better than alternatives?"
- **Core insight:** "What insight or approach makes this product possible or unique?"
- **Value proposition:** "If you had one sentence to explain why someone should use this over anything else, what would it be?"

### 3. Understand the Vision

Dig deeper into the product vision:

- **Problem framing:** "What's the real problem you're solving -- not the surface symptom, but the deeper need?"
- **Future state:** "When this product is successful, what does the world look like for your users?"
- **Why now:** "Why is this the right time to build this?"

### 4. Validate Understanding

Reflect back what you've heard and confirm:

"Here's what I'm hearing about your vision and differentiator:

**Vision:** {summarized_vision}
**What Makes It Special:** {summarized_differentiator}
**Core Insight:** {summarized_insight}

Does this capture it? Anything I'm missing?"

Let the user confirm or refine your understanding.

### N. Present MENU OPTIONS

Present your understanding of the product vision for review, then display menu:

"Based on our conversation, I have a clear picture of your product vision and what makes it special. I'll use these insights to draft the Executive Summary in the next step.

**What would you like to do?**"

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Executive Summary"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current vision insights, process the enhanced insights that come back, ask user if they accept the improvements, if yes update understanding then redisplay menu, if no keep original understanding then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current vision insights, process the collaborative insights, ask user if they accept the changes, if yes update understanding then redisplay menu, if no keep original understanding then redisplay menu
- IF C: Update {outputFile} frontmatter by adding this step name to the end of stepsCompleted array, then read fully and follow: ./step-02c-executive-summary.md
- IF Any other: help user respond, then redisplay menu
