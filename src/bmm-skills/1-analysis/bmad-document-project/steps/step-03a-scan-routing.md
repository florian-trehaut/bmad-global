---
nextStepFile: './step-03b-scan-execution.md'
---

# Step 3a: Scan Routing


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03a-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03a-ENTRY PASSED — entering Step 3a: Scan Routing with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Configure the scan perimeter based on the selected mode, project type, and scan level. Determine which directories to scan, which patterns to apply, set up output paths for each document type, and initialize the state file.

## RULES

- Quick scan: NEVER read source files -- only config files, manifests, and directory structure
- Deep scan: read files in critical directories per project type (from documentation-requirements.csv)
- Exhaustive scan: read ALL source files (excluding node_modules, .git, dist, build, coverage)
- State file must be initialized before any scanning begins
- Every state file update must include: step id, human-readable summary, precise timestamp, and any outputs written

## SEQUENCE

### 1. Determine scan perimeter

Based on `scan_level` and `project_type_id` for each part:

**Quick scan perimeter:**
- Config files matching `config_patterns` from documentation-requirements.csv
- Package manifests matching `key_file_patterns`
- Entry points matching `entry_point_patterns`
- Directory structure via tree/ls (no file reads)
- README and existing documentation files

**Deep scan perimeter:**
- Everything in quick scan, PLUS:
- All files in directories listed in `critical_directories` for each part's project type
- Files matching `auth_security_patterns`
- Files matching `schema_migration_patterns`
- Files matching `test_file_patterns` (sample only, for pattern detection)

**Exhaustive scan perimeter:**
- ALL source files recursively
- Excluding: `node_modules/`, `.git/`, `dist/`, `build/`, `coverage/`, `*.min.js`, `*.map`

### 2. Configure output paths

For each document to be generated, set the output path:

| Document | Single-part path | Multi-part path |
|----------|-----------------|-----------------|
| Project Overview | `{project_knowledge}/project-overview.md` | Same |
| Source Tree | `{project_knowledge}/source-tree-analysis.md` | Same |
| Architecture | `{project_knowledge}/architecture.md` | `architecture-{part_id}.md` |
| Component Inventory | `{project_knowledge}/component-inventory.md` | `component-inventory-{part_id}.md` |
| Development Guide | `{project_knowledge}/development-guide.md` | `development-guide-{part_id}.md` |
| API Contracts | `{project_knowledge}/api-contracts.md` | `api-contracts-{part_id}.md` |
| Data Models | `{project_knowledge}/data-models.md` | `data-models-{part_id}.md` |
| Deployment Guide | `{project_knowledge}/deployment-guide.md` | Same |
| Contribution Guide | `{project_knowledge}/contribution-guide.md` | Same |
| Integration Architecture | N/A | `{project_knowledge}/integration-architecture.md` |
| Index | `{project_knowledge}/index.md` | Same |

Conditional documents are only generated when the corresponding `requires_*` flag is true in the documentation-requirements row for that part.

### 3. Identify batch plan (deep/exhaustive only)

**For deep scan:**
- List all subdirectories matching `critical_directories` for each part
- Each subdirectory becomes one batch
- Estimate file count per batch

**For exhaustive scan:**
- List ALL subdirectories recursively (excluding node_modules, .git, dist, build, coverage)
- Group into batches by top-level subfolder
- Estimate file count per batch

**For quick scan:**
- No batching needed -- single-pass pattern analysis

Store the batch plan as `{scan_batches}` with: path, estimated file count, part association.

### 4. Initialize state file

Write initial state to `{project_knowledge}/project-scan-report.json`:

```json
{
  "workflow_version": "2.0.0",
  "timestamps": {
    "started": "{current_timestamp}",
    "last_updated": "{current_timestamp}"
  },
  "mode": "{workflow_mode}",
  "scan_level": "{scan_level}",
  "project_root": "{project_root_path}",
  "project_knowledge": "{project_knowledge}",
  "project_types": [
    {"part_id": "{part_id}", "project_type_id": "{project_type_id}", "display_name": "{display_name}"}
  ],
  "completed_steps": [
    {"step": "step_01", "status": "completed", "timestamp": "{now}", "summary": "Mode: {workflow_mode}, scan level: {scan_level}"},
    {"step": "step_02", "status": "completed", "timestamp": "{now}", "summary": "Classified as {repository_type} with {parts_count} parts"},
    {"step": "step_03a", "status": "completed", "timestamp": "{now}", "summary": "Scan routing configured, {batch_count} batches planned"}
  ],
  "current_step": "step_03b",
  "findings": {
    "project_classification": {
      "repository_type": "{repository_type}",
      "parts_count": {parts_count},
      "primary_language": "{primary_language}",
      "architecture_type": "{architecture_type}"
    }
  },
  "scan_batches": [],
  "outputs_generated": ["project-scan-report.json"],
  "resume_instructions": "Continue from step_03b scan execution"
}
```

Validate the JSON is well-formed. HALT if state file write fails.

### 5. Proceed

Display: "Scan routing complete. {batch_count} batches planned for {scan_level} scan."

Load, read entire file, then execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-03a-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03a-EXIT PASSED — completed Step 3a: Scan Routing
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
