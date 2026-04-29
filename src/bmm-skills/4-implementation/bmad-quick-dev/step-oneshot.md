---
deferred_work_file: '{implementation_artifacts}/deferred-work.md'
---

# Step One-Shot: Implement, Review, Present

## RULES

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- NEVER auto-push.

## INSTRUCTIONS

### Implement

Follow `./sync-sprint-status.md` with `{target_status}` = `in-progress`.

Implement the clarified intent directly.

### Review

Invoke the `bmad-review-adversarial-general` skill in a subagent with the changed files. The subagent gets NO conversation context — to avoid anchoring bias. Launch at the same model capability as the current session. If no sub-agents are available, write the changed files to a review prompt file in `{implementation_artifacts}` and HALT. Ask the human to run the review in a separate session and paste back the findings.

### Classify

Deduplicate all review findings. Three categories only:

- **patch** — trivially fixable. Auto-fix immediately.
- **defer** — pre-existing issue not caused by this change. Append to `{deferred_work_file}`.
- **reject** — noise. Drop silently.

If a finding is caused by this change but too significant for a trivial patch, HALT and present it to the human for decision before proceeding.

### Resolve Output Mode (story-spec v3 bifurcation)

Before writing the spec trace, determine the output mode:

```
output_mode = bifurcation  IF spec_split_enabled == true (in workflow-context.md frontmatter)
                            AND tracker ∈ {linear, github, gitlab, jira}
output_mode = monolithic   OTHERWISE (file tracker, or flag false / absent)
```

**Path A — `output_mode == monolithic`:** write the full trace spec to `{spec_file}` only (legacy behavior). Frontmatter records `mode: monolithic` explicitly so downstream tooling can distinguish intentional one-shot from absent (legacy v1).

**Path B — `output_mode == bifurcation`:** apply `~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md` operation 1 (Create — initial publish) in quick-mode condensed form:

1. **Idempotency pre-check** — if a draft local file already exists at `{spec_file}` with frontmatter `tracker_issue_id` set, treat as **update** (operation 5). Otherwise create.
2. **Compose business markdown** — concatenate the canonical business sections present in the trace (typically only DoD/Problem/Solution if the one-shot was that simple, or the full set if more context emerged). Append the local-spec footer linking to `{spec_file}`.
3. **Size pre-check** per Size Limits in spec-bifurcation.md.
4. **Tracker write** — `tracker-crud.md` `create_issue` (or `update_issue_preserve` on retry) with the composed business markdown. Capture `id` + `url`. Emit structured echo per Observability section of tracker-crud.md.
5. **Compute** `business_content_hash = MD5(composed_business)[:8]`.
6. **Write local file** at `{spec_file}` with v3 frontmatter (`schema_version: "3.0"`, `mode: bifurcation`, `tracker_issue_id`, `tracker_url`, `business_content_hash`, `business_synced_at`) + business mirrors with markers + technical sections.

This ensures one-shot specs in bifurcation projects receive the same collaborative surface as `bmad-create-story`-produced specs (per BAC-1 + Task 6 of the v3 story).

**HALT contract** applies (zero-fallback per `no-fallback-no-false-data.md`): tracker write failure → HALT, never silently fall back to local-only.

### Generate Spec Trace

Set `{title}` = a concise title derived from the clarified intent.

Write `{spec_file}` using `./spec-template.md`. Fill only these sections — delete all others.

**Frontmatter (branches on `output_mode`):**

- `output_mode == monolithic`: `title: '{title}'`, `type`, `created`, `status: 'done'`, `route: 'one-shot'`, `mode: 'monolithic'`.
- `output_mode == bifurcation`: same fields + `schema_version: "3.0"`, `mode: 'bifurcation'`, `tracker_issue_id`, `tracker_url`, `business_content_hash`, `business_synced_at` (populated by Path B above).

**Body sections:**

1. **Title and Intent** — `# {title}` heading and `## Intent` with **Problem** and **Approach** lines. Reuse the summary you already generated for the terminal. In bifurcation mode, this content also goes into the tracker description as the "Problem" + "Proposed Solution" canonical sections.
2. **Business mirrors (bifurcation only)** — for each business section published to the tracker, emit the heading + marker `> Mirror — see tracker for canonical: {tracker_url}` + 1-line synopsis.
3. **Suggested Review Order** — append after Intent. Build using the same convention as `./step-05-present.md` § "Generate Suggested Review Order" (spec-file-relative links, concern-based ordering, ultra-concise framing). Technical only — never published to tracker.

Follow `./sync-sprint-status.md` with `{target_status}` = `review`.

### Commit

If version control is available and the tree is dirty, create a local commit with a conventional message derived from the intent. If VCS is unavailable, skip.

### Present

1. Open the spec in the user's editor so they can click through the Suggested Review Order:
   - Resolve two absolute paths: (1) the repository root (`git rev-parse --show-toplevel` — returns the worktree root when in a worktree, project root otherwise; if this fails, fall back to the current working directory), (2) `{spec_file}`. Run `code -r "{absolute-root}" "{absolute-spec-file}"` — the root first so VS Code opens in the right context, then the spec file. Always double-quote paths to handle spaces and special characters.
   - If `code` is not available (command fails), skip gracefully and tell the user the spec file path instead.
2. Display a summary in conversation output, including:
   - The commit hash (if one was created).
   - List of files changed with one-line descriptions. Any file paths shown in conversation/terminal output must use CWD-relative format (no leading `/`) with `:line` notation (e.g., `src/path/file.ts:42`) for terminal clickability — this differs from spec-file links which use spec-file-relative paths.
   - Review findings breakdown: patches applied, items deferred, items rejected. If all findings were rejected, say so.
   - A note that the spec is open in their editor (or the file path if it couldn't be opened). Mention that `{spec_file}` now contains a Suggested Review Order.
   - **Navigation tip:** "Ctrl+click (Cmd+click on macOS) the links in the Suggested Review Order to jump to each stop."
3. Offer to push and/or create a pull request.

HALT and wait for human input.

Workflow complete.
