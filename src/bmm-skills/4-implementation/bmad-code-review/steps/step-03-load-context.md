---
nextStepFile: './step-04-discover-changes.md'
---

# Step 3: Load Context and Review Skills

## STEP GOAL:

Load all review checklists, project standards, and tracker issue details needed for the review.

## PRE-CHECK: Worktree Invariant

**HALT if** `REVIEW_WORKTREE_PATH` is not set, empty, or the directory does not exist.
This step reads project files — without a worktree, reads target the main repo (wrong branch).

## MANDATORY SEQUENCE

### 1. Load Shared Rules (if not already loaded)

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually. (bmad-shared is a directory, not a file — do NOT attempt to Read it directly.)

### 2. Load Project Review Perspectives (if available)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` exists at project root, read it. This file contains project-specific review checklists that override defaults in step-06.

### 3. Load Stack Knowledge (if available)

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` exists at project root, read it. This provides:

- Reference code directories (use as pattern source)
- Legacy code directories (NEVER reference as pattern)
- Forbidden patterns
- Test conventions

### 4. Load Contribution Conventions (if available)

Search for contribution guidelines in the worktree root — these constrain MR format and CI expectations:

```bash
cd {REVIEW_WORKTREE_PATH}
ls CONTRIBUTING.md .github/CONTRIBUTING.md .github/pull_request_template.md dangerfile.js dangerfile.ts 2>/dev/null
```

If found, read and extract PR requirements, CI linter rules, commit message rules, CLA requirements. Store as `CONTRIBUTION_CONVENTIONS`. The review should verify the MR follows these conventions.

### 5. Load Architecture Decision Records (if available)

Check `adr_location` from workflow-context.md.

<check if="adr_location is set and not 'none'">
  Load all ADRs from the configured location (directory, tracker documents, or other source).

  **Conflict resolution:** when multiple ADRs exist on the same topic, the most recent one (by date or sequence number) takes precedence and supersedes older ones.

  Store as `PROJECT_ADRS` — the review should verify the MR doesn't violate active architectural decisions.
</check>

### 6. Load Review Mode Context

<check if="self-review (REVIEW_MODE == 'self')">
  <action>Warn user: "Self-reviewing your own code. Consider using a different LLM for a fresh perspective."</action>
  <action>Self-review will execute 6 perspectives inline in step-06.</action>
</check>

<check if="colleague review (REVIEW_MODE == 'colleague')">
  <action>Colleague review will spawn parallel agents in step-06.</action>
</check>

### 7. Search for Prior Closed/Rejected MRs on Same Issue

If `LINKED_TRACKER_ISSUE` exists, search for prior closed MRs related to the same issue:

```bash
{FORGE_CLI} mr list --state closed --search "{ISSUE_IDENTIFIER}" 2>/dev/null || true
```

<check if="closed/rejected MRs found (excluding current MR)">
  Note prior approaches, rejection reasons, and reviewer objections.
  These inform the review — if the current MR repeats a previously rejected approach, flag it.
  Store as `PRIOR_MRS`.
</check>

### 8. Load Tracker Issue Details

<check if="LINKED_TRACKER_ISSUE exists">
  Load issue details from the tracker (using CRUD patterns from tracker.md):
  - Operation: Get issue
  - Issue: {ISSUE_ID}
  - Include relations: yes

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

### 9. Load Project Context Document (optional)

If the project has a project-context document (architecture, stack decisions), load it:

1. Primary: tracker documents — list documents for {TRACKER_META_PROJECT_ID}, find "Project Context", then get the document content (using CRUD patterns from tracker.md)
2. Fallback: `**/project-context.md` in the project root

### 10. Store Loaded Context

All loaded content is now available for step-06 review execution.

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All available context loaded, review mode determined, tracker issue parsed
### FAILURE: Skipping context loading, proceeding without checklists
