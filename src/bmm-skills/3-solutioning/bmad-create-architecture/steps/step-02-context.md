---
nextStepFile: './step-03-starter.md'
---

# Step 2: Project Context Analysis


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Project Context Analysis with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Analyze the loaded project documents to understand architectural scope, requirements, and constraints before beginning decision making.

## RULES

- Read the complete step file before taking any action
- Analyze loaded documents -- do not assume or generate requirements
- No technology decisions yet -- this is a pure analysis phase
- NEVER generate content without user input
- Present A/P/C menu after generating project context analysis
- Communicate in `{COMMUNICATION_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

After generating content, present:

- **A (Advanced Elicitation)**: invoke `bmad-advanced-elicitation` to develop deeper architectural insights
- **P (Party Mode)**: invoke `bmad-party-mode` to analyze requirements from different architectural angles
- **C (Continue)**: save content to document and proceed

Protocols always return to this step's A/P/C menu after completion. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Review Project Requirements

**From PRD Analysis:**
- Extract and analyze Functional Requirements (FRs)
- Identify Non-Functional Requirements (NFRs): performance, security, compliance
- Note technical constraints or dependencies mentioned
- Count and categorize requirements to understand project scale

**From Epics/Stories (if available):**
- Map epic structure and user stories to architectural components
- Extract acceptance criteria for technical implications
- Identify cross-cutting concerns spanning multiple epics

**From UX Design (if available):**
- Component complexity (simple forms vs rich interactions)
- Animation/transition requirements
- Real-time update needs (live data, collaborative features)
- Platform-specific UI requirements
- Accessibility standards (WCAG compliance level)
- Responsive design breakpoints
- Offline capability requirements
- Performance expectations (load times, interaction responsiveness)

### 2. Project Scale Assessment

Calculate and present project complexity:

**Complexity Indicators:**
- Real-time features requirements
- Multi-tenancy needs
- Regulatory compliance requirements
- Integration complexity
- User interaction complexity
- Data complexity and volume

### 3. Reflect Understanding

Present analysis back to user for validation:

"I am reviewing your project documentation for {project_name}.

{if epics loaded} I see {epic_count} epics with {story_count} total stories.
{if no epics} I found {fr_count} functional requirements organized into {fr_category_list}.
{if ux loaded} I also found your UX specification which defines the user experience requirements.

**Key architectural aspects I notice:**
- [Summarize core functionality from FRs]
- [Note critical NFRs that will shape architecture]
- [Note UX complexity and technical requirements if applicable]
- [Identify unique technical challenges or constraints]
- [Highlight any regulatory or compliance requirements]

**Scale indicators:**
- Project complexity appears to be: [low/medium/high/enterprise]
- Primary technical domain: [web/mobile/api/backend/full-stack/etc]
- Cross-cutting concerns identified: [list major ones]

This analysis will help guide the architectural decisions needed to ensure AI agents implement this consistently.

Does this match your understanding of the project scope and requirements?"

### 4. Generate Project Context Content

Prepare content to append to the document:

```markdown
## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
{analysis of FRs and what they mean architecturally}

**Non-Functional Requirements:**
{NFRs that will drive architectural decisions}

**Scale and Complexity:**
{project_scale_assessment}

- Primary domain: {technical_domain}
- Complexity level: {complexity_level}
- Estimated architectural components: {component_count}

### Technical Constraints and Dependencies

{known_constraints_dependencies}

### Cross-Cutting Concerns Identified

{concerns_that_will_affect_multiple_components}
```

### 5. Present Content and Menu

Show the generated content and present choices:

"I have drafted the Project Context Analysis based on your requirements. This sets the foundation for our architectural decisions.

**Here is what I will add to the document:**

[Show the complete markdown content from step 4]

**What would you like to do?**
[A] Advanced Elicitation - dive deeper into architectural implications
[P] Party Mode - bring different perspectives to analyze requirements
[C] Continue - save this analysis and begin architectural decisions"

### 6. Handle Menu Selection

**If 'A':** Invoke `bmad-advanced-elicitation` with the current context analysis. Process enhanced architectural insights. Ask user to accept/reject enhancements, then return to A/P/C menu.

**If 'P':** Invoke `bmad-party-mode` with the current project context. Process collaborative improvements. Ask user to accept/reject changes, then return to A/P/C menu.

**If 'C':**
- Append final content to `{planning_artifacts}/architecture.md`
- Update frontmatter: `stepsCompleted: [1, 2]`
- Load and execute `{nextStepFile}`

## NEXT STEP

After user selects 'C' and content is saved, load and execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Project Context Analysis
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
