# Step 8: Scoping Exercise - MVP & Future Features

## STEP GOAL

Conduct comprehensive scoping exercise to define MVP boundaries and prioritize features across development phases. Balance between user value and implementation feasibility while preserving long-term vision.

## RULES

- Review the complete PRD document built so far before making scoping decisions
- Emphasize lean MVP thinking while preserving long-term vision
- Focus on strategic scope decisions, not feature details
- ONLY save when user chooses C (Continue)
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Review Current PRD State

Analyze everything documented so far:

- Present synthesis of established vision, success criteria, journeys
- Assess domain and innovation focus
- Evaluate scope implications: simple MVP, medium, or complex project
- Ask if initial assessment feels right or if they see it differently

### 2. Define MVP Strategy

Facilitate strategic MVP decisions:

- Explore MVP philosophy options: problem-solving, experience, platform, or revenue MVP
- Ask critical questions:
  - What's the minimum that would make users say 'this is useful'?
  - What would make investors/partners say 'this has potential'?
  - What's the fastest path to validated learning?
- Guide toward appropriate MVP approach for their product

### 3. Scoping Decision Framework

Use structured decision-making for scope:

**Must-Have Analysis:**

- Guide identification of absolute MVP necessities
- For each journey and success criterion, ask:
  - Without this, does the product fail?
  - Can this be manual initially?
  - Is this a deal-breaker for early adopters?
- Analyze journeys for MVP essentials

**Nice-to-Have Analysis:**

- Identify what could be added later:
  - Features that enhance but aren't essential
  - User types that can be added later
  - Advanced functionality that builds on MVP
- Ask what features could be added in versions 2, 3, etc.

### 4. Progressive Feature Roadmap

Create phased development approach:

- Guide mapping of features across development phases
- Structure as Phase 1 (MVP), Phase 2 (Growth), Phase 3 (Vision)
- Ensure clear progression and dependencies

**Phase 1: MVP**

- Core user value delivery
- Essential user journeys
- Basic functionality that works reliably

**Phase 2: Growth**

- Additional user types
- Enhanced features
- Scale improvements

**Phase 3: Expansion**

- Advanced capabilities
- Platform features
- New markets or use cases

"Where does your current vision fit in this development sequence?"

### 5. Risk-Based Scoping

Identify and mitigate scoping risks:

**Technical Risks:**

- What's the most technically challenging aspect?
- Could we simplify the initial implementation?
- What's the riskiest assumption about technology feasibility?

**Market Risks:**

- What's the biggest market risk?
- How does the MVP address this?
- What learning do we need to de-risk this?

**Resource Risks:**

- What if we have fewer resources than planned?
- What's the absolute minimum team size needed?
- Can we launch with a smaller feature set?

### 6. Generate Scoping Content

Prepare comprehensive scoping section.

### 7. Present MENU OPTIONS

Present the scoping decisions for review, then display menu:

- Show strategic scoping plan
- Highlight MVP boundaries and phased roadmap
- Ask if they'd like to refine further, get other perspectives, or proceed

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Functional Requirements"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current scoping analysis, process the enhanced insights that come back, ask user if they accept the improvements, if yes update content then redisplay menu, if no keep original content then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the scoping context, process the collaborative insights on MVP and roadmap decisions, ask user if they accept the changes, if yes update content then redisplay menu, if no keep original content then redisplay menu
- IF C: Append the final content to {outputFile}, update frontmatter by adding this step name to the end of the stepsCompleted array, then read fully and follow: ./step-09-functional.md
- IF Any other: help user respond, then redisplay menu

## APPEND TO DOCUMENT

When user selects 'C', append the content directly to the document:

```markdown
## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** {chosen_mvp_approach}
**Resource Requirements:** {mvp_team_size_and_skills}

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
{essential_journeys_for_mvp}

**Must-Have Capabilities:**
{list_of_essential_mvp_features}

### Post-MVP Features

**Phase 2 (Post-MVP):**
{planned_growth_features}

**Phase 3 (Expansion):**
{planned_expansion_features}

### Risk Mitigation Strategy

**Technical Risks:** {mitigation_approach}
**Market Risks:** {validation_approach}
**Resource Risks:** {contingency_approach}
```
