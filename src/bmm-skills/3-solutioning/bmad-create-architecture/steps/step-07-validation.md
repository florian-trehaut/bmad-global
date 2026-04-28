---
nextStepFile: './step-08-complete.md'
---

# Step 7: Architecture Validation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Architecture Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate the complete architecture for coherence, completeness, and readiness to guide AI agents through consistent implementation.

## RULES

- Read the complete step file before taking any action
- Validate all requirements are covered by architectural decisions
- Run comprehensive validation checks on the complete architecture
- You are a facilitator -- collaborative validation
- NEVER generate content without user input
- Present A/P/C menu after generating validation results
- Communicate in `{COMMUNICATION_LANGUAGE}`

## COLLABORATION MENU (A/P/C)

After generating content, present:

- **A (Advanced Elicitation)**: invoke `bmad-advanced-elicitation` to address complex architectural issues found during validation
- **P (Party Mode)**: invoke `bmad-party-mode` to resolve validation concerns from multiple perspectives
- **C (Continue)**: save content to document and proceed

Protocols always return to this step's A/P/C menu after completion. User accepts/rejects protocol changes before proceeding.

## SEQUENCE

### 1. Coherence Validation

Check that all architectural decisions work together:

**Decision Compatibility:**
- Do all technology choices work together without conflicts?
- Are all versions compatible with each other?
- Do patterns align with technology choices?
- Are there any contradictory decisions?

**Pattern Consistency:**
- Do implementation patterns support the architectural decisions?
- Are naming conventions consistent across all areas?
- Do structure patterns align with technology stack?
- Are communication patterns coherent?

**Structure Alignment:**
- Does the project structure support all architectural decisions?
- Are boundaries properly defined and respected?
- Does the structure enable the chosen patterns?
- Are integration points properly structured?

### 2. Requirements Coverage Validation

Verify all project requirements are architecturally supported:

**From Epics (if available):**
- Does every epic have architectural support?
- Are all user stories implementable with these decisions?
- Are cross-epic dependencies handled architecturally?
- Are there any gaps in epic coverage?

**From FR Categories (if no epics):**
- Does every functional requirement have architectural support?
- Are all FR categories fully covered by architectural decisions?
- Are cross-cutting FRs properly addressed?
- Are there any missing architectural capabilities?

**Non-Functional Requirements:**
- Are performance requirements addressed architecturally?
- Are security requirements fully covered?
- Are scalability considerations properly handled?
- Are compliance requirements architecturally supported?

### 3. Implementation Readiness Validation

Assess if AI agents can implement consistently:

**Decision Completeness:**
- Are all critical decisions documented with versions?
- Are implementation patterns comprehensive enough?
- Are consistency rules clear and enforceable?
- Are examples provided for all major patterns?

**Structure Completeness:**
- Is the project structure complete and specific?
- Are all files and directories defined?
- Are integration points clearly specified?
- Are component boundaries well-defined?

**Pattern Completeness:**
- Are all potential conflict points addressed?
- Are naming conventions comprehensive?
- Are communication patterns fully specified?
- Are process patterns (error handling, etc.) complete?

### 4. Gap Analysis

Identify and document any missing elements:

**Critical Gaps:** Missing architectural decisions that block implementation, incomplete patterns that could cause conflicts, missing structural elements, undefined integration points.

**Important Gaps:** Areas needing more detailed specification, patterns that could be more comprehensive, documentation that would help implementation.

**Nice-to-Have Gaps:** Additional patterns that would be helpful, supplementary documentation, tooling recommendations, development workflow optimizations.

### 5. Address Validation Issues

For any issues found, facilitate resolution:

**Critical Issues:** Present the issue and ask how to resolve. These could cause implementation problems.

**Important Issues:** Present areas that could be improved. Not blocking, but addressing them would make implementation smoother.

**Minor Issues:** Present optional refinements for user consideration.

### 6. Generate Validation Content

Prepare content to append to the document:

```markdown
## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
{assessment_of_how_all_decisions_work_together}

**Pattern Consistency:**
{verification_that_patterns_support_decisions}

**Structure Alignment:**
{confirmation_that_structure_supports_architecture}

### Requirements Coverage Validation

**Epic/Feature Coverage:**
{verification_that_all_epics_or_features_are_supported}

**Functional Requirements Coverage:**
{confirmation_that_all_FRs_are_architecturally_supported}

**Non-Functional Requirements Coverage:**
{verification_that_NFRs_are_addressed}

### Implementation Readiness Validation

**Decision Completeness:**
{assessment_of_decision_documentation_completeness}

**Structure Completeness:**
{evaluation_of_project_structure_completeness}

**Pattern Completeness:**
{verification_of_implementation_patterns_completeness}

### Gap Analysis Results

{gap_analysis_findings_with_priority_levels}

### Validation Issues Addressed

{description_of_any_issues_found_and_resolutions}

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** {high/medium/low} based on validation results

**Key Strengths:**
{list_of_architecture_strengths}

**Areas for Future Enhancement:**
{areas_that_could_be_improved_later}

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
{starter_template_command_or_first_architectural_step}
```

### 7. Present Content and Menu

"I have completed a comprehensive validation of your architecture.

**Validation Summary:**
- Coherence: All decisions work together
- Coverage: All requirements are supported
- Readiness: AI agents can implement consistently

**Here is what I will add to complete the architecture document:**

[Show the complete markdown content from step 6]

**What would you like to do?**
[A] Advanced Elicitation - address any complex architectural concerns
[P] Party Mode - review validation from different implementation perspectives
[C] Continue - complete the architecture and finish workflow"

### 8. Handle Menu Selection

**If 'A':** Invoke `bmad-advanced-elicitation` with validation issues. Process enhanced solutions. Ask user to accept/reject, then return to A/P/C menu.

**If 'P':** Invoke `bmad-party-mode` with validation context. Process collaborative insights. Ask user to accept/reject, then return to A/P/C menu.

**If 'C':**
- Append final content to `{planning_artifacts}/architecture.md`
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`
- Load and execute `{nextStepFile}`

## NEXT STEP

After user selects 'C' and content is saved, load and execute `{nextStepFile}`.

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Architecture Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
