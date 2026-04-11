---
nextStepFile: './step-03-edit.md'
prdFile: '{prd_file_path}'
validationReport: '{validation_report_path}'
prdPurpose: '../data/prd-purpose.md'
---

# Step 2: Deep Review & Analysis

## STEP GOAL

Thoroughly review the existing PRD, analyze validation report findings (if provided), and prepare a detailed change plan. Get user approval before any edits.

## RULES

- Focus on review and analysis only -- no PRD modifications in this step
- Map validation report findings to specific PRD sections when a report is available
- Build a section-by-section change plan with priorities
- Do not proceed to editing without explicit user approval on the plan
- Communicate in `{COMMUNICATION_LANGUAGE}`, write artifacts in `{DOCUMENT_OUTPUT_LANGUAGE}`

## SEQUENCE

### 1. Deep PRD Review

**IF validation report provided:**

1. Extract all findings from validation report
2. Map findings to specific PRD sections
3. Prioritize by severity: Critical > Warning > Informational
4. For each critical issue: identify specific fix needed
5. Map user's manual edit goals to sections

**IF no validation report:**

1. Read entire PRD thoroughly
2. Analyze against BMAD standards (from prd-purpose.md)
3. Identify issues in:
   - Information density (anti-patterns)
   - Structure and flow
   - Completeness (missing sections/content)
   - Measurability (unmeasurable requirements)
   - Traceability (broken chains)
   - Implementation leakage
4. Map user's edit goals to specific sections

### 2. Build Change Plan

Organize by PRD section. For each section (in order):

- **Current State:** Brief description of what exists
- **Issues Identified:** List from validation report or manual analysis
- **Changes Needed:** Specific changes required
- **Priority:** Critical / High / Medium / Low
- **User Requirements Met:** Which user edit goals this addresses

Include:

- Sections to add (if missing)
- Sections to update (if present but needs work)
- Content to remove (if incorrect/leakage)
- Structure changes (if reformatting needed)

### 3. Prepare Change Plan Summary

**Changes by Type:**

- Additions: {count} sections to add
- Updates: {count} sections to update
- Removals: {count} items to remove
- Restructuring: {yes/no}

**Priority Distribution:**

- Critical: {count} changes
- High: {count} changes
- Medium: {count} changes
- Low: {count} changes

**Estimated Effort:** Quick / Moderate / Substantial

### 4. Present Change Plan

"**Deep Review Complete -- Change Plan**

**PRD Analysis:**
{Brief summary of PRD current state}

{If validation report provided:}
**Validation Findings:**
{count} issues identified: {critical} critical, {warning} warnings

**Your Edit Requirements:**
{summary of what user wants to edit}

**Proposed Change Plan:**

**By Section:**
{Present section-by-section breakdown}

**By Priority:**

- Critical: {count} items
- High: {count} items
- Medium: {count} items

**Estimated Effort:** {effort level}

**Questions:**

1. Does this change plan align with what you had in mind?
2. Any sections to add/remove/reprioritize?
3. Any concerns before I proceed with edits?

Review the plan and let me know if you'd like any adjustments."

WAIT for user response.

### 5. Get User Confirmation

**If user wants adjustments:**

- Discuss requested changes
- Revise change plan accordingly
- Re-present for confirmation

**If user approves:**

- Note approved changes, priority order, and confirmation
- Continue to menu

### 6. Menu

**[A] Advanced Elicitation** - Get additional perspectives on change plan
**[P] Party Mode** - Discuss with team for more ideas
**[C] Continue to Edit** - Proceed with approved plan

WAIT for user input.

- IF A: Invoke `bmad-advanced-elicitation` skill, then return to discussion
- IF P: Invoke `bmad-party-mode` skill, then return to discussion
- IF C: Read fully and follow: {nextStepFile}
