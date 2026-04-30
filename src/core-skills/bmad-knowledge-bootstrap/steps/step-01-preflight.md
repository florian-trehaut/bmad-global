---
nextStepFile: './step-02-detect-stack.md'
---

# Step 1: Preflight and Source Detection


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Preflight and Source Detection with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Verify `workflow-context.md` exists, detect available knowledge sources (planning artifacts, phase 4 specs, code), inventory existing knowledge files for staleness, and route accordingly.

This skill **does NOT** create `workflow-context.md` — that is the responsibility of `/bmad-project-init`. If `workflow-context.md` is missing, HALT.

## MANDATORY SEQUENCE

### 1. Verify workflow-context.md exists

```bash
test -s "{MAIN_PROJECT_ROOT}/.claude/workflow-context.md" && echo "OK" || echo "MISSING"
```

**HALT if missing or empty:**

```
⚠️  workflow-context.md not found at {MAIN_PROJECT_ROOT}/.claude/workflow-context.md

This skill requires workflow-context.md (project identity, tracker, forge config).

→ Run /bmad-project-init first to create it.
```

### 2. Detect Available Knowledge Sources

Run a comprehensive scan of all 5 source types. Each is OPTIONAL — bootstrap derives knowledge from whatever is present.

**A. Planning artifacts** (`{planning_artifacts}` from workflow-context.md):

```bash
PLANNING_ARTIFACTS="${planning_artifacts:-_bmad-output/planning-artifacts}"
ls "${PLANNING_ARTIFACTS}/prd.md" 2>/dev/null && PRD_PRESENT=true
ls "${PLANNING_ARTIFACTS}/architecture.md" 2>/dev/null && ARCHITECTURE_PRESENT=true
ls "${PLANNING_ARTIFACTS}/product-brief.md" 2>/dev/null && BRIEF_PRESENT=true
```

**B. ADRs** (`{adr_location}` from workflow-context.md):

```bash
ADR_LOCATION="${adr_location:-none}"
if [ "$ADR_LOCATION" != "none" ] && [ -d "$ADR_LOCATION" ]; then
  ADRS_PRESENT=true
  ls "$ADR_LOCATION/"*.md 2>/dev/null | head -1
fi
```

**C. Phase 4 specs** (`_bmad-output/implementation-artifacts/spec-*.md` or tracker-resolved):

```bash
ls _bmad-output/implementation-artifacts/spec-*.md 2>/dev/null | head -1 && SPECS_PRESENT=true
```

**D. Code** (any project manifest):

```bash
ls package.json Cargo.toml pyproject.toml go.mod requirements.txt Gemfile mix.exs 2>/dev/null | head -1 && CODE_PRESENT=true
# Also check for source files if no manifest
find . -maxdepth 3 -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.rs" -o -name "*.go" -o -name "*.java" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -1 && CODE_PRESENT=true
```

**Aggregate**:

- `PLANNING_PRESENT` = PRD_PRESENT OR ARCHITECTURE_PRESENT OR BRIEF_PRESENT OR ADRS_PRESENT
- `SOURCES_AVAILABLE` = PLANNING_PRESENT OR SPECS_PRESENT OR CODE_PRESENT

**HALT if no sources at all:**

```
⚠️  No knowledge sources detected.

This skill derives knowledge from at least one of:
  - Planning artifacts (PRD, architecture, ADRs) — produced by phase 1-3 workflows
  - Phase 4 specs (spec-*.md files) — produced by /bmad-create-story or similar
  - Codebase (package manifests, source files)

→ Run phase 1-3 workflows (/bmad-prfaq, /bmad-create-prd, /bmad-create-architecture)
   OR phase 4 (/bmad-create-story) OR start writing code first.
```

### 3. Inventory Existing Knowledge Files

Detect current layout in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/`:

**Old layout (10 files, pre-consolidation):**
- `stack.md`, `conventions.md`, `infrastructure.md`, `environment-config.md`, `validation.md`, `review-perspectives.md`, `investigation-checklist.md`, `tracker.md`, `comm-platform.md`, `domain-glossary.md`, `api-surface.md`

**New layout (3 files, post-consolidation):**
- `project.md`, `domain.md`, `api.md`

```bash
WK="{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge"
ls "$WK/stack.md" "$WK/conventions.md" 2>/dev/null && OLD_LAYOUT_DETECTED=true
ls "$WK/project.md" "$WK/domain.md" "$WK/api.md" 2>/dev/null && NEW_LAYOUT_DETECTED=true
```

For each file, check staleness via frontmatter:
- `MISSING` — file absent
- `FOUND_STALE` — no `generated` frontmatter OR `generated` date > 7 days ago
- `FOUND_FRESH` — `generated` date ≤ 7 days

### 4. Detect Legacy Workflows (for migration)

```bash
LEGACY_WORKFLOWS="{MAIN_PROJECT_ROOT}/.claude/workflows"
ls "$LEGACY_WORKFLOWS/" 2>/dev/null && LEGACY_WORKFLOWS_PRESENT=true
```

This will be migrated in step-06-verify (if user opts in).

### 4b. Spec Bifurcation Mode Prompt (story-spec v3, additive UPDATE to workflow-context.md)

This is a **NEW contract for bootstrap**: the skill description above states "This skill **does NOT** create `workflow-context.md`". The contract is now refined to:

> Bootstrap **does NOT create** `workflow-context.md` (still true — that's `bmad-project-init`'s job). However, bootstrap **MAY UPDATE** specific known fields additively when those fields are governed by the knowledge schema (currently: `spec_split_enabled`). All UPDATEs are additive (append a new field), never structural rewrites.

This is a **clear new contract** documented here and in `bmad-shared/schema/knowledge-schema.md` v1.2 changelog. It is **never** used to mutate fields outside the knowledge-schema-governed set.

**When to prompt:**

```
prompt_required = (tracker ∈ {linear, github, gitlab, jira})
                  AND (spec_split_enabled field absent in workflow-context.md frontmatter)
