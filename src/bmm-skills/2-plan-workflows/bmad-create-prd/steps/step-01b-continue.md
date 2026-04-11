# Step 1B: Workflow Continuation

## STEP GOAL

Resume the PRD workflow from where it was left off, ensuring smooth continuation with full context restoration.

## RULES

- FOCUS on understanding where we left off and continuing appropriately
- FORBIDDEN to modify content completed in previous steps
- Only reload documents that were already tracked in `inputDocuments`
- FORBIDDEN to discover new input documents during continuation
- Update frontmatter: add this step name to the end of stepsCompleted

## SEQUENCE

### 1. Analyze Current State

Review the frontmatter to understand:

- `stepsCompleted`: Array of completed step filenames
- Last element of `stepsCompleted` array: The most recently completed step
- `inputDocuments`: What context was already loaded
- All other frontmatter variables

### 2. Restore Context Documents

For each document in `inputDocuments`, load the complete file. This ensures you have full context for continuation. Do not discover new documents -- only reload what was previously processed.

### 3. Determine Next Step

Use the following ordered sequence to determine the next step from the last completed step:

| Last Completed | Next Step |
|---|---|
| step-01-init.md | step-02-discovery.md |
| step-02-discovery.md | step-02b-vision.md |
| step-02b-vision.md | step-02c-executive-summary.md |
| step-02c-executive-summary.md | step-03-success.md |
| step-03-success.md | step-04-journeys.md |
| step-04-journeys.md | step-05-domain.md |
| step-05-domain.md | step-06-innovation.md |
| step-06-innovation.md | step-07-project-type.md |
| step-07-project-type.md | step-08-scoping.md |
| step-08-scoping.md | step-09-functional.md |
| step-09-functional.md | step-10-nonfunctional.md |
| step-10-nonfunctional.md | step-11-polish.md |
| step-11-polish.md | step-12-complete.md |

1. Get the last element from the `stepsCompleted` array
2. Look it up in the table above to find the next step
3. That's the next step to load

**Example:**

- If `stepsCompleted = ["step-01-init.md", "step-02-discovery.md", "step-03-success.md"]`
- Last element is `"step-03-success.md"`
- Table lookup: next step is `./step-04-journeys.md`

### 4. Handle Workflow Completion

**If `stepsCompleted` array contains `"step-12-complete.md"`:**

"Great news! It looks like we've already completed the PRD workflow for {PROJECT_NAME}.

The final document is ready at `{outputFile}` with all sections completed.

Would you like me to:

- Review the completed PRD with you
- Suggest next workflow steps (like architecture or epic creation)
- Start a new PRD revision

What would be most helpful?"

### 5. Present Current Progress

**If workflow not complete:**

"Welcome back {USER_NAME}! I'm resuming our PRD collaboration for {PROJECT_NAME}.

**Current Progress:**

- Last completed: {last step filename from stepsCompleted array}
- Next up: {next step from lookup table}
- Context documents available: {len(inputDocuments)} files

**Document Status:**

- Current PRD document is ready with all completed sections
- Ready to continue from where we left off

Does this look right, or do you want to make any adjustments before we proceed?"

### 6. Present MENU OPTIONS

Display: "**Select an Option:** [C] Continue to {next step name}"

#### Menu Handling Logic:

- IF C: Read fully and follow the next step determined from the lookup table in step 3
- IF Any other comments or queries: respond and redisplay menu
