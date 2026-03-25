# Step 1b: Collect Slack Discussions

## STEP GOAL

Scan Slack conversations since `{LAST_DAILY_DATE}` to surface discussions involving the user — messages sent, DMs, mentions. Identify pending actions (replies due, decisions requested, info shared) to inform today's plan and the daily script.

## RULES

- **Read-only** — NO Slack actions (no posting, no reacting, no marking read)
- Filter DMs using `@username` format (e.g., `@bastien.benloulou`), NOT raw channel IDs — MCP Slack tools don't resolve channel IDs as DM filters
- Exclude system messages (bots, apps) UNLESS they mention the user
- This step is best-effort — if Slack MCP tools are unavailable, log a warning and skip (do not HALT)

## SEQUENCE

### 1. List channels

Use MCP Slack tools to list accessible channels:

```
mcp__slack__channels_list(limit: 200)
```

Collect channel IDs and names for both public and private channels the user has access to.

### 2. Scan channels for user activity

For each day from `{LAST_DAILY_DATE}` to `{TODAY}` inclusive, search for messages involving the user:

```
mcp__slack__conversations_search_messages(query: "from:@{USER_SLACK_HANDLE}", sort: "timestamp", sort_dir: "desc")
```

Also search for mentions:

```
mcp__slack__conversations_search_messages(query: "@{USER_SLACK_HANDLE}", sort: "timestamp", sort_dir: "desc")
```

If the Slack handle is not known, use `{USER_NAME}` as fallback for the search query.

### 3. Scan DMs

Search for DM conversations using username-based filtering:

```
mcp__slack__conversations_search_messages(query: "from:@{USER_SLACK_HANDLE} in:dm", sort: "timestamp", sort_dir: "desc")
```

And incoming DMs:

```
mcp__slack__conversations_search_messages(query: "to:@{USER_SLACK_HANDLE} in:dm", sort: "timestamp", sort_dir: "desc")
```

Exclude:
- Messages from bots/apps (unless mentioning the user)
- Messages from the user's own account to themselves

### 4. Filter and deduplicate

Keep only messages that involve the user:
- **Sent by** the user
- **In DMs** with the user
- **Mentioning** the user (@mention or name match)

Deduplicate across searches (same message found via multiple queries).

### 5. Summarize by conversation

For each conversation thread with activity, produce:

```yaml
- channel: "{channel_name or DM with @participant}"
  participants: ["{@user1}", "{@user2}"]
  summary: "{1-line summary of the discussion topic}"
  action_needed: "{null | reply_due | decision_requested | info_shared | follow_up}"
  action_detail: "{specific action description if action_needed is not null}"
  last_activity: "{timestamp}"
```

**Action detection heuristics:**
- **reply_due**: The last message in the thread is from someone else AND is a question or request directed at the user
- **decision_requested**: Message contains decision language ("what do you think", "should we", "your call", "approve/reject")
- **info_shared**: User was tagged in an informational message (FYI, announcement, shared link)
- **follow_up**: User committed to an action ("I'll do X", "will check", "let me look into") that has no visible follow-through

Store the full list as `SLACK_DISCUSSIONS`.

### 6. Present summary

```
Slack activity since {LAST_DAILY_DATE}:
  Channels: {count} active conversations
  DMs: {count} active conversations
  Pending actions: {count}
```

If pending actions exist, list them briefly:

```
Pending actions:
  • #{channel_name}: {action_detail} (with @participant)
  • DM @participant: {action_detail}
```

---

**Next:** Read fully and follow `./steps/step-02-check-mrs.md`
