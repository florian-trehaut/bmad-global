# Step 1b: Workflow Continuation Handler


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01b-ENTRY PASSED — entering Step 1b: Workflow Continuation Handler with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Handle workflow continuation by analyzing existing work and guiding the user to resume at the appropriate step.

## RULES

- Read the complete existing document before making suggestions
- You are a facilitator -- collaborative discovery between architectural peers
- Focus on understanding current state and getting user confirmation
- NEVER proceed to next step without user confirmation
- Communicate in `{COMMUNICATION_LANGUAGE}`

## SEQUENCE

### 1. Analyze Current Document State

Read the existing architecture document completely and analyze:

**Frontmatter Analysis:**
- `stepsCompleted`: what steps have been done
- `inputDocuments`: what documents were loaded
- `lastStep`: last step that was executed
- `project_name`, `user_name`, `date`: basic context

**Content Analysis:**
- What sections exist in the document
- What architectural decisions have been made
- What appears incomplete or in progress
- Any TODOs or placeholders remaining

### 2. Present Continuation Summary

Show the user their current progress:

"Welcome back {user_name}! I found your Architecture work for {project_name}.

**Current Progress:**
- Steps completed: {stepsCompleted list}
- Last step worked on: Step {lastStep}
- Input documents loaded: {number of inputDocuments} files

**Document Sections Found:**
{list all H2/H3 sections found in the document}

{if incomplete sections}
**Incomplete Areas:**
- {areas that appear incomplete or have placeholders}
{/if}

**What would you like to do?**
[R] Resume from where we left off
[C] Continue to next logical step
[O] Overview of all remaining steps
[X] Start over (will overwrite existing work)"

### 3. Handle User Choice

#### If 'R' (Resume from where we left off):
- Identify the next step based on `stepsCompleted`
- Load the appropriate step file to continue
- Example: if `stepsCompleted: [1, 2, 3]`, load `./step-04-decisions.md`

#### If 'C' (Continue to next logical step):
- Analyze the document content to determine logical next step
- Review content quality and completeness
- If content seems complete for current step, advance to next
- If content seems incomplete, suggest staying on current step

#### If 'O' (Overview of all remaining steps):
- Provide brief description of all remaining steps
- Let user choose which step to work on

#### If 'X' (Start over):
- Confirm: "This will delete all existing architectural decisions. Are you sure? (y/n)"
- If confirmed: delete existing document and load `./step-01-init.md`
- If not confirmed: return to continuation menu

### 4. Navigate to Selected Step

After user makes choice:

- Update frontmatter `lastStep` to reflect current navigation
- Load and execute the selected step file
- Maintain all existing content in the document
- Keep `stepsCompleted` accurate

### 5. Special Continuation Cases

#### If `stepsCompleted` is empty but document has content:
- Ask user: "I see the document has content but no steps are marked as complete. Should I analyze what is here and set the appropriate step status?"

#### If document appears corrupted or incomplete:
- Ask user: "The document seems incomplete. Would you like me to try to recover what is here, or would you prefer to start fresh?"

#### If document is complete but workflow not marked as done:
- Ask user: "The architecture looks complete. Should I mark this workflow as finished, or is there more you would like to work on?"

## NEXT STEP

After user selects their continuation option, load the appropriate step file based on their choice.

Valid step files:
- `./step-02-context.md`
- `./step-03-starter.md`
- `./step-04-decisions.md`
- `./step-05-patterns.md`
- `./step-06-structure.md`
- `./step-07-validation.md`
- `./step-08-complete.md`

---

## STEP EXIT (CHK-STEP-01b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01b-EXIT PASSED — completed Step 1b: Workflow Continuation Handler
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
