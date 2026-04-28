---
nextStepFile: './step-03c-scan-finalization.md'
---

# Step 3b: Scan Execution


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03b-ENTRY PASSED — entering Step 3b: Scan Execution with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Execute the core codebase scanning using the batch-by-subfolder strategy configured in step 3a. Analyze technology stack, scan for conditional requirements (APIs, data models, UI components, etc.), generate source tree, and write each document to disk immediately after generation.

## RULES

- NEVER accumulate full project analysis in memory -- write-as-you-go, then purge
- Each batch: read files, extract info, write output, validate, purge context
- Keep only 1-2 sentence summaries per section after purging
- Large files (>5000 LOC): handle with appropriate judgment (skim structure, focus on exports/imports)
- Quick scan: pattern matching only -- do NOT read source files
- Deep/Exhaustive scan: read files in batches organized by SUBFOLDER (not arbitrary file count)
- Update state file after each batch completes
- Use templates from `./templates/` for output structure

## SEQUENCE

### 1. Analyze technology stack

For each part in `project_parts`:

- Load `key_file_patterns` from documentation requirements
- Scan part root for these patterns
- Parse technology manifest files (package.json, go.mod, requirements.txt, Cargo.toml, etc.)
- Extract: framework, language, version, database, dependencies
- Build `technology_table` with columns: Category, Technology, Version, Justification

Determine architecture pattern based on detected tech stack:

- Use `project_type_id` as primary indicator (e.g., "web" = layered/component-based, "backend" = service/API-centric)
- Consider framework patterns (e.g., React = component hierarchy, Express = middleware pipeline)
- Store as `{architecture_pattern}` for each part

Update state file: add step summary "Tech stack: {primary_framework}".

PURGE detailed tech analysis. Keep only: "{framework} on {language}".

### 2. Execute conditional scans

For each part, check documentation requirements boolean flags and execute corresponding scans. Apply `scan_level` strategy to each scan (quick=glob only, deep/exhaustive=read files in batches).

**If `requires_api_scan == true`:**

- Scan for API routes and endpoints using `integration_scan_patterns`
- Look for: controllers/, routes/, api/, handlers/, endpoints/
- Quick: use glob to find route files, extract patterns from filenames and folder structure
- Deep/Exhaustive: read files in batches, extract HTTP methods, paths, request/response types
- Build API contracts catalog
- IMMEDIATELY write to: `{project_knowledge}/api-contracts{-part_id}.md`
- Validate document has all required sections
- Update state file with output generated
- PURGE detailed API data. Keep only: "{api_count} endpoints documented"

**If `requires_data_models == true`:**

- Scan for data models using `schema_migration_patterns`
- Look for: models/, schemas/, entities/, migrations/, prisma/, ORM configs
- Quick: identify schema files via glob, parse migration filenames for table discovery
- Deep/Exhaustive: read model files in batches, extract table names, fields, relationships, constraints
- Build database schema documentation
- IMMEDIATELY write to: `{project_knowledge}/data-models{-part_id}.md`
- PURGE. Keep only: "{table_count} tables documented"

**If `requires_state_management == true`:**

- Analyze state management patterns
- Look for: Redux, Context API, MobX, Vuex, Pinia, Provider patterns
- Identify: stores, reducers, actions, state structure
- Store findings for architecture document

**If `requires_ui_components == true`:**

- Inventory UI component library
- Scan: components/, ui/, widgets/, views/ folders
- Categorize: Layout, Form, Display, Navigation, etc.
- Identify: Design system, component patterns, reusable elements
- IMMEDIATELY write to: `{project_knowledge}/component-inventory{-part_id}.md`
- PURGE. Keep only: "{component_count} components documented"

**If `requires_hardware_docs == true`:**

- Look for hardware schematics using `hardware_interface_patterns`
- Ask user for additional hardware documentation paths
- Store hardware docs references

**If `requires_asset_inventory == true`:**

- Scan and catalog assets using `asset_patterns`
- Categorize by: Images, Audio, 3D Models, Sprites, Textures, etc.
- Calculate: Total size, file counts, formats used

**Additional pattern scans (all project types):**

