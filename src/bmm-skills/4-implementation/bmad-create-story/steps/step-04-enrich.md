# Step 4: Enrich

## STEP GOAL

Write the enriched issue description incorporating ALL analysis from step 03, update the issue in the tracker, set status to Todo, and add a readiness comment. The enriched description is the developer's COMPLETE and SOLE implementation guide.

## RULES

- If `HAS_BUSINESS_CONTEXT = true`, preserve the existing "Contexte business" section as-is
- ABSOLUTELY NO TIME ESTIMATES anywhere in the description
- Infrastructure tasks get `[INFRA]` or `[CI/CD]` prefix — they are mandatory, not optional
- Every task must be concrete and actionable — no vague "handle edge cases"
- Guardrails must be specific to THIS story, not generic advice
- Validation Metier items must be executable by a human in production, each tracing to BACs: `VM-N *(BAC-X,Y)* : description`
- Load `../templates/tracker-issue-description.md` for section ordering and conditional rules

## SEQUENCE

### 1. Compose enriched description

Build the enriched issue description following `../templates/tracker-issue-description.md` for section ordering and conditional rules. Key principles:

- **Definition of Done (product)** is ALWAYS the FIRST section — it is the first thing visible when opening the ticket
- **Conditional sections**: omit Data Model if no changes, omit API if no endpoints, omit Infrastructure if no changes, omit External Interfaces if none, omit Data Mapping if no end-to-end flow
- **Technical Context** is wrapped in `<details><summary>Technical Context</summary>` for cleaner readability

Section details:

**Definition of Done (product)** — ALWAYS FIRST, ALWAYS PRESENT:
- Two dimensions: Feature DoD (BACs satisfied, user journey validated) + Non-regression DoD (impacted flows continue to work)
- Include non-regression VMs from impact analysis (step 03)

**Contexte business** (MANDATORY):
- If `HAS_BUSINESS_CONTEXT = true`: preserve the existing section verbatim
- If `HAS_BUSINESS_CONTEXT = false`: synthesize from PRD using `~/.claude/skills/bmad-shared/data/business-context-template.md`:
  - User journey E2E (primary actor, numbered steps)
  - Business Acceptance Criteria (BACs) in Given/When/Then — observable outcomes
  - External dependencies and validation gates (table: Dependency, Owner, Gate, Status)

**Contexte technique** (inside `<details>` collapsible):
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

**Data Model Changes** (conditional — omit if no data changes):
- Schema delta: new tables/columns, modified constraints
- Migration plan and sequencing (Additive vs Transformative classification)
- Indexes for frequent query patterns
- Data mapping table: DTO <-> Domain <-> DB

**API Contract Changes** (conditional — omit if no endpoint impacted):
- New/modified endpoints with request/response payloads
- Error codes and error handling requirements
- Validation rules for request bodies

**Infrastructure Changes** (conditional — omit if no changes required):
- New cloud resources, secrets, env vars
- IaC modifications (see workflow-knowledge/infrastructure.md for the project's IaC tool)
- Deployment template changes
- New entries in the project's configuration module

**External Data Interface Contracts** (conditional — omit if no external interface):
- External interface documentation from step 03 section 6

**Data Mapping** (conditional — omit if no end-to-end data flow):
- DTO -> Domain -> DB mapping from step 03 section 6

**Implementation Plan:**
- Tasks with checkboxes (from Tasks section above)
- Technical Acceptance Criteria (TACs) in Given/When/Then

**Guardrails:**
- What NOT to do, common mistakes to avoid for THIS story
- MUST include: "Do not consider the story complete if schema changes exist without generated migrations"
- MUST include: "Data migrations with UPDATE/DELETE must be effective in ALL environments (dev, staging, production). WHERE clauses matching on names/slugs must be verified against real data — names often differ between environments. A migration that silently updates 0 rows is a zero-fallback violation."
- MUST include: "Do not consider the story complete if a service is not deployable end-to-end via CI/CD"
- MUST include: "Do not consider the story complete if schema changes have no documented data mapping (DTO <-> Domain <-> DB)"
- MUST include: "Every new config access must have a corresponding env var in the project's configuration module AND deployment template (see workflow-knowledge/infrastructure.md)"
- Additional story-specific guardrails from analysis

**Validation Metier** (MANDATORY — ALWAYS PRESENT):
- Production test checklist — tests to execute in production after deployment
- Format: `VM-N *(BAC-X,Y)* : description` — each VM traces to one or more BACs
- Items must be concrete, executable by a human, from user/business perspective
- Not "check logs" — observable outcomes like "email received", "API returns X", "data visible in UI"
- Include non-regression VMs from impact analysis: `VM-NR-N *(Impact IN)* : description`
- The story passes to "To Test" in the tracker and only moves to "Done" after manual validation

**Previous Story Learnings** (if applicable):
- What worked in earlier stories of this epic
- Patterns to replicate, mistakes to avoid
- Regressions to watch for

**Test Strategy:**

| TAC | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | -------- | ---- | ----------- | ------- | ------------- |

Priority classification:
- P0: Revenue-critical, security, compliance, data integrity (>90% unit, >80% integration)
- P1: Core journeys, frequently used, complex logic (>80% unit, >60% integration)
- P2: Secondary features, admin, reporting
- P3: Rarely used, nice-to-have

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

**Next:** Read fully and follow `./step-05-cleanup.md`