```

If `tracker == file` → **skip** (file-tracker has no collaborative tracker; the flag is irrelevant).
If `spec_split_enabled` is already set (true or false) → **skip** (user already chose; don't re-prompt during bootstrap).

**If `prompt_required == true`:** present this prompt in `{communication_language}`:

> Ce projet utilise un tracker collaboratif (`{tracker}`). Story-spec v3 introduit le mode **bifurcation** : sections métier dans le tracker, sections techniques dans un fichier local versionné avec le code, drift detection on-demand.
>
> Voir `~/.claude/skills/bmad-shared/protocols/spec-bifurcation.md` pour le détail.
>
> Activer le mode bifurcation pour ce projet ? **[O]ui** / **[N]on** (default: N — comportement v2 monolithic préservé)

WAIT for explicit user input. No default — silence is not an answer.

**On `[O]ui`:** edit `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` to **append** the field at the end of the YAML frontmatter (before the closing `---`):

```yaml
# --- Story-spec mode (v3, added by bootstrap on YYYY-MM-DD) ---
spec_split_enabled: true
```

**On `[N]on`:** **append** the field as `false`:

```yaml
# --- Story-spec mode (v3, added by bootstrap on YYYY-MM-DD) ---
spec_split_enabled: false
```

In both cases:
- Use **append** semantics — never rewrite or restructure existing fields. Locate the closing `---` of the frontmatter and insert the new lines just before it.
- Log: `Updated workflow-context.md: spec_split_enabled = {true|false} (additive bootstrap UPDATE)`.
- This update is committed alongside the knowledge files generated by step-06-verify.

### 5. Present Assessment

```
============================================================
  Knowledge Bootstrap — Source Inventory
============================================================

workflow-context.md:    OK

Detected sources for knowledge derivation:
  Planning artifacts:
    PRD:                {PRESENT / absent}
    Architecture:       {PRESENT / absent}
    Product brief:      {PRESENT / absent}
    ADRs ({adr_location}):  {N files / absent / "none" configured}
  Phase 4 specs:        {N files / absent}
  Codebase:             {YES ({manifest}) / NO}

Existing knowledge files:
  Layout:               {NEW 3-file / OLD 10-file / MIXED / NONE}
  Status:               {N FRESH / N STALE / N MISSING}

Legacy artifacts:
  .claude/workflows/:   {N files / clean}
============================================================
```

### 6. Determine Mode and TARGET_FILES

Based on inventory:

- **First bootstrap (no knowledge files)** → Mode: FULL_INIT. TARGET_FILES = [project.md, domain.md, api.md]
- **Migration from old layout (10 files detected)** → Mode: MIGRATE. TARGET_FILES = [project.md, domain.md, api.md] + read old files for content merge
- **Update of new layout (3 files exist, some stale)** → Mode: REFRESH_STALE. TARGET_FILES = stale files only (user can override with [F] Force all)
- **Update of new layout (all fresh)** → Mode: VALIDATE. Run step-06 verification only

HALT — present mode and ask for confirmation:

- **FULL_INIT** : "[C] Continue with full bootstrap"
- **MIGRATE** : "[M] Migrate from old layout to new (recommended) / [F] Generate fresh new layout (discard old) / [Q] Quit"
- **REFRESH_STALE** : "[R] Refresh stale files / [F] Force regenerate all / [Q] Quit"
- **VALIDATE** : "[V] Validate current setup / [F] Force regenerate / [Q] Quit"

### 7. Create Target Directories

```bash
mkdir -p {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge
```

### 8. Worktree Detection

If `git rev-parse --git-common-dir` does not return `.git` (i.e., we are in a worktree):
- Inform the user: "Running from a worktree. Knowledge files will be written to the main repository at `{MAIN_PROJECT_ROOT}`."
- This is informational only — proceed normally.

### 9. Persist Detection Results

Store these flags for downstream steps:
- `PLANNING_PRESENT`, `PRD_PRESENT`, `ARCHITECTURE_PRESENT`, `BRIEF_PRESENT`, `ADRS_PRESENT`
- `SPECS_PRESENT`
- `CODE_PRESENT`
- `OLD_LAYOUT_DETECTED`, `NEW_LAYOUT_DETECTED`
- `LEGACY_WORKFLOWS_PRESENT`
- `MODE` (FULL_INIT / MIGRATE / REFRESH_STALE / VALIDATE)
- `TARGET_FILES` (list)

### 10. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- workflow-context.md verified present
- All 5 source types scanned
- HALT triggered if no sources at all (no false positives)
- Mode classified correctly
- TARGET_FILES list built
- Detection flags persisted for downstream steps

### FAILURE:

- Proceeding when workflow-context.md is missing
- Proceeding when no sources detected
- Skipping legacy workflow detection when applicable

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Preflight and Source Detection
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
