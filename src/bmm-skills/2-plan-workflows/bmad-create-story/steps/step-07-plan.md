---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
trackerIssueTemplate: '../templates/tracker-issue-description.md'
---

# Step 7: Implementation Plan & Composition

## STEP GOAL

Generate implementation tasks, acceptance criteria, test strategy, guardrails, then compose the full issue description using the unified template. Estimate story points. The output must meet the READY FOR DEVELOPMENT standard.

## RULES

- Every task has a clear file path and specific action — no placeholders, no "TBD"
- ABSOLUTELY NO TIME ESTIMATES anywhere
- Infrastructure tasks get `[INFRA]` or `[CI/CD]` prefix — they are mandatory, not optional
- Every task is concrete and actionable — no vague "handle edge cases"
- Guardrails must be specific to THIS story, not generic advice
- Each TAC should trace to at least one BAC
- Validation Metier items must be executable by a human in production, each tracing to BACs
- Load {trackerIssueTemplate} for section ordering and conditional rules
- **One Story**: This spec produces exactly ONE story — the scope is what was defined earlier. Do not expand it.

## SEQUENCE

### 1. Generate Implementation Tasks

Each task should be:

- A discrete, completable unit of work
- Ordered logically (dependencies first)
- Include the specific files to modify
- Explicit about what changes to make

Task format:

```markdown
- [ ] Task N: Clear action description
  - File: `path/to/file.ext`
  - Action: Specific change to make
```

MUST include `[CI/CD]` and `[INFRA]` prefixed tasks for any MISSING/PARTIAL layers from Step 6. Group by logical area (domain, API, infrastructure, tests).

### 2. Generate Acceptance Criteria

**Two types — keep them separate:**

#### Business Acceptance Criteria (BACs)

**Discovery mode:** Review the BACs captured in Step 2d. Refine if needed based on investigation findings.

**Enrichment mode:**

- If `HAS_BUSINESS_CONTEXT = true`: preserve existing BACs from the issue description
- If `HAS_BUSINESS_CONTEXT = false`: synthesize from PRD using `~/.claude/skills/bmad-shared/data/business-context-template.md`:
  - User journey E2E (primary actor, numbered steps)
  - Business Acceptance Criteria in Given/When/Then — observable outcomes
  - External dependencies and validation gates (table: Dependency, Owner, Gate, Status)

```markdown
### Business Acceptance Criteria

- [ ] BAC-N: Given [user context], when [user action], then [observable result]
```

#### Technical Acceptance Criteria (TACs)

Testable Given/When/Then format, from the implementation perspective:

```markdown
### Technical Acceptance Criteria

- [ ] TAC-N: Given [technical precondition], when [system action], then [expected result]
```

Cover: happy path, error handling, edge cases, integration points. Each TAC should trace to at least one BAC.

### 3. Generate Test Strategy

For each TAC, classify using the test pyramid and priority matrix:

| TAC | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | -------- | ---- | ----------- | ------- | ------------- |

Priority classification:

- P0: Revenue-critical, security, compliance, data integrity (>90% unit, >80% integration)
- P1: Core journeys, frequently used, complex logic (>80% unit, >60% integration)
- P2: Secondary features, admin, reporting
- P3: Rarely used, nice-to-have

### 4. Generate Guardrails

What NOT to do, common mistakes to avoid for THIS story.

**MUST include these mandatory guardrails:**

1. "Do not consider the story complete if schema changes exist without generated migrations"
2. "Data migrations with UPDATE/DELETE must be effective in ALL environments (dev, staging, production). WHERE clauses matching on names/slugs must be verified against real data — names often differ between environments. A migration that silently updates 0 rows is a zero-fallback violation."
3. "Do not consider the story complete if a service is not deployable end-to-end via CI/CD"
4. "Do not consider the story complete if schema changes have no documented data mapping (DTO <-> Domain <-> DB)"
5. "Every new config access must have a corresponding env var in the project's configuration module AND deployment template"

