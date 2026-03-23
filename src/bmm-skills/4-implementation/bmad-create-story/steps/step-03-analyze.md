# Step 3: Analyze

## STEP GOAL

Perform deep analysis of the loaded context: extract architecture patterns, data model, API contracts, deployment chain, edge cases, and identify infrastructure gaps. This analysis feeds directly into the enriched issue description. Present the audit summary to the user for validation before proceeding to enrichment.

## RULES

- Every "existant" claim from architecture or PRD must be VERIFIED in the codebase
- Infrastructure gaps (MISSING/PARTIAL) generate mandatory tasks — they are not optional
- Zero Fallback: if source data for a mapping is unavailable, flag as MISSING, never propose a substitute
- The audit is presented to the user BEFORE enrichment — user must approve scope

## SEQUENCE

### 1. Architecture and technology extraction

From `EPIC_ARCHITECTURE`, extract:

- **Technical stack and versions** — frameworks, libraries, database engines
- **Key patterns** — DDD, CQRS, event-driven, hexagonal, etc.
- **Database schema** relevant to this story — tables, columns, types, constraints, indexes
- **API contracts** — endpoints, payloads, error codes
- **Testing strategy** — what types of tests are expected

### 2. Domain model and data mapping

- Extract concrete data model: table definitions, migration plan, DTO/Domain/DB mappings
- **Verify schema coherence:** compare the architecture's data model against actual Prisma/Drizzle schema files in the codebase
  - If prior stories have already implemented parts of the schema, identify what remains
  - If the schema has drifted from the architecture, flag the delta
  - If no concrete data model exists in the architecture, flag as gap

### 3. PRD extraction

From `EPIC_PRD`, extract:

- Acceptance criteria specific to THIS story
- Business rules and constraints
- Edge cases and error scenarios
- User journey for this story's scope

### 4. Previous stories extraction

From `COMPLETED_STORIES`, extract:

- Lessons learned and patterns established
- Infrastructure already created (services, migrations, secrets, config)
- Regressions to watch for

### 5. Deployment chain audit

**For each impacted service, audit the full deployment chain:**

1. **Build pipeline** — Does this service have a build step in CI/CD? Dockerfile? If new service, is there a plan?
2. **Database migrations** — If schema changes: is migration generation part of tasks? Is it integrated into CI/CD?
3. **Deployment** — Does this service have a deployment configuration (Cloud Run template, etc.)?
4. **Infrastructure** — Are cloud resources provisioned AND coherent with application code?
5. **Secrets and configuration** — Are required secrets and config values complete?

Classify each layer as:
- **PRESENT** — fully covered and coherent
- **MISSING** — does not exist, must be created as part of this story
- **PARTIAL** — exists but needs modification

### 6. AC production viability audit

For EACH acceptance criterion, trace the **complete production chain**:

1. **Trigger** — what initiates the AC in production? Does this trigger exist and is it active?
2. **Processing** — what code runs? Are all dependencies available (real adapters, not stubs)?
3. **Result** — what is the observable outcome? Can it actually be produced with production wiring?

For each link, verify it exists in the codebase or is planned as a task. Common blind spots:
- Domain port with InMemory stub but no real adapter for production
- Endpoint created but no Cloud Scheduler / webhook to call it
- Config value in code but not in cloudrun-template.yml or Secret Manager

### 7. Zero Fallback / Zero False Data audit

For every data mapping in the story (source -> DTO -> DB -> external API):
- Verify the source field contains the EXACT data expected by the target
- If source data is unavailable, flag as MISSING — never propose a fallback
- If a field mapping seems "close enough", verify it actually matches

### 8. CHECKPOINT — Audit presentation

Present the full audit to the user:

```
## Audit CI/CD & Infrastructure — {ISSUE_IDENTIFIER}

### Service(s) impacte(s)

| Couche           | Statut   | Detail     |
| ---------------- | -------- | ---------- |
| Build pipeline   | PRESENT/MISSING/PARTIAL | {detail} |
| Migrations DB    | PRESENT/MISSING/PARTIAL | {detail} |
| Deploiement      | PRESENT/MISSING/PARTIAL | {detail} |
| Infrastructure   | PRESENT/MISSING/PARTIAL | {detail} |
| Secrets / config | PRESENT/MISSING/PARTIAL | {detail} |

### Fichiers a creer (couches MISSING)

{list of files to create}

### Ecarts schema / architecture

{schema drift findings, if any}

### Perimetre de la story

- Taches applicatives : {count}
- Taches CI/CD & infra : {count}
- Guardrails identifies : {count}
- Edge cases identifies : {count}

Approuvez-vous ce perimetre avant que j'enrichisse l'issue dans le tracker ?
```

WAIT for user approval. If user requests scope changes, update the plan and re-present.

---

**Next:** Read fully and follow `./step-04-enrich.md`
