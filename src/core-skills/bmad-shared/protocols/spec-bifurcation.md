# Spec Bifurcation Protocol

**Loaded by:** Any bmad-* workflow that produces, reads, or syncs story specs in **bifurcation mode** (`mode: bifurcation` in spec frontmatter, `spec_split_enabled: true` in `workflow-context.md`).

**Companion to:** `tracker-crud.md` (CRUD operations on the tracker), `spec-completeness-rule.md` (canonical section list and v3 schema definition), `no-fallback-no-false-data.md` (HALT contract).

---

## Purpose

Bifurcation splits a story spec into two physical destinations driven by audience:

- **Tracker** (Linear / GitHub Issues / GitLab Issues / Jira) — canonical for **business sections** (DoD, Problem, Solution, Scope, OOS, Business Context, Validation Metier). Read and edited by Product Owners and stakeholders in their natural collab tooling.
- **Local file** at `{TRACKER_STORY_LOCATION}/{story_key}.md` — canonical for **technical sections** (NFR, Security Gate, EARS TACs, INVEST, Test Strategy, File List, Boundaries, Risks, Real-Data Findings, External Research, Data Model, API, Infrastructure, External Interfaces, Data Mapping, Guardrails, Observability) AND a **non-canonical mirror** of business sections for fast Claude context.

This protocol resolves the `mode: bifurcation` schema declared in `spec-completeness-rule.md` v3.

---

## When to apply

| Condition | Bifurcation? |
|-----------|--------------|
| `spec_split_enabled: true` AND `tracker ∈ {linear, github, gitlab, jira}` | YES — produce / read in bifurcation mode |
| `spec_split_enabled: false` (or absent — defaults to `false`) | NO — monolithic only |
| `tracker == file` (regardless of `spec_split_enabled`) | NO — monolithic only (no collaborative tracker available) |
| Existing spec with `mode: monolithic` (or `mode` field absent) | NO — read as monolithic regardless of project flag |

The `spec_split_enabled` flag is a **project-level** opt-in declared once in `workflow-context.md`. The `mode` field on the spec is the **per-spec** decision frozen at creation time.

---

## Section → Location mapping (canonical)

| # | Section | Canonical destination | Local mirror |
|---|---------|----------------------|--------------|
| 1 | Definition of Done (product) | tracker | yes |
| 2 | Problem | tracker | yes |
| 3 | Proposed Solution | tracker | yes |
| 4 | Scope (Included/Excluded) | tracker | yes |
| 5 | Out of Scope | tracker | yes |
| 6 | Business Context (User Journey + BACs G/W/T + External Deps) | tracker | yes |
| 20 | Validation Metier (VM-N) | tracker | yes |
| 7 | Technical Context | local | n/a |
| 8 | Real-Data Findings | local | n/a |
| 9 | External Research | local | n/a |
| 10 | Data Model | local | n/a |
| 11 | API Contracts | local | n/a |
| 12 | Infrastructure | local | n/a |
| 13 | External Data Interface Contracts | local | n/a |
| 14 | Data Mapping | local | n/a |
| 15 | NFR Registry | local | n/a |
| 16 | Security Gate | local | n/a |
| 17 | Observability Requirements | local | n/a |
| 18 | Implementation Plan (Tasks + TACs EARS) | local | n/a |
| 19 | Guardrails | local | n/a |
| 21 | Boundaries Triple | local | n/a |
| 22 | Risks & Assumptions Register | local | n/a |
| 23 | INVEST Self-Check | local | n/a |
| 24 | Test Strategy | local | n/a |
| 25 | File List | local | n/a |

**Audience rule:** business = humans editing in tracker. Technical = developers + Claude reading code-versioned spec.

**Mirror rule:** business sections are duplicated in the local file as **non-canonical mirrors** with the marker `> Mirror — see tracker for canonical: {tracker_url}` as their first line. The mirror gives Claude rapid context without fetching the tracker on every operation. Manual edits to mirror content are discarded on next sync.

---

## Operations

### 1. Create — initial publish

`bmad-create-story` step-13-output (and `bmad-quick-dev` step-oneshot) produce a fresh spec in bifurcation mode by:

1. **Idempotency pre-check** — if frontmatter `tracker_issue_id` is already set on a draft local file, treat as **update** (operation 4 below) rather than create. This prevents duplicate tracker issues on retries.
2. **Compose business markdown** — concatenate sections 1-6 + 20 in canonical heading order. Append the footer:
   ```
   ---
   ↗ Technical spec: [`{story_key}.md`]({REPO_URL}/blob/main/{TRACKER_STORY_LOCATION}/{story_key}.md) (committed with code in worktree)
   ```
