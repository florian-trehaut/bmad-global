# Step 1: Detect Changes (3-file layout, multi-source, drift-aware)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Detect Changes (3-file layout, multi-source, drift-aware) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Identify which of the 3 knowledge files (`project.md`, `domain.md`, `api.md`) need refreshing by combining four signals: (1) conversation context, (2) per-source-type hash comparison, (3) date-based staleness, and (4) drift detection on two axes (code vs spec, manual edit vs source).

Build a prioritized TARGET_FILES list. If drift detected on either axis, mark the affected files for BLOCK in step-03.

---

## SEQUENCE

### 1. Inventory Existing Knowledge Files

List the 3 knowledge files in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`:

```bash
ls -la {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/{project,domain,api}.md 2>/dev/null
```

For each file, read the YAML frontmatter and extract:
- `generated` — date of last generation (YYYY-MM-DD)
- `generator` — which skill generated it (bmad-knowledge-bootstrap or bmad-knowledge-refresh)
- `sources_used` — list of source types present at generation (subset of [planning, specs, code])
- `source_hash` — map: { prd, architecture, adrs, specs, code } with 8-char MD5 hashes for sources actually used
- `content_hash` — 8-char MD5 of body content (used for manual-edit detection)
- `manual_override` — true if user previously chose [K] Keep manual; if true, **skip this file entirely** in this refresh

Store as `KNOWLEDGE_INVENTORY`:
```
{filename}: {
  generated: date,
  generator: string,
  sources_used: [...],
  source_hash: { ... },
  content_hash: string,
  manual_override: bool
}
```

If a file has no frontmatter or no `generated` date, mark its status as `STALE_NO_META`.

If `manual_override: true`, skip the file silently (`SKIPPED_MANUAL_OVERRIDE` status). Do not include in any further detection — the user opted out.

### 2. Detect Sources Currently Available

Probe each source type (independent of what was used at generation time):

```bash
ls "{planning_artifacts}/prd.md" 2>/dev/null && PRD_PRESENT=true
ls "{planning_artifacts}/architecture.md" 2>/dev/null && ARCHITECTURE_PRESENT=true
ls "{planning_artifacts}/product-brief.md" 2>/dev/null && BRIEF_PRESENT=true
[ -d "{adr_location}" ] && ls "{adr_location}/"*.md 2>/dev/null | head -1 && ADRS_PRESENT=true
ls _bmad-output/implementation-artifacts/spec-*.md 2>/dev/null | head -1 && SPECS_PRESENT=true
ls package.json Cargo.toml pyproject.toml go.mod 2>/dev/null | head -1 && CODE_PRESENT=true
```

Persist `CURRENT_SOURCES_AVAILABLE` for downstream use.

### 3. Analyze Conversation Context

Review conversation history. Identify changes made during this session:

**A. Files created or modified** — from tool use history (Write, Edit calls), git diff output, or explicit user statements about what changed.

**B. Source artifact changes** — was `prd.md` updated? `architecture.md`? new ADR created? new spec written?

**C. Code changes** — npm install / cargo add / new dependencies, new endpoints, new entities, config changes.

**D. Structural changes** — new directories, files moved, modules reorganized.

Load `../data/source-hash-mapping.md` and use the **Context-to-File Mapping** table to map each detected change to the knowledge files it likely affects.

Store results as `CONTEXT_CANDIDATES` — a list of `{ filename, reason }` pairs.

### 4. Compute Current Per-Source Hashes

For each file in KNOWLEDGE_INVENTORY (excluding `manual_override`), compute hashes for each source listed in `sources_used`:

```bash
for source in $(yaml_list sources_used); do
  case "$source" in
    planning)
      [ "$PRD_PRESENT" = true ] && current_prd=$(hash_planning_prd) || current_prd="absent"
      [ "$ARCHITECTURE_PRESENT" = true ] && current_arch=$(hash_planning_arch) || current_arch="absent"
      [ "$BRIEF_PRESENT" = true ] && current_brief=$(hash_planning_brief) || current_brief="absent"
      [ "$ADRS_PRESENT" = true ] && current_adrs=$(hash_adrs) || current_adrs="absent"
      ;;
    specs)
      [ "$SPECS_PRESENT" = true ] && current_specs=$(hash_specs) || current_specs="absent"
      ;;
    code)
      [ "$CODE_PRESENT" = true ] && current_code=$(hash_code_for "$file") || current_code="absent"
      ;;
  esac
