# Step 6: Innovation Discovery


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Innovation Discovery with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Detect and explore innovation patterns in the product, focusing on what makes it truly novel and how to validate the innovative aspects. This step is OPTIONAL -- only proceed if genuine innovation signals are detected.

## RULES

- OPTIONAL STEP: Only proceed if innovation signals are detected
- Focus on detecting genuine innovation, not forced creativity
- Use project-type CSV data to guide discovery
- ONLY save when user chooses C (Continue)
- FORBIDDEN to load next step until C is selected

## OPTIONAL STEP CHECK

Before proceeding with this step, scan for innovation signals:

- Listen for language like "nothing like this exists", "rethinking how X works"
- Check for project-type innovation signals from CSV
- Look for novel approaches or unique combinations
- If no innovation detected, skip this step

## SEQUENCE

### 1. Load Project-Type Innovation Data

Load innovation signals specific to this project type:

- Load `../data/project-types.csv` completely
- Find the row where `project_type` matches detected type from step 2
- Extract `innovation_signals` (semicolon-separated list)
- Extract `web_search_triggers` for potential innovation research

### 2. Listen for Innovation Indicators

Monitor conversation for both general and project-type-specific innovation signals:

#### General Innovation Language:

- "Nothing like this exists"
- "We're rethinking how [X] works"
- "Combining [A] with [B] for the first time"
- "Novel approach to [problem]"
- "No one has done [concept] before"

#### Project-Type-Specific Signals (from CSV):

Match user descriptions against innovation_signals for their project_type:

- **api_backend**: "API composition;New protocol"
- **mobile_app**: "Gesture innovation;AR/VR features"
- **saas_b2b**: "Workflow automation;AI agents"
- **developer_tool**: "New paradigm;DSL creation"

### 3. Initial Innovation Screening

Ask targeted innovation discovery questions:

- Guide exploration of what makes the product innovative
- Explore if they're challenging existing assumptions
- Ask about novel combinations of technologies/approaches
- Identify what hasn't been done before
- Understand which aspects feel most innovative

### 4. Deep Innovation Exploration (If Detected)

If innovation signals are found, explore deeply:

#### Innovation Discovery Questions:

- What makes it unique compared to existing solutions?
- What assumption are you challenging?
- How do we validate it works?
- What's the fallback if it doesn't?
- Has anyone tried this before?

#### Market Context Research:

If relevant innovation detected, consider web search for context:

Use `web_search_triggers` from project-type CSV:
`[web_search_triggers] {concept} innovations {date}`

### 5. Generate Innovation Content (If Innovation Detected)

Prepare the content to append to the document.

### 6. Present MENU OPTIONS (Only if Innovation Detected)

Present the innovation content for review, then display menu:

- Show identified innovative aspects
- Highlight differentiation from existing solutions
- Ask if they'd like to refine further, get other perspectives, or proceed

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Project Type Analysis"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current innovation content, process the enhanced innovation insights that come back, ask user "Accept these improvements to the innovation analysis? (y/n)", if yes update content with improvements then redisplay menu, if no keep original content then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current innovation content, process the collaborative innovation exploration and ideation, ask user "Accept these changes to the innovation analysis? (y/n)", if yes update content with improvements then redisplay menu, if no keep original content then redisplay menu
- IF C: Append the final content to {outputFile}, update frontmatter by adding this step name to the end of the stepsCompleted array, then read fully and follow: ./step-07-project-type.md
- IF Any other: help user respond, then redisplay menu

## NO INNOVATION DETECTED

If no genuine innovation signals are found after exploration:

- Acknowledge that no clear innovation signals were found
- Note this is fine -- many successful products are excellent executions of existing concepts
- Ask if they'd like to try finding innovative angles or proceed

Display: "**Select:** [A] Advanced Elicitation - Let's try to find innovative angles [C] Continue - Skip innovation section and move to Project Type Analysis"

### Menu Handling Logic:

- IF A: Proceed with content generation anyway, then return to menu
- IF C: Skip this step, then read fully and follow: ./step-07-project-type.md

## APPEND TO DOCUMENT

When user selects 'C', append the content directly to the document:

```markdown
## Innovation & Novel Patterns

### Detected Innovation Areas

[Innovation patterns identified based on conversation]

### Market Context & Competitive Landscape

[Market context and research based on conversation]

### Validation Approach

[Validation methodology based on conversation]

### Risk Mitigation

[Innovation risks and fallbacks based on conversation]
```

## SKIP CONDITIONS

Skip this step and load `./step-07-project-type.md` if:

- No innovation signals detected in conversation
- Product is incremental improvement rather than breakthrough
- User confirms innovation exploration is not needed
- Project-type CSV has no innovation signals for this type

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Innovation Discovery
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
