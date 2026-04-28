# Step 2: Project Discovery


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Project Discovery with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Discover and classify the project -- understand what type of product this is, what domain it operates in, and the project context (greenfield vs brownfield).

## RULES

- Focus on classification and understanding -- no content generation yet
- FORBIDDEN to generate executive summary or vision statements (that's next steps)
- Load classification data BEFORE starting discovery conversation
- ONLY save classification to frontmatter when user chooses C (Continue)
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Check Document State

Read the frontmatter from `{outputFile}` to get document counts:

- `briefCount` - Product briefs available
- `researchCount` - Research documents available
- `brainstormingCount` - Brainstorming docs available
- `projectDocsCount` - Existing project documentation

**Announce your understanding:**

"From step 1, I have loaded:

- Product briefs: {briefCount}
- Research: {researchCount}
- Brainstorming: {brainstormingCount}
- Project docs: {projectDocsCount}

{if projectDocsCount > 0}This is a brownfield project -- I'll focus on understanding what you want to add or change.{else}This is a greenfield project -- I'll help you define the full product vision.{/if}"

### 2. Load Classification Data

**Project Type Lookup:**

Load `../data/project-types.csv` and find the row where `project_type` matches the detected project type. Extract `project_type` and `detection_signals`.

**Domain Complexity Lookup:**

Load `../data/domain-complexity.csv` and find the row where `domain` matches the detected domain. Extract `domain`, `complexity`, `typical_concerns`, `compliance_requirements`.

### 3. Begin Discovery Conversation

**Start with what you know:**

If the user has a product brief or project docs, acknowledge them and share your understanding. Then ask clarifying questions to deepen your understanding.

If this is a greenfield project with no docs, start with open-ended discovery:

- What problem does this solve?
- Who's it for?
- What excites you about building this?

**Listen for classification signals:**

As the user describes their product, match against:

- **Project type signals** (API, mobile, SaaS, etc.)
- **Domain signals** (healthcare, fintech, education, etc.)
- **Complexity indicators** (regulated industries, novel technology, etc.)

### 4. Confirm Classification

Once you have enough understanding, share your classification:

"I'm hearing this as:

- **Project Type:** {detectedType}
- **Domain:** {detectedDomain}
- **Complexity:** {complexityLevel}

Does this sound right to you?"

Let the user confirm or refine your classification.

### 5. Save Classification to Frontmatter

When user selects 'C', update frontmatter with classification:

```yaml
classification:
  projectType: {projectType}
  domain: {domain}
  complexity: {complexityLevel}
  projectContext: {greenfield|brownfield}
```

### N. Present MENU OPTIONS

Present the project classification for review, then display menu:

"Based on our conversation, I've discovered and classified your project.

**Here's the classification:**

**Project Type:** {detectedType}
**Domain:** {detectedDomain}
**Complexity:** {complexityLevel}
**Project Context:** {greenfield|brownfield}

**What would you like to do?**"

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Product Vision"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current classification, process the enhanced insights that come back, ask user if they accept the improvements, if yes update classification then redisplay menu, if no keep original classification then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current classification, process the collaborative insights, ask user if they accept the changes, if yes update classification then redisplay menu, if no keep original classification then redisplay menu
- IF C: Save classification to {outputFile} frontmatter, add this step name to the end of stepsCompleted array, then read fully and follow: ./step-02b-vision.md
- IF Any other: help user respond, then redisplay menu

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Project Discovery
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