done

# Compare each per-source hash with stored equivalent
```

Build `HASH_STATUS` per file:
- **MATCH** — all stored source hashes equal current hashes
- **MISMATCH** — at least one source hash differs (record which source(s))
- **NEW_SOURCE_AVAILABLE** — a source absent at generation is now present (e.g., greenfield project that previously had `sources_used=[planning]` and now has `code`)
- **SOURCE_DISAPPEARED** — a source present at generation is now absent (e.g., specs were deleted; rare)

**Note:** Absence of a source for a file that didn't use it is not a change.

### 5. Detect Drift Axe 1 (code vs specs)

Independent of source_hash. If `SPECS_PRESENT=true` AND `CODE_PRESENT=true`:

For each spec, parse declared facts (e.g., "ORM: Prisma" in spec body) and compare with code observable values (e.g., `grep "drizzle-orm" package.json`).

Build `DRIFT_AXIS1` list of mismatches:
```
[
  {
    spec: "_bmad-output/implementation-artifacts/spec-feat-orm-migration.md",
    declared: "ORM = Prisma",
    declared_location: "line 42",
    observed: "drizzle-orm@0.x in package.json (no Prisma)",
    affected_target: "project.md§Tech Stack"
  },
  ...
]
```

**Drift detection rules** (conservative — avoid false positives):
- Spec must declare the value EXPLICITLY (in a "Technical Decisions" section or labeled fact). Do not infer from prose.
- Code observation must be UNAMBIGUOUS (e.g., direct dependency, explicit config). Do not interpret implicit signals.
- If either is ambiguous → no drift detected, no false positive.

If `DRIFT_AXIS1` is non-empty: mark affected files (`project.md`, `domain.md`, or `api.md`) with `DRIFT_AXIS1_DETECTED`. The list is passed to step-03 for user resolution.

### 6. Detect Drift Axe 2 (manual edit vs source)

For each file in KNOWLEDGE_INVENTORY (excluding `manual_override`):

```bash
stored_content_hash=$(yaml_extract content_hash "$file")
current_content_hash=$(hash_content "$file")

if [ "$stored_content_hash" != "$current_content_hash" ]; then
  MANUAL_EDIT_DETECTED[$file]=true
fi
```

Cross-reference with HASH_STATUS:

| MANUAL_EDIT | HASH_STATUS | Result |
|---|---|---|
| true | MATCH | **silent skip** — user edited the knowledge file, no source changed; refresh leaves it alone (no overwrite) |
| true | MISMATCH or NEW_SOURCE | **DRIFT_AXIS2** — manual edit AND source change → BLOCK in step-03 |
| false | MATCH | nothing to do |
| false | MISMATCH or NEW_SOURCE | normal refresh path |

Build `DRIFT_AXIS2` list of `{ filename, manual_change_summary, source_changes }` for affected files.

### 7. Date-Based Staleness Check

For each file in KNOWLEDGE_INVENTORY (excluding manual_override):
- No `generated` date → `DATE_STALE`
- `generated` date > 30 days ago → `DATE_STALE` (more lenient than the previous 7-day window: planning artifacts evolve slowly)
- `generated` date ≤ 30 days → `DATE_FRESH`

### 8. Cascade Analysis

Load the **Dependency Graph** from `../data/source-hash-mapping.md`.

For 3-file layout:
- If `domain.md` is REFRESH_NEEDED → mark `api.md` as REFRESH_CASCADE
- `project.md` has no dependents (leaf in graph)

### 9. Classify Each File

Final status priority order:

| Status | Condition | Priority |
|---|---|---|
| `SKIPPED_MANUAL_OVERRIDE` | `manual_override: true` | SKIP (silent) |
| `DRIFT_AXIS1_DETECTED` | code/spec divergence found in section 5 | BLOCK |
| `DRIFT_AXIS2_DETECTED` | manual edit + source change | BLOCK |
| `STALE_NO_META` | No frontmatter or no generated date | HIGH |
| `REFRESH_NEEDED` | HASH_STATUS = MISMATCH OR NEW_SOURCE_AVAILABLE OR file is in CONTEXT_CANDIDATES | HIGH |
| `REFRESH_CASCADE` | Tier 1 dependent of a REFRESH_NEEDED file | MEDIUM |
| `STALE_DATE_ONLY` | DATE_STALE but HASH_STATUS = MATCH | LOW |
| `FRESH` | DATE_FRESH and HASH_STATUS = MATCH | SKIP |
| `MANUAL_EDIT_NO_SOURCE_CHANGE` | manual edit detected but no source changed | SKIP (silent) |

### 10. Present Assessment

```
Knowledge Refresh — Change Detection
=====================================

