---
nextStepFile: './step-05-patterns.md'
---

# Step 4: Core Architectural Decisions


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Core Architectural Decisions with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Facilitate collaborative architectural decision making, leveraging existing technical preferences and starter template decisions, focusing on remaining choices critical to the project's success.

## RULES

- Read the complete step file before taking any action
- ALWAYS search the web to verify current technology versions
- You are a facilitator -- collaborative decision making, not recommendations
- Focus on decisions not already made by starter template or existing preferences
- NEVER generate content without user input
- Present A/P/C menu after each major decision category
- Communicate in `{COMMUNICATION_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

After generating content, present:

- **A (Advanced Elicitation)**: invoke `bmad-advanced-elicitation` to explore innovative approaches to specific decisions
- **P (Party Mode)**: invoke `bmad-party-mode` to evaluate decision trade-offs from multiple perspectives
- **C (Continue)**: save content to document and proceed

Protocols always return to this step's A/P/C menu after completion. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Load Decision Framework and Check Existing Preferences

Review and present:
- User technical preferences from Step 3
- Starter template decisions already made
- Project context technical rules

Identify remaining critical decisions. Categorize as:
- **Critical Decisions:** must be decided before implementation can proceed
- **Important Decisions:** shape the architecture significantly
- **Nice-to-Have:** can be deferred if needed

### 2. Decision Categories by Priority

#### Category 1: Data Architecture
- Database choice (if not determined by starter)
- Data modeling approach
- Data validation strategy
- Migration approach
- Caching strategy

#### Category 2: Authentication and Security
- Authentication method
- Authorization patterns
- Security middleware
- Data encryption approach
- API security strategy

#### Category 3: API and Communication
- API design patterns (REST, GraphQL, etc.)
- API documentation approach
- Error handling standards
- Rate limiting strategy
- Communication between services

#### Category 4: Frontend Architecture (if applicable)
- State management approach
- Component architecture
- Routing strategy
- Performance optimization
- Bundle optimization

#### Category 5: Infrastructure and Deployment
- Hosting strategy
- CI/CD pipeline approach
- Environment configuration
- Monitoring and logging
- Scaling strategy

### 3. Facilitate Each Decision Category

For each category, facilitate collaborative decision making.

**Present the Decision** adapted to user skill level:

**Expert:** Concise option list with tradeoffs, ask for preference.
**Intermediate:** Options with brief explanations, lean toward a recommendation with reasoning.
**Beginner:** Educational context, real-world analogy, friendly options with pros/cons, clear suggestion.

**Verify Technology Versions:** Search the web for latest stable/LTS versions when decisions involve specific technology.

**Get User Input:** "What is your preference? (or 'explain more' for details)"

**Handle User Response:**
- If user wants more info: provide deeper explanation
- If user has preference: discuss implications and record decision
- If user wants alternatives: explore other options

**Record the Decision:**
- Category, Decision, Version (if applicable), Rationale, Affected components, Provided by Starter (yes/no)

### 4. ADR Trigger Check

After each critical or important decision, check if the project uses ADRs (check `adr_location` from workflow-context.md if available).

If `adr_location` is set and not 'none', for each critical decision -- HALT and present:

> This decision ({decision_name}) is a significant architectural choice that should be recorded as an Architecture Decision Record.
>
> **[A]** Create ADR now (invoke `bmad-create-adr`)
> **[S]** Skip -- will create ADR later
> **[N]** Not needed -- already covered by architecture doc

WAIT for user selection.

- **IF A:** Invoke `skill:bmad-create-adr` with the decision context, then resume.
- **IF S or N:** Log the user's choice and proceed to the next decision.

NEVER silently document an ADR need as a "note" or "recommendation". The HALT forces an explicit decision.

### 5. Check for Cascading Implications

After each major decision, identify related decisions:

"This choice means we will also need to decide:
- {related_decision_1}
- {related_decision_2}"

### 6. Generate Decisions Content

After facilitating all decision categories, prepare content to append:

```markdown
## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
{critical_decisions_made}

**Important Decisions (Shape Architecture):**
{important_decisions_made}

**Deferred Decisions (Post-MVP):**
{decisions_deferred_with_rationale}

### Data Architecture

{data_related_decisions_with_versions_and_rationale}

### Authentication and Security

{security_related_decisions_with_versions_and_rationale}

### API and Communication Patterns

{api_related_decisions_with_versions_and_rationale}

### Frontend Architecture

{frontend_related_decisions_with_versions_and_rationale}

### Infrastructure and Deployment

{infrastructure_related_decisions_with_versions_and_rationale}

### Decision Impact Analysis

**Implementation Sequence:**
{ordered_list_of_decisions_for_implementation}

**Cross-Component Dependencies:**
{how_decisions_affect_each_other}
```

### 7. Present Content and Menu

"I have documented all the core architectural decisions we made together.

**Here is what I will add to the document:**

[Show the complete markdown content from step 6]

**What would you like to do?**
[A] Advanced Elicitation - explore innovative approaches to any specific decisions
[P] Party Mode - review decisions from multiple perspectives
[C] Continue - save these decisions and move to implementation patterns"

### 8. Handle Menu Selection

**If 'A':** Invoke `bmad-advanced-elicitation` with specific decision categories. Process enhanced insights. Ask user to accept/reject, then return to A/P/C menu.

**If 'P':** Invoke `bmad-party-mode` with architectural decisions context. Process collaborative insights. Ask user to accept/reject, then return to A/P/C menu.

**If 'C':**
- Append final content to `{planning_artifacts}/architecture.md`
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4]`
- Load and execute `{nextStepFile}`

## NEXT STEP

After user selects 'C' and content is saved, load and execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Core Architectural Decisions
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
