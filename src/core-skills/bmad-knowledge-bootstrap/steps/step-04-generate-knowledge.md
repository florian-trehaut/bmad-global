---
nextStepFile: './step-05-review-write.md'
---

# Step 4: Generate Knowledge Files (project.md, domain.md, api.md)

## STEP GOAL:

Generate 3 consolidated knowledge files (`project.md`, `domain.md`, `api.md`) by merging available sources per the SDD priority pyramid (specs > ADRs > architecture > PRD > code). Drafts are stored in memory — NOT written to disk yet.

If old 10-file layout was detected by step-01, also read those legacy files and merge their content into the new layout (migration mode).

## MANDATORY SEQUENCE

### 1. Determine Sources (adaptive — from step-01 detection)

Use the flags persisted by step-01-preflight:
- `PRD_PRESENT`, `ARCHITECTURE_PRESENT`, `BRIEF_PRESENT`, `ADRS_PRESENT` (planning)
- `SPECS_PRESENT` (phase 4)
- `CODE_PRESENT` (codebase, with `detected_stack` from step-02 if applicable)
- `PLANNING_DATA`, `SPECS_DATA`, `CODE_DATA` (gathered by step-03 research-scan)
- `OLD_LAYOUT_DETECTED` (legacy 10-file layout to merge)

Build `SOURCES_USED` list: only the source types actually present.

### 2. For Each Target File

For each of the 3 TARGET_FILES, load the corresponding template, populate sections by merging sources per pyramid order, compute hashes, and store the draft.

| TARGET_FILE | Template | Sections to populate | Source priority |
|---|---|---|---|
| `project.md` | `templates/project-template.md` | Project Nature, Architecture, Tech Stack, Source File Patterns, Architecture Patterns, Conventions, Test Rules, Infrastructure, Environments, Validation Tooling, Review Perspectives, Investigation Checklist, Tracker Patterns, Communication Platform | specs > ADRs > architecture > PRD > code |
| `domain.md` | `templates/domain-template.md` | Ubiquitous Language, Bounded Contexts, Entity Relationships, Domain Rules, External Systems | PRD > product-brief > specs > entity files |
| `api.md` | `templates/api-template.md` | API Style, Endpoints, Request/Response Schemas, Authentication, Error Handling, Rate Limiting, Versioning, Integration Points | specs > architecture > route files |

#### a. Load Template

Read `../templates/{name}-template.md`.

#### b. Migration Read (if OLD_LAYOUT_DETECTED)

If old 10-file layout exists, read each legacy file and accumulate its content into the corresponding new section:

| Legacy file | Target file | Target section |
|---|---|---|
| `stack.md` | `project.md` | "Tech Stack", "Source File Patterns", "Architecture Patterns", "Test Rules" |
| `conventions.md` | `project.md` | "Conventions" |
| `infrastructure.md` | `project.md` | "Infrastructure" |
| `environment-config.md` | `project.md` | "Environments" |
| `validation.md` | `project.md` | "Validation Tooling" |
| `review-perspectives.md` | `project.md` | "Review Perspectives" |
| `investigation-checklist.md` | `project.md` | "Investigation Checklist" |
| `tracker.md` | `project.md` | "Tracker Patterns" |
| `comm-platform.md` | `project.md` | "Communication Platform" |
| `domain-glossary.md` | `domain.md` | (entire body) |
| `api-surface.md` | `api.md` | (entire body) |

Legacy content is treated as the **highest-priority source** for migration runs (preserves user customizations). Subsequent priority pyramid still applies — newer sources can overlay legacy where they have content.

#### c. Apply SDD Priority Pyramid

For each section in the target template, build content by merging in this order (later sources overlay earlier):

1. **PRD** content (if PRD_PRESENT) — base context, especially for domain.md
2. **Architecture** content (if ARCHITECTURE_PRESENT) — overlay tech/infra
3. **ADRs** content (if ADRS_PRESENT, chronological) — overlay specific decisions, most recent wins
4. **Specs** content (if SPECS_PRESENT) — overlay feature-level decisions, can override architecture for their scope
5. **Code** facts (if CODE_PRESENT) — verification + brownfield fallback (versions, glob patterns, route lists)
6. **Legacy 10-file** content (if OLD_LAYOUT_DETECTED) — preserved as last overlay (user-edited content takes precedence)

