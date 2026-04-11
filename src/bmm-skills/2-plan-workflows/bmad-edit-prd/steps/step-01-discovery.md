---
nextStepFile: './step-02-review.md'
prdPurpose: '../data/prd-purpose.md'
---

# Step 1: Discovery & Understanding

## STEP GOAL

Understand what the user wants to edit in the PRD, detect PRD format/type, check for validation report guidance, and route appropriately.

## RULES

- Focus ONLY on discovering user intent and PRD format -- no edits in this step
- Auto-detect validation reports in the PRD folder before asking the user for one
- BMAD-format PRDs proceed directly to review; legacy PRDs pause for conversion options
- You are a facilitator: collaborative dialogue, not command-response
- Communicate in `{COMMUNICATION_LANGUAGE}`, write artifacts in `{DOCUMENT_OUTPUT_LANGUAGE}`

## SEQUENCE

### 1. Load PRD Purpose Standards

Read the complete file at `{prdPurpose}` (data/prd-purpose.md). Internalize this understanding -- it guides all improvement recommendations throughout the workflow.

### 2. Discover PRD to Edit

"**PRD Edit Workflow**

Which PRD would you like to edit? Please provide the path to the PRD file."

WAIT for user to provide PRD path.

### 3. Validate PRD Exists and Load

Once PRD path is provided:

- Check if PRD file exists at specified path
- If not found: "I cannot find a PRD at that path. Please check the path and try again."
- If found: Load the complete PRD file including frontmatter

### 4. Check for Existing Validation Report

Check if a validation report exists in the PRD folder:

```bash
ls -t {prd_folder_path}/validation-report-*.md 2>/dev/null | head -1
```

**If validation report found:**

"I found a validation report from {validation_date} in the PRD folder. This report contains findings from previous validation checks and can help guide our edits.

**[U] Use validation report** - Load it to guide and prioritize edits
**[S] Skip** - Proceed with manual edit discovery"

WAIT for user input.

- IF U: Load the validation report, extract findings, issues, and improvement suggestions. Continue to step 5.
- IF S: Continue to step 5.

**If no validation report found:** Continue to step 5 without asking.

### 5. Ask About Validation Report

"Do you have a validation report to guide edits? If you've run the validation workflow on this PRD, I can use that report to guide improvements and prioritize changes.

Validation report path (or type 'none'):"

WAIT for user input.

- If path provided: Load the validation report, extract findings, severity, improvement suggestions.
- If 'none': Continue to step 6.

### 6. Discover Edit Requirements

"What would you like to edit in this PRD?

Please describe the changes you want to make. For example:

- Fix specific issues (information density, implementation leakage, etc.)
- Add missing sections or content
- Improve structure and flow
- Convert to BMAD format (if legacy PRD)
- General improvements

**Describe your edit goals:**"

WAIT for user to describe their requirements.

### 7. Detect PRD Format

Analyze the loaded PRD. Extract all ## Level 2 headers.

Check for BMAD PRD core sections:

1. Executive Summary
2. Success Criteria
3. Product Scope
4. User Journeys
5. Functional Requirements
6. Non-Functional Requirements

Classify format:

- **BMAD Standard:** 5-6 core sections present
- **BMAD Variant:** 3-4 core sections present, generally follows BMAD patterns
- **Legacy (Non-Standard):** Fewer than 3 core sections, does not follow BMAD structure

### 8. Route Based on Format and Context

**IF validation report provided OR PRD is BMAD Standard/Variant:**

"**Edit Requirements Understood**

**PRD Format:** {classification}
{If validation report: '**Validation Guide:** Yes - will use validation report findings'}
**Edit Goals:** {summary of user's requirements}

Proceeding to deep review and analysis..."

Read fully and follow: `./step-02-review.md`

**IF PRD is Legacy (Non-Standard) AND no validation report:**

"**Format Detected:** Legacy PRD

This PRD does not follow BMAD standard structure (only {count}/6 core sections present).

**Your edit goals:** {user's requirements}

How would you like to proceed?"

Present menu below.

### 9. Menu (Legacy PRDs Only)

**[C] Convert to BMAD Format** - Convert PRD to BMAD standard structure, then apply your edits
**[E] Edit As-Is** - Apply your edits without converting the format
**[X] Exit** - Exit and review conversion options

WAIT for user input.

- IF C: Read fully and follow: `./step-01b-legacy-conversion.md`
- IF E: "Proceeding with edits..." then read fully and follow: `./step-02-review.md`
- IF X: Display summary and exit
