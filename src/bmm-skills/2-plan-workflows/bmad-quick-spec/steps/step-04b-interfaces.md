---
nextStepFile: './step-05-plan.md'
externalInterfaceTemplate: '../data/external-interface-template.md'
dataMappingTemplate: '../data/data-mapping-template.md'
---

# Step 4b: External Interfaces & Data Mapping

## STEP GOAL:

Detect external data interfaces and document end-to-end data mappings. This completes the structural assessment started in Step 4.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator with integration expertise
- Proactively detect external interfaces -- don't wait for the user to mention them
- You bring integration awareness, user brings business process knowledge

### Step-Specific Rules:

- Focus on external boundaries and data flows -- internal logic is Step 5
- FORBIDDEN: generating implementation tasks (that's Step 5)
- Approach: proactive detection, structured documentation

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Auto-proceed to next step if no interfaces detected (simple C-only menu)
- Update WIP file before presenting checkpoint menu

## CONTEXT BOUNDARIES:

- Available: worktree at {SPEC_WORKTREE_PATH}, all findings from Steps 2-4
- Focus: system boundaries, external contracts, data flows
- Dependencies: Step 4 completed

---

## MANDATORY SEQUENCE

### 1. External Interface Detection

Proactively ask the user:

> Does this feature involve receiving or sending data from/to an external system, a file, or a partner API?

Also proactively detect from code investigation if this feature involves:

- File import/export (CSV, Excel, XML, JSON, PDF upload...)
- API endpoint exposed to external consumers
- Webhook received from or sent to an external system
- Scheduled data feed (SFTP, object storage bucket, S3...)
- Email with structured content
- Inter-service event crossing bounded context

### 2. Document External Interfaces

If external interfaces detected:

Load {externalInterfaceTemplate} for output format reference.

For each interface, produce: transport, format, trigger, schema with field-level validation, error handling strategy, volume estimates.

If NO external interfaces: document "No external data interfaces identified."

### 3. Data Mapping

If the feature involves an end-to-end data flow (API -> service -> DB):

Load {dataMappingTemplate} for output format reference.

Produce the data mapping: DTO fields -> Domain fields -> DB columns, with transformations.

**CRITICAL -- Zero Fallback / Zero False Data (apply shared rules loaded during initialization):**

For EVERY field in the data mapping:
- Verify the source field contains EXACTLY the data expected by the target -- not a "close enough" alternative
- Fields with similar names often contain different values. Never assume two columns are interchangeable without verification.
- If the source data is unavailable from the current service, the spec MUST include a task to make it accessible (new DB connection, new API call). NEVER propose a fallback to a different field.
- Every field sent to an external API or stored for billing must have explicit null validation with throw + alert documented in the error handling strategy

If NO end-to-end data flow: document "No end-to-end data mapping required."

### 4. Update WIP File

Append external interface and data mapping sections to WIP file. Update `stepsCompleted` to add this step.

### 5. Present MENU OPTIONS

Display: "**Select:** [C] Continue to plan generation (Step 5)"

#### Menu Handling Logic:

- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#5-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- External interface detection question asked proactively
- Interfaces documented (or "none" confirmed)
- Data mapping documented (or "none" confirmed)
- Template files loaded for reference
- WIP file updated

### FAILURE:

- Not proactively asking about external interfaces
- Skipping data mapping for features with API -> DB flows
- Not loading template files
