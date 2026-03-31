---
nextStepFile: './step-05b-impact.md'
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
---

# Step 5: Implementation Plan

## STEP GOAL:

Generate specific implementation tasks, testable acceptance criteria, and a mandatory test strategy. The output must meet the READY FOR DEVELOPMENT standard.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator producing actionable implementation plans
- Collaborative dialogue -- present plan, user validates feasibility
- You bring structured planning, user brings priority and effort knowledge

### Step-Specific Rules:

- Focus on actionable, testable, ordered tasks -- not vague descriptions
- FORBIDDEN: placeholders like "TBD" or "to be determined"
- Approach: every task has a file path, every AC has Given/When/Then
- **ADR HALT is MANDATORY**: If the feature introduces a new architectural decision (new service, integration pattern, data store, or deviation from existing ADRs) → you MUST HALT and present the ADR menu. Documenting it as a "note" or "recommendation" is NOT acceptable — the HALT forces a decision.

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Load test knowledge files from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` if available for test strategy
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu

## CONTEXT BOUNDARIES:

- Available: all accumulated context from Steps 1-4b
- Focus: converting investigation into actionable plan
- Dependencies: All modeling steps completed

---

## MANDATORY SEQUENCE

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
  - Notes: Any implementation details
```

### 2. Generate Acceptance Criteria

**Two types of ACs -- keep them separate:**

#### Business Acceptance Criteria (from Step 2b)

Review the BACs captured in Step 2b. Refine if needed based on technical investigation findings from Steps 3-4b. These are observable from the user/business perspective:

```markdown
### Business Acceptance Criteria

- [ ] BAC-N: Given [user context], when [user action], then [observable result]
```

#### Technical Acceptance Criteria (NEW)

Testable Given/When/Then format, from the implementation perspective:

```markdown
### Technical Acceptance Criteria

- [ ] TAC-N: Given [technical precondition], when [system action], then [expected result]
```

Cover: happy path, error handling, edge cases, integration points.

Each TAC should trace to at least one BAC. If a TAC exists without a parent BAC, question whether it delivers value.

### 3. Generate Test Strategy (MANDATORY)

If test knowledge files exist in the project (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` or TEA knowledge files referenced there), load them.

For each TAC (Technical AC), classify using the test pyramid and priority matrix:

```markdown
## Test Strategy

| TAC | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | -------- | ---- | ----------- | ------- | ------------- |

### Quality Criteria

- P0: >90% unit coverage, >80% integration coverage
- No mocking frameworks -- in-memory fakes only
- Each source file has a corresponding test file
```

Priority classification:

- P0: Revenue-critical, security, compliance, data integrity
- P1: Core journeys, frequently used, complex logic
- P2: Secondary features, admin, reporting
- P3: Rarely used, nice-to-have

Test level decision:

- Pure logic, no dependencies -> Unit
- DB or internal service interaction -> Integration
- Multi-step backend workflow through API -> Journey

### 4. Performance Measurement Plan (if applicable)

If the feature has performance implications (latency-sensitive paths, batch processing, large data, startup time, binary size), include a measurement task:

```markdown
- [ ] Task N: Performance measurement
  - Add temporary timing instrumentation to {critical_paths}
  - Run with realistic data, capture measurements
  - Document results (include in MR description)
  - Remove instrumentation before final commit
```

This ensures performance claims in the MR description are backed by evidence. Skip if no performance implications.

### 5. Identify Dependencies and Risks

- External libraries or services needed
- High-risk items, known limitations

### 6. ADR Conformity Check

**This section is MANDATORY — not optional.** Check `adr_location` from workflow-context.md.

**Step A — Cross-reference existing ADRs:**

If ADRs were loaded in Step 3, verify the implementation plan doesn't violate any active ADR. Flag violations to the user.

**Step B — Detect new architectural decisions:**

Scan the implementation plan for any of these signals:

- New service, worker, or scheduled job
- New integration pattern (new queue, new event bus, new external API)
- New data store or significant schema pattern change
- Deviation from an existing ADR's decided approach
- Technology choice not covered by existing ADRs

**If ANY signal is detected → HALT.** Present the menu:

> This feature introduces **{description of the architectural decision}**.
> This should be recorded as an Architecture Decision Record.
>
> **[A]** Create ADR now (invoke `bmad-create-adr`)
> **[S]** Skip — will create ADR later
> **[N]** Not needed — this doesn't warrant an ADR

WAIT for user selection.

- **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume this step.
- **IF S or N:** Log the user's choice and proceed.

**NEVER** silently document an ADR need as a "note" or "recommendation". The HALT forces an explicit decision.

### 7. Verify READY FOR DEVELOPMENT

Verify the spec meets this standard:

- **One Story**: This spec produces exactly ONE story — not an epic, not multiple stories. The scope is what the user defined in Step 2. Do not modify it.
- **Actionable**: Every task has a clear file path and specific action
- **Logical**: Tasks ordered by dependency (lowest level first)
- **Testable**: All ACs follow Given/When/Then (both BACs and TACs)
- **Complete**: All investigation results inlined -- no placeholders or "TBD"
- **Self-Contained**: A fresh agent can implement without reading workflow history
- **Business-Grounded**: Every TAC traces to at least one BAC
- **Validation Metier**: Production test checklist defined (from Step 2b)
### 7. Update WIP File

Append tasks, ACs, test strategy sections to WIP file. Update `stepsCompleted` to add this step.

### 8. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to impact analysis (Step 5b)"

#### Menu Handling Logic:

- IF A: Read fully and follow {advancedElicitationTask} with current plan, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current plan, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#7-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Tasks generated with file paths and specific actions
- Business ACs (BACs) refined from Step 2b, observable by humans
- Technical ACs (TACs) in Given/When/Then covering happy path + errors + edges
- Each TAC traces to at least one BAC
- Test strategy with pyramid classification (loaded from knowledge files if available)
- Validation Metier checklist present (from Step 2b)
- READY FOR DEVELOPMENT checklist verified
- WIP file updated
- Menu presented with A/P/C (user can refine the plan)

### FAILURE:

- Tasks without file paths
- ACs without Given/When/Then
- TACs without parent BAC link
- Missing test strategy
- Missing Validation Metier checklist
- Placeholders or "TBD" in output
