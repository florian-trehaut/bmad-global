# Step 2: Check Merge Requests

## STEP GOAL

Review all open Merge Requests authored by the user. Classify each by action needed: ready to merge, waiting for review, has comments to address, or blocked. This feeds the daily script and helps prioritize the day.

## RULES

- Use the forge CLI (`{FORGE_CLI}`) to list open MRs — do not assume MR states
- Cross-reference with tracker issues when MRs reference an issue ID (e.g., PRJ-123 in the title)
- Flag mismatches between tracker status and MR status (e.g., tracker says "In Review" but MR has no reviewers)
- Do NOT merge or approve anything — this step is read-only

## SEQUENCE

### 1. List open MRs

Using the forge CLI:

```bash
{FORGE_CLI} mr list --author=@me
```

If no results, also try listing all open MRs and filtering by the user's forge username.

For each MR, capture: `iid`, `title`, `source_branch`, `state` (open/draft), `reviewers`, `comments_count`, `pipeline_status`.

### 2. Classify each MR

For each open MR, determine the action needed:

| Category | Condition | Action |
|----------|-----------|--------|
| **Ready to merge** | Pipeline green, approved, no unresolved threads | Merge today |
| **Needs review** | No reviewers assigned, or reviewers haven't responded | Follow up with reviewer |
| **Has feedback** | Unresolved comment threads | Address comments |
| **Draft** | MR is marked as draft | Continue working or mark ready |
| **Pipeline failing** | CI red | Fix pipeline |
| **Blocked** | Depends on another MR or external factor | Note blocker |

### 3. Cross-reference with tracker

For each MR that references a tracker issue ID in its title:
- Check the tracker issue status
- Flag if the tracker status doesn't match the MR state (e.g., issue is "To Test" but MR is not merged)

### 4. Present MR summary

Display:

```
Open MRs: {count}
  Ready to merge: {count}
  Needs review: {count}
  Has feedback: {count}
  Draft: {count}
  Pipeline failing: {count}
```

Then list each MR with its classification:

```
| MR | Title | Status | Action needed |
```

Store as `OPEN_MRS`.

---

**Next:** Read fully and follow `./steps/step-03-load-backlog.md`
