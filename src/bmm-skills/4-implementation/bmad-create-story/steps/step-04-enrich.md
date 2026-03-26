# Step 4: Enrich

## STEP GOAL

Write the enriched issue description incorporating ALL analysis from step 03, update the issue in the tracker, set status to Todo, and add a readiness comment. The enriched description is the developer's COMPLETE and SOLE implementation guide.

## RULES

- If `HAS_BUSINESS_CONTEXT = true`, preserve the existing "Contexte business" section as-is
- ABSOLUTELY NO TIME ESTIMATES anywhere in the description
- Infrastructure tasks get `[INFRA]` or `[CI/CD]` prefix — they are mandatory, not optional
- Every task must be concrete and actionable — no vague "handle edge cases"
- Guardrails must be specific to THIS story, not generic advice
- Validation Metier items must be executable by a human in production

## SEQUENCE

### 1. Compose enriched description

Build the enriched issue description with the following sections (in order):

**Header:**
- Story title, identifier, epic, current status

**Contexte business** (MANDATORY):
- If `HAS_BUSINESS_CONTEXT = true`: preserve the existing section verbatim
- If `HAS_BUSINESS_CONTEXT = false`: synthesize from PRD:
  - User journey E2E (from user's perspective)
  - Business Acceptance Criteria (BACs) — observable outcomes
  - External dependencies and validation gates
  - Validation Metier checklist (production tests to execute after deploy)
  - Product-level Definition of Done

**Contexte technique:**
- Technical context from Architecture document
- Impacted services, relevant patterns, key dependencies
- Reference code pointers (which existing code to follow as example)

**Acceptance Criteria:**
- Two types: Business ACs (BACs, from PRD/business context) + Technical ACs (TACs, from architecture/analysis)
- Each TAC should trace to a BAC where applicable
- Format: Given/When/Then or clear conditional statements

**Tasks / Subtasks:**
- Detailed implementation tasks with checkboxes
- MUST include `[CI/CD]` and `[INFRA]` tasks from step 03 if any MISSING/PARTIAL layers were found
- Group by logical area (domain, API, infrastructure, tests)
- Each task is concrete: "Create migration for X table with columns A, B, C" not "Handle database changes"

**CI/CD & Infrastructure Checklist:**
- Summary of the deployment chain audit from step 03
- Which layers are PRESENT, MISSING, or PARTIAL for each impacted service

**Technical Requirements:**
- Patterns to follow (with pointers to reference code)
- Libraries to use (with versions if relevant)
- Architectural constraints

**Data Model Changes** (if applicable):
- Schema delta: new tables/columns, modified constraints
- Migration plan and sequencing
- Indexes for frequent query patterns
- Data mapping table: DTO <-> Domain <-> DB

**API Contract Changes** (if applicable):
- New/modified endpoints with request/response payloads
- Error codes and error handling requirements
- Validation rules for request bodies

**Infrastructure Changes** (if applicable):
- New resources (GCS buckets, secrets, env vars)
- Terraform modifications
- Cloud Run template changes
- New entries in configuration.ts

**Guardrails:**
- What NOT to do, common mistakes to avoid for THIS story
- MUST include: "Do not consider the story complete if schema changes exist without generated migrations"
- MUST include: "Data migrations with UPDATE/DELETE must be effective in ALL environments (dev, staging, production). WHERE clauses matching on names/slugs must be verified against real data — names often differ between environments. A migration that silently updates 0 rows is a zero-fallback violation."
- MUST include: "Do not consider the story complete if a service is not deployable end-to-end via CI/CD"
- MUST include: "Toute requete `findMany({ where: { column } })` frequente doit avoir un index sur `column`"
- MUST include: "Apres ajout d'un `@@index` dans le schema, verifier que le SQL correspondant est dans la migration"
- MUST include: "Do not consider the story complete if schema changes have no documented data mapping (DTO <-> Domain <-> DB)"
- MUST include: "Every new `config.get()` call must have a corresponding env var in configuration.ts AND cloudrun-template.yml"
- Additional story-specific guardrails from analysis

**Validation Metier** (MANDATORY):
- Production test checklist — tests to execute in production after deployment
- Items must be concrete, executable by a human, from user/business perspective
- Not "check logs" — observable outcomes like "email received", "API returns X", "data visible in UI"
- The story passes to "To Test" in the tracker and only moves to "Done" after manual validation

**Previous Story Learnings** (if applicable):
- What worked in earlier stories of this epic
- Patterns to replicate, mistakes to avoid
- Regressions to watch for

**Test Requirements:**
- Unit tests: what to test, key edge cases
- Integration tests: what interactions to verify
- Journey tests: what end-to-end flows to cover (if applicable)
- Test pyramid expectations for this story

**File List:**
- Expected files to create and modify
- Grouped by service/area

### 2. Update issue in tracker

1. Update the issue description in the tracker (using CRUD patterns from tracker.md) — Operation: Update issue, Issue: {ISSUE_ID}, Field: description, Value: enriched_description
2. If the update fails due to size, try splitting: update description first, then add details as a comment

### 3. Update issue status to Todo

1. Update the issue status in the tracker (using CRUD patterns from tracker.md) — Operation: Update issue, Issue: {ISSUE_ID}, Status: {TRACKER_STATES.todo}

### 4. Add readiness comment

Add a comment confirming the issue is ready:

Add a comment in the tracker (using CRUD patterns from tracker.md):
- Operation: Create comment
- Issue: ISSUE_ID
- Body: "Issue description enriched with tasks, guardrails, and technical requirements.\n\nRappel flux: Todo -> In Progress -> In Review -> To Test -> Done\n- Apres merge + deploy prod: la story passe en To Test\n- Les tests de Validation Metier doivent etre executes en production\n- Done = validation metier OK (jamais automatique)\n\nReady for development."

### 5. Check epic project status

If this is the first story in the epic (no completed stories found in step 02), check if the Project status in the tracker needs updating to indicate the epic is now active.

### 6. Report completion

Present the completion report:

```
## Story enrichie

- Issue : {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
- Epic : {PROJECT_NAME}
- Statut tracker : Todo

### Contenu

- Acceptance Criteria : {N} BACs + {N} TACs
- Taches : {N} applicatives + {N} CI/CD & infra
- Guardrails : {N}
- Tests Validation Metier : {N}
- Fichiers attendus : {N}

### Prochaine etape

Lancez le workflow dev-story pour commencer l'implementation,
ou le workflow review-story pour une revue adversariale avant dev.
```

---

## END OF WORKFLOW

The bmad-create-story workflow is complete.
