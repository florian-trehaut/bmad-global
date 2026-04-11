---
nextStepFile: './step-02-format-detection.md'
prdPurpose: '../data/prd-purpose.md'
---

# Step 1: Document Discovery & Confirmation

## STEP GOAL

Handle fresh context validation by confirming PRD path, discovering and loading input documents from frontmatter, and initializing the validation report.

## RULES

- Focus ONLY on discovering PRD and input documents, not validating yet
- FORBIDDEN to perform any validation checks in this step
- FORBIDDEN to load next step until user confirms setup
- Save validation report before presenting menu

## SEQUENCE

### 1. Load PRD Purpose and Standards

Load and read the complete file at `{prdPurpose}`.

This file contains the BMAD PRD philosophy, standards, and validation criteria that guide all validation checks. Internalize this understanding -- it defines what makes a great BMAD PRD.

### 2. Discover PRD to Validate

**If PRD path provided as invocation parameter:**
- Use provided path

**If no PRD path provided, auto-discover:**
- Search `{PLANNING_ARTIFACTS}` for files matching `*prd*.md`
- Also check for sharded PRDs: `{PLANNING_ARTIFACTS}/*prd*/*.md`

**If exactly ONE PRD found:**
- Use it automatically
- Inform user: "Found PRD: {discovered_path} -- using it for validation."

**If MULTIPLE PRDs found:**
- List all discovered PRDs with numbered options
- "I found multiple PRDs. Which one would you like to validate?"
- Wait for user selection

**If NO PRDs found:**
- "I couldn't find any PRD files in {PLANNING_ARTIFACTS}. Please provide the path to the PRD file you want to validate."
- Wait for user to provide PRD path.

### 3. Validate PRD Exists and Load

Once PRD path is provided:

- Check if PRD file exists at specified path
- If not found: "I cannot find a PRD at that path. Please check the path and try again."
- If found: Load the complete PRD file including frontmatter

### 4. Extract Frontmatter and Input Documents

From the loaded PRD frontmatter, extract:

- `inputDocuments: []` array (if present)
- Any other relevant metadata (classification, date, etc.)

If no inputDocuments array exists, note this and proceed with PRD-only validation.

### 5. Load Input Documents

For each document listed in `inputDocuments`:

- Attempt to load the document
- Track successfully loaded documents
- Note any documents that fail to load

Build list of loaded input documents:
- Product Brief (if present)
- Research documents (if present)
- Other reference materials (if present)

### 6. Ask About Additional Reference Documents

"**I've loaded the following documents from your PRD frontmatter:**

{list loaded documents with file names}

**Are there any additional reference documents you'd like me to include in this validation?**

These could include:
- Additional research or context documents
- Project documentation not tracked in frontmatter
- Standards or compliance documents
- Competitive analysis or benchmarks

Please provide paths to any additional documents, or type 'none' to proceed."

Load any additional documents provided by user.

### 7. Initialize Validation Report

Create validation report at: `{validation_report_path}`

Initialize with frontmatter:
```yaml
---
validationTarget: '{prd_path}'
validationDate: '{current_date}'
inputDocuments: [list of all loaded documents]
validationStepsCompleted: []
validationStatus: IN_PROGRESS
---
```

Initial content:
```markdown
# PRD Validation Report

**PRD Being Validated:** {prd_path}
**Validation Date:** {current_date}

## Input Documents

{list all documents loaded for validation}

## Validation Findings

[Findings will be appended as validation progresses]
```

### 8. Present Discovery Summary

"**Setup Complete!**

**PRD to Validate:** {prd_path}

**Input Documents Loaded:**
- PRD: {prd_name}
- Product Brief: {count}
- Research: {count}
- Additional References: {count}

**Validation Report:** {validation_report_path}

**Ready to begin validation.**"

### 9. Present Menu

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Format Detection

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'

Menu handling:

- IF A: Invoke `bmad-advanced-elicitation`, then redisplay menu
- IF P: Invoke `bmad-party-mode`, then redisplay menu
- IF C: Read fully and follow: {nextStepFile}
- IF user provides additional document: Load it, update report, redisplay summary