Plus story-specific guardrails from analysis (ADR violations, prior MR rejections, etc.).

### 5. Generate File List

Expected files to create and modify, grouped by service/area.

### 6. Performance Measurement Plan (if applicable)

If the feature has performance implications (latency-sensitive paths, batch processing, large data, startup time, binary size), include a measurement task:

```markdown
- [ ] Task N: Performance measurement
  - Add temporary timing instrumentation to {critical_paths}
  - Run with realistic data, capture measurements
  - Document results (include in MR description)
  - Remove instrumentation before final commit
```

This ensures performance claims in the MR description are backed by evidence. Skip if no performance implications.

### 7. Identify Dependencies and Risks

- External libraries or services needed
- High-risk items, known limitations
- New runtime dependencies that must be approved or evaluated

### 8. Compose Issue Description

Load {trackerIssueTemplate} for the description structure and conditional rules.

Compose the full Markdown description filling in all accumulated content. Omit sections marked as conditional when they don't apply.

**CRITICAL ordering:**

- **Definition of Done (product)** is the FIRST section — first thing visible when opening the ticket
  - Two dimensions: Feature DoD (BACs satisfied, user journey validated) + Non-regression DoD (impacted flows verified)
- **Technical Context** goes inside a `<details>` collapsible block
- **Validation Metier** stays in its natural position after implementation plan
  - Each VM declares its type and traces to BACs: `VM-N [type] *(BAC-X,Y)* : description`
  - Non-regression VMs trace to impacts: `VM-NR-N [type] *(Impact IN)* : description`
  - Adapt VM types to the project's stack (via the validation-tooling-lookup and tech-stack-lookup protocols (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`))

### 9. Estimate Story Points

Estimate complexity in Fibonacci (1, 2, 3, 5, 8, 13). Consider:

- **Scope**: number of tasks, services impacted, data model changes
- **Uncertainty**: how well-defined is the solution?
- **Risk**: infrastructure changes, external dependencies, migration complexity

This is autonomous — do NOT ask the user.

### 10. Verify READY FOR DEVELOPMENT

Verify the spec meets this standard:

- **One Story**: Exactly one story — not an epic, not multiple stories
- **Actionable**: Every task has a clear file path and specific action
- **Logical**: Tasks ordered by dependency
- **Testable**: All ACs follow Given/When/Then (both BACs and TACs)
- **Complete**: All investigation results inlined — no placeholders or "TBD"
- **Self-Contained**: A fresh agent can implement from the issue without reading workflow history
- **Business-Grounded**: Every TAC traces to at least one BAC
- **Validation Metier**: Production test checklist defined with VM types
- **Guardrails**: Mandatory guardrails + story-specific guardrails present

### 11. Checkpoint & Menu

**Discovery mode:** Present composed description summary, then A/P/C menu:

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to review (Step 8)"

- IF A: Read fully and follow {advancedElicitationTask}, process, ask "Accept?", update then redisplay
- IF P: Read fully and follow {partyModeWorkflow}, process, ask "Accept?", update then redisplay
- IF C: Load, read fully, and execute `./step-08-review.md`

ALWAYS halt and wait. ONLY proceed when user selects 'C'.

**Enrichment mode:** Present the composed description for validation, then proceed directly to `./step-09-output.md`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Tasks generated with file paths and specific actions
- BACs present (from Step 2d or PRD), TACs in Given/When/Then
- Each TAC traces to at least one BAC
- Test strategy with pyramid classification
- Mandatory guardrails + story-specific guardrails present
- Validation Metier with VM types and BAC tracing
- File list present
- READY FOR DEVELOPMENT checklist verified
- Description composed from template
- Story points estimated

### FAILURE:

- Tasks without file paths
- ACs without Given/When/Then
- TACs without parent BAC link
- Missing test strategy
- Missing mandatory guardrails
- Placeholders or "TBD" in output
