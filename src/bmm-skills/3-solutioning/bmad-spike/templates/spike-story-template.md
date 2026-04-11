# Spike-Informed Story Template

Template for stories created from spike investigation findings. These are backlog seeds — enough context for prioritization and for create-story to build on, NOT full implementation specs.

## Structure

```markdown
## Context

This story was informed by **Spike: {spike_title}** ({SPIKE_ISSUE_IDENTIFIER or slug}).

**Spike verdict:** {GO | NO-GO | GO WITH CAVEATS}

See the spike deliverable document for full investigation context.

### Relevant Spike Findings

{Excerpt only the specific findings relevant to THIS story — not the entire deliverable.
Include evidence references.}

- {finding 1 — with evidence reference}
- {finding 2 — with evidence reference}

### Decisions Made During Spike

These decisions are settled — this story must honor them:

- {decision 1 — e.g., "Use PostgreSQL for this service (ADR: Spike: auth-provider-comparison)"}
- {decision 2 — e.g., "Provider X webhook format requires custom parser (PoC confirmed)"}

### Constraints Discovered

Limitations and dependencies found during investigation:

- {constraint 1 — e.g., "Provider X rate limits to 100 req/min — must implement backoff"}
- {constraint 2 — e.g., "Library Y requires Node.js 20+ — verify CI runner compatibility"}

## Scope

**In scope:**
- {what this story covers — derived from spike follow-up actions}

**Out of scope:**
- {explicitly excluded — may be another story from the same spike}

## Initial Acceptance Criteria

To be refined by create-story — these are rough criteria from the spike:

- [ ] {AC-1 — from spike findings}
- [ ] {AC-2 — from spike findings}

## Notes

- This story needs full specification via **create-story** before implementation
- The spike provides investigation context; the spec provides the implementation plan
- Reference the PoC branch `spike/{slug}` for code examples (if branch was kept)
```

## Guidelines

### What to Include
- Enough context for a product owner to prioritize the story
- Enough technical context for create-story to build on without re-investigating
- Concrete decisions that must be honored (not re-debated)
- Known constraints that affect implementation

### What NOT to Include
- Full implementation plan (that's create-story's job)
- Detailed technical acceptance criteria (that's create-story's job)
- Task breakdown (that's create-story's job)
- Detailed test strategy (that's create-story's job)

### Tracker-Specific Notes

**Tracker:** Create as tracker issue with:
- Label: `spike-informed`
- State: Backlog
- Relation: `blocked by` the spike issue
- Project: same as spike (if applicable)

**Jira:** Create as Story with:
- Label: `spike-informed`
- Link: `is informed by` the spike issue
- Sprint: none (backlog)

**GitHub:** Create as Issue with:
- Label: `spike-informed`
- Reference spike issue in body: `Informed by #NNN`

**GitLab:** Create as Issue with:
- Scoped label: `source::spike`
- Related issue: spike issue (relates to)
