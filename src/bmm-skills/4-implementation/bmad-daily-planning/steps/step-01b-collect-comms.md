# Step 1b: Collect Communication Platform Discussions

> **Skip condition:** If `{COMM_PLATFORM}` is `none`, skip this step entirely and proceed to the next step.


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01b-ENTRY PASSED — entering Step 1b: Collect Communication Platform Discussions with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Scan comms platform conversations since `{LAST_DAILY_DATE}` to surface discussions involving the user — messages sent, DMs, mentions. Identify pending actions (replies due, decisions requested, info shared) to inform today's plan and the daily script.

## RULES

- **Read-only** — NO comms actions (no posting, no reacting, no marking read)
- Filter DMs using `@username` format (e.g., `@bastien.benloulou`), NOT raw channel IDs — MCP tools may not resolve channel IDs as DM filters
- Exclude system messages (bots, apps) UNLESS they mention the user
- This step is best-effort — if comms platform MCP tools are unavailable, log a warning and skip (do not HALT)

## SEQUENCE

### 1. List channels

Query the communication platform (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: List channels
- Limit: 200

Collect channel IDs and names for both public and private channels the user has access to.

### 2. Scan channels for user activity

For each day from `{LAST_DAILY_DATE}` to `{TODAY}` inclusive, search for messages involving the user.

Query the communication platform (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: Search messages
- Query: messages sent by `{USER_COMM_HANDLE}`
- Sort: by timestamp, descending

Also search for mentions:

Query the communication platform (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: Search messages
- Query: messages mentioning `{USER_COMM_HANDLE}`
- Sort: by timestamp, descending

If the comms handle is not known, use `{USER_NAME}` as fallback for the search query.

### 3. Scan DMs

Search for DM conversations using username-based filtering.

Query the communication platform (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: Search messages
- Query: messages sent by `{USER_COMM_HANDLE}` in DMs
- Sort: by timestamp, descending

And incoming DMs:

Query the communication platform (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: Search messages
- Query: messages sent to `{USER_COMM_HANDLE}` in DMs
- Sort: by timestamp, descending

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

Store the full list as `COMMS_DISCUSSIONS`.

### 6. Present summary

```
Comms activity since {LAST_DAILY_DATE}:
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

## STEP EXIT (CHK-STEP-01b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01b-EXIT PASSED — completed Step 1b: Collect Communication Platform Discussions
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-02-check-mrs.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
