---
prdFile: '{prd_file_path}'
validationWorkflow: '../../bmad-validate-prd/steps/step-01-discovery.md'
---

# Step 4: Complete & Validate

## STEP GOAL

Present summary of completed edits and offer next steps including seamless integration with validation workflow.

## RULES

- No additional edits in this step -- summary and routing only
- Always offer the validation option when the validate-prd skill is available
- Present a clear, concise summary of all changes made
- Communicate in `{COMMUNICATION_LANGUAGE}`

## SEQUENCE

### 1. Compile Edit Summary

From step 3, compile:

**Changes Made:**

- Sections added: {list with names}
- Sections updated: {list with names}
- Content removed: {list}
- Structure changes: {description}

**Edit Details:**

- Total sections affected: {count}
- Mode: {restructure/targeted/both}
- Priority addressed: {Critical/High/Medium/Low}

**PRD Status:**

- Format: {BMAD Standard / BMAD Variant / Legacy (converted)}
- Completeness: {assessment}

### 2. Present Completion Summary

"**PRD Edit Complete**

**Updated PRD:** {prd_file_path}

**Changes Summary:**
{Present bulleted list of major changes}

**Edit Mode:** {mode}
**Sections Modified:** {count}
**PRD Format:** {format}

PRD is now ready for:

- Downstream workflows (UX Design, Architecture)
- Validation to verify quality
- Production use

What would you like to do next?"

### 3. Menu

**[V] Run Full Validation** - Execute complete validation workflow to verify PRD quality
**[E] Edit More** - Make additional edits to the PRD
**[S] Summary** - End with detailed summary of changes
**[X] Exit** - Exit edit workflow

WAIT for user input.

- **IF V:** "Starting Validation Workflow. This will run all validation checks on the updated PRD." Read fully and follow: {validationWorkflow}
- **IF E:** Ask what additional edits to make, then read fully and follow: `./step-03-edit.md`
- **IF S:** Present detailed summary including complete list of changes, key improvements, and recommendations for next steps. "Edit Workflow Complete."
- **IF X:** Display brief summary. "Edit Workflow Complete."
