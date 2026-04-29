---
title: "Migrating from story-spec v2 to v3 (Bifurcation Mode)"
description: "When and how to enable bifurcation, what changes for new vs old stories, and how to manually upgrade legacy v2 specs."
sidebar_position: 30
diataxis: how-to
---

# Migrating from story-spec v2 to v3 (Bifurcation Mode)

## TL;DR

- **v3 adds an opt-in mode**: `bifurcation` — business sections in the collaborative tracker (Linear / GitHub Issues / GitLab Issues / Jira), technical sections in a local `.md` file versioned with the code.
- **v2 monolithic still works unchanged**: legacy specs (with `mode` field absent) are read as monolithic by every workflow, no migration needed.
- **The flag is opt-in per project**: set `spec_split_enabled: true` in `workflow-context.md` to enable bifurcation for all NEW specs in that project.
- **No auto-migration**: existing v2 specs in your project are NOT touched. To upgrade them manually, follow the manual procedure below.

---

## Should I enable bifurcation?

**Yes, if:**
- Your project uses Linear / GitHub Issues / GitLab Issues / Jira as its tracker
- Product Owners / stakeholders / PMs need to read, comment, and approve story specs in their tracker
- You currently struggle with PMs not engaging with `_bmad-output/.../*.md` files because the technical sections (NFR, EARS TACs, INVEST, Boundaries) overwhelm them

**No, if:**
- Your project uses the **file-based tracker** (`tracker: file`) — bifurcation requires a collaborative tracker; on file trackers it's a no-op anyway, but the option is irrelevant.
- Your team works exclusively on the local file (no PM/PO/stakeholder collaboration loop) — monolithic stays simpler for solo / engineer-only flows.
- You have heavy custom tooling that parses `_bmad-output/.../*.md` files and assumes all sections are present in one place — bifurcation will surface only technical sections + business mirrors locally, which may break that tooling. Migrate the tooling first.

---

## How to enable

### New projects (running `/bmad-project-init`)

`/bmad-project-init` step-03 prompts you for `spec_split_enabled` when `tracker` is collaborative. Answer `[O]ui` to enable. The flag is written to `workflow-context.md` automatically.

### Existing projects (already initialized)

Two options:

**Option A — `/bmad-knowledge-bootstrap`** (first time, or after schema upgrade):

Run `/bmad-knowledge-bootstrap`. Step-01-preflight detects the absent `spec_split_enabled` field on collaborative trackers and prompts you. The bootstrap then UPDATEs `workflow-context.md` additively (only this field; everything else is preserved).

**Option B — `/bmad-knowledge-refresh`** (subsequent toggle):

Run `/bmad-knowledge-refresh`. Step-01-detect-changes presents the current value and offers `[K]eep / [T]oggle / [S]kip`. Choose `[T]` to flip the flag.

### Manual edit

You can also edit `workflow-context.md` directly. Add (or change) the field at the end of the YAML frontmatter:

```yaml
# --- Story-spec mode (v3 bifurcation) ---
spec_split_enabled: true
```

The flag takes effect on the next `/bmad-create-story` or `/bmad-quick-dev` run. Existing specs are unaffected.

---

## What changes when bifurcation is on

### New specs created via `/bmad-create-story`

**Before (v2 monolithic):**

```
_bmad-output/implementation-artifacts/{story_key}.md   ← all 25 sections, single file
                                                          (or in tracker description if collab tracker)
```

**After (v3 bifurcation):**

```
Tracker issue (Linear/GitHub/GitLab/Jira)              ← business sections (DoD, Problem, Solution,
                                                          Scope, OOS, Business Context, VMs)
                                                          + footer linking to local technical spec

_bmad-output/implementation-artifacts/{story_key}.md   ← frontmatter (mode: bifurcation, tracker_issue_id, ...)
                                                          + business mirrors (heading + 1-line synopsis +
                                                            "Mirror — see tracker for canonical: <url>")
                                                          + technical sections (NFR, Security, EARS TACs,
                                                            INVEST, Boundaries, Risks, Real-Data Findings,
                                                            External Research, Test Strategy, File List, etc.)
```

### When you start dev (`/bmad-dev-story`)

In bifurcation mode, step-03-setup-worktree performs an atomic `git mv` of the local spec from the main repo into the dev worktree, with commit `spec: handoff to worktree`. After the move:

- The spec lives **only** in the worktree branch, alongside the implementation code.
- The main repo no longer contains the spec — it lives with the code that fulfills it.
- On trunk-based projects (`worktree_enabled: false`), the handoff is a no-op — the spec stays in place at `_bmad-output/.../`.

### When you review (`/bmad-review-story`) or validate (`/bmad-validation-*`)

The workflow:
1. Runs a lightweight **drift check** — fetches `tracker.updatedAt` and compares with frontmatter `business_synced_at` (60s tolerance for clock skew).
2. If drift detected, HALTs and presents `[R]efresh / [I]gnore / [V]iew diff`.
3. Composes a **unified view** — reads the local file (technical) + tracker description (business) and merges them in canonical heading order before analysis.

