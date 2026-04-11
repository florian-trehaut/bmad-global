---
nextStepFile: './step-02-discovery.md'
---

# Step 1: Initialize

## STEP GOAL

Detect existing workflow state, discover input documents, and create the UX design specification document from template.

## RULES

- Focus on initialization and setup only -- no design questions yet
- Confirm discovered documents with the user before loading
- FORBIDDEN: proceeding to step-02 without a saved output file
- Detect existing workflow and delegate to step-01b if continuation is needed

## SEQUENCE

### 1. Check for Existing Workflow

Check if the output document already exists:

- Look for file at `{planning_artifacts}/*ux-design-specification*.md`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and load `./step-01b-continue.md` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

### 3. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Input Document Discovery

Discover and load context documents using smart discovery. Documents can be in the following locations:
- {planning_artifacts}/**
- {output_folder}/**
- {product_knowledge}/**
- {project-root}/docs/**

Also -- when searching -- documents can be a single markdown file, or a folder with an index and multiple files. For example, if searching for `*foo*.md` and not found, also search for a folder called *foo*/index.md (which indicates sharded content).

Try to discover the following:
- Product Brief (`*brief*.md`)
- Research Documents (`*prd*.md`)
- Project Documentation (generally multiple documents might be found for this in the `{product_knowledge}` or `docs` folder.)
- Project Context (`**/project-context.md`)

Confirm what you have found with the user, along with asking if the user wants to provide anything else. Only after this confirmation will you proceed to follow the loading rules.

**Loading Rules:**

- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, whatever is relevant should try to be biased in the remainder of this whole workflow process
- For sharded folders, load ALL files to get complete picture, using the index first to potentially know the potential of each document
- index.md is a guide to what's relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### B. Create Initial Document

Copy the template from `../ux-design-template.md` to `{planning_artifacts}/ux-design-specification.md`. Initialize frontmatter in the template.

#### C. Complete Initialization and Report

Complete setup and report to user:

"Welcome {user_name}! I've set up your UX design workspace for {project_name}.

**Documents Found:**

- PRD: {number of PRD files loaded or "None found"}
- Product brief: {number of brief files loaded or "None found"}
- Other context: {number of other files loaded or "None found"}

**Files loaded:** {list of specific file names or "No additional documents found"}

Do you have any other documents you'd like me to include, or shall we continue to the next step?

[C] Continue to UX discovery"

### 4. Save State

Update frontmatter with `stepsCompleted: [1]` and `inputDocuments` array before presenting menu.

### 5. Proceed

After user selects [C], load {nextStepFile}.
