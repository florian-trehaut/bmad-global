---
title: "Spec Bifurcation — Why and How"
description: "Why story specs split between collaborative tracker and local file: the two-audience problem, the design choice, and the references that informed it."
sidebar_position: 20
diataxis: explanation
---

# Spec Bifurcation — Why and How

## The two-audience problem

A story spec has two audiences with very different reading patterns:

**Audience 1 — Business stakeholders** (Product Owner, Product Manager, business sponsor, customer success, support, sales). They read:
- What problem does this solve?
- What scope is in / out?
- What does "done" look like?
- What user-visible behavior is expected (Given/When/Then)?
- How will we validate it in production?

They read these in their **collaborative tools** — Linear, GitHub Issues, GitLab Issues, Jira. They comment, suggest changes, approve or reject directly in the tracker UI. The tracker is where their day-to-day collaboration happens.

**Audience 2 — Developers and AI agents** (Claude, Cursor, etc.). They read:
- What technical context applies (codebase patterns, existing files)?
- What real-data findings constrain the design?
- What external research informed the approach?
- What NFRs (performance, security, observability) apply?
- What EARS-formatted technical acceptance criteria are testable?
- What boundaries (Always/Ask/Never) constrain the agent?
- What test strategy maps to which AC?

They read these **with the code** — versioned in git, accessible during local development, propagated via worktree to wherever the implementation happens.

---

## What we tried before (v2 monolithic)

In story-spec **v2**, both audiences shared a single artifact — either a long Markdown file in `_bmad-output/.../{story_key}.md` or the full spec dumped into the tracker description. The result:

- **Business stakeholders open the tracker → see EARS, INVEST, Boundaries, Real-Data Findings, NFR Registry → bounce.** "This is a developer doc. Not for me."
- **Developers open the .md file → it has 25 sections, 800+ lines, the parts they need (TACs, File List) are buried.** Slow context loading, especially for AI agents.
- **The two audiences diverge silently.** PMs edit the tracker, devs edit the .md, neither knows about the other's changes. Validation fails because the business intent recorded in v0 of the spec doesn't match the v8 the PM has in their head from Slack threads.

This is the same failure mode that **specification by example** (BDD, Cucumber, SpecFlow) tried to solve in 2003-2010 — the canonical writeup is "Specification by Example: How Successful Teams Deliver the Right Software" (Gojko Adzic, 2011). The fix is the same: **let each audience edit in their natural tool, but anchor a shared contract**.

---

## The bifurcation design (v3)

Two physical destinations, one logical spec:

```
                 ┌─ TRACKER (canonical for business sections) ───────────────────┐
                 │   Definition of Done                                          │
   Business      │   Problem                                                     │
   audience  ──→ │   Proposed Solution                                           │
   (PO, PM,      │   Scope (Included / Excluded)                                 │
   stakeholder)  │   Out of Scope                                                │
                 │   Business Context (Journey + BACs Given/When/Then + Deps)    │
                 │   Validation Metier (VM-N)                                    │
                 │                                                               │
                 │   ↗ Footer: link to local technical spec                      │
                 └───────────────────────────────────────────────────────────────┘

                 ┌─ LOCAL FILE (canonical for technical sections) ───────────────┐
                 │   Frontmatter:                                                │
                 │     mode: bifurcation                                         │
                 │     tracker_issue_id, tracker_url                             │
                 │     business_content_hash, business_synced_at                 │
                 │                                                               │
                 │   Business mirrors (NON-canonical, 1-line synopses):          │
                 │     ## Definition of Done                                     │
                 │     > Mirror — see tracker for canonical: <url>               │
                 │     <1-line synopsis>                                         │
   Developer     │     (...same for the 6 other business headings...)            │
   + AI       ──→│                                                               │
   audience      │   Technical sections (canonical here):                        │
                 │     Technical Context                                         │
                 │     Real-Data Findings                                        │
                 │     External Research                                         │
                 │     NFR Registry / Security Gate / Observability              │
                 │     Implementation Plan with EARS TACs                        │
                 │     Guardrails / Boundaries / Risks / INVEST                  │
                 │     Test Strategy / File List / etc.                          │
                 └───────────────────────────────────────────────────────────────┘
```

### The mirror

Why duplicate business sections in the local file at all? **Speed of context loading for AI agents.**

Without the mirror, every Claude operation that needs business context would have to fetch the tracker. That's slow (network round-trip per operation), brittle (tracker downtime breaks dev), and expensive (rate limits on Linear / GitHub).

The mirror is a **1-line synopsis per business heading**, marked clearly as non-canonical:

```markdown
## Definition of Done (product)

> Mirror — see tracker for canonical: https://linear.app/team/issue/PROJ-123

This story is "Done" when refunds within 14 days are processed automatically.
```

Claude gets fast local context. The marker tells Claude (and humans) that for the actual canonical content, fetch the tracker. Manual edits to the mirror are discarded on next sync.

### Drift detection

The PM may edit the tracker description while the developer is mid-implementation. Without detection, the developer ships against a stale understanding. With detection:

- At the start of every review / validation / refresh step in bifurcation mode, the workflow fetches **only** `tracker.updatedAt` (lightweight, ~1 RPS budget per op).
- Compare with frontmatter `business_synced_at` (ISO 8601). With a 60-second tolerance for clock skew.
- If drift detected: HALT. Present the menu `[R]efresh / [I]gnore / [V]iew diff`.

