# Step 02: Design Epics and Stories

## STEP GOAL

Analyze the PRD requirements, identify logical epic boundaries, decompose each epic into implementable stories with acceptance criteria, BDD scenarios, and test strategies. This is the core intellectual work of the workflow.

## RULES

- Every story must be independently implementable (no implicit dependencies without explicit declaration)
- Acceptance criteria use Gherkin format (Given/When/Then)
- Each story must include a test strategy section mapping ACs to test levels
- Stories must be small enough for one sprint (1-5 days of work)
- Epic boundaries follow functional domains, not technical layers
- BDD scenarios cover happy path AND error/edge cases

## SEQUENCE

### 1. Analyze PRD requirements

Parse `{PRD_CONTENT}` and extract:

- **Functional requirements**: features, user stories, use cases
- **Non-functional requirements**: performance, security, reliability
- **Constraints**: technical limitations, dependencies
- **User personas**: who the features serve

If `{ARCHITECTURE_CONTENT}` is available, cross-reference to identify:
- Technical components involved
- Data model implications
- API contracts
- Integration points

If `{UX_CONTENT}` is available, cross-reference to identify:
- User flows and screens
- Interaction patterns
- UI component needs

### 2. Design epic structure

Group requirements into logical epics based on:

- **Functional domain**: a coherent business capability (e.g., "User Registration", "Reward Catalog", "Order Processing")
- **Dependency order**: epics that others depend on come first
- **Value delivery**: each epic delivers standalone user value when possible

For each epic, define:
- **Name**: concise, business-oriented (not technical)
- **Description**: 2-3 sentences explaining the business value
- **Scope**: what is included and excluded
- **Dependencies**: which other epics must be completed first

### 3. Decompose epics into stories

For each epic, create stories following this structure:

```markdown
### Story: {STORY_TITLE}

**En tant que** {persona},
**je veux** {action},
**afin de** {benefit}.

#### Critères d'Acceptation

**AC1: {ac_title}**
```gherkin
Given {precondition}
When {action}
Then {expected_result}
```

**AC2: {ac_title}**
```gherkin
Given {precondition}
When {action}
Then {expected_result}
```

#### Scénarios BDD additionnels

- **Cas d'erreur**: {error scenario in Gherkin}
- **Cas limite**: {edge case in Gherkin}

#### Stratégie de Test

| AC | Priorité | Unit | Integration | Journey | Scénarios clés |
|----|----------|------|-------------|---------|----------------|
| AC1 | P{n} | {count} | {count} | {count} | {scenarios} |
| AC2 | P{n} | {count} | {count} | {count} | {scenarios} |

**Critères de qualité:**
- P0: couverture >90% unit, >80% integ, tous chemins critiques en journey
- P1: couverture >80% unit, >60% integ
- Pas de mock — InMemory fakes uniquement
- Chaque fichier source -> un .spec.ts correspondant

#### Dépendances
- {dependency_1 or "Aucune"}

#### Estimation
- {T-shirt size: XS/S/M/L/XL}
```

**Test priority classification:**
- **P0**: Revenue-critical, security, compliance, data integrity
- **P1**: Core journeys, frequently used, complex logic
- **P2**: Secondary features, admin, reporting
- **P3**: Rarely used, nice-to-have

**Test level decision matrix:**
- Pure logic, no dependencies -> Unit
- DB or internal service interaction -> Integration
- Multi-step backend workflow through API -> Journey

### 4. Validate completeness

Check that:
- Every PRD requirement maps to at least one story
- Every story has at least 2 acceptance criteria
- Every story has a test strategy
- No story is too large (more than 5 days of work)
- Dependencies form a valid DAG (no circular dependencies)
- Epic ordering respects dependency constraints

### 5. CHECKPOINT

Present the full epic and story structure to the user:

```
Structure proposée pour {SELECTED_PROJECT}:

Epic 1: {epic_name} ({N} stories)
  - Story 1.1: {title} [{estimation}]
  - Story 1.2: {title} [{estimation}]
  ...

Epic 2: {epic_name} ({N} stories)
  - Story 2.1: {title} [{estimation}]
  ...

Total: {N} epics, {M} stories

Souhaitez-vous:
1. Valider et créer dans Linear
2. Modifier une story
3. Ajouter/supprimer une story
4. Revoir un epic
```

WAIT for user confirmation or modification requests.

If the user requests modifications, apply them and re-present the updated structure. Repeat until the user validates.

---

**Next:** Read fully and follow `./step-03-create-linear.md`