3. **Size pre-check** — compute byte length of the composed business markdown. If it exceeds the tracker's documented limit (see Size Limits section below), HALT with the size + tracker limit + recommendation to reduce content or split via tracker comments. Never silently truncate.
4. **Write to tracker** — call `tracker-crud.md` `create_issue` recipe for the resolved `tracker`. Capture the returned `id` (Linear UUID / GitHub issue number / GitLab IID / Jira key) and `url`.
5. **Compute business hash** — `business_content_hash = MD5(composed_business_markdown).hex().slice(0, 8)`.
6. **Write local file** — emit `{TRACKER_STORY_LOCATION}/{story_key}.md` with:
   - Frontmatter: `schema_version: "3.0"`, `mode: bifurcation`, `tracker_issue_id`, `tracker_url`, `business_content_hash`, `business_synced_at: <ISO 8601 now>`.
   - Business mirror sections 1-6 + 20 — for each section, emit the H2 heading, the marker `> Mirror — see tracker for canonical: {tracker_url}`, then a 1-line synopsis (first paragraph or first list item, ≤ 200 chars).
   - Technical sections 7-19, 21-25 in full canonical form.
7. **Display result** — print to user: tracker URL + local file path + write timings (per Observability Requirements).

### 2. Read — get full spec

`bmad-review-story`, `bmad-validation-*`, `bmad-dev-story` (steps that consume the spec) read in bifurcation mode by calling the **compose unified view** helper:

1. Read frontmatter from the local file. If `mode != bifurcation` → return local file content as-is (legacy v2 / monolithic path).
2. If `mode == bifurcation`:
   - Read local file (technical sections + business mirrors).
   - Call `tracker-crud.md` `get_issue` for `tracker_issue_id` — fetch the full description.
   - Compose unified view: replace business mirror sections in the local content with the tracker's canonical business sections (preserving heading order from `spec-completeness-rule.md`).
   - Return the composed view to the consumer workflow.
3. **HALT contract** — if the tracker fetch fails (4xx / 5xx / auth / network), HALT immediately with the tracker reason verbatim. Never silently fall back to the local mirror — the mirror is non-canonical.

### 3. Drift check — `get issue updatedAt only`

Lightweight check executed at the start of any review / validation / dev refresh step in bifurcation mode:

1. Call `tracker-crud.md` `get_issue_updated_at` (lightweight: returns only the timestamp field, NOT the full description) for `tracker_issue_id`.
2. Compare with frontmatter `business_synced_at`.
3. **Tolerance:** if `tracker_updated_at <= business_synced_at + 60s` → no drift. The 60s window absorbs clock skew between client and tracker.
4. **Drift detected:** if `tracker_updated_at > business_synced_at + 60s`:
   - HALT.
   - Display: tracker URL, the two timestamps, the drift gap.
   - Present menu:
     ```
     Drift detected on {ISSUE_IDENTIFIER}.
     Tracker last updated: {tracker_updated_at}
     Local synced at:     {business_synced_at}
     Gap: {N seconds}

     [R]efresh — pull tracker description, regenerate mirror, update business_synced_at + business_content_hash, commit
     [I]gnore  — continue with local state (current session only — drift menu re-fires next time)
     [V]iew    — display the full diff (tracker description vs local mirror) without modifying anything
     ```
   - **No default selection. No timeout.** Wait for explicit user input — `R`, `I`, or `V`. On any other input, redisplay the menu.

### 4. Update — sync local mirror from tracker (operation [R])

Triggered by user choosing `[R]efresh` from the drift menu, or by an explicit refresh command:

1. Call `tracker-crud.md` `get_issue` for `tracker_issue_id` — fetch full description.
2. Parse the tracker description for the canonical business sections per `spec-completeness-rule.md` H2 headings.
3. **Null-safety check** — every required field (`description`, `updatedAt`, `id`, `url`) must be present and well-typed. If any field is missing or malformed, HALT with a typed error explaining which field failed validation.
4. Regenerate the mirror in the local file:
   - For each business section: replace the heading + body in the local file with the tracker's heading + the marker `> Mirror — see tracker for canonical: {tracker_url}` + a 1-line synopsis.
5. Compute fresh `business_content_hash` from the canonical tracker sections.
6. Update frontmatter: `business_synced_at: <ISO 8601 now>`, `business_content_hash: <new hash>`.
7. Commit: `git commit -m "spec: refresh business sections from tracker"`.

### 5. Update — sync tracker from local (preserving non-managed sections)

Reserved for cases where a workflow modifies a business section locally before publishing (rare — most flows have the user edit directly in the tracker UI). When this happens:

