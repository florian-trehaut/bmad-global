# Tracker Issue Description Template

Template for composing the enriched tracker issue description in Step 4.

## Structure

```markdown
## Definition of Done (product)

**Feature:**
{feature_dod — BACs satisfied, user journey validated}

**Non-regression:**
{non_regression_dod — impacted flows verified, non-regression VMs pass}

---

## Problem

{problem_statement_from_PRD}

## Proposed Solution

{solution_from_architecture}

## Scope

**Included:** {in_scope}
**Excluded:** {out_of_scope}

## Business Context

### User Journey E2E

{user_journey — primary actor, numbered steps, from existing business context or synthesized from PRD}

### Business Acceptance Criteria

{BACs — Given/When/Then, observable outcomes}

### External Dependencies & Validation Gates

{external_dependencies_table — Dependency, Owner, Gate, Status}

<details>
<summary>Technical Context</summary>

### Codebase Patterns

{patterns_from_architecture}

### Relevant Files

| File | Role |
| ---- | ---- |

{files_table}

### Technical Decisions

{technical_decisions}

</details>

## Data Model

{data_model_from_analysis — schema delta, migration plan, indexes, DTO/Domain/DB mapping}

## API Contracts

{api_contracts_from_analysis}

## Infrastructure

{infra_assessment_from_analysis — deployment chain status, IaC changes}

## External Data Interface Contracts

{interface_contracts_from_analysis}

## Data Mapping

{data_mapping_from_analysis — DTO -> Domain -> DB with transformations}

## Implementation Plan

### Tasks

{tasks_with_checkboxes — grouped by area, [CI/CD] and [INFRA] prefixed}

### Technical Acceptance Criteria

{TACs — Given/When/Then, each tracing to a BAC}

## Guardrails

{story_specific_guardrails + mandatory guardrails}

## Validation Metier

Tests to execute in production after deployment. The story moves to the testing state and only transitions to **Done** once these tests pass.

{validation_metier_checklist}

> Each VM item traces to one or more BACs. Format: `VM-N *(BAC-X,Y)* : description`
> Non-regression VMs trace to impacts: `VM-NR-N *(Impact IN)* : description`

## Previous Story Learnings

{patterns_from_completed_stories — what worked, mistakes to avoid, regressions to watch}

## Test Strategy

| TAC | Priority | Unit | Integration | Journey | Key Scenarios |
| --- | -------- | ---- | ----------- | ------- | ------------- |

{test_strategy_table}

### Quality Criteria

- P0: >90% unit coverage, >80% integration coverage, all critical paths in journey tests
- P1: >80% unit coverage, >60% integration coverage

## File List

{expected_files — grouped by service/area}
```

## Conditional Sections

- **Definition of Done (product)**: ALWAYS present, ALWAYS as the first section
- **Validation Metier**: ALWAYS present (mandatory). Each VM must trace to its BACs
- **Business Context**: ALWAYS present
- **Technical Context**: ALWAYS present but inside a `<details>` collapsible
- **Previous Story Learnings**: present if completed stories exist in the epic
- **Data Model**: omit if "No data changes identified"
- **API Contracts**: omit if no endpoint impacted
- **Infrastructure**: omit if "No changes required"
- **External Data Interface Contracts**: omit if no external interface
- **Data Mapping**: omit if no end-to-end data flow
