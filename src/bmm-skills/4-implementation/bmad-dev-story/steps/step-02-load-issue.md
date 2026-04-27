---
nextStepFile: './step-03-setup-worktree.md'
---

# Step 2: Load Issue from Tracker

## STEP GOAL:

Load the selected issue details from the tracker and extract all identifiers needed for subsequent steps.

## MANDATORY SEQUENCE

### 1. Load Issue Details

Fetch the issue from the tracker (using CRUD patterns from workflow-knowledge/project.md):
- Operation: Get issue by ID
- Issue: {ISSUE_IDENTIFIER}
- Include: relations

Store:
- ISSUE_ID, ISSUE_IDENTIFIER, ISSUE_TITLE, PROJECT_NAME, PROJECT_ID
- The issue description IS the story — it contains tasks, AC, guardrails

### 2. Derive Names

- ISSUE_NUMBER: from ISSUE_IDENTIFIER using `{ISSUE_PREFIX}` (e.g., PRJ-48 -> 48)
- SHORT_DESCRIPTION: from ISSUE_TITLE (slugified, max 30 chars)

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All identifiers extracted, issue description stored
### FAILURE: Missing identifiers, not storing issue description
