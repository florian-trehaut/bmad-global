---
nextStepFile: './step-08-cleanup.md'
trackerIssueTemplate: '../templates/tracker-issue-description.md'
---

# Step 7: Create Tracker Issue

## STEP GOAL:

Determine issue placement, priority, and labels, then create the tracker issue with the complete spec as description.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are executing a structured creation operation
- The user confirms placement and priority -- you handle the API call
- HALT on failure -- no silent fallback

### Step-Specific Rules:

- Focus on accurate issue creation -- all content is finalized
- FORBIDDEN: modifying spec content (that was Step 6)
- FORBIDDEN: silently falling back to local file if tracker fails
- Approach: confirm details with user, execute API call, verify

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- HALT and report error on any API failure
- Auto-proceed to cleanup after successful creation

## CONTEXT BOUNDARIES:

- Available: complete spec from all previous steps, tracker access
- Focus: issue creation, not content editing
- Dependencies: Step 6 completed, user approved spec

---

## MANDATORY SEQUENCE

### 1. Determine Issue Placement

Quick-spec creates **exactly one story** — which may be placed within an existing epic or left standalone. Placement is organizational only; it does not change the output count.

Check if a `RELATED_EPIC` was identified in Step 2.

**If related epic found:** use that epic for the story.

**If no related epic:**

Ask user:

> No epic identified. Options:
> 1. Create the story standalone (no epic)
> 2. Attach to an existing epic (I'll list them)
>
> Choice?

WAIT for user choice.

#### Menu Handling Logic:

**File-based tracker (`{TRACKER}` == `file`):**
- IF 1: Write story file to `{TRACKER_STORY_LOCATION}/` with prefix `standalone-{slug}.md`
- IF 2: Read `{TRACKER_EPICS_FILE}`, present epic list with numbers/names, let user pick. Determine next story number by scanning existing files with that epic prefix. Write story file with `{epic_number}-{next_story_number}-{slug}.md`
- IF any other: Explain valid options and redisplay menu

**MCP-based tracker:**
- IF 1: Set project to null, proceed
- IF 2: List epics/projects from the tracker (using CRUD patterns from tracker.md): List epics/projects for team {TRACKER_TEAM}, let user pick, proceed
- IF any other: Explain valid options and redisplay menu

### 2. Determine Priority

- bug -> 2 (High) by default
- task/improvement -> 3 (Normal) by default

Ask user to confirm or adjust.

### 3. Determine Labels

- Type label: "Bug", "Task", "Improvement", "Feature"
- Client label if applicable (using the label prefix from `workflow-context.md`)

### 4. Compose Issue Description

Load {trackerIssueTemplate} for the description structure.

Compose the full Markdown description using the template, filling in all accumulated content from Steps 1-5b (including Step 2b Business Context). Omit sections marked as conditional when they don't apply (e.g., no Data Model section if no schema changes).

**CRITICAL ordering:** The **Definition of Done (product)** section is the FIRST section of the ticket (before Problem, Solution, everything). It is the first thing visible when opening the ticket -- the success criteria at a glance. The **Validation Metier** stays in its natural position after the implementation plan. Each VM item must trace to its BACs: `VM-N *(BAC-X,Y)* : description`. The **Technical context** section goes inside a `<details>` collapsible block.

### 5. Create the Tracker Issue

Create the issue in the tracker (using CRUD patterns from tracker.md):
- Operation: Create issue
- Title: {title}
- Team: {TRACKER_TEAM}
- Description: {composed_description}
- Priority: {priority}
- Labels: {labels}
- Project: {project_name_if_any}
- Status: {TRACKER_STATES.todo}

**IMPORTANT:** The workflow NEVER sets state to 'Done'. The maximum state a workflow can set is the testing state (after merge + deploy). 'Done' requires manual confirmation after Validation Metier passes.

Store: `NEW_ISSUE_ID`, `NEW_ISSUE_IDENTIFIER`.

**If issue creation fails:** HALT -- report error. Do NOT silently fallback to local file.

### 6. Auto-Proceed

Load, read entire file, then execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Issue placement confirmed with user
- Priority confirmed with user
- Labels determined
- Description composed from template (includes Business Context + Validation Metier)
- Tracker issue created successfully
- Issue ID stored for cleanup step
- State set to the "todo" state (never 'Done')

### FAILURE:

- Creating issue without user confirmation of placement/priority
- Silent fallback to local file on API error
- Not using the template for description composition
- Hardcoding description structure instead of loading template
