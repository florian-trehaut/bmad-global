# Step 3: Analyze

## STEP GOAL

Perform deep analysis of the loaded context: extract architecture patterns, data model, API contracts, deployment chain, external interfaces, impact analysis, and identify infrastructure gaps. All code verification runs in {SPEC_WORKTREE_PATH}. This analysis feeds directly into the enriched issue description. Present the audit summary to the user for validation before proceeding to enrichment.

## RULES

- Every "existant" claim from architecture or PRD must be VERIFIED in the codebase at {SPEC_WORKTREE_PATH}
- Infrastructure gaps (MISSING/PARTIAL) generate mandatory tasks — they are not optional
- Zero Fallback: if source data for a mapping is unavailable, flag as MISSING, never propose a substitute
- The audit is presented to the user BEFORE enrichment — user must approve scope
- Load structured templates from `~/.claude/skills/bmad-shared/data/` for reproducible output format
- **ADR HALT is MANDATORY**: When the story introduces a new architectural decision (new service, integration pattern, data store, or deviation from existing ADRs) → you MUST HALT and present the ADR menu. NEVER silently document an ADR need as a "note" or "recommendation" — the HALT forces an explicit decision.

## SEQUENCE

### 1. Architecture and technology extraction

From `EPIC_ARCHITECTURE`, extract:

- **Technical stack and versions** — frameworks, libraries, database engines
- **Key patterns** — DDD, CQRS, event-driven, hexagonal, etc.
- **Database schema** relevant to this story — tables, columns, types, constraints, indexes
- **API contracts** — endpoints, payloads, error codes (use `~/.claude/skills/bmad-shared/data/api-contract-template.md` for structured output)
- **Testing strategy** — what types of tests are expected

### 2. Domain model and data mapping

- Extract concrete data model: table definitions, migration plan, DTO/Domain/DB mappings
- Load `~/.claude/skills/bmad-shared/data/data-model-template.md` for structured output format
- **Verify schema coherence:** compare the architecture's data model against actual ORM schema files in the codebase (see workflow-knowledge/stack.md for the project's ORM)
  - If prior stories have already implemented parts of the schema, identify what remains
  - If the schema has drifted from the architecture, flag the delta
  - If no concrete data model exists in the architecture, flag as gap
- **Data migration classification (MANDATORY when UPDATE/DELETE on existing data):**
  - **Additive** migrations (new columns/tables) — low risk, standard review
  - **Transformative** migrations (UPDATE/DELETE on existing data) — high risk. For each:
    - Verify WHERE clause matches actual data in ALL environments (dev, staging, production)
    - If DB access is available, query real data to confirm row counts
    - Flag any migration that would silently match zero rows as a gap
    - Add rollback strategy to ACs

### 3. PRD extraction

From `EPIC_PRD`, extract:

- Acceptance criteria specific to THIS story
- Business rules and constraints
- Edge cases and error scenarios
- User journey for this story's scope

### 4. ADR Conformity Analysis

**This section is MANDATORY — not conditional.** Check `adr_location` from workflow-context.md.

**Step A — Cross-reference existing ADRs:**

If ADRs are available (adr_location is set and not 'none'), load all ADRs from the configured location. When multiple ADRs on the same topic, the most recent takes precedence.

Cross-reference the story scope against active ADRs:
- Does the story's architecture align with decided approaches?
- Does the story introduce patterns, services, or integrations that would require a new ADR?
- If an ADR violation or gap is detected, add it as a guardrail in the enriched story description.

Store relevant ADRs as `RELEVANT_ADRS` for inclusion in the enriched story.

**Step B — Detect new architectural decisions:**

Scan the story scope for any of these signals:
- New service, worker, or scheduled job
- New integration pattern (new queue, new event bus, new external API)
- New data store or significant schema pattern change
- Deviation from an existing ADR's decided approach
- Technology choice not covered by existing ADRs

**If ANY signal is detected → HALT.** Present the menu:

> This story introduces **{description of the architectural decision}** which should be recorded as an Architecture Decision Record.
>
> **[A]** Create ADR now (invoke `bmad-create-adr`)
> **[S]** Skip — will create ADR later (add as guardrail in story)
> **[N]** Not needed — this doesn't warrant an ADR

WAIT for user selection.

- **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume analysis.
- **IF S:** Add a guardrail to the enriched story: "ADR required for {X} before or during implementation." Then proceed.
- **IF N:** Log the user's choice and proceed.

**NEVER** silently document an ADR need as a "note" or "recommendation". The HALT forces an explicit decision.

### 5. Previous stories extraction

From `COMPLETED_STORIES`, extract:

- Lessons learned and patterns established
- Infrastructure already created (services, migrations, secrets, config)
- Regressions to watch for

### 6. Deployment chain audit

Load `~/.claude/skills/bmad-shared/data/infra-assessment-template.md` for structured output format.

**For each impacted service, audit the full deployment chain:**

1. **Build pipeline** — Does this service have a build step in CI/CD? Container config? If new service, is there a plan?
2. **Database migrations** — If schema changes: is migration generation part of tasks? Is it integrated into CI/CD?
3. **Deployment** — Does this service have a deployment configuration (see workflow-knowledge/infrastructure.md)?
4. **Infrastructure** — Are cloud resources provisioned AND coherent with application code?
5. **Secrets and configuration** — Are required secrets and config values complete?

Classify each layer as:
- **PRESENT** — fully covered and coherent
- **MISSING** — does not exist, must be created as part of this story
- **PARTIAL** — exists but needs modification

### 7. External interface detection

