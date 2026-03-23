# Step 1: Discover Target Issue

## STEP GOAL

Identify the Backlog issue to enrich. Either the user provides a specific issue identifier (e.g., `{ISSUE_PREFIX}-123`), or we auto-discover the first Backlog issue in the current cycle.

## RULES

- Communicate in `{COMMUNICATION_LANGUAGE}` with `{USER_NAME}`
- If user provided an identifier, use it directly — do not auto-discover
- Auto-discovery sorts by project (epic) then issue number to pick the next logical story
- If no Backlog issues exist in the current cycle, try Todo issues (they may need re-enrichment)
- If still none, try Backlog issues without a cycle assignment

## SEQUENCE

### 1. Check for user-provided identifier

If the user specified an issue identifier (e.g., `{ISSUE_PREFIX}-123` or a full issue ID):

1. Fetch the issue: `{TRACKER_MCP_PREFIX}get_issue(id: identifier, includeRelations: true)`
2. Store: `ISSUE_ID`, `ISSUE_IDENTIFIER`, `ISSUE_TITLE`
3. Extract the project (epic): `PROJECT_NAME`, `PROJECT_ID`
4. Proceed to the CHECKPOINT (section 6 below)

### 2. Auto-discover from current cycle

If no specific issue was provided:

1. Get current cycle: `{TRACKER_MCP_PREFIX}list_cycles(teamId: {TRACKER_TEAM_ID}, type: 'current')`
2. List Backlog issues: `{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', state: 'Backlog', limit: 50)`
3. Filter to issues assigned to the current cycle
4. Sort by project name (epic), then by issue number (ascending)
5. Select the first issue

### 3. Fallback: Todo issues in current cycle

If no Backlog issues found in the current cycle:

1. List Todo issues: `{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', state: 'Todo', limit: 50)`
2. Filter to current cycle
3. If found, select the first — it may need re-enrichment

### 4. Fallback: Backlog issues without cycle

If still no issues found:

1. List all Backlog issues: `{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', state: 'Backlog', limit: 50)`
2. Filter to issues WITHOUT a cycle assignment
3. If found, select the first

If no suitable issue is found at all:

**HALT:** "Aucune issue Backlog trouvee dans le tracker. Lancez le workflow de sprint planning pour creer des issues depuis les epics."

### 5. Store issue metadata

From the selected issue, extract and store:

- `ISSUE_ID` — internal tracker ID
- `ISSUE_IDENTIFIER` — human-readable identifier (e.g., `{ISSUE_PREFIX}-123`)
- `ISSUE_TITLE` — issue title
- `PROJECT_NAME` — the project/epic this issue belongs to
- `PROJECT_ID` — the project/epic ID (needed to load documents)
- `EPIC_SLUG` — slugified version of `PROJECT_NAME` (lowercase, hyphenated)

### 6. CHECKPOINT

Present the discovered issue to the user:

```
Issue cible : {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
Epic : {PROJECT_NAME}
Statut actuel : {current_status}

Je vais charger tout le contexte (Project Context, PRD, Architecture, UX, stories completes) puis enrichir cette issue avec les taches, guardrails, et criteres d'acceptation.

Confirmez-vous ?
```

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-load-context.md`
