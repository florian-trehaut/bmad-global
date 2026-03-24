---
nextStepFile: './step-04b-interfaces.md'
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
dataModelTemplate: '../data/data-model-template.md'
apiContractTemplate: '../data/api-contract-template.md'
infraAssessmentTemplate: '../data/infra-assessment-template.md'
---

# Step 4: Data Model, API & Infrastructure

## STEP GOAL:

Assess data model changes, API contracts, and infrastructure requirements. This bridges the gap between code investigation and task generation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator with data architecture expertise
- Collaborative dialogue -- present findings, user validates
- You bring schema analysis, user brings business constraints

### Step-Specific Rules:

- Focus on data model, API, and infra -- external interfaces are in Step 4b
- FORBIDDEN: generating implementation tasks (that's Step 5)
- Approach: investigate schemas/controllers/infrastructure-as-code, produce structured assessments

## EXECUTION PROTOCOLS:

- Use subprocess per ORM/schema type when available (Pattern 3: data operations) -- each subprocess reads schema files and migrations, returns only relevant subset
- Sections 4.1, 4.2, 4.3 are independent -- launch in parallel when subprocess available (Pattern 4)
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu

## CONTEXT BOUNDARIES:

- Available: worktree at {SPEC_WORKTREE_PATH}, all findings from Steps 2-3
- Focus: structural assessment (schema, endpoints, infra), not external interfaces
- Dependencies: Step 3 completed, technical context confirmed

---

## MANDATORY SEQUENCE

### 1. Data Model Assessment

Investigate in {SPEC_WORKTREE_PATH}:

- Read ORM schemas (e.g., `**/schema.prisma`, `**/schema.ts`, `**/migrations/`) impacted by this feature
- Read existing migrations to understand the current state
- Identify: which tables/columns must be created, modified, or deleted

Load {dataModelTemplate} for output format reference.

Produce the data model assessment following the template: schema delta, relations, indexes, constraints, migration plan.

**Data migration classification (MANDATORY when UPDATE/DELETE on existing data):**
- **Additive** migrations (new columns/tables) — low risk, standard review
- **Transformative** migrations (UPDATE/DELETE on existing data) — high risk. For each transformative migration:
  - Verify the WHERE clause matches actual data in ALL target environments (dev, staging, production) — names, slugs, and IDs can differ between environments
  - If DB access is available, query real data to confirm row counts
  - Flag any migration that would silently match zero rows in any environment as a gap requiring an explicit task
  - Add rollback strategy to ACs

### 2. API Contract Assessment

If the feature involves API endpoints:

- List existing endpoints impacted (read controllers in the worktree)
- Define new endpoints

Load {apiContractTemplate} for output format reference.

Produce the API contract assessment following the template: endpoints table, payload details, error codes.

### 3. Infrastructure Assessment

Determine if the feature requires infra changes:

- New compute services? New object storage? New secrets? New environment variables?
- Modifications to existing infrastructure-as-code (Terraform, CDK, etc.)?

Load {infraAssessmentTemplate} for output format reference.

Produce the infrastructure assessment following the template.

### 4. Intermediate Checkpoint

Present findings so far to the user:

> Here are my findings for the data model, APIs, and infrastructure. Shall we continue with external interfaces and data mapping?

WAIT for user feedback. Address any corrections before proceeding.

### 5. Update WIP File

Append data model, API, and infra sections to WIP file. Set `stepsCompleted: [1, 2, 2b, 3, 4]`.

### 6. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to external interfaces (Step 4b)"

#### Menu Handling Logic:

- IF A: Read fully and follow {advancedElicitationTask} with current context, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current context, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#6-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Data model assessment produced (or "no changes" documented)
- API contracts assessed (or "no endpoints" documented)
- Infrastructure assessment produced (or "no changes" documented)
- Subprocess per ORM type used when available
- Intermediate checkpoint presented, user feedback addressed
- WIP file updated
- Menu presented and handled

### FAILURE:

- Skipping any of the three assessments without justification
- Not loading template files for reference
- Not presenting intermediate checkpoint
- Proceeding without user validation of findings
- Proposing a data mapping where source field does not match expected semantics without flagging it as a gap. Apply the zero-fallback/zero-false-data rules loaded during initialization.
