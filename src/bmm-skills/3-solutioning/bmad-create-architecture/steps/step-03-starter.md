---
nextStepFile: './step-04-decisions.md'
---

# Step 3: Starter Template Evaluation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Starter Template Evaluation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Discover technical preferences and evaluate starter template options, leveraging existing technical preferences and establishing solid architectural foundations.

## RULES

- Read the complete step file before taking any action
- ALWAYS search the web to verify current versions -- NEVER trust hardcoded versions
- You are a facilitator -- collaborative discovery between architectural peers
- NEVER generate content without user input
- Present A/P/C menu after generating starter template analysis
- Communicate in `{COMMUNICATION_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

After generating content, present:

- **A (Advanced Elicitation)**: invoke `bmad-advanced-elicitation` to explore unconventional starter options or custom approaches
- **P (Party Mode)**: invoke `bmad-party-mode` to evaluate starter trade-offs from different use cases
- **C (Continue)**: save content to document and proceed

Protocols always return to this step's A/P/C menu after completion. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 0. Check Technical Preferences and Context

**Check Project Context for Existing Technical Preferences:**

If project context exists, extract and present:
- Languages/Frameworks from context
- Tools and Libraries from context
- Development Patterns from context
- Platform Preferences from context

If no existing preferences found, establish them now.

**Discover User Technical Preferences:**

Discuss with user:
- **Languages**: TypeScript/JavaScript, Python, Go, Rust, etc.
- **Frameworks**: React, Vue, Angular, Next.js, etc.
- **Databases**: PostgreSQL, MongoDB, MySQL, etc.
- **Team experience level** with different technologies
- **Platform/Deployment preferences**: AWS, Vercel, Railway, Docker, Serverless, etc.
- **Integrations**: existing systems, APIs, third-party services

### 1. Identify Primary Technology Domain

Based on project context analysis and technical preferences:
- **Web application**: Next.js, Vite, Remix, SvelteKit starters
- **Mobile app**: React Native, Expo, Flutter starters
- **API/Backend**: NestJS, Express, Fastify, Supabase starters
- **CLI tool**: CLI framework starters (oclif, commander, etc.)
- **Full-stack**: T3, RedwoodJS, Blitz, Next.js starters
- **Desktop**: Electron, Tauri starters

### 2. UX Requirements Consideration

If UX specification was loaded, consider UX requirements when selecting starter:
- Rich animations: Framer Motion compatible
- Complex forms: React Hook Form included
- Real-time features: Socket.io or WebSocket ready
- Design system: Storybook-enabled
- Offline capability: Service worker or PWA configured

### 3. Research Current Starter Options

Search the web for current, maintained starter templates matching the identified domain and preferences.

### 4. Investigate Top Starter Options

For each promising starter found, investigate: default setup, technologies included, project structure, production deployment capabilities, maintenance status, recent updates.

### 5. Analyze What Each Starter Provides

For each viable starter option, document:

**Technology Decisions Made:**
- Language/TypeScript configuration
- Styling solution
- Testing framework setup
- Linting/Formatting configuration
- Build tooling and optimization
- Project structure and organization

**Architectural Patterns Established:**
- Code organization patterns
- Component structure conventions
- API layering approach
- State management setup
- Routing patterns
- Environment configuration

### 6. Present Starter Options

Based on user skill level and project needs, present options with appropriate detail:

**Expert users:** Quick decision list of key decisions.
**Intermediate users:** Decision list with explanations.
**Beginner users:** Friendly explanations with analogies.

### 7. Get Current CLI Commands

If user shows interest in a starter, search the web for the exact current CLI commands and options.

### 8. Generate Starter Template Content

Prepare content to append to the document:

````markdown
## Starter Template Evaluation

### Primary Technology Domain

{identified_domain} based on project requirements analysis

### Starter Options Considered

{analysis_of_evaluated_starters}

### Selected Starter: {starter_name}

**Rationale for Selection:**
{why_this_starter_was_chosen}

**Initialization Command:**

```bash
{full_starter_command_with_options}
```

**Architectural Decisions Provided by Starter:**

**Language and Runtime:**
{language_typescript_setup}

**Styling Solution:**
{styling_solution_configuration}

**Build Tooling:**
{build_tools_and_optimization}

**Testing Framework:**
{testing_setup_and_configuration}

**Code Organization:**
{project_structure_and_patterns}

**Development Experience:**
{development_tools_and_workflow}

**Note:** Project initialization using this command should be the first implementation story.
````

### 9. Present Content and Menu

"I have analyzed starter template options for {project_type} projects.

**Here is what I will add to the document:**

[Show the complete markdown content from step 8]

**What would you like to do?**
[A] Advanced Elicitation - explore custom approaches or unconventional starters
[P] Party Mode - evaluate trade-offs from different perspectives
[C] Continue - save this decision and move to architectural decisions"

### 10. Handle Menu Selection

**If 'A':** Invoke `bmad-advanced-elicitation` with current starter analysis. Process enhanced insights. Ask user to accept/reject, then return to A/P/C menu.

**If 'P':** Invoke `bmad-party-mode` with starter evaluation context. Process collaborative insights. Ask user to accept/reject, then return to A/P/C menu.

**If 'C':**
- Append final content to `{planning_artifacts}/architecture.md`
- Update frontmatter: `stepsCompleted: [1, 2, 3]`
- Load and execute `{nextStepFile}`

## NEXT STEP

After user selects 'C' and content is saved, load and execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Starter Template Evaluation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