- `config_patterns` -- Configuration management
- `auth_security_patterns` -- Authentication/authorization approach
- `entry_point_patterns` -- Application entry points and bootstrap
- `shared_code_patterns` -- Shared libraries and utilities
- `async_event_patterns` -- Event-driven architecture
- `ci_cd_patterns` -- CI/CD pipeline details
- `localization_patterns` -- i18n/l10n support

### 3. Generate source tree analysis

For each part, generate complete directory tree using `critical_directories` from documentation requirements.

Annotate the tree with:

- Purpose of each critical directory
- Entry points marked
- Key file locations highlighted
- Integration points noted (for multi-part projects)

For multi-part projects: show how parts are organized and where they interface.

Load template from `./templates/source-tree.md` for output structure.

IMMEDIATELY write `source-tree-analysis.md` to disk. Validate document structure.

Update state file. PURGE detailed tree. Keep only: "Source tree with {folder_count} critical folders".

### 4. Extract development and operational information

Scan for development setup using `key_file_patterns` and existing docs:

- Prerequisites (Node version, Python version, etc.)
- Installation steps
- Environment setup (.env files, config)
- Build commands, run commands
- Test commands using `test_file_patterns`

Look for deployment configuration using `ci_cd_patterns`:

- Dockerfile, docker-compose.yml
- Kubernetes configs (k8s/, helm/)
- CI/CD pipelines (.github/workflows/, .gitlab-ci.yml)
- Infrastructure as Code (terraform/, pulumi/)

If CONTRIBUTING.md or similar found: extract contribution guidelines (code style, PR process, commit conventions, testing requirements).

IMMEDIATELY write `development-guide{-part_id}.md` to disk for each part.

If deployment config found: IMMEDIATELY write `deployment-guide.md`.
If contribution guidelines found: IMMEDIATELY write `contribution-guide.md`.

Update state file. PURGE. Keep only: "Dev setup and deployment documented".

### 5. Detect multi-part integration (if applicable)

**Only for multi-part projects:**

Analyze how parts communicate:

- Scan `integration_scan_patterns` across parts
- Identify: REST calls, GraphQL queries, gRPC, message queues, shared databases
- Document: API contracts between parts, data flow, authentication flow

Create `integration_points` array with: from (source part), to (target part), type (REST/GraphQL/gRPC/Event Bus), details.

IMMEDIATELY write `integration-architecture.md` to disk. Validate.

Generate `project-parts.json` metadata file:

```json
{
  "repository_type": "{repository_type}",
  "parts": [...],
  "integration_points": [...]
}
```

Update state file. PURGE. Keep only: "{integration_count} integration points".

### 6. Generate architecture documentation

For each part in `project_parts`:

- Compile all discovered information into architecture document:
  - Executive Summary
  - Technology Stack (from section 1)
  - Architecture Pattern
  - Data Architecture (from conditional scans)
  - API Design (if applicable)
  - Component Overview (if applicable)
  - Source Tree reference
  - Development Workflow
  - Deployment Architecture (if found)
  - Testing Strategy (from test patterns)

For single-part: generate `architecture.md` (no suffix).
For multi-part: generate `architecture-{part_id}.md` for each part.

IMMEDIATELY write each architecture file to disk. Validate.

Update state file. PURGE. Keep only: "Architecture for {part_id} written".

### 7. Generate project overview

Compile high-level project overview using template from `./templates/project-overview.md`:

- Project name and purpose (from README or user input)
- Executive summary
- Tech stack summary table
- Architecture type classification
- Repository structure
- Links to detailed docs

IMMEDIATELY write `project-overview.md` to disk. Validate.

Update state file.

### 8. Update state and proceed

Update state file:

- Add to `completed_steps`: `{"step": "step_03b", "status": "completed", "timestamp": "{now}", "summary": "Scan complete: {files_scanned} files across {batch_count} batches, {docs_generated} documents written"}`
- Update `current_step` to `"step_03c"`
- Update `last_updated` timestamp
- Ensure `outputs_generated` lists all written files

---

## STEP EXIT (CHK-STEP-03b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03b-EXIT PASSED — completed Step 3b: Scan Execution
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `{nextStepFile}` — load the file with the Read tool, do not summarise from memory, do not skip sections.
