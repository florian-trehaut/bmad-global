---
nextStepFile: './step-03a-scan-routing.md'
---

# Step 2: Project Classification


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Project Classification with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Detect the project structure (monolith, monorepo, or multi-part), classify each part using the documentation-requirements matrix, load the corresponding scan requirements, and confirm the classification with the user.

## RULES

- All classification must come from actual file inspection -- never guess from project name
- Multi-part detection requires explicit user confirmation
- Each part gets its own `project_type_id` from the documentation-requirements matrix
- HALT and wait for user confirmation of classification before proceeding
- This step is skipped entirely in `deep_dive` mode (classification was done in initial scan)

## SEQUENCE

### 1. Load documentation requirements data

Read `./data/documentation-requirements.csv`.

This CSV contains 12 project types with 24 columns each:
- **Detection columns**: `project_type_id`, `key_file_patterns` (used to identify project type from codebase)
- **Requirement columns**: `requires_api_scan`, `requires_data_models`, `requires_ui_components`, etc.
- **Pattern columns**: `critical_directories`, `test_file_patterns`, `config_patterns`, etc.

Store all 12 rows indexed by `project_type_id` for project detection and requirements lookup.

Display: "Loaded documentation requirements for 12 project types (web, mobile, backend, cli, library, desktop, game, data, extension, infra, embedded)."

### 2. Determine project root

Ask user: "What is the root directory of the project to document?" (default: current working directory)

Store as `{project_root_path}`.

### 3. Detect project structure

Scan `{project_root_path}` for key indicators:
- Directory structure (presence of client/, server/, api/, src/, app/, etc.)
- Key files (package.json, go.mod, requirements.txt, Cargo.toml, etc.)
- Technology markers matching `key_file_patterns` from each row in documentation-requirements.csv

Detect if project is:
- **Monolith**: Single cohesive codebase
- **Monorepo**: Multiple parts in one repository (pnpm-workspace.yaml, lerna.json, nx.json, turbo.json, etc.)
- **Multi-part**: Separate client/server or similar architecture

**If multiple distinct parts detected (e.g., client/ and server/ folders):**

List detected parts with their paths.

Present confirmation:

```
I detected multiple parts in this project:
{detected_parts_list}

Is this correct? Should I document each part separately? [y/n]
```

WAIT for user response.

- If confirmed: Set `repository_type` = "monorepo" or "multi-part". Create `project_parts` array with each detected part.
- If denied or corrected: Ask user to specify correct parts and their paths.

**If single cohesive project detected:**

Set `repository_type = "monolith"`. Create single part in `project_parts` array with `root_path = {project_root_path}`.

### 4. Classify each part

For each part in `project_parts`:
- Scan the part root for files matching `key_file_patterns` from each row in documentation-requirements.csv
- Score matches against all 12 project types
- Assign the best-matching `project_type_id` to the part
- Load the corresponding documentation requirements row for that part

Available project types (from CSV):
1. `web` -- Web applications (React, Vue, Next.js, etc.)
2. `mobile` -- Mobile apps (React Native, Flutter, etc.)
3. `backend` -- Backend/API services (Express, Django, Go, etc.)
4. `cli` -- Command-line tools
5. `library` -- Reusable libraries/packages
6. `desktop` -- Desktop applications (Electron, Tauri, etc.)
7. `game` -- Game projects (Unity, Godot, etc.)
8. `data` -- Data pipelines and ETL (Airflow, dbt, etc.)
9. `extension` -- Browser/IDE extensions
10. `infra` -- Infrastructure as Code (Terraform, Pulumi, etc.)
11. `embedded` -- Embedded/firmware projects
12. (Additional types may match via pattern scoring)

### 5. Present classification for confirmation

```
Project Classification:

Repository Type: {repository_type}
Parts: {parts_count}

{For each part:}
  Part: {part_name}
  Type: {project_type_id}
  Location: {root_path}
  Key indicators: {matched_patterns}
  Documentation requirements: API scan={requires_api_scan}, Data models={requires_data_models}, ...

Does this look correct? [y/n/edit]
```

WAIT for user confirmation.

- **If y:** Proceed.
- **If n or edit:** Allow user to correct classification, then re-load requirements.

### 6. Discover existing documentation

For each part, scan for existing documentation:
- README.md, README.rst, README.txt
- CONTRIBUTING.md, CONTRIBUTING.rst
- ARCHITECTURE.md, ARCHITECTURE.txt, docs/architecture/
- DEPLOYMENT.md, DEPLOY.md, docs/deployment/
- API.md, docs/api/
- Any files in docs/, documentation/, .github/ folders

Create inventory of `existing_docs` with file path, file type, and which part it belongs to.

Present findings:

```
I found these existing documentation files:
{existing_docs_list}

Are there any other important documents or key areas I should focus on? [Provide paths or guidance, or type 'none']
```

WAIT for user response. Store as `{user_context}`.

### 7. Proceed

Load, read entire file, then execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Project Classification
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
