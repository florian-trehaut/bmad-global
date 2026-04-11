---
nextStepFile: './step-02-context.md'
---

# Step 1: Architecture Workflow Initialization

## STEP GOAL

Initialize the Architecture workflow by detecting continuation state, discovering input documents, and setting up the output document for collaborative architectural decision making.

## RULES

- Read the complete step file before taking any action
- You are a facilitator -- collaborative discovery between architectural peers
- Focus on initialization and setup only -- do not look ahead to future steps
- NEVER generate content without user input
- Communicate in `{COMMUNICATION_LANGUAGE}`

## SEQUENCE

### 1. Check for Existing Workflow

Check if the output document already exists:

- Look for existing `{planning_artifacts}/*architecture*.md`
- If exists, read the complete file(s) including frontmatter
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
- `{planning_artifacts}/**`
- `{output_folder}/**`
- `{project_knowledge}/**`
- `{project-root}/docs/**`

When searching, documents can be a single markdown file or a folder with an index and multiple files. For example, if searching for `*foo*.md` and not found, also search for a folder called `*foo*/index.md` (which indicates sharded content).

Try to discover the following:
- Product Brief (`*brief*.md`)
- Product Requirements Document (`*prd*.md`)
- UX Design (`*ux-design*.md`)
- Research Documents (`*research*.md`)
- Project Documentation (multiple documents may be found in `{project_knowledge}` or `{project-root}/docs`)
- Project Context (`**/project-context.md`)

Confirm what you found with the user and ask if they want to provide anything else. Only after confirmation, proceed to follow the loading rules.

**Loading Rules:**

- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, bias relevant rules throughout the remainder of this workflow
- For sharded folders, load ALL files to get complete picture, using the index first
- `index.md` is a guide to what is relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### B. Validate Required Inputs

Before proceeding, verify essential inputs:

**PRD Validation:**
- If no PRD found: "Architecture requires a PRD to work from. Please run the PRD workflow first or provide the PRD file path."
- Do NOT proceed without PRD

**Other Input that might exist:**
- UX Spec: provides UI/UX architectural requirements

#### C. Create Initial Document

Copy the template from `../architecture-decision-template.md` to `{planning_artifacts}/architecture.md`.

#### D. Complete Initialization and Report

Report to user:

"Welcome {user_name}! I have set up your Architecture workspace for {project_name}.

**Documents Found:**
- PRD: {number of PRD files loaded or "None found - REQUIRED"}
- UX Design: {number of UX files loaded or "None found"}
- Research: {number of research files loaded or "None found"}
- Project docs: {number of project files loaded or "None found"}
- Project context: {count of rules for AI agents found}

**Files loaded:** {list of specific file names}

Ready to begin architectural decision making. Do you have any other documents you'd like me to include?

[C] Continue to project context analysis"

## NEXT STEP

After user selects [C] and all template output has been created, load and execute `{nextStepFile}`.
