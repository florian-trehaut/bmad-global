---
nextStepFile: './step-04-complete.md'
prdFile: '{prd_file_path}'
prdPurpose: '../data/prd-purpose.md'
---

# Step 3: Edit & Update

## STEP GOAL

Apply changes to the PRD following the approved change plan from step 2, including content updates, structure improvements, and format conversion if needed.

## RULES

- Implement ONLY the approved changes from step 2 -- no scope creep
- Execute changes in priority order, section by section
- Show progress after each section is updated
- Ensure all edits comply with BMAD PRD principles: high information density, measurable requirements, clear structure
- Communicate in `{COMMUNICATION_LANGUAGE}`, write artifacts in `{DOCUMENT_OUTPUT_LANGUAGE}`

## SEQUENCE

### 1. Retrieve Approved Change Plan

From step 2, retrieve:

- Approved changes: section-by-section list
- Priority order: sequence to apply changes
- User requirements: edit goals from step 1

"**Starting PRD Edits**

**Change Plan:** {summary}
**Total Changes:** {count}
**Estimated Effort:** {effort level}

Proceeding with edits section by section..."

### 2. Execute Changes Section-by-Section

For each section in approved plan (in priority order):

**a) Load current section**

- Read the current PRD section content
- Note what exists

**b) Apply changes per plan**

- Additions: Create new sections with proper content
- Updates: Modify existing content per plan
- Removals: Remove specified content
- Restructuring: Reformat content to BMAD standard

**c) Update PRD file**

- Apply changes to PRD
- Save updated PRD
- Verify changes applied correctly

Display progress after each section:
"**Section Updated:** {section_name}
Changes: {brief summary}
{More sections remaining...}"

### 3. Handle Restructuring (If Needed)

If conversion mode is "Full restructuring" or "Both":

- Reorganize PRD to BMAD standard structure
- Ensure proper ## Level 2 headers
- Reorder sections logically
- Update PRD frontmatter to match BMAD format

Follow BMAD PRD structure:

1. Executive Summary
2. Success Criteria
3. Product Scope
4. User Journeys
5. Domain Requirements (if applicable)
6. Innovation Analysis (if applicable)
7. Project-Type Requirements
8. Functional Requirements
9. Non-Functional Requirements

"**PRD Restructured**
BMAD standard structure applied.
{Sections added/reordered}"

### 4. Update PRD Frontmatter

Ensure frontmatter is complete and accurate:

```yaml
---
workflowType: 'prd'
workflow: 'edit'
classification:
  domain: '{domain}'
  projectType: '{project_type}'
  complexity: '{complexity}'
lastEdited: '{current_date}'
editHistory:
  - date: '{current_date}'
    changes: '{summary of changes}'
---
```

### 5. Final Review of Changes

Load complete updated PRD. Verify:

- All approved changes applied correctly
- PRD structure is sound
- No unintended modifications
- Frontmatter is accurate

If issues found: fix them and note corrections made.

### 6. Confirm Completion

"**PRD Edits Complete**

**Changes Applied:** {count} sections modified
**PRD Updated:** {prd_file_path}

**Summary of Changes:**
{Brief bullet list of major changes}

**PRD is ready for:**

- Use in downstream workflows (UX, Architecture)
- Validation (if not yet validated)

What would you like to do next?"

### 7. Menu

**[C] Continue** - Proceed to completion summary
**[A] Adjust** - Make additional edits to specific sections

WAIT for user input.

- IF C: Read fully and follow: {nextStepFile}
- IF A: Accept additional requirements, loop back to section editing
