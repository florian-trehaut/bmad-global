# Daily Script Template

Template for the standup script generated in step-05. Output must be plain text (no markdown formatting) so it can be copy-pasted into Slack/Teams/chat.

---

## Template

```
{DAILY_HEADER}

{YESTERDAY_HEADER}
{YESTERDAY_ITEMS}

{MRS_HEADER}
{MRS_ITEMS}

{TODAY_HEADER}
{TODAY_ITEMS}

{BLOCKERS_HEADER}
{BLOCKER_ITEMS}
```

## Placeholder Rules

- `{DAILY_HEADER}`: date in locale format (e.g., "Daily — lundi 24 mars 2026" or "Daily — Monday March 24, 2026")
- `{YESTERDAY_HEADER}`: localized "Yesterday" / "Hier" / etc.
- `{YESTERDAY_ITEMS}`: one line per item, prefixed with bullet (- or •). Each line: issue ID + short description OR commit summary if no issue
- `{MRS_HEADER}`: localized "MRs ouvertes" / "Open MRs" / etc.
- `{MRS_ITEMS}`: one line per MR, format: `• !{iid} ({issue_id}) — title : {action_needed}`. If no open MRs: "None" / "Aucune"
- `{TODAY_HEADER}`: localized "Today" / "Aujourd'hui" / etc.
- `{TODAY_ITEMS}`: one line per planned issue, prefixed with bullet. Format: issue ID + title + points (if estimated)
- `{BLOCKERS_HEADER}`: localized "Blockers" / "Bloqueurs" / etc.
- `{BLOCKER_ITEMS}`: one line per blocker. If no blockers: "None" / "Aucun"

## Example (fr)

```
Daily — lundi 24 mars 2026

Hier :
• REW-456 — Migration email templates (3 pts) ✓
• REW-789 — Fix booking date validation (1 pt) ✓
• Refactoring polling-service error handling (no ticket)

Aujourd'hui :
• REW-123 — Intégration catalogue ACAD (5 pts)
• REW-234 — Ajout endpoint GET /orders/:id (2 pts)
Budget : 7 pts (moyenne : 6.2 pts/jour)

Bloqueurs :
• Aucun
```

## Example (en)

```
Daily — Monday March 24, 2026

Yesterday:
• REW-456 — Email template migration (3 pts) ✓
• REW-789 — Fix booking date validation (1 pt) ✓
• Refactoring polling-service error handling (no ticket)

Today:
• REW-123 — ACAD catalog integration (5 pts)
• REW-234 — Add GET /orders/:id endpoint (2 pts)
Budget: 7 pts (average: 6.2 pts/day)

Blockers:
• None
```
