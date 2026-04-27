# Step 6: Deployment Chain Audit & Impact Analysis

## STEP GOAL

Audit the full deployment chain for each impacted service, verify AC production viability, enforce zero-fallback on data mappings, and trace all side effects via impact analysis. Present the complete audit to the user for approval before composition.

## RULES

- Every "existant" claim must be VERIFIED in the codebase at {SPEC_WORKTREE_PATH}
- Infrastructure gaps (MISSING/PARTIAL) generate mandatory tasks — they are NOT optional
- Zero Fallback: if source data is unavailable, flag as MISSING, never propose a substitute
- The audit is presented to the user BEFORE composition — user must approve scope
- **ADR HALT is MANDATORY**: When the story introduces a new architectural decision → HALT and present ADR menu. NEVER silently document as a "note".

## SEQUENCE

### 1. ADR Conformity Analysis

**This section is MANDATORY — not conditional.** Check `adr_location` from workflow-context.md.

**Step A — Cross-reference existing ADRs:**

If ADRs are available (adr_location is set and not 'none'), load all ADRs from the configured location. Most recent takes precedence.

Cross-reference the story scope against active ADRs:

- Does the story's architecture align with decided approaches?
- Does it introduce patterns, services, or integrations requiring a new ADR?
- If a violation or gap is detected, add it as a guardrail.

Store relevant ADRs as `RELEVANT_ADRS`.

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

- **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume.
- **IF S:** Add a guardrail: "ADR required for {X} before or during implementation." Proceed.
- **IF N:** Log choice. Proceed.

**NEVER** silently document an ADR need as a "note" or "recommendation".

### 2. Deployment Chain Audit

Load `~/.claude/skills/bmad-shared/data/infra-assessment-template.md` for structured output format.

**For each impacted service, audit the full deployment chain:**

1. **Build pipeline** — Does this service have a build step in CI/CD? Container config? If new service, is there a plan?
2. **Database migrations** — If schema changes: is migration generation part of tasks? Integrated into CI/CD?
3. **Deployment** — Does this service have a deployment configuration (see workflow-knowledge/project.md)?
4. **Infrastructure** — Are cloud resources provisioned AND coherent with application code?
5. **Secrets and configuration** — Are required secrets and config values complete?

Classify each layer as:

- **PRESENT** — fully covered and coherent
- **MISSING** — does not exist, must be created as part of this story
- **PARTIAL** — exists but needs modification

### 3. AC Production Viability Audit

For EACH acceptance criterion, trace the **complete production chain**:

1. **Trigger** — what initiates this AC in production? Does it exist and is it active?
2. **Processing** — what code runs? Are all dependencies available (real adapters, not stubs)?
3. **Result** — what is the observable outcome? Can it actually be produced with production wiring?

For each link, verify it exists in the codebase or is planned as a task. Common blind spots:

- Domain port with InMemory stub but no real adapter for production
- Endpoint created but no Cloud Scheduler / webhook to call it
- Config value in code but not in the deployment template or secrets manager

### 4. Zero Fallback / Zero False Data Audit

For every data mapping in the story (source → DTO → DB → external API):

- Verify the source field contains the EXACT data expected by the target
- If source data is unavailable, flag as MISSING — never propose a fallback
- If a field mapping seems "close enough", verify it actually matches

### 5. Impact Analysis

Systematically verify that planned code modifications have no unplanned side effects.

**a. Build modification inventory**

From the planned changes, extract every function, method, type, interface, or behavior that will change:

| # | File | Function/Type | Nature of Change |
|---|------|---------------|-----------------|
| M1 | path/to/file | functionName() | Behavior change: {description} |

**b. Trace callers & dependents**

For EACH modification, search the ENTIRE codebase at {SPEC_WORKTREE_PATH}:

- **Direct callers** — grep for function name, check imports of modified file
- **Type/interface consumers** — if a type changes, find all files that import it
- **Behavioral dependents** — if behavior changes, find callers that depend on old behavior
- **Cross-service consumers** — if API contract or shared package changes, find all clients
- **Data consumers (indirect)** — if what is WRITTEN to a DB column changes, find ALL services/queries/reports that READ that column, including other apps querying the same DB. Check API responses, exports, batch jobs, scheduled processes, external systems.

**c. Assess impact per caller**

| # | Caller | File | Impact | Action Required |
|---|--------|------|--------|-----------------|
| I1 | CallerFunction() | path/to/caller | Compatible — explain WHY | None |
| I2 | OtherCaller() | path/to/other | Needs update — depends on old behavior | Add task |
| I3 | TestFile | path/to/test | Test needs update — asserts old behavior | Update in test task |

Verdicts: **Compatible** (explain why), **Needs update** (add task), **Test update** (include in test task), **Breaking** (must address before proceeding).

**d. Generate non-regression Validation Metier**

For each impacted consumer NOT marked trivially compatible, add a non-regression VM:

- `VM-NR-N [type] *(Impact IN)* : {concrete business test verifying the impacted flow still works}`
- Rules: concrete, executable, from business perspective, trace to the impact that generated them

Also update the **Definition of Done (product)** non-regression section with these VMs.

### 6. PRD Extraction (Enrichment mode)

**Enrichment mode only:** From `EPIC_PRD`, extract:

- Acceptance criteria specific to THIS story
- Business rules and constraints
- Edge cases and error scenarios
- User journey for this story's scope

### 7. Previous Stories Extraction (Enrichment mode)

**Enrichment mode only:** From `COMPLETED_STORIES`, extract:

- Lessons learned and patterns established
- Infrastructure already created (services, migrations, secrets, config)
- Regressions to watch for

### 8. CHECKPOINT — Audit Presentation

Present the full audit to the user:

```
## Audit — {ISSUE_IDENTIFIER or slug}

### Service(s) impacte(s)

| Couche           | Statut   | Detail     |
| ---------------- | -------- | ---------- |
| Build pipeline   | PRESENT/MISSING/PARTIAL | {detail} |
| Migrations DB    | PRESENT/MISSING/PARTIAL | {detail} |
| Deploiement      | PRESENT/MISSING/PARTIAL | {detail} |
| Infrastructure   | PRESENT/MISSING/PARTIAL | {detail} |
| Secrets / config | PRESENT/MISSING/PARTIAL | {detail} |

### External interfaces

{findings or "None identified"}

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

Approuvez-vous ce perimetre avant la composition de l'issue ?
```

WAIT for user approval. If user requests scope changes, update and re-present.

---

**Next:** Read fully and follow `./step-07-plan.md`
