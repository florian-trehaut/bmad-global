---
nextStepFile: './step-04-discover-changes.md'
---

# Step 3: Load Context and Review Skills

## STEP GOAL:

Load all review checklists, project standards, and tracker issue details needed for the review.

## MANDATORY SEQUENCE

### 1. Load Shared Rules (if not already loaded)

Read all files in `~/.claude/skills/bmad-shared/`.

### 2. Load Project Review Perspectives (if available)

If `.claude/workflow-knowledge/review-perspectives.md` exists at project root, read it. This file contains project-specific review checklists that override defaults in step-06.

### 3. Load Stack Knowledge (if available)

If `.claude/workflow-knowledge/stack.md` exists at project root, read it. This provides:

- Reference code directories (use as pattern source)
- Legacy code directories (NEVER reference as pattern)
- Forbidden patterns
- Test conventions

### 4. Load Review Mode Context

<check if="self-review (REVIEW_MODE == 'self')">
  <action>Warn user: "Self-reviewing your own code. Consider using a different LLM for a fresh perspective."</action>
  <action>Self-review will execute 6 perspectives inline in step-06.</action>
</check>

<check if="colleague review (REVIEW_MODE == 'colleague')">
  <action>Colleague review will spawn parallel agents in step-06.</action>
</check>

### 5. Load Tracker Issue Details

<check if="LINKED_TRACKER_ISSUE exists">
  Load issue details from tracker:

```bash
{TRACKER_MCP_PREFIX}get_issue(id: '{ISSUE_ID}', includeRelations: true)
```

  Extract from issue description:
  - Acceptance Criteria (ACs)
  - Gherkin scenarios
  - Test Plan
  - Validation Metier items

  The issue description IS the story -- this is the spec compliance reference.
</check>

<check if="no LINKED_TRACKER_ISSUE">
  Log: "No tracker issue linked -- Specs Compliance perspective will be limited to MR description."
  Parse MR description for any ACs or requirements.
</check>

### 6. Load Project Context Document (optional)

If the project has a project-context document (architecture, stack decisions), load it:

1. Primary: tracker documents -- `{TRACKER_MCP_PREFIX}list_documents(projectId: '{TRACKER_META_PROJECT_ID}')` -> find "Project Context" -> `{TRACKER_MCP_PREFIX}get_document(id: doc_id)`
2. Fallback: `**/project-context.md` in the project root

### 7. Store Loaded Context

All loaded content is now available for step-06 review execution.

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All available context loaded, review mode determined, tracker issue parsed
### FAILURE: Skipping context loading, proceeding without checklists