**Conflict resolution within a section**:
- If two sources cover the same topic, the higher-priority one wins for **intent** (e.g., spec says "use Drizzle" wins over architecture says "use Prisma" in Tech Stack).
- Code facts win for **observable values** (e.g., actual version numbers from package.json overlay any "version" mentioned in architecture).
- ADRs are append-only — never overwrite older ADRs, only supersede via newer ADRs in chronological order.

**Empty sections**: if no source has content for a section, leave the template comment in place (HTML comment with "No data" hint). Do NOT fabricate.

#### d. Compute Source Hash (multi-source)

```bash
# Hash each source independently for granular drift detection in refresh
hash_source() {
  cat $1 2>/dev/null | md5 | cut -c1-8
}

source_hash:
  prd: hash_source({planning_artifacts}/prd.md)         # if present
  architecture: hash_source({planning_artifacts}/architecture.md)  # if present
  adrs: hash_source({adr_location}/*.md)                # if present
  specs: hash_source(_bmad-output/implementation-artifacts/spec-*.md)  # if present
  code: hash_source(package.json + Cargo.toml + ...)    # if present
```

Only include hashes for sources actually used.

#### e. Compute Content Hash

After populating all sections, compute the hash of the body content (excluding frontmatter):

```bash
content_hash = hash of body content (markdown after YAML frontmatter)
```

This is used by `bmad-knowledge-refresh` to detect manual edits between refreshes.

#### f. Build Frontmatter

```yaml
---
generated: {YYYY-MM-DD}
generator: bmad-knowledge-bootstrap
sources_used: [planning, specs, code]   # only sources actually present
source_hash:
  prd: {8-char hash, if present}
  architecture: {8-char hash, if present}
  adrs: {8-char hash, if present}
  specs: {8-char hash, if present}
  code: {8-char hash, if present}
content_hash: {8-char hash of body — for manual-edit detection}
schema_version: "1.0"   # Matches ~/.claude/skills/bmad-shared/knowledge-schema.md
manual_override: false
---
```

**Schema version contract:** `schema_version` MUST match the `schema_version` field in `~/.claude/skills/bmad-shared/knowledge-schema.md`. Workflows compare these on load and HALT on mismatch (the user is then instructed to run `/bmad-knowledge-refresh` to migrate).

**Required sections:** the body must contain ALL sections marked `required: true` in the schema. Missing required sections fail validation in step-06.

#### g. Adaptive Header Comment

After frontmatter, before `# {Project Name}` heading, emit a header reflecting actual sources:

- If `sources_used = [code]` only (brownfield import) :
  `<!-- Generated from code only — no planning artifacts found. Run phase 1-3 workflows to enrich knowledge with intent. Manual edits supported but flagged on next refresh. -->`
- If `sources_used = [planning]` only (greenfield post-planning) :
  `<!-- Generated from planning intent only — code not yet implemented. Will be enriched after first implementation via /bmad-knowledge-refresh. Manual edits supported but flagged on next refresh. -->`
- If `sources_used = [specs]` only (specs-only project, common case) :
  `<!-- Generated from phase 4 specs. To change tech stack: edit specs OR formalize via ADR. Manual edits supported but flagged on next refresh. -->`
- If `sources_used` includes `[planning, code]` or `[planning, specs, code]` (full SDD) :
  `<!-- Generated from {sources_used}. Source of truth = planning artifacts (PRD, architecture, ADRs) + specs (phase 4). Code is reflected for facts. Manual edits supported but flagged on next refresh. -->`
- Mixed cases: enumerate sources in the comment.

#### h. Store Draft

Store the complete draft (frontmatter + header comment + populated content) keyed by filename.

### 3. Log Generation Summary

```
Generated 3 knowledge file drafts:
  project.md  ({N} lines, sources_used={list})
  domain.md   ({N} lines, sources_used={list})
  api.md      ({N} lines, sources_used={list})

Migration:
  Old 10-file layout detected: {YES/NO}
  Legacy content merged: {YES/NO}
```

### 4. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- 3 drafts produced (project.md, domain.md, api.md)
- Each draft has multi-source frontmatter with `sources_used`, `source_hash`, `content_hash`
- Sections populated per SDD pyramid; empty sections have placeholder comments
- Migration content (if old layout) preserved
- No HTML comment placeholders left in populated sections

### FAILURE:

- Producing fewer than 3 files (must always emit all 3, even if some sections are placeholder)
- Missing `content_hash` (refresh cannot detect manual edits)
- Missing `sources_used` (refresh cannot adapt)
- Fabricating content not in any source
- Losing migration content silently
- Hardcoding sources_used (must reflect actual source presence)
