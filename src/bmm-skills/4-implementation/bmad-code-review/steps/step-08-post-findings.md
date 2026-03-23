---
---

# Step 8: Post Findings and Final Report

## STEP GOAL:

Post findings to the chosen target(s), handle MR approval for colleague reviews, and produce the final summary.

---

## FORGE DIFFNOTES (OUTPUT_METHOD includes forge)

### 1. Load Existing Comments (Avoid Duplicates)

```bash
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
# Use /notes endpoint -- /discussions can miss standalone resolvable notes
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}/notes?per_page=100" | tr -d '\000-\011\013-\037' | jq '[
  .[] | select(.system == false) | {
    id: .id,
    file: (.position.new_path // null),
    line: (.position.new_line // null),
    body: .body,
    resolved: (.resolvable and .resolved)
  }
]'
```

### 2. Get diff_refs for DiffNote Positioning

```bash
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}" | jq '.diff_refs'
```

### 3. Post Each Finding as DiffNote

**MANDATORY: Post ALL findings — no filtering, no skipping, no batching by severity.** Every single finding (BLOCKER, WARNING, RECOMMENDATION, QUESTION) MUST be posted as its own individual DiffNote thread. Do NOT silently drop findings of any severity. Do NOT group multiple findings into a single note unless they are about the exact same file:line. The only exception is if the user explicitly asks to filter or skip a severity level.

For each finding with a file:line reference, post as a DiffNote thread (discussion).

Use severity prefixes in the comment body: `BLOCKER:`, `WARNING:`, `Recommendation:`, `Question:`.

Include pattern references from non-legacy code where applicable.

**Verification:** After posting, count the total DiffNotes created and compare against the total findings count from consolidation. If the counts do not match, identify and post the missing findings before proceeding.

### 4. Post Summary Note

Post a summary note on the MR with:
- Total findings count by severity
- Perspectives checked
- Verdict
- Regression risk assessment

### 5. Approval Decision

```bash
EXISTING_APPROVALS=$({FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/{MR_IID}/approvals" | jq '[(.approved_by // [])[] | .user.username] | length')
```

- 0 blockers AND not already approved by current user -> `{FORGE_CLI} mr approve {MR_IID}`
- >0 blockers -> NO approval, author must fix blockers first

---

## TRACKER COMMENT (OUTPUT_METHOD includes tracker)

<check if="LINKED_TRACKER_ISSUE exists">
  Post findings as a tracker comment:

  ```bash
  {TRACKER_MCP_PREFIX}save_comment(issueId: '{ISSUE_ID}', body: '{review_findings_markdown}')
  ```

  Include: verdict, score, findings by severity, AC coverage table.
</check>

<check if="no LINKED_TRACKER_ISSUE">
  Log: "No tracker issue linked -- skipping tracker comment."
</check>

---

## AUTO-FIX (self-review, OUTPUT_METHOD == fix)

For each finding:
1. Apply the fix inside {REVIEW_WORKTREE_PATH}
2. Run tests after each fix: `{TEST_COMMAND}`
3. Note fixes applied

After all fixes, run full validation:

```bash
cd {REVIEW_WORKTREE_PATH}
{QUALITY_GATE}
```

### Commit Strategy — Minimal Commits

**Apply the commit strategy defined in step-06 ("Self-Review: Commit Strategy — Minimal Commits").** Key rules:

- **Amend** the existing commit — do NOT create a new "review fix" commit
- **Push with `--force-with-lease`** to `origin/{MR_SOURCE_BRANCH}`
- The worktree IS the MR branch — commits push directly

<check if="all validations pass AND LINKED_TRACKER_ISSUE exists">
  Update tracker issue status to To Test:
  ```bash
  {TRACKER_MCP_PREFIX}save_issue(id: '{ISSUE_ID}', state: 'To Test')
  ```
  Add comment: "Self-review complete — all findings resolved. Ready for validation métier."

  **NEVER set Done from code-review.** Done is ONLY set by the validation-metier workflow after all VM items pass.
</check>

<check if="some validations fail">
  Keep issue in current status.
  Report remaining issues to user.
</check>

---

## ACTION ITEMS (self-review, OUTPUT_METHOD == action_items)

<check if="LINKED_TRACKER_ISSUE exists">
  Add "Review Action Items" as comment on the tracker issue with checkboxes:

  ```markdown
  ## Review Action Items

  - [ ] F001: {description} ({file}:{line})
  - [ ] F002: {description} ({file}:{line})
  ```

  Update tracker issue back to In Progress:
  ```bash
  {TRACKER_MCP_PREFIX}save_issue(id: '{ISSUE_ID}', stateId: '{TRACKER_STATES.in_progress}')
  ```
  Add comment: "Action items created. Address and re-submit."
</check>

---

## FINAL REPORT

```markdown
## Code Review Complete

- **MR**: !{MR_IID} -- {MR_URL}
- **Author**: @{MR_AUTHOR}
- **Tracker Issue**: {ISSUE_IDENTIFIER} (or "none linked")
- **Review Type**: {colleague / self-review}
- **Worktree**: {REVIEW_WORKTREE_PATH}
- **Findings**: {total_count} (BLOCKER {blocker_count} / WARNING {warning_count} / RECOMMENDATION {rec_count})
- **Output**: {Forge DiffNotes / Tracker comment / Auto-fixed / Action items}
- **Approval**: {Approved / Not approved (blockers exist) / N/A}

### Corrections Applied (if auto-fix)
{list of fixes}

### Next Steps

{if colleague review}
- Author addresses blockers and replies to threads
- Re-review when threads are resolved

{if self-review with fixes}
- All findings resolved -- ready for external review or merge

{if self-review with action items}
- Address action items, then re-run self-review
```

## NEXT STEP — MANDATORY

After the final report is presented, **execute the retrospective step**: read and follow `{project-root}/_bmad/core/bmad-shared/retrospective-step.md`. This is NOT optional — it runs after EVERY execution (and silently skips if no friction was encountered).

## SUCCESS/FAILURE:

### SUCCESS: Findings posted to chosen target, approval handled, final report produced, retrospective executed
### FAILURE: Approving MR with blockers, skipping posting, hiding findings, skipping retrospective
