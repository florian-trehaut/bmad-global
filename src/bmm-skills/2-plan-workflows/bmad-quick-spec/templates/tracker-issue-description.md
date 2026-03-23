# Tracker Issue Description Template

Template for composing the tracker issue description in Step 7.

## Structure

```markdown
## Definition of Done (product)

{product_dod_from_step_2b}

---

## Problem

{problem_statement}

## Proposed Solution

{solution}

## Scope

**Included:** {in_scope}
**Excluded:** {out_of_scope}

## Business Context

### User Journey E2E

{user_journey_from_step_2b}

### Business Acceptance Criteria

{business_acceptance_criteria_from_step_2b}

### External Dependencies & Validation Gates

{external_dependencies_from_step_2b}

<details>
<summary>Technical Context</summary>

### Codebase Patterns

{codebase_patterns}

### Relevant Files

| File | Role |
| ---- | ---- |

{files_table}

### Technical Decisions

{technical_decisions}

</details>

## Data Model

{data_model_from_step_4}

## API Contracts

{api_contracts_from_step_4}

## Infrastructure

{infra_assessment_from_step_4}

## External Data Interface Contracts

{interface_contracts_from_step_4b}

## Data Mapping

{data_mapping_from_step_4b}

## Implementation Plan

### Tasks

{tasks_with_checkboxes}

### Technical Acceptance Criteria

{technical_acceptance_criteria_given_when_then}

## Validation Metier

Tests to execute in production after deployment. The story moves to the testing state and only transitions to **Done** once these tests pass.

{validation_metier_checklist_from_step_2b}

> Each VM item traces to one or more BACs. Format: `VM-N *(BAC-X,Y)* : description`

## Additional Context

### Dependencies

{dependencies}

### Test Strategy

| TAC | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | -------- | ---- | ----------- | ------- | ------------- |

{test_strategy_table}

#### Quality Criteria

- P0: >90% unit coverage, >80% integration coverage, all critical paths in journey tests
- P1: >80% unit coverage, >60% integration coverage
- No mocking frameworks -- in-memory fakes only
- Each source file has a corresponding test file

### Notes

{notes}
```

## Conditional Sections

- **Definition of Done (product)**: ALWAYS present, ALWAYS as the first section. It is the first thing visible when opening the ticket.
- **Validation Metier**: ALWAYS present (mandatory since step 2b). Each VM must trace to its BACs: `VM-N *(BAC-X,Y)* : description`. Stays after the implementation plan (logical position in the flow).
- **Business Context**: ALWAYS present (mandatory since step 2b)
- **Technical Context**: ALWAYS present but inside a `<details>` collapsible
- **Data Model**: omit if "No data changes identified"
- **API Contracts**: omit if no endpoint impacted
- **Infrastructure**: omit if "No changes required"
- **External Data Interface Contracts**: omit if no external interface
- **Data Mapping**: omit if no end-to-end data flow
