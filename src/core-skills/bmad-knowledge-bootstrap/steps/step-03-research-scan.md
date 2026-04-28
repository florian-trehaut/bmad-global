---
nextStepFile: './step-04-generate-knowledge.md'
---

# Step 3: Research and Deep Scan (adaptive sources)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Research and Deep Scan (adaptive sources) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Read available sources adaptively per the SDD priority pyramid: planning artifacts (PRD, architecture, ADRs), phase 4 specs, and codebase. Optionally web-research detected technologies for conventions. Build structured `PLANNING_DATA`, `SPECS_DATA`, and `CODE_DATA` objects to feed step-04-generate-knowledge.

This step is automated — no user interaction.

## MANDATORY SEQUENCE

### 1. Planning Artifacts Scan (skip if no planning sources)

If any of `PRD_PRESENT` / `ARCHITECTURE_PRESENT` / `BRIEF_PRESENT` / `ADRS_PRESENT` is true:

#### a. PRD scan (if PRD_PRESENT)

Read `{planning_artifacts}/prd.md`. Extract:

| Section heading | Goes to | Notes |
|---|---|---|
| `## Vision` / `## Product Vision` | domain.md§"Bounded Contexts" preface | High-level purpose |
| `## Domain` / `## Domain Model` / `## Ubiquitous Language` | domain.md§"Ubiquitous Language" + §"Bounded Contexts" | Direct merge |
| `## Functional Requirements` | api.md§"Endpoints" hints + project.md§"Project Nature" | High-level features |
| `## Non-functional Requirements` | project.md§"Review Perspectives" + §"Validation Tooling" | Quality attributes |
| `## Success Criteria` | (informational, not in knowledge) | — |
| `## Project Type` / `## Project Nature` | project.md§"Project Nature" | Direct merge |

#### b. Product Brief scan (if BRIEF_PRESENT)

Read `{planning_artifacts}/product-brief.md`. Extract domain terminology, vision, and target users → enrich domain.md.

#### c. Architecture scan (if ARCHITECTURE_PRESENT)

Read `{planning_artifacts}/architecture.md`. Extract:

| Section heading | Goes to | Notes |
|---|---|---|
| `## Tech Stack` / `## Technology Stack` | project.md§"Tech Stack" | Direct merge |
| `## Patterns` / `## Architecture Patterns` | project.md§"Architecture Patterns" + §"Conventions" | Direct merge |
| `## Project Structure` / `## Directory Layout` | project.md§"Architecture" + §"Investigation Checklist" | Direct merge |
| `## API Design` / `## API` | api.md (entire body) | Endpoints, schemas, auth |
| `## Infrastructure` / `## Deployment` | project.md§"Infrastructure" | Direct merge |
| `## Environments` | project.md§"Environments" | Direct merge |
| `## Test Strategy` / `## Testing` | project.md§"Validation Tooling" + §"Test Rules" | Direct merge |
| `## Observability` / `## Monitoring` | project.md§"Investigation Checklist"§"Observability" | Direct merge |

#### d. ADRs scan (if ADRS_PRESENT)

Read all ADR files at `{adr_location}/*.md` in chronological order (sort by filename or `date` frontmatter). For each ADR:

- Extract the **decision** (typically in section "## Decision" or "## Outcome")
- Extract **forbidden patterns** if any (typically in "## Constraints" or "## Implications")
- Extract **status**: only ADRs with status "Accepted" / "Approved" are applied. "Deprecated" / "Superseded" ADRs are skipped (their successor handles the topic).

Apply ADRs to relevant sections:
- Tech stack changes → project.md§"Tech Stack"
- Forbidden patterns → project.md§"Conventions"§"Code Style" + §"Review Perspectives"
- API breaking changes → api.md
- Infra changes → project.md§"Infrastructure"

**Most recent wins**: if ADR-005 contradicts ADR-002 on the same topic, ADR-005's content goes into the knowledge file.

Store structured `PLANNING_DATA` per knowledge file target.

### 2. Phase 4 Specs Scan (if SPECS_PRESENT)

For each `_bmad-output/implementation-artifacts/spec-*.md` (or tracker-resolved specs):

- Extract **Technical Decisions** sections → overlay project.md§"Tech Stack" if any
- Extract **Acceptance Criteria** mentioning APIs → enrich api.md§"Endpoints" hints
- Extract **Forbidden Patterns** if any → project.md§"Conventions"

Specs **override** ADRs/architecture/PRD for their feature scope. Mark each merge with the source spec for traceability.

Store structured `SPECS_DATA` per knowledge file target.

### 3. Code Scan (skip if CODE_PRESENT=false)

This section runs only when `CODE_PRESENT=true` (codebase exists). It overlays factual data on top of planning intent.

#### a. Web Research (for detected stack)

For each technology detected in step 02 (detect-stack), research:
1. **Conventions** — file naming, project structure, coding style
2. **Forbidden patterns** — anti-patterns, security pitfalls, deprecated APIs
3. **Test conventions** — file organization, assertion patterns, mocking policies
4. **Security** — OWASP-relevant patterns for this stack

Store `research_findings` per technology. Used to enrich project.md§"Conventions" + §"Review Perspectives".

#### b. Stack Scan

- Read main package manifest → dependencies (with versions), scripts, metadata
- Read lint config files → active rules, severity, overrides
- Read formatter config → key options
- Read test config → test roots, coverage thresholds
- Read pre-commit config → hook commands
- **Source file patterns**: use `source_extensions` and `test_file_patterns` from step 02 detection
- **Architecture patterns**: use classification from step 02

