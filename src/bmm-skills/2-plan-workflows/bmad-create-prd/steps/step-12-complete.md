# Step 12: Workflow Completion

**Final Step -- Complete the PRD**

## STEP GOAL

Complete the PRD workflow, update status files, offer validation options, and suggest next steps for the project.

## RULES

- This is a FINAL step -- no content generation, only wrap-up
- Update workflow status file with completion information (if exists)
- Offer validation workflow options to user
- Do NOT load additional steps after this one

## SEQUENCE

### 1. Announce Workflow Completion

Inform user that the PRD is complete and polished:

- Celebrate successful completion of comprehensive PRD
- Summarize all sections that were created
- Highlight that document has been polished for flow and coherence
- Emphasize document is ready for downstream work

### 2. Workflow Status Update

Update the main workflow status file if there is one:

- Check workflow configuration for a status file (if one exists)
- Update workflow_status["prd"] = "{outputFile}"
- Save file, preserving all comments and structure
- Mark current timestamp as completion time

### 3. Validation Workflow Options

Offer validation workflows to ensure PRD is ready for implementation:

**Available Validation Workflows:**

**Option 1: Check Implementation Readiness** (`skill:bmad-check-implementation-readiness`)

- Validates PRD has all information needed for development
- Checks epic coverage completeness
- Reviews UX alignment with requirements
- Assesses epic quality and readiness
- Identifies gaps before architecture/design work begins

**When to use:** Before starting technical architecture or epic breakdown

**Option 2: Skip for Now**

- Proceed directly to next workflows (architecture, UX, epics)
- Validation can be done later if needed
- Some teams prefer to validate during architecture reviews

### 4. Suggest Next Workflows

PRD complete. Invoke the `bmad-help` skill.

### 5. Final Completion Confirmation

- Confirm completion with user and summarize what has been accomplished
- Document now contains: Executive Summary, Success Criteria, User Journeys, Domain Requirements (if applicable), Innovation Analysis (if applicable), Project-Type Requirements, Functional Requirements (capability contract), Non-Functional Requirements, and has been polished for flow and coherence
- Ask if they'd like to run validation workflow or proceed to next workflows

## FINAL REMINDER

The polished PRD serves as the foundation for all subsequent product development activities. All design, architecture, and development work should trace back to the requirements and vision documented in this PRD -- update it also as needed as you continue planning.

**Congratulations on completing the Product Requirements Document for {PROJECT_NAME}!**
