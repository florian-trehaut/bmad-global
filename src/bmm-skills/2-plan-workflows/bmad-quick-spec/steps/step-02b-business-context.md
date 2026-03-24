---
nextStepFile: './step-03-investigate.md'
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
businessContextTemplate: '../data/business-context-template.md'
---

# Step 2b: Business Context

## STEP GOAL:

Capture the business/product dimension -- user journey end-to-end, business acceptance criteria, external dependency gates, and validation metier checklist -- BEFORE diving into technical investigation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator with product/business thinking
- Collaborative dialogue -- you bring structured product thinking, user brings domain expertise
- Together we define what "done" means from the business perspective, not just the code perspective

### Step-Specific Rules:

- Focus on business outcomes and user experience -- NOT technical implementation
- FORBIDDEN: proposing technical solutions or architecture (that's Steps 3-5)
- FORBIDDEN: skipping this step because "it's just a small bug" -- even bugs have business impact
- Approach: think like a product manager, not a developer. What does the user see? What's the expected outcome?

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Load {businessContextTemplate} for structured output
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu

## CONTEXT BOUNDARIES:

- Available: scope from Step 2 (problem, solution, in/out scope), tracker context, project context
- Focus: business outcomes, user journeys, external dependencies -- NOT code
- Dependencies: Step 2 completed, scope confirmed by user

---

## MANDATORY SEQUENCE

### 1. Frame the Business Perspective

Start by reframing what was captured in Step 2 from a business/product angle:

> We defined the technical scope. Now let's think from the end user's perspective (beneficiary, client, admin).
>
> **Who is impacted by this feature/fix?** And **what must they be able to do once it's in production?**

Help the user think beyond code:
- If it's a **feature**: what's the complete user journey from trigger to outcome?
- If it's a **bug fix**: what's the user experience broken today, and what should it be after the fix?
- If it's an **integration**: what does the end-to-end flow look like from business perspective?

WAIT for user input.

### 2. Document User Journey E2E

Based on the conversation, document the end-to-end user journey from the user's perspective (NOT from the code perspective):

```markdown
### User Journey E2E

**Primary actor:** {beneficiary / client / admin / system}

1. {Step 1 from user's perspective}
2. {Step 2 ...}
3. {Step 3 ...}
...
N. {Expected final outcome}
```

Each step should describe what the **user sees or does**, not what the code does.

Present to user and confirm.

### 3. Define Business Acceptance Criteria

Separate from the technical ACs that Step 5 will produce. These are observable outcomes from the user/business perspective:

> Let's define the business acceptance criteria -- what we must be able to observe from the user/business perspective once in production.

Format: Given/When/Then but from user perspective:

```markdown
### Business Acceptance Criteria

- [ ] BAC-1: Given {user context}, when {user action}, then {observable result}
- [ ] BAC-2: Given {context}, when {action}, then {result}
...
```

These BACs should cover:
- **Happy path** from the user's perspective
- **Error experience** -- what the user sees when something goes wrong (not the technical error)
- **Edge cases** the user might encounter

CRITICAL: Business ACs must be verifiable by a human in production, not just by automated tests.

### 4. Identify External Dependencies & Validation Gates

Proactively ask:

> Does this feature depend on an external actor? For example:
> - A provider/partner who must validate a format or flow
> - A legal or compliance validation
> - An acceptance test with a third-party system
> - A configuration on the partner side (API key, webhook, whitelist)

If external dependencies exist, document them:

```markdown
### External Dependencies & Validation Gates

| Dependency | Owner | Required Action | Gate (blocking?) | Status |
| ---------- | ----- | --------------- | ---------------- | ------ |
```

If none: document "No external dependencies identified."

### 5. Define Validation Metier Checklist

These are the **production tests** that will be executed when the story moves to its "testing" state in the tracker (after merge + deploy):

> When this story is deployed to production, what tests must be performed to confirm it works from the business perspective?

```markdown
### Validation Metier (production tests)

Tests to execute in production after deployment. The story moves to the testing state and only transitions to "Done" once these tests pass.

- [ ] VM-1 *(BAC-1,2)* : {concrete business test, executable by a human}
- [ ] VM-2 *(BAC-3)* : {concrete business test}
...
```

**IMPORTANT:** Each VM must trace to one or more BACs via the format `*(BAC-X,Y)*`. The **Definition of Done (product)** will be the first section of the tracker issue -- it gives the success criteria at a glance.

Guidelines for good validation metier items:
- Concrete and executable (not "verify it works")
- From user/business perspective (not "check the logs")
- Include the expected result (not just the action)
- Trace to the corresponding BACs (each BAC must be covered by at least one VM)
- Examples:
  - "VM-1 *(BAC-1,2)* : Place a test order via the frontend and verify the provider receives the flow"
  - "VM-2 *(BAC-3)* : Verify the beneficiary receives the confirmation email with correct content"
  - "VM-3 *(BAC-4)* : Confirm with provider X that the sent format is accepted (written confirmation)"

### 6. Identify Out-of-Control Factors

> Are there elements outside our control that could impact the result? For example: delivery delays, third-party service availability, regulatory constraints.

If any: document with owner and escalation trigger.

If none: skip this section.

### 7. Product-Level Definition of Done

Synthesize everything into a clear product DoD. The DoD has TWO dimensions:

**Dimension 1 -- The feature works:** the BACs are satisfied, the user journey E2E is validated.

**Dimension 2 -- No regression on impacted flows:** everything we touched (directly or indirectly via modified data) continues to work. This dimension will be completed after impact analysis (Step 5b) with specific non-regression VMs.

```markdown
### Definition of Done (product)

This story is "Done" when:

**Feature:**
1. {business criterion 1}
2. {business criterion 2}
3. All Validation Metier tests (feature) have passed

**Non-regression:**
4. Flows impacted by our changes continue to work (non-regression VMs passed)
5. {if applicable: external confirmation obtained}
```

**IMPORTANT:** The non-regression section is a placeholder here. It will be enriched in Step 5b (Impact Analysis) with concrete VMs for each impacted flow. The principle: if impact analysis identifies that a data consumer or caller is affected, a business non-regression test MUST be added to Validation Metier.

Present the full business context to user:

> Here is the complete business context. Does this capture the product vision correctly?

WAIT for user feedback. Address corrections.

### 8. Update WIP File

Append business context section to WIP file. Set `stepsCompleted` to include this step.

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to code investigation (Step 3)"

#### Menu Handling Logic:

- IF A: Read fully and follow {advancedElicitationTask} with current business context, process insights, ask "Accept improvements? (y/n)", if yes update then redisplay menu, if no keep original then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current business context, process insights, ask "Accept changes? (y/n)", if yes update then redisplay menu, if no keep original then redisplay menu
- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#9-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN the business context is fully documented (user journey, BACs, external gates, validation metier, DoD product) and user has confirmed will you load {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- User journey E2E documented from user perspective (not code perspective)
- Business ACs defined in Given/When/Then (observable by human)
- External dependencies and gates documented (or "none" confirmed)
- Validation Metier checklist defined (production tests)
- Product-level DoD synthesized
- User confirmed business context
- WIP file updated

### FAILURE:

- Skipping this step for "small" changes
- Writing technical ACs instead of business ACs
- Validation Metier items that are technical (e.g., "check logs") instead of business
- Not asking about external dependencies
- Proceeding without user confirmation
