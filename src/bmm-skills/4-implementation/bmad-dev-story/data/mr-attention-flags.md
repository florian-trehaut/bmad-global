# MR Attention Flags

Classification logic for forge Merge Requests to identify actionable items.

## Thread Analysis

For forge platforms that support threaded discussions (GitLab, GitHub), analyze MR threads to determine which need developer action.

```bash
# Fetch all notes/comments for a MR
# Use {FORGE_API_BASE} from workflow-context.md
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests/$MR_IID/notes?per_page=100&sort=asc" \
  | tr -d '\000-\011\013-\037' > /tmp/mr_notes_${MR_IID}.json

# Analyze threads by file:line grouping
# Use (.x == $y) | not instead of != — bash interprets ! in strings
THREAD_ANALYSIS=$(jq --arg author "$FORGE_USER" '
  [.[] | select(.resolvable == true) | select(.resolved == false) | select(.system == false)] |
  if length == 0 then { needs_reply: 0, awaiting_resolution: 0 }
  else
    group_by((.position.new_path // "general") + ":" + ((.position.new_line // 0) | tostring)) |
    map({ last_author: (sort_by(.created_at) | last | .author.username) }) |
    {
      needs_reply: [.[] | select((.last_author == $author) | not)] | length,
      awaiting_resolution: [.[] | select(.last_author == $author)] | length
    }
  end
' /tmp/mr_notes_${MR_IID}.json)
```

## Flag Categories

### Actionable Flags (dev MUST act)

```
needs_reply       — Unresolved threads where LAST message is NOT by the dev
ci_failed         — detailed_merge_status contains CI failure states
needs_rebase      — detailed_merge_status == "need_rebase"
has_conflicts     — detailed_merge_status == "has_conflicts"
```

### Informational Flags (NOT actionable)

```
awaiting_resolution — Unresolved threads where dev already replied (ball in reviewer's court)
```

## Display Format

```
# Actionable flags:
{count} comment(s) pending reply      — needs_reply
CI failed                              — ci_failed
Rebase needed                          — needs_rebase
Conflicts                              — has_conflicts

# Informational (shown in parentheses):
({count} awaiting resolution)          — awaiting_resolution
```

Multiple flags concatenated: `3 comments · CI failed · Rebase needed (5 awaiting resolution)`

## Rules

- `discussions_not_resolved` in detailed_merge_status does NOT mean the dev needs to act
- Only `needs_reply` (last message by reviewer) is actionable
- MRs with ONLY `awaiting_resolution` are NOT shown in "MRs needing attention"
- MRs with zero flags are healthy — do not display them
