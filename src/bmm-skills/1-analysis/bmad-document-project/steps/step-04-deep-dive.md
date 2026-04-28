---
nextStepFile: './step-05-output.md'
---

# Step 4: Deep-Dive Documentation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Deep-Dive Documentation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Perform exhaustive deep-dive documentation of a specific project area selected by the user. Read every file in scope, build a complete file inventory with exports, dependencies, and dependents, analyze relationships and data flow, and generate comprehensive documentation. Supports multiple sequential deep-dives.

## RULES

- Deep-dive mode requires literal full-file review -- sampling, guessing, or relying solely on tooling output is FORBIDDEN
- You must read every line of every file in scope
- Batching applies: process one subfolder at a time, write as you go, purge context
- Filter out: `node_modules/`, `.git/`, `dist/`, `build/`, `coverage/`, `*.min.js`, `*.map`
- HALT and wait for user confirmation before starting the scan
- This step can loop (deep-dive another area) until the user chooses to finish

## SEQUENCE

### 1. Offer deep-dive or skip

**If entering from step-03c (scan workflow):**

Display: "Deep-dive analysis allows exhaustive documentation of a specific area. This is optional."

```
Would you like to deep-dive into a specific area?
1. Yes -- select an area for detailed analysis
2. No -- skip to final output

Your choice [1/2]:
```

WAIT for user selection.

**If 2 (skip):** Jump directly to `./step-05-output.md`.

**If entering from deep_dive mode (step-01):** Continue directly to section 2.

### 2. Load existing context

Load existing project structure from `{project_knowledge}/index.md` and `project-parts.json` (if exists).

Load source tree analysis to understand available areas.

### 3. Identify area for deep-dive

Analyze existing documentation to suggest deep-dive options. Present structured suggestions based on what was found:

- API route groups (if API routes found): group name, endpoint count, path
- Feature modules (if feature directories found): module name, file count, path
- UI component areas (if UI components found): group name, component count, path
- Services/business logic (if service files found): service name, path

Present to user:

```
What area would you like to deep-dive into?

Suggested Areas Based on Project Structure:

{Dynamic suggestions based on what exists}

Or specify custom:
- Folder path (e.g., "client/src/features/dashboard")
- File path (e.g., "server/src/api/users.ts")
- Feature name (e.g., "authentication system")

Enter your choice (number or custom path):
```

WAIT for user selection.

Parse user input to determine:

- `target_type`: "folder" | "file" | "feature" | "api_group" | "component_group"
- `target_path`: Absolute path to scan
- `target_name`: Human-readable name for documentation
- `target_scope`: List of all files to analyze

Display confirmation with target name, type, path, and estimated file count. State: "This will read EVERY file in this area. Proceed? [y/n]"

WAIT for user confirmation. If "n", return to the beginning of section 3.

### 4. Comprehensive exhaustive scan

Set `scan_mode = "exhaustive"`. Initialize `file_inventory = []`.

**For folder targets:**

- Get complete recursive file list from `{target_path}`
- Filter out excluded patterns
- For EVERY remaining file:
  - Read complete file contents (all lines)
  - Extract all exports (functions, classes, types, interfaces, constants)
  - Extract all imports (dependencies)
  - Identify purpose from comments and code structure
  - Write 1-2 sentences describing behaviour, side effects, assumptions
  - Extract function signatures with parameter types and return types
  - Note any TODOs, FIXMEs, or comments
  - Identify patterns (hooks, components, services, controllers, etc.)
  - Capture contributor guidance: risks, verification steps, suggested tests
  - Store in `file_inventory`

**For file targets:**

- Read complete file at `{target_path}`
- Extract all information as above
- Read all files it imports (follow import chain 1 level deep)
- Find all files that import this file (dependents via grep)
- Store all in `file_inventory`

**For API group targets:**

- Identify all route/controller files in API group
- Read all route handlers completely
- Read associated middleware, controllers, services
- Read data models and schemas used
- Extract complete request/response schemas
- Document authentication and authorization requirements

**For feature targets:**

- Search codebase for all files related to feature name
- Include: UI components, API endpoints, models, services, tests
- Read each file completely

**For component group targets:**

- Get all component files in group
- Read each component completely
- Extract: Props interfaces, hooks used, child components, state management

### 5. Analyze relationships and find related code

**Dependency graph:** Build graph with files as nodes, import relationships as edges. Identify circular dependencies, entry points (not imported by others in scope), and leaf nodes (no imports in scope).

**Data flow:** Trace function calls, data transformations, API calls and responses, state updates, database queries and mutations.

**Integration points:** External APIs consumed, internal services called, shared state, events published/subscribed, database tables accessed.

**Related code outside scanned area:** Search for similar naming patterns, function signatures, component structures, reusable utilities, and reference implementations in other parts of the codebase.

### 6. Generate deep-dive documentation

Create documentation filename: `deep-dive-{sanitized_target_name}.md`

Aggregate contributor insights across files:

- Combine unique risk/gotcha notes
- Combine verification steps developers should run before changes
- Combine recommended test commands

Load template from `./templates/deep-dive.md`. Fill with all collected data from sections 4-5.

IMMEDIATELY write to: `{project_knowledge}/deep-dive-{sanitized_target_name}.md`

Validate deep-dive document completeness.

Update state file:

- Add to `deep_dive_targets` array: target name, path, files analyzed, output file, timestamp
- Add output to `outputs_generated`
- Update `last_updated`

### 7. Update master index

Read existing `{project_knowledge}/index.md`.

Check if "Deep-Dive Documentation" section exists. If not, add it after "Generated Documentation":

```markdown
## Deep-Dive Documentation

Detailed exhaustive analysis of specific areas:
```

Add link to new deep-dive doc:

```markdown
- [{target_name} Deep-Dive](./deep-dive-{sanitized_target_name}.md) - Comprehensive analysis ({file_count} files, {total_loc} LOC) - Generated {date}
```

Save updated `index.md`.

### 8. Offer to continue or complete

Display summary with: output file path, files analyzed count, LOC scanned, and list of documentation sections included (file inventory, dependency graph, data flow, integration points, related code, implementation guidance).

Then present:

```
Would you like to:
1. Deep-dive another area
2. Finish -- proceed to final output

Your choice [1/2]:
```

WAIT for user selection.

- **If 1:** Clear current `deep_dive_target`. Loop back to section 3.
- **If 2:** Proceed to next step.

### 9. Update state and proceed

Update state file:

- Add to `completed_steps`: `{"step": "step_04", "status": "completed", "timestamp": "{now}", "summary": "Deep-dive complete: {deep_dive_count} areas analyzed"}`
- Update `current_step` to `"step_05"`
- Update `last_updated` timestamp

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Deep-Dive Documentation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `{nextStepFile}` — load the file with the Read tool, do not summarise from memory, do not skip sections.