Goes to project.md§"Tech Stack" + §"Source File Patterns" + §"Architecture Patterns" + §"Test Rules".

#### c. Infrastructure Scan

- Read all CI/CD workflow files → jobs, triggers, dependencies
- Read Dockerfiles → base images, build stages, exposed ports
- Read deployment configs → Terraform, k8s, serverless
- Read .env.example → variable names (NOT values)
- Identify cloud service references in code

Goes to project.md§"Infrastructure" + §"Environments".

#### d. Domain Scan (for domain.md)

Use `source_extensions` from step 02 to scope searches:

```bash
# Entity/model definitions
grep -rn "class.*Entity\|interface.*Model\|schema\|@Entity\|@Table\|struct " --include="{source_ext}" . | grep -v node_modules | grep -v vendor | grep -v test | head -30

# Domain exceptions/errors
grep -rn "Exception\|class.*Error\|enum.*Error" --include="{source_ext}" . | grep -v node_modules | head -20
```

- Scan DTOs/request-response schemas
- Identify bounded contexts from directory structure

Goes to domain.md.

#### e. API Scan (for api.md)

```bash
# Route/endpoint definitions
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Controller\|app\.get\|app\.post\|router\." --include="{source_ext}" . | grep -v node_modules | head -30
```

Goes to api.md§"Endpoints".

#### f. Conventions Scan

```bash
git log --oneline -30
```

- Read .editorconfig if present
- Check for PR template: `.github/pull_request_template.md`
- Analyze import ordering patterns from a sample of source files
- Check branch naming from `git branch -r | head -20`

Goes to project.md§"Conventions".

#### g. Review Perspectives Scan

- Identify security-relevant patterns (auth middleware, input validation)
- Identify forbidden patterns enforced by linter
- Check existing review-perspectives content if present

Goes to project.md§"Review Perspectives".

#### h. Tracker Scan

- Read workflow-context.md tracker configuration section
- If file-based: check sprint-status.yaml structure
- If MCP-based: probe MCP tools for entity types

Goes to project.md§"Tracker Patterns".

#### i. Environment Config Scan

- Scan environment references in code
- Read deployment configs for environment URLs
- Check for feature flag systems

Goes to project.md§"Environments".

#### j. Validation Scan

- Read E2E config files (playwright.config, cypress.config) → baseURL, projects, webServer config
- Read component test config → test roots, environment, reporters
- Scan for stack-specific test helper patterns:

```bash
# WASM hydration / Tauri / framework-specific patterns
grep -rn "gotoAndHydrate\|waitForHydration\|mockIPC\|wasm_bindgen_test\|tauri_driver" --include="{source_ext}" . | grep -v node_modules | head -10

# Test factories and fixtures
find . -maxdepth 4 -type d \( -name "fixtures" -o -name "factories" -o -name "helpers" \) -path "*/test*" 2>/dev/null | head -10

# Accessibility test patterns
grep -rn "checkA11y\|axe\|pa11y\|getByRole\|getByLabel" --include="{source_ext}" . | grep -v node_modules | head -10
```

- If Rust+WASM detected: check for `wasm-pack test` configuration, `wasm-bindgen-test` usage
- If Tauri detected: check for `tauri-driver` setup, WebDriver config files
- If Leptos/Yew/Dioxus detected: check for hydration-aware test patterns
- Identify test file naming and location patterns from existing test files
- Extract dev server command from package.json scripts or Cargo config

Goes to project.md§"Validation Tooling".

#### k. ADR Discovery Scan (additional code-side)

Already detected by step-01 (ADR_LOCATION from workflow-context.md). Re-verify and capture sample for hash:

```bash
ls -d docs/adr/ docs/adrs/ docs/decisions/ docs/architecture/decisions/ adr/ adrs/ doc/adr/ .adr/ 2>/dev/null
find . -maxdepth 4 -name "ADR-*" -o -name "adr-*" -o -name "[0-9][0-9][0-9][0-9]-*.md" | grep -i "adr\|decision" | grep -v node_modules | head -20
```

Update `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` with `adr_location` and `adr_format` if newly detected.

Store structured `CODE_DATA` per knowledge file target.

### 4. Compile Results

Build three accumulators per target file:

```yaml
PLANNING_DATA:
  project.md:
    Tech Stack: { ... }
    Architecture Patterns: { ... }
    ...
  domain.md:
    Ubiquitous Language: { ... }
    ...
  api.md:
    Endpoints: { ... }
    ...

SPECS_DATA:
  project.md: { ... }
  domain.md: { ... }
  api.md: { ... }

CODE_DATA:
  project.md: { ... }
  domain.md: { ... }
  api.md: { ... }
```

These feed step-04-generate-knowledge merge logic.

### 5. Proceed

Load and execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Available planning artifacts read (PRD, architecture, ADRs) — skipped if absent
- Available phase 4 specs read — skipped if absent
- Code scanned — skipped if CODE_PRESENT=false
- ADRs sorted chronologically; deprecated/superseded ones excluded
- Source extensions used dynamically (not hardcoded)
- Research findings sourced from web (not LLM memory)
- PLANNING_DATA / SPECS_DATA / CODE_DATA structured per target file

### FAILURE:

- Reading code when CODE_PRESENT=false
- Hardcoding file extensions in grep commands
- Relying on LLM knowledge instead of web research
- Mixing ADR sources without chronological order
- Including deprecated ADRs in merge data

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Research and Deep Scan (adaptive sources)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