Conversation context signals:
  - {change description} → {affected file(s)}
  - ...

Sources currently available:
  Planning artifacts: {PRD/Arch/Brief/ADRs} — present/absent
  Phase 4 specs:      {N files / absent}
  Codebase:           {present / absent}

Knowledge file status:

| File | sources_used | hash | content | drift | status |
|------|--------------|------|---------|-------|--------|
| project.md | {list} | MATCH/MISMATCH | unchanged/edited | — / Axe1 / Axe2 | {status} |
| domain.md  | {list} | ... | ... | ... | ... |
| api.md     | {list} | ... | ... | ... | ... |

Drift detected:
  Axe 1 (code vs spec): {N items / none}
  Axe 2 (manual edit + source change): {N files / none}
  → step-03 will BLOCK on these files for resolution.

Recommended refresh:
  HIGH:   {list or "none"}
  MEDIUM: {list or "none"}
  LOW:    {list or "none"}
  BLOCK:  {list or "none"}
```

If ALL files are FRESH or SKIPPED and no drift detected:
- Display: "All knowledge files are up to date. Nothing to refresh."
- **END OF WORKFLOW.**

If only `BLOCK` items exist and no refresh-needed files:
- Display: "Drift detected. Step-03 will prompt for resolution."
- Skip user choice menu, proceed directly to step-02 with BLOCK markers.

Otherwise, HALT and present the menu.

### 11. User Choice

> **[A]** Accept recommendation — refresh HIGH + MEDIUM priority files (drift handled in step-03)
> **[H]** HIGH only — refresh only HIGH priority files
> **[C]** Custom — select specific files to refresh
> **[F]** Force all — refresh every file regardless of status (ignores manual_override warning)
> **[Q]** Quit — nothing to refresh

HALT — wait for user selection.

**Menu handling:**
- **A**: TARGET_FILES = HIGH + MEDIUM + BLOCK
- **H**: TARGET_FILES = HIGH + BLOCK
- **C**: Present numbered list, ask user to select. Skip manual_override files unless user explicitly types their number.
- **F**: TARGET_FILES = all files in KNOWLEDGE_INVENTORY (including manual_override, with confirmation prompt)
- **Q**: END OF WORKFLOW

### 12. Check workflow-context.md (OPTIONAL)

If CONTEXT_CANDIDATES suggests `workflow-context.md` itself may need updates (new tracker, forge changes, command changes):

```
workflow-context.md may also need updates:
  - {field}: {reason}

Include workflow-context.md in refresh? [Y/N]
```

If Y: add `workflow-context.md` to TARGET_FILES with a `context_update` flag.

### 13. Build TARGET_FILES and Proceed

Persist:
- `TARGET_FILES` (list)
- `DRIFT_AXIS1` (list, may be empty)
- `DRIFT_AXIS2` (list, may be empty)
- `CURRENT_SOURCES_AVAILABLE` (for step-02)

Log:
```
Refreshing {N} files: {comma-separated list}
Drift Axe 1: {N items}
Drift Axe 2: {N files}
```

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Detect Changes (3-file layout, multi-source, drift-aware)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-scan-and-generate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