1. Read current tracker description via `tracker-crud.md` `get_issue`.
2. Parse the description, identify which H2 sections are **managed** by BMAD (the canonical business sections per the section→location mapping). Keep all **non-managed** sections (custom additions made by the PO) verbatim.
3. Compose the new description: managed sections from local file + non-managed sections in their original positions.
4. Size pre-check (same as operation 1).
5. Call `tracker-crud.md` `update_issue` with the composed description.
6. Update local frontmatter: `business_synced_at`, `business_content_hash`.

This operation is the BMAD-side **read-modify-write** that does NOT clobber sections added manually by the PO outside the managed set.

### 6. Worktree handoff — `git mv` from main repo to worktree

Triggered by `bmad-dev-story` step-03-setup-worktree when `spec_split_enabled: true` AND a local spec exists at `{MAIN_PROJECT_ROOT}/{TRACKER_STORY_LOCATION}/{story_key}.md`:

1. Verify the source file exists in the main repo.
2. Verify the worktree path is set and the worktree is on the dev branch (per `worktree-lifecycle.md` Branch B).
3. Execute atomically:
   ```bash
   cd {MAIN_PROJECT_ROOT}
   git mv {TRACKER_STORY_LOCATION}/{story_key}.md {WORKTREE_PATH}/{TRACKER_STORY_LOCATION}/{story_key}.md
   git -C {WORKTREE_PATH} commit -m "spec: handoff to worktree"
   ```
4. Verify the source file is **absent** from the main repo after the move (`git ls-files {TRACKER_STORY_LOCATION}/{story_key}.md` returns nothing in main). HALT if still present.
5. Log: source path, destination path, commit SHA.

If the project is **trunk-based** (`worktree_enabled: false`), the handoff is a no-op — the spec stays in place at `{MAIN_PROJECT_ROOT}/{TRACKER_STORY_LOCATION}/{story_key}.md`.

---

## Size Limits — per tracker (TAC-11)

Enforced at write time in operations 1 and 5 (create / update tracker description).

