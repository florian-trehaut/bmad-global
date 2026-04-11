---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
dataModelTemplate: '~/.claude/skills/bmad-shared/data/data-model-template.md'
apiContractTemplate: '~/.claude/skills/bmad-shared/data/api-contract-template.md'
infraAssessmentTemplate: '~/.claude/skills/bmad-shared/data/infra-assessment-template.md'
externalInterfaceTemplate: '~/.claude/skills/bmad-shared/data/external-interface-template.md'
dataMappingTemplate: '~/.claude/skills/bmad-shared/data/data-mapping-template.md'
---

# Step 5: Data Model, API, Infrastructure & External Interfaces

## STEP GOAL

Assess data model changes, API contracts, infrastructure requirements, and external data interfaces. This bridges the gap between code investigation and the audit/planning steps.

## RULES

- Focus on structural assessment — not generating implementation tasks yet (that's Step 7)
- Sections 1-3 are independent — launch in parallel when subprocess available
- Use subprocess per ORM/schema type when available
- Every "existant" claim must be VERIFIED in the codebase at {SPEC_WORKTREE_PATH}

## SEQUENCE

### 1. Data Model Assessment

Investigate in {SPEC_WORKTREE_PATH}:

- Read ORM schema files and migrations impacted by this feature (see workflow-knowledge/stack.md for the project's ORM and file patterns)
- Read existing migrations to understand the current state
- Identify: which tables/columns must be created, modified, or deleted

Load {dataModelTemplate} for output format reference.

Produce the data model assessment following the template: schema delta, relations, indexes, constraints, migration plan.

**Enrichment mode additional check:** Compare the architecture's data model against actual ORM schema files:

- If prior stories have already implemented parts of the schema, identify what remains
- If the schema has drifted from the architecture, flag the delta
- If no concrete data model exists in the architecture, flag as gap

**Data migration classification (MANDATORY when UPDATE/DELETE on existing data):**

- **Additive** migrations (new columns/tables) — low risk, standard review
- **Transformative** migrations (UPDATE/DELETE on existing data) — high risk. For each:
  - Verify WHERE clause matches actual data in ALL environments (dev, staging, production)
  - If DB access is available, query real data to confirm row counts
  - Flag any migration that would silently match zero rows as a gap
  - Add rollback strategy to ACs

### 2. API Contract Assessment

If the feature involves API endpoints:

- List existing endpoints impacted (read controllers in the worktree)
- Define new endpoints

Load {apiContractTemplate} for output format reference.

Produce the API contract assessment: endpoints table, payload details, error codes.

### 3. Infrastructure Assessment

Determine if the feature requires infra changes:

- New compute services? New object storage? New secrets? New environment variables?
- Modifications to existing infrastructure-as-code?

Load {infraAssessmentTemplate} for output format reference.

Produce the infrastructure assessment following the template.

### 4. External Interface Detection

Proactively ask the user:

> Does this feature involve receiving or sending data from/to an external system, a file, or a partner API?

Also proactively detect from code investigation if this feature involves:

- File import/export (CSV, Excel, XML, JSON, PDF upload...)
- API endpoint exposed to external consumers
- Webhook received from or sent to an external system
- Scheduled data feed (SFTP, object storage bucket...)
- Email with structured content
- Inter-service event crossing bounded context

**If external interfaces detected:**

Load {externalInterfaceTemplate} for output format reference.

For each interface, produce: transport, format, trigger, schema with field-level validation, error handling strategy, volume estimates.

If NO external interfaces: document "No external data interfaces identified."

### 5. Data Mapping

If the feature involves an end-to-end data flow (API → service → DB):

Load {dataMappingTemplate} for output format reference.

Produce the data mapping: DTO fields → Domain fields → DB columns, with transformations.

**CRITICAL — Zero Fallback / Zero False Data (apply shared rules):**

For EVERY field in the data mapping:

- Verify the source field contains EXACTLY the data expected by the target — not a "close enough" alternative
- Fields with similar names often contain different values. Never assume two fields are interchangeable without verification.
- If the source data is unavailable, the spec MUST include a task to make it accessible. NEVER propose a fallback to a different field.
- Every field sent to an external API or stored for billing must have explicit null validation with throw + alert

If NO end-to-end data flow: document "No end-to-end data mapping required."

### 6. Checkpoint & Menu

Present findings to the user:

> Here are my findings for the data model, APIs, infrastructure, and external interfaces. Shall we continue with the deployment chain audit and impact analysis?

WAIT for user feedback. Address any corrections.

**Discovery mode:** Present A/P/C menu:

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to audit & impact analysis (Step 6)"

- IF A: Read fully and follow {advancedElicitationTask}, process insights, ask "Accept? (y/n)", update then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow}, process insights, ask "Accept? (y/n)", update then redisplay menu
- IF C: Proceed to next step
- IF any other: Respond helpfully then redisplay menu

ALWAYS halt and wait for user input. ONLY proceed when user selects 'C'.

**Enrichment mode:** Present findings, confirm with user, then proceed directly.

---

**Next:** Read fully and follow `./step-06-audit.md`
