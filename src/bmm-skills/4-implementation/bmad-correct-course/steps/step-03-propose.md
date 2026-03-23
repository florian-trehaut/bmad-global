# Step 3: Propose Corrective Actions

## STEP GOAL

Draft specific corrective proposals based on the approved impact analysis. Present all proposals in Plan mode for user validation before any tracker mutations.

## RULES

- Enter Plan mode before presenting proposals
- Each proposal must have a clear Old/New comparison or a concrete specification
- In incremental mode, present each proposal individually for discussion
- In batch mode, present all proposals at once
- Do NOT execute any tracker changes — that happens in step 4
- New stories must include title, description, and acceptance criteria
- Modifications must specify exactly what changes in the existing issue

## SEQUENCE

### 1. Draft story changes

For each category from the approved assessment, draft specific proposals:

**Stories to modify:**

For each issue identified in step 2:
- **Issue:** {identifier} — {current title}
- **What changes:** {specific edits to description, acceptance criteria, or scope}
- **Reason:** {why this change is needed}

**New stories to create:**

For each new issue identified in step 2:
- **Title:** {proposed title}
- **Description:** {proposed description with context}
- **Acceptance Criteria:** {at minimum 2-3 clear criteria}
- **Target project:** {which epic/project this belongs to}
- **Priority:** {suggested priority based on urgency}

**Stories to cancel:**

For each issue to cancel:
- **Issue:** {identifier} — {current title}
- **Reason:** {why it should be canceled}
- **Comment to add:** {explanation to leave on the canceled issue}

### 2. Draft document changes (if applicable)

If the assessment identified PRD, architecture, or UX document updates:

- **Document:** {document name/location}
- **Section:** {which section needs updating}
- **Old:** {current content summary}
- **New:** {proposed content summary}
- **Reason:** {why this update is needed}

### 3. Determine recommended approach

Based on the scope classification, recommend an approach:

- **Minor (adjustment):** Apply changes directly, dev team continues with updated stories
- **Moderate (backlog reorganization):** Apply changes, reorganize the backlog, possibly defer some items to next cycle
- **Major (replan):** Apply critical changes, flag for a broader replanning session (PRD/Architecture review)

### 4. CHECKPOINT — Plan mode validation

Present the complete change plan to {USER_NAME}:

```
## Course Correction Plan

### Recommended Approach: {approach_type} ({SCOPE_CLASSIFICATION})

{recommendation_summary}

### Story Modifications ({count})
{list each modification with identifier, old/new, reason}

### New Stories ({count})
{list each new story with title, description, AC, target project}

### Stories to Cancel ({count})
{list each cancellation with identifier, reason}

### Document Updates ({count})
{list each document change if any}

---
Approve this plan to proceed with tracker updates?
Modify specific proposals?
Abort the course correction?
```

WAIT for user decision.

- If **approved**: proceed to step 4
- If **modifications requested**: update the relevant proposals and re-present
- If **aborted**: end the workflow with a summary of the analysis performed

---

**Next:** Read fully and follow `./step-04-execute.md`