Validation Metier reads VMs from the tracker (canonical) — the local mirror is a non-canonical synopsis only.

---

## Existing v2 specs in your project

**Default behavior:** legacy v2 specs (with `mode` field absent in frontmatter) are read as **monolithic** by every workflow. No tracker fetch, no drift detection, no compose-unified-view. The workflow operates on the local file as-is, exactly like before.

**You DO NOT need to migrate existing v2 specs.** They keep working.

If you want to upgrade a specific v2 spec to v3 bifurcation manually:

1. **Decide which collaborative tracker holds the canonical business sections** — usually the same tracker your project uses for new stories.
2. **Create the tracker issue manually** with the business sections (DoD, Problem, Solution, Scope, OOS, Business Context, Validation Metier) copy-pasted from the v2 spec.
3. **Capture the tracker issue ID and URL.**
4. **Edit the local spec frontmatter:**
   ```yaml
   ---
   schema_version: "3.0"
   mode: bifurcation
   tracker_issue_id: "<id from step 3>"
   tracker_url: "<url from step 3>"
   business_content_hash: "<MD5(canonical_business)[:8] — see below>"
   business_synced_at: "<ISO 8601 now>"
   # ... existing frontmatter fields preserved (generated, generator, slug, story_points, profile)
   ---
   ```
5. **Replace each business section's content with a mirror:**
   ```markdown
   ## Definition of Done (product)

   > Mirror — see tracker for canonical: <tracker_url>

   <1-line synopsis — first paragraph or first list item, max 200 chars>
   ```
   Repeat for: Problem, Proposed Solution, Scope, Out of Scope, Business Context, Validation Metier.
6. **Keep technical sections unchanged** — Technical Context, Real-Data Findings, External Research, Data Model, API, Infrastructure, External Interfaces, Data Mapping, NFR Registry, Security Gate, Observability Requirements, Implementation Plan, Guardrails, Boundaries Triple, Risks & Assumptions, INVEST Self-Check, Test Strategy, File List.
7. **Compute `business_content_hash`** — concatenate the canonical business sections (the tracker's content, NOT the local mirrors) in canonical heading order, MD5 hash, take first 8 hex chars.
8. **Commit:**
   ```bash
   git add _bmad-output/implementation-artifacts/{story_key}.md
   git commit -m "chore: migrate {story_key} to story-spec v3 bifurcation"
   ```

A future automated migration script may be added in a follow-up story (currently OOS-6).

---

## Validation: `validate-story-spec.js --split`

The validator gains a `--split` flag for bifurcation mode:

```bash
# Validate a v3 bifurcation spec against an offline tracker fixture
node tools/validate-story-spec.js path/to/spec.md --split --tracker-fixture=tracker.json

# Drift detection (compares business_content_hash)
node tools/validate-story-spec.js path/to/spec.md --split --tracker-fixture=tracker.json --check-drift

# Override tracker_issue_id from frontmatter
node tools/validate-story-spec.js path/to/spec.md --split --tracker-id="ABC-123"
```

**Without `--split`** (default), validation is the same as v2 — no tracker fetch, no SPEC-SPLIT-* findings.

**Live tracker fetch** (calling Linear / GitHub / GitLab / Jira from the validator) is intentionally out of scope — workflows perform live fetches via `tracker-crud.md` recipes during their normal execution, the validator is offline-only via `--tracker-fixture`.

---

## What does NOT change

- **File-based trackers** (`tracker: file`) keep producing v2 monolithic specs regardless of `spec_split_enabled`. The flag is ignored on file trackers — they have no collaborative surface.
- **Legacy v2 specs** are NOT auto-migrated. They stay readable forever.
- **Workflow commands** (`/bmad-create-story`, `/bmad-dev-story`, etc.) are the same — only their internal behavior branches on `spec_split_enabled`.
- **Existing tests, validators, CI pipelines** are not affected by the v3 schema. The `--split` flag is opt-in for the validator; legacy callers without the flag see no change.
- **Out-of-Scope items** documented in the story — file-based bifurcation, bidirectional sync, real-time webhooks, multi-language specs, custom UIs, auto-migration tools, ban of v2 mode, validator wiring in CI — are explicit non-goals in this release.

---

## Related

- [Spec Bifurcation Concept](../explanation/spec-bifurcation.md) — design rationale and audience model
- [`spec-bifurcation.md` protocol](../../src/core-skills/bmad-shared/protocols/spec-bifurcation.md) — canonical operations and HALT contracts
- [`spec-completeness-rule.md` v3](../../src/core-skills/bmad-shared/spec-completeness-rule.md) — schema definition and section→location mapping
- [`tracker-crud.md` v1.2](../../src/core-skills/bmad-shared/protocols/tracker-crud.md) — operations 7+8 (preserve non-managed sections, lightweight drift check)
- [`knowledge-schema.md` v1.2](../../src/core-skills/bmad-shared/knowledge-schema.md) — registry of `spec-bifurcation` protocol and `spec_split_enabled` field
