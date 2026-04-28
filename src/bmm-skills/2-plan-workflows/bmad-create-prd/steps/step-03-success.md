# Step 3: Success Criteria Definition


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Success Criteria Definition with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Define comprehensive success criteria that cover user success, business success, and technical success. Use input documents as a foundation while allowing user refinement. Success criteria must be measurable, specific, and connected to the product's unique differentiator.

## RULES

- FOCUS on defining what winning looks like for this product
- Collaborative discovery, not assumption-based goal setting
- Push for specificity -- reject vague metrics
- ONLY save when user chooses C (Continue)
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Begin Success Definition Conversation

**Check Input Documents for Success Indicators:**

Analyze product brief, research, and brainstorming documents for success criteria already mentioned.

**If Input Documents Contain Success Criteria:**

- Acknowledge what's already documented in their materials
- Extract key success themes from brief, research, and brainstorming
- Help user identify gaps and areas for expansion
- Probe for specific, measurable outcomes: When do users feel delighted/relieved/empowered?
- Ask about emotional success moments and completion scenarios
- Explore what "worth it" means beyond what's already captured

**If No Success Criteria in Input Documents:**

Start with user-centered success exploration:

- Guide conversation toward defining what "worth it" means for users
- Ask about the moment users realize their problem is solved
- Explore specific user outcomes and emotional states
- Identify success moments and completion scenarios
- Focus on user experience of success first

### 2. Explore User Success Metrics

Listen for specific user outcomes and help make them measurable:

- Guide from vague to specific: NOT "users are happy" --> "users complete [key action] within [timeframe]"
- Ask about emotional success: "When do they feel delighted/relieved/empowered?"
- Identify success moments: "What's the 'aha!' moment?"
- Define completion scenarios: "What does 'done' look like for the user?"

### 3. Define Business Success

Transition to business metrics:

- Guide conversation to business perspective on success
- Explore timelines: What does 3-month success look like? 12-month success?
- Identify key business metrics: revenue, user growth, engagement, or other measures?
- Ask what specific metric would indicate "this is working"
- Understand business success from their perspective

### 4. Challenge Vague Metrics

Push for specificity on business metrics:

- "10,000 users" --> "What kind of users? Doing what?"
- "99.9% uptime" --> "What's the real concern -- data loss? Failed payments?"
- "Fast" --> "How fast, and what specifically needs to be fast?"
- "Good adoption" --> "What percentage adoption by when?"

### 5. Connect to Product Differentiator

Tie success metrics back to what makes the product special:

- Connect success criteria to the product's unique differentiator
- Ensure metrics reflect the specific value proposition
- Adapt success criteria to domain context:
  - Consumer: User love, engagement, retention
  - B2B: ROI, efficiency, adoption
  - Developer tools: Developer experience, community
  - Regulated: Compliance, safety, validation
  - GovTech: Government compliance, accessibility, procurement

### 6. Smart Scope Negotiation

Guide scope definition through success lens:

- Help user distinguish MVP (must work to be useful) from growth (competitive) and vision (dream)
- Guide conversation through three scope levels:
  1. MVP: What's essential for proving the concept?
  2. Growth: What makes it competitive?
  3. Vision: What's the dream version?
- Challenge scope creep conversationally: Could this wait until after launch? Is this essential for MVP?
- For complex domains: Ensure compliance minimums are included in MVP

### 7. Generate Success Criteria Content

Prepare the content to append to the document using the structure below.

### 8. Present MENU OPTIONS

Present the success criteria content for review, then display menu:

- Show the drafted success criteria and scope definition
- Ask if they'd like to refine further, get other perspectives, or proceed

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to User Journey Mapping"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current success criteria content, process the enhanced success metrics that come back, ask user "Accept these improvements to the success criteria? (y/n)", if yes update content with improvements then redisplay menu, if no keep original content then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current success criteria, process the collaborative improvements to metrics and scope, ask user "Accept these changes to the success criteria? (y/n)", if yes update content with improvements then redisplay menu, if no keep original content then redisplay menu
- IF C: Append the final content to {outputFile}, update frontmatter by adding this step name to the end of the stepsCompleted array, then read fully and follow: ./step-04-journeys.md
- IF Any other: help user respond, then redisplay menu

## APPEND TO DOCUMENT

When user selects 'C', append the content directly to the document:

```markdown
## Success Criteria

### User Success

[Content about user success criteria based on conversation]

### Business Success

[Content about business success metrics based on conversation]

### Technical Success

[Content about technical success requirements based on conversation]

### Measurable Outcomes

[Content about specific measurable outcomes based on conversation]

## Product Scope

### MVP - Minimum Viable Product

[Content about MVP scope based on conversation]

### Growth Features (Post-MVP)

[Content about growth features based on conversation]

### Vision (Future)

[Content about future vision based on conversation]
```

## DOMAIN CONSIDERATIONS

If working in regulated domains (healthcare, fintech, govtech):

- Include compliance milestones in success criteria
- Add regulatory approval timelines to MVP scope
- Consider audit requirements as technical success metrics

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Success Criteria Definition
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
