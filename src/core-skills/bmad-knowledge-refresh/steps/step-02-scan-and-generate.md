# Step 2: Scan and Generate Updates (3-file layout, multi-source)

## STEP GOAL

For each file in TARGET_FILES, read the existing knowledge file, re-run the relevant source scans (planning artifacts + specs + code, adaptive to what's available), and generate an updated draft that preserves the file's structure while refreshing its content with current data per the SDD priority pyramid.

If `DRIFT_AXIS1` or `DRIFT_AXIS2` was detected in step-01: skip generation for the affected files (step-03 handles those interactively). Generate only for the non-drift files in TARGET_FILES.

This step is fully automated — no user interaction.

---

## SEQUENCE

### 1. Load References

Read `../data/source-hash-mapping.md` for:
- Source file mapping per knowledge file × source type
- Dependency graph (processing order)

### 2. Skip Drift Files

For each file in TARGET_FILES:
- If file is in `DRIFT_AXIS1_DETECTED` or `DRIFT_AXIS2_DETECTED` (from step-01) → mark as `DEFERRED_TO_STEP_03` and skip generation here
- The drift summary persists for step-03 to present to the user

Build `GENERATION_TARGETS` = TARGET_FILES minus drift-affected files.

### 3. Determine Processing Order

Process `GENERATION_TARGETS` respecting the dependency graph:

**Tier 0 first** (in any order):
- `project.md`
- `domain.md`

**Tier 1 second** (after Tier 0 parents):
- `api.md` (depends on `domain.md`)

This ensures `api.md` regeneration uses the freshly updated `domain.md` if it was refreshed.

### 4. For Each File in GENERATION_TARGETS (in order)

#### a. Read Existing File

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{filename}`.

Store as `CURRENT_CONTENT`. Extract heading structure (`##`, `###`) — this is the structural skeleton to preserve.

Read frontmatter to know previous `sources_used`.

#### b. Run Adaptive Targeted Scans

Use `CURRENT_SOURCES_AVAILABLE` (from step-01) to determine which sources to scan. Use `source_extensions` from the existing `project.md` (or detect afresh) for dynamic grep scoping.

**For project.md** :

If `PRD_PRESENT`: read `{planning_artifacts}/prd.md` § Project Type, § Non-functional Requirements
If `ARCHITECTURE_PRESENT`: read `{planning_artifacts}/architecture.md` § Tech Stack, § Patterns, § Project Structure, § Infrastructure, § Environments, § Test Strategy, § Conventions, § Observability
If `ADRS_PRESENT`: read `{adr_location}/*.md` (Accepted/Approved, chronological — most recent supersedes)
If `SPECS_PRESENT`: read `_bmad-output/implementation-artifacts/spec-*.md` § Technical Decisions, § Forbidden Patterns
If `CODE_PRESENT`: scan package manifests, lint configs, formatter configs, test configs, CI files, Dockerfile, deploy configs, .env.example, .editorconfig, src/ directory structure, workflow-context.md (tracker + comm sections)

**For domain.md** :

If `PRD_PRESENT`: read `{planning_artifacts}/prd.md` § Domain, § Functional Requirements, § Vision
If `BRIEF_PRESENT`: read `{planning_artifacts}/product-brief.md` § Vision, § Domain
If `ARCHITECTURE_PRESENT`: read `{planning_artifacts}/architecture.md` § Domain Model, § Bounded Contexts (if present)
If `ADRS_PRESENT`: filter ADRs for domain-related decisions
If `SPECS_PRESENT`: read specs § Domain Entities (if present), § Glossary additions
If `CODE_PRESENT`: scan entity/model files, schema files, domain exceptions, bounded-context directories

**For api.md** :

If `ARCHITECTURE_PRESENT`: read `{planning_artifacts}/architecture.md` § API Design, § Endpoints, § Auth
If `ADRS_PRESENT`: filter ADRs for API-related decisions
If `SPECS_PRESENT`: read specs § API Contract, § Endpoint additions
If `CODE_PRESENT`: scan route/controller files, OpenAPI specs, GraphQL schemas

#### c. Apply SDD Priority Pyramid (merge order)

For each section in the existing file's structure, build refreshed content by merging:

1. **PRD** content (lowest priority — base context)
2. **Architecture** content (overlay tech/infra)
3. **ADRs** content chronologically (overlay specific decisions, most recent wins)
4. **Specs** content (overlay feature-level, can override architecture for their scope)
5. **Code** facts (verification + brownfield fallback for observable values)

Skip any source that is absent (`CURRENT_SOURCES_AVAILABLE` reflects current presence).

#### d. Generate Updated Draft

Build the updated file:

1. **Start with the existing heading structure** — preserve all `##` and `###` headings in their current order
2. **For each section** :
   - If new merged data differs from current → **UPDATE** with new data
   - If new merged data matches current → **PRESERVE** existing text verbatim
   - If a section contains content NOT derivable from any current source (manual additions) → **PRESERVE** unchanged (will be flagged by content_hash if it changes)
3. **New content** : add under most appropriate existing heading
4. **Removed content** : if scans confirm something is gone, remove stale entries (do NOT remove entire sections — may contain user-added context)

#### e. Compute New Hashes

Multi-source `source_hash` (one per source actually used):

```bash
new_source_hash:
  prd: $([ "$PRD_PRESENT" = true ] && hash_planning_prd)
  architecture: $([ "$ARCHITECTURE_PRESENT" = true ] && hash_planning_arch)
  adrs: $([ "$ADRS_PRESENT" = true ] && hash_adrs)
  specs: $([ "$SPECS_PRESENT" = true ] && hash_specs)
  code: $([ "$CODE_PRESENT" = true ] && hash_code_for "$file")
```

`content_hash` of the new body content (excluding frontmatter):

```bash
new_content_hash=$(echo "$NEW_BODY" | md5 | cut -c1-8)
```

#### f. Build New Frontmatter

```yaml
---
generated: {YYYY-MM-DD}
generator: bmad-knowledge-refresh
sources_used: [list of present sources]
source_hash:
  {only entries for sources actually used}
content_hash: {new content_hash}
schema_version: 2
manual_override: false
---
```

#### g. Store Draft

Store the complete draft (frontmatter + updated content) keyed by filename. Also store change summary:
- Sources used (this run)
- Sections updated: count and names
- Sections preserved: count
- New content added: yes/no
- Stale content removed: yes/no

### 5. Handle workflow-context.md (if in TARGET_FILES)

workflow-context.md is different — it has YAML frontmatter as its primary content, not markdown sections.

1. Read the current file
2. Based on conversation context signals from step 01, identify specific YAML fields that need updating
3. Generate a field-level diff: `{ field: { current: value, proposed: value, reason: string } }`
4. Store as a special draft type — field-level changes, not a full file replacement

### 6. Log Generation Summary

```
Generated {N} updated drafts:
  - {filename}: sources={list}, {N} sections updated, {N} preserved
  - ...

Deferred to step-03 (drift):
  - {filename}: {DRIFT_AXIS1 / DRIFT_AXIS2}
```

If workflow-context.md is included:
```
  - workflow-context.md: {N} fields to update
```

---

**Next:** Read fully and follow `./step-03-review-and-apply.md`
