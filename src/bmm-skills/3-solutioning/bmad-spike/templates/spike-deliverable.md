# Spike Deliverable Document Template

Template for composing the tracker Document published in Step 7. This is the permanent record of the spike investigation.

## Structure

```markdown
# Spike: {title}

**Completed:** {date}
**Type:** {Technical | Functional | Hybrid}
**Timebox:** {sessions_used} / {sessions_planned} sessions
**Spike Issue:** {ISSUE_IDENTIFIER or "Ad-hoc"}
**Verdict:** {GO | NO-GO | GO WITH CAVEATS}
**PoC Branch:** `spike/{slug}` {KEPT FOR REFERENCE | DELETED | N/A}

---

## Spike Question

{The crisp, specific question that was investigated}

## Knowledge Acceptance Criteria

| KAC | Status | Summary |
|-----|--------|---------|
| KAC-1 | {ANSWERED / PARTIAL / UNANSWERED} | {brief answer with evidence reference} |
| KAC-2 | {status} | {summary} |
| KAC-3 | {status} | {summary} |

---

{DELIVERABLE CONTENT}

{Insert the full deliverable from Step 4 here — ADR, trade-off matrix, PoC findings,
or findings summary. For combined formats, include all applicable deliverables
separated by horizontal rules.}

---

## Stories Created

| Issue | Title | Status | Rationale |
|-------|-------|--------|-----------|
| {PREFIX}-XXX | {title} | Backlog | {which finding informed this story} |
| {PREFIX}-YYY | {title} | Backlog | {rationale} |

{If no stories created: "No implementation stories created from this spike."}

## Related Context

- **Project/Epic:** {project name or "standalone"}
- **Related Issues:** {list of related tracker issues or "none"}
- **Related Documents:** {list of related tracker documents or "none"}
- **PoC Branch:** {`spike/{slug}` if kept, or "deleted — see PoC Findings section" if not}
```

## Conditional Sections

- **Spike Question**: ALWAYS present
- **Knowledge Acceptance Criteria**: ALWAYS present
- **Deliverable Content**: ALWAYS present (whichever format was chosen)
- **Stories Created**: ALWAYS present (may say "none")
- **Related Context**: ALWAYS present

## Tracker-Specific Notes

### Tracker
- Save as a Project Document in the Meta Project (or the epic's project if applicable)
- Tracker documents support full Markdown including tables and code blocks
- Use the tracker's native syntax to create clickable issue references within the document

### Jira
- Save as a linked Confluence page (if Confluence available) or as the spike issue description
- Use Jira Issue Macro for cross-references

### GitHub
- Save as a wiki page or as a Markdown file in `docs/spikes/` in the repository
- Link from the spike issue

### GitLab
- Save as a wiki page or as a Markdown file in `docs/spikes/` in the repository
- Link from the spike issue using `relates to` relationship