Proactively ask the user:

> Does this story involve receiving or sending data from/to an external system, a file, or a partner API?

Also investigate in {SPEC_WORKTREE_PATH} whether this story involves:

- File import/export (CSV, Excel, XML, JSON, PDF upload...)
- API endpoint exposed to external consumers
- Webhook received from or sent to an external system
- Scheduled data feed (SFTP, object storage bucket...)
- Email with structured content
- Inter-service event crossing bounded context

**If external interfaces detected:**

Load `~/.claude/skills/bmad-shared/data/external-interface-template.md` for output format reference.

For each interface, produce: transport, format, trigger, schema with field-level validation, error handling strategy, volume estimates.

**If end-to-end data flows detected (API -> service -> DB):**

Load `~/.claude/skills/bmad-shared/data/data-mapping-template.md` for output format reference.

Produce the data mapping: DTO fields -> Domain fields -> DB columns, with transformations.

**CRITICAL — Zero Fallback / Zero False Data:**

For EVERY field in the data mapping:
- Verify the source field contains EXACTLY the data expected by the target — not a "close enough" alternative
- Fields with similar names often contain different values. Never assume two fields are interchangeable without verification.
- If the source data is unavailable, the spec MUST include a task to make it accessible. NEVER propose a fallback to a different field.
- Every field sent to an external API or stored for billing must have explicit null validation with throw + alert

If NO external interfaces: document "No external data interfaces identified."

### 8. AC production viability audit

For EACH acceptance criterion, trace the **complete production chain**:

1. **Trigger** — what initiates the AC in production? Does this trigger exist and is it active?
2. **Processing** — what code runs? Are all dependencies available (real adapters, not stubs)?
3. **Result** — what is the observable outcome? Can it actually be produced with production wiring?

For each link, verify it exists in the codebase or is planned as a task. Common blind spots:
- Domain port with InMemory stub but no real adapter for production
- Endpoint created but no Cloud Scheduler / webhook to call it
- Config value in code but not in the deployment template or secrets manager (see workflow-knowledge/infrastructure.md)

### 9. Zero Fallback / Zero False Data audit

For every data mapping in the story (source -> DTO -> DB -> external API):
- Verify the source field contains the EXACT data expected by the target
- If source data is unavailable, flag as MISSING — never propose a fallback
- If a field mapping seems "close enough", verify it actually matches

### 10. Impact analysis

Systematically verify that planned code modifications have no unplanned side effects.

**a. Build modification inventory**

From the planned changes identified in sections 1-6, extract every function, method, type, interface, or behavior that will change:

| # | File | Function/Type | Nature of Change |
|---|------|---------------|-----------------|
| M1 | path/to/file | functionName() | Behavior change: {description} |

**b. Trace callers & dependents**

For EACH modification, search the ENTIRE codebase at {SPEC_WORKTREE_PATH} for:

- **Direct callers** — grep for function name, check imports of modified file
- **Type/interface consumers** — if a type changes, find all files that import it
- **Behavioral dependents** — if behavior changes, find callers that depend on old behavior
- **Cross-service consumers** — if API contract or shared package changes, find all clients
- **Data consumers (indirect)** — if what is WRITTEN to a DB column changes, find ALL services/queries/reports that READ that column, including other apps querying the same DB

**c. Assess impact per caller**

| # | Caller | File | Impact | Action Required |
|---|--------|------|--------|-----------------|
| I1 | CallerFunction() | path/to/caller | Compatible — explain WHY | None |
| I2 | OtherCaller() | path/to/other | Needs update — depends on old behavior | Add task |
| I3 | TestFile | path/to/test | Test needs update — asserts old behavior | Update in test task |

Verdicts: **Compatible** (explain why), **Needs update** (add task), **Test update** (include in test task), **Breaking** (must address before proceeding).

**d. Generate non-regression Validation Metier**

For each impacted consumer NOT marked trivially compatible, add a non-regression VM:

- `VM-NR-N *(Impact IN)* : {concrete business test verifying the impacted flow still works}`
- Rules: concrete, executable, from business perspective, trace to the impact that generated them

### 11. CHECKPOINT — Audit presentation

Present the full audit to the user:

```
## Audit — {ISSUE_IDENTIFIER}

### Service(s) impacte(s)

| Couche           | Statut   | Detail     |
| ---------------- | -------- | ---------- |
| Build pipeline   | PRESENT/MISSING/PARTIAL | {detail} |
| Migrations DB    | PRESENT/MISSING/PARTIAL | {detail} |
| Deploiement      | PRESENT/MISSING/PARTIAL | {detail} |
| Infrastructure   | PRESENT/MISSING/PARTIAL | {detail} |
| Secrets / config | PRESENT/MISSING/PARTIAL | {detail} |

### External interfaces

{external interface findings, or "None identified"}

### Impact analysis

{N} modifications traced, {N} impacted callers found
- Compatible: {N}
- Needs update: {N} (tasks added)
- Non-regression VMs added: {N}

### Fichiers a creer (couches MISSING)

{list of files to create}

### Ecarts schema / architecture

{schema drift findings, if any}

### Perimetre de la story

- Taches applicatives : {count}
- Taches CI/CD & infra : {count}
- Guardrails identifies : {count}
- Edge cases identifies : {count}
- Non-regression VMs : {count}

Approuvez-vous ce perimetre avant que j'enrichisse l'issue dans le tracker ?
```

WAIT for user approval. If user requests scope changes, update the plan and re-present.

---

**Next:** Read fully and follow `./step-04-enrich.md`
