---
nextStepFile: './step-02-setup-worktree.md'
classificationRules: '../data/review-classification.md'
---

# Step 1: Discover Reviewable Items

## STEP GOAL:

Collect all open MRs from the forge, cross-reference with tracker issues in review state, classify each MR, and present a unified selection menu.

## MANDATORY EXECUTION RULES:

- Execute ALL steps in exact order -- NO skipping
- Communicate in {COMMUNICATION_LANGUAGE} with {USER_NAME}

## MANDATORY SEQUENCE

### 1. Check for Pre-Selected MR

<check if="mr_iid is provided and not empty">
  <action>Use provided MR IID -- skip discovery, store MR_IID, go directly to {nextStepFile}</action>
</check>

### 2. Get Current User

```bash
CURRENT_USER=$({FORGE_API_BASE} user | jq -r '.username')
```

Store CURRENT_USER for self-review detection.

### 3. List Open MRs from Forge

```bash
{FORGE_MR_LIST}
```

For EACH MR, get detailed status:

```bash
# MR details
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{mr_iid}" | jq '{
  iid: .iid,
  title: .title,
  author: .author.username,
  source_branch: .source_branch,
  target_branch: .target_branch,
  draft: .draft,
  has_conflicts: .has_conflicts
}'

# Approval status
# NOTE: {FORGE} may return approved=true when no approval rules are configured.
# Team policy requires at least 1 EXPLICIT approval (approved_by non-empty).
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{mr_iid}/approvals" | jq '{
  approved_by: [(.approved_by // [])[] | .user.username],
  has_explicit_approval: (([(.approved_by // [])[] | .user.username] | length) > 0)
}'

# Discussion threads summary
# NOTE: Use /notes endpoint, NOT /discussions -- /discussions can miss standalone resolvable notes
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{mr_iid}/notes?per_page=100" | tr -d '\000-\011\013-\037' | jq '{
  threads_total: [.[] | select(.resolvable == true and .system == false)] | length,
  threads_resolved: [.[] | select(.resolvable == true and .resolved == true and .system == false)] | length,
  threads_unresolved: [.[] | select(.resolvable == true and .resolved == false and .system == false)] | length
}'
```

### 4. Collect Tracker Issues in Review

```bash
{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', state: 'In Review', limit: 10)
```

### 5. Cross-Reference MRs and Tracker Issues

For each tracker issue in "In Review" state, search for a matching MR:

- Match by branch name containing the issue number (e.g., `feat/48-*` for `{ISSUE_PREFIX}-48`)
- Match by MR description mentioning the tracker identifier (e.g., `{ISSUE_PREFIX}-48`)

For each MR, try to link to a tracker issue:

- Parse MR description for `{ISSUE_PREFIX}-XXX` pattern
- Match branch name pattern `feat/{number}-*` to issue identifiers

**Invariant check -- flag anomalies:**

- Tracker issue in Review WITHOUT a matching MR -> warn user
- MR without any tracker issue -> note as "forge-only review"

### 6. Classify Each MR

Load and apply classification rules from {classificationRules}.

Categories:

- **Colleague review**: author != CURRENT_USER AND NOT draft AND no explicit approval from CURRENT_USER
- **Self-review**: author == CURRENT_USER AND NOT draft
- **Already reviewed**: has explicit approval from CURRENT_USER (regardless of author)
- **Draft / Non-reviewable**: draft == true OR has_conflicts == true

### 7. Present Consolidated Options

```markdown
## Reviewable Items

### Colleague reviews
_MRs from teammates awaiting your review._

| MR   | Title              | Author   | Tracker | Approved By  | Threads (resolved/total) |
| ---- | ------------------ | -------- | ------- | ------------ | ------------------------ |
| !155 | fix: Rate limiting | @alex    | (none)  | -- (needs 1) | 0/2                      |

### Self-review (my MRs)
_Your own MRs -- self-review or pre-merge check._

| MR   | Title                | Tracker         | Approved By  | Threads (resolved/total) |
| ---- | -------------------- | --------------- | ------------ | ------------------------ |
| !252 | feat: order-client   | {PREFIX}-292    | -- (needs 1) | 0/0                      |

### Already reviewed by you
_MRs you already approved -- waiting on author or ready to merge._

| MR   | Title              | Author   | Tracker     | Unresolved threads |
| ---- | ------------------ | -------- | ----------- | ------------------ |
| !251 | feat: event pipeline | @mathieu | {PREFIX}-358 | 11 (pending)      |

### Draft / Non-reviewable
_MRs not ready for review._

| MR   | Title              | Author   | Reason |
| ---- | ------------------ | -------- | ------ |
| !225 | chore: Claude Code | @florian | Draft  |

### Tracker issues in Review (no matching MR)

| Issue       | Title         | Anomaly |
| ----------- | ------------- | ------- |
| {PREFIX}-52 | Add filtering | No MR   |

### Options

[1] Review colleague MR (pick from "Colleague reviews")
[2] Self-review (pick from "Self-review")
[3] Re-review an already-approved MR
[4] Review a specific MR number

Which review would you like to perform?
```

WAIT for user choice.

### 8. Store Selection

Based on user choice, store:

- `MR_IID`, `MR_URL`, `MR_AUTHOR`, `MR_SOURCE_BRANCH`, `MR_TARGET_BRANCH`
- `LINKED_TRACKER_ISSUE` (if found), `ISSUE_ID`, `ISSUE_IDENTIFIER`
- `REVIEW_MODE` = `colleague` or `self` (based on classification)

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All MRs discovered, classified, user selected one, context stored
### FAILURE: Auto-selecting without user input, skipping classification, hiding errors
