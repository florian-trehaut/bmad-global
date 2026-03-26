# Step 4: Execute Approved Changes

## STEP GOAL

Apply all approved corrective actions in the issue tracker: create new issues, update modified issues, cancel removed issues, and add traceability comments. Present a final summary with next steps based on scope classification.

## RULES

- Only execute changes that were explicitly approved in step 3
- Add a traceability comment on every modified or canceled issue explaining the course correction
- For new issues, assign them to the correct project and set appropriate status
- If any tracker operation fails, report the error and continue with remaining operations
- Do NOT modify document content directly — document updates are noted for manual action

## SEQUENCE

### 1. Confirm execution

Ask {USER_NAME}:

> Ready to apply the approved changes to the tracker? This will create, modify, and cancel issues as specified in the plan.
>
> 1. **Execute** — apply all changes now
> 2. **Reference only** — keep the plan as documentation, do not modify the tracker

WAIT for user choice.

If **reference only**: skip to section 5 (final report) with a note that no tracker changes were made.

### 2. Create new issues

For each approved new story, create the issue in the tracker (using CRUD patterns from tracker.md):
- Operation: Create issue
- Title: {title}
- Description: {description} with Acceptance Criteria section
- Team: {TRACKER_TEAM_ID}
- Project: {target_project_id}

Record each created issue identifier.

### 3. Update modified issues

For each approved modification, update the issue in the tracker (using CRUD patterns from tracker.md):
- Operation: Update issue
- Issue: {issue_id}
- Description: {updated_description}

Add a traceability comment on each modified issue (using CRUD patterns from tracker.md):
- Operation: Create comment
- Issue: {issue_id}
- Body: Course correction: {change_reason} — Related change: {CHANGE_DESCRIPTION_SUMMARY}

### 4. Cancel issues

For each approved cancellation, update the issue in the tracker (using CRUD patterns from tracker.md):
- Operation: Update issue
- Issue: {issue_id}
- Status: {TRACKER_STATES.canceled}

Add a traceability comment (using CRUD patterns from tracker.md):
- Operation: Create comment
- Issue: {issue_id}
- Body: Canceled via course correction: {cancellation_reason} — Related change: {CHANGE_DESCRIPTION_SUMMARY}

### 5. Final report

Present the completion summary to {USER_NAME}:

```
## Course Correction Complete

- **Scope:** {SCOPE_CLASSIFICATION}
- **Issues created:** {count} ({list identifiers})
- **Issues modified:** {count} ({list identifiers})
- **Issues canceled:** {count} ({list identifiers})
- **Document updates noted:** {count}

### Next Steps

{based on SCOPE_CLASSIFICATION:}

**Minor:** Continue development with the updated backlog.

**Moderate:** Review the reorganized backlog in the tracker. Consider running sprint status to reassess capacity.

**Major:** Schedule a replanning session. Review PRD and Architecture documents before resuming development.
```

---

## END OF WORKFLOW

The bmad-correct-course workflow is complete.