Drift checks are **on-demand**, never proactive polling. Linear's rate limits and the lack of real-time need (the dev sees the drift menu the next time they run any workflow step in that session) make polling unnecessary.

---

## Design choices and their alternatives

| Decision | Why this | Alternative we rejected |
|----------|----------|-------------------------|
| Tracker = canonical for business | Humans edit where they collab | Bidirectional sync (tracker ↔ local) — too much complexity, divergence guaranteed |
| Local mirror is non-canonical (synopsis only) | Fast context for AI without tracker fetch | Full duplication — diverges silently if either side edits |
| Marker `> Mirror — see tracker for canonical:` | Visible, machine-parseable, prevents accidental treatment as canonical | No marker — ambiguous in mixed v2 / v3 codebases |
| Drift = on-demand check | Respects rate limits, no real-time need | Polling / webhooks — out of scope (OOS-3); future epic if usage demands |
| Worktree handoff via `git mv` | Atomic per git semantics; trace permanently in commit history | Copy + delete — non-atomic, can fail mid-flight; symlink — fragile across worktrees |
| `spec_split_enabled` opt-in flag | Per-project decision; backward compat absolute | Force migration — breaks existing projects; per-spec opt-in — too granular, unpredictable |
| Schema MAJOR bump v2 → v3 | Bifurcation is a model shift, deserves explicit signal | Add `bifurcation` as v2.1 — undersells the change; downstream tooling can't tell "no change" from "model shift" |
| Mirror = 1-line synopsis | Enough for Claude routing decisions, not enough to mistake for canonical | Mirror = full content — duplication = divergence trap |
| `tracker: file` excluded from bifurcation | File trackers have no collaborative surface | Allow bifurcation on file — pointless: the "tracker" IS the local file |

---

## Why three frontmatter fields for sync

| Field | Purpose | Without it |
|-------|---------|-----------|
| `tracker_issue_id` | Identifies which tracker issue is canonical | Workflows can't fetch the right description; multi-spec projects lose linkage |
| `tracker_url` | Human-readable jump link in mirrors and footer | Users have to manually search the tracker — friction defeats the bifurcation gain |
| `business_content_hash` | Detects content drift even when `updatedAt` doesn't bump (e.g. tracker edits that revert) | Drift relies on a single signal (timestamp) — single point of failure |
| `business_synced_at` | ISO 8601 timestamp of last sync — primary drift signal vs `tracker.updatedAt` | No basis for comparison; every load looks like potential drift |

The combination of timestamp + hash gives **two independent signals** for drift. Either one tripping (timestamp gap > 60s OR hash mismatch) is treated as drift.

---

## What this is NOT

- **Not a sync system.** Tracker is the source of truth for business. Local is the source of truth for technical. Each side edits in its own place. The mirror is a derivative, regenerated on demand.
- **Not real-time.** No webhooks, no polling. Drift is checked when the developer runs a workflow step that needs the canonical content.
- **Not a UI.** Trackers (Linear / GitHub / GitLab / Jira) provide the editing UX for business. Code editors provide the UX for technical. BMAD just routes content to the right place.
- **Not a migration tool.** Existing v2 specs are not auto-converted. The migration doc explains manual upgrade if you want it.
- **Not for solo / engineer-only flows.** If your project doesn't have PM/PO/stakeholder collaboration on specs, monolithic stays simpler. Use `spec_split_enabled: false` (the default).

---

## References

The bifurcation pattern is informed by:

- **[Specification by Example](https://gojko.net/books/specification-by-example/) (Gojko Adzic, 2011)** — the original two-audience analysis of executable business specs vs technical detail.
- **[BDD Specifications by Example](https://www.tutorialspoint.com/behavior_driven_development/bdd_specifications_by_example.htm)** — Given/When/Then as the universal vehicle for PM/dev collab on business behavior.
- **[GitHub Spec Kit](https://github.com/github/spec-kit)** — "PMs and engineering co-owners; revisions logged; shared glossary; example-first tests" — the contemporary canonical reference for spec-driven development practice in 2024-2026.
- **[Martin Fowler — Spec-Driven Development tools (2026)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)** — the modern survey of how AI agents shift spec ergonomics.
- **[Thoughtworks — Spec-driven development (2025)](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)** — the engineering-practice perspective, with emphasis on revisions logging and traceability.
- **[AWS CloudFormation Drift Detection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html)** — timestamp + hash as the canonical drift detection pattern, adapted here from infrastructure to spec content.
- **[Addy Osmani — A good spec for AI agents](https://addyo.substack.com/)** — the Boundaries Triple (Always Do / Ask First / Never Do) pattern that lives canonically in the local file's technical sections.

---

## Related

- [v2 → v3 Migration Guide](../migration/v2-to-v3-bifurcation.md) — how to enable bifurcation, manual migration of legacy specs
- [`spec-bifurcation.md` protocol](../../src/core-skills/bmad-shared/protocols/spec-bifurcation.md) — canonical operations: create, read (compose unified view), drift check, refresh, sync, worktree handoff, size limits
- [`spec-completeness-rule.md` v3](../../src/core-skills/bmad-shared/spec/spec-completeness-rule.md) — section list and section→location mapping
- [`tracker-crud.md` v1.2](../../src/core-skills/bmad-shared/protocols/tracker-crud.md) — tracker operations including the two new ones (preserve non-managed sections, lightweight `updatedAt` fetch) added for bifurcation
- [`knowledge-schema.md` v1.2](../../src/core-skills/bmad-shared/schema/knowledge-schema.md) — protocol registry and `spec_split_enabled` field documentation