| Tracker | Documented limit | BMAD margin (HALT threshold) | Source |
|---------|-----------------|------------------------------|--------|
| GitHub Issues | 65,536 chars (gzipped body) | **60,000 chars** | [GitHub community discussion #41331](https://github.com/orgs/community/discussions/41331) |
| Linear | Not publicly documented — detected at first write via schema introspection (cached in `~/.claude/skills/bmad-shared/data/tracker-limits.cache.json`) | **detected_limit × 0.92** | [Linear GraphQL API](https://linear.app/developers/graphql) |
| GitLab Issues | ~1,000,000 chars | **950,000 chars** | [GitLab forum #7392](https://forum.gitlab.com/t/api-v4-create-issue-with-long-description/7392) |
| Jira | Default 32,000 chars; per-instance configurable — detected from instance config | **detected_limit × 0.92** | Per-instance config |

**HALT message template:**

```
Tracker description size exceeds the {tracker_type} limit.
  Composed business markdown: {N} chars
  Tracker limit ({tracker_type}): {LIMIT} chars (BMAD margin: {MARGIN} chars)
  Recommendation:
    - Reduce content in business sections (split detail into Real-Data Findings, External Research, etc., which live in the local file).
    - Use tracker comments for incremental notes/changes after creation.
    - For one-off oversize: ask the user to publish manually and provide the issue ID.
```

Never silently truncate.

---

## HALT contract for bifurcation operations (zero-fallback)

Per `no-fallback-no-false-data.md`, the following errors trigger immediate HALT — never silent fallback, retry-loop, or log+continue:

| Failure mode | HALT message preamble |
|--------------|---------------------|
| Tracker API 4xx (auth, permission) | `Tracker authentication / authorization failed: {tracker_reason}` |
| Tracker API 5xx (server error) | `Tracker server error: {tracker_reason} — try again later` |
| Tracker API network failure | `Tracker network failure: {error_message}` |
| Tracker description missing required field | `Tracker response missing required field: {field_name}` |
| Tracker description size exceeds limit | (template above) |
| `git mv` fails on handoff | `Worktree handoff failed: {git_reason}` (typical: uncommitted changes, conflict) |
| Drift menu input not in `[R, I, V]` | (redisplay menu — no auto-default) |
| `tracker_issue_id` missing on operation 2-5 | `Spec is in bifurcation mode but tracker_issue_id is absent. Run sync to repair.` |

The HALT surface is the user — operations never silently fall back to the local mirror, never invent a default selection on the drift menu, never rebuild stale frontmatter from speculation.

---

## Mirror marker contract

Every business section copied into the local file as a mirror MUST start with this exact marker:

```
> Mirror — see tracker for canonical: {tracker_url}
```

Workflows reading the local file MUST recognize the marker and treat the body as **non-canonical**. The marker is regenerated on every sync (operations 1, 4) — if a workflow finds a business section without the marker, that's a corruption and the workflow MUST HALT and propose a refresh.

The mirror body is at most a **1-line synopsis** — typically the first paragraph of the canonical content, or the first list item, truncated to 200 chars max. The mirror is never the full content. To get the canonical content, callers MUST go to the tracker URL.

---

## Frontmatter sync contract (Task 26)

After every successful sync (create or refresh), the local file frontmatter MUST be updated atomically with:

- `business_synced_at: <ISO 8601 timestamp at sync time>` — used by drift detection
- `business_content_hash: <8-char hex MD5 of canonical business sections>` — used by drift detection robustness (catches edits that don't bump `updatedAt`, e.g. tracker edits that revert content)
- `tracker_issue_id`, `tracker_url` — set on initial create, never modified afterward unless the spec is moved between trackers (rare, manual operation)

The frontmatter update is committed in the same git commit as the body change (`spec: refresh business sections from tracker` or `spec: handoff to worktree` or `feat(...): create story spec`).

---

## Performance measurement plan (Task 27)

The NFR Registry for the v3 bifurcation story declares the following performance targets:

| Operation | Target (p95) |
|-----------|--------------|
| Tracker `create_issue` | < 5 seconds |
| Tracker `get_issue_updated_at` (lightweight) | < 1 second |
| Spec move main → worktree (`git mv` + commit) | < 500 ms |
| Drift check (full cycle: fetch updatedAt + compare) | < 1 second |

**Permanent instrumentation:** the structured echoes documented in `tracker-crud.md` (Observability section) already capture `duration_ms` for every tracker call. These echoes are emitted in production and provide the per-call timing for SLO tracking — no separate timing instrumentation is needed beyond what is already in place.

**Measurement procedure** (run on a real Linear / GitHub / GitLab project, NOT on a file-tracker):

1. Set up a sandbox project on the chosen tracker (Linear test workspace recommended).
2. Run `/bmad-create-story` with a realistic prompt — verify the tracker write echo emits `duration_ms`.
3. Run `/bmad-dev-story` on the created story — verify the `git mv` + commit echo emits `duration_ms`.
4. Run `/bmad-review-story` — verify the drift check echo (`get_issue_updated_at`) emits `duration_ms`.
5. Repeat 5+ times to compute p95.
6. Document p95 results in the PR description: `Tracker latency observed: create_issue p95 X ms, get_issue_updated_at p95 Y ms, git mv + commit p95 Z ms, drift check p95 W ms`.
7. Compare with NFR targets above. If a target is exceeded, file a follow-up story for performance investigation (likely a chunked write or an alternate tracker recipe).

**Why deferred for the v3 release on this BMAD-METHOD fork:** BMAD-METHOD itself uses `tracker: file` (file-based tracker), so bifurcation is structurally inactive on this project. The Linear / GitHub / GitLab paths are exercised by **downstream consumer projects** that opt in via `spec_split_enabled: true`. Initial measurement should be done by the first downstream consumer project — typically a project with a Linear sandbox available for testing.

## Cross-references

- `~/.claude/skills/bmad-shared/spec/spec-completeness-rule.md` — canonical mandatory section list (v3 schema definition, including this protocol's section → location mapping)
- `~/.claude/skills/bmad-shared/protocols/tracker-crud.md` — CRUD operations and per-tracker recipes (this protocol composes them)
- `~/.claude/skills/bmad-shared/core/no-fallback-no-false-data.md` — zero-fallback rule that the HALT contract above implements
- `~/.claude/skills/bmad-shared/lifecycle/worktree-lifecycle.md` — worktree creation lifecycle (operation 6 plugs into Branch B)
- `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` — `spec_split_enabled` is documented in v1.2

---

## Why this protocol exists

- **Decoupling**: workflows reference this protocol instead of inlining bifurcation logic — when the section→location mapping changes, only this file updates, not 7+ workflow steps.
- **Single source of change**: tracker write recipes live in `tracker-crud.md`, audience mapping lives here. Each rule has one home.
- **Maintainability**: bifurcation is opt-in (project flag) and additive (legacy v2 monolithic preserved). New tracker types only require updating `tracker-crud.md` recipes — this protocol stays stable.
- **Audit trail**: business edits live in the tracker history (Linear / GitHub / GitLab / Jira timeline). Technical edits live in git history. The `business_synced_at` + `business_content_hash` frontmatter document each sync moment for drift detection.

See `~/.claude/skills/bmad-shared/schema/knowledge-schema.md` for the broader knowledge architecture rationale.
