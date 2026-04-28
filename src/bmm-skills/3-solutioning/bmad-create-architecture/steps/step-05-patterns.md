---
nextStepFile: './step-06-structure.md'
---

# Step 5: Implementation Patterns and Consistency Rules


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Implementation Patterns and Consistency Rules with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Define implementation patterns and consistency rules that ensure multiple AI agents write compatible, consistent code that works together seamlessly.

## RULES

- Read the complete step file before taking any action
- Focus on consistency patterns, not implementation details
- Emphasize what agents could decide DIFFERENTLY if not specified
- You are a facilitator -- collaborative pattern definition
- NEVER generate content without user input
- Present A/P/C menu after generating patterns content
- Communicate in `{COMMUNICATION_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

After generating content, present:

- **A (Advanced Elicitation)**: invoke `bmad-advanced-elicitation` to develop comprehensive consistency patterns
- **P (Party Mode)**: invoke `bmad-party-mode` to identify potential conflict points from multiple perspectives
- **C (Continue)**: save content to document and proceed

Protocols always return to this step's A/P/C menu after completion. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Identify Potential Conflict Points

Based on the chosen technology stack and decisions, identify where AI agents could make different choices:

**Naming Conflicts:**
- Database table/column naming conventions
- API endpoint naming patterns
- File and directory naming
- Component/function/variable naming
- Route parameter formats

**Structural Conflicts:**
- Where tests are located
- How components are organized
- Where utilities and helpers go
- Configuration file organization
- Static asset organization

**Format Conflicts:**
- API response wrapper formats
- Error response structures
- Date/time formats in APIs and UI
- JSON field naming conventions
- API status code usage

**Communication Conflicts:**
- Event naming conventions
- Event payload structures
- State update patterns
- Action naming conventions
- Logging formats and levels

**Process Conflicts:**
- Loading state handling
- Error recovery patterns
- Retry implementation approaches
- Authentication flow patterns
- Validation timing and methods

### 2. Facilitate Pattern Decisions

For each conflict category, facilitate collaborative pattern definition:

**Present the Conflict Point:**
"Given that we are using {tech_stack}, different AI agents might handle {conflict_area} differently. For example, one agent might name database tables 'users' while another uses 'Users' -- this would cause conflicts. We need to establish consistent patterns that all agents follow."

**Show Options and Trade-offs:**
"Common approaches for {pattern_category}:
1. {option_1} -- {pros_and_cons}
2. {option_2} -- {pros_and_cons}
3. {option_3} -- {pros_and_cons}

Which approach makes the most sense for our project?"

**Get User Decision:**
"What is your preference for this pattern? (or discuss the trade-offs more)"

### 3. Define Pattern Categories

#### Naming Patterns

**Database Naming:**
- Table naming: users, Users, or user?
- Column naming: user_id or userId?
- Foreign key format: user_id or fk_user?
- Index naming: idx_users_email or users_email_index?

**API Naming:**
- REST endpoint naming: /users or /user? Plural or singular?
- Route parameter format: :id or {id}?
- Query parameter naming: user_id or userId?
- Header naming conventions

**Code Naming:**
- Component naming: UserCard or user-card?
- File naming: UserCard.tsx or user-card.tsx?
- Function naming: getUserData or get_user_data?
- Variable naming: userId or user_id?

#### Structure Patterns

**Project Organization:**
- Where do tests live? __tests__/ or *.test.ts co-located?
- How are components organized? By feature or by type?
- Where do shared utilities go?
- How are services and repositories organized?

**File Structure:**
- Config file locations and naming
- Static asset organization
- Documentation placement
- Environment file organization

#### Format Patterns

**API Formats:**
- API response wrapper? {data: ..., error: ...} or direct response?
- Error format? {message, code} or {error: {type, detail}}?
- Date format in JSON? ISO strings or timestamps?
- Success response structure?

**Data Formats:**
- JSON field naming: snake_case or camelCase?
- Boolean representations
- Null handling patterns
- Array vs object for single items

#### Communication Patterns

**Event Systems:**
- Event naming convention: user.created or UserCreated?
- Event payload structure standards
- Event versioning approach
- Async event handling patterns

**State Management:**
- State update patterns: immutable updates or direct mutation?
- Action naming conventions
- Selector patterns
- State organization principles

#### Process Patterns

**Error Handling:**
- Global error handling approach
- Error boundary patterns
- User-facing error message format
- Logging vs user error distinction

**Loading States:**
- Loading state naming conventions
- Global vs local loading states
- Loading state persistence
- Loading UI patterns

### 4. Generate Patterns Content

Prepare content to append to the document:

```markdown
## Implementation Patterns and Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
{number_of_potential_conflicts} areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**
{database_naming_rules_with_examples}

**API Naming Conventions:**
{api_naming_rules_with_examples}

**Code Naming Conventions:**
{code_naming_rules_with_examples}

### Structure Patterns

**Project Organization:**
{project_structure_rules_with_examples}

**File Structure Patterns:**
{file_organization_rules_with_examples}

### Format Patterns

**API Response Formats:**
{api_response_structure_rules}

**Data Exchange Formats:**
{data_format_rules_with_examples}

### Communication Patterns

**Event System Patterns:**
{event_naming_and_structure_rules}

**State Management Patterns:**
{state_update_and_organization_rules}

### Process Patterns

**Error Handling Patterns:**
{consistent_error_handling_approaches}

**Loading State Patterns:**
{loading_state_management_rules}

### Enforcement Guidelines

**All AI Agents MUST:**
- {mandatory_pattern_1}
- {mandatory_pattern_2}
- {mandatory_pattern_3}

**Pattern Enforcement:**
- How to verify patterns are followed
- Where to document pattern violations
- Process for updating patterns

### Pattern Examples

**Good Examples:**
{concrete_examples_of_correct_pattern_usage}

**Anti-Patterns:**
{examples_of_what_to_avoid}
```

### 5. Present Content and Menu

"I have documented implementation patterns that will prevent conflicts between AI agents working on this project.

**Here is what I will add to the document:**

[Show the complete markdown content from step 4]

**What would you like to do?**
[A] Advanced Elicitation - explore additional consistency patterns
[P] Party Mode - review patterns from different implementation perspectives
[C] Continue - save these patterns and move to project structure"

### 6. Handle Menu Selection

**If 'A':** Invoke `bmad-advanced-elicitation` with current patterns. Process enhanced consistency rules. Ask user to accept/reject, then return to A/P/C menu.

**If 'P':** Invoke `bmad-party-mode` with implementation patterns context. Process collaborative insights about potential conflicts. Ask user to accept/reject, then return to A/P/C menu.

**If 'C':**
- Append final content to `{planning_artifacts}/architecture.md`
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5]`
- Load and execute `{nextStepFile}`

## NEXT STEP

After user selects 'C' and content is saved, load and execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Implementation Patterns and Consistency Rules
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
