---
nextStepFile: './step-05-measurability-validation.md'
---

# Step 4: Product Brief Coverage Validation


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
CHK-STEP-04-ENTRY PASSED — entering Step 4: Product Brief Coverage Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate that PRD covers all content from Product Brief (if brief was used as input), mapping brief content to PRD sections and identifying gaps.

## RULES

- Conditional step: skip if no Product Brief exists in input documents
- Focus ONLY on Product Brief coverage mapping
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Check for Product Brief

Check if Product Brief was loaded in step 1's inputDocuments.

**IF no Product Brief found:**
Append to validation report:
```markdown
## Product Brief Coverage

**Status:** N/A - No Product Brief was provided as input
```

Display: "**Product Brief Coverage: Skipped** (No Product Brief provided)

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

**IF Product Brief exists:** Continue to step 2 below.

### 2. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform Product Brief coverage validation:

1. Load the Product Brief
2. Extract key content: vision statement, target users/personas, problem statement, key features, goals/objectives, differentiators, constraints
3. For each item, search PRD for corresponding coverage
4. Classify coverage: Fully Covered / Partially Covered / Not Found / Intentionally Excluded
5. Note any gaps with severity: Critical / Moderate / Informational

Return structured coverage map with classifications."

### 3. Direct Analysis (if Task tool unavailable)

If Task tool unavailable, perform analysis directly:

**Extract from Product Brief:**
- Vision: What is this product?
- Users: Who is it for?
- Problem: What problem does it solve?
- Features: What are the key capabilities?
- Goals: What are the success criteria?
- Differentiators: What makes it unique?

**For each item, search PRD:**
- Scan Executive Summary for vision
- Check User Journeys or user personas
- Look for problem statement
- Review Functional Requirements for features
- Check Success Criteria section
- Search for differentiators

**Classify coverage:**
- **Fully Covered:** Content present and complete
- **Partially Covered:** Content present but incomplete
- **Not Found:** Content missing from PRD
- **Intentionally Excluded:** Content explicitly out of scope

### 4. Assess Coverage and Severity

For each gap (Partially Covered or Not Found):
- Is this Critical? (Core vision, primary users, main features)
- Is this Moderate? (Secondary features, some goals)
- Is this Informational? (Nice-to-have features, minor details)

Note: Some exclusions may be intentional (valid scoping decisions).

### 5. Report Coverage Findings to Validation Report

Append to validation report:

```markdown
## Product Brief Coverage

**Product Brief:** {brief_file_name}

### Coverage Map

**Vision Statement:** [Fully/Partially/Not Found/Intentionally Excluded]
[If gap: Note severity and specific missing content]

**Target Users:** [Fully/Partially/Not Found/Intentionally Excluded]
[If gap: Note severity and specific missing content]

**Problem Statement:** [Fully/Partially/Not Found/Intentionally Excluded]
[If gap: Note severity and specific missing content]

**Key Features:** [Fully/Partially/Not Found/Intentionally Excluded]
[If gap: List specific features with severity]

**Goals/Objectives:** [Fully/Partially/Not Found/Intentionally Excluded]
[If gap: Note severity and specific missing content]

**Differentiators:** [Fully/Partially/Not Found/Intentionally Excluded]
[If gap: Note severity and specific missing content]

### Coverage Summary

**Overall Coverage:** [percentage or qualitative assessment]
**Critical Gaps:** [count] [list if any]
**Moderate Gaps:** [count] [list if any]
**Informational Gaps:** [count] [list if any]

**Recommendation:**
[If critical gaps exist] "PRD should be revised to cover critical Product Brief content."
[If moderate gaps] "Consider addressing moderate gaps for complete coverage."
[If minimal gaps] "PRD provides good coverage of Product Brief content."
```

### 6. Display Progress and Auto-Proceed

Display: "**Product Brief Coverage Validation Complete**

Overall Coverage: {assessment}

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Product Brief Coverage Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
