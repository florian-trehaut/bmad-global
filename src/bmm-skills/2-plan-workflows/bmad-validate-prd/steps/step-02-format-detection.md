---
nextStepFile: './step-03-density-validation.md'
altStepFile: './step-02b-parity-check.md'
---

# Step 2: Format Detection & Structure Analysis

## STEP GOAL

Detect if PRD follows BMAD format and route appropriately -- classify as BMAD Standard / BMAD Variant / Non-Standard, with optional parity check for non-standard formats.

## RULES

- Focus ONLY on detecting format and classifying structure
- FORBIDDEN to perform other validation checks in this step
- BMAD Standard/Variant PRDs proceed directly to next step
- Non-Standard PRDs pause and present options to user

## SEQUENCE

### 1. Extract PRD Structure

Load the complete PRD file and extract:

**All Level 2 (##) headers:**
- Scan through entire PRD document
- Extract all ## section headers
- List them in order

**PRD frontmatter:**
- Extract classification.domain if present
- Extract classification.projectType if present
- Note any other relevant metadata

### 2. Check for BMAD PRD Core Sections

Check if the PRD contains the following BMAD PRD core sections:

1. **Executive Summary** (or variations: ## Executive Summary, ## Overview, ## Introduction)
2. **Success Criteria** (or: ## Success Criteria, ## Goals, ## Objectives)
3. **Product Scope** (or: ## Product Scope, ## Scope, ## In Scope, ## Out of Scope)
4. **User Journeys** (or: ## User Journeys, ## User Stories, ## User Flows)
5. **Functional Requirements** (or: ## Functional Requirements, ## Features, ## Capabilities)
6. **Non-Functional Requirements** (or: ## Non-Functional Requirements, ## NFRs, ## Quality Attributes)

Count matches: how many of these 6 core sections are present, which are present, which are missing.

### 3. Classify PRD Format

Based on core section count:

**BMAD Standard:** 5-6 core sections present. Follows BMAD PRD structure closely.

**BMAD Variant:** 3-4 core sections present. Generally follows BMAD patterns but may have structural differences.

**Non-Standard:** Fewer than 3 core sections present. Does not follow BMAD PRD structure.

### 4. Report Format Findings to Validation Report

Append to validation report:

```markdown
## Format Detection

**PRD Structure:**
[List all ## Level 2 headers found]

**BMAD Core Sections Present:**
- Executive Summary: [Present/Missing]
- Success Criteria: [Present/Missing]
- Product Scope: [Present/Missing]
- User Journeys: [Present/Missing]
- Functional Requirements: [Present/Missing]
- Non-Functional Requirements: [Present/Missing]

**Format Classification:** [BMAD Standard / BMAD Variant / Non-Standard]
**Core Sections Present:** [count]/6
```

### 5. Route Based on Format Classification

**IF format is BMAD Standard or BMAD Variant:**

Display: "**Format Detected:** {classification}

Proceeding to systematic validation checks..."

Without delay, read fully and follow: {nextStepFile}

**IF format is Non-Standard (< 3 core sections):**

Display: "**Format Detected:** Non-Standard PRD

This PRD does not follow BMAD standard structure (only {count}/6 core sections present).

You have options:"

Present menu below.

### 6. Menu (Non-Standard PRDs Only)

**[A] Parity Check** - Analyze gaps and estimate effort to reach BMAD PRD parity
**[B] Validate As-Is** - Proceed with validation using current structure
**[C] Exit** - Exit validation and review format findings

- ALWAYS halt and wait for user input

Menu handling:

- IF A: Read fully and follow: {altStepFile}
- IF B: Display "Proceeding with validation..." then read fully and follow: {nextStepFile}
- IF C: Display format findings summary and exit validation
