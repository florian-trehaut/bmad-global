# Step 1: Workflow Initialization


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Workflow Initialization with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Initialize the PRD workflow by detecting continuation state, discovering input documents, and setting up the document structure for collaborative product requirement discovery.

## RULES

- Focus only on initialization and setup -- no content generation yet
- FORBIDDEN to look ahead to future steps or assume knowledge from them
- Detect existing workflow state and handle continuation properly
- FORBIDDEN to load next step until user selects 'C' (Continue)
- Update frontmatter: add this step name to the end of stepsCompleted

## SEQUENCE

### 1. Check for Existing Workflow State

First, check if the output document already exists:

- Look for file at `{outputFile}`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted` BUT `step-12-complete` is NOT in the list, follow the Continuation Protocol since the document is incomplete:

**Continuation Protocol:**

- STOP immediately and load `./step-01b-continue.md`
- Do not proceed with any initialization tasks
- Let step-01b handle all continuation logic
- This is an auto-proceed situation -- no user choice needed

### 3. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Input Document Discovery

Discover and load context documents using smart discovery. Documents can be in the following locations:

- {planning_artifacts}/\*\*
- {output_folder}/\*\*
- {project_knowledge}/\*\*
- docs/\*\*

Also -- when searching -- documents can be a single markdown file, or a folder with an index and multiple files. For example, if searching for `*foo*.md` and not found, also search for a folder called \*foo\*/index.md (which indicates sharded content).

Try to discover the following:

- Product Brief (`*brief*.md`)
- Research Documents (`/*research*.md`)
- Project Documentation (generally multiple documents might be found for this in the `{project_knowledge}` or `docs` folder)
- Project Context (`**/project-context.md`)

Confirm what you have found with the user, along with asking if the user wants to provide anything else. Only after this confirmation will you proceed to follow the loading rules.

**Loading Rules:**

- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, whatever is relevant should try to be biased in the remainder of this whole workflow process
- For sharded folders, load ALL files to get complete picture, using the index first to potentially know the potential of each document
- index.md is a guide to what's relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### B. Create Initial Document

- Copy the template from `../templates/prd-template.md` to `{outputFile}`
- Initialize frontmatter with proper structure including inputDocuments array

#### C. Present Initialization Results

Report to user:

"Welcome {USER_NAME}! I've set up your PRD workspace for {PROJECT_NAME}.

**Document Setup:**

- Created: `{outputFile}` from template
- Initialized frontmatter with workflow state

**Input Documents Discovered:**

- Product briefs: {briefCount} files {loaded status}
- Research: {researchCount} files {loaded status}
- Brainstorming: {brainstormingCount} files {loaded status}
- Project docs: {projectDocsCount} files {loaded status}

**Files loaded:** {list of specific file names or 'No additional documents found'}

{if projectDocsCount > 0}
**Note:** This is a **brownfield project**. Your existing project documentation has been loaded. In the next step, I'll ask specifically about what new features or changes you want to add to your existing system.
{/if}

Do you have any other documents you'd like me to include, or shall we continue to the next step?"

### 4. Present MENU OPTIONS

Display menu after setup report:

"[C] Continue - Save this and move to Project Discovery (Step 2)"

#### Menu Handling Logic:

- IF C: Update output file frontmatter, adding this step name to the end of stepsCompleted, then read fully and follow: ./step-02-discovery.md
- IF user provides additional files: Load them, update inputDocuments and documentCounts, redisplay report
- IF user asks questions: Answer and redisplay menu

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Workflow Initialization
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
